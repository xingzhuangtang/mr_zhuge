# src/api/llm_api.py
"""
LLM API 模块：调用阿里云通义千问进行军事历史分析
"""

import os
import logging
from fastapi import FastAPI, Request
import dashscope
from dashscope import Generation

# 配置日志
logger = logging.getLogger(__name__)

# 初始化 FastAPI 子应用
app = FastAPI(title="LLM Military Analysis API")

# 从环境变量加载配置
DASHSCOPE_API_KEY = os.getenv("ALIBABA_BAILIAN_API_KEY")
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "alibaba")

# 设置 DashScope API Key
if DASHSCOPE_API_KEY:
    dashscope.api_key = DASHSCOPE_API_KEY
else:
    logger.warning("未设置 ALIBABA_BAILIAN_API_KEY，大模型调用将失败！")

@app.post("/military-analysis")
async def military_analysis(request: Request):
    """
    军事历史问题分析接口
    前端应发送: {"prompt": "用户输入的问题"}
    返回: {"response": "AI 回答内容"}
    """
    try:
        # 解析请求体
        data = await request.json()
        prompt = data.get("prompt", "").strip()

        if not prompt:
            return {"response": "请输入您的军事历史问题。"}

        # 仅支持阿里云通义千问
        if MODEL_PROVIDER != "alibaba":
            return {"response": "当前仅支持阿里云通义千问模型。"}

        if not DASHSCOPE_API_KEY:
            logger.error("缺少 ALIBABA_BAILIAN_API_KEY 环境变量")
            return {"response": "系统配置错误：未提供大模型 API 密钥。"}

        # 调用通义千问（先用 qwen-turbo 测试，稳定后再切 qwen-max）
        model_name = "qwen-turbo"  # 或 "qwen-max"

        logger.info(f"正在调用 {model_name} 分析问题: {prompt[:50]}...")

        response = Generation.call(
            model=model_name,
            prompt=(
                "你是一位精通中国古代和近代战争史的军事专家，"
                "请以专业、严谨、条理清晰的方式回答以下问题：\n\n"
                f"{prompt}"
            ),
            temperature=0.7,
            top_p=0.8,
            result_format="message"
        )

        # 处理响应
        if response.status_code == 200:
            content = response.output.choices[0].message.content.strip()
            logger.info("大模型调用成功")
            return {"response": content}
        else:
            error_msg = f"DashScope API 返回错误: {response.code} - {response.message}"
            logger.error(error_msg)
            return {"response": "军事分析服务暂时不可用，请稍后再试。"}

    except Exception as e:
        # 打印完整错误堆栈，便于调试
        logger.exception("调用大模型时发生未预期异常:")
        return {"response": "系统内部错误，请稍后重试。"}