# src/api/game_battle_api.py
"""
游戏化战役API - 专门为《全面战争》风格的战役可视化提供支持
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
import json
import os
from pathlib import Path
import logging

router = APIRouter(prefix="/api/v1/game", tags=["game-battle"])
logger = logging.getLogger(__name__)

# 路径配置
BASE_DIR = Path(__file__).parent.parent.parent
BATTLES_DB_PATH = BASE_DIR / "knowledge_base" / "military_data" / "historical_battles.json"
UNITS_DB_PATH = BASE_DIR / "static" / "js" / "unit-system.js"

class GameBattleAPI:
    """游戏化战役API服务"""
    
    def __init__(self):
        self.battles_data = self._load_battles_data()
        self.units_data = self._load_units_data()
    
    def _load_battles_data(self) -> Dict[str, Any]:
        """加载战役数据"""
        try:
            with open(BATTLES_DB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"加载战役数据失败: {e}")
            return {"battles": {}}
    
    def _load_units_data(self) -> Dict[str, Any]:
        """加载兵种数据"""
        try:
            # 从JavaScript文件中提取数据
            with open(UNITS_DB_PATH, 'r', encoding='utf-8') as f:
                content = f.read()
                # 简单的数据提取，实际应用中可以使用更复杂的方法
                return {
                    "ancient_units": {},
                    "medieval_units": {},
                    "modern_units": {},
                    "unit_enums": {}
                }
        except Exception as e:
            logger.error(f"加载兵种数据失败: {e}")
            return {}

game_api = GameBattleAPI()

@router.get("/battles")
async def get_available_battles():
    """获取所有可用战役"""
    try:
        battles = []
        for period, period_battles in game_api.battles_data.get("battles", {}).items():
            for battle_id, battle_info in period_battles.items():
                battles.append({
                    "battle_id": battle_id,
                    "name": battle_info["name"],
                    "period": battle_info["historical_period"],
                    "year": battle_info["year"],
                    "location": battle_info["location"],
                    "participants": [p["name"] for p in battle_info["participants"]],
                    "outcome": battle_info.get("outcome", {})
                })
        return {"battles": battles}
    except Exception as e:
        logger.error(f"获取战役列表失败: {e}")
        raise HTTPException(status_code=500, detail="获取战役列表失败")

@router.get("/battle/{battle_id}")
async def get_battle_details(battle_id: str):
    """获取特定战役的详细信息"""
    try:
        # 在所有历史时期中搜索战役
        for period, period_battles in game_api.battles_data.get("battles", {}).items():
            if battle_id in period_battles:
                battle_data = period_battles[battle_id]
                
                # 添加游戏化数据
                battle_data["game_info"] = get_game_info(battle_data)
                battle_data["unit_info"] = get_unit_info_for_battle(battle_data)
                battle_data["tactical_analysis"] = get_tactical_analysis(battle_data)
                
                return battle_data
        
        raise HTTPException(status_code=404, detail=f"战役 {battle_id} 不存在")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取战役详情失败: {e}")
        raise HTTPException(status_code=500, detail="获取战役详情失败")

@router.get("/units/{period}")
async def get_units_by_period(period: str):
    """根据历史时期获取兵种信息"""
    try:
        valid_periods = ["ancient", "medieval", "modern"]
        if period not in valid_periods:
            raise HTTPException(status_code=400, detail=f"不支持的历史时期: {period}")
        
        units_key = f"{period}_units"
        return game_api.units_data.get(units_key, {})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取兵种数据失败: {e}")
        raise HTTPException(status_code=500, detail="获取兵种数据失败")

@router.post("/battle/{battle_id}/analyze")
async def analyze_battle_tactics(battle_id: str, analysis_request: Dict[str, Any]):
    """分析战役战术"""
    try:
        battle_data = await get_battle_details(battle_id)
        
        analysis_type = analysis_request.get("type", "general")
        focus_areas = analysis_request.get("focus_areas", [])
        
        if analysis_type == "tactical":
            return analyze_tactical_elements(battle_data, focus_areas)
        elif analysis_type == "formation":
            return analyze_formations(battle_data)
        elif analysis_type == "terrain":
            return analyze_terrain_advantage(battle_data)
        else:
            return analyze_general_tactics(battle_data)
            
    except Exception as e:
        logger.error(f"战术分析失败: {e}")
        raise HTTPException(status_code=500, detail="战术分析失败")

@router.get("/battle/{battle_id}/formation/{formation_name}")
async def get_formation_animation(formation_name: str, battle_id: str):
    """获取队形动画数据"""
    try:
        battle_data = await get_battle_details(battle_id)
        
        formations = {
            "phalanx": {
                "description": "希腊方阵 - 密集的重装步兵队形",
                "animation_data": {
                    "setup_time": 30,
                    "movement_speed": 2,
                    "combat_bonus": {"defense": 3, "melee": 2},
                    "terrain_requirements": ["flat", "open"]
                },
                "visual_effects": [
                    "shield_wall_formation",
                    "spear_pikes_display",
                    "coordinated_movement"
                ]
            },
            "shield_wall": {
                "description": "盾牌墙 - 防御性密集队形",
                "animation_data": {
                    "setup_time": 20,
                    "movement_speed": 1,
                    "combat_bonus": {"defense": 5, "ranged": 2},
                    "terrain_requirements": ["defensive_position"]
                },
                "visual_effects": [
                    "shield_formation",
                    "defensive_posture",
                    "counter_attack_ready"
                ]
            },
            "cavalry_wedge": {
                "description": "骑兵楔形阵 - 突击队形",
                "animation_data": {
                    "setup_time": 15,
                    "movement_speed": 8,
                    "combat_bonus": {"charge": 8, "speed": 5},
                    "terrain_requirements": ["open", "flat"]
                },
                "visual_effects": [
                    "charging_movement",
                    "dust_cloud",
                    "lance_charge"
                ]
            },
            "linear_formation": {
                "description": "线列阵 - 拿破仑时代的标准阵型",
                "animation_data": {
                    "setup_time": 25,
                    "movement_speed": 3,
                    "combat_bonus": {"volley_fire": 4, "discipline": 3},
                    "terrain_requirements": ["open"]
                },
                "visual_effects": [
                    "drill_movement",
                    "volley_fire",
                    "bayonet_charge"
                ]
            },
            "volley": {
                "description": "齐射 - 弓箭手或火枪兵的攻击",
                "animation_data": {
                    "setup_time": 10,
                    "movement_speed": 2,
                    "combat_bonus": {"ranged": 6, "area_damage": 3},
                    "terrain_requirements": ["elevated", "clear_los"]
                },
                "visual_effects": [
                    "projectile_rain",
                    "reload_animation",
                    "aim_adjustment"
                ]
            }
        }
        
        if formation_name not in formations:
            raise HTTPException(status_code=404, detail=f"队形 {formation_name} 不存在")
        
        formation_data = formations[formation_name]
        formation_data["battle_context"] = {
            "battle_name": battle_data["name"],
            "period": battle_data["historical_period"],
            "participants": [p["force_id"] for p in battle_data["participants"]]
        }
        
        return formation_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取队形动画数据失败: {e}")
        raise HTTPException(status_code=500, detail="获取队形动画数据失败")

@router.get("/battle/{battle_id}/effects")
async def get_battle_effects(battle_id: str):
    """获取战役特效配置"""
    try:
        battle_data = await get_battle_details(battle_id)
        
        effects_config = {
            "particle_effects": get_particle_effects_config(battle_data),
            "weather_effects": get_weather_effects_config(battle_data),
            "audio_effects": get_audio_effects_config(battle_data),
            "visual_effects": get_visual_effects_config(battle_data)
        }
        
        return effects_config
        
    except Exception as e:
        logger.error(f"获取战役特效配置失败: {e}")
        raise HTTPException(status_code=500, detail="获取特效配置失败")

@router.post("/battle/{battle_id}/simulate")
async def simulate_battle_scenario(battle_id: str, scenario_request: Dict[str, Any]):
    """模拟战役场景"""
    try:
        battle_data = await get_battle_details(battle_id)
        
        scenario_type = scenario_request.get("type", "default")
        modifications = scenario_request.get("modifications", {})
        
        # 应用场景修改
        modified_battle = apply_scenario_modifications(battle_data, modifications)
        
        # 生成模拟结果
        simulation_result = generate_battle_simulation(modified_battle, scenario_type)
        
        return simulation_result
        
    except Exception as e:
        logger.error(f"战役模拟失败: {e}")
        raise HTTPException(status_code=500, detail="战役模拟失败")

# 辅助函数

def get_game_info(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取战役的游戏化信息"""
    period = battle_data["historical_period"]
    
    game_info = {
        "difficulty_level": "medium",
        "ai_behavior": "historical_accurate",
        "special_rules": [],
        "victory_conditions": {}
    }
    
    # 根据历史时期设置特定规则
    if period == "ancient":
        game_info["special_rules"] = [
            "formation_bonus_system",
            "morale_impact_fire_weapons",
            "terrain_advantage_system"
        ]
    elif period == "medieval":
        game_info["special_rules"] = [
            "feudal_morale_system",
            "cavalry_charge_bonus",
            "castle_wall_defense"
        ]
    elif period == "modern":
        game_info["special_rules"] = [
            "artillery_barrage_system",
            "line_of_sight_rules",
            "mechanized_warfare"
        ]
    
    return game_info

def get_unit_info_for_battle(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取战役中的兵种信息"""
    unit_info = {}
    
    for participant in battle_data.get("participants", []):
        force_id = participant["force_id"]
        unit_info[force_id] = {
            "composition": participant.get("composition", {}),
            "unit_types": participant.get("unit_types", []),
            "tactics": participant.get("tactics", []),
            "morale": participant.get("morale", 5)
        }
    
    return unit_info

def get_tactical_analysis(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取战术分析"""
    return {
        "key_tactics": extract_key_tactics(battle_data),
        "formation_analysis": analyze_formations_in_battle(battle_data),
        "terrain_impact": analyze_terrain_impact(battle_data),
        "historical_significance": battle_data.get("outcome", {}).get("tactical_lessons", [])
    }

def extract_key_tactics(battle_data: Dict[str, Any]) -> List[str]:
    """提取关键战术"""
    tactics = []
    for participant in battle_data.get("participants", []):
        tactics.extend(participant.get("tactics", []))
    return list(set(tactics))

def analyze_formations_in_battle(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析队形使用"""
    formations = {}
    for participant in battle_data.get("participants", []):
        for unit_type in participant.get("unit_types", []):
            formation = unit_type.get("formation", "default")
            if formation not in formations:
                formations[formation] = 0
            formations[formation] += unit_type.get("count", 0)
    return formations

def analyze_terrain_impact(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析地形影响"""
    location = battle_data.get("location", {})
    terrain_type = location.get("terrain_type", "unknown")
    
    terrain_advantages = {
        "river_bank": {
            "advantages": ["natural_barrier", "retreat_advantage", "naval_support"],
            "disadvantages": ["limited_mobility", "bottleneck_risk"]
        },
        "plains": {
            "advantages": ["cavalry_advantage", "open_battlefield", "maneuverability"],
            "disadvantages": ["exposed_position", "defensive_difficulty"]
        },
        "hill_plains": {
            "advantages": ["elevated_defense", "command_position", "strategic_overlook"],
            "disadvantages": ["limited_cavalry_movement", "siege_complications"]
        },
        "hills_and_plains": {
            "advantages": ["varied_tactics", "strategic_flexibility", "defensive_options"],
            "disadvantages": ["complex_coordination", "supply_challenges"]
        }
    }
    
    return terrain_advantages.get(terrain_type, {"advantages": [], "disadvantages": []})

def analyze_tactical_elements(battle_data: Dict[str, Any], focus_areas: List[str]) -> Dict[str, Any]:
    """分析战术元素"""
    analysis = {
        "offensive_tactics": [],
        "defensive_tactics": [],
        "innovative_elements": [],
        "success_factors": []
    }
    
    # 分析进攻战术
    for participant in battle_data.get("participants", []):
        for tactic in participant.get("tactics", []):
            if "charge" in tactic or "assault" in tactic or "attack" in tactic:
                analysis["offensive_tactics"].append({
                    "tactic": tactic,
                    "user": participant["name"],
                    "effectiveness": "待评估"
                })
            elif "defense" in tactic or "shield" in tactic or "wall" in tactic:
                analysis["defensive_tactics"].append({
                    "tactic": tactic,
                    "user": participant["name"],
                    "effectiveness": "待评估"
                })
    
    return analysis

def analyze_formations(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析队形使用"""
    return {
        "formation_usage": analyze_formations_in_battle(battle_data),
        "formation_effectiveness": "待评估",
        "recommended_formations": ["default_analysis"]
    }

def analyze_terrain_advantage(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析地形优势"""
    return {
        "terrain_type": battle_data.get("location", {}).get("terrain_type"),
        "terrain_impact": analyze_terrain_impact(battle_data),
        "advantage_distribution": "待评估"
    }

def analyze_general_tactics(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """通用战术分析"""
    return {
        "tactical_summary": "基于历史记录的战术分析",
        "key_moments": extract_key_moments(battle_data),
        "lessons_learned": battle_data.get("outcome", {}).get("tactical_lessons", [])
    }

def extract_key_moments(battle_data: Dict[str, Any]) -> List[str]:
    """提取关键时刻"""
    moments = []
    for event in battle_data.get("battle_timeline", []):
        if event.get("event_type") in ["decisive_maneuver", "retreat", "victory"]:
            moments.append(event.get("description", ""))
    return moments

def get_particle_effects_config(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取粒子效果配置"""
    effects = {
        "explosions": {"enabled": True, "intensity": "medium"},
        "fire": {"enabled": True, "intensity": "high"},
        "smoke": {"enabled": True, "intensity": "medium"},
        "dust": {"enabled": True, "intensity": "low"}
    }
    
    # 根据战役类型调整效果
    battle_name = battle_data.get("name", "")
    if "火" in battle_name or "fire" in battle_name.lower():
        effects["fire"]["intensity"] = "very_high"
        effects["smoke"]["intensity"] = "high"
    
    return effects

def get_weather_effects_config(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取天气效果配置"""
    return {
        "weather_type": "clear",
        "wind_speed": 0,
        "visibility": "full",
        "effects": {
            "fog": False,
            "rain": False,
            "snow": False
        }
    }

def get_audio_effects_config(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取音效配置"""
    return {
        "battle_sounds": {
            "sword_clash": {"volume": 0.7, "enabled": True},
            "archer_volley": {"volume": 0.8, "enabled": True},
            "cavalry_charge": {"volume": 0.9, "enabled": True},
            "explosions": {"volume": 0.6, "enabled": True}
        },
        "ambient_sounds": {
            "wind": {"volume": 0.3, "enabled": True},
            "birds": {"volume": 0.2, "enabled": True}
        }
    }

def get_visual_effects_config(battle_data: Dict[str, Any]) -> Dict[str, Any]:
    """获取视觉效果配置"""
    return {
        "lighting": {"dynamic": True, "shadows": True},
        "post_processing": {
            "bloom": True,
            "color_grading": True,
            "anti_aliasing": "high"
        },
        "animations": {
            "unit_movement": True,
            "formation_changes": True,
            "weather_effects": True
        }
    }

def apply_scenario_modifications(battle_data: Dict[str, Any], modifications: Dict[str, Any]) -> Dict[str, Any]:
    """应用场景修改"""
    modified_battle = battle_data.copy()
    
    # 应用兵力修改
    if "unit_modifications" in modifications:
        for force_id, changes in modifications["unit_modifications"].items():
            for participant in modified_battle["participants"]:
                if participant["force_id"] == force_id:
                    for unit_type, count in changes.items():
                        participant["composition"][unit_type] = count
    
    # 应用天气修改
    if "weather_changes" in modifications:
        for event in modified_battle.get("battle_timeline", []):
            if "weather" in modifications["weather_changes"]:
                event["effects"]["weather"] = modifications["weather_changes"]["weather"]
    
    return modified_battle

def generate_battle_simulation(battle_data: Dict[str, Any], scenario_type: str) -> Dict[str, Any]:
    """生成战役模拟结果"""
    # 简化的模拟逻辑
    simulation_result = {
        "scenario_type": scenario_type,
        "original_outcome": battle_data.get("outcome", {}),
        "modified_scenarios": [
            {
                "name": "Scenario A",
                "description": "假设分析结果",
                "probability": 0.7,
                "outcome": "victor_determined"
            }
        ],
        "tactical_analysis": get_tactical_analysis(battle_data),
        "recommendations": [
            "保持历史准确性",
            "考虑地形因素",
            "重视士气影响"
        ]
    }
    
    return simulation_result

# 注册路由
def register_routes(app):
    """注册游戏化战役API路由"""
    app.include_router(router)