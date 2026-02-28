#!/bin/bash
# 当前文件目录
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# 输出目录
echo $SCRIPT_DIR
# 项目目录
cd $SCRIPT_DIR/../../

echo $(pwd)
# 安装依赖
pnpm install

#pnpm run build:blog:sys
#pnpm run build:blog:manage
# 多个项目同时打包
pnpm run build --filter=blog-sys --filter=blog-manage

echo "Builder Success 🎉"
