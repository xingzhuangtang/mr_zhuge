from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
from typing import List, Dict, Any

router = APIRouter()

BATTLE_CACHE_DIR = "generated_content/battles"

class BattleResponse(BaseModel):
    battle_metadata: Dict[str, Any]
    military_forces: List[Dict[str, Any]]
    battle_timeline: List[Dict[str, Any]]
    terrain_data: Dict[str, Any]

@router.get("/battle/{battle_name}", response_model=BattleResponse)
async def get_battle_data(battle_name: str):
    normalized_name = battle_name.lower().replace(" ", "_").replace("之战", "")
    cache_path = os.path.join(BATTLE_CACHE_DIR, f"{normalized_name}.json")
    
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # 内置示例：赤壁之战
    if "chibi" in normalized_name or "赤壁" in battle_name:
        sample_data = {
            "battle_metadata": {
                "id": "chibi_208",
                "name": "赤壁之战",
                "period": "东汉末年",
                "year": 208,
                "location": {"lat": 29.7, "lon": 113.9},
                "duration_days": 30
            },
            "military_forces": [
                {
                    "force_id": "cao_cao",
                    "name": "曹军",
                    "commander": "曹操",
                    "troop_strength": 200000,
                    "composition": {"infantry": 150000, "cavalry": 30000, "navy": 20000},
                    "initial_deployment": [[113.88, 29.71]]
                },
                {
                    "force_id": "sun_liu",
                    "name": "孙刘联军",
                    "commander": "周瑜、刘备",
                    "troop_strength": 50000,
                    "composition": {"infantry": 30000, "cavalry": 5000, "navy": 15000},
                    "initial_deployment": [[113.92, 29.75]]
                }
            ],
            "battle_timeline": [
                {
                    "event_id": "fire_attack",
                    "timestamp": "208-12-07T20:00:00",
                    "type": "stratagem",
                    "participants": ["sun_liu"],
                    "location": {"lat": 29.75, "lon": 113.90},
                    "description": "黄盖诈降，火攻曹营",
                    "animation_script": "fire_effect"
                }
            ],
            "terrain_data": {
                "elevation": "",
                "rivers": [{"name": "长江", "path": [[113.8, 29.7], [114.0, 29.8]]}],
                "vegetation": "sparse",
                "historical_features": [{"type": "camp", "location": [113.88, 29.71]}]
            }
        }

        os.makedirs(BATTLE_CACHE_DIR, exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)

        return sample_data

    raise HTTPException(status_code=404, detail="战役未找到，请尝试'赤壁之战'")