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

logger = logging.getLogger(__name__)

app = FastAPI(title="多模态军事AI API")

class QueryRequest(BaseModel):
    query: str

class MultimodalResponse(BaseModel):
    text_response: str
    battle_data: Optional[Dict[str, Any]] = None
    available_actions: List[str] = []
    source: str

class BattleMapData(BaseModel):
    name: str
    coordinates: Dict[str, float]  # {lat, lng}
    timeline: List[Dict[str, Any]]
    terrain_type: str
    forces: Dict[str, Any]

# 全局服务
model_service = get_model_service()
knowledge_base = MilitaryKnowledgeBase()
image_service = ImageGenerationService()

@app.post("/multimodal-analysis")
async def multimodal_analysis(request: QueryRequest) -> MultimodalResponse:
    """多模态分析：文本 + 地图数据 + 可操作动作"""
    try:
        query = request.query
        
        # 1. 检查是否为已知战役
        battle_info = knowledge_base.search_battle(query)
        
        if battle_info:
            # 从知识库获取详细信息
            battle_data = knowledge_base.get_battle_analysis(query)
            text_response = battle_data.get("analysis", "")
            source = "knowledge_base"
            
            # 获取地图数据
            map_data = await get_battle_map_data(query)
            
            available_actions = ["generate_image", "show_3d_map", "generate_video"]
            
        else:
            # 调用大模型
            prompt = f"""
            请详细分析军事历史问题：{query}。
            包括：历史背景、战略意义、战术特点、参战方、时间地点、结果影响。
            """
            text_response = await model_service.generate_text(prompt)
            map_data = None
            source = "ai_model"
            available_actions = ["generate_image", "search_related_images"]
        
        return MultimodalResponse(
            text_response=text_response,
            battle_data=map_data,
            available_actions=available_actions,
            source=source
        )
        
    except Exception as e:
        logger.error(f"多模态分析失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_battle_map_data(battle_name: str) -> Optional[BattleMapData]:
    """获取战役地图数据"""
    # 这里可以从知识库或外部API获取真实地理坐标
    battle_coordinates = {
        "野狐岭之战": {"lat": 41.7833, "lng": 114.3667},
        "斯大林格勒战役": {"lat": 48.7080, "lng": 44.5133},
        "诺曼底登陆": {"lat": 49.4144, "lng": -0.8850}
    }
    
    if battle_name in battle_coordinates:
        return BattleMapData(
            name=battle_name,
            coordinates=battle_coordinates[battle_name],
            timeline=[
                {"time": "1211年", "event": "蒙古军队集结"},
                {"time": "1211年8月", "event": "野狐岭决战"}
            ],
            terrain_type="mountainous",
            forces={
                "mongol": {"troops": 90000, "commander": "成吉思汗"},
                "jin": {"troops": 450000, "commander": "完颜承裕"}
            }
        )
    return None

@app.post("/generate-battle-image")
async def generate_battle_image(request: QueryRequest):
    """生成战役图像"""
    try:
        prompt = f"historical battle scene of {request.query}, realistic, detailed, cinematic"
        image_url = await image_service.generate_image(prompt, style="realistic")
        return {"image_url": image_url}
    except Exception as e:
        logger.error(f"图像生成失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-battle-map-data")
async def get_battle_map_data_endpoint(request: QueryRequest):
    """获取战役地图数据API"""
    map_data = await get_battle_map_data(request.query)
    if not map_data:
        raise HTTPException(status_code=404, detail="未找到该战役的地图数据")
    return map_data