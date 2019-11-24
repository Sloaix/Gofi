#!/bin/bash
build_dir=$(pwd)
client_dir=$(pwd)/gofi-frontend
server_dir=$(pwd)/gofi-backend
go_bin_dir=$(go env GOPATH)/bin

function bindata() {
    if ! [ -x "$(command -v $go_bin_dir/go-bindata)" ]; then
        go install github.com/go-bindata/go-bindata/...
    fi
    $go_bin_dir/go-bindata -nocompress -pkg binary -o $server_dir/binary/assets.go $1
}

function beforeBuild() {
    echo "before build, cleaning..."
    rm -rf $build_dir/output
    rm -rf $server_dir/output
}

function buildClient() {
    echo "start building client for Gofi..."
    cd $client_dir
    yarn install && yarn run lint --no-fix && yarn run build
}

function buildServer() {
    echo "start build server for Gofi"
    cd $build_dir
    mv $client_dir/dist $server_dir/public
    cd $server_dir
    mkdir $server_dir/output
    go get -v -t -d
    bindata public/...

    # cross compile
    # linux
    GOOS=linux GOARCH=amd64 go build -v -o output/gofi-linux-amd64
    GOOS=linux GOARCH=386 go build -v -o output/gofi-linux-386
    GOOS=linux GOARCH=arm go build -v -o output/gofi-linux-arm

    # macOS
    GOOS=darwin GOARCH=amd64 go build -v -o output/gofi-macOS-amd64
    GOOS=darwin GOARCH=386 go build -v -o output/gofi-macOS-386

    # freebsd
    GOOS=freebsd GOARCH=amd64 go build -v -o output/gofi-freebsd-amd64
    GOOS=freebsd GOARCH=386 go build -v -o output/gofi-freebsd-386

    # windows
    GOOS=windows GOARCH=amd64 go build -v -o output/gofi-windows-amd64.exe
    GOOS=windows GOARCH=386 go build -v -o output/gofi-windows-386.exe

    mv $server_dir/output $build_dir/output
}

function afterBuild() {
    echo "after build, cleaning..."
    rm -rf $server_dir/public
    echo "Build complete. The build product has been exported to the directory $build_dir/output"
}

beforeBuild
buildClient
buildServer
afterBuild
