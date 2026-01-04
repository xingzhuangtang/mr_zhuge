#!/bin/bash

# 战役推演系统 Podman Compose 部署脚本
# 使用方法: ./deploy_battle_system.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Podman是否安装
check_podman() {
    if ! command -v podman &> /dev/null; then
        log_error "Podman未安装，请先安装Podman"
        log_info "Ubuntu/Debian: sudo apt-get install podman"
        log_info "Fedora/CentOS: sudo dnf install podman"
        exit 1
    fi
    log_success "Podman已安装"
}

# 检查podman-compose是否安装
check_podman_compose() {
    if ! command -v podman-compose &> /dev/null; then
        log_warning "podman-compose未安装，尝试安装..."
        
        # 尝试安装podman-compose
        if command -v pip3 &> /dev/null; then
            pip3 install podman-compose
            log_success "podman-compose安装完成"
        elif command -v pip &> /dev/null; then
            pip install podman-compose
            log_success "podman-compose安装完成"
        else
            log_error "pip未找到，无法安装podman-compose"
            exit 1
        fi
    else
        log_success "podman-compose已安装"
    fi
}

# 停止现有容器
stop_containers() {
    log_info "停止现有容器..."
    if podman-compose down 2>/dev/null || docker-compose down 2>/dev/null; then
        log_success "现有容器已停止"
    else
        log_warning "无现有容器需要停止"
    fi
}

# 清理旧镜像
cleanup_images() {
    log_info "清理旧镜像..."
    podman image prune -f >/dev/null 2>&1 || true
    log_success "镜像清理完成"
}

# 构建镜像
build_images() {
    log_info "构建战役推演镜像..."
    
    # 检查Dockerfile是否存在
    if [ ! -f "Dockerfile" ]; then
        log_error "未找到Dockerfile文件"
        exit 1
    fi
    
    # 构建API镜像
    podman build -t mrzhuge-battle:latest . || {
        log_error "镜像构建失败"
        exit 1
    }
    log_success "战役推演镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动战役推演服务..."
    
    # 使用podman-compose或docker-compose
    if command -v podman-compose &> /dev/null; then
        log_info "使用 podman-compose 启动服务"
        podman-compose up -d
    elif command -v docker-compose &> /dev/null; then
        log_info "使用 docker-compose 启动服务"
        docker-compose -f podman-compose.yml up -d
    else
        log_error "未找到 podman-compose 或 docker-compose"
        exit 1
    fi
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    # 等待服务启动
    sleep 10
    
    # 检查API服务
    if curl -s http://localhost:8000/api/v1/battle/赤壁之战 >/dev/null; then
        log_success "API服务运行正常"
    else
        log_warning "API服务可能还未就绪，请稍后检查"
    fi
    
    # 检查前端服务
    if curl -s http://localhost:8080/battle-replay-leaflet.html >/dev/null; then
        log_success "前端服务运行正常"
    else
        log_warning "前端服务可能还未就绪，请稍后检查"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    log_success "=== 战役推演系统部署完成! ==="
    echo ""
    echo "🌐 访问地址:"
    echo "   战役推演页面: http://localhost:8080/battle-replay-leaflet.html"
    echo "   原始版本:     http://localhost:8080/battle-replay.html"
    echo "   API接口:      http://localhost:8000/api/v1/battle/赤壁之战"
    echo ""
    echo "📝 管理命令:"
    echo "   查看日志:    podman-compose logs -f"
    echo "   停止服务:    podman-compose down"
    echo "   重启服务:    podman-compose restart"
    echo ""
    echo "💡 提示:"
    echo "   - 建议使用Leaflet版本的战役推演页面"
    echo "   - 如遇问题请检查容器日志: podman-compose logs"
    echo ""
}

# 主函数
main() {
    echo "⚔️  战役推演系统 Podman 部署"
    echo "================================"
    
    check_podman
    check_podman_compose
    stop_containers
    cleanup_images
    build_images
    start_services
    check_services
    show_access_info
}

# 执行主函数
main "$@"