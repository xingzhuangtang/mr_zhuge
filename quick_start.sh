#!/bin/bash

# 快速启动脚本（简化版）
# 使用方法: ./quick_start.sh

echo "⚔️ 快速启动战役推演..."

# 检查是否已在正确的conda环境中
if [[ "$CONDA_DEFAULT_ENV" != "mrzhuge" ]] && [[ "$CONDA_DEFAULT_ENV" != "base" ]]; then
    echo "⚠️  请先激活conda环境: conda activate mrzhuge"
    exit 1
fi

# 检查uvicorn是否可用
if ! python -c "import uvicorn" &> /dev/null; then
    echo "📦 安装uvicorn..."
    pip install uvicorn fastapi
fi

# 启动服务
cd /Users/tangxingzhuang/Desktop/mr_zhuge_workspace
echo "🚀 启动战役推演系统..."
echo "🌐 访问: http://localhost:8000/static/battle-replay-leaflet.html"
echo ""

python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload