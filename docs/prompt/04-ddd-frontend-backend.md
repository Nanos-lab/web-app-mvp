# Prompt 记录 #4 — 前端组件架构 & 后端 API 实现

## 阶段归属

**DDD（Design-Driven Development / 设计驱动开发） + TDD-lite（后端验证）**

| 阶段 | 含义 | 本 Prompt 产出 |
|------|------|---------------|
| SDD | Schema-Driven Development | 数据库模型 ✅ (Prompt #1) |
| API 契约 | 接口层 | RESTful API ✅ (Prompt #2) |
| **DDD** | **Design-Driven Development** | **前端组件架构 + 65 文件落地** |
| TDD-lite | Test-Driven (验证层) | 后端 14 API 端点 end-to-end 验证 |

> 本 Prompt 横跨了 DDD 的规划/实施，以及后端的合同实现与验证。是"规划 → 编码 → 验证"的完整闭环。

---

## Prompt 4-1：DDD 阶段 — 前端核心组件结构规划

### 用户意图

> "现在进入 DDD 阶段。基于之前的 API 规范，请帮我规划前端核心组件结构。请遵循原子设计原则（Atomic Design），列出本项目需要的核心组件，并简述每个组件的 Props 和核心状态逻辑。"

- 基于已完成 API spec 和 database schema，从"设计文档"进入"组件实现规划"
- 要求遵循 Atomic Design 五层模型（Atoms → Molecules → Organisms → Templates → Pages）
- 要求每个组件明确 Props 和状态边界

### 用户的关键决策（AI 追问确认）

| 决策点 | 用户选择 |
|--------|---------|
| 前端框架 | React + TypeScript |
| CSS 方案 | Tailwind CSS |
| 路由/数据层 | Next.js 14 App Router |

### 遇到的挑战

1. **技术栈未定** — 用户在原始 prompt 中未指定框架/CSS/路由方案，AI 无法单方面推断。通过 `AskUserQuestion` 三个问题一次性确认了 React+TS、Tailwind、Next.js。

2. **Atomic Design 的五层划分** — 哪些组件是 Atom、哪些是 Molecule、哪些是 Organism，对内容型应用而言边界容易模糊。决策标准：
   - **Atom**：无业务语义，纯样式/行为封装（Button、Skeleton、Typography…）
   - **Molecule**：单个业务功能单元（DestinationCard、FilterGroup、FavoriteButton…）
   - **Organism**：多个 Molecule 组合的完整区块（FilterBar = FilterGroup[] + SortSelect + ClearButton）
   - **Template**：页面级布局骨架（MainLayout = Navbar + main + Footer）
   - **Page**：路由入口，负责数据获取并传递给 Templates/Organisms

3. **Server vs Client Component 的决策矩阵** — Next.js 14 App Router 的关键约束是"哪些组件需要 JavaScript"。判断标准：
   - 需要 `onClick` / `useState` / `useEffect` / Browser API → Client
   - 纯数据渲染 → Server（默认）
   - 最终在 40+ 组件中，~55% 为 Client（含交互），~45% 为 Server（纯展示）

4. **状态库的选择（Context vs Zustand）** — MVP 只有两个全局状态（收藏 Set + 设备 ID），引入 Zustand 属于过度工程。React Context 完全胜任。

### AI 的修正/结果

1. 使用 `Plan` agent 生成了 **52KB 的完整组件架构设计**，经用户审批后进入编码

2. 按 5 个 Phase 依次实施，共创建 **65 个源文件**：

| Phase | 内容 | 文件数 |
|-------|------|--------|
| Phase 1: Foundation | types + api-client + 16 Atoms | 20 |
| Phase 2: Hooks + Molecules | 6 Providers/Hooks + 12 Molecules | 18 |
| Phase 3: Organisms | Navbar, FilterBar, DestinationGrid, ImageGallery 等 10 个 | 10 |
| Phase 4: Pages | 5 路由页 + Templates + Providers | 13 |
| Phase 5: Polish | loading.tsx × 3, error.tsx × 1, not-found.tsx × 2, CSS 动画 | 7 |

3. `npm run build` 零错误通过，7 个路由全部正常生成

4. 关键设计决策：
   - **URL 是真理之源** — FilterBar 所有筛选/排序/分页通过 `router.push()` 更新 searchParams，可分享可书签
   - **Server Components 优先** — 仅交互组件标记 `"use client"`
   - **中文本地化** — Noto Sans SC + Inter 字体组合，行高 1.8（中文可读性优化），所有文案中文化
   - **触摸优化** — 最小 44×44px tappable area，移动端 hamburger 菜单 + 折叠筛选 + touch swipe lightbox
   - **乐观更新** — FavoriteButton 点击立即翻转 UI，API 失败回滚 + toast 通知

---

## Prompt 4-2：FastAPI 后端实现

### 用户意图

> "我考虑使用 FastAPI 实现后端。请基于 database/schema.sql 和 docs/api_spec.md，编写后端的路由实现。请优先实现 /destinations 的复杂查询（支持多维度筛选和分页）和 /destinations/{slug} 接口。"

- 选择 FastAPI 作为后端技术栈
- 要求严格按 API spec 契约实现，不能偏离已定义的 JSON 结构
- 优先实现最复杂的查询逻辑（10+ 筛选维度 + M2M 关联 + 分页）

### 遇到的挑战

1. **复杂 SQL 动态构造** — API spec 支持 10+ 筛选维度，其中 `tags` 和 `category` 是 M2M 关联表查询，`difficulty`/`budget`/`crowd_level` 支持逗号分隔多选。解决方案：
   - 枚举字段 → `IN (...) ` 子句
   - M2M 分类→ `EXISTS` 子查询
   - M2M 标签 → 多个 `EXISTS` 子查询（AND 逻辑）
   - 搜索 → `LIKE '%keyword%'`
   - 所有条件通过 `" AND ".join(clauses)` 动态拼接

2. **N+1 查询问题** — 列表接口需要每个 destination 的关联 categories 和 tags。如果逐条查会产生 N+1。采用"先查 destination，收集 IDs，再批量 `IN (?, ?, ?)` 查询"的策略，Python 端用 Map 分发组装。

3. **Python 环境指定** — 用户中途指定使用 `E:\anaconda3\envs\project` (Python 3.11.9 + FastAPI 0.115.0)，所有后续命令和测试需切换到该环境

4. **数据库二次启动报错** — 首次启动后再次启动时报 `index already exists`。原因是 `executescript(schema.sql)` 中的 `CREATE INDEX` 不带 `IF NOT EXISTS`。修复：在 `_init_schema` 中先检测 `destinations` 表是否存在，已存在则跳过整个初始化

5. **端口冲突** — 8080 被占用，后切换到 8000，同步更新前端 6 个文件中的硬编码地址

### AI 的修正/结果

1. 创建了 `backend/` 目录，共 **8 个 Python 文件**：

```
backend/
├── main.py              # FastAPI 入口 + CORS + 静态文件 + /seed + /health
├── database.py          # SQLite 连接 + 幂等 schema 初始化
├── models.py            # Pydantic 请求/响应模型（14 个 model class）
├── routers/
│   ├── destinations.py  # GET /destinations (动态筛选+分页) + GET /destinations/{slug}
│   ├── categories.py    # GET /categories (含 destination_count)
│   ├── tags.py          # GET /tags (支持 ?sort=count)
│   └── user.py          # POST/DELETE favorite + POST view + GET /user/favorites
└── requirements.txt     # fastapi + uvicorn
```

2. **14 个 API 端点全部通过 end-to-end HTTP 测试**：

| 方法 | 端点 | 验证结果 |
|------|------|---------|
| `GET` | `/api/v1/health` | ✅ `{"status":"ok"}` |
| `POST` | `/api/v1/admin/seed` | ✅ 加载 3 目的地 + 3 分类 + 8 标签 + 图片 |
| `GET` | `/api/v1/destinations` | ✅ 默认列表 + 分页 |
| `GET` | `/api/v1/destinations?difficulty=easy&sort=popular` | ✅ 多维筛选正常 |
| `GET` | `/api/v1/destinations/{slug}` | ✅ 完整详情（含 images / categories / tags / travel_info / user_context） |
| `GET` | `/api/v1/categories` | ✅ 含 `destination_count` |
| `GET` | `/api/v1/tags?sort=count` | ✅ 按目的地数量降序 |
| `POST` | `/api/v1/destinations/{slug}/favorite` | ✅ 401 校验 + 切换添加 |
| `DELETE` | `/api/v1/destinations/{slug}/favorite` | ✅ 取消 + 计数同步 |
| `POST` | `/api/v1/destinations/{slug}/view` | ✅ 记录浏览 + 停留时长 |
| `GET` | `/api/v1/user/favorites` | ✅ 分页收藏列表 |
| `GET` | `/images/{path}` | ✅ 静态图片服务（含路径安全校验） |

3. 关键实现要点：
   - **批量关联查询** — `destinations.py` 中 `_fetch_categories_for_destinations()` 和 `_fetch_tags_for_destinations()` 函数实现批量查询 + Python 端分组
   - **动态 WHERE 构造** — `_build_filter_clause()` 函数根据参数动态拼接 SQL 子句和参数列表
   - **冗余计数同步** — `favorite_count`/`view_count` 在 INSERT/DELETE 时通过 `UPDATE destinations SET ...` 同步更新
   - **路径安全** — 静态图片路由 `get_image` 使用 `resolve()` + `startswith()` 防止路径穿越攻击

---

## Prompt 4-3：环境与端口配置修正

### 用户意图

1. "环境请选择 E:\anaconda3\envs\project 这个 python 编译器"
2. "8080 我在使用中，请修改后端 api 端口为 8000，也请相应修改前端相关部分"

### AI 的修正

- 所有 `python` 命令替换为 `"E:/anaconda3/envs/project/python.exe"`
- 批量替换 6 个文件中的 `8080` → `8000`：
  - `next.config.mjs`, `src/lib/api-client.ts`, `src/hooks/useRecordView.ts`, `src/app/favorites/page.tsx`, `src/providers/FavoritesProvider.tsx`, `src/components/atoms/OptimizedImage.tsx`
- 验证：`grep -r "8080" src/ next.config.mjs` 零匹配，`npm run build` 通过

---

## 最终项目文件清单

### 前端 (`src/`) — 65 TSX/TS 文件

```
src/
├── app/ (17 files)
│   ├── layout.tsx, providers.tsx, globals.css
│   ├── page.tsx, loading.tsx, error.tsx, not-found.tsx
│   ├── destinations/
│   │   ├── page.tsx, loading.tsx
│   │   └── [slug]/page.tsx, loading.tsx, not-found.tsx, ViewTracker.tsx
│   ├── categories/page.tsx, [slug]/page.tsx
│   └── favorites/page.tsx
├── components/
│   ├── atoms/ (13 files) — Button, Badge, Tag, Icon, Skeleton, Input, Select, Tooltip, Divider, Typography, Spinner, OptimizedImage, index
│   ├── molecules/ (13 files) — DestinationCard, SkeletonCard, FilterGroup, FavoriteButton, RatingStar, StatBadge, Breadcrumb, TagChip, CategoryBadge, BackToTop, ShareButton, SearchBar, index
│   ├── organisms/ (11 files) — Navbar, Footer, HeroSection, FilterBar, DestinationGrid, ImageGallery, MarkdownViewer, TravelInfoPanel, Pagination, ScrollToTop, index
│   └── templates/ (2 files) — MainLayout, DetailLayout
├── hooks/ (5 files) — useDeviceId, useDebounce, useScrollPosition, useRecordView, index
├── providers/ (3 files) — DeviceProvider, ToastProvider, FavoritesProvider
├── lib/ (3 files) — api-client.ts, api-errors.ts, data.ts
└── types/ (1 file) — api.ts
```

### 后端 (`backend/`) — 8 Python 文件

```
backend/
├── main.py                # FastAPI 入口 (200+ lines)
├── database.py            # SQLite 连接管理
├── models.py              # Pydantic 模型 (300+ lines)
├── routers/
│   ├── destinations.py    # 列表 (动态 WHERE + 分页) + 详情
│   ├── categories.py      # 分类
│   ├── tags.py            # 标签
│   └── user.py            # 收藏/浏览交互
└── requirements.txt       # fastapi + uvicorn
```

---

## 启动命令速查

```bash
# 后端
cd backend
E:/anaconda3/envs/project/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# 首次运行：curl -X POST http://127.0.0.1:8000/api/v1/admin/seed

# 前端
npm run dev
# 访问 http://localhost:3000
```
