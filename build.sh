#!/bin/bash
build_dir=$(pwd)
client_dir=$(pwd)/gofi-frontend
server_dir=$(pwd)/gofi-backend
go_bin_dir=$(go env GOPATH)/bin
tag=$(git describe --tags $(git rev-list --tags --max-count=1))

function bindata() {
    if ! [ -x "$(command -v $go_bin_dir/go-bindata)" ]; then
        go get github.com/go-bindata/go-bindata/...
    fi
    $go_bin_dir/go-bindata -nocompress -pkg binary -o $server_dir/binary/assets.go $1
}

function xgo() {
    if ! [ -x "$(command -v $go_bin_dir/xgo)" ]; then
        go get src.techknowlogick.com/xgo
    fi
    $go_bin_dir/xgo -go=go-1.13.4 -out=gofi-$tag -tags='product' -ldflags='-X gofi/context.version='$tag'' --dest=./output --targets=windows/amd64,darwin/amd64,linux/amd64,linux/arm,android/arm $1
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
    xgo ./
    mv $server_dir/output $build_dir/output
}

function afterBuild() {
    echo "after build, cleaning..."
    rm -rf $server_dir/public
    echo "Build complete. The build product has been exported to the directory $build_dir/output"
    cd $build_dir/output
    ls -al
}

beforeBuild
buildClient
buildServer
afterBuild
