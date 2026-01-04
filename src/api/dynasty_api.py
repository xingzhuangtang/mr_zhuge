# src/api/dynasty_api.py
"""
朝代数据API模块 - 提供中国历史朝代数据的查询和管理接口
"""

import logging
from fastapi import APIRouter, HTTPException
import json
import os
from typing import List, Dict, Any

# 配置日志
logger = logging.getLogger(__name__)

# 初始化 FastAPI 路由
router = APIRouter()

# 数据文件路径
DYNASTIES_FILE = "knowledge_base/dynasties.json"
CITY_MAPPINGS_FILE = "knowledge_base/city_mappings.json"

@router.get("/dynasty/{dynasty_id}")
async def get_dynasty_data(dynasty_id: str):
    """
    获取指定朝代的详细信息
    
    Args:
        dynasty_id: 朝代ID，如 'xia_2070', 'shang_1600' 等
        
    Returns:
        朝代详细信息，包括都城、重要城市、历史事件等
    """
    try:
        logger.info(f"获取朝代数据: {dynasty_id}")
        
        # 检查文件是否存在
        if not os.path.exists(DYNASTIES_FILE):
            raise HTTPException(status_code=500, detail="朝代数据文件不存在")
        
        # 读取朝代数据
        with open(DYNASTIES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # 查找指定朝代
        dynasty = next((d for d in data["dynasties"] if d["id"] == dynasty_id), None)
        
        if not dynasty:
            raise HTTPException(status_code=404, detail=f"朝代 '{dynasty_id}' 未找到")
        
        logger.info(f"成功获取朝代数据: {dynasty['name']}")
        return dynasty
        
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="朝代数据文件不存在")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="朝代数据文件格式错误")
    except Exception as e:
        logger.error(f"获取朝代数据时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/dynasties")
async def get_all_dynasties():
    """
    获取所有朝代列表
    
    Returns:
        包含所有朝代基本信息的列表
    """
    try:
        logger.info("获取所有朝代列表")
        
        if not os.path.exists(DYNASTIES_FILE):
            raise HTTPException(status_code=500, detail="朝代数据文件不存在")
        
        with open(DYNASTIES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        dynasties = data["dynasties"]
        logger.info(f"成功获取 {len(dynasties)} 个朝代数据")
        
        return {
            "count": len(dynasties),
            "dynasties": dynasties
        }
        
    except Exception as e:
        logger.error(f"获取朝代列表时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/cities/{dynasty_id}")
async def get_dynasty_cities(dynasty_id: str):
    """
    获取指定朝代的城市数据
    
    Args:
        dynasty_id: 朝代ID
        
    Returns:
        朝代的城市列表，包括历史名称和现代对照
    """
    try:
        logger.info(f"获取朝代城市数据: {dynasty_id}")
        
        # 先获取朝代数据
        dynasty_response = await get_dynasty_data(dynasty_id)
        dynasty = dynasty_response
        
        # 提取城市信息
        cities = dynasty.get("majorCities", [])
        
        result = {
            "dynastyId": dynasty_id,
            "dynastyName": dynasty["name"],
            "period": dynasty["period"],
            "cities": cities,
            "cityCount": len(cities)
        }
        
        logger.info(f"成功获取朝代 {dynasty['name']} 的 {len(cities)} 个城市")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取朝代城市数据时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/city-mappings")
async def get_city_mappings():
    """
    获取历史与现代地名映射关系
    
    Returns:
        历史地名与现代地名的映射关系
    """
    try:
        logger.info("获取城市名称映射")
        
        if not os.path.exists(CITY_MAPPINGS_FILE):
            raise HTTPException(status_code=500, detail="城市映射文件不存在")
        
        with open(CITY_MAPPINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        logger.info("成功获取城市名称映射")
        return data
        
    except Exception as e:
        logger.error(f"获取城市映射时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/search-city/{city_name}")
async def search_historical_city(city_name: str):
    """
    搜索历史城市
    
    Args:
        city_name: 城市名称（历史名称或现代名称）
        
    Returns:
        匹配的城市信息列表
    """
    try:
        logger.info(f"搜索历史城市: {city_name}")
        
        if not os.path.exists(DYNASTIES_FILE):
            raise HTTPException(status_code=500, detail="朝代数据文件不存在")
        
        # 读取朝代数据
        with open(DYNASTIES_FILE, "r", encoding="utf-8") as f:
            dynasties_data = json.load(f)
        
        results = []
        search_term = city_name.strip()
        
        # 在所有朝代中搜索城市
        for dynasty in dynasties_data["dynasties"]:
            for city in dynasty.get("majorCities", []):
                # 模糊匹配逻辑
                is_match = (
                    search_term.lower() in city["name"].lower() or
                    city["name"].lower() in search_term.lower() or
                    search_term.lower() in city.get("modernName", "").lower() or
                    city.get("modernName", "").lower() in search_term.lower()
                )
                
                if is_match:
                    results.append({
                        "cityName": city["name"],
                        "modernName": city["modernName"],
                        "dynasty": dynasty["name"],
                        "dynastyId": dynasty["id"],
                        "position": city["position"],
                        "type": city["type"],
                        "importance": city["importance"],
                        "period": dynasty["period"]
                    })
        
        # 去重（按城市名称去重，保留第一个匹配）
        unique_results = []
        seen_names = set()
        for result in results:
            if result["cityName"] not in seen_names:
                unique_results.append(result)
                seen_names.add(result["cityName"])
        
        logger.info(f"搜索到 {len(unique_results)} 个匹配的城市")
        
        return {
            "query": city_name,
            "count": len(unique_results),
            "results": unique_results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"搜索历史城市时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/historical-events/{dynasty_id}")
async def get_historical_events(dynasty_id: str):
    """
    获取朝代历史事件
    
    Args:
        dynasty_id: 朝代ID
        
    Returns:
        朝代的历史事件列表
    """
    try:
        logger.info(f"获取朝代历史事件: {dynasty_id}")
        
        # 先获取朝代数据
        dynasty_response = await get_dynasty_data(dynasty_id)
        dynasty = dynasty_response
        
        # 提取历史事件
        events = dynasty.get("historicalEvents", [])
        
        # 按时间排序
        events.sort(key=lambda x: x["year"])
        
        result = {
            "dynastyId": dynasty_id,
            "dynastyName": dynasty["name"],
            "period": dynasty["period"],
            "events": events,
            "eventCount": len(events)
        }
        
        logger.info(f"成功获取朝代 {dynasty['name']} 的 {len(events)} 个历史事件")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取历史事件时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/categories")
async def get_dynasty_categories():
    """
    获取朝代分类信息
    
    Returns:
        朝代的分类结构
    """
    try:
        logger.info("获取朝代分类信息")
        
        if not os.path.exists(CITY_MAPPINGS_FILE):
            raise HTTPException(status_code=500, detail="城市映射文件不存在")
        
        with open(CITY_MAPPINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        categories = data.get("dynastyCategories", {})
        
        logger.info(f"成功获取 {len(categories)} 个朝代分类")
        return {
            "categories": categories,
            "count": len(categories)
        }
        
    except Exception as e:
        logger.error(f"获取朝代分类时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/quick-search")
async def quick_search(query: str):
    """
    快速搜索接口，支持朝代和城市的联合搜索
    
    Args:
        query: 搜索关键词
        
    Returns:
        朝代和城市的搜索结果
    """
    try:
        logger.info(f"快速搜索: {query}")
        
        if not query or len(query.strip()) < 2:
            return {
                "query": query,
                "dynasties": [],
                "cities": [],
                "total": 0
            }
        
        search_term = query.strip()
        dynasty_results = []
        city_results = []
        
        # 搜索朝代
        try:
            dynasties_response = await get_all_dynasties()
            for dynasty in dynasties_response["dynasties"]:
                if (search_term.lower() in dynasty["name"].lower() or
                    dynasty["name"].lower() in search_term.lower() or
                    search_term.lower() in dynasty["period"].lower()):
                    dynasty_results.append({
                        "id": dynasty["id"],
                        "name": dynasty["name"],
                        "period": dynasty["period"],
                        "type": "dynasty"
                    })
        except Exception as e:
            logger.warning(f"搜索朝代时发生错误: {e}")
        
        # 搜索城市
        try:
            city_response = await search_historical_city(search_term)
            for city in city_response["results"]:
                city_results.append({
                    "cityName": city["cityName"],
                    "modernName": city["modernName"],
                    "dynasty": city["dynasty"],
                    "dynastyId": city["dynastyId"],
                    "position": city["position"],
                    "type": "city"
                })
        except Exception as e:
            logger.warning(f"搜索城市时发生错误: {e}")
        
        result = {
            "query": query,
            "dynasties": dynasty_results,
            "cities": city_results,
            "total": len(dynasty_results) + len(city_results)
        }
        
        logger.info(f"快速搜索完成: {result['total']} 个结果")
        return result
        
    except Exception as e:
        logger.error(f"快速搜索时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/health")
async def health_check():
    """
    朝代API健康检查
    
    Returns:
        API状态信息
    """
    try:
        # 检查数据文件是否存在
        dynasties_exists = os.path.exists(DYNASTIES_FILE)
        mappings_exists = os.path.exists(CITY_MAPPINGS_FILE)
        
        # 尝试读取数据
        dynasty_count = 0
        city_count = 0
        
        if dynasties_exists:
            with open(DYNASTIES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                dynasty_count = len(data.get("dynasties", []))
        
        if mappings_exists:
            with open(CITY_MAPPINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                city_count = len(data.get("allHistoricalCities", []))
        
        return {
            "status": "healthy",
            "timestamp": "2025-12-26T06:44:00Z",
            "data_files": {
                "dynasties": dynasties_exists,
                "city_mappings": mappings_exists
            },
            "data_counts": {
                "dynasties": dynasty_count,
                "historical_cities": city_count
            },
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"健康检查时发生错误: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2025-12-26T06:44:00Z"
        }