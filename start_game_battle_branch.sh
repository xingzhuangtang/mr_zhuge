#!/bin/bash

# 🎮 游戏化军事历史可视化分支启动脚本
# 版本: v2.0
# 使用方法: ./start_game_battle_branch.sh

echo "🎮 启动游戏化军事历史可视化分支系统..."
echo "================================================"

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 检查Python环境
echo -e "${BLUE}🔍 检查Python环境...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python3 未安装${NC}"
    exit 1
fi

# 检查uvicorn
echo -e "${BLUE}📦 检查FastAPI和uvicorn...${NC}"
if ! python3 -c "import uvicorn" &> /dev/null; then
    echo -e "${YELLOW}📥 安装uvicorn...${NC}"
    pip3 install uvicorn fastapi
fi

# 切换到项目目录
cd "$(dirname "$0")"
CURRENT_DIR=$(pwd)
echo -e "${GREEN}📁 当前目录: $CURRENT_DIR${NC}"

# 检查关键文件
echo -e "${BLUE}🔍 检查游戏化分支文件...${NC}"
REQUIRED_FILES=(
    "static/index.html"
    "static/game-battle-replay.html"
    "static/js/audio-system.js"
    "static/js/educational-system.js"
    "src/main.py"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ 缺失: $file${NC}"
    fi
done

echo ""
echo -e "${PURPLE}🎯 游戏化军事历史可视化分支 v2.0${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}🌐 访问地址:${NC}"
echo "  🏠 主入口: http://localhost:8000/static/index.html"
echo "  🎮 游戏化系统: http://localhost:8000/static/game-battle-replay.html"
echo "  📊 经典版本: http://localhost:8000/static/battle-replay.html"
echo ""
echo -e "${YELLOW}📋 测试清单:${NC}"
echo "  ✅ 检查主入口页面是否正常显示"
echo "  ✅ 测试游戏化界面的战役选择"
echo "  ✅ 验证3D地图加载和战役播放"
echo "  ✅ 测试音效系统开关"
echo "  ✅ 体验教学模式功能"
echo "  ✅ 检查性能监控面板"
echo "  ✅ 测试键盘快捷键 (空格键播放/暂停)"
echo ""
echo -e "${PURPLE}🚀 正在启动服务...${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo ""

# 启动服务
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload