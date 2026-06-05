"""
分类路由。
"""

from fastapi import APIRouter
from database import get_connection
from models import CategoryResponse, CategoryListResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=CategoryListResponse)
def list_categories():
    """返回全部分类，含每个分类下已发布的目的地数量。"""
    conn = get_connection()

    sql = """
        SELECT
            c.id, c.name, c.slug, c.description, c.icon,
            c.cover_image_url, c.sort_order,
            COUNT(dc.destination_id) AS destination_count
        FROM categories c
        LEFT JOIN destination_categories dc ON dc.category_id = c.id
        LEFT JOIN destinations d ON d.id = dc.destination_id AND d.status = 'published'
        GROUP BY c.id
        ORDER BY c.sort_order
    """
    rows = conn.execute(sql).fetchall()

    return CategoryListResponse(
        data=[
            CategoryResponse(
                id=r["id"],
                name=r["name"],
                slug=r["slug"],
                description=r["description"],
                icon=r["icon"],
                cover_image_url=r["cover_image_url"],
                destination_count=r["destination_count"],
            )
            for r in rows
        ]
    )
