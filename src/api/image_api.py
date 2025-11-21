# src/api/image_api.py
"""
图像生成 HTTP API 接口
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.ai_agent.image_generation_service import ImageGenerationService

app = FastAPI(title="Image Generation API")
service = ImageGenerationService()  # 全局实例


class ImageRequest(BaseModel):
    prompt: str
    style: str = "realistic"
    size: str = "1024x1024"


@app.post("/generate-image")
async def generate_image(request: ImageRequest):
    try:
        image_url = await service.generate(
            prompt=request.prompt,
            style=request.style,
            size=request.size
        )
        return {
            "image_url": image_url,
            "prompt": request.prompt,
            "status": "success"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        raise HTTPException(status_code=500, detail="图像生成失败")