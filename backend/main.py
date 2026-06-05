"""
「100种不可思议旅行」FastAPI 后端 — MVP v1.0
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from database import get_connection, close_connection
from routers import destinations, categories, tags, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期 — 启动时初始化数据库，关闭时释放连接。"""
    get_connection()  # 预初始化连接
    yield
    close_connection()


app = FastAPI(
    title="100种不可思议旅行 API",
    description="小众旅行目的地内容平台的 RESTful 后端",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — 允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── 静态文件 — 图片资源 ──────────────────────────────────────────────────────

IMAGES_DIR = Path(__file__).resolve().parent.parent / "images"


@app.get("/images/{path:path}")
async def serve_image(path: str):
    """提供静态图片文件。使用路由而非 mount，避免与 404 handler 冲突。"""
    file_path = (IMAGES_DIR / path).resolve()

    # 安全检查：确保请求的路径在 IMAGES_DIR 内
    if not str(file_path).startswith(str(IMAGES_DIR.resolve())):
        raise HTTPException(status_code=404, detail="Not found")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Not found")

    return FileResponse(str(file_path))

# ─── 路由注册 ────────────────────────────────────────────────────────────────

app.include_router(destinations.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(tags.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1")


# ─── 全局异常处理 ────────────────────────────────────────────────────────────

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "NOT_FOUND", "message": "路由不存在"}},
    )


@app.exception_handler(Exception)
async def internal_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "服务端异常，请稍后重试"}},
    )


# ─── 健康检查 ────────────────────────────────────────────────────────────────

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


# ─── 种子数据加载 ────────────────────────────────────────────────────────────

@app.post("/api/v1/admin/seed")
def seed_database():
    """从 database/seed-sample.json 加载种子数据（用于开发阶段初始化）。"""
    import json
    from pathlib import Path

    seed_path = Path(__file__).resolve().parent.parent / "database" / "seed-sample.json"
    if not seed_path.exists():
        return JSONResponse(
            status_code=404,
            content={"error": {"code": "NOT_FOUND", "message": "种子数据文件不存在"}},
        )

    data = json.loads(seed_path.read_text(encoding="utf-8"))
    conn = get_connection()

    try:
        # 分类
        for cat in data.get("categories", []):
            conn.execute(
                "INSERT OR REPLACE INTO categories (id, name, slug, description, icon, sort_order) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (cat["id"], cat["name"], cat["slug"], cat["description"], cat["icon"], cat.get("sort_order", 0)),
            )

        # 标签
        for tag in data.get("tags", []):
            conn.execute(
                "INSERT OR REPLACE INTO tags (id, name, slug) VALUES (?, ?, ?)",
                (tag["id"], tag["name"], tag["slug"]),
            )

        # 目的地
        for dest in data.get("destinations", []):
            conn.execute(
                """
                INSERT OR REPLACE INTO destinations (
                    id, title, title_en, slug, subtitle, summary, description,
                    country, region, continent, latitude, longitude, elevation,
                    best_season, difficulty, duration, budget, crowd_level, temperature,
                    visa_info, language, currency, timezone,
                    fun_facts, travel_tips, safety_notes, getting_there,
                    cover_image_url, thumbnail_url, photo_count,
                    view_count, favorite_count, rating, rating_count,
                    status, sort_order
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?
                )
                """,
                (
                    dest["id"],
                    dest["title"],
                    dest.get("title_en"),
                    dest["slug"],
                    dest.get("subtitle"),
                    dest.get("summary"),
                    dest.get("description"),
                    dest.get("country"),
                    dest.get("region"),
                    dest.get("continent"),
                    dest.get("latitude"),
                    dest.get("longitude"),
                    dest.get("elevation"),
                    dest.get("best_season"),
                    dest.get("difficulty"),
                    dest.get("duration"),
                    dest.get("budget"),
                    dest.get("crowd_level"),
                    dest.get("temperature"),
                    dest.get("visa_info"),
                    dest.get("language"),
                    dest.get("currency"),
                    dest.get("timezone"),
                    json.dumps(dest.get("fun_facts", []), ensure_ascii=False) if isinstance(dest.get("fun_facts"), list) else dest.get("fun_facts"),
                    json.dumps(dest.get("travel_tips", []), ensure_ascii=False) if isinstance(dest.get("travel_tips"), list) else dest.get("travel_tips"),
                    dest.get("safety_notes"),
                    json.dumps(dest.get("getting_there", {}), ensure_ascii=False) if isinstance(dest.get("getting_there"), dict) else dest.get("getting_there"),
                    dest.get("cover_image_url"),
                    dest.get("thumbnail_url"),
                    dest.get("photo_count", 0),
                    dest.get("view_count", 0),
                    dest.get("favorite_count", 0),
                    dest.get("rating", 0),
                    dest.get("rating_count", 0),
                    dest.get("status", "published"),
                    dest.get("sort_order", 0),
                ),
            )

            # 关联分类
            for cat in dest.get("categories", []):
                conn.execute(
                    "INSERT OR IGNORE INTO destination_categories (destination_id, category_id) VALUES (?, ?)",
                    (dest["id"], cat["id"]),
                )

            # 关联标签
            for tag in dest.get("tags", []):
                conn.execute(
                    "INSERT OR IGNORE INTO destination_tags (destination_id, tag_id) VALUES (?, ?)",
                    (dest["id"], tag["id"]),
                )

            # 图片
            for img in dest.get("images", []):
                conn.execute(
                    """
                    INSERT OR REPLACE INTO destination_images (
                        id, destination_id, url, thumbnail_url, alt_text,
                        width, height, sort_order, is_cover, photographer, source, license
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        img["id"],
                        dest["id"],
                        img["url"],
                        img.get("thumbnail_url"),
                        img.get("alt_text"),
                        img.get("width"),
                        img.get("height"),
                        img.get("sort_order", 0),
                        img.get("is_cover", 0),
                        img.get("photographer"),
                        img.get("source"),
                        img.get("license"),
                    ),
                )

        conn.commit()
        return {"status": "ok", "message": f"已加载 {len(data.get('destinations', []))} 个目的地及其关联数据"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
