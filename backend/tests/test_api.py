import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["sqlite_wal_enabled"] is True

@pytest.mark.asyncio
async def test_get_current_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Sanchit Jain"
    assert data["pmi"] == "948 007 6202"
    assert data["plan"] == "Workplace Basic"

@pytest.mark.asyncio
async def test_list_upcoming_meetings():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Schedule a meeting first to ensure at least one exists
        payload = {
            "title": "Upcoming Test Sync",
            "scheduled_start": "2026-12-01T10:00:00Z",
            "duration_minutes": 30,
            "passcode": "sync123"
        }
        await ac.post("/api/meetings/schedule", json=payload)
        response = await ac.get("/api/meetings/upcoming")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "meeting_code" in data[0]

@pytest.mark.asyncio
async def test_list_recent_meetings():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/meetings/recent")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_create_instant_meeting():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"title": "Quick Standup Meeting", "use_pmi": False}
        response = await ac.post("/api/meetings/instant", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Quick Standup Meeting"
    assert len(data["meeting_code"]) >= 10
    assert data["status"] == "ACTIVE"
    assert data["invite_link"] is not None

@pytest.mark.asyncio
async def test_schedule_meeting():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "title": "Quarterly Product Review",
            "description": "Discuss roadmap for Q4.",
            "scheduled_start": "2026-10-15T14:00:00Z",
            "duration_minutes": 45,
            "passcode": "q4zoom",
            "enable_waiting_room": True
        }
        response = await ac.post("/api/meetings/schedule", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Quarterly Product Review"
    assert data["duration_minutes"] == 45
    assert data["passcode"] == "q4zoom"
    assert data["enable_waiting_room"] is True

@pytest.mark.asyncio
async def test_validate_meeting_code():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create an instant meeting and validate it
        create_res = await ac.post("/api/meetings/instant", json={"title": "Validation Test"})
        assert create_res.status_code == 200
        meeting_code = create_res.json()["meeting_code"]

        # Validate created meeting
        response = await ac.get(f"/api/meetings/validate/{meeting_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is True
        assert data["meeting"]["meeting_code"] == meeting_code

        # Validate non-existent meeting
        response_invalid = await ac.get("/api/meetings/validate/000 0000 0000")
        assert response_invalid.status_code == 200
        data_invalid = response_invalid.json()
        assert data_invalid["exists"] is False
