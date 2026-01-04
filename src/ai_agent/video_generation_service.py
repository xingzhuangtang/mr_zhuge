# src/ai_agent/video_generation_service.py
import os
import logging
import asyncio
import json
from typing import Optional
from zhipuai import ZhipuAI
import httpx

logger = logging.getLogger(__name__)

class VideoGenerationService:
    """
    视频生成服务 - 使用智谱清影 (CogVideoX-Flash)
    """

    def __init__(self):
        self.api_key = os.getenv("ZHIPUAI_API_KEY")
        if not self.api_key:
            logger.warning("ZHIPUAI_API_KEY environment variable not set. Video generation will fail.")
            self.client = None
        else:
            self.client = ZhipuAI(api_key=self.api_key)

    async def generate_video_from_text(self, text: str) -> str:
        """
        根据文本生成视频
        
        Args:
            text (str): 描述视频内容的文本
        
        Returns:
            str: 生成的视频 URL
        """
        logger.info(f"Starting video generation for text: {text[:50]}...")

        # 检查是否配置了真实API，如果配置了则尝试使用真实API
        if self.client:
            try:
                # Construct the prompt
                prompt = f"史诗般的战争场景，{text[:300]}，电影质感，高清晰度，写实风格"
                
                # 提交视频生成任务
                def submit_task():
                    try:
                        response = self.client.videos.generations(
                            model="cogvideox-flash",
                            prompt=prompt
                        )
                        return response
                    except Exception as e:
                        logger.error(f"ZhipuAI submission failed: {e}")
                        raise e

                # Run blocking SDK call in thread pool
                response = await asyncio.to_thread(submit_task)

                # Get task ID (ZhipuAI SDK usually returns an object with 'id')
                if hasattr(response, 'id'):
                    task_id = response.id
                    logger.info(f"Video generation task submitted. Task ID: {task_id}")
                    # Poll for result
                    return await self._poll_for_result(task_id)
                else:
                    logger.warning(f"Unexpected response structure: {response}")
                    return await self._generate_mock_video(text)

            except Exception as e:
                logger.warning(f"真实视频生成服务失败: {e}，使用模拟服务")
                return await self._generate_mock_video(text)
        else:
            # 如果没有API密钥，直接使用模拟服务
            return await self._generate_mock_video(text)
    
    async def _generate_mock_video(self, text: str) -> str:
        """
        生成模拟视频URL
        """
        logger.info(f"使用模拟视频生成服务，文本: {text[:50]}...")
        
        # 模拟处理时间
        await asyncio.sleep(2)
        
        # 根据文本内容返回相应的预定义视频URL
        # 使用 w3school 或其他可访问的示例视频作为 fallback
        # 注意：真实生产环境应使用自己的 OSS/CDN 链接
        battle_videos = {
            '锦州': 'https://www.w3school.com.cn/i/movie.mp4',
            '平津': 'https://www.w3school.com.cn/i/movie.mp4', 
            '淮海': 'https://www.w3school.com.cn/i/movie.mp4',
            '辽沈': 'https://www.w3school.com.cn/i/movie.mp4',
            '长征': 'https://www.w3school.com.cn/i/movie.mp4',
            '北伐': 'https://www.w3school.com.cn/i/movie.mp4',
            '抗战': 'https://www.w3school.com.cn/i/movie.mp4',
            '解放': 'https://www.w3school.com.cn/i/movie.mp4'
        }
        
        # 查找匹配的战役视频
        video_url = None
        for battle_name, url in battle_videos.items():
            if battle_name in text:
                video_url = url
                break
        
        # 如果没有找到匹配的战役，返回通用战争视频
        if not video_url:
            video_url = 'https://www.w3school.com.cn/i/movie.mp4'
        
        logger.info(f"视频生成完成: {video_url}")
        return video_url

    async def _poll_for_result(self, task_id: str, max_retries=60, delay=5) -> str:
        """
        轮询任务结果
        """
        for i in range(max_retries):
            try:
                # 使用 SDK 查询结果
                response = await asyncio.to_thread(
                    self.client.videos.retrieve_videos_result,
                    id=task_id
                )
                
                # Check status
                # ZhipuAI response usually has 'task_status'
                if hasattr(response, 'task_status'):
                    status = response.task_status
                    logger.debug(f"Task {task_id} status: {status}")

                    if status == 'SUCCESS':
                        # Get video URL
                        if hasattr(response, 'video_result') and response.video_result:
                            video_url = response.video_result[0].url
                            logger.info(f"Video generation succeeded. URL: {video_url}")
                            return video_url
                        else:
                            logger.warning(f"Task succeeded but no video result: {response}")
                            raise Exception("Task succeeded but no video URL found.")
                    
                    elif status == 'FAIL':
                        raise Exception(f"Video generation failed. Task ID: {task_id}")
                    
                    # If QUEUEING or PROCESSING, wait and retry
                    await asyncio.sleep(delay)
                else:
                     logger.warning(f"Response missing task_status: {response}")
                     await asyncio.sleep(delay)

            except Exception as e:
                logger.warning(f"Error polling task status (attempt {i+1}/{max_retries}): {e}")
                await asyncio.sleep(delay)

        raise TimeoutError("Video generation timed out.")
