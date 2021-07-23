#!/bin/bash
build_dir=$(pwd)
backend_dir=$(pwd)/gofi-backend
frontend_dir=$(pwd)/gofi-frontend

cd $backend_dir
go test -test.v ./test
cd $frontend_dir
yarn && yarn test
