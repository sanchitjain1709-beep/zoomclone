import pytest
import asyncio
from app.services.pubsub import InMemoryEventBus
from app.services.room_manager import RoomManager
from app.services.host_service import HostService

class DummyWebSocket:
    def __init__(self):
        self.sent_messages = []

    async def send_text(self, text: str):
        self.sent_messages.append(text)

@pytest.mark.asyncio
async def test_event_bus_publish_subscribe():
    bus = InMemoryEventBus()
    received = []

    async def sample_handler(data):
        received.append(data)

    await bus.subscribe("room:test-123", sample_handler)
    await bus.publish("room:test-123", {"event": "hello", "payload": 42})

    assert len(received) == 1
    assert received[0]["event"] == "hello"
    assert received[0]["payload"] == 42

    # Unsubscribe test
    await bus.unsubscribe("room:test-123", sample_handler)
    await bus.publish("room:test-123", {"event": "second"})
    assert len(received) == 1  # No additional message received


@pytest.mark.asyncio
async def test_room_manager_lifecycle():
    rm = RoomManager()
    ws1 = DummyWebSocket()
    ws2 = DummyWebSocket()

    # 1. First peer joins as HOST
    peers1 = await rm.connect_peer("m-101", "peer-host", ws1, "HostUser", role="HOST", host_token="secret-token-1")
    assert len(peers1) == 0
    assert rm.room_hosts.get("m-101") == "peer-host"
    assert rm.room_host_tokens.get("m-101") == "secret-token-1"

    # 2. Second peer joins as PARTICIPANT
    peers2 = await rm.connect_peer("m-101", "peer-guest", ws2, "GuestUser", role="PARTICIPANT")
    assert len(peers2) == 1
    assert peers2[0]["peer_id"] == "peer-host"

    # 3. Media state update
    rm.update_media_state("m-101", "peer-guest", "audio", True)
    guest = rm.rooms["m-101"]["peer-guest"]
    assert guest.is_muted is False

    # 4. Host disconnects -> Host role cascades to Guest
    await rm.disconnect_peer("m-101", "peer-host")
    assert rm.room_hosts.get("m-101") == "peer-guest"
    assert rm.rooms["m-101"]["peer-guest"].role == "HOST"


@pytest.mark.asyncio
async def test_room_manager_zombie_pruning():
    rm = RoomManager()
    ws = DummyWebSocket()

    await rm.connect_peer("m-202", "peer-zombie", ws, "DeadPeer")
    # Simulate old heartbeat
    rm.rooms["m-202"]["peer-zombie"].last_heartbeat = 0.0

    pruned = await rm.prune_zombie_peers(max_idle_seconds=10.0)
    assert "peer-zombie" in pruned
    assert "m-202" not in rm.rooms


@pytest.mark.asyncio
async def test_host_service_authorization():
    # Setup room with host and guest
    from app.services.room_manager import room_manager
    ws1 = DummyWebSocket()
    ws2 = DummyWebSocket()

    room_id = "test-auth-room"
    await room_manager.connect_peer(room_id, "host-1", ws1, "Host", role="HOST", host_token="my-token")
    await room_manager.connect_peer(room_id, "guest-1", ws2, "Guest", role="PARTICIPANT")

    # Unauthorized participant attempts mute_all -> Should fail
    res_unauth = await HostService.handle_host_action(
        meeting_id=room_id,
        sender_peer_id="guest-1",
        action="mute_all"
    )
    assert res_unauth["success"] is False
    assert "Only the meeting host" in res_unauth["error"]

    # Authorized host attempts mute_all -> Should succeed
    res_auth = await HostService.handle_host_action(
        meeting_id=room_id,
        sender_peer_id="host-1",
        action="mute_all"
    )
    assert res_auth["success"] is True
    assert res_auth["action"] == "mute_all"

    # Host attempts to kick themselves -> Should fail
    res_self = await HostService.handle_host_action(
        meeting_id=room_id,
        sender_peer_id="host-1",
        action="kick_user",
        target_peer_id="host-1"
    )
    assert res_self["success"] is False
    assert "cannot kick themselves" in res_self["error"]

    # Host kicks guest -> Should succeed
    res_kick = await HostService.handle_host_action(
        meeting_id=room_id,
        sender_peer_id="host-1",
        action="kick_user",
        target_peer_id="guest-1"
    )
    assert res_kick["success"] is True
    assert res_kick["target"] == "guest-1"
    assert "guest-1" not in room_manager.rooms[room_id]

    # Cleanup
    await room_manager.disconnect_peer(room_id, "host-1")
