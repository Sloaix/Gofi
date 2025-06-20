#!/bin/bash

# 前端启动脚本
echo "🚀 启动 Gofi 前端..."

# 检查是否在正确的目录
if [ ! -d "gofi-frontend" ]; then
    echo "❌ 错误：请在项目根目录下运行此脚本"
    exit 1
fi

# 进入前端目录
cd gofi-frontend

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 错误：找不到 package.json 文件"
    exit 1
fi

echo "✅ 前端依赖检查完成"
echo "🌐 启动开发服务器..."

# 启动开发服务器
pnpm run dev 