# src/ai_agent/image_generation_service.py
"""
独立的图像生成服务类
可被 LLM Agent、多模态模块等调用
"""

import os
import logging
from typing import Optional, List, Dict
import httpx
import json

logger = logging.getLogger(__name__)

class ImageGenerationService:
    """
    军事历史图像生成服务
    支持多种图片源：历史图片库、艺术作品、地形图等
    """

    def __init__(self):
        # 军事历史图片库
        self.military_image_sources = {
            'terrain': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'ancient_warfare': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'medieval_battle': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'modern_battle': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'naval_battle': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'tactical_map': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'artillery': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
            'cavalry': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
        }
        
        # 历史图片的占位符服务
        self.use_mock = True  # 设为 False 后可切换真实 API

    async def generate(
        self,
        prompt: str,
        style: str = "realistic",
        size: str = "1024x1024"
    ) -> str:
        """
        生成图像并返回 URL
        
        Args:
            prompt: 文生图提示词（中文战役描述）
            style: 风格（"realistic", "oil-painting", "sketch" 等）
            size: 图像尺寸
            
        Returns:
            图像 URL 字符串
        """
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty")

        if self.use_mock:
            # 返回军事历史相关的占位图
            return await self._generate_military_historical_image(prompt, style)
        else:
            # TODO: 接入真实图像生成 API（见下方注释）
            return await self._call_real_image_api(prompt, style, size)

    async def _call_real_image_api(
        self,
        prompt: str,
        style: str,
        size: str
    ) -> str:
        """
        【预留】真实图像生成 API 调用
        示例：阿里通义万相、Stability AI、DALL·E 等
        """
        # 示例：阿里云百炼（需安装 dashscope）
        # import dashscope
        # from dashscope import ImageSynthesis
        # dashscope.api_key = os.getenv("ALIBABA_BAILIAN_API_KEY")
        # 
        # response = ImageSynthesis.call(
        #     model="wanx-v1",
        #     prompt=prompt,
        #     size=size
        # )
        # if response.status_code == 200:
        #     return response.output.results[0].url
        # else:
        #     raise Exception(f"Image generation failed: {response.message}")

        # 示例：OpenAI DALL·E（需 httpx + API key）
        # import httpx
        # headers = {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"}
        # json_data = {"model": "dall-e-3", "prompt": prompt, "n": 1, "size": "1024x1024"}
        # resp = await httpx.AsyncClient().post(
        #     "https://api.openai.com/v1/images/generations",
        #     headers=headers,
        #     json=json_data
        # )
        # return resp.json()["data"][0]["url"]

        raise NotImplementedError("Real image API not implemented yet")

    async def _generate_military_historical_image(self, prompt: str, style: str = "realistic") -> str:
        """
        根据战役内容智能生成历史图片URL
        """
        prompt_lower = prompt.lower()
        
        # 地形地貌图片
        if any(keyword in prompt_lower for keyword in ['地形', '地貌', '平原', '山地', '河流', '海岸']):
            return "https://picsum.photos/400/250?random=terrain" + str(hash(prompt) % 1000)
        
        # 古代战争图片
        elif any(keyword in prompt_lower for keyword in ['古代', '三国', '赤壁', '罗马', '希腊', '弓箭手', '步兵']):
            return "https://picsum.photos/400/250?random=ancient" + str(hash(prompt) % 1000)
        
        # 中世纪战争图片
        elif any(keyword in prompt_lower for keyword in ['中世纪', '骑士', '城堡', '黑斯廷斯', '诺曼', '长剑']):
            return "https://picsum.photos/400/250?random=medieval" + str(hash(prompt) % 1000)
        
        # 近代战争图片
        elif any(keyword in prompt_lower for keyword in ['近代', '火枪', '大炮', '滑铁卢', '拿破仑', '步兵方阵']):
            return "https://picsum.photos/400/250?random=modern" + str(hash(prompt) % 1000)
        
        # 水战图片
        elif any(keyword in prompt_lower for keyword in ['水战', '海军', '战船', '赤壁', '舰队']):
            return "https://picsum.photos/400/250?random=naval" + str(hash(prompt) % 1000)
        
        # 战术图示
        elif any(keyword in prompt_lower for keyword in ['战术', '战略', '部署', '阵型']):
            return "https://picsum.photos/400/250?random=tactical" + str(hash(prompt) % 1000)
        
        # 默认军事图片
        else:
            return "https://picsum.photos/400/250?random=military" + str(hash(prompt) % 1000)

    async def search_battle_images(self, battle_name: str, categories: List[str] = None) -> List[Dict]:
        """
        搜索战役相关的历史图片
        
        Args:
            battle_name: 战役名称
            categories: 图片类别列表 ['terrain', 'troops', 'tactics', 'artifacts']
            
        Returns:
            图片信息列表，每个元素包含url和caption
        """
        if not categories:
            categories = ['terrain', 'troops', 'tactics']
        
        images = []
        
        for category in categories:
            if category == 'terrain':
                # 地形地貌图片
                images.append({
                    'url': f"https://picsum.photos/400/250?random=terrain_{hash(battle_name) % 1000}",
                    'caption': f'{battle_name}战场地形地貌',
                    'category': 'terrain'
                })
            elif category == 'troops':
                # 军队部署图片
                images.append({
                    'url': f"https://picsum.photos/400/250?random=troops_{hash(battle_name) % 1000}",
                    'caption': f'{battle_name}参战双方军队',
                    'category': 'troops'
                })
            elif category == 'tactics':
                # 战术图示
                images.append({
                    'url': f"https://picsum.photos/400/250?random=tactics_{hash(battle_name) % 1000}",
                    'caption': f'{battle_name}战术部署示意图',
                    'category': 'tactics'
                })
            elif category == 'artifacts':
                # 文物兵器图片
                images.append({
                    'url': f"https://picsum.photos/400/250?random=artifacts_{hash(battle_name) % 1000}",
                    'caption': f'{battle_name}相关文物兵器',
                    'category': 'artifacts'
                })
        
        return images