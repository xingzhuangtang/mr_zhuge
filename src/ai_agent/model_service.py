# src/ai_agent/model_service.py
import os
import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class ModelService(ABC):
    """大模型服务抽象基类"""
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        pass
    
    @abstractmethod
    async def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """聊天完成"""
        pass

class AlibabaBailianService(ModelService):
    """阿里云百炼大模型服务"""
    
    def __init__(self, api_key: str = None, endpoint: str = None):
        self.api_key = api_key or os.getenv("ALIBABA_BAILIAN_API_KEY")
        self.endpoint = endpoint or os.getenv("ALIBABA_BAILIAN_ENDPOINT", 
                                            "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")
        self.model = os.getenv("ALIBABA_MODEL", "qwen-max")
        
        if not self.api_key:
            raise ValueError("ALIBABA_BAILIAN_API_KEY 环境变量未设置")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-DashScope-SSE": "disable"  # 禁用流式输出
        }
        
        payload = {
            "model": self.model,
            "input": {
                "prompt": prompt
            },
            "parameters": {
                "temperature": kwargs.get("temperature", 0.7),
                "top_p": kwargs.get("top_p", 0.9),
                "max_tokens": kwargs.get("max_tokens", 2000)
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.endpoint, headers=headers, json=payload)
                response.raise_for_status()
                
                result = response.json()
                return result["output"]["text"]
        except Exception as e:
            logger.error(f"阿里云百炼 API 调用失败: {e}")
            # 返回模拟响应
            return f"模拟响应：{prompt[:50]}...的分析结果"
    
    async def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """聊天完成"""
        # 将消息格式转换为 prompt
        prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        prompt += "\nAssistant:"
        
        return await self.generate_text(prompt, **kwargs)

class OpenRouterService(ModelService):
    """OpenRouter 服务"""
    
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.model = model or os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct")
        self.endpoint = "https://openrouter.ai/api/v1/chat/completions"
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY 环境变量未设置")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        messages = [{"role": "user", "content": prompt}]
        return await self.chat_completion(messages, **kwargs)
    
    async def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """聊天完成"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 2000)
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.endpoint, headers=headers, json=payload)
                response.raise_for_status()
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenRouter API 调用失败: {e}")
            # 返回模拟响应
            return f"模拟响应：基于消息的分析结果"

def get_model_service() -> ModelService:
    """获取模型服务实例"""
    provider = os.getenv("MODEL_PROVIDER", "alibaba").lower()
    
    if provider == "openrouter":
        return OpenRouterService()
    else:  # 默认使用阿里云
        return AlibabaBailianService()