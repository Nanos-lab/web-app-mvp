"""
SQLite 数据库连接与初始化。
自动执行 schema.sql 建表，支持 WAL 模式和外键约束。
"""

import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "travel.db"
SCHEMA_PATH = Path(__file__).resolve().parent.parent / "database" / "schema.sql"

_connection: sqlite3.Connection | None = None


def get_connection() -> sqlite3.Connection:
    """获取数据库连接（单例模式）。"""
    global _connection
    if _connection is None:
        os.makedirs(DB_PATH.parent, exist_ok=True)
        _connection = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        _connection.row_factory = sqlite3.Row
        _connection.execute("PRAGMA journal_mode=WAL")
        _connection.execute("PRAGMA foreign_keys=ON")
        _init_schema(_connection)
    return _connection


def _init_schema(conn: sqlite3.Connection) -> None:
    """执行 schema.sql 初始化表结构（幂等 — 仅首次运行时建表）。"""
    # 检查核心表是否已存在
    existing = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='destinations'"
    ).fetchone()

    if existing is not None:
        return  # 已初始化，跳过

    if SCHEMA_PATH.exists():
        sql = SCHEMA_PATH.read_text(encoding="utf-8")
        conn.executescript(sql)
        conn.commit()


def close_connection() -> None:
    """关闭数据库连接。"""
    global _connection
    if _connection is not None:
        _connection.close()
        _connection = None
