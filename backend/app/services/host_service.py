from typing import Dict, Any, Optional
from app.services.room_manager import room_manager
import logging

logger = logging.getLogger("host_service")

class HostService:
    """
    Host Moderation & Privilege Authority (Layer 4 Domain Service).
    Enforces role-based authority:
    - Mute All Participants
    - Mute Individual Participant
    - Kick / Remove Participant
    - Lock / Unlock Meeting Room
    """
    @staticmethod
    async def handle_host_action(
        meeting_id: str,
        sender_peer_id: str,
        action: str,
        target_peer_id: Optional[str] = None,
        provided_host_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute privileged host actions with strict identity & authority validation."""
        # 1. Verify sender is the registered host of this room
        current_host = room_manager.room_hosts.get(meeting_id)
        if current_host != sender_peer_id:
            # Check if valid host_token was provided as fallback
            expected_token = room_manager.room_host_tokens.get(meeting_id)
            if not (expected_token and provided_host_token == expected_token):
                logger.warning(f"Unauthorized host action '{action}' rejected for peer {sender_peer_id} in {meeting_id}")
                return {"success": False, "error": "Only the meeting host can perform this moderation action."}

        # 2. Execute Action
        if action == "mute_all":
            # Command all peers (except host) to disable their microphone
            await room_manager.broadcast_to_room(
                meeting_id,
                {"type": "host-command", "command": "mute-microphone"},
                exclude_peer_id=sender_peer_id
            )
            # Update internal server state
            room = room_manager.rooms.get(meeting_id, {})
            for pid, peer in room.items():
                if pid != sender_peer_id:
                    peer.is_muted = True

            logger.info(f"Host {sender_peer_id} executed 'mute_all' in room {meeting_id}")
            return {"success": True, "action": "mute_all"}

        elif action == "kick_user" and target_peer_id:
            # Cannot kick yourself or invalid target
            if target_peer_id == sender_peer_id:
                return {"success": False, "error": "Host cannot kick themselves."}

            # Send force-leave signal to the target user
            await room_manager.send_to_peer(
                meeting_id,
                target_peer_id,
                {
                    "type": "host-command",
                    "command": "kicked",
                    "reason": "You were removed from the meeting by the host."
                }
            )
            # Disconnect peer from room
            await room_manager.disconnect_peer(meeting_id, target_peer_id)
            logger.info(f"Host {sender_peer_id} kicked peer {target_peer_id} from {meeting_id}")
            return {"success": True, "action": "kick_user", "target": target_peer_id}

        elif action == "mute_user" and target_peer_id:
            await room_manager.send_to_peer(
                meeting_id,
                target_peer_id,
                {"type": "host-command", "command": "mute-microphone"}
            )
            room = room_manager.rooms.get(meeting_id, {})
            if target_peer_id in room:
                room[target_peer_id].is_muted = True
            return {"success": True, "action": "mute_user", "target": target_peer_id}

        elif action == "lock_meeting":
            await room_manager.broadcast_to_room(
                meeting_id,
                {
                    "type": "meeting-locked",
                    "message": "The host has locked this meeting. No new participants can join."
                }
            )
            return {"success": True, "action": "lock_meeting"}

        return {"success": False, "error": f"Unknown or unsupported host action '{action}'"}
