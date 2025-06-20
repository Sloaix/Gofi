package tool

import (
	"crypto/sha1"
	"encoding/hex"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"unicode/utf8"
)

func FileExist(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		return os.IsExist(err)
	}
	return true
}

func IsDirectory(filename string) bool {
	info, err := os.Stat(filename)
	if err != nil {
		return false
	}
	return info.IsDir()
}

func IsHiddenFile(name string) bool {
	if strings.TrimSpace(name) == "" {
		return false
	}

	return strings.HasPrefix(name, ".")
}

func IsFile(filename string) bool {
	info, err := os.Stat(filename)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

// MkdirIfNotExist 创建文件夹如果不存在
func MkdirIfNotExist(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		_ = os.Mkdir(path, os.ModePerm)
	}
}

// MkFileIfNotExist 创建文件如果不存在
func MkFileIfNotExist(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		_, _ = os.Create(path)
	}
}

func UploadFileTo(fh *multipart.FileHeader, destDirectory string) (int64, error) {
	Infof("=== UploadFileTo 开始 ===")
	Infof("文件名: %v, 大小: %d bytes", fh.Filename, fh.Size)
	Infof("目标目录: %v", destDirectory)

	src, err := fh.Open()
	if err != nil {
		Errorf("打开源文件失败: %v", err)
		return 0, err
	}
	defer src.Close()
	Infof("源文件打开成功")

	finalPath := filepath.Join(destDirectory, fh.Filename)
	Infof("最终文件路径: %v", finalPath)

	out, err := os.OpenFile(finalPath,
		os.O_WRONLY|os.O_CREATE, os.FileMode(0666))
	if err != nil {
		Errorf("创建目标文件失败: %v", err)
		return 0, err
	}
	defer out.Close()
	Infof("目标文件创建成功")

	written, err := io.Copy(out, src)
	if err != nil {
		Errorf("文件复制失败: %v", err)
		return 0, err
	}

	Infof("文件复制成功，写入 %d bytes", written)
	Infof("=== UploadFileTo 完成 ===")
	return written, nil
}

func IsTextFile(filepath string) bool {
	f, err := os.Open(filepath)
	if err != nil {
		return false
	}
	defer f.Close()

	var buf [1024]byte
	n, err := f.Read(buf[0:])
	if err != nil && err != io.EOF {
		return false
	}

	return utf8.Valid(buf[0:n])
}

// ParseFileContentType 根据扩展名解析文件的类型
func ParseFileContentType(file *os.File) string {
	// 一般用前512字节来识别文件头
	buffer := make([]byte, 512)

	_, err := file.Read(buffer)
	if err != nil {
		return ""
	}

	// 直接用标准库识别
	contentType := http.DetectContentType(buffer)
	return contentType
}

// Hash 文件摘要算法
func Hash(file *os.File) (hash string, err error) {
	if err != nil {
		return hash, err
	}
	md5hash := sha1.New()
	if _, err := io.Copy(md5hash, file); err != nil {
		return hash, err
	}
	hash = hex.EncodeToString(md5hash.Sum(nil))
	return hash, nil
}

// GetFileTypeByName 根据文件名判断文件类型（用于无后缀文件）
func GetFileTypeByName(fileName string) (fileType, iconType string) {
	name := strings.ToLower(fileName)

	// 特殊无后缀文本文件名
	textNames := []string{
		"license", "readme", "changelog", "authors", "contributors", "todo", "fixme", "hack",
		"notice", "copying", "version", "changes", "about", "thanks", "acknowledgements",
		"manifest", "procfile", ".env", ".gitignore", ".gitattributes",
	}

	// 特殊无后缀代码文件名
	codeNames := []string{
		"cmakelists.txt", "build", "containerfile",
	}

	// 检查是否为文本文件（支持 readme.md、readme.markdown、dockerfile、makefile 等）
	for _, textName := range textNames {
		if name == textName || strings.HasPrefix(name, textName+".") {
			return "text", "text"
		}
	}
	if name == "dockerfile" || strings.HasPrefix(name, "dockerfile.") {
		return "text", "text"
	}
	if name == "makefile" || strings.HasPrefix(name, "makefile.") {
		return "text", "text"
	}

	// 检查是否为代码文件（支持 dockerfile、makefile 等）
	for _, codeName := range codeNames {
		if name == codeName || strings.HasPrefix(name, codeName+".") {
			return "code", "code"
		}
	}

	// 检查是否为 Markdown 文件（.md 或 .markdown）
	if strings.HasSuffix(name, ".md") || strings.HasSuffix(name, ".markdown") {
		return "text", "text"
	}

	return "other", "file"
}

// GetFileType 根据文件扩展名、MIME类型和内容判断文件类型
func GetFileType(extension, mimeType string, isTextFile bool) (fileType, iconType string) {
	ext := strings.ToLower(extension)
	mime := strings.ToLower(mimeType)

	// 代码文件类型
	codeExtensions := []string{
		"js", "ts", "tsx", "jsx", "vue", "java", "swift", "cs", "php", "py", "cpp", "cc", "h", "mm", "c", "go", "sh", "rs",
		"css", "html", "htm", "sql", "r", "rb", "pl", "pm", "tcl", "lua", "scala", "kt", "clj", "hs", "ml", "fs", "dart", "elm",
		"coffee", "litcoffee", "iced", "sass", "scss", "less", "styl", "jade", "pug", "haml", "slim", "erb", "ejs", "njk",
		"hbs", "mustache", "handlebars", "liquid", "twig", "smarty", "velocity", "freemarker", "thymeleaf",
		"xml", "yaml", "yml", "toml", "ini", "cfg", "conf", "json", "lock", "gradle", "class", "xcconfig",
		"qml", "plist", "gitignore", "gitattributes", "dockerfile", "makefile", "cmake", "m4", "asm", "s", "f", "f90", "f95",
		"pas", "p", "pp", "d", "ada", "adb", "ads", "cob", "cbl", "bas", "vbs", "ps1", "psm1", "psd1", "bat", "cmd", "com",
	}

	// 图片文件类型
	imageExtensions := []string{
		"jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "webp", "svg", "ico", "cur", "ani", "pcx", "tga", "ppm", "pgm",
		"pbm", "xpm", "xbm", "wbmp", "jfif", "jpe", "jif", "j2k", "jp2", "jpx", "jpm", "mj2", "hdp", "wdp", "jxr", "hdr",
		"exr", "raw", "arw", "cr2", "nef", "orf", "rw2", "pef", "srw", "raf", "dng", "dcr", "kdc", "mrw", "mos", "iiq",
	}

	// 视频文件类型
	videoExtensions := []string{
		"mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v", "3gp", "ogv", "mts", "m2ts", "ts", "vob", "asf", "rm",
		"rmvb", "divx", "xvid", "h264", "h265", "hevc", "vp8", "vp9", "av1", "theora", "mpeg", "mpg", "mpe", "m1v", "m2v",
		"mpv", "m2p", "m2t", "m2ts", "m4v", "3g2", "3gp2", "3gpp", "3gpp2", "amv", "asf", "avi", "divx", "dv", "dvd",
	}

	// 音频文件类型
	audioExtensions := []string{
		"mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "aiff", "au", "ra", "rm", "mid", "midi", "kar", "amr", "ape",
		"opus", "spx", "tta", "wv", "mka", "m4b", "m4p", "aa", "aax", "act", "alac", "awb", "dss", "gsm", "mogg", "mpc",
		"oga", "sln", "voc", "vox", "8svx", "cda", "ac3", "dts", "eac3", "thd", "truehd", "mlp", "dtshd", "dtsma",
	}

	// 文档文件类型
	documentExtensions := []string{
		"pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf", "txt", "csv", "tsv", "tab",
		"pages", "numbers", "keynote", "key", "pages", "numbers", "keynote", "abw", "awt", "csv", "dbk", "doc", "docm",
		"docx", "dot", "dotm", "dotx", "epub", "fodt", "html", "htm", "odm", "odt", "ott", "pages", "rtf", "stw", "sxw",
		"txt", "uot", "vor", "wpd", "wps", "xml", "xps", "abf", "afm", "bdf", "bmf", "fnt", "fon", "otf", "pcf", "pfa",
	}

	// 压缩文件类型
	archiveExtensions := []string{
		"zip", "rar", "7z", "tar", "gz", "bz2", "xz", "lzma", "lz", "lzo", "lz4", "zstd", "cab", "ar", "deb", "rpm",
		"pkg", "dmg", "iso", "img", "vhd", "vmdk", "ova", "ovf", "vbox", "vdi", "hdd", "parallels", "vhd", "vhdx",
	}

	// 检查是否为代码文件
	for _, codeExt := range codeExtensions {
		if ext == codeExt {
			return "code", "code"
		}
	}

	// 检查是否为图片文件
	for _, imgExt := range imageExtensions {
		if ext == imgExt {
			return "image", "image"
		}
	}

	// 检查是否为视频文件
	for _, vidExt := range videoExtensions {
		if ext == vidExt {
			return "video", "video"
		}
	}

	// 检查是否为音频文件
	for _, audExt := range audioExtensions {
		if ext == audExt {
			return "audio", "audio"
		}
	}

	// 检查是否为文档文件
	for _, docExt := range documentExtensions {
		if ext == docExt {
			if ext == "pdf" {
				return "pdf", "pdf"
			}
			return "document", "document"
		}
	}

	// 检查是否为压缩文件
	for _, arcExt := range archiveExtensions {
		if ext == arcExt {
			return "archive", "archive"
		}
	}

	// 基于MIME类型判断
	if strings.HasPrefix(mime, "text/") || strings.Contains(mime, "application/json") || strings.Contains(mime, "application/xml") {
		if isTextFile {
			// 如果是文本文件且有内容，进一步判断是否为代码
			if strings.Contains(mime, "application/json") || strings.Contains(mime, "application/xml") ||
				strings.Contains(mime, "application/javascript") || strings.Contains(mime, "text/css") ||
				strings.Contains(mime, "text/html") || strings.Contains(mime, "text/xml") {
				return "code", "code"
			}
			return "text", "text"
		}
	}

	if strings.HasPrefix(mime, "image/") {
		return "image", "image"
	}

	if strings.HasPrefix(mime, "video/") {
		return "video", "video"
	}

	if strings.HasPrefix(mime, "audio/") {
		return "audio", "audio"
	}

	if mime == "application/pdf" {
		return "pdf", "pdf"
	}

	// 默认返回普通文件
	return "other", "file"
}
