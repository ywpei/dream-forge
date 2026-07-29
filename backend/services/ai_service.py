"""AI 服务层：OpenAI API 封装 + Prompt 模板。
包含情绪识别、心理学解读、文学隐喻解读、故事生成、续写、重写等全部 Prompt。
所有 AI 调用失败时返回友好提示，不崩溃。
"""

import os
import json
import re
from typing import List, Optional
from openai import OpenAI

# 从环境变量读取 API Key
API_KEY = os.getenv("OPENAI_API_KEY", "")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 可用情绪标签列表
EMOTION_OPTIONS = ["焦虑", "困惑", "兴奋", "悲伤", "宁静", "恐惧", "期待", "压抑"]

# 氛围配色映射（AI 生成后校验，不在模型内硬编码）
ATMOSPHERE_COLORS = {
    "healing": "#86efac",   # 治愈绿
    "fantasy": "#c084fc",   # 奇幻紫
    "mystery": "#94a3b8",   # 悬疑灰
    "scifi":   "#60a5fa",   # 科幻蓝
}

# 风格中文名映射
STYLE_NAMES = {
    "healing": "治愈",
    "fantasy": "奇幻",
    "mystery": "悬疑",
    "scifi": "科幻",
}

LENGTH_NAMES = {
    "short": "精短篇（300-500字）",
    "full": "完整短篇（1200-2000字）",
    "outline": "小说世界观大纲",
}


def _get_client() -> Optional[OpenAI]:
    """获取 OpenAI 客户端，API Key 未配置时返回 None。"""
    if not API_KEY or API_KEY == "your-api-key-here":
        return None
    return OpenAI(api_key=API_KEY, base_url=BASE_URL)


def _call_ai(system_prompt: str, user_prompt: str, max_tokens: int = 2048) -> str:
    """调用 OpenAI Chat Completion 的通用方法。失败时返回空字符串。"""
    client = _get_client()
    if client is None:
        return ""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.8,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        # 返回空字符串，调用方自行处理兜底
        print(f"[AI Service Error] {e}")
        return ""


def recognize_emotion(content: str, user_tags: List[str]) -> str:
    """AI 情绪识别：分析梦境文本的情绪倾向，与用户手动选择对比后给出补充解读。

    Args:
        content: 梦境原文
        user_tags: 用户手动选择的情绪标签

    Returns:
        AI 识别结果字符串，包含识别到的情绪和补充解读
    """
    system_prompt = """你是一个专业的梦境情绪分析师。请分析用户梦境文本中的情绪倾向。
从以下情绪中选择最相关的 1-3 个：焦虑、困惑、兴奋、悲伤、宁静、恐惧、期待、压抑。
如果与用户手动选择的情绪不一致，给出补充解读。
输出格式：情绪：[情绪1, 情绪2, ...]\\n补充解读：..."""

    user_tags_str = "、".join(user_tags) if user_tags else "未选择"
    user_prompt = f"用户手动选择的情绪：{user_tags_str}\n\n梦境文本：{content}"

    result = _call_ai(system_prompt, user_prompt, max_tokens=512)
    return result if result else f"情绪：{user_tags_str}\n补充解读：AI 情绪识别暂时不可用，以你的选择为准。"


# ─── Prompt 模板 ───

PSYCHOLOGY_PROMPT = """你是一位温和的心理学观察者（非专业心理咨询师）。从情绪模式和心理投射角度，
给出 2-3 个可能的心理意象解读。语气温暖、不评判、不武断。
明确标注：**【非专业心理提示】**本解读仅作参考，不构成专业心理咨询。

梦境：{content}
情绪：{emotions}"""

LITERATURE_PROMPT = """你是一位文学创作者。挖掘梦境中的象征符号、潜在叙事种子、人物原型，
输出一个剧本脉络/故事框架（含起承转合建议）。

梦境：{content}"""

STORY_PROMPT = """基于以下梦境和解读，创作一个 {style_name} 风格的故事。
篇幅：{length_name}
同时生成一句适配该风格的气氛 Slogan（15字以内）和主色调 hex 值（6位十六进制）。

输出格式：
【标题】...
【Slogan】...
【主色调】#...
【正文】...

梦境原文：{content}
心理学解读：{psychology}
文学解读：{literature}"""

CONTINUE_PROMPT = """基于以下故事前文，继续创作后续情节，保持 {style_name} 风格。

前文：{content}"""

REWRITE_PROMPT = """将以下故事段落改写为 {style_name} 风格，保持核心情节不变。

原文：{content}"""


def interpret_psychology(content: str, emotions: str) -> str:
    """心理学线解读。

    Args:
        content: 梦境原文
        emotions: 情绪标签文本

    Returns:
        心理学分析文本
    """
    user_prompt = PSYCHOLOGY_PROMPT.format(content=content, emotions=emotions)
    result = _call_ai("你是一个温和的心理学观察者。", user_prompt, max_tokens=1536)
    if not result:
        result = "**【非专业心理提示】** 心理学分析暂时不可用。梦境往往反映我们白天的经历和潜在的情绪，建议你静下心来回顾最近的生活变化。"
    return result


def interpret_literature(content: str) -> str:
    """文学隐喻线解读。

    Args:
        content: 梦境原文

    Returns:
        文学隐喻分析文本
    """
    user_prompt = LITERATURE_PROMPT.format(content=content)
    result = _call_ai("你是一个文学创作者。", user_prompt, max_tokens=1536)
    if not result:
        result = "文学解读暂时不可用。每个梦境都像一部微电影，拥有独特的情节和意象，不妨试着把梦中的画面写成一个短故事。"
    return result


def generate_story(
    content: str,
    psychology: str,
    literature: str,
    style: str,
    length: str,
) -> dict:
    """生成风格化故事。

    Args:
        content: 梦境原文
        psychology: 心理学解读
        literature: 文学解读
        style: 风格 key
        length: 篇幅 key

    Returns:
        dict: {title, content, slogan, atmosphere_color}
    """
    style_name = STYLE_NAMES.get(style, "奇幻")
    length_name = LENGTH_NAMES.get(length, "完整短篇（1200-2000字）")

    user_prompt = STORY_PROMPT.format(
        style_name=style_name,
        length_name=length_name,
        content=content,
        psychology=psychology,
        literature=literature,
    )

    result = _call_ai("你是一个故事创作大师。", user_prompt, max_tokens=3072)

    # 解析 AI 输出
    title = ""
    story_content = ""
    slogan = ""
    color = ATMOSPHERE_COLORS.get(style, "#818cf8")

    if result:
        # 尝试提取标题
        title_match = re.search(r"【标题】(.+)", result)
        if title_match:
            title = title_match.group(1).strip()

        # 尝试提取 Slogan
        slogan_match = re.search(r"【Slogan】(.+)", result)
        if slogan_match:
            slogan = slogan_match.group(1).strip()

        # 尝试提取主色调
        color_match = re.search(r"【主色调】(#?[0-9a-fA-F]{6})", result)
        if color_match:
            color = "#" + color_match.group(1).strip().lstrip("#")

        # 提取正文（【正文】之后的内容）
        body_match = re.search(r"【正文】(.+)", result, re.DOTALL)
        if body_match:
            story_content = body_match.group(1).strip()
        else:
            story_content = result

    if not title:
        title = f"{style_name}之梦"
    if not slogan:
        slogan = f"在{style_name}的世界里，寻找答案"

    return {
        "title": title,
        "content": story_content or f"一个{style_name}风格的故事正在编织中...（请配置 OPENAI_API_KEY 后重试）",
        "slogan": slogan,
        "atmosphere_color": color,
    }


def continue_story(content: str, style: str) -> str:
    """续写故事。

    Args:
        content: 已有故事文本
        style: 风格 key

    Returns:
        续写内容
    """
    style_name = STYLE_NAMES.get(style, "奇幻")
    user_prompt = CONTINUE_PROMPT.format(style_name=style_name, content=content)
    result = _call_ai("你是一个故事创作大师。", user_prompt, max_tokens=2048)
    return result if result else "续写功能暂时不可用。请配置 OPENAI_API_KEY 后重试。"


def rewrite_story(content: str, style: str) -> str:
    """重写故事段落（换风格）。

    Args:
        content: 需要重写的段落文本
        style: 目标风格 key

    Returns:
        重写后的内容
    """
    style_name = STYLE_NAMES.get(style, "奇幻")
    user_prompt = REWRITE_PROMPT.format(style_name=style_name, content=content)
    result = _call_ai("你是一个故事创作大师。", user_prompt, max_tokens=2048)
    return result if result else "重写功能暂时不可用。请配置 OPENAI_API_KEY 后重试。"
