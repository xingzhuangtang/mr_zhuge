from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# 👇 新增：加载 .env 文件
from dotenv import load_dotenv
load_dotenv()  # ← 这行必须加！


# 导入新的API模块
from src.api.llm_api import app as llm_app
from src.api.image_api import app as image_app
from src.api.multimodal_api import app as multimodal_app

app = FastAPI(title="Mr诸葛军事教育AI助手", version="2.0")

# 挂载子应用
app.mount("/api/v1/llm", llm_app)
app.mount("/api/v1/image", image_app)
app.mount("/api/v1/multimodal", multimodal_app)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("static/chat.html")

@app.get("/chat")
async def chat_page():
    return FileResponse("static/chat.html")

@app.get("/advanced-chat")
async def advanced_chat_page():
    return FileResponse("static/advanced-chat.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)