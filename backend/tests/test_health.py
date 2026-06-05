"""
健康检查 & 异常处理测试
"""


class TestHealthCheck:
    """GET /api/v1/health"""

    def test_health_returns_ok(self, client):
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["version"] == "1.0.0"


class TestNotFound:
    """404 处理"""

    def test_unknown_route_returns_structured_error(self, client):
        res = client.get("/api/v1/nonexistent")
        assert res.status_code == 404
        data = res.json()
        assert "error" in data
        assert data["error"]["code"] == "NOT_FOUND"


class TestSeedEndpoint:
    """POST /api/v1/admin/seed"""

    def test_seed_loads_data(self, client, isolated_db):
        res = client.post("/api/v1/admin/seed")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "3 个目的地" in data["message"]

        # 验证数据库中有数据
        count = isolated_db.execute("SELECT COUNT(*) FROM destinations").fetchone()[0]
        assert count == 3
