# Mr诸葛军事教育AI助手

## 项目概述
基于大语言模型的军事教育AI代理，集成多模态内容生成能力，旨在提供沉浸式学习体验。

## 快速开始

### 1. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入真实的 API 密钥
# 必需的密钥:
# - OPENROUTER_API_KEY: OpenRouter API 密钥
# - ZHIPUAI_API_KEY: 智谱AI API 密钥
# - AMAP_API_KEY: 高德地图 API 密钥
# - AMAP_SECURITY_CODE: 高德地图安全代码
# - POSTGRES_USER: 数据库用户名
# - POSTGRES_PASSWORD: 数据库密码
```

### 2. 本地开发
```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python src/main.py

# 访问: http://localhost:8000
```

### 3. Docker 部署
```bash
# 运行部署设置脚本（替换前端 API 密钥占位符）
chmod +x deploy_setup.sh
./deploy_setup.sh

# 启动 Docker Compose
docker-compose up -d
```

## 项目结构
- `src/` - 源代码
- `knowledge_base/` - 军事知识库
- `generated_content/` - 生成的内容
- `config/` - 配置文件
- `logs/` - 日志文件
- `static/` - 静态资源（前端）

## 安全说明

### 环境变量
本项目使用 `.env` 文件管理敏感信息，该文件已被 `.gitignore` 忽略，不会提交到 Git 仓库。

### API 密钥
- 后端 API 密钥通过环境变量读取
- 前端 AMap API 密钥通过 `deploy_setup.sh` 脚本在部署时替换

### 数据库密码
Docker Compose 配置使用环境变量设置数据库密码，避免硬编码。

## 注意事项
- ⚠️ `.env` 文件包含敏感信息，请勿提交到 Git
- ⚠️ 在生产环境中使用强密码
- ⚠️ 定期轮换 API 密钥