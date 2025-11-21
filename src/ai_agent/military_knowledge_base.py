# src/ai_agent/military_knowledge_base.py
import json
import os
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

# 设置日志
logger = logging.getLogger(__name__)

@dataclass
class Battle:
    name: str
    date: str
    location: str
    participants: List[str]
    outcome: str
    significance: str
    casualties: Dict[str, str]  # 修正：使用字符串而不是整数
    tactics: List[str]
    sources: List[str]

@dataclass
class Weapon:
    name: str
    type: str
    era: str
    country: str
    specifications: Dict[str, str]
    historical_use: List[str]
    impact: str
    sources: List[str]

class MilitaryKnowledgeBase:
    def __init__(self, knowledge_base_path: str = "knowledge_base"):
        self.knowledge_base_path = knowledge_base_path
        # 修正：使用 self.knowledge_base_path 而不是 self.data_dir
        self.battles = self._load_battles()
        self.weapons = self._load_weapons()
        self.figures = self._load_figures()
    
    def _load_battles(self) -> Dict[str, Battle]:
        """加载战役数据"""
        battles = {}
        
        # 修正：检查目录是否存在，否则使用 JSON 文件
        battles_dir = os.path.join(self.knowledge_base_path, "military_data")
        battles_file = os.path.join(self.knowledge_base_path, "military_data", "battles.json")
        
        if os.path.exists(battles_file):
            # 从单个 JSON 文件加载
            try:
                with open(battles_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # 处理不同格式的数据
                if isinstance(data, dict):
                    if 'major_battles' in data:
                        battles_list = data['major_battles']
                    elif 'battles' in data:
                        battles_list = data['battles']
                    else:
                        battles_list = [data] if isinstance(data, dict) else []
                elif isinstance(data, list):
                    battles_list = data
                else:
                    battles_list = []
                
                for battle_data in battles_list:
                    if isinstance(battle_data, dict):
                        battle = Battle(
                            name=battle_data.get('name', ''),
                            date=battle_data.get('date', ''),
                            location=battle_data.get('location', ''),
                            participants=battle_data.get('participants', []),
                            outcome=battle_data.get('outcome', ''),
                            significance=battle_data.get('significance', ''),
                            casualties=battle_data.get('casualties', {}),
                            tactics=battle_data.get('tactics', []),
                            sources=battle_data.get('sources', [])
                        )
                        battles[battle.name.lower()] = battle
            except json.JSONDecodeError as e:
                logger.error(f"战役数据 JSON 解析错误: {e}")
            except Exception as e:
                logger.error(f"加载战役数据失败: {e}")
        else:
            logger.warning(f"战役数据文件未找到: {battles_file}")
        
        return battles
    
    def _load_weapons(self) -> Dict[str, Weapon]:
        """加载武器数据"""
        weapons = {}
        
        # 修正：检查目录是否存在，否则使用 JSON 文件
        weapons_dir = os.path.join(self.knowledge_base_path, "weapon_data")
        weapons_file = os.path.join(self.knowledge_base_path, "weapon_data", "tanks.json")
        
        if os.path.exists(weapons_file):
            # 从单个 JSON 文件加载
            try:
                with open(weapons_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # 处理不同格式的数据
                if isinstance(data, dict):
                    if 'tanks' in data:
                        weapons_list = data['tanks']
                    elif 'weapons' in data:
                        weapons_list = data['weapons']
                    else:
                        weapons_list = [data] if isinstance(data, dict) else []
                elif isinstance(data, list):
                    weapons_list = data
                else:
                    weapons_list = []
                
                for weapon_data in weapons_list:
                    if isinstance(weapon_data, dict):
                        weapon = Weapon(
                            name=weapon_data.get('name', ''),
                            type=weapon_data.get('type', ''),
                            era=weapon_data.get('era', ''),
                            country=weapon_data.get('country', ''),
                            specifications=weapon_data.get('specifications', {}),
                            historical_use=weapon_data.get('historical_use', []),
                            impact=weapon_data.get('impact', ''),
                            sources=weapon_data.get('sources', [])
                        )
                        weapons[weapon.name.lower()] = weapon
            except json.JSONDecodeError as e:
                logger.error(f"武器数据 JSON 解析错误: {e}")
            except Exception as e:
                logger.error(f"加载武器数据失败: {e}")
        else:
            logger.warning(f"武器数据文件未找到: {weapons_file}")
        
        return weapons
    
    def _load_figures(self) -> Dict[str, dict]:
        """加载历史人物数据"""
        figures = {}
        
        # 修正：使用 self.knowledge_base_path 而不是 self.data_dir
        figures_file = os.path.join(self.knowledge_base_path, "historical_facts", "historical_figures.json")
        
        if os.path.exists(figures_file):
            try:
                with open(figures_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # 处理不同格式的数据
                if isinstance(data, dict):
                    if 'historical_figures' in data:
                        figures_list = data['historical_figures']
                    elif 'figures' in data:
                        figures_list = data['figures']
                    else:
                        figures_list = [data] if isinstance(data, dict) else []
                elif isinstance(data, list):
                    figures_list = data
                else:
                    figures_list = []
                
                for figure in figures_list:
                    if isinstance(figure, dict):  # 确保 figure 是字典
                        name = figure.get('name', '').lower()
                        if name:  # 只有当名字不为空时才添加
                            figures[name] = figure
            except json.JSONDecodeError as e:
                logger.error(f"历史人物数据 JSON 解析错误: {e}")
            except Exception as e:
                logger.error(f"加载历史人物数据失败: {e}")
        else:
            logger.warning(f"历史人物数据文件未找到: {figures_file}")
        
        return figures
    
    def search_battle(self, query: str) -> Optional[Battle]:
        """搜索战役信息"""
        query_lower = query.lower()
        for name, battle in self.battles.items():
            if query_lower in name or query_lower in battle.name.lower():
                return battle
        return None
    
    def search_weapon(self, query: str) -> Optional[Weapon]:
        """搜索武器信息"""
        query_lower = query.lower()
        for name, weapon in self.weapons.items():
            if query_lower in name or query_lower in weapon.name.lower():
                return weapon
        return None
    
    def search_figure(self, query: str) -> Optional[dict]:
        """搜索历史人物信息"""
        query_lower = query.lower()
        for name, figure in self.figures.items():
            if query_lower in name or query_lower in figure.get('name', '').lower():
                return figure
        return None
    
    def get_battle_analysis(self, battle_name: str) -> Dict[str, str]:
        """获取战役分析"""
        battle = self.search_battle(battle_name)
        if not battle:
            return {"error": f"未找到关于 {battle_name} 的战役信息"}
        
        return {
            "name": battle.name,
            "date": battle.date,
            "location": battle.location,
            "participants": ", ".join(battle.participants),
            "outcome": battle.outcome,
            "significance": battle.significance,
            "casualties": str(battle.casualties),
            "tactics": ", ".join(battle.tactics),
            "sources": ", ".join(battle.sources)
        }
    
    def get_weapon_evolution(self, weapon_name: str) -> Dict[str, str]:
        """获取武器演化信息"""
        weapon = self.search_weapon(weapon_name)
        if not weapon:
            return {"error": f"未找到关于 {weapon_name} 的武器信息"}
        
        return {
            "name": weapon.name,
            "type": weapon.type,
            "era": weapon.era,
            "country": weapon.country,
            "specifications": str(weapon.specifications),
            "historical_use": ", ".join(weapon.historical_use),
            "impact": weapon.impact,
            "sources": ", ".join(weapon.sources)
        }
    
    def get_figure_info(self, figure_name: str) -> Dict[str, str]:
        """获取历史人物信息"""
        figure = self.search_figure(figure_name)
        if not figure:
            return {"error": f"未找到关于 {figure_name} 的历史人物信息"}
        
        return {
            "name": figure.get('name', ''),
            "title": figure.get('title', ''),
            "period": figure.get('period', ''),
            "achievements": ", ".join(figure.get('achievements', [])),
            "description": figure.get('description', ''),
            "id": str(figure.get('id', ''))
        }