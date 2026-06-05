"""
数据库初始化脚本 — 「100种不可思议旅行」MVP v1.0

用法:
    python scripts/init_db.py              # 仅建表（schema.sql）
    python scripts/init_db.py --seed       # 建表 + 加载种子数据
    python scripts/init_db.py --reset      # 删除旧库，重新建表 + 种子数据
    python scripts/init_db.py --help       # 查看帮助
"""

import argparse
import json
import os
import sqlite3
import sys
from pathlib import Path

# 路径常量 — 所有路径相对于脚本所在目录的父目录（项目根）
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = PROJECT_ROOT / "database"
DB_PATH = DB_DIR / "travel.db"
SCHEMA_PATH = DB_DIR / "schema.sql"
SEED_PATH = DB_DIR / "seed-sample.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="「100种不可思议旅行」数据库初始化工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s              # 仅创建表结构
  %(prog)s --seed       # 建表 + 加载种子数据
  %(prog)s --reset      # 删除旧库，重建 + 种子数据
        """,
    )
    parser.add_argument(
        "--seed", action="store_true",
        help="加载种子数据（database/seed-sample.json）"
    )
    parser.add_argument(
        "--reset", action="store_true",
        help="删除现有数据库文件，完全重新初始化"
    )
    parser.add_argument(
        "--db", type=str, default=str(DB_PATH),
        help=f"数据库文件路径（默认: {DB_PATH}）"
    )
    return parser.parse_args()


def execute_schema(conn: sqlite3.Connection) -> None:
    """执行 schema.sql — 幂等建表。"""
    if not SCHEMA_PATH.exists():
        print(f"❌ schema.sql 不存在: {SCHEMA_PATH}")
        sys.exit(1)

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    conn.executescript(schema_sql)
    conn.commit()
    print(f"✅ 表结构已创建（{SCHEMA_PATH}）")


def load_seed_data(conn: sqlite3.Connection) -> int:
    """从 seed-sample.json 加载种子数据，返回目的地数量。"""
    if not SEED_PATH.exists():
        print(f"⚠️  种子数据文件不存在: {SEED_PATH}")
        return 0

    data = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    cursor = conn.cursor()

    try:
        # 1. 分类
        for cat in data.get("categories", []):
            cursor.execute(
                "INSERT OR REPLACE INTO categories (id, name, slug, description, icon, sort_order) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (cat["id"], cat["name"], cat["slug"], cat["description"],
                 cat.get("icon"), cat.get("sort_order", 0)),
            )
        print(f"   ↳ 分类: {len(data.get('categories', []))} 条")

        # 2. 标签
        for tag in data.get("tags", []):
            cursor.execute(
                "INSERT OR REPLACE INTO tags (id, name, slug) VALUES (?, ?, ?)",
                (tag["id"], tag["name"], tag["slug"]),
            )
        print(f"   ↳ 标签: {len(data.get('tags', []))} 条")

        # 3. 目的地（含关联数据）
        dest_count = 0
        for dest in data.get("destinations", []):
            cursor.execute(
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

            # 关联分类
            for cat in dest.get("categories", []):
                cursor.execute(
                    "INSERT OR IGNORE INTO destination_categories (destination_id, category_id) "
                    "VALUES (?, ?)",
                    (dest["id"], cat["id"]),
                )

            # 关联标签
            for tag in dest.get("tags", []):
                cursor.execute(
                    "INSERT OR IGNORE INTO destination_tags (destination_id, tag_id) "
                    "VALUES (?, ?)",
                    (dest["id"], tag["id"]),
                )

            # 图片
            for img in dest.get("images", []):
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO destination_images (
                        id, destination_id, url, thumbnail_url, alt_text,
                        width, height, sort_order, is_cover,
                        photographer, source, license
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        img["id"], dest["id"], img["url"], img.get("thumbnail_url"),
                        img.get("alt_text"), img.get("width"), img.get("height"),
                        img.get("sort_order", 0), img.get("is_cover", 0),
                        img.get("photographer"), img.get("source"), img.get("license"),
                    ),
                )
            dest_count += 1

        conn.commit()
        print(f"   ↳ 目的地: {dest_count} 条（含关联分类/标签/图片）")
        return dest_count

    except Exception as e:
        conn.rollback()
        print(f"❌ 种子数据加载失败: {e}")
        raise


def print_stats(conn: sqlite3.Connection) -> None:
    """打印数据库统计信息。"""
    tables = ["destinations", "categories", "tags", "destination_images",
              "user_favorites", "user_views"]
    print("\n📊 数据库统计:")
    for table in tables:
        try:
            count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            print(f"   {table}: {count} 行")
        except sqlite3.OperationalError:
            pass


def main() -> None:
    args = parse_args()
    db_path = Path(args.db)

    # --reset: 删除旧库
    if args.reset and db_path.exists():
        db_path.unlink()
        # 同时删除 WAL/SHM 文件
        for suffix in ["-wal", "-shm"]:
            p = db_path.with_suffix(db_path.suffix + suffix)
            if p.exists():
                p.unlink()
        print(f"🗑️  已删除旧数据库: {db_path}")

    # 确保目录存在
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # 连接
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")

    try:
        # 建表
        execute_schema(conn)

        # 种子数据
        if args.seed or args.reset:
            print("🌱 加载种子数据...")
            load_seed_data(conn)

        print_stats(conn)
        print(f"\n✨ 数据库就绪: {db_path}")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
