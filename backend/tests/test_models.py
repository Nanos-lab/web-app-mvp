"""
Pydantic 模型测试 — 序列化/反序列化 & 数据完整性
"""

import json

import pytest

from models import (
    DestinationCard,
    DestinationDetail,
    CategoryBrief,
    TagBrief,
    DestinationStatsBrief,
    DestinationStatsFull,
    PaginationMeta,
    DestinationListResponse,
    DestinationDetailResponse,
    ErrorResponse,
    ErrorBody,
    LocationInfo,
    TravelInfo,
    PracticalInfo,
    GettingThere,
    MediaInfo,
    DestinationImage,
    Coordinates,
    _parse_json,
)


class TestParseJson:
    def test_valid_json_array(self):
        result = _parse_json('["a", "b", "c"]')
        assert result == ["a", "b", "c"]

    def test_valid_json_object(self):
        result = _parse_json('{"key": "value"}')
        assert result == {"key": "value"}

    def test_none_returns_default(self):
        assert _parse_json(None) is None
        assert _parse_json(None, []) == []

    def test_invalid_json_returns_default(self):
        assert _parse_json("not valid json", []) == []

    def test_empty_string_returns_default(self):
        assert _parse_json("", {"default": True}) == {"default": True}


class TestPaginationMeta:
    def test_valid_pagination(self):
        meta = PaginationMeta(page=1, page_size=20, total=100, total_pages=5)
        assert meta.page == 1
        assert meta.total_pages == 5

    def test_serialization(self):
        meta = PaginationMeta(page=1, page_size=20, total=3, total_pages=1)
        dumped = meta.model_dump()
        assert dumped == {"page": 1, "page_size": 20, "total": 3, "total_pages": 1}


class TestErrorResponse:
    def test_error_response(self):
        err = ErrorResponse(code="NOT_FOUND", message="未找到")
        body = ErrorBody(error=err)
        dumped = body.model_dump()
        assert dumped["error"]["code"] == "NOT_FOUND"
        assert dumped["error"]["message"] == "未找到"


class TestDestinationCard:
    def test_minimal_card(self):
        card = DestinationCard(
            id=1,
            title="测试目的地",
            slug="test-place",
            country="中国",
            stats=DestinationStatsBrief(view_count=0, favorite_count=0, rating=0),
        )
        data = card.model_dump()
        assert data["id"] == 1
        assert data["categories"] == []
        assert data["tags"] == []

    def test_full_card(self):
        card = DestinationCard(
            id=1,
            title="天空之镜",
            slug="salar-de-uyuni",
            subtitle="镜面世界",
            summary="世界上最大的盐沼",
            country="玻利维亚",
            continent="南美洲",
            difficulty="moderate",
            budget="moderate",
            duration="3-4天",
            thumbnail_url="/images/thumb.jpg",
            categories=[CategoryBrief(id=1, name="自然奇观", slug="natural-wonders")],
            tags=[TagBrief(id=1, name="星空摄影", slug="astrophotography")],
            stats=DestinationStatsBrief(view_count=12600, favorite_count=3842, rating=4.8),
            created_at="2026-01-15T08:00:00Z",
        )
        data = card.model_dump()
        assert len(data["categories"]) == 1
        assert len(data["tags"]) == 1
        assert data["stats"]["rating"] == 4.8


class TestDestinationDetail:
    def test_full_detail_assembly(self):
        detail = DestinationDetail(
            id=1,
            title="天空之镜",
            title_en="Salar de Uyuni",
            slug="salar-de-uyuni",
            subtitle="镜面世界",
            summary="世界上最大的盐沼",
            description="<h2>为什么不可思议</h2>",
            location=LocationInfo(
                country="玻利维亚",
                region="波托西省",
                continent="南美洲",
                coordinates=Coordinates(lat=-20.1338, lng=-67.4893),
                elevation=3656,
            ),
            travel_info=TravelInfo(
                best_season="12月-3月",
                difficulty="moderate",
                duration="3-4天",
                budget="moderate",
                crowd_level="low",
                temperature="-5°C ~ 15°C",
            ),
            practical=PracticalInfo(
                visa_info="落地签",
                language="西班牙语",
                currency="BOB",
                timezone="UTC-4",
            ),
            fun_facts=["fact1", "fact2"],
            travel_tips=["tip1"],
            getting_there=GettingThere(
                nearest_airport="UYU",
                routes=["从拉巴斯飞1小时"],
                local_transport="Tour",
            ),
            media=MediaInfo(
                cover_image_url="/images/cover.jpg",
                thumbnail_url="/images/thumb.jpg",
                images=[
                    DestinationImage(
                        id=1, url="/images/01.jpg",
                        alt_text="test", width=2400, height=1350,
                        photographer="John", source="Unsplash", license="Free",
                    )
                ],
            ),
            categories=[CategoryBrief(id=1, name="自然奇观", slug="natural-wonders")],
            tags=[TagBrief(id=1, name="星空摄影", slug="astrophotography")],
            stats=DestinationStatsFull(
                view_count=12600, favorite_count=3842, rating=4.8, rating_count=256
            ),
            created_at="2026-01-15T08:00:00Z",
            updated_at="2026-05-20T14:30:00Z",
        )

        data = detail.model_dump()
        assert data["location"]["coordinates"]["lat"] == -20.1338
        assert len(data["fun_facts"]) == 2
        assert len(data["media"]["images"]) == 1
        assert data["stats"]["rating_count"] == 256
