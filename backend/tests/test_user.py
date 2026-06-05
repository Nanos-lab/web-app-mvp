"""
用户交互路由测试 — 收藏 & 浏览记录
"""

import pytest
from conftest import DEVICE_ID


# ═══════════════════════════════════════════════════════════════════════════════
# 收藏 — POST/DELETE /api/v1/destinations/{slug}/favorite
# ═══════════════════════════════════════════════════════════════════════════════

class TestFavoriteToggle:
    """POST /api/v1/destinations/{slug}/favorite"""

    def test_toggle_adds_favorite(self, client, seed_db):
        res = client.post(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["is_favorited"] is True
        assert data["favorite_count"] == 1

        # 验证数据库
        row = seed_db.execute(
            "SELECT * FROM user_favorites WHERE user_id = ?", (DEVICE_ID,)
        ).fetchone()
        assert row is not None

    def test_toggle_removes_favorite_when_already_exist(self, client, seed_db):
        # 先添加
        client.post(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        # 再次 POST 应取消
        res = client.post(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200
        assert res.json()["data"]["is_favorited"] is False

        # 数据库应无记录
        row = seed_db.execute(
            "SELECT * FROM user_favorites WHERE user_id = ?", (DEVICE_ID,)
        ).fetchone()
        assert row is None

    def test_missing_device_id_returns_401(self, client, seed_db):
        res = client.post("/api/v1/destinations/salar-de-uyuni/favorite")
        assert res.status_code == 401
        assert res.json()["error"]["code"] == "DEVICE_ID_REQUIRED"

    def test_nonexistent_destination_returns_404(self, client, seed_db):
        res = client.post(
            "/api/v1/destinations/mars-colony/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 404

    def test_count_consistency_on_multiple_users(self, client, seed_db):
        """多个用户收藏时应正确累加计数。"""
        for uid in ["user-a", "user-b", "user-c"]:
            client.post(
                "/api/v1/destinations/salar-de-uyuni/favorite",
                headers={"X-Device-Id": uid},
            )

        detail = client.get("/api/v1/destinations/salar-de-uyuni")
        assert detail.json()["data"]["stats"]["favorite_count"] == 3


class TestRemoveFavorite:
    """DELETE /api/v1/destinations/{slug}/favorite"""

    def test_remove_favorite(self, client, seed_db):
        # 先收藏
        client.post(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        # 取消
        res = client.delete(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200
        assert res.json()["data"]["is_favorited"] is False

    def test_remove_nonexistent_favorite_no_error(self, client, seed_db):
        """取消未收藏的记录不应报错（幂等）。"""
        res = client.delete(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200

    def test_remove_missing_device_id_returns_401(self, client, seed_db):
        res = client.delete("/api/v1/destinations/salar-de-uyuni/favorite")
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════════
# 浏览记录 — POST /api/v1/destinations/{slug}/view
# ═══════════════════════════════════════════════════════════════════════════════

class TestRecordView:
    """POST /api/v1/destinations/{slug}/view"""

    def test_record_view_increments_count(self, client, seed_db):
        # 记录前 count
        before = seed_db.execute(
            "SELECT view_count FROM destinations WHERE slug = 'salar-de-uyuni'"
        ).fetchone()["view_count"]

        res = client.post(
            "/api/v1/destinations/salar-de-uyuni/view",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200
        assert res.json()["data"]["view_count"] == before + 1

    def test_record_view_with_duration(self, client, seed_db):
        res = client.post(
            "/api/v1/destinations/waitomo-glowworm-caves/view",
            headers={"X-Device-Id": DEVICE_ID},
            json={"duration_seconds": 120},
        )
        assert res.status_code == 200

        # 验证 duration 已记录
        row = seed_db.execute(
            "SELECT duration_seconds FROM user_views WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (DEVICE_ID,),
        ).fetchone()
        assert row["duration_seconds"] == 120

    def test_record_view_without_duration(self, client, seed_db):
        """不传 duration_seconds 时应默认为 0。"""
        res = client.post(
            "/api/v1/destinations/salar-de-uyuni/view",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200

        row = seed_db.execute(
            "SELECT duration_seconds FROM user_views WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (DEVICE_ID,),
        ).fetchone()
        assert row["duration_seconds"] == 0

    def test_record_view_missing_device_id(self, client, seed_db):
        res = client.post("/api/v1/destinations/salar-de-uyuni/view")
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════════
# 用户收藏列表 — GET /api/v1/user/favorites
# ═══════════════════════════════════════════════════════════════════════════════

class TestListFavorites:
    """GET /api/v1/user/favorites"""

    def test_returns_favorites_list(self, client, seed_db):
        # 收藏 2 个目的地
        for slug in ["salar-de-uyuni", "waitomo-glowworm-caves"]:
            client.post(
                f"/api/v1/destinations/{slug}/favorite",
                headers={"X-Device-Id": DEVICE_ID},
            )

        res = client.get(
            "/api/v1/user/favorites",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200
        body = res.json()
        assert len(body["data"]) == 2
        assert body["meta"]["total"] == 2

        # 每个 item 应有 favorited_at
        for item in body["data"]:
            assert "favorited_at" in item
            assert "categories" in item
            assert "id" in item
            assert "title" in item
            assert "slug" in item

    def test_empty_favorites(self, client, seed_db):
        res = client.get(
            "/api/v1/user/favorites",
            headers={"X-Device-Id": "never-favorited-user"},
        )
        assert res.status_code == 200
        assert res.json()["data"] == []
        assert res.json()["meta"]["total"] == 0

    def test_missing_device_id(self, client, seed_db):
        res = client.get("/api/v1/user/favorites")
        assert res.status_code == 401

    def test_pagination(self, client, seed_db):
        # 收藏所有 3 个
        for slug in ["salar-de-uyuni", "waitomo-glowworm-caves", "golden-bridge-vietnam"]:
            client.post(
                f"/api/v1/destinations/{slug}/favorite",
                headers={"X-Device-Id": DEVICE_ID},
            )

        res = client.get(
            "/api/v1/user/favorites?page=1&page_size=2",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.status_code == 200
        assert len(res.json()["data"]) == 2
        assert res.json()["meta"]["total"] == 3
        assert res.json()["meta"]["total_pages"] == 2

    def test_draft_destinations_excluded(self, client, seed_db):
        """已被设为 draft 的目的地不应出现在收藏列表中。"""
        # 收藏 salar-de-uyuni
        client.post(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": DEVICE_ID},
        )
        # 将其状态改为 draft
        seed_db.execute(
            "UPDATE destinations SET status = 'draft' WHERE slug = 'salar-de-uyuni'"
        )
        seed_db.commit()

        res = client.get(
            "/api/v1/user/favorites",
            headers={"X-Device-Id": DEVICE_ID},
        )
        assert res.json()["data"] == []
