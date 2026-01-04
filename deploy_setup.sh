#!/bin/bash

# Mr诸葛军事AI助手 - 部署设置脚本
# 此脚本用于在部署时替换 static/index.html 中的 API 密钥占位符

set -e

echo "🚀 开始部署设置..."

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请先复制 .env.example 为 .env 并填入真实的密钥值"
    echo "命令: cp .env.example .env"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env | xargs)

# 检查必需的环境变量
if [ -z "$AMAP_API_KEY" ] || [ "$AMAP_API_KEY" = "your_amap_api_key_here" ]; then
    echo "❌ 错误: AMAP_API_KEY 未设置或为默认值"
    echo "请在 .env 文件中设置有效的高德地图 API Key"
    exit 1
fi

if [ -z "$AMAP_SECURITY_CODE" ] || [ "$AMAP_SECURITY_CODE" = "your_amap_security_code_here" ]; then
    echo "❌ 错误: AMAP_SECURITY_CODE 未设置或为默认值"
    echo "请在 .env 文件中设置有效的高德地图安全代码"
    exit 1
fi

# 替换 static/index.html 中的占位符
echo "📝 替换 static/index.html 中的 API 密钥占位符..."

sed -i.bak "s|YOUR_AMAP_API_KEY|$AMAP_API_KEY|g" static/index.html
sed -i.bak "s|YOUR_AMAP_SECURITY_CODE|$AMAP_SECURITY_CODE|g" static/index.html

# 删除备份文件
rm -f static/index.html.bak

echo "✅ 部署设置完成！"
echo ""
echo "📋 已配置的环境变量:"
echo "  - AMAP_API_KEY: ${AMAP_API_KEY:0:10}..."
echo "  - AMAP_SECURITY_CODE: ${AMAP_SECURITY_CODE:0:10}..."
echo ""
echo "🎉 现在可以启动服务了！"
