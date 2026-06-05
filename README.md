# 🌍 100种不可思议旅行 — Web App MVP

> **一个小众旅行目的地内容展示平台** · 聚焦「不可思议」标准的全球旅行灵感

[![Tech Stack](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://www.python.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📑 目录

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [技术选型](#-技术选型)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [API 概览](#-api-概览)
- [运行测试](#-运行测试)
- [数据库初始化](#-数据库初始化)
- [文档索引](#-文档索引)
- [部署指南](#-部署指南)
- [版本规划](#-版本规划)

---

## 📖 项目简介

「100种不可思议旅行」是一个**内容驱动的旅行目的地展示平台**。不同于传统旅行攻略（以酒店、交通、价格为重心），本项目聚焦于筛选和呈现全球范围内具有**视觉冲击力、故事性和稀缺性**的小众旅行目的地。

**MVP 核心目标**：上线 100 个目的地，提供完整的多维筛选、排序、和深度图文内容消费体验。

### 设计哲学

- **内容优先** — 高质量图片 + 结构化 Markdown 正文 + 实用信息面板
- **发现驱动** — 8 种分类 × 8+ 标签 × 多维度筛选 = 灵活的发现路径
- **轻量交互** — 匿名收藏、浏览统计，无需注册即可互动
- **移动友好** — 全响应式设计，移动端/平板/桌面三端适配

---

## ✨ 功能特性

### MVP (v1.0)

| 模块 | 功能 | 状态 |
|------|------|------|
| 🏠 **首页** | Hero 区域 + 热门目的地 + 最新目的地 + 分类卡片网格 | ✅ |
| 📋 **目的地列表** | 6 维度筛选（分类/标签/大洲/难度/预算/拥挤度） | ✅ |
| | 5 种排序（默认/最新/最热门/最多收藏/最高评分） | ✅ |
| | 分页浏览 + 关键词搜索 | ✅ |
| 📄 **目的地详情** | 图片画廊 + 全屏灯箱（键盘/触摸导航） | ✅ |
| | Markdown 正文渲染 | ✅ |
| | Tab 式信息面板（旅行/实用/交通/贴士/趣闻） | ✅ |
| | 摄影师署名 + 图片版权信息 | ✅ |
| ❤️ **收藏系统** | 匿名 device UUID 标识 | ✅ |
| | 切换式收藏（乐观更新 + 回滚） | ✅ |
| | 收藏列表页 | ✅ |
| 👁️ **浏览统计** | 页面浏览计数 + 停留时长记录（sendBeacon） | ✅ |
| 📤 **分享** | Web Share API（移动端）/ 剪贴板复制（桌面端） | ✅ |
| 🎨 **UI/UX** | 骨架屏加载状态（所有页面） | ✅ |
| | 错误边界 + 404 页面 | ✅ |
| | Toast 通知系统 | ✅ |
| | 回到顶部浮动按钮 | ✅ |
| | 面包屑导航 | ✅ |
| 📱 **响应式** | 320px ~ 2560px 全适配 | ✅ |

---

## 🔧 技术选型

### 选型理由

| 技术 | 选择理由 |
|------|---------|
| **Next.js 14 (App Router)** | React Server Components 天然适合内容型站点 SEO；`React.cache()` 请求去重；`generateMetadata` 动态 SEO |
| **TypeScript (strict)** | 前后端类型安全；API 契约（Pydantic ↔ TS types）双向对照 |
| **Tailwind CSS 3** | 原子化 CSS 构建速度快，`@tailwindcss/typography` 完美支持 Markdown 排版 |
| **FastAPI** | 原生 async、自动 OpenAPI 文档、Pydantic 深度集成、参数校验开箱即用 |
| **SQLite 3 (WAL)** | 零配置部署、MVP 数据量 < 1GB 完全够用、WAL 模式支持低并发读写 |
| **无 ORM** | 7 张表结构简单，raw SQL 更透明灵活；无迁移管理负担 |
| **Lucide React** | 400+ 图标 tree-shakable，风格统一，与 Tailwind 配合流畅 |
| **匿名 Device UUID** | 无需用户注册系统、无 Cookie 合规负担、localStorage 持久化 |

### 详细对比

详见 [架构设计文档 — 第 2 章 技术选型](docs/architecture.md#2-技术选型)。

---

## 📁 项目结构

```
Web-App-MVP/
│
├── README.md                       ← 你在这里
│
├── backend/                        🔌 Python FastAPI 后端
│   ├── main.py                     #   应用入口：lifespan / CORS / 路由 / 异常处理
│   ├── database.py                 #   SQLite 连接单例 + Schema 初始化
│   ├── models.py                   #   Pydantic 模型 + 枚举 + 数据组装工具
│   ├── requirements.txt            #   Python 依赖
│   ├── routers/
│   │   ├── destinations.py         #   目的地列表（筛选/排序/分页）+ 详情
│   │   ├── categories.py           #   分类列表（含目的地计数）
│   │   ├── tags.py                 #   标签列表（含目的地计数，可排序）
│   │   └── user.py                 #   收藏（切换/取消/列表）+ 浏览记录
│   └── tests/                      🧪 后端测试套件
│       ├── conftest.py             #   pytest fixtures (隔离数据库 + TestClient)
│       ├── test_health.py          #   健康检查 + 异常处理
│       ├── test_destinations.py    #   目的地列表 & 详情 (18 个用例)
│       ├── test_user.py            #   收藏 & 浏览记录 (14 个用例)
│       ├── test_categories_tags.py #   分类 & 标签 (6 个用例)
│       └── test_models.py          #   Pydantic 模型序列化 (10 个用例)
│
├── src/                            🖥️ Next.js 前端
│   ├── app/                        #   App Router 页面 + 布局 + 加载/错误状态
│   │   ├── layout.tsx              #   根布局（字体 + Providers + Metadata）
│   │   ├── providers.tsx           #   Client Providers 组合
│   │   ├── page.tsx                #   首页 /
│   │   ├── destinations/           #   /destinations & /destinations/[slug]
│   │   ├── categories/             #   /categories & /categories/[slug]
│   │   └── favorites/              #   /favorites
│   ├── components/                 #   Atomic Design 组件
│   │   ├── atoms/                  #   ⚛️ 基础组件 (12)
│   │   ├── molecules/              #   🔗 组合组件 (12)
│   │   ├── organisms/              #   🧩 区块组件 (10)
│   │   └── templates/              #   📐 布局模板 (2)
│   ├── hooks/                      #   🪝 自定义 Hooks (4)
│   ├── providers/                  #   📦 Context Providers (3)
│   ├── lib/                        #   🔧 工具库 (API 客户端 + 错误处理 + 数据获取)
│   └── types/                      #   📝 TypeScript 类型定义
│
├── database/                       💾 数据库
│   ├── schema.sql                  #   完整建表 SQL（7 表 + 10+ 索引 + 1 触发器）
│   ├── seed-sample.json            #   种子数据（3 目的地 + 3 分类 + 8 标签）
│   └── travel.db                   #   运行时 SQLite 数据库文件
│
├── images/                         🖼️ 静态图片资源
│   └── destinations/
│       ├── salar-de-uyuni/         #   乌尤尼盐沼 — 6 张
│       ├── waitomo/                #   怀托摩萤火虫洞 — 4 张
│       └── golden-bridge/          #   岘港金桥 — 4 张
│
├── scripts/                        🛠️ 工具脚本
│   ├── init_db.py                  #   数据库初始化 CLI 工具
│   ├── download_images.py          #   Unsplash 图片下载工具
│   ├── test_api.py                 #   API 手动测试脚本
│   └── test_image.py               #   图片服务手动测试脚本
│
├── docs/                           📚 技术文档
│   ├── PRD.md                      #   产品需求文档
│   ├── architecture.md             #   架构设计文档
│   ├── frontend-architecture.md    #   前端组件架构文档
│   ├── api_spec.md                 #   RESTful API 契约
│   └── database-design.md          #   数据库设计文档
│
├── package.json                    #   Node.js 依赖 & Scripts
├── tsconfig.json                   #   TypeScript 配置
├── tailwind.config.ts              #   Tailwind CSS 主题配置
├── next.config.mjs                 #   Next.js 配置
└── postcss.config.mjs              #   PostCSS 配置
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** ≥ 20 LTS
- **Python** ≥ 3.12
- **npm** (随 Node.js 安装) 或 **pnpm**

### 1. 克隆 & 安装依赖

```bash
# 克隆仓库
git clone <repo-url>
cd Web-App-MVP

# 安装前端依赖
npm install

# 安装后端依赖
cd backend
pip install -r requirements.txt
cd ..
```

### 2. 初始化数据库

```bash
# 建表 + 加载种子数据（3 个示例目的地）
python scripts/init_db.py --seed

# 或者仅建表（空数据库）
python scripts/init_db.py

# 重新初始化（删除旧数据）
python scripts/init_db.py --reset
```

### 3. 启动后端 (端口 8000)

```bash
cd backend
uvicorn main:app --reload --port 8000
```

验证后端运行：
```bash
curl http://localhost:8000/api/v1/health
# → {"status":"ok","version":"1.0.0"}
```

FastAPI 自动生成交互式文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. 启动前端 (端口 3000)

```bash
# 在项目根目录，新开一个终端
npm run dev
```

访问 http://localhost:3000 查看应用。

### 5. 加载种子数据（如果第 2 步跳过了）

```bash
# 通过 API 加载种子数据
curl -X POST http://localhost:8000/api/v1/admin/seed
```

---

## 📡 API 概览

所有 API 接口前缀：`http://localhost:8000/api/v1`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/health` | 健康检查 | — |
| `GET` | `/destinations` | 目的地列表（筛选/排序/分页） | — |
| `GET` | `/destinations/{slug}` | 目的地详情 | 可选 |
| `POST` | `/destinations/{slug}/favorite` | 切换收藏 | `X-Device-Id` |
| `DELETE` | `/destinations/{slug}/favorite` | 取消收藏 | `X-Device-Id` |
| `POST` | `/destinations/{slug}/view` | 记录浏览 | `X-Device-Id` |
| `GET` | `/categories` | 全部分类（含计数） | — |
| `GET` | `/tags` | 全部标签（含计数） | — |
| `GET` | `/user/favorites` | 用户收藏列表 | `X-Device-Id` |
| `POST` | `/admin/seed` | 加载种子数据 | — |

### 快速示例

```bash
# 获取自然奇观分类下按热度排序的目的地
curl "http://localhost:8000/api/v1/destinations?category=natural-wonders&sort=popular&page_size=5"

# 获取目的地详情
curl "http://localhost:8000/api/v1/destinations/salar-de-uyuni"

# 收藏目的地
curl -X POST "http://localhost:8000/api/v1/destinations/salar-de-uyuni/favorite" \
  -H "X-Device-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# 查看收藏列表
curl "http://localhost:8000/api/v1/user/favorites" \
  -H "X-Device-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

完整 API 文档：[docs/api_spec.md](docs/api_spec.md)

---

## 🧪 运行测试

### 后端测试（pytest）

```bash
cd backend

# 安装测试依赖
pip install pytest httpx

# 运行全部测试
pytest tests/ -v

# 运行特定模块
pytest tests/test_destinations.py -v
pytest tests/test_user.py -v

# 带覆盖率报告
pip install pytest-cov
pytest tests/ --cov=. --cov-report=term-missing
```

**测试覆盖**（48 个测试用例）：

| 模块 | 测试文件 | 用例数 | 覆盖内容 |
|------|---------|--------|---------|
| 健康检查 & 异常 | `test_health.py` | 3 | health 端点、404 处理、种子加载 |
| 目的地 | `test_destinations.py` | 18 | 列表分页/排序/筛选/搜索、详情、user_context |
| 用户交互 | `test_user.py` | 14 | 收藏 toggle/remove、浏览记录、收藏列表、计数一致性 |
| 分类 & 标签 | `test_categories_tags.py` | 6 | 分类/标签列表、计数准确性、排序 |
| 数据模型 | `test_models.py` | 10 | JSON 解析、Pydantic 序列化、模型组装 |

### 关键词速查

```bash
pytest tests/ -v -k "filter"        # 筛选相关测试
pytest tests/ -v -k "favorite"      # 收藏相关测试
pytest tests/ -v -k "pagination"    # 分页相关测试
pytest tests/ -v -k "error or 404"  # 错误处理测试
```

---

## 🗄️ 数据库初始化

### init_db.py 用法

```bash
# 查看帮助
python scripts/init_db.py --help

# 仅建表（幂等 — 已有表不会重复创建）
python scripts/init_db.py

# 建表 + 加载种子数据
python scripts/init_db.py --seed

# 完全重新初始化（删除旧库 → 建表 → 种子数据）
python scripts/init_db.py --reset

# 指定数据库路径
python scripts/init_db.py --db /path/to/custom.db --seed
```

### 种子数据内容

`database/seed-sample.json` 包含：

| 类型 | 数量 | 内容 |
|------|------|------|
| 🏷️ 分类 | 3 | 自然奇观 / 地下秘境 / 色彩之地 |
| 🏷️ 标签 | 8 | 星空摄影 / 无人机必飞 / 日出日落 / 洞穴探险 / 被低估 / 此生必去 / INS网红 / 生态奇观 |
| 🌍 目的地 | 3 | Salar de Uyuni（玻利维亚） / Waitomo Caves（新西兰） / Golden Bridge（越南） |
| 🖼️ 图片 | 7 | 含 Unsplash 版权信息 |

---

## 📚 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| **产品需求文档** | [docs/PRD.md](docs/PRD.md) | 产品定位、用户画像、功能范围、版本规划。含用户旅程地图和产品架构图 |
| **架构设计文档** | [docs/architecture.md](docs/architecture.md) | C4 容器/组件图、技术选型对比、数据流、部署架构、ADR 关键决策记录 |
| **前端组件架构** | [docs/frontend-architecture.md](docs/frontend-architecture.md) | Atomic Design 组件目录、组件树、状态管理、数据获取策略、样式系统 |
| **API 契约文档** | [docs/api_spec.md](docs/api_spec.md) | 完整 REST API 契约：请求/响应格式、错误码、分页、枚举值 |
| **数据库设计文档** | [docs/database-design.md](docs/database-design.md) | ER 图、表结构详解、决策记录、索引策略、JSON 结构示例 |
| **数据库 Schema** | [database/schema.sql](database/schema.sql) | 7 张表完整 DDL + 10+ 索引 + 触发器 |

### 文档导航建议

```
首次阅读建议路径:
  README.md → PRD.md → architecture.md → api_spec.md

按角色推荐:
  产品经理           → PRD.md
  后端开发者         → architecture.md → api_spec.md → database-design.md
  前端开发者         → architecture.md → frontend-architecture.md → api_spec.md
  全栈/DBA          → architecture.md → database-design.md → database/schema.sql
```

---

## 🚢 部署指南

### 开发环境

```bash
# 终端 1 — 后端
cd backend && uvicorn main:app --reload --port 8000

# 终端 2 — 前端
npm run dev
```

### 生产环境（推荐：单 VPS + Nginx）

```bash
# 1. 构建前端
npm run build

# 2. 启动后端（使用 systemd 或 PM2 守护）
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# 3. 启动前端
npm run start -- -p 3000

# 4. Nginx 反向代理配置
# 将 /api/* 和 /images/* 代理到 localhost:8000
# 其余请求代理到 localhost:3000
```

**Nginx 配置示例**：

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # API + 静态图片
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    location /images/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | 前端调用后端 API 的基地址 |

> 当前版本通过 `src/lib/api-client.ts` 中的 `API_BASE_URL` 常量配置。

---

## 🗺️ 版本规划

| 版本 | 计划内容 | 预计 |
|------|---------|------|
| **v1.0** ✅ | 内容展示 + 筛选 + 匿名收藏 + 浏览统计 | 2026-06 |
| **v1.1** | 用户注册/登录、后台管理面板、FTS5 全文搜索 | 2026-07 |
| **v1.2** | 用户评分、评论系统、多语言 (i18n)、地图集成 | 2026-08 |
| **v1.3** | 个性化推荐、行程规划功能 | 2026-09 |

详见 [PRD — 第 9 章 版本规划](docs/PRD.md#9-版本规划)。

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/amazing-feature`)
3. 运行测试确保通过 (`cd backend && pytest tests/ -v`)
4. 提交变更 (`git commit -m 'feat: add amazing feature'`)
5. 推送到分支 (`git push origin feat/amazing-feature`)
6. 创建 Pull Request

**提交规范**：使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式。

---

## 📄 许可证

MIT License

---

> **相关资源**  
> - FastAPI 文档: https://fastapi.tiangolo.com  
> - Next.js 文档: https://nextjs.org/docs  
> - Tailwind CSS 文档: https://tailwindcss.com/docs  
> - Lucide 图标库: https://lucide.dev

---

<p align="center">
  <sub>Built with ❤️ using Next.js + FastAPI + SQLite · MVP v1.0 · 2026</sub>
</p>
