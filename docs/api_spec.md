# RESTful API 契约 — 「100种不可思议旅行」MVP v1.0

> **Base URL**: `http://localhost:8080/api/v1`
> **Content-Type**: `application/json; charset=utf-8`
> **日期格式**: ISO 8601 (`2026-06-05T14:30:00Z`)

---

## 目录

1. [通用约定](#1-通用约定)
2. [目的地](#2-目的地-destinations)
   - [获取目的地列表](#21-获取目的地列表)
   - [获取目的地详情](#22-获取目的地详情)
3. [分类](#3-分类-categories)
   - [获取全部分类](#31-获取全部分类)
4. [标签](#4-标签-tags)
   - [获取全部标签](#41-获取全部标签)
5. [用户交互](#5-用户交互)
   - [收藏目的地](#51-收藏目的地)
   - [取消收藏](#52-取消收藏)
   - [获取用户收藏列表](#53-获取用户收藏列表)
   - [记录浏览](#54-记录浏览)
6. [附录](#6-附录)
   - [枚举值汇总](#61-枚举值汇总)
   - [HTTP 状态码速查](#62-http-状态码速查)

---

## 1. 通用约定

### 1.1 请求头

```
Content-Type: application/json
Accept: application/json
X-Device-Id: <device_uuid>        # 需要用户上下文的接口必传
```

### 1.2 分页

所有列表接口统一使用以下查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码（从 1 开始） |
| `page_size` | integer | 20 | 每页条数（最大 100） |

分页响应统一包裹在 `meta` 字段中：

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### 1.3 错误响应格式

所有错误返回统一结构：

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "未找到该目的地",
    "details": {}
  }
}
```

### 1.4 筛选参数通用格式

多选筛选使用逗号分隔：

```
?tags=astrophotography,bucket-list
?difficulty=easy,moderate
```

---

## 2. 目的地 (Destinations)

### 2.1 获取目的地列表

返回已发布的目的地卡片列表，支持多维筛选与排序。

```
GET /destinations
```

#### 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `page_size` | integer | 20 | 每页条数（最大 100） |
| `sort` | string | `sort_order` | 排序方式（见下方枚举） |
| `tags` | string | — | 标签 slug，逗号分隔（AND 逻辑） |
| `category` | string | — | 分类 slug（单选） |
| `continent` | string | — | 大洲（单选） |
| `country` | string | — | 国家（单选） |
| `difficulty` | string | — | 难度，逗号分隔 |
| `budget` | string | — | 预算等级，逗号分隔 |
| `crowd_level` | string | — | 拥挤程度，逗号分隔 |
| `search` | string | — | 标题关键词搜索（LIKE 匹配） |

**`sort` 枚举值：**

| 值 | 说明 |
|------|------|
| `sort_order` | 手动排序（默认） |
| `newest` | 最新发布 `created_at DESC` |
| `popular` | 最热门 `view_count DESC` |
| `favorites` | 最多收藏 `favorite_count DESC` |
| `rating` | 最高评分 `rating DESC` |

#### 响应 `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "title": "玻利维亚 · 天空之镜",
      "slug": "salar-de-uyuni",
      "subtitle": "世界最大的镜面，漫步在云端之上",
      "summary": "乌尤尼盐沼是世界上最大的盐滩，面积超过 10,000 平方公里…",
      "country": "玻利维亚",
      "continent": "南美洲",
      "difficulty": "moderate",
      "budget": "moderate",
      "duration": "3-4天",
      "thumbnail_url": "/images/destinations/salar-de-uyuni/thumb.jpg",
      "categories": [
        { "id": 1, "name": "自然奇观", "slug": "natural-wonders" }
      ],
      "tags": [
        { "id": 1, "name": "星空摄影", "slug": "astrophotography" },
        { "id": 6, "name": "此生必去", "slug": "bucket-list" }
      ],
      "stats": {
        "view_count": 12600,
        "favorite_count": 3842,
        "rating": 4.8
      },
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

#### 可能的错误状态码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| `400` | `INVALID_FILTER` | 筛选参数值不在允许范围内 |
| `400` | `INVALID_SORT` | sort 参数值无效 |
| `400` | `PAGE_SIZE_EXCEEDED` | page_size 超过 100 |
| `422` | `VALIDATION_ERROR` | 参数格式错误 |

---

### 2.2 获取目的地详情

通过 slug 获取单个目的地的完整信息，包括正文、图片集、交通指南等。

```
GET /destinations/{slug}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `slug` | string | 目的地 URL 标识，如 `salar-de-uyuni` |

#### 响应 `200 OK`

```json
{
  "data": {
    "id": 1,
    "title": "玻利维亚 · 天空之镜",
    "title_en": "Salar de Uyuni",
    "slug": "salar-de-uyuni",
    "subtitle": "世界最大的镜面，漫步在云端之上",
    "summary": "乌尤尼盐沼是世界上最大的盐滩，面积超过 10,000 平方公里。雨季时，一层薄水覆盖盐壳，形成一面完美的天然镜面，天地融为一体。",
    "description": "<h2>为什么不可思议</h2><p>乌尤尼盐沼…</p>",

    "location": {
      "country": "玻利维亚",
      "region": "波托西省",
      "continent": "南美洲",
      "coordinates": { "lat": -20.1338, "lng": -67.4893 },
      "elevation": 3656
    },

    "travel_info": {
      "best_season": "12月 - 3月（雨季镜面） / 6月 - 8月（旱季星空）",
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

    "fun_facts": [
      "盐沼厚度从几厘米到 10 米不等，总盐量相当于整个地球人口 40 年的食盐消费量",
      "每年有超过 25,000 只火烈鸟在附近湖泊繁殖",
      "盐沼的平坦度极值偏差不到 1 米——在整个 10,000 km² 范围内"
    ],

    "travel_tips": [
      "必须带墨镜——白天的盐沼反射极强",
      "雨季进入盐沼需要四驱越野车，务必找有经验的当地向导",
      "日出和日落是拍摄镜面倒影的黄金时间"
    ],

    "safety_notes": "高原反应是主要风险。海拔 3,656 米，建议提前服用高原安。",

    "getting_there": {
      "nearest_airport": "乌尤尼机场 (UYU)",
      "routes": [
        "从拉巴斯乘飞机 1 小时直达乌尤尼镇",
        "从拉巴斯乘夜班大巴约 10-12 小时（不推荐，路况差）"
      ],
      "local_transport": "乌尤尼镇出发的盐沼 Tour 是唯一可行的游览方式"
    },

    "media": {
      "cover_image_url": "/images/destinations/salar-de-uyuni/cover.jpg",
      "thumbnail_url": "/images/destinations/salar-de-uyuni/thumb.jpg",
      "images": [
        {
          "id": 1,
          "url": "/images/destinations/salar-de-uyuni/01-mirror.jpg",
          "thumbnail_url": "/images/destinations/salar-de-uyuni/01-mirror-thumb.jpg",
          "alt_text": "雨季镜面效果：人站立在盐沼中，倒影完美对称",
          "width": 2400,
          "height": 1350,
          "photographer": "Daniel Campos",
          "source": "Unsplash",
          "license": "Unsplash Free"
        }
      ]
    },

    "categories": [
      { "id": 1, "name": "自然奇观", "slug": "natural-wonders" }
    ],

    "tags": [
      { "id": 1, "name": "星空摄影", "slug": "astrophotography" },
      { "id": 6, "name": "此生必去", "slug": "bucket-list" }
    ],

    "stats": {
      "view_count": 12600,
      "favorite_count": 3842,
      "rating": 4.8,
      "rating_count": 256
    },

    "user_context": {
      "is_favorited": true
    },

    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-05-20T14:30:00Z"
  }
}
```

> **设计说明** — 响应将数据库扁平字段组织为 6 个语义分组（`location` / `travel_info` / `practical` / `media` / `stats` / `user_context`），前端无需自行拆分。
>
> `user_context` 仅在请求头携带 `X-Device-Id` 时返回；否则该字段为 `null`。
>
> `fun_facts` 和 `travel_tips` 在服务端从 JSON 字符串反序列化为数组后返回。`getting_there` 同理。
>
> `description` 字段为 Markdown 转换后的 HTML 字符串。如需原始 Markdown，传 `?raw=true`。

#### 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `raw` | boolean | `false` | `true` 时 `description` 返回原始 Markdown |

#### 可能的错误状态码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| `404` | `NOT_FOUND` | slug 不存在或状态非 published |
| `410` | `GONE` | 目的地已被归档/删除 |

---

## 3. 分类 (Categories)

### 3.1 获取全部分类

返回所有分类，常用于导航栏或筛选面板。

```
GET /categories
```

#### 响应 `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "自然奇观",
      "slug": "natural-wonders",
      "description": "大自然鬼斧神工的杰作",
      "icon": "🌋",
      "cover_image_url": "/images/categories/natural-wonders.jpg",
      "destination_count": 23
    }
  ]
}
```

> `destination_count` 为该分类下已发布目的地的数量。

---

## 4. 标签 (Tags)

### 4.1 获取全部标签

返回所有标签，用于筛选面板或标签云。

```
GET /tags
```

#### 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sort` | string | `name` | `name` 按名称 / `count` 按目的地数量降序 |

#### 响应 `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "星空摄影",
      "slug": "astrophotography",
      "destination_count": 15
    }
  ]
}
```

---

## 5. 用户交互

> **注意**：以下接口均需在请求头中携带 `X-Device-Id`。缺失时返回 `401 UNAUTHORIZED`。

### 5.1 收藏目的地

切换式收藏（若已收藏则取消，若未收藏则添加）。幂等操作。

```
POST /destinations/{slug}/favorite
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `slug` | string | 目的地 slug |

#### 响应 `200 OK` — 收藏成功

```json
{
  "data": {
    "slug": "salar-de-uyuni",
    "is_favorited": true,
    "favorite_count": 3843
  }
}
```

#### 可能的错误状态码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| `401` | `DEVICE_ID_REQUIRED` | 缺少 `X-Device-Id` 请求头 |
| `404` | `NOT_FOUND` | 目的地不存在 |

---

### 5.2 取消收藏

```
DELETE /destinations/{slug}/favorite
```

#### 响应 `200 OK`

```json
{
  "data": {
    "slug": "salar-de-uyuni",
    "is_favorited": false,
    "favorite_count": 3842
  }
}
```

#### 可能的错误状态码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| `401` | `DEVICE_ID_REQUIRED` | 缺少 `X-Device-Id` 请求头 |
| `404` | `NOT_FOUND` | 目的地不存在 |

---

### 5.3 获取用户收藏列表

```
GET /user/favorites
```

#### 请求头

```
X-Device-Id: <device_uuid>
```

#### 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `page_size` | integer | 20 | 每页条数 |

#### 响应 `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "title": "玻利维亚 · 天空之镜",
      "slug": "salar-de-uyuni",
      "subtitle": "世界最大的镜面，漫步在云端之上",
      "country": "玻利维亚",
      "continent": "南美洲",
      "thumbnail_url": "/images/destinations/salar-de-uyuni/thumb.jpg",
      "categories": [
        { "id": 1, "name": "自然奇观", "slug": "natural-wonders" }
      ],
      "favorited_at": "2026-06-01T12:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

#### 可能的错误状态码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| `401` | `DEVICE_ID_REQUIRED` | 缺少 `X-Device-Id` 请求头 |

---

### 5.4 记录浏览

当用户进入详情页时调用，用于统计浏览量和记录浏览历史。

```
POST /destinations/{slug}/view
```

#### 请求头

```
X-Device-Id: <device_uuid>
```

#### 请求体（可选）

```json
{
  "duration_seconds": 45
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `duration_seconds` | integer | 否 | 停留时长（秒），前端在页面卸载时发送 |

#### 响应 `200 OK`

```json
{
  "data": {
    "slug": "salar-de-uyuni",
    "view_count": 12601
  }
}
```

#### 可能的错误状态码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| `401` | `DEVICE_ID_REQUIRED` | 缺少 `X-Device-Id` 请求头 |
| `404` | `NOT_FOUND` | 目的地不存在 |

---

## 6. 附录

### 6.1 枚举值汇总

| 字段 | 可选值 |
|------|--------|
| `difficulty` | `easy` · `moderate` · `difficult` · `extreme` |
| `budget` | `budget` · `moderate` · `luxury` |
| `crowd_level` | `low` · `medium` · `high` |
| `status` | `published` · `draft` · `archived` |
| `sort`（列表） | `sort_order` · `newest` · `popular` · `favorites` · `rating` |

### 6.2 HTTP 状态码速查

| 状态码 | 含义 | 场景 |
|--------|------|------|
| `200` | OK | 请求成功 |
| `400` | Bad Request | 参数值无效 |
| `401` | Unauthorized | 缺少 `X-Device-Id`（交互接口） |
| `404` | Not Found | 资源不存在 |
| `410` | Gone | 资源已被移除 |
| `422` | Unprocessable Entity | 参数格式错误 |
| `500` | Internal Server Error | 服务端异常 |

---

## 7. API 路由总览

```
GET    /api/v1/destinations             目的地列表（筛选 + 排序 + 分页）
GET    /api/v1/destinations/{slug}      目的地详情
POST   /api/v1/destinations/{slug}/view      记录浏览
POST   /api/v1/destinations/{slug}/favorite  切换收藏
DELETE /api/v1/destinations/{slug}/favorite  取消收藏

GET    /api/v1/categories               全部分类
GET    /api/v1/tags                     全部标签

GET    /api/v1/user/favorites           用户收藏列表
```

---

> **版本历史**
> - `v1.0` (2026-06-05) — MVP 初版，覆盖内容消费与轻量交互。
