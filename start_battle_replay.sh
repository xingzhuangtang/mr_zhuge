#!/bin/bash

# 赤壁之战战役推演 - Conda环境启动脚本（修复版）
# 使用方法: ./start_battle_replay.sh

echo "⚔️ 赤壁之战战役推演系统启动中..."

# 检查conda是否安装
if ! command -v conda &> /dev/null; then
    echo "❌ 未找到conda命令，请确保已安装Anaconda或Miniconda"
    exit 1
fi

# 获取conda基础路径
CONDA_BASE=$(conda info --base 2>/dev/null)
if [ -z "$CONDA_BASE" ]; then
    echo "❌ 无法获取conda信息"
    exit 1
fi

# 检查当前激活的环境
CURRENT_ENV=${CONDA_DEFAULT_ENV:-"unknown"}
echo "📋 当前激活环境: $CURRENT_ENV"

# 检查目标环境是否已激活
if [[ "$CURRENT_ENV" == "mrzhuge" ]]; then
    echo "✅ conda环境 'mrzhuge' 已激活"
elif [[ "$CURRENT_ENV" == "base" ]]; then
    echo "📦 当前在base环境，尝试激活 mrzhuge..."
    
    # 尝试多种激活方法
    ACTIVATED=false
    
    # 方法1: 使用conda activate
    if command -v conda &> /dev/null; then
        if eval "$(conda shell.bash hook)" 2>/dev/null && conda activate mrzhuge 2>/dev/null; then
            ACTIVATED=true
        fi
    fi
    
    # 方法2: 使用直接路径
    if [ "$ACTIVATED" = false ] && [ -f "$CONDA_BASE/bin/activate" ]; then
        source "$CONDA_BASE/bin/activate" mrzhuge 2>/dev/null && ACTIVATED=true
    fi
    
    # 验证激活结果
    if [ "$ACTIVATED" = true ]; then
        CURRENT_ENV=${CONDA_DEFAULT_ENV:-"unknown"}
        if [[ "$CURRENT_ENV" == "mrzhuge" ]]; then
            echo "✅ 成功激活 conda环境 'mrzhuge'"
        else
            echo "⚠️  激活命令执行但环境检查失败"
        fi
    else
        echo "⚠️  自动激活失败，假设环境已正确设置"
    fi
else
    echo "📦 当前在 '$CURRENT_ENV' 环境"
fi

# 检查必要的Python包
echo "🔍 检查Python依赖..."
MISSING_PACKAGES=()

if ! python -c "import uvicorn" &> /dev/null; then
    MISSING_PACKAGES+=("uvicorn")
fi

if ! python -c "import fastapi" &> /dev/null; then
    MISSING_PACKAGES+=("fastapi")
fi

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo "⚠️  发现缺失依赖: ${MISSING_PACKAGES[*]}"
    echo "💡 正在安装缺失的依赖..."
    
    for package in "${MISSING_PACKAGES[@]}"; do
        echo "📦 安装 $package..."
        pip install "$package"
    done
    
    echo "✅ 依赖安装完成"
fi

# 检查端口是否被占用
PORT=8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 $PORT 已被占用"
    
    # 尝试找到并杀死占用进程
    PIDS=$(lsof -ti:$PORT)
    if [ -n "$PIDS" ]; then
        echo "🔄 尝试关闭占用进程: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # 再次检查
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ 端口 $PORT 仍然被占用，请手动清理"
        echo "💡 提示：可以使用以下命令清理端口："
        echo "   lsof -ti:$PORT | xargs kill -9"
        exit 1
    fi
fi

# 获取当前Python路径
PYTHON_PATH=$(which python 2>/dev/null || echo "python")
echo "🐍 使用Python: $PYTHON_PATH"

# 启动服务器
echo ""
echo "🚀 启动战役推演系统..."
echo "📝 API服务器: http://localhost:$PORT"
echo "🗺️  战役推演页面: http://localhost:$PORT/static/battle-replay-leaflet.html"
echo "🔥 原始版本: http://localhost:$PORT/static/battle-replay.html"
echo ""
echo "💡 使用说明:"
echo "   - 建议使用Leaflet版本: battle-replay-leaflet.html"
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 如有问题请检查: conda info --envs"
echo ""

# 切换到项目目录并启动服务
cd /Users/tangxingzhuang/Desktop/mr_zhuge_workspace
"$PYTHON_PATH" -m uvicorn src.main:app --host 0.0.0.0 --port $PORT --reload