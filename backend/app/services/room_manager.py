from typing import Dict, Any, Optional, List
from fastapi import WebSocket
import json
import asyncio
import time
import logging

from app.services.pubsub import event_bus

logger = logging.getLogger("room_manager")

class PeerInfo:
    def __init__(self, peer_id: str, websocket: WebSocket, name: str, role: str = "PARTICIPANT"):
        self.peer_id = peer_id
        self.websocket = websocket
        self.name = name
        self.role = role
        self.is_muted = True
        self.is_video_off = True
        self.is_screen_sharing = False
        self.last_heartbeat: float = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "peer_id": self.peer_id,
            "name": self.name,
            "role": self.role,
            "is_muted": self.is_muted,
            "is_video_off": self.is_video_off,
            "is_screen_sharing": self.is_screen_sharing,
            "last_heartbeat": self.last_heartbeat,
        }

class RoomManager:
    """
    Thread-safe In-Memory Room Session & Real-time WebRTC Signaling Hub.
    Decoupled with PubSub Adapter for distributed horizontal scaling.
    """
    def __init__(self):
        # meeting_id -> { peer_id: PeerInfo }
        self.rooms: Dict[str, Dict[str, PeerInfo]] = {}
        # meeting_id -> host_peer_id
        self.room_hosts: Dict[str, str] = {}
        # meeting_id -> host_token (secret key)
        self.room_host_tokens: Dict[str, str] = {}
        self._lock = asyncio.Lock()

    async def connect_peer(
        self,
        meeting_id: str,
        peer_id: str,
        websocket: WebSocket,
        name: str,
        role: str = "PARTICIPANT",
        host_token: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Register peer in room and return list of existing peers."""
        async with self._lock:
            if meeting_id not in self.rooms:
                self.rooms[meeting_id] = {}

            # First user or explicit HOST role becomes the room host
            if len(self.rooms[meeting_id]) == 0 or role.upper() == "HOST":
                role = "HOST"
                self.room_hosts[meeting_id] = peer_id
                if host_token:
                    self.room_host_tokens[meeting_id] = host_token

            peer = PeerInfo(peer_id, websocket, name, role)
            existing_peers = [p.to_dict() for p in self.rooms[meeting_id].values()]
            self.rooms[meeting_id][peer_id] = peer

            logger.info(f"Peer {peer_id} ({name}, {role}) joined room {meeting_id}. Total: {len(self.rooms[meeting_id])}")

        # Publish join event to event bus for distributed listeners
        await event_bus.publish(f"meeting:{meeting_id}", {
            "type": "user-joined-bus",
            "meeting_id": meeting_id,
            "peer_id": peer_id,
            "name": name,
            "role": role
        })

        return existing_peers

    async def disconnect_peer(self, meeting_id: str, peer_id: str) -> Optional[str]:
        """Remove peer from room and broadcast exit to remaining peers."""
        host_changed_to: Optional[str] = None

        async with self._lock:
            if meeting_id in self.rooms and peer_id in self.rooms[meeting_id]:
                del self.rooms[meeting_id][peer_id]
                logger.info(f"Peer {peer_id} left room {meeting_id}")

                # Clean up empty room
                if len(self.rooms[meeting_id]) == 0:
                    del self.rooms[meeting_id]
                    if meeting_id in self.room_hosts:
                        del self.room_hosts[meeting_id]
                    if meeting_id in self.room_host_tokens:
                        del self.room_host_tokens[meeting_id]
                    return None

                # Reassign host if host left
                if self.room_hosts.get(meeting_id) == peer_id:
                    remaining = list(self.rooms[meeting_id].values())
                    if remaining:
                        new_host = remaining[0]
                        new_host.role = "HOST"
                        self.room_hosts[meeting_id] = new_host.peer_id
                        host_changed_to = new_host.peer_id
                        logger.info(f"Host transferred to {new_host.peer_id} ({new_host.name}) in {meeting_id}")

        # Broadcast departure to remaining peers
        await self.broadcast_to_room(
            meeting_id,
            {"type": "user-left", "peer_id": peer_id},
            exclude_peer_id=peer_id
        )

        # If host transferred, notify peers
        if host_changed_to:
            await self.broadcast_to_room(
                meeting_id,
                {"type": "host-changed", "new_host_id": host_changed_to}
            )

        # Publish departure to distributed event bus
        await event_bus.publish(f"meeting:{meeting_id}", {
            "type": "user-left-bus",
            "meeting_id": meeting_id,
            "peer_id": peer_id
        })

        return peer_id

    async def send_to_peer(self, meeting_id: str, target_peer_id: str, message: Dict[str, Any]) -> bool:
        """Send message directly to a target peer."""
        room = self.rooms.get(meeting_id)
        if not room:
            return False
        peer = room.get(target_peer_id)
        if not peer:
            return False
        try:
            await peer.websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Error sending message to peer {target_peer_id}: {e}")
            return False

    async def broadcast_to_room(
        self,
        meeting_id: str,
        message: Dict[str, Any],
        exclude_peer_id: Optional[str] = None
    ):
        """Broadcast message to all active peers in the meeting and publish to EventBus."""
        room = self.rooms.get(meeting_id)
        if not room:
            return

        payload = json.dumps(message)
        tasks = []
        for pid, peer in list(room.items()):
            if exclude_peer_id and pid == exclude_peer_id:
                continue
            tasks.append(self._safe_send(peer.websocket, payload, pid, meeting_id))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        # Forward to distributed EventBus
        await event_bus.publish(f"meeting:{meeting_id}", message)

    async def _safe_send(self, websocket: WebSocket, payload: str, peer_id: str, meeting_id: str):
        try:
            await websocket.send_text(payload)
        except Exception as e:
            logger.warning(f"Failed to send to {peer_id} in {meeting_id}: {e}")

    def update_media_state(self, meeting_id: str, peer_id: str, kind: str, enabled: bool):
        """Update audio or video status of a peer."""
        room = self.rooms.get(meeting_id)
        if room and peer_id in room:
            peer = room[peer_id]
            if kind == "audio":
                peer.is_muted = not enabled
            elif kind == "video":
                peer.is_video_off = not enabled
            elif kind == "screen":
                peer.is_screen_sharing = enabled

    def record_heartbeat(self, meeting_id: str, peer_id: str):
        """Update the last heartbeat timestamp for liveness tracking."""
        room = self.rooms.get(meeting_id)
        if room and peer_id in room:
            room[peer_id].last_heartbeat = time.time()

    async def prune_zombie_peers(self, max_idle_seconds: float = 60.0) -> List[str]:
        """Prune disconnected peers that stopped responding to heartbeats."""
        now = time.time()
        pruned = []
        for meeting_id, room in list(self.rooms.items()):
            for peer_id, peer in list(room.items()):
                if now - peer.last_heartbeat > max_idle_seconds:
                    logger.warning(f"Pruning zombie peer {peer_id} from {meeting_id} (idle {now - peer.last_heartbeat:.1f}s)")
                    await self.disconnect_peer(meeting_id, peer_id)
                    pruned.append(peer_id)
        return pruned

    def get_room_peers(self, meeting_id: str) -> List[Dict[str, Any]]:
        room = self.rooms.get(meeting_id, {})
        return [p.to_dict() for p in room.values()]

# Global Singleton Room Manager
room_manager = RoomManager()
