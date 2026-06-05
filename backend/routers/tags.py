"""
标签路由。
"""

from fastapi import APIRouter, Query
from database import get_connection
from models import TagResponse, TagListResponse

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=TagListResponse)
def list_tags(sort: str = Query("name")):
    """返回全部标签，含每个标签下的目的地数量。"""
    conn = get_connection()

    order_clause = "t.name ASC"
    if sort == "count":
        order_clause = "destination_count DESC, t.name ASC"

    sql = f"""
        SELECT
            t.id, t.name, t.slug,
            COUNT(dt.destination_id) AS destination_count
        FROM tags t
        LEFT JOIN destination_tags dt ON dt.tag_id = t.id
        LEFT JOIN destinations d ON d.id = dt.destination_id AND d.status = 'published'
        GROUP BY t.id
        ORDER BY {order_clause}
    """
    rows = conn.execute(sql).fetchall()

    return TagListResponse(
        data=[
            TagResponse(
                id=r["id"],
                name=r["name"],
                slug=r["slug"],
                destination_count=r["destination_count"],
            )
            for r in rows
        ]
    )
