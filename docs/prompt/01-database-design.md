# Prompt 记录 #1 — 数据库模型设计

## 阶段归属

**SDD（Schema-Driven Development / 数据建模阶段）**

在 SDD → DDD → TDD 的三阶段工作流中，本 Prompt 属于第一阶段 SDD，聚焦数据层建模：

| 阶段 | 含义 | 本项目的产出 |
|------|------|-------------|
| **SDD** | Schema-Driven Development | 数据库 ERD + JSON 结构定义 |
| DDD | Design-Driven Development | API 契约 + UI 组件规范 |
| TDD | Test-Driven Development | （后续） |

## 用户意图

> "请先帮我设计该项目的后端 SQLite 数据库模型（ERD），以及核心内容的 JSON 结构"

- 为「100种不可思议旅行」MVP 建立数据基础
- 需要一个可直接执行的 SQLite DDL（建表语句）
- 需要样例数据来验证模型是否合理
- 需要设计文档来解释为什么这样建模

## 用户提供的约束

- 内容驱动型应用
- MVP 阶段，不追求过度设计
- 需支持分类、标签、图片等核心维度
- 需保留用户行为（收藏、浏览）的扩展空间

## 遇到的挑战

1. **扁平 vs 归一化的平衡** — 富文本列表（贴士、趣闻）如果独立建表会带来过多 JOIN，如果存 JSON 又担心查询灵活性。最终采用 JSON 文本字段 + SQLite `json_extract()` 的混合策略。

2. **统计字段的实时性** — `view_count` / `favorite_count` 是每次 COUNT 还是冗余存储？MVP 读多写少，选了冗余方案，用索引加速排序。

3. **用户系统的边界** — 没有完整认证体系，但需要区分不同用户。最终用 `X-Device-Id`（device UUID）做匿名标识，TEXT 类型保留未来迁移空间。

## AI 的产出

| 文件 | 内容 |
|------|------|
| `database/schema.sql` | 6 张表、7 个索引、1 个触发器的完整 DDL |
| `database/seed-sample.json` | 3 个目的地（乌尤尼、怀托摩、金桥）的完整种子数据 |
| `docs/database-design.md` | 设计文档：ERD、字段说明、设计决策与权衡、演进方向 |

## 关键设计决策

- 冗余计数策略（view_count / favorite_count 存于 destinations 表）
- JSON 存储策略（fun_facts / travel_tips / getting_there）
- 图片版权元数据独立建表
- 预设 8 个分类、10+ 个标签作为种子框架
