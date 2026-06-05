"""
目的地路由测试 — 列表 & 详情
"""

import pytest


# ═══════════════════════════════════════════════════════════════════════════════
# 列表接口 — GET /api/v1/destinations
# ═══════════════════════════════════════════════════════════════════════════════

class TestListDestinations:
    """GET /api/v1/destinations"""

    def test_returns_paginated_list(self, client, seed_db):
        res = client.get("/api/v1/destinations")
        assert res.status_code == 200
        body = res.json()

        assert "data" in body
        assert "meta" in body
        assert body["meta"]["page"] == 1
        assert body["meta"]["page_size"] == 20
        assert body["meta"]["total"] == 3
        assert body["meta"]["total_pages"] == 1

    def test_default_data_structure(self, client, seed_db):
        res = client.get("/api/v1/destinations")
        card = res.json()["data"][0]

        # DestinationCard 必需字段
        assert "id" in card
        assert "title" in card
        assert "slug" in card
        assert "country" in card
        assert "categories" in card
        assert "tags" in card
        assert "stats" in card

        # stats 子结构
        assert "view_count" in card["stats"]
        assert "favorite_count" in card["stats"]
        assert "rating" in card["stats"]

    # ── 分页 ──────────────────────────────────────────────────────────────

    def test_pagination_page_size(self, client, seed_db):
        res = client.get("/api/v1/destinations?page=1&page_size=1")
        assert res.status_code == 200
        assert len(res.json()["data"]) == 1
        assert res.json()["meta"]["total"] == 3
        assert res.json()["meta"]["total_pages"] == 3

    def test_pagination_page_out_of_range(self, client, seed_db):
        """超出范围的页码应返回空列表。"""
        res = client.get("/api/v1/destinations?page=999")
        assert res.status_code == 200
        assert res.json()["data"] == []
        assert res.json()["meta"]["total"] == 3

    def test_page_size_exceeded_returns_400(self, client, seed_db):
        res = client.get("/api/v1/destinations?page_size=999")
        assert res.status_code == 400
        assert res.json()["error"]["code"] == "PAGE_SIZE_EXCEEDED"

    # ── 排序 ──────────────────────────────────────────────────────────────

    def test_invalid_sort_returns_400(self, client, seed_db):
        res = client.get("/api/v1/destinations?sort=invalid_sort")
        assert res.status_code == 400
        assert res.json()["error"]["code"] == "INVALID_SORT"

    @pytest.mark.parametrize("sort_val", [
        "sort_order", "newest", "popular", "favorites", "rating",
    ])
    def test_valid_sort_options(self, client, seed_db, sort_val):
        res = client.get(f"/api/v1/destinations?sort={sort_val}")
        assert res.status_code == 200

    # ── 筛选 ──────────────────────────────────────────────────────────────

    def test_filter_by_category(self, client, seed_db):
        res = client.get("/api/v1/destinations?category=natural-wonders")
        assert res.status_code == 200
        # Salar de Uyuni (id=1) 和 Golden Bridge (id=3) 都属于 natural-wonders
        slugs = [d["slug"] for d in res.json()["data"]]
        assert "salar-de-uyuni" in slugs
        assert "golden-bridge-vietnam" in slugs
        assert "waitomo-glowworm-caves" not in slugs

    def test_filter_by_continent(self, client, seed_db):
        res = client.get("/api/v1/destinations?continent=南美洲")
        assert res.status_code == 200
        assert res.json()["meta"]["total"] == 1
        assert res.json()["data"][0]["slug"] == "salar-de-uyuni"

    def test_filter_by_difficulty(self, client, seed_db):
        res = client.get("/api/v1/destinations?difficulty=easy")
        assert res.status_code == 200
        assert res.json()["meta"]["total"] == 2  # Waitomo + Golden Bridge

    def test_filter_by_budget_multi(self, client, seed_db):
        res = client.get("/api/v1/destinations?budget=budget,moderate")
        assert res.status_code == 200
        assert res.json()["meta"]["total"] == 3

    def test_filter_by_tags_and_logic(self, client, seed_db):
        """标签使用 AND 逻辑。"""
        # bucket-list + astrophotography → 只有 Salar de Uyuni 同时满足
        res = client.get("/api/v1/destinations?tags=bucket-list,astrophotography")
        assert res.status_code == 200
        assert res.json()["meta"]["total"] == 1
        assert res.json()["data"][0]["slug"] == "salar-de-uyuni"

    # ── 搜索 ──────────────────────────────────────────────────────────────

    def test_search_by_title(self, client, seed_db):
        res = client.get("/api/v1/destinations?search=天空之镜")
        assert res.status_code == 200
        assert res.json()["meta"]["total"] == 1

    def test_search_no_match(self, client, seed_db):
        res = client.get("/api/v1/destinations?search=火星基地")
        assert res.status_code == 200
        assert res.json()["data"] == []


# ═══════════════════════════════════════════════════════════════════════════════
# 详情接口 — GET /api/v1/destinations/{slug}
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetDestinationDetail:
    """GET /api/v1/destinations/{slug}"""

    def test_returns_full_detail(self, client, seed_db):
        res = client.get("/api/v1/destinations/salar-de-uyuni")
        assert res.status_code == 200
        detail = res.json()["data"]

        # 扁平字段
        assert detail["title"] == "玻利维亚 · 天空之镜"
        assert detail["slug"] == "salar-de-uyuni"

        # 分组字段
        assert "location" in detail
        assert detail["location"]["country"] == "玻利维亚"
        assert detail["location"]["coordinates"]["lat"] == -20.1338

        assert "travel_info" in detail
        assert detail["travel_info"]["difficulty"] == "moderate"

        assert "practical" in detail
        assert detail["practical"]["currency"] == "玻利维亚诺 (BOB)"

        # JSON 数组字段
        assert isinstance(detail["fun_facts"], list)
        assert len(detail["fun_facts"]) == 4

        assert isinstance(detail["travel_tips"], list)
        assert len(detail["travel_tips"]) == 5

        # JSON 对象字段
        assert "getting_there" in detail
        assert "routes" in detail["getting_there"]

        # 媒体
        assert "media" in detail
        assert "images" in detail["media"]
        assert len(detail["media"]["images"]) == 3

        # 关联数据
        assert len(detail["categories"]) >= 1
        assert len(detail["tags"]) >= 1

        # 统计
        assert "stats" in detail
        assert "rating_count" in detail["stats"]

    def test_not_found_returns_404(self, client, seed_db):
        res = client.get("/api/v1/destinations/nonexistent-place")
        assert res.status_code == 404
        assert res.json()["error"]["code"] == "NOT_FOUND"

    def test_draft_not_visible(self, client, seed_db):
        """草稿状态的目的地不应在列表中出现。"""
        # 将 Golden Bridge 设为 draft
        seed_db.execute(
            "UPDATE destinations SET status = 'draft' WHERE slug = 'golden-bridge-vietnam'"
        )
        seed_db.commit()

        res = client.get("/api/v1/destinations")
        assert res.json()["meta"]["total"] == 2

    def test_user_context_with_device_id(self, client, seed_db):
        """携带 X-Device-Id 时应返回 user_context。"""
        # 先收藏
        client.post(
            "/api/v1/destinations/salar-de-uyuni/favorite",
            headers={"X-Device-Id": "test-uuid-detail"},
        )

        res = client.get(
            "/api/v1/destinations/salar-de-uyuni",
            headers={"X-Device-Id": "test-uuid-detail"},
        )
        assert res.status_code == 200
        uc = res.json()["data"].get("user_context")
        assert uc is not None
        assert uc["is_favorited"] is True

    def test_user_context_without_device_id(self, client, seed_db):
        """不携带 X-Device-Id 时 user_context 为 false。"""
        res = client.get("/api/v1/destinations/salar-de-uyuni")
        assert res.status_code == 200
        uc = res.json()["data"].get("user_context")
        # 无 device_id 时 is_favorited 始终为 False
        if uc:
            assert uc["is_favorited"] is False
