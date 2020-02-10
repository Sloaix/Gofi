#!/bin/bash
function gofilog() {
    echo 【Gofi Build】====\> $@
}

go_path=$(go env GOPATH)
go_bin_dir=$go_path/bin
build_dir=$(pwd)
build_dir_name=$(basename $build_dir)
correct_build_dir=$go_path/src/$build_dir_name
client_dir=$(pwd)/gofi-frontend
server_dir=$(pwd)/gofi-backend

ENV=$1
ENV="${ENV:-production}"

gofilog corrent build dir is $correct_build_dir, current build dir is $build_dir

if [ "$build_dir" != "$correct_build_dir" ]; then
    gofilog build failed, you must place project at $correct_build_dir
    exit
fi

gofilog build for $ENV

# 如果最新的commit有tag,返回tag，否则直接返回commit id
function getVersion() {
    lastCommit=$(git rev-parse HEAD)
    lastTagCommit=$(git rev-list --tags --max-count=1)
    if [ "$lastCommit" == "$lastTagCommit" ]; then
        #last tag
        echo $(git describe --tags $(git rev-list --tags --max-count=1))
    else
        # last commit short hash
        echo $(git rev-parse --short=8 HEAD)
    fi
}

gofilog build version is $(getVersion)

function bindata() {
    if ! [ -x "$(command -v $go_bin_dir/go-bindata)" ]; then
        go get github.com/go-bindata/go-bindata/...
    fi
    $go_bin_dir/go-bindata -nocompress -pkg binary -o $server_dir/binary/assets.go $1
}

function xgo() {
    if ! [ -x "$(command -v $go_bin_dir/xgo)" ]; then
        go get github.com/karalabe/xgo
    fi
    $go_bin_dir/xgo -out=gofi -tags=''$ENV'' -ldflags='-w -s -X gofi/db.version='$(getVersion)'' --dest=./output --targets=windows/amd64,darwin/amd64,linux/amd64,linux/arm,android/arm $1
}

function beforeBuild() {
    gofilog "before build, cleaning..."
    rm -rf $build_dir/output
    rm -rf $server_dir/output
}

function buildClient() {
    gofilog "start building client for Gofi..."
    cd $client_dir
    yarn install && yarn run lint --no-fix && yarn run build --mode $ENV
}

function buildServer() {
    gofilog "start build server for Gofi"
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
    gofilog "after build, cleaning..."
    rm -rf $server_dir/public
    gofilog "Build complete. The build product has been exported to the directory $build_dir/output"
    cd $build_dir/output
    du -ah ./
}

beforeBuild
buildClient
buildServer
afterBuild
