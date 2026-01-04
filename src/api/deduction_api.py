# src/api/deduction_api.py
"""
Deduction API: Handles the "Battle Deduction" mode.
Uses LLM to generate structured JSON data for frontend animation.
"""

import logging
import json
from fastapi import APIRouter, Request
from src.ai_agent.model_service import get_model_service

# Configure Logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/deduction", tags=["deduction"])

@router.post("/simulate")
async def simulate_battle(request: Request):
    """
    Simulate a battle based on user input.
    Returns structured JSON for animation.
    """
    try:
        data = await request.json()
        query = data.get("prompt", "").strip()

        if not query:
            return {"error": "Please provide a battle name or query."}

        # Construct Prompt for Structured Output
        system_prompt = (
            "你是一个专业的军事历史战役推演引擎。"
            "你的目标是生成一个结构化的JSON序列，用于在3D地图上可视化战役过程。"
            "输出必须是有效的JSON格式。不要包含markdown格式（如 ```json ... ```）。"
            "请基于真实的历史史料进行推演，确保地理位置、部队动向和时间节点的准确性。"
            "【重要】阵营分类规则：\n"
            "   - 必须将对战双方严格区分为【红方】（Red）和【蓝方】（Blue）。\n"
            "   - 进攻方、侵略者或北方势力（如曹军、日军、国民党军）通常标记为 'color': 'red'。\n"
            "   - 防守方、抵抗者或南方势力（如联军、大清、解放军）通常标记为 'color': 'blue'。\n"
            "   - 第三方或中立势力可以使用 'orange' 或 'green'。\n"
            "JSON结构如下：\n"
            "{\n"
            "  'title': '战役名称',\n"
            "  'location': [经度, 纬度], // 战役中心点\n"
            "  'zoom': 11,\n"
            "  'steps': [\n"
            "    {\n"
            "      'time': '阶段 N: [时间/阶段名]',\n"
            "      'description': '该阶段的详细战况描述(100-200字)，引用历史背景、兵力部署、关键决策和地理环境影响。',\n"
            "      'actions': [\n"
            "        {\n"
            "          'type': 'marker', // 或 'path', 'arrow', 'circle'\n"
            "          'label': '部队/地点名称',\n"
            "          'coordinate': [经度, 纬度],\n"
            "          'color': 'red', // 必须明确指定颜色: red, blue, green, orange\n"
            "          'radius': 1000 // 仅适用于 circle\n"
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}"
            "要求：\n"
            "1. 生成至少 8-12 个详细步骤，完整覆盖战役的前奏、发展、高潮和结局。\n"
            "2. 描述要生动、专业，体现军事战略和战术细节。\n"
            "3. 充分利用地图动作(actions)来展示部队移动(path/arrow)、交战点(marker)和影响范围(circle)。\n"
        )

        user_prompt = f"请根据历史史料，详细推演这场战役：{query}。请模拟“正在检索历史数据库”的过程，并在生成的描述中体现史料依据。"

        logger.info(f"正在进行战役推演: {query}...")

        # 获取模型服务 (主备切换)
        model_service = get_model_service()
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        # 调用模型 (增加 max_tokens 以容纳长 JSON)
        content = await model_service.chat_completion(messages, max_tokens=4000)
        
        # Clean up potential markdown code blocks
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
                content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse LLM output as JSON. Output: {content[:100]}...")
            return get_mock_deduction(query) 

    except Exception as e:
        logger.exception("Error in deduction simulation")
        # 最后的兜底
        return get_mock_deduction(query)

def get_mock_deduction(query):
    """
    Returns a detailed mock deduction sequence for demonstration.
    """
    return {
        "title": f"赤壁之战 (演示数据 - 原请求: {query})",
        "location": [113.9, 29.8], # 赤壁
        "zoom": 11,
        "steps": [
            {
                "time": "阶段 1: 战前部署 (建安十三年冬)",
                "description": "曹操率八十万大军（实则二十余万）南下，水陆并进，驻扎于江北乌林。曹军船舰首尾相连，形成连环战船，意图克服北方士兵不习水战的弱点。江面之上，旌旗蔽空，声势浩大。",
                "actions": [
                    {"type": "marker", "label": "曹操大营 (乌林)", "coordinate": [113.88, 29.88], "color": "red"},
                    {"type": "marker", "label": "曹军水寨", "coordinate": [113.90, 29.86], "color": "red"},
                    {"type": "path", "label": "曹军防线", "path": [[113.85, 29.88], [113.95, 29.88]], "color": "red", "width": 5}
                ]
            },
            {
                "time": "阶段 2: 联军集结",
                "description": "孙刘联军约五万人，由周瑜、程普率领，驻扎于江南赤壁。周瑜采纳黄盖诈降之计，并与诸葛亮制定火攻策略。联军士气高昂，利用长江天险据守。",
                "actions": [
                    {"type": "marker", "label": "孙刘联军大营 (赤壁)", "coordinate": [113.92, 29.75], "color": "blue"},
                    {"type": "marker", "label": "周瑜指挥所", "coordinate": [113.93, 29.74], "color": "blue"},
                    {"type": "path", "label": "联军防线", "path": [[113.88, 29.76], [113.96, 29.76]], "color": "blue", "width": 5}
                ]
            },
            {
                "time": "阶段 3: 草船借箭 (前奏)",
                "description": "大雾弥漫之夜，诸葛亮率二十只草船逼近曹营。曹军因雾大不敢出战，只能乱箭射之。诸葛亮借得十万余支箭，既补充了军备，又打击了曹军士气。",
                "actions": [
                    {"type": "arrow", "label": "草船借箭路线", "from": [113.92, 29.75], "to": [113.90, 29.84], "color": "green", "width": 3}
                ]
            },
            {
                "time": "阶段 4: 苦肉计与诈降",
                "description": "黄盖在军中受刑，向曹操诈降。曹操信以为真，约定受降日期。黄盖准备了十艘蒙冲斗舰，满载薪草膏油，外用帷幕伪装，插上牙旗。",
                "actions": [
                    {"type": "marker", "label": "黄盖先锋队", "coordinate": [113.91, 29.78], "color": "orange"}
                ]
            },
            {
                "time": "阶段 5: 东南风起",
                "description": "是夜，东南风大起。诸葛亮在七星坛祭风（演义情节），实则预测气象。风向对联军极为有利，火攻条件成熟。",
                "actions": [
                    {"type": "arrow", "label": "东南风向", "from": [114.0, 29.7], "to": [113.8, 29.9], "color": "cyan", "width": 10, "opacity": 0.5}
                ]
            },
            {
                "time": "阶段 6: 黄盖进军",
                "description": "黄盖率领火船队乘风破浪，向曹军水寨疾驰。船队在江心升起风帆，速度极快。曹军以为黄盖来降，毫无戒备。",
                "actions": [
                    {"type": "arrow", "label": "黄盖突击", "from": [113.91, 29.78], "to": [113.90, 29.85], "color": "orange", "width": 8}
                ]
            },
            {
                "time": "阶段 7: 点火突袭",
                "description": "离曹军二里许，黄盖下令点火。火船乘风冲入曹军水寨。曹军船舰被铁链锁住，无法散开，瞬间陷入火海。",
                "actions": [
                    {"type": "marker", "label": "起火点", "coordinate": [113.90, 29.86], "color": "orange"},
                    {"type": "circle", "label": "火势蔓延", "center": [113.90, 29.86], "radius": 2000, "color": "red"}
                ]
            },
            {
                "time": "阶段 8: 火烧连营",
                "description": "火势借助风势，迅速蔓延至岸上曹军大营。烟焰涨天，人马烧溺死者甚众。曹军大乱，失去指挥。",
                "actions": [
                    {"type": "circle", "label": "全面火海", "center": [113.88, 29.88], "radius": 5000, "color": "red"},
                    {"type": "marker", "label": "曹营混乱", "coordinate": [113.88, 29.88], "color": "black"}
                ]
            },
            {
                "time": "阶段 9: 联军总攻",
                "description": "周瑜率领轻锐主力紧随其后，雷鼓大震，杀入曹军大营。曹军大败，溃不成军。",
                "actions": [
                    {"type": "arrow", "label": "联军总攻", "from": [113.92, 29.76], "to": [113.88, 29.88], "color": "blue", "width": 10}
                ]
            },
            {
                "time": "阶段 10: 曹操败退",
                "description": "曹操见大势已去，率领残部突围，经华容道向江陵方向撤退。途中道路泥泞，加上饥疫，死伤惨重。",
                "actions": [
                    {"type": "path", "label": "曹操撤退路线", "path": [[113.88, 29.88], [113.80, 29.95], [113.60, 30.05]], "color": "grey", "width": 4}
                ]
            },
            {
                "time": "阶段 11: 追击与拦截",
                "description": "刘备军在华容道等地设伏拦截（演义情节）。曹操虽狼狈逃脱，但元气大伤，失去了统一南方的机会。",
                "actions": [
                    {"type": "marker", "label": "关羽伏击点 (华容道)", "coordinate": [113.70, 30.00], "color": "blue"}
                ]
            },
            {
                "time": "阶段 12: 战后格局",
                "description": "赤壁之战奠定了三国鼎立的基础。曹操退守北方，孙权巩固江东，刘备借机占领荆州大部，开启了三国时代。",
                "actions": [
                    {"type": "marker", "label": "荆州 (刘备)", "coordinate": [112.2, 30.3], "color": "green"},
                    {"type": "marker", "label": "江东 (孙权)", "coordinate": [118.7, 32.0], "color": "blue"},
                    {"type": "marker", "label": "北方 (曹操)", "coordinate": [114.5, 34.7], "color": "red"}
                ]
            }
        ]
    }
