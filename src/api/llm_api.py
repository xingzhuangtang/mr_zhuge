# src/api/llm_api.py
"""
LLM API 模块：提供统一的军事历史分析接口（支持主备模型切换）
"""

import logging
from fastapi import FastAPI, Request
from src.ai_agent.model_service import get_model_service

# 配置日志
logger = logging.getLogger(__name__)

# 初始化 FastAPI 子应用
app = FastAPI(title="LLM Military Analysis API")

@app.post("/military-analysis")
async def military_analysis(request: Request):
    """
    军事历史问题分析接口
    前端应发送: {"prompt": "用户输入的问题"}
    返回: {"response": "AI 回答内容"}
    """
    try:
        data = await request.json()
        prompt = data.get("prompt", "").strip()

        if not prompt:
            return {"response": "请输入您的军事历史问题。"}

        logger.info(f"正在进行军事分析: {prompt[:50]}...")

        # 获取模型服务（已配置为主备切换）
        model_service = get_model_service()

        # 构建系统提示词
        system_prompt = "你是一位精通中国古代和近代战争史的军事专家，请以专业、严谨、条理清晰的方式回答用户的问题。"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        # 调用模型
        content = await model_service.chat_completion(messages)
        
        logger.info("分析完成")
        return {"response": content}

    except Exception as e:
        logger.exception("调用大模型时发生异常:")
        return {"response": f"服务暂时不可用: {str(e)}"}