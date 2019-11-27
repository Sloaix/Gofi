#!/bin/bash
build_dir=$(pwd)
server_dir=$(pwd)/gofi-backend

cd $server_dir
go test -test.v ./test