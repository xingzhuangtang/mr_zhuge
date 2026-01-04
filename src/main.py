from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys
from dotenv import load_dotenv

# Ensure project root is in sys.path for 'src' imports to work
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 加载 .env 文件（如果存在）
load_dotenv()

# 导入各功能模块的子应用或路由
try:
    from src.api.llm_api import app as llm_app
    print("✅ Successfully imported llm_app")
except ImportError as e:
    print(f"❌ Error importing llm_app: {e}")
    llm_app = None

try:
    from src.api.image_api import app as image_app
    print("✅ Successfully imported image_app")
except ImportError as e:
    print(f"❌ Error importing image_app: {e}")
    image_app = None

try:
    from src.api.multimodal_api import app as multimodal_app
    print("✅ Successfully imported multimodal_app")
except ImportError as e:
    print(f"❌ Error importing multimodal_app: {e}")
    multimodal_app = None

# 👇 新增：战役推演 API 路由（关键！）
try:
    # 智能导入：根据Python路径和运行位置决定导入路径
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)  # src的上级目录
    
    # 检查Python路径是否包含项目根目录
    root_in_path = any(path == project_root for path in sys.path[:3])
    
    if root_in_path:
        # Python路径包含项目根目录，应该使用src.api
        from src.api.battle_api import router as battle_router
    else:
        # 其他情况，尝试api直接导入
        from api.battle_api import router as battle_router
        
except ImportError as e:
    print(f"⚠️  战役推演模块未找到: {e}")
    battle_router = None
except Exception as e:
    print(f"❌ 导入时发生其他错误: {e}")
    battle_router = None

# 👇 新增：游戏化战役 API 路由
try:
    # 智能导入：根据Python路径和运行位置决定导入路径
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)  # src的上级目录
    
    # 检查Python路径是否包含项目根目录
    root_in_path = any(path == project_root for path in sys.path[:3])
    
    if root_in_path:
        # Python路径包含项目根目录，应该使用src.api
        from src.api.game_battle_api import router as game_battle_router
    else:
        # 其他情况，尝试api直接导入
        from api.game_battle_api import router as game_battle_router
        
except ImportError as e:
    print(f"⚠️  游戏化战役模块未找到: {e}")
    game_battle_router = None
except Exception as e:
    print(f"❌ 游戏化战役API导入时发生错误: {e}")
    game_battle_router = None

# 创建主 FastAPI 应用
app = FastAPI(
    title="Mr诸葛军事教育AI助手",
    version="2.1",
    description="基于大语言模型的军事教育AI代理，支持多模态内容生成与战役推演"
)

# 挂载子应用（API 接口）
if llm_app:
    app.mount("/api/v1/llm", llm_app)
if image_app:
    app.mount("/api/v1/image", image_app)
if multimodal_app:
    app.mount("/api/v1/multimodal", multimodal_app)

# 👇 正确挂载战役推演路由（使用 include_router，不是 mount！）
if battle_router:
    app.include_router(battle_router, prefix="/api/v1")

# 👇 挂载游戏化战役路由
# 👇 挂载游戏化战役路由
if game_battle_router:
    app.include_router(game_battle_router)

# 👇 新增：战役推演路由 (Deduction API)
try:
    from src.api.deduction_api import router as deduction_router
    app.include_router(deduction_router)
except ImportError:
    try:
        from api.deduction_api import router as deduction_router
        app.include_router(deduction_router)
    except Exception as e:
        print(f"⚠️  推演模块加载失败: {e}")

# 👇 新增：朝代数据API路由
try:
    from src.api.dynasty_api import router as dynasty_router
    app.include_router(dynasty_router, prefix="/api/v1/dynasty")
    print("✅ 成功导入朝代API路由")
except ImportError as e:
    print(f"❌ 导入朝代API路由失败: {e}")
except Exception as e:
    print(f"❌ 导入朝代API路由时发生其他错误: {e}")

# 挂载静态文件目录
static_dir = "static"
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 页面路由
@app.get("/", response_class=FileResponse)
async def root():
    return FileResponse("static/index.html")

# 保留 API 路由，移除旧的页面路由以保持简洁


if __name__ == "__main__":
    import uvicorn
    # Allow running directly with python src/main.py
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Need to add project root to sys.path if not already there
    if project_root not in sys.path:
        sys.path.append(project_root)
    
    # Use import string to enable reload
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
