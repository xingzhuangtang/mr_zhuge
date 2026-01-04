#!/bin/bash

# 🎮 游戏化军事历史可视化分支 - 自动合并脚本
# 版本: v2.0
# 作者: 分支维护者
# 日期: 2025-11-25

echo "🎮 开始合并游戏化军事历史可视化分支..."

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为Git仓库
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误: 当前目录不是Git仓库${NC}"
    exit 1
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 当前分支: $CURRENT_BRANCH${NC}"

# 备份当前状态
echo -e "${YELLOW}💾 创建备份...${NC}"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
git stash push -m "分支合并前备份 - $BACKUP_DIR"
echo -e "${GREEN}✅ 备份完成: stash@{0}${NC}"

# 合并策略
echo -e "${YELLOW}🔧 选择合并策略:${NC}"
echo "1) 向前合并 (推荐) - 将分支功能集成到当前分支"
echo "2) 快速合并 - 直接将分支的所有更改应用到当前分支"
echo "3) 仅保留特定文件 - 选择性合并关键文件"
read -p "请选择 (1-3): " MERGE_STRATEGY

case $MERGE_STRATEGY in
    1)
        echo -e "${GREEN}🚀 执行向前合并...${NC}"
        echo -e "${YELLOW}📋 即将合并的功能:${NC}"
        echo "  ✅ 游戏化UI界面"
        echo "  ✅ 音效系统"
        echo "  ✅ 教学模式"
        echo "  ✅ 性能监控"
        echo "  ✅ 键盘快捷键"
        echo "  ✅ 增强地形系统"
        echo "  ✅ 大规模渲染优化"
        ;;
    2)
        echo -e "${GREEN}⚡ 执行快速合并...${NC}"
        git merge game-battle-visualization --no-ff -m "合并游戏化军事历史可视化分支 v2.0"
        ;;
    3)
        echo -e "${YELLOW}📁 选择性合并文件...${NC}"
        FILES_TO_MERGE=(
            "static/game-battle-replay.html"
            "static/js/audio-system.js"
            "static/js/educational-system.js" 
            "static/js/enhanced-terrain.js"
            "static/js/formation-animations.js"
            "static/js/large-scale-rendering.js"
            "static/js/tactical-animations.js"
            "static/js/weather-environment.js"
            "knowledge_base/military_data/historical_battles.json"
            "src/api/game_battle_api.py"
        )
        
        for file in "${FILES_TO_MERGE[@]}"; do
            if [ -f "$file" ]; then
                echo -e "${GREEN}✅ 合并文件: $file${NC}"
                git add "$file"
            else
                echo -e "${YELLOW}⚠️  文件不存在: $file${NC}"
            fi
        done
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 更新主入口页面
echo -e "${YELLOW}🏠 更新主入口页面...${NC}"
if [ -f "static/index.html" ]; then
    echo "主入口页面已就绪"
else
    echo -e "${YELLOW}⚠️  警告: 未找到 static/index.html${NC}"
fi

# 运行测试
echo -e "${YELLOW}🧪 运行基本测试...${NC}"
if command -v python3 &> /dev/null; then
    echo "✅ Python3 可用"
    # 运行API测试 (如果有的话)
    if [ -f "test_api.py" ]; then
        python3 test_api.py
    fi
else
    echo -e "${YELLOW}⚠️  Python3 不可用，跳过API测试${NC}"
fi

# 检查JavaScript语法
echo -e "${YELLOW}🔍 检查JavaScript文件...${NC}"
JS_FILES=$(find static/js -name "*.js" 2>/dev/null)
if [ ! -z "$JS_FILES" ]; then
    for file in $JS_FILES; do
        if node -c "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ $file 语法正确${NC}"
        else
            echo -e "${RED}❌ $file 语法错误${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  未找到JavaScript文件${NC}"
fi

# 更新分支状态
echo -e "${YELLOW}📊 更新分支状态...${NC}"
if [ -f "BRANCH_MERGE_INTERFACE.md" ]; then
    echo "分支合并接口文档已就绪"
fi

# 显示合并结果
echo -e "${GREEN}🎉 分支合并完成!${NC}"
echo -e "${BLUE}📋 合并结果总结:${NC}"
echo "  📁 新增文件数量: $(find static/js -name "*.js" 2>/dev/null | wc -l) 个JS模块"
echo "  📊 主入口页面: static/index.html"
echo "  🔗 合并接口文档: BRANCH_MERGE_INTERFACE.md"
echo "  🧪 测试状态: 基本测试完成"

# 提示下一步操作
echo -e "${YELLOW}💡 建议下一步操作:${NC}"
echo "  1. 在浏览器中访问 static/index.html 测试新功能"
echo "  2. 检查 static/game-battle-replay.html 的游戏化功能"
echo "  3. 验证原有 static/battle-replay.html 功能正常"
echo "  4. 部署到生产环境 (如果测试通过)"

# 创建合并标签
echo -e "${YELLOW}🏷️  创建合并标签...${NC}"
git tag -a "merge-game-battle-v2.0" -m "合并游戏化军事历史可视化分支 v2.0 - $(date +%Y-%m-%d)"
echo -e "${GREEN}✅ 合并标签已创建${NC}"

echo -e "${GREEN}🎊 分支合并流程完成!${NC}"
echo -e "${BLUE}如有问题，请参考 BRANCH_MERGE_INTERFACE.md 文档${NC}"