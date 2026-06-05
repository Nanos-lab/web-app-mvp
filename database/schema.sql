-- ============================================================================
-- 「100种不可思议旅行」SQLite 数据库 Schema
-- MVP v1.0
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================================
-- 目的地主表
-- ============================================================================
CREATE TABLE IF NOT EXISTS destinations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    -- 基本信息
    title           TEXT    NOT NULL,                    -- 中文标题，如"玻利维亚·天空之镜"
    title_en        TEXT,                                -- 英文标题，如"Salar de Uyuni"
    slug            TEXT    NOT NULL UNIQUE,             -- URL 友好标识
    subtitle        TEXT,                                -- 一句话副标题
    summary         TEXT,                                -- 150 字概要，列表页展示
    description     TEXT,                                -- 完整 Markdown 正文
    -- 地理位置
    country         TEXT    NOT NULL,                    -- 国家
    region          TEXT,                                -- 地区/省份
    continent       TEXT,                                -- 大洲
    latitude        REAL,                                -- 纬度
    longitude       REAL,                                -- 经度
    elevation       INTEGER,                             -- 海拔（米）
    -- 旅行信息
    best_season     TEXT,                                -- 最佳旅行季节，如"12月-3月"
    difficulty      TEXT    CHECK (difficulty IN         -- 难度
        ('easy', 'moderate', 'difficult', 'extreme')),
    duration        TEXT,                                -- 建议停留天数，如"3-5天"
    budget          TEXT    CHECK (budget IN             -- 预算等级
        ('budget', 'moderate', 'luxury')),
    crowd_level     TEXT    CHECK (crowd_level IN        -- 拥挤程度
        ('low', 'medium', 'high')),
    temperature     TEXT,                                -- 温度区间，如"-5°C ~ 10°C"
    -- 实用信息
    visa_info       TEXT,                                -- 签证说明
    language        TEXT,                                -- 当地语言
    currency        TEXT,                                -- 当地货币
    timezone        TEXT,                                -- 时区
    -- 结构化富文本 (JSON 字符串)
    fun_facts       TEXT,                                -- JSON: ["fact1", "fact2", ...]
    travel_tips     TEXT,                                -- JSON: ["tip1", "tip2", ...]
    safety_notes    TEXT,                                -- 安全须知
    getting_there   TEXT,                                -- JSON: { "routes": [...], "nearest_airport": "..." }
    -- 媒体
    cover_image_url TEXT,                                -- 封面图 URL (16:9)
    thumbnail_url   TEXT,                                -- 缩略图 URL (1:1)
    photo_count     INTEGER DEFAULT 0,                   -- 图片总数（冗余，加速查询）
    -- 统计（冗余字段，减轻 COUNT 查询压力）
    view_count      INTEGER DEFAULT 0,                   -- 总浏览次数
    favorite_count  INTEGER DEFAULT 0,                   -- 总收藏次数
    rating          REAL    DEFAULT 0,                   -- 平均评分 (0-5)
    rating_count    INTEGER DEFAULT 0,                   -- 评分人数
    -- 管理字段
    status          TEXT    DEFAULT 'published'          -- published | draft | archived
        CHECK (status IN ('published', 'draft', 'archived')),
    sort_order       INTEGER DEFAULT 0,                  -- 手动排序权重
    created_at      TEXT    DEFAULT (datetime('now')),
    updated_at      TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX idx_destinations_status ON destinations(status);
CREATE INDEX idx_destinations_continent ON destinations(continent);
CREATE INDEX idx_destinations_country ON destinations(country);
CREATE INDEX idx_destinations_difficulty ON destinations(difficulty);
CREATE INDEX idx_destinations_budget ON destinations(budget);
CREATE INDEX idx_destinations_favorite_count ON destinations(favorite_count DESC);
CREATE INDEX idx_destinations_view_count ON destinations(view_count DESC);

-- ============================================================================
-- 分类表
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,             -- 分类名，如"自然奇观"
    slug            TEXT    NOT NULL UNIQUE,             -- URL 标识
    description     TEXT,                                -- 分类描述
    icon            TEXT,                                -- 图标标识（emoji 或 icon-class）
    cover_image_url TEXT,                                -- 分类封面图
    sort_order       INTEGER DEFAULT 0
);

-- ============================================================================
-- 目的地 ↔ 分类（多对多）
-- ============================================================================
CREATE TABLE IF NOT EXISTS destination_categories (
    destination_id  INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (destination_id, category_id)
);

-- ============================================================================
-- 标签表
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL UNIQUE,                     -- 标签名，如"星空摄影"
    slug    TEXT    NOT NULL UNIQUE
);

-- ============================================================================
-- 目的地 ↔ 标签（多对多）
-- ============================================================================
CREATE TABLE IF NOT EXISTS destination_tags (
    destination_id  INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (destination_id, tag_id)
);

-- ============================================================================
-- 目的地图片表
-- ============================================================================
CREATE TABLE IF NOT EXISTS destination_images (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_id  INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    url             TEXT    NOT NULL,                    -- 图片 URL
    thumbnail_url   TEXT,                                -- 缩略图 URL
    alt_text        TEXT,                                -- 无障碍替代文本
    width           INTEGER,                             -- 图片宽度
    height          INTEGER,                             -- 图片高度
    sort_order       INTEGER DEFAULT 0,                  -- 排序
    is_cover        INTEGER DEFAULT 0 CHECK (is_cover IN (0, 1)), -- 是否主封面
    photographer    TEXT,                                -- 摄影师署名
    source          TEXT,                                -- 图片来源（Unsplash / 自有 / ...）
    license         TEXT                                 -- 许可类型
);

CREATE INDEX idx_destination_images_dest ON destination_images(destination_id);

-- ============================================================================
-- 用户收藏表
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT    NOT NULL,                    -- 用户标识（device UUID / 匿名 ID）
    destination_id  INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    created_at      TEXT    DEFAULT (datetime('now')),
    UNIQUE (user_id, destination_id)
);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_dest ON user_favorites(destination_id);

-- ============================================================================
-- 用户浏览记录表
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_views (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT    NOT NULL,                    -- 用户标识
    destination_id  INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    viewed_at       TEXT    DEFAULT (datetime('now')),
    duration_seconds INTEGER DEFAULT 0                   -- 停留时长（秒）
);

CREATE INDEX idx_user_views_user ON user_views(user_id);
CREATE INDEX idx_user_views_dest ON user_views(destination_id);
CREATE INDEX idx_user_views_time ON user_views(viewed_at DESC);

-- ============================================================================
-- 触发器：自动更新 updated_at
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS trg_destinations_updated_at
    AFTER UPDATE ON destinations
    FOR EACH ROW
BEGIN
    UPDATE destinations SET updated_at = datetime('now') WHERE id = OLD.id;
END;
