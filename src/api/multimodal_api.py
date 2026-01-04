# src/api/multimodal_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import json
import asyncio

from src.ai_agent.model_service import get_model_service
from src.ai_agent.military_knowledge_base import MilitaryKnowledgeBase
from src.api.image_api import ImageGenerationService
from src.ai_agent.video_generation_service import VideoGenerationService

logger = logging.getLogger(__name__)

app = FastAPI(title="多模态军事AI API")

async def get_battle_map_data(query: str) -> Dict[str, Any]:
    """
    获取战役地图数据
    """
    try:
        # 这里应该实现真实的地图数据获取逻辑
        # 目前返回模拟数据
        battle_map_data = {
            "battle_name": query,
            "map_data": {
                "center": [116.3974, 39.9093],  # 北京坐标
                "zoom": 8,
                "layers": [
                    {
                        "name": "terrain",
                        "type": "terrain",
                        "visible": True
                    },
                    {
                        "name": "battles",
                        "type": "vector",
                        "visible": True,
                        "data": [
                            {
                                "position": [116.3974, 39.9093],
                                "name": f"{query}战役核心区域",
                                "type": "battle_position"
                            }
                        ]
                    }
                ]
            },
            "battle_info": {
                "name": query,
                "description": f"{query}的战役地图数据",
                "date": "历史时期",
                "location": "华北地区"
            }
        }
        
        logger.info(f"获取到战役地图数据: {query}")
        return battle_map_data
    except Exception as e:
        logger.error(f"获取战役地图数据失败: {e}")
        return {}

class QueryRequest(BaseModel):
    query: str

class VideoGenerationRequest(BaseModel):
    text: str
    steps: Optional[List[Dict[str, Any]]] = None

# ... (unchanged code) ...

@app.post("/generate-video")
async def generate_video(request: VideoGenerationRequest):
    """生成战役视频"""
    try:
        # 获取模型服务和视频生成服务实例
        model_service = get_model_service()
        video_service = VideoGenerationService()
        
        # Prompt optimization using LLM
        if request.steps:
            try:
                # Construct context from deduction steps
                steps_text = "\n".join([f"Step {i+1}: {step.get('description', '')}" for i, step in enumerate(request.steps)])
                # Extract specific actions like routes and battles
                action_highlights = []
                for step in request.steps:
                    for action in step.get('actions', []):
                        if action['type'] in ['path', 'arrow']:
                             action_highlights.append(f"行军/移动: {action.get('label', '部队移动')}")
                        elif action['type'] == 'marker':
                             action_highlights.append(f"地点/交火: {action.get('label', '关键位置')}")

                actions_text = "; ".join(action_highlights[:10]) # Limit to key actions

                llm_prompt = f"""
                请根据以下战役推演步骤，总结生成一段用于AI视频生成的英文提示词 (Prompt)。
                这是一部史诗级的战争电影预告片。
                
                【重要要求】：
                1. 必须以推演内容为提纲，涵盖关键的【行军路线】和【交火场景】。
                2. 描述一个宏大的战争场面，能够概括整个战役的氛围。
                3. 包含具体的视觉元素（如地形、军队着装、天气、光影）。
                4. 强调“电影质感”、“高清晰度”、“写实风格”。
                5. 提示词长度控制在500字符以内。
                6. 直接返回英文提示词，不要包含其他解释。

                战役步骤：
                {steps_text}
                
                关键行动（行军与交火）：
                {actions_text}
                """
                
                optimized_prompt = await model_service.generate_text(llm_prompt)
                # Remove quotes if present
                optimized_prompt = optimized_prompt.strip('"').strip("'")
                logger.info(f"Optimized Video Prompt: {optimized_prompt}")
                video_input_text = optimized_prompt
            except Exception as e:
                logger.warning(f"Video prompt optimization failed: {e}. Falling back to raw text.")
                # Fallback to a simple combination if LLM fails
                video_input_text = f"Epic war movie scene, {request.text}, detailed terrain, realistic style, cinematic lighting. "
        else:
            video_input_text = request.text

        video_url = await video_service.generate_video_from_text(video_input_text)
        return {"video_url": video_url}
    except ValueError as ve:
        logger.error(f"视频生成参数错误/模型错误: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"视频生成失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-battle-map-data")
async def get_battle_map_data_endpoint(request: QueryRequest):
    """获取战役地图数据API"""
    map_data = await get_battle_map_data(request.query)
    if not map_data:
        raise HTTPException(status_code=404, detail="未找到该战役的地图数据")
    return map_data