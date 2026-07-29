# DreamForge — AI 梦境故事工坊 🌙

把梦境织成故事。你的梦境，AI 来解读，再来变成一篇属于你的故事。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | React 18 + Vite + Tailwind CSS + Framer Motion |
| 后端 | Python FastAPI + Uvicorn |
| 数据库 | SQLite（零配置，文件 `db.sqlite3`） |
| AI | OpenAI API（需自行配置 Key） |

## 快速开始

### 1. 后端

```bash
cd backend

# 创建虚拟环境（Python 3.11+）
python -m venv .venv
.venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn main:app --reload
```

后端默认运行在 `http://localhost:8000`
交互式 API 文档：`http://localhost:8000/docs`

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`

### 3. 配置 AI（可选）

编辑 `backend/.env`，填入你的 OpenAI API Key：

```
OPENAI_API_KEY=sk-your-key-here
```

不配置 Key 也能用，AI 功能会走友好提示兜底。

## 用户流程

```
梦境录入 → 双线解读 → 风格化创作 → 故事沉淀
               │
       ┌───────┴───────┐
   心理学分析      文学隐喻发散
   (情绪模式)      (象征解读 + 剧本脉络)
```

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 梦境录入（大输入区 + 情绪标签） |
| 解读页 | `/interpret?id=xxx` | 心理学 + 文学双栏解读，打字机输出 |
| 创作页 | `/create?id=xxx` | 4 种风格 + 3 种篇幅选择，生成完整故事 |
| 故事库 | `/library` | 卡片列表，可搜索和按风格筛选 |
| 故事详情 | `/detail/:id` | 完整解读 + 故事，支持续写/重写/删除 |

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/dreams/` | 创建梦境 |
| GET | `/api/dreams/` | 梦境列表 |
| GET | `/api/dreams/{id}` | 梦境详情（含解读+故事） |
| DELETE | `/api/dreams/{id}` | 删除梦境（级联删除） |
| POST | `/api/dreams/{id}/interpret` | AI 双线解读 |
| POST | `/api/dreams/{id}/generate` | AI 故事生成 |
| GET | `/api/stories/` | 故事列表 |
| GET | `/api/stories/{id}` | 故事详情 |
| DELETE | `/api/stories/{id}` | 删除故事 |
| POST | `/api/stories/{id}/continue` | 续写故事 |
| POST | `/api/stories/{id}/rewrite` | 换风格重写 |