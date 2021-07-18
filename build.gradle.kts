import java.io.ByteArrayOutputStream

fun command(vararg args: Any, workDir: File? = null): String {
    val output = ByteArrayOutputStream()
    exec {
        workDir?.also { workingDir = it }
        commandLine(*args)
        standardOutput = output
    }
    return String(output.toByteArray()).trim()
}

val modePreview = "preview"
val modeProduction = "production"
var currentMode = modeProduction

val frontendFolder = File("${projectDir}/gofi-frontend")
val backendFolder = File("${projectDir}/gofi-backend")
val frontendDistFolder = File("${frontendFolder}/dist")
val backendDistFolder = File("${backendFolder}/dist")
val backendOutputFolder = File("${backendFolder}/output")
val outputFolder = File("${projectDir}/output")

val goPath = command("go", "env", "GOPATH")
val goBinDir = "$goPath/bin"
val xgoPath = "${goBinDir}/xgo"
val xgoExist = File(xgoPath).exists()

val head = command("git", "rev-parse", "HEAD")
val lastTag = command("git", "rev-list", "--tags", "--max-count=1")
val version = if (head === lastTag) {
    // tag name
    command("git", "describe", "--tags", lastTag)
} else {
    // short commit id
    command("git", "rev-parse", "--short=8", "HEAD")
}

tasks.register("compile-front-end") {
    // install dependency
    doLast {
        command("yarn", "install", workDir = frontendFolder).also {
            println(it)
        }
        // lint
        command("yarn", "run", "lint", "--no-fix", workDir = frontendFolder).also {
            println(it)
        }
        // build front end
        command("yarn", "run", "build", "--mode", currentMode, workDir = frontendFolder).also {
            println(it)
        }
    }
}

tasks.register("compile-backend-end") {
    dependsOn("compile-front-end")
    doLast {
        backendDistFolder.deleteRecursively()
        frontendDistFolder.copyRecursively(backendDistFolder, true)
        backendOutputFolder.deleteRecursively()
        backendOutputFolder.mkdir()

        // if xgo not exist
        if (xgoExist.not()) {
            println("xgo not exist, try to get")
            command("go", "get", "-v", "src.techknowlogick.com/xgo", workDir = backendFolder).also {
                println(it)
            }
        }

        // get all dependency
        command("go", "get", "-v", "-t", "-d", workDir = backendFolder).also {
            println(it)
        }

        // cross compile by xgo
        command(
            xgoPath,
            "-out=gofi",
            "-tags=${currentMode}",
            "-ldflags=-w -s -X gofi/db.version=${version}",
            "--dest=./output",
            "--targets=windows/amd64,darwin/amd64,linux/amd64,linux/arm",
            "./",
            workDir = backendFolder
        ).also {
            println(it)
        }
    }
}

fun printCurrentBuildInfo(){
    println("====> Current Build Mode: $currentMode")
    println("====> Build Version: $version")   
    println("====> frontendFolder $frontendFolder") 
    println("====> backendFolder $backendFolder") 
    println("====> frontendDistFolder $frontendDistFolder") 
    println("====> backendDistFolder $backendDistFolder") 
    println("====> backendOutputFolder $backendOutputFolder") 
    println("====> outputFolder $outputFolder") 
    println("====> goPath $goPath") 
    println("====> goBinDir $goBinDir") 
    println("====> xgoPath $xgoPath") 
    println("====> xgoExist $xgoExist") 
}

tasks.register("build") {
    printCurrentBuildInfo()
    dependsOn("compile-backend-end")
    doLast {
        outputFolder.deleteRecursively()
        backendOutputFolder.copyRecursively(outputFolder, true)
        backendOutputFolder.deleteRecursively()
    }
}

tasks.register("build-prod") {
    currentMode = modeProduction
    dependsOn("build")
}

tasks.register("build-preview") {
    currentMode = modePreview
    dependsOn("build")
}

defaultTasks("build-prod")