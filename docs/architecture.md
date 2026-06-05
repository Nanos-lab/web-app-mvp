# 架构设计文档 — 「100种不可思议旅行」

> **版本**: v1.0 MVP  
> **日期**: 2026-06-05  
> **文档类型**: 技术架构设计文档

---

## 目录

1. [架构总览](#1-架构总览)
2. [技术选型](#2-技术选型)
3. [系统架构图](#3-系统架构图)
4. [前端架构](#4-前端架构)
5. [后端架构](#5-后端架构)
6. [数据库设计](#6-数据库设计)
7. [数据流](#7-数据流)
8. [部署架构](#8-部署架构)
9. [关键设计决策](#9-关键设计决策)

---

## 1. 架构总览

本项目采用**前后端分离**的单体架构，前端为 Next.js 14 SPA/SSR 混合应用，后端为 Python FastAPI REST API，数据存储使用 SQLite 3。

```
┌──────────────────────────┐     HTTP/CORS     ┌──────────────────────┐
│   Next.js 14 (port 3000) │ ◄──────────────► │  FastAPI (port 8000)  │
│   React 18 + TypeScript  │                   │  Python 3.12          │
│   Tailwind CSS + Lucide  │                   │  Uvicorn ASGI         │
└──────────┬───────────────┘                   └──────────┬───────────┘
           │                                              │
           │  localStorage                                 │  sqlite3
           ▼                                              ▼
    ┌──────────────┐                            ┌──────────────────┐
    │  Device UUID  │                            │  SQLite 3 (WAL)  │
    │  Favorites    │                            │  database/travel │
    │  Toast State  │                            │  .db             │
    └──────────────┘                            └──────────────────┘
```

---

## 2. 技术选型

### 2.1 选型对比

| 层面 | 选择 | 备选方案 | 选择理由 |
|------|------|---------|---------|
| **前端框架** | Next.js 14 (App Router) | Nuxt 3 / Remix / SvelteKit | React 生态成熟，服务端组件天然适合内容型站点 SEO |
| **语言** | TypeScript (strict) | JavaScript | 类型安全，API 契约可被前后端共享（Pydantic ↔ TS types） |
| **样式方案** | Tailwind CSS 3 | CSS Modules / Styled Components | 原子化 CSS 构建速度快，与 Next.js 集成最好 |
| **图标库** | Lucide React | Heroicons / Phosphor | 图标数量多（400+），tree-shakable，风格一致 |
| **后端框架** | FastAPI | Flask / Django Ninja | 原生 async 支持，自动 OpenAPI 文档，Pydantic 集成 |
| **ASGI 服务器** | Uvicorn | Gunicorn + Uvicorn workers | MVP 阶段单 worker 足够，部署简单 |
| **数据库** | SQLite 3 (WAL) | PostgreSQL / MySQL | 零配置部署，MVP 数据量小（< 1GB），WAL 模式满足低并发读写 |
| **包管理 (Python)** | pip + requirements.txt | Poetry / PDM | 依赖少（仅 fastapi + uvicorn），无复杂依赖树 |
| **包管理 (Node)** | npm | pnpm / yarn | Next.js 默认工具链，零配置 |

### 2.2 技术栈全景

| 类别 | 技术 | 版本 |
|------|------|------|
| **前端运行时** | Node.js | ≥ 20 LTS |
| **前端框架** | Next.js (App Router) | 14.2 |
| **UI 库** | React | 18.3 |
| **类型系统** | TypeScript | 5.4 |
| **样式** | Tailwind CSS | 3.4 |
| **排版** | @tailwindcss/typography | 0.5 |
| **图标** | lucide-react | 0.400 |
| **后端运行时** | Python | ≥ 3.12 |
| **后端框架** | FastAPI | 0.115 |
| **ASGI 服务器** | Uvicorn | 0.30 |
| **数据验证** | Pydantic | 2.x (内置于 FastAPI) |
| **数据库** | SQLite 3 | ≥ 3.35 |
| **数据库驱动** | sqlite3 (标准库) | — |
| **字体** | Inter + Noto Sans SC | Google Fonts (next/font) |

---

## 3. 系统架构图

### 3.1 C4 — 容器图

```mermaid
C4Context
    title 系统容器图 — 「100种不可思议旅行」

    Person(user, "用户", "旅行灵感寻求者 / 沙发旅行者")

    System_Boundary(app, "Web-App-MVP") {
        Container(web, "Web 应用", "Next.js 14 + React 18", "服务端渲染 + 客户端交互<br/>内容展示 / 筛选 / 收藏")
        Container(api, "REST API", "FastAPI + Uvicorn", "资源 CRUD + 用户交互<br/>JSON 响应 + 静态文件")
        ContainerDb(db, "数据库", "SQLite 3", "目的地 / 分类 / 标签<br/>用户收藏 / 浏览记录")
    }

    Rel(user, web, "浏览页面", "HTTPS (localhost:3000)")
    Rel(web, api, "API 调用", "HTTP + JSON (localhost:8000)")
    Rel(api, db, "读写", "sqlite3 (本地文件)")
    Rel(api, web, "静态图片", "FileResponse")
```

### 3.2 C4 — 组件图（后端）

```mermaid
C4Component
    title 后端组件图 — FastAPI

    Container_Boundary(api, "FastAPI Application") {
        Component(main, "main.py", "应用入口", "lifespan 管理 + CORS + 路由注册 + 异常处理")
        Component(dest_router, "destinations.py", "目的地路由", "列表筛选/分页 + 详情 + 关联数据批量获取")
        Component(cat_router, "categories.py", "分类路由", "全部分类 + 目的地计数")
        Component(tag_router, "tags.py", "标签路由", "全部标签 + 排序")
        Component(user_router, "user.py", "用户交互路由", "收藏(切换/取消) + 浏览记录 + 收藏列表")
        Component(models, "models.py", "Pydantic 模型", "请求/响应模型 + 枚举 + 数据组装")
        Component(database, "database.py", "数据库连接", "单例连接 + Schema 初始化 + WAL 配置")
    }

    ContainerDb(db, "SQLite 3", "文件数据库", "travel.db")

    Rel(main, dest_router, "include_router")
    Rel(main, cat_router, "include_router")
    Rel(main, tag_router, "include_router")
    Rel(main, user_router, "include_router")
    Rel(dest_router, models, "使用")
    Rel(user_router, models, "使用")
    Rel(dest_router, database, "获取连接")
    Rel(user_router, database, "获取连接")
    Rel(database, db, "读写")
```

### 3.3 C4 — 组件图（前端）

```mermaid
C4Component
    title 前端组件图 — Next.js App Router

    Container_Boundary(nextjs, "Next.js Application") {
        Component(layout, "layout.tsx", "根布局", "字体 + 元数据 + Providers 嵌套")
        Component(providers, "providers.tsx", "Provider 链", "DeviceProvider > ToastProvider > FavoritesProvider")
        Component(home, "page.tsx (/)", "首页", "Hero + 热门 + 最新 + CTA")
        Component(list_page, "page.tsx (/destinations)", "列表页", "FilterBar + SearchBar + Grid + Pagination")
        Component(detail_page, "page.tsx (/destinations/[slug])", "详情页", "DetailLayout + ViewTracker")
        Component(fav_page, "page.tsx (/favorites)", "收藏页", "客户端页面")

        Component(atoms, "atoms/ (12)", "基础组件", "Button/Badge/Tag/Skeleton/Image...")
        Component(molecules, "molecules/ (12)", "组合组件", "DestinationCard/FavoriteButton/FilterGroup...")
        Component(organisms, "organisms/ (10)", "区块组件", "Navbar/Footer/Hero/FilterBar/ImageGallery/Pagination...")
        Component(templates, "templates/ (2)", "布局模板", "MainLayout/DetailLayout")
        Component(hooks, "hooks/ (4)", "自定义 Hooks", "useDeviceId/useDebounce/useScrollPosition/useRecordView")
        Component(lib, "lib/ (3)", "工具库", "api-client/api-errors/data")
    }

    Rel(layout, providers, "包裹")
    Rel(home, templates, "使用")
    Rel(list_page, templates, "使用")
    Rel(detail_page, templates, "使用")
    Rel(fav_page, templates, "使用")
    Rel(templates, organisms, "组合")
    Rel(organisms, molecules, "组合")
    Rel(molecules, atoms, "组合")
    Rel(list_page, hooks, "使用")
    Rel(detail_page, hooks, "使用")
    Rel(lib, "fetch", "→ Backend API")
```

---

## 4. 前端架构

### 4.1 组件设计方法论：Atomic Design

```mermaid
flowchart TD
    subgraph Templates["📐 Templates (2)"]
        MainLayout["MainLayout<br/>页面级 chrome"]
        DetailLayout["DetailLayout<br/>详情页 chrome"]
    end

    subgraph Organisms["🧩 Organisms (10)"]
        Navbar["Navbar"]:::org
        Footer["Footer"]:::org
        HeroSection["HeroSection"]:::org
        FilterBar["FilterBar"]:::org
        DestinationGrid["DestinationGrid"]:::org
        ImageGallery["ImageGallery"]:::org
        MarkdownViewer["MarkdownViewer"]:::org
        TravelInfoPanel["TravelInfoPanel"]:::org
        Pagination["Pagination"]:::org
        ScrollToTop["ScrollToTop"]:::org
    end

    subgraph Molecules["🔗 Molecules (12)"]
        DestinationCard["DestinationCard"]
        SkeletonCard["SkeletonCard"]
        FilterGroup["FilterGroup"]
        FavoriteButton["FavoriteButton"]
        RatingStar["RatingStar"]
        StatBadge["StatBadge"]
        Breadcrumb["Breadcrumb"]
        TagChip["TagChip"]
        CategoryBadge["CategoryBadge"]
        SearchBar["SearchBar"]
        BackToTop["BackToTop"]
        ShareButton["ShareButton"]
    end

    subgraph Atoms["⚛️ Atoms (12)"]
        Button["Button"]
        Badge["Badge"]
        Tag["Tag"]
        Spinner["Spinner"]
        Skeleton["Skeleton"]
        Icon["Icon"]
        Input["Input"]
        Select["Select"]
        Tooltip["Tooltip"]
        Divider["Divider"]
        Typography["Typography"]
        OptimizedImage["OptimizedImage"]
    end

    Templates --> Organisms
    Organisms --> Molecules
    Molecules --> Atoms

    classDef org fill:#e1f5fe,stroke:#0288d1
```

### 4.2 渲染策略

| 页面 | 渲染策略 | 原因 |
|------|---------|------|
| `/` (首页) | Server Component | 数据静态、SEO 关键、无交互状态 |
| `/destinations` | Server Component | 默认视图可服务端渲染，筛选参数通过 URL searchParams 传递 |
| `/destinations/[slug]` | Server Component | 内容页，SEO 核心（generateMetadata） |
| `/categories` / `/[slug]` | Server Component | 数据静态 |
| `/favorites` | Client Component | 完全依赖客户端 device UUID |

**混合渲染模式**：页面主体是 Server Component（在服务端 fetch 数据），交互部分作为 Client Component Islands 嵌入（FilterBar 的展开/收起、FavoriteButton 的心形点击、ImageGallery 的灯箱）。

### 4.3 状态管理

```mermaid
flowchart LR
    subgraph ServerState["服务端状态"]
        direction TB
        Cache["React cache()<br/>请求去重"]
        Fetch["fetch() → Backend API"]
    end

    subgraph ClientState["客户端状态 (React Context)"]
        direction TB
        Device["DeviceProvider<br/>UUID 生成 + localStorage"]
        Toast["ToastProvider<br/>通知队列"]
        Favorites["FavoritesProvider<br/>收藏状态 + 乐观更新"]
    end

    subgraph BrowserState["浏览器状态"]
        direction TB
        LS["localStorage"]
        URL["URL searchParams<br/>筛选状态"]
        Scroll["scroll 位置"]
    end

    ServerState -->|"SSR 直出 HTML"| ClientState
    ClientState -->|"读写"| BrowserState
    Favorites -->|"乐观更新 + 失败回滚"| Fetch
```

---

## 5. 后端架构

### 5.1 路由设计

```
/api/v1/
├── health                          GET    健康检查
├── admin/seed                      POST   加载种子数据（开发用）
├── destinations                    GET    列表（筛选/排序/分页）
├── destinations/{slug}             GET    详情
├── destinations/{slug}/favorite    POST   切换收藏 (幂等)
├── destinations/{slug}/favorite    DELETE 取消收藏
├── destinations/{slug}/view        POST   记录浏览
├── categories                      GET    全部分类
├── tags                            GET    全部标签
└── user/favorites                  GET    用户收藏列表
```

### 5.2 请求处理流程

```mermaid
sequenceDiagram
    actor User
    participant Next as Next.js
    participant API as FastAPI
    participant DB as SQLite

    User->>Next: 访问 /destinations
    Next->>API: GET /api/v1/destinations?category=natural-wonders&sort=popular
    API->>API: 参数校验 (Query validators)
    API->>API: 构建 WHERE 子句 (_build_filter_clause)
    API->>DB: SELECT COUNT(*) ... WHERE ...
    DB-->>API: total = 23
    API->>DB: SELECT d.* ... WHERE ... ORDER BY view_count DESC LIMIT 20 OFFSET 0
    DB-->>API: rows[]
    API->>DB: SELECT ... FROM destination_categories WHERE destination_id IN (...)
    DB-->>API: category_map
    API->>DB: SELECT ... FROM destination_tags WHERE destination_id IN (...)
    DB-->>API: tag_map
    API->>API: 组装 DestinationCard[] + PaginationMeta
    API-->>Next: { data: [...], meta: {...} }
    Next->>Next: RSC 渲染 HTML
    Next-->>User: 完整页面 HTML
```

### 5.3 错误处理层次

```
Layer 1: FastAPI 内置验证 → 422 Validation Error (参数格式错误)
Layer 2: 路由级校验 → 400 / 401 (业务参数错误)
Layer 3: 数据库查询 → 404 / 410 (资源不存在)
Layer 4: 全局 Exception Handler → 500 (未预料的异常)
```

---

## 6. 数据库设计

### 6.1 完整 ER 图

```mermaid
erDiagram
    destinations {
        INTEGER id PK "自增主键"
        TEXT title "中文标题 NOT NULL"
        TEXT title_en "英文标题"
        TEXT slug UK "URL 标识 UNIQUE"
        TEXT subtitle "一句话副标题"
        TEXT summary "150字概要"
        TEXT description "Markdown 正文"
        TEXT country "国家 NOT NULL"
        TEXT region "地区/省份"
        TEXT continent "大洲"
        REAL latitude "纬度"
        REAL longitude "经度"
        INTEGER elevation "海拔(米)"
        TEXT best_season "最佳季节"
        TEXT difficulty "难度 CHECK(easy/moderate/difficult/extreme)"
        TEXT duration "建议天数"
        TEXT budget "预算 CHECK(budget/moderate/luxury)"
        TEXT crowd_level "拥挤度 CHECK(low/medium/high)"
        TEXT temperature "温度区间"
        TEXT visa_info "签证说明"
        TEXT language "当地语言"
        TEXT currency "当地货币"
        TEXT timezone "时区"
        TEXT fun_facts "JSON数组"
        TEXT travel_tips "JSON数组"
        TEXT safety_notes "安全须知"
        TEXT getting_there "JSON对象"
        TEXT cover_image_url "封面图URL (16:9)"
        TEXT thumbnail_url "缩略图URL (1:1)"
        INTEGER photo_count "图片总数 DEFAULT 0"
        INTEGER view_count "浏览次数 DEFAULT 0"
        INTEGER favorite_count "收藏次数 DEFAULT 0"
        REAL rating "平均评分 DEFAULT 0"
        INTEGER rating_count "评分人数 DEFAULT 0"
        TEXT status "状态 CHECK(published/draft/archived)"
        INTEGER sort_order "排序权重 DEFAULT 0"
        TEXT created_at "创建时间 DEFAULT datetime('now')"
        TEXT updated_at "更新时间 DEFAULT datetime('now')"
    }

    categories {
        INTEGER id PK
        TEXT name UK "分类名 UNIQUE"
        TEXT slug UK "URL标识 UNIQUE"
        TEXT description "分类描述"
        TEXT icon "Emoji图标"
        TEXT cover_image_url "封面图"
        INTEGER sort_order "排序"
    }

    tags {
        INTEGER id PK
        TEXT name UK "标签名 UNIQUE"
        TEXT slug UK "URL标识 UNIQUE"
    }

    destination_categories {
        INTEGER destination_id PK,FK "CASCADE"
        INTEGER category_id PK,FK "CASCADE"
    }

    destination_tags {
        INTEGER destination_id PK,FK "CASCADE"
        INTEGER tag_id PK,FK "CASCADE"
    }

    destination_images {
        INTEGER id PK
        INTEGER destination_id FK "CASCADE"
        TEXT url "图片URL NOT NULL"
        TEXT thumbnail_url "缩略图"
        TEXT alt_text "无障碍文本"
        INTEGER width "宽度"
        INTEGER height "高度"
        INTEGER sort_order "排序"
        INTEGER is_cover "是否封面 0/1"
        TEXT photographer "摄影师"
        TEXT source "来源"
        TEXT license "许可"
    }

    user_favorites {
        INTEGER id PK
        TEXT user_id "设备UUID NOT NULL"
        INTEGER destination_id FK "CASCADE"
        TEXT created_at "收藏时间"
    }

    user_views {
        INTEGER id PK
        TEXT user_id "设备UUID NOT NULL"
        INTEGER destination_id FK "CASCADE"
        TEXT viewed_at "浏览时间"
        INTEGER duration_seconds "停留秒数"
    }

    destinations ||--o{ destination_categories : "N:M"
    categories ||--o{ destination_categories : "N:M"
    destinations ||--o{ destination_tags : "N:M"
    tags ||--o{ destination_tags : "N:M"
    destinations ||--o{ destination_images : "1:N"
    destinations ||--o{ user_favorites : "1:N"
    destinations ||--o{ user_views : "1:N"
```

### 6.2 索引设计

| 索引名 | 列 | 用途 | 类型 |
|--------|---|------|------|
| `idx_destinations_status` | `status` | 只查询已发布内容 | 普通索引 |
| `idx_destinations_continent` | `continent` | 按大洲筛选 | 普通索引 |
| `idx_destinations_country` | `country` | 按国家筛选 | 普通索引 |
| `idx_destinations_difficulty` | `difficulty` | 按难度筛选 | 普通索引 |
| `idx_destinations_budget` | `budget` | 按预算筛选 | 普通索引 |
| `idx_destinations_favorite_count` | `favorite_count DESC` | 收藏排序 | 降序索引 |
| `idx_destinations_view_count` | `view_count DESC` | 热门排序 | 降序索引 |
| `idx_destination_images_dest` | `destination_id` | 查询图片集 | 外键索引 |
| `idx_user_favorites_user` | `user_id` | 查询用户收藏 | 普通索引 |
| `idx_user_favorites_dest` | `destination_id` | 查询某目的地收藏数 | 普通索引 |
| `idx_user_views_user` | `user_id` | 查询用户浏览历史 | 普通索引 |
| `idx_user_views_dest` | `destination_id` | 查询某目的地浏览数 | 普通索引 |
| `idx_user_views_time` | `viewed_at DESC` | 按时间排序浏览记录 | 降序索引 |

### 6.3 触发器

| 触发器 | 时机 | 作用 |
|--------|------|------|
| `trg_destinations_updated_at` | AFTER UPDATE ON destinations | 自动更新 `updated_at` 为当前时间 |

---

## 7. 数据流

### 7.1 收藏操作流程

```mermaid
sequenceDiagram
    actor User
    participant Card as DestinationCard
    participant Provider as FavoritesProvider
    participant API as FastAPI
    participant DB as SQLite

    User->>Card: 点击心形图标
    Card->>Provider: toggleFavorite(slug)
    Provider->>Provider: 乐观更新 (setState)
    Provider->>Provider: 触发 heart-beat 动画
    Note over Provider: is_favorited 立即切换为 true<br/>favorite_count 立即 +1
    Provider->>API: POST /destinations/{slug}/favorite<br/>Header: X-Device-Id: <uuid>
    API->>DB: SELECT ... FROM user_favorites<br/>WHERE user_id=? AND destination_id=?
    DB-->>API: 无记录 (未收藏)
    API->>DB: INSERT INTO user_favorites<br/>UPDATE destinations SET favorite_count+1
    DB-->>API: OK
    API-->>Provider: { is_favorited: true, favorite_count: 3843 }
    Provider->>Provider: 对比返回值与本地状态
    Note over Provider: 如不一致则回滚
    Provider-->>User: Toast "已收藏"
```

### 7.2 浏览记录流程

```mermaid
sequenceDiagram
    actor User
    participant Page as DetailPage
    participant Tracker as ViewTracker
    participant API as FastAPI
    participant DB as SQLite

    User->>Page: 进入 /destinations/salar-de-uyuni
    Page->>Tracker: mount
    Tracker->>API: POST /destinations/salar-de-uyuni/view<br/>X-Device-Id: <uuid><br/>Body: {} (无 duration)
    API->>DB: INSERT INTO user_views<br/>UPDATE destinations SET view_count+1
    API-->>Tracker: { slug: "...", view_count: 12601 }
    Note over Tracker: 记录进入时间 startTime

    User->>Page: 浏览内容... (45s)

    User->>Page: 关闭标签页 / 导航离开
    Page->>Tracker: unmount (beforeunload)
    Tracker->>Tracker: 计算 duration = now - startTime
    Tracker->>API: navigator.sendBeacon()<br/>POST /destinations/salar-de-uyuni/view<br/>X-Device-Id: <uuid><br/>Body: { duration_seconds: 45 }
    Note over API: sendBeacon 不等待响应<br/>保证页面卸载时数据不丢失
```

---

## 8. 部署架构

### 8.1 开发环境

```mermaid
flowchart LR
    subgraph Dev["本地开发环境"]
        Terminal1["Terminal 1<br/>cd backend<br/>uvicorn main:app --port 8000 --reload"]
        Terminal2["Terminal 2<br/>npm run dev<br/>next dev -p 3000"]
        DB_Dev[("database/travel.db<br/>本地文件")]
        Images_Dev[("images/<br/>静态图片")]
    end

    Terminal1 --> DB_Dev
    Terminal1 --> Images_Dev
    Terminal2 -->|"fetch localhost:8000"| Terminal1
```

### 8.2 生产环境（推荐）

```mermaid
flowchart TB
    subgraph VPS["VPS / Cloud VM"]
        direction TB
        Nginx["Nginx<br/>反向代理 + 静态资源缓存"]
        subgraph App["Application"]
            Next_Prod["Next.js<br/>next start -p 3000"]
            FastAPI_Prod["FastAPI<br/>uvicorn main:app --port 8000"]
        end
        DB_Prod[("database/travel.db")]
    end

    User_Prod["🌐 User"] -->|HTTPS| Nginx
    Nginx -->|"/"| Next_Prod
    Nginx -->|"/api/*"| FastAPI_Prod
    Nginx -->|"/images/*"| FastAPI_Prod
    FastAPI_Prod --> DB_Prod
    Next_Prod -->|"SSR fetch"| FastAPI_Prod
```

> **注意**: SQLite 在单服务器部署下完全够用。如需水平扩展，应迁移至 PostgreSQL 并使用共享存储或 CDN 分发图片。

---

## 9. 关键设计决策

### 9.1 决策记录

| ID | 决策 | 理由 | 权衡 |
|----|------|------|------|
| ADR-001 | 使用匿名 Device UUID 而非用户系统 | MVP 不需要用户注册，降低开发复杂度和合规负担 | 收藏数据无法跨设备同步，无法防止刷量 |
| ADR-002 | 冗余计数而非实时 COUNT | 列表排序需要 `ORDER BY favorite_count`，实时 COUNT 性能差 | 需要维护一致性（应用层 + 未来触发器） |
| ADR-003 | 列表型数据存为 JSON 字符串 | `fun_facts`/`travel_tips` 始终整体读写，无需跨行查询 | 无法按单个 fact/tip 搜索（可用 FTS5 弥补） |
| ADR-004 | 静态图片通过 FastAPI 路由服务 | 避免 Next.js 的 `public/` 与后端图片目录耦合 | 生产环境应迁移至 CDN + 签名 URL |
| ADR-005 | 前端筛选状态通过 URL searchParams | 可分享筛选结果链接，支持浏览器前进/后退 | URL 可能较长（可通过短链服务优化） |
| ADR-006 | 图片独立建表 | 携带版权元数据（photographer/source/license），支持排序和封面标识 | 查询详情时多一次 JOIN |
| ADR-007 | 不使用 ORM | MVP 阶段表结构简单，raw SQL 更灵活、透明 | 缺少迁移管理工具（可通过版本化 SQL 文件弥补） |

### 9.2 技术债务 (MVP 已知)

| 项目 | 严重程度 | 缓解计划 |
|------|---------|---------|
| 无自动化迁移 | 中 | v1.1 引入 Alembic 或手动版本化 SQL |
| 冗余计数可能不一致 | 低 | v1.1 添加定期修复 Job 或触发器同步 |
| 无 API 限流 | 低 | v1.1 添加 slowapi 中间件 |
| 无请求日志 | 低 | v1.1 添加 structlog 中间件 |
| SQLite 不支持并发写 | 低 | v1.2 迁移至 PostgreSQL |

---

> **版本历史**  
> - v1.0 (2026-06-05) — MVP 架构设计文档初版  
> - 配套文档：[PRD](./PRD.md) · [API 契约](./api_spec.md) · [数据库设计](./database-design.md) · [前端组件架构](./frontend-architecture.md)
