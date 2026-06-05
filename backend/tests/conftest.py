"""
pytest 配置与共享 fixtures — 「100种不可思议旅行」后端测试套件
"""

import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

# 确保 backend 目录在 sys.path 中，使模块可导入
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient


# ═══════════════════════════════════════════════════════════════════════════════
# 数据库隔离 — 每个测试使用独立的临时数据库
# ═══════════════════════════════════════════════════════════════════════════════

@pytest.fixture(autouse=True)
def isolated_db(monkeypatch):
    """
    每个测试自动使用独立的临时 SQLite 数据库。

    通过 monkeypatch 替换 database 模块中的 DB_PATH 常量，
    指向临时文件，确保测试完全隔离。
    """
    import database as db_module
    from database import get_connection, close_connection

    # 关闭可能存在的旧连接
    close_connection()

    # 创建临时数据库文件
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    tmp_path = tmp.name
    tmp.close()

    # 替换路径
    monkeypatch.setattr(db_module, "DB_PATH", Path(tmp_path))
    monkeypatch.setattr(db_module, "_connection", None)

    # 提供连接
    conn = get_connection()
    yield conn

    # 清理
    close_connection()
    try:
        os.unlink(tmp_path)
        for suffix in ["-wal", "-shm"]:
            p = Path(tmp_path + suffix)
            if p.exists():
                p.unlink()
    except OSError:
        pass


# ═══════════════════════════════════════════════════════════════════════════════
# FastAPI TestClient
# ═══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def client(isolated_db):
    """FastAPI TestClient — 每个测试的入口。"""
    from main import app
    with TestClient(app) as tc:
        yield tc


# ═══════════════════════════════════════════════════════════════════════════════
# 种子数据 helpers
# ═══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def seed_db(isolated_db):
    """向临时数据库加载完整种子数据（3 个目的地 + 分类 + 标签）。"""
    seed_path = BACKEND_DIR.parent / "database" / "seed-sample.json"
    data = json.loads(seed_path.read_text(encoding="utf-8"))
    conn = isolated_db

    for cat in data.get("categories", []):
        conn.execute(
            "INSERT OR REPLACE INTO categories (id, name, slug, description, icon, sort_order) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (cat["id"], cat["name"], cat["slug"], cat["description"],
             cat.get("icon"), cat.get("sort_order", 0)),
        )

    for tag in data.get("tags", []):
        conn.execute(
            "INSERT OR REPLACE INTO tags (id, name, slug) VALUES (?, ?, ?)",
            (tag["id"], tag["name"], tag["slug"]),
        )

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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                dest["id"], dest["title"], dest.get("title_en"), dest["slug"],
                dest.get("subtitle"), dest.get("summary"), dest.get("description"),
                dest.get("country"), dest.get("region"), dest.get("continent"),
                dest.get("latitude"), dest.get("longitude"), dest.get("elevation"),
                dest.get("best_season"), dest.get("difficulty"), dest.get("duration"),
                dest.get("budget"), dest.get("crowd_level"), dest.get("temperature"),
                dest.get("visa_info"), dest.get("language"), dest.get("currency"),
                dest.get("timezone"),
                json.dumps(dest.get("fun_facts", []), ensure_ascii=False)
                    if isinstance(dest.get("fun_facts"), list) else dest.get("fun_facts"),
                json.dumps(dest.get("travel_tips", []), ensure_ascii=False)
                    if isinstance(dest.get("travel_tips"), list) else dest.get("travel_tips"),
                dest.get("safety_notes"),
                json.dumps(dest.get("getting_there", {}), ensure_ascii=False)
                    if isinstance(dest.get("getting_there"), dict) else dest.get("getting_there"),
                dest.get("cover_image_url"), dest.get("thumbnail_url"),
                dest.get("photo_count", 0),
                dest.get("view_count", 0), dest.get("favorite_count", 0),
                dest.get("rating", 0), dest.get("rating_count", 0),
                dest.get("status", "published"), dest.get("sort_order", 0),
            ),
        )
        for cat in dest.get("categories", []):
            conn.execute(
                "INSERT OR IGNORE INTO destination_categories (destination_id, category_id) "
                "VALUES (?, ?)", (dest["id"], cat["id"]),
            )
        for tag in dest.get("tags", []):
            conn.execute(
                "INSERT OR IGNORE INTO destination_tags (destination_id, tag_id) "
                "VALUES (?, ?)", (dest["id"], tag["id"]),
            )
        for img in dest.get("images", []):
            conn.execute(
                """
                INSERT OR REPLACE INTO destination_images (
                    id, destination_id, url, thumbnail_url, alt_text,
                    width, height, sort_order, is_cover,
                    photographer, source, license
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (img["id"], dest["id"], img["url"], img.get("thumbnail_url"),
                 img.get("alt_text"), img.get("width"), img.get("height"),
                 img.get("sort_order", 0), img.get("is_cover", 0),
                 img.get("photographer"), img.get("source"), img.get("license")),
            )
    conn.commit()
    return conn


# ═══════════════════════════════════════════════════════════════════════════════
# 常用常量
# ═══════════════════════════════════════════════════════════════════════════════

DEVICE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
