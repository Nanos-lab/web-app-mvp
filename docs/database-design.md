# 数据库设计文档 — 「100种不可思议旅行」MVP

## 1. 概述

本文档描述「100种不可思议旅行」的 SQLite 数据库设计。该应用是一个内容驱动的小众旅行目的地展示平台，MVP 阶段聚焦于**内容消费**与**轻量用户交互**。

### 技术选型
- **数据库**: SQLite 3（轻量、零配置、适合 MVP）
- **ORM/查询层**: 待定（推荐 Drizzle ORM 或 raw SQL）
- **JSON 策略**: 列表型富文本（贴士、趣闻）以 JSON 字符串存储，减少 JOIN

---

## 2. 实体关系图 (ERD)

```
destinations (1) ────── M2M ────── (M) categories
    │
    │ 1:M
    ├── destination_images
    │
    │ M2M
    └── tags (via destination_tags)

destinations (1) ────── 1:M ────── (M) user_favorites
destinations (1) ────── 1:M ────── (M) user_views
```

---

## 3. 表结构详解

### 3.1 destinations（目的地）

核心表。每条记录代表一个不可思议的旅行目的地。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK | 自增主键 |
| `title` | TEXT NOT NULL | 中文标题 |
| `title_en` | TEXT | 英文标题 |
| `slug` | TEXT UNIQUE | URL 标识，如 `salar-de-uyuni` |
| `subtitle` | TEXT | 一句话吸引语 |
| `summary` | TEXT | 150 字概要（列表卡片展示） |
| `description` | TEXT | 完整 Markdown 正文 |
| `country` | TEXT NOT NULL | 所在国家 |
| `region` | TEXT | 地区/省份 |
| `continent` | TEXT | 大洲（用于按大洲筛选） |
| `latitude` / `longitude` | REAL | GPS 坐标（地图集成） |
| `elevation` | INTEGER | 海拔（米） |
| `best_season` | TEXT | 最佳旅行时间 |
| `difficulty` | TEXT CHECK | easy / moderate / difficult / extreme |
| `duration` | TEXT | 建议停留天数 |
| `budget` | TEXT CHECK | budget / moderate / luxury |
| `crowd_level` | TEXT CHECK | low / medium / high |
| `temperature` | TEXT | 温度区间描述 |
| `visa_info` | TEXT | 签证要求 |
| `language` | TEXT | 当地语言 |
| `currency` | TEXT | 当地货币 |
| `timezone` | TEXT | 时区 |
| `fun_facts` | TEXT (JSON) | 冷知识数组 `["...", "..."]` |
| `travel_tips` | TEXT (JSON) | 旅行贴士数组 |
| `safety_notes` | TEXT | 安全须知 |
| `getting_there` | TEXT (JSON) | 交通指南对象 |
| `cover_image_url` | TEXT | 封面图 |
| `thumbnail_url` | TEXT | 缩略图 |
| `photo_count` | INTEGER | 图片总数（冗余） |
| `view_count` | INTEGER | 浏览次数（冗余） |
| `favorite_count` | INTEGER | 收藏次数（冗余） |
| `rating` | REAL | 平均评分 0-5 |
| `rating_count` | INTEGER | 评分人数 |
| `status` | TEXT CHECK | published / draft / archived |
| `sort_order` | INTEGER | 手动排序权重 |

> **设计决策**: `view_count`、`favorite_count`、`rating` 采用冗余计数而非实时 COUNT()。MVP 数据量小，但不养成依赖 COUNT 查询的习惯有利于未来扩展。触发器或应用层负责同步这些值。

### 3.2 categories（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK | 自增 |
| `name` | TEXT UNIQUE | 分类名 |
| `slug` | TEXT UNIQUE | URL 标识 |
| `description` | TEXT | 描述 |
| `icon` | TEXT | Emoji 或 icon-class |
| `cover_image_url` | TEXT | 封面图 |
| `sort_order` | INTEGER | 排序 |

**预设分类**（覆盖 100 个目的地的维度）：
1. 🌋 自然奇观
2. 🕳️ 地下秘境
3. 🎨 色彩之地
4. 🏚️ 遗世之地
5. 🏛️ 人造奇观
6. 💧 水域幻境
7. 🌌 天空之境
8. 🗿 远古密码

### 3.3 tags（标签）

扁平标签系统，支持跨分类检索。

**预设标签**：星空摄影、无人机必飞、日出日落、洞穴探险、被低估、此生必去、INS网红、生态奇观、极限挑战、文化震撼……

### 3.4 destination_images（目的地图片）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK | 自增 |
| `destination_id` | FK → destinations | 所属目的地 |
| `url` | TEXT NOT NULL | 图片 URL |
| `thumbnail_url` | TEXT | 缩略图 |
| `alt_text` | TEXT | 无障碍文本 |
| `width` / `height` | INTEGER | 尺寸 |
| `sort_order` | INTEGER | 排序 |
| `is_cover` | INTEGER (0/1) | 是否主封面 |
| `photographer` | TEXT | 摄影师署名 |
| `source` | TEXT | 来源 |
| `license` | TEXT | 许可 |

### 3.5 user_favorites（用户收藏）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK | 自增 |
| `user_id` | TEXT NOT NULL | 用户标识（MVP 使用 device UUID） |
| `destination_id` | FK → destinations | 目的地 |
| `created_at` | TEXT | 收藏时间 |
| UNIQUE(user_id, destination_id) | — | 防止重复收藏 |

### 3.6 user_views（浏览记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK | 自增 |
| `user_id` | TEXT NOT NULL | 用户标识 |
| `destination_id` | FK → destinations | 目的地 |
| `viewed_at` | TEXT | 浏览时间 |
| `duration_seconds` | INTEGER | 停留时长 |

---

## 4. 核心 JSON 结构

### 4.1 目的地详情 API 响应结构

```json
{
  "id": 1,
  "title": "玻利维亚 · 天空之镜",
  "title_en": "Salar de Uyuni",
  "slug": "salar-de-uyuni",
  "subtitle": "世界最大的镜面，漫步在云端之上",
  "summary": "乌尤尼盐沼是世界上最大的盐滩...",
  "description": "<Markdown HTML>",
  "location": {
    "country": "玻利维亚",
    "region": "波托西省",
    "continent": "南美洲",
    "coordinates": { "lat": -20.1338, "lng": -67.4893 },
    "elevation": 3656
  },
  "travel_info": {
    "best_season": "12月 - 3月",
    "difficulty": "moderate",
    "duration": "3-4天",
    "budget": "moderate",
    "crowd_level": "low",
    "temperature": "-5°C ~ 15°C"
  },
  "practical": {
    "visa_info": "持中国护照可落地签",
    "language": "西班牙语、克丘亚语",
    "currency": "玻利维亚诺 (BOB)",
    "timezone": "UTC-4"
  },
  "fun_facts": ["...", "..."],
  "travel_tips": ["...", "..."],
  "safety_notes": "...",
  "getting_there": {
    "nearest_airport": "乌尤尼机场 (UYU)",
    "routes": ["...", "..."],
    "local_transport": "..."
  },
  "media": {
    "cover_image_url": "...",
    "thumbnail_url": "...",
    "images": [
      {
        "id": 1,
        "url": "...",
        "thumbnail_url": "...",
        "alt_text": "...",
        "width": 2400, "height": 1350,
        "photographer": "Daniel Campos",
        "source": "Unsplash"
      }
    ]
  },
  "categories": [
    { "id": 1, "name": "自然奇观", "slug": "natural-wonders" }
  ],
  "tags": [
    { "id": 1, "name": "星空摄影", "slug": "astrophotography" }
  ],
  "stats": {
    "view_count": 12600,
    "favorite_count": 3842,
    "rating": 4.8,
    "rating_count": 256
  },
  "status": "published",
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-05-20T14:30:00Z"
}
```

### 4.2 列表卡片 API 响应结构

```json
{
  "id": 1,
  "title": "玻利维亚 · 天空之镜",
  "slug": "salar-de-uyuni",
  "subtitle": "世界最大的镜面，漫步在云端之上",
  "summary": "乌尤尼盐沼是世界上最大的盐滩...",
  "country": "玻利维亚",
  "continent": "南美洲",
  "difficulty": "moderate",
  "budget": "moderate",
  "thumbnail_url": "...",
  "categories": [{ "id": 1, "name": "自然奇观" }],
  "stats": {
    "view_count": 12600,
    "favorite_count": 3842,
    "rating": 4.8
  }
}
```

---

## 5. 设计决策与权衡

### 5.1 为什么用冗余计数
`view_count`、`favorite_count` 在 `destinations` 表中冗余存储，而非每次实时 COUNT。原因是：
- 列表页排序需要这些值参与 `ORDER BY`
- MVP 阶段写操作少、读操作多，冗余成本低于 COUNT 查询
- 未来扩展时可通过触发器或 MQ 保证一致性

### 5.2 为什么 user_id 用 TEXT 而非 INTEGER
MVP 阶段无完整用户系统，使用 device UUID / anonymous ID 即可标识用户。TEXT 类型的灵活性允许后续无缝迁移到正式用户 ID。

### 5.3 为什么 fun_facts / travel_tips 用 JSON 字符串
这些数据具有以下特征：
- 只作为整体读取和写入，从不跨行查询
- 长度可变，规范化会带来额外的 JOIN 开销
- 前端可以直接 `JSON.parse()` 后渲染列表

SQLite 原生支持 JSON 函数（`json_extract` 等），必要时仍可穿透查询。

### 5.4 图片为何独立建表
- 一个目的地通常有 3-8 张高质量图片
- 图片需要携带版权元数据（photographer, source, license）
- 独立建表支持按 `sort_order` 排序和 `is_cover` 筛选

---

## 6. 索引策略

| 索引 | 用途 |
|------|------|
| `idx_destinations_status` | 只查询已发布内容 |
| `idx_destinations_continent` | 按大洲筛选 |
| `idx_destinations_country` | 按国家筛选 |
| `idx_destinations_difficulty` | 按难度筛选 |
| `idx_destinations_budget` | 按预算筛选 |
| `idx_destinations_favorite_count DESC` | 热门排序 |
| `idx_destinations_view_count DESC` | 热门排序 |
| `idx_user_favorites_user` | 查询用户收藏列表 |
| `idx_user_views_user` | 查询用户浏览历史 |

---

## 7. 后续演进方向

- **全文搜索**: 引入 FTS5 对 title/summary/description 建索引
- **用户评分**: 增加 `user_ratings` 表，独立存储每个用户的评分
- **多语言**: 将 title/summary/description 等字段迁移到独立的 i18n 表
- **行程规划**: 增加 `itineraries` 表，允许多目的地组合
- **CDN 集成**: 图片 URL 从本地路径迁移到 CDN
