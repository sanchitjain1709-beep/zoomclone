from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from app.services.room_manager import room_manager
from app.services.host_service import HostService
import json
import logging

logger = logging.getLogger("signaling")
router = APIRouter(tags=["Signaling"])

@router.websocket("/ws/meeting/{meeting_id}")
async def websocket_signaling_endpoint(
    websocket: WebSocket,
    meeting_id: str,
    peer_id: str = Query(...),
    name: str = Query(default="Participant"),
    role: str = Query(default="PARTICIPANT"),
    host_token: Optional[str] = Query(default=None)
):
    """
    Real-Time WebSocket Signaling Gateway for WebRTC Handshake & Meeting Room Events (Layer 3).
    Handles:
    - Peer registration & dynamic discovery
    - SDP Offer / Answer relay
    - ICE Candidate queueing and routing
    - Heartbeat Ping / Pong liveness tracking
    - Audio / Video media state synchronization
    - In-meeting Chat broadcasting & reactions
    - Cryptographically verified Host controls (Mute All, Kick, Mute User)
    """
    await websocket.accept()
    
    is_host = (role.upper() == "HOST")

    try:
        if not is_host:
            # 1. Non-host participants enter the Waiting Room until admitted
            await room_manager.add_to_waiting_room(meeting_id, peer_id, websocket, name)
            await websocket.send_text(json.dumps({
                "type": "waiting-room-status",
                "status": "WAITING",
                "peer_id": peer_id,
                "name": name,
                "message": "Please wait, the meeting host will let you in soon."
            }))

            # Notify the host in real time about the waiting participant
            host_id = room_manager.room_hosts.get(meeting_id)
            if host_id:
                await room_manager.send_to_peer(
                    meeting_id,
                    host_id,
                    {
                        "type": "waiting-peer-joined",
                        "peer_id": peer_id,
                        "name": name
                    }
                )
        else:
            # 2. Host connects directly into the room
            existing_peers = await room_manager.connect_peer(
                meeting_id=meeting_id,
                peer_id=peer_id,
                websocket=websocket,
                name=name,
                role="HOST",
                host_token=host_token
            )
            waiting_peers = room_manager.get_waiting_peers(meeting_id)

            await websocket.send_text(json.dumps({
                "type": "room-joined",
                "peer_id": peer_id,
                "role": "HOST",
                "peers": existing_peers,
                "waiting_peers": waiting_peers
            }))

            await room_manager.broadcast_to_room(
                meeting_id,
                {
                    "type": "user-joined",
                    "peer_id": peer_id,
                    "name": name,
                    "role": "HOST",
                    "is_muted": True,
                    "is_video_off": True,
                    "is_screen_sharing": False
                },
                exclude_peer_id=peer_id
            )

        # 3. Message listening loop
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")
            room_manager.record_heartbeat(meeting_id, peer_id)

            # Liveness Heartbeat Ping/Pong
            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            # Route WebRTC SDP Offer
            elif msg_type == "offer":
                target_id = data.get("target_id")
                if target_id:
                    await room_manager.send_to_peer(
                        meeting_id,
                        target_id,
                        {
                            "type": "offer",
                            "sender_id": peer_id,
                            "target_id": target_id,
                            "sdp": data.get("sdp")
                        }
                    )

            # Route WebRTC SDP Answer
            elif msg_type == "answer":
                target_id = data.get("target_id")
                if target_id:
                    await room_manager.send_to_peer(
                        meeting_id,
                        target_id,
                        {
                            "type": "answer",
                            "sender_id": peer_id,
                            "target_id": target_id,
                            "sdp": data.get("sdp")
                        }
                    )

            # Route ICE Candidate
            elif msg_type == "ice-candidate":
                target_id = data.get("target_id")
                if target_id:
                    await room_manager.send_to_peer(
                        meeting_id,
                        target_id,
                        {
                            "type": "ice-candidate",
                            "sender_id": peer_id,
                            "target_id": target_id,
                            "candidate": data.get("candidate")
                        }
                    )

            # Media state changes (Mic, Cam, Screen share)
            elif msg_type == "media-state-change":
                kind = data.get("kind")
                enabled = data.get("enabled", False)
                room_manager.update_media_state(meeting_id, peer_id, kind, enabled)
                await room_manager.broadcast_to_room(
                    meeting_id,
                    {
                        "type": "media-state-change",
                        "peer_id": peer_id,
                        "kind": kind,
                        "enabled": enabled
                    }
                )

            # In-meeting live chat message
            elif msg_type == "chat-broadcast":
                await room_manager.broadcast_to_room(
                    meeting_id,
                    {
                        "type": "chat-broadcast",
                        "sender_id": peer_id,
                        "sender_name": data.get("sender_name", name),
                        "message": data.get("message", ""),
                        "timestamp": data.get("timestamp", "")
                    }
                )

            # Reactions (Emoji broadcast)
            elif msg_type == "reaction":
                await room_manager.broadcast_to_room(
                    meeting_id,
                    {
                        "type": "reaction",
                        "sender_id": peer_id,
                        "emoji": data.get("emoji", "👍")
                    }
                )

            # Host query for waiting room roster
            elif msg_type == "get-waiting-peers":
                waiting_peers = room_manager.get_waiting_peers(meeting_id)
                await websocket.send_text(json.dumps({
                    "type": "waiting-room-list",
                    "peers": waiting_peers
                }))

            # Host Moderation Action (Mute All, Kick, Lock, Admit, Deny)
            elif msg_type == "host-action":
                action = data.get("action")
                target_peer_id = data.get("target_peer_id")
                token = data.get("host_token") or host_token
                res = await HostService.handle_host_action(
                    meeting_id=meeting_id,
                    sender_peer_id=peer_id,
                    action=action,
                    target_peer_id=target_peer_id,
                    provided_host_token=token
                )
                await websocket.send_text(json.dumps({
                    "type": "host-action-response",
                    "result": res
                }))

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for peer {peer_id} in {meeting_id}")
    except Exception as e:
        logger.error(f"WebSocket error for peer {peer_id}: {e}")
    finally:
        await room_manager.disconnect_peer(meeting_id, peer_id)
