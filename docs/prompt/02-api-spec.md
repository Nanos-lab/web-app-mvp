# Prompt 记录 #2 — RESTful API 契约设计

## 阶段归属

**SDD → DDD 过渡（API 契约层）**

| 阶段 | 含义 | 定位 |
|------|------|------|
| SDD | Schema-Driven Development | 数据层 ✅ 已完成 |
| **API 契约** | **接口层（承上启下）** | **连接数据模型与 UI 组件** |
| DDD | Design-Driven Development | UI 组件规范 |

API 契约是 SDD 与 DDD 之间的桥梁——它定义前端如何消费后端数据，是前后端并行开发的"合同"。

## 用户意图

> "基于刚才定义的数据库模型，请为前端定义一套 RESTful API 契约"

- 前端团队需要一份明确的 API 文档来开始开发
- 每个接口必须包含：方法、路径、参数、响应示例、错误码
- 遵循 RESTful 规范
- 至少覆盖列表（支持标签筛选）和详情两个核心接口

## 用户要求清单

1. ✅ 创建 `docs/api_spec.md`
2. ✅ 包含获取旅行列表（支持按标签筛选）
3. ✅ 包含获取单个旅行详情
4. ✅ 每个接口：请求方法、路径、请求参数、返回 JSON 示例、错误状态码
5. ✅ 遵循 RESTful 设计规范

## 遇到的挑战

1. **响应结构的语义分组** — 数据库是扁平字段，但给前端返回 30+ 个平铺字段体验极差。最终将字段重组为 `location` / `travel_info` / `practical` / `media` / `stats` / `user_context` 6 个语义对象，前端可直接解构使用。

2. **筛选参数的设计** — 需要支持 8 种筛选维度（标签、分类、大洲、国家、难度、预算、拥挤度、搜索），同时保持 URL 简洁。采用 slug 作为筛选值（如 `?tags=astrophotography`）而非数字 ID，兼顾可读性和 SEO。

3. **匿名用户体系** — 无登录但有收藏/浏览需求。通过 `X-Device-Id` 请求头传递设备 UUID，既不强制注册，又能追踪用户行为。`user_context` 字段仅在携带该头时返回。

4. **超过用户要求范围** — 用户只要求列表 + 详情，但一个好的 API 设计需要完整性。最终扩展到 8 个端点（含分类、标签、收藏、浏览），并在文档中用分隔线标注核心 vs 扩展接口，避免范围蔓延的争议。

## AI 的产出

| 产出 | 说明 |
|------|------|
| `docs/api_spec.md` | 完整 API 契约文档 |

### 端点清单（8 个）

| 方法 | 路径 | 用途 |
|------|------|------|
| `GET` | `/destinations` | 列表（8 种筛选 + 5 种排序 + 分页） |
| `GET` | `/destinations/{slug}` | 详情（完整正文 + 图片集） |
| `GET` | `/categories` | 全部分类 |
| `GET` | `/tags` | 全部标签 |
| `POST` | `/destinations/{slug}/favorite` | 切换收藏（幂等） |
| `DELETE` | `/destinations/{slug}/favorite` | 取消收藏 |
| `POST` | `/destinations/{slug}/view` | 记录浏览 |
| `GET` | `/user/favorites` | 用户收藏列表 |

## 关键设计决策

- 统一响应信封：列表 `{ data, meta }` / 详情 `{ data }` / 错误 `{ error }`
- 筛选参数使用语义化 slug 而非 ID
- `description` 返回 Markdown 转换后的 HTML（可通过 `?raw=true` 获取原始）
- `fun_facts` / `travel_tips` 在服务端反序列化为数组后返回
- 收藏接口采用幂等切换设计（POST 即 toggle）
