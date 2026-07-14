---
title: TuZi API 生图使用规范
date: 2026-07-14 18:00:00
tags:
  - TuZi
  - API
  - 生图
categories:
  - 工具教程
---

TuZi API 生图使用规范
> 版本：v1.0 | 用途：通用生图 API 参考文档

1. API 基本信息
| 项目 | 值 |
|------|-----|
| 基础 URL | `https://api.tu-zi.com` |
| 生图端点 | `POST /v1/images/generations` |
| 编辑端点 | `POST /v1/images/edits` |
| 接口协议 | RESTful |
| 认证方式 | Bearer Token（请求头 `Authorization: Bearer {API_KEY}`） |
可用模型
| 模型 ID | 用途 | 适用场景 |
|---------|------|---------|
| `gpt-image-2` | 标准生图 | 一般风格、快速出图 |
| `gpt-image-2-vip` | 高精度生图 | 复杂风格、品牌KV、IP角色 |
**建议：** 设计类任务（IP/KV/品牌海报）优先使用 `gpt-image-2-vip`。

2. 请求参数
2.1 参数列表
```json
{
  "model": "gpt-image-2 | gpt-image-2-vip",
  "prompt": "string（必填，英文为主）",
  "image": ["url1", "url2"]（可选，参考图数组，支持URL或base64）",
  "n": 1（可选，生成数量，默认1）,
  "size": "1024x1024"（可选，尺寸）,
  "quality": "standard | hd"（可选）,
  "style": "vivid | natural"（可选）,
  "response_format": "url | b64_json"（可选，默认url）,
  "output_format": "png | jpeg | webp"（可选）,
  "moderation": "low | auto"（可选）
}
```
2.2 尺寸规范
尺寸限制
- **最大边长**：≤ 3840px
- **总像素**：≤ 8,290,000（约829万像素）
- **宽高**：必须是16的倍数
常用尺寸
| 用途 | 比例 | 尺寸 |
|------|------|------|
| 电商竖版 | 3:4 | 2448×3264 / 2160×2880 |
| 社交媒体竖版 | 9:16 | 2160×3840 |
| 横版海报 | 16:9 | 3840×2160 / 2048×1152 |
| 正方形 | 1:1 | 2864×2864 |

3. 参考图使用规范
3.1 传参方式
通过 `image` 参数传入参考图（数组格式）：
```python
requests.post(
    "https://api.tu-zi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2-vip",
        "prompt": "...",
        "image": [
            "https://example.com/reference1.webp",
            "https://example.com/reference2.png"
        ],
        "n": 1,
        "size": "2448x3264"
    }
)
```
3.2 参考图要求
| 要求 | 说明 |
|------|------|
| URL | 必须可公开访问（图床/GitHub Pages/CDN） |
| 格式 | webp / png / jpg 均可 |
| Base64 | 不超过1MB，否则超时风险高 |
3.3 多参考图策略（重要）
**两张参考图同时传入时，顺序建议：**
| 索引 | 类型 | 用途 |
|------|------|------|
| `image[0]` | IP/角色参考图 | 用于保持角色形象一致性 |
| `image[1]` | 风格/场景参考图 | 用于指定画面氛围风格 |
> ⚠️ 多图不保证每个参考图都被完全使用，模型会"创造性理解"各参考图特征。

4. Prompt 编写规范
4.1 核心原则
```
✅ 写：表情、动作、服装、场景、氛围、构图
❌ 不写（有参考图时）：五官、发型、肤色、身形、颜色等被参考图覆盖的特征
```
4.2 带参考图时的规则
| 场景 | 可写 | 禁止写 |
|------|------|--------|
| 人物IP角色 | 表情(happy/excited)、动作(waving/jumping)、服装(outfit/costume) | 五官、发型、肤色、身形、头/身子/手/脚等身体部位 |
| 商品/产品 | 氛围(fresh/icy)、场景(sunlit/studio) | 材质、颜色、杯型、包装外观等视觉特征 |
| 风格参考图 | 画面动态、构图、光影 | — |
4.3 固定句
人物IP生成时必须加以下固定句：
```
Maintain IP identity and consistency throughout.
```
4.4 推荐 Prompt 结构
```
{核心风格/氛围描述}，{场景背景}，{角色动作表情}，{道具/元素}。
布局：{文字位置}："{主标题}"
点缀：{小元素}
场景: {中文场景描述}
主体动作: {中文动作描述}
道具: {中文道具描述}
Style: {风格描述}
{固定句}
```
4.5 示例
```
acid-lime green 3D streetwear lab scene, concert stage atmosphere with
spotlight beams, glowing light sticks sea, giant TV screens in background.
A cute mascot character standing at center stage, making victory gesture,
wearing sunglasses and holding golden microphone, happy expression.
Left side massive black bold text: "芒果节狂欢购"
Small accent stickers: "芒果TV会员年卡99元"
Style: acid-lime 3D streetwear lab, experimental design, bold typography
Maintain IP identity and consistency throughout.
```

5. 响应格式
成功响应
```json
{
  "data": [
    {
      "url": "https://apioss.../image.png",
      "revised_prompt": "自动优化的完整prompt"
    }
  ]
}
```
错误响应
```json
{
  "error": {
    "message": "错误描述",
    "type": "错误类型",
    "code": "错误码"
  }
}
```

6. 常见错误与处理
| 错误 | 原因 | 处理 |
|------|------|------|
| `400 size invalid` | 尺寸不是16的倍数或超限制 | 检查宽高是否为16倍数，总像素≤829万 |
| `500 convert_request_failed` | 参考图下载失败 | 检查参考图URL是否可访问 |
| `rate limit exceeded` | 请求过快 | 等待后重试 |
| `upstream service unavailable` | 上游服务饱和 | 等待30-60秒后重试 |

7. 完整调用示例
Python（推荐）
```python
import requests
API_KEY = "your_api_key_here"
response = requests.post(
    "https://api.tu-zi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2-vip",
        "prompt": prompt_text,
        "image": [
            "https://your-image-host.com/reference1.webp",
            "https://your-image-host.com/reference2.png"
        ],
        "n": 1,
        "size": "2448x3264"
    },
    timeout=300
)
if response.status_code == 200:
    image_url = response.json()["data"][0]["url"]
    print(f"生成成功: {image_url}")
else:
    print(f"失败: {response.text}")
```
cURL
```bash
curl -X POST "https://api.tu-zi.com/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-vip",
    "prompt": "a cute mascot character on concert stage",
    "image": ["https://example.com/reference.webp"],
    "n": 1,
    "size": "2448x3264"
  }'
```

8. 最佳实践
8.1 生图检查清单
```
□ 模型选择是否正确（标准gpt-image-2 / 复杂gpt-image-2-vip）
□ 尺寸是否符合API限制（16倍数，≤829万像素）
□ 参考图URL是否可公开访问
□ prompt是否遵循规则（有参考图时避免外貌描述）
□ 人物IP是否加了固定句
□ 是否设置了合理的timeout（建议300秒）
□ 是否需要重试逻辑
```
8.2 人物一致性保障
1. **必须传IP参考图** — 角色一致性依赖参考图
2. **prompt不写外貌** — 让模型自己从参考图学习特征
3. **加固定句** — `Maintain IP identity and consistency throughout.`
4. **双图场景** — IP参考图 + 风格参考图同时传入
8.3 失败重试策略
```python
import time
max_retries = 3
for i in range(max_retries):
    response = requests.post(...)
    if response.status_code == 200:
        break
    elif response.status_code in [502, 503, 504]:
        time.sleep(30 * (i + 1))  # 递增等待
        continue
    else:
        break
```

> **注意：** 本文档不包含任何具体的 API Key、Token、账户ID等敏感信息。API Key 需从环境变量或安全配置中获取。