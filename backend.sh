#!/bin/bash

# 后端启动脚本
echo "🚀 启动 Gofi 后端..."

# 检查是否在正确的目录
if [ ! -d "gofi-backend" ]; then
    echo "❌ 错误：请在项目根目录下运行此脚本"
    exit 1
fi

# 进入后端目录
cd gofi-backend

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "❌ 错误：未找到 Go 环境，请先安装 Go"
    exit 1
fi

echo "✅ Go 环境检查完成"

# 检查 go.mod 是否存在
if [ ! -f "go.mod" ]; then
    echo "❌ 错误：找不到 go.mod 文件"
    exit 1
fi

# 下载依赖
echo "📦 下载 Go 依赖..."
go mod download
if [ $? -ne 0 ]; then
    echo "❌ 依赖下载失败"
    exit 1
fi

# 检查 go.sum 是否需要更新
echo "🔍 检查依赖完整性..."
go mod verify
if [ $? -ne 0 ]; then
    echo "⚠️  依赖验证失败，尝试修复..."
    go mod tidy
fi

echo "✅ 后端依赖检查完成"
echo "🖥️  启动后端服务器..."

# 启动后端服务器
go run main.go 