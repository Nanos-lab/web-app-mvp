"""
分类 & 标签路由测试
"""


class TestCategories:
    """GET /api/v1/categories"""

    def test_returns_all_categories(self, client, seed_db):
        res = client.get("/api/v1/categories")
        assert res.status_code == 200
        data = res.json()["data"]
        assert len(data) == 3

        for cat in data:
            assert "id" in cat
            assert "name" in cat
            assert "slug" in cat
            assert "destination_count" in cat

    def test_destination_count_accurate(self, client, seed_db):
        """分类的目的地计数只统计 published 状态。"""
        res = client.get("/api/v1/categories")
        cat = next(c for c in res.json()["data"] if c["slug"] == "natural-wonders")
        # Salar de Uyuni + Golden Bridge 同属 natural-wonders
        assert cat["destination_count"] == 2

    def test_empty_db_returns_empty(self, client):
        """无种子数据时返回空列表。"""
        res = client.get("/api/v1/categories")
        assert res.status_code == 200
        assert res.json()["data"] == []


class TestTags:
    """GET /api/v1/tags"""

    def test_returns_all_tags_sorted_by_name(self, client, seed_db):
        res = client.get("/api/v1/tags")
        assert res.status_code == 200
        data = res.json()["data"]
        assert len(data) == 8

        for tag in data:
            assert "id" in tag
            assert "name" in tag
            assert "slug" in tag
            assert "destination_count" in tag

    def test_sort_by_count(self, client, seed_db):
        res = client.get("/api/v1/tags?sort=count")
        assert res.status_code == 200
        data = res.json()["data"]
        # 第一个应是 destination_count 最高的
        assert data[0]["destination_count"] >= data[-1]["destination_count"]

    def test_empty_db(self, client):
        res = client.get("/api/v1/tags")
        assert res.status_code == 200
        assert res.json()["data"] == []
