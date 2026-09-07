# Zoom Clone — Video Conferencing Web Application
**Fullstack SDE Assignment Submission for Scaler**

A functional, high-fidelity video conferencing web application clone of Zoom's web app that replicates Zoom’s exact design system, user experience, and core meeting workflows.

Built strictly according to the assignment requirements with **Next.js**, **Python FastAPI**, **SQLite (with Write-Ahead Logging)**, and **WebRTC / WebSockets**.

---

## 🌟 Key Features & Capabilities

### 1. Landing Dashboard & Portal
* **Exact Zoom Visual Reproduction**: Styled with Zoom's design language based on real Zoom Workplace web screenshots (`screenshots/`), including the top dark navy strip (`#00053D`), white navigation bar with vibrant Zoom blue (`#0B5CFF`), and user profile card.
* **Pre-Seeded Default Evaluator User**: Logged in as **Sanchit Jain**, plan **Workplace Basic**, and Personal Meeting ID **`948 007 6202`** with a one-click copy button.
* **Live Digital Clock Widget**: Displays real-time time (`5:00 PM`) and day/date matching Zoom's desktop/web client.
* **3 Iconic Quick Action Buttons**:
  * **Schedule** (Blue rounded squircle with calendar icon)
  * **Join** (Blue rounded squircle with plus icon)
  * **Host / New Meeting** (Orange rounded squircle `#FF5500` with camera icon)
* **Upcoming Meetings Section**: Live database-synced list of upcoming sessions with date/time badges, Meeting IDs, one-click **Copy Invitation**, and **Start** meeting buttons.
* **Recent Meetings History**: Displays past completed sessions with durations and timestamps.

### 2. Instant Meeting Creation
* Click **Host** or **New Meeting** to instantly generate a unique 10-digit Zoom meeting code (`xxx xxxx xxxx`), persist to SQLite, and route directly to the meeting room.

### 3. Join Meeting & Pre-Meeting Green Room (Lobby)
* Click **Join** or open an invite link (`/lobby/[meetingId]`).
* **Meeting Validation**: Automatically checks the SQLite database to ensure the meeting exists and is active.
* **Camera & Microphone Preview**: Test your video and microphone before entering.
* **Web Audio API Volume Visualizer**: Real-time microphone audio level meter.
* **Display Name Input**: Pre-filled with "Sanchit Jain" for the host or editable for guests.

### 4. In-Meeting Experience & Real-Time WebRTC Conferencing
* **Multi-Peer WebRTC Mesh**: Direct peer-to-peer audio and video streaming via STUN servers.
* **Dynamic Gallery Grid**: Adapts to the number of participants with active speaker neon-blue outline (`#0E71EB`).
* **Zoom Bottom Docked Toolbar**:
  * **Audio**: Mute/Unmute toggle with red strike-through indicator.
  * **Video**: Start/Stop camera toggle with red slash indicator.
  * **Participants**: Counter badge opening the right slide-over drawer with participant roster.
  * **Chat**: Live in-meeting group messaging drawer.
  * **Screen Share**: Prominent green icon (`#22C55E`) utilizing `getDisplayMedia` and track replacement.
  * **Reactions**: Interactive emoji bar (👍, 👏, ❤️, 🎉, 😂, ✋) that floats animated emoji bubbles on screen.
  * **Host Controls**: Host moderation shield allowing **Mute All** and **Remove Participant**.
  * **End / Leave Meeting**: Floating dialog with **End meeting for all** (host) and **Leave meeting** options.

### 5. Schedule Meetings
* Form with Topic, Description, Date picker, Time picker, Duration (`0 hr 40 min`), Passcode (`gTfEu4`), Waiting Room toggle, and Auto-generate vs Personal Meeting ID.
* Saved instantly to SQLite and displayed in the Upcoming Meetings list.

---

## 🏗️ 6-Layer Architecture Overview

```
Layer 1: Presentation Layer     -> Next.js 16 (React 19, Tailwind CSS v4, Lucide Icons)
Layer 2: Media Engine           -> WebRTC Mesh (RTCPeerConnection, getUserMedia, replaceTrack)
Layer 3: Transport Gateway      -> FastAPI (REST OpenAPI + WebSocket Signaling Hub)
Layer 4: Domain Services        -> MeetingService, RoomManager, HostService
Layer 5: Data Persistence       -> SQLAlchemy 2.0 Async + SQLite (WAL Mode enabled)
Layer 6: Infrastructure         -> Google STUN servers, Liveness heartbeats
```

---

## 🗄️ Database Design (SQLite + SQLAlchemy)

The database schema is normalized and configured in **WAL (Write-Ahead Logging)** mode (`PRAGMA journal_mode = WAL;`) for high concurrency:
* `users`: Evaluator profile, email, display name, plan, PMI, avatar initial, default flag.
* `meetings`: Unique 10-digit meeting code, title, description, host foreign key, meeting type, status (`SCHEDULED`, `ACTIVE`, `ENDED`), scheduled start, duration, passcode, host token.
* `meeting_participants`: Session records, roles (`HOST`, `PARTICIPANT`), mute states.
* `chat_messages`: In-meeting text messages with timestamps.

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.10+ (Tested on Python 3.13)
* Node.js 18+ (Tested on Node.js v22)

### 1. Backend Setup
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate          # Windows PowerShell / CMD
# source venv/bin/activate       # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Seed the database with Sanchit Jain profile and sample meetings
python -m app.utils.seed

# Run automated tests
pytest -v tests/test_api.py

# Start the FastAPI server
uvicorn app.main:app --port 8000 --reload
```
* Backend API: `http://localhost:8000`
* Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```
* Open your browser and navigate to: **`http://localhost:3000`**

---

## 🧪 Testing Multi-Peer Video Conferencing
1. Open `http://localhost:3000` in your main browser window.
2. Click **Host** or **Start** on an upcoming meeting -> Enter room as Host (**Sanchit Jain**).
3. Open a second browser window (or Incognito / second device on the same local network).
4. Click **Join** -> Enter the Meeting ID (e.g. `842 4910 2931`) and set display name to **Guest User**.
5. Test live audio/video streaming, mute/unmute toggles, in-meeting chat, emoji reactions, and host "Mute All" command.

---

## 📝 Evaluation Criteria Checklist

| Requirement | Status | Details |
| :--- | :--- | :--- |
| **Clean Zoom UI & UX** | ✅ Implemented | Pixel-perfect replica based on 21 real Zoom web screenshots in `screenshots/`. |
| **Core 1: Landing Dashboard** | ✅ Implemented | Navbar, Action Tiles (Schedule, Join, Host), Clock, Upcoming & Recent lists. |
| **Core 2: Instant Meeting** | ✅ Implemented | Unique 10-digit ID, DB persistence, instant room entry. |
| **Core 3: Join Meeting** | ✅ Implemented | Join by ID/URL, Green room lobby preview, display name, existence validation. |
| **Core 4: Schedule Meeting** | ✅ Implemented | Date/time pickers, duration, passcode, auto-link, upcoming list sync. |
| **Bonus: Responsive Design** | ✅ Implemented | Dynamic responsive grid adapting from 1 participant to multi-peer. |
| **Bonus: Host Controls** | ✅ Implemented | Host moderation shield (Mute All, Lock Meeting, Remove Participant). |
| **Bonus: Screen Sharing** | ✅ Implemented | Native WebRTC screen sharing with live track replacement. |
| **Database Design** | ✅ Implemented | Normalized SQLite schema in WAL mode with relationships and foreign keys. |
| **No Login Required** | ✅ Implemented | Default evaluator user pre-seeded on startup for zero-friction evaluation. |

---

## 🚀 Cloud Deployment Guide

The codebase is pre-configured with `render.yaml`, `backend/Procfile`, and `backend/Dockerfile` for instant cloud deployment:

### 1. Deploy Backend (Render.com / Railway)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service** -> Connect this GitHub repository: `sanchitjain1709-beep/zoomclone`.
3. Configure settings:
   * **Root Directory**: `backend`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `python run.py` (or leave default)
4. Click **Create Web Service**.
5. Note your deployed backend URL: `https://zoom-clone-backend-xxxx.onrender.com`.

### 2. Deploy Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com/new).
2. Import the repository: `sanchitjain1709-beep/zoomclone`.
3. Configure settings:
   * **Framework Preset**: Next.js
   * **Root Directory**: `frontend`
4. In **Environment Variables**, add:
   * `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
   * `NEXT_PUBLIC_WS_URL` = `wss://your-backend.onrender.com`
5. Click **Deploy**!
6. Your live deployed application link will be generated: `https://zoom-clone-xxxx.vercel.app`.

---

## 📦 Deliverables Summary for Submission
* **Public GitHub Repository**: [https://github.com/sanchitjain1709-beep/zoomclone](https://github.com/sanchitjain1709-beep/zoomclone)
* **Architecture & System Design**: [PRODUCT_ARCHITECTURE.md](file:///c:/Users/sanch/ZOOMclone/PRODUCT_ARCHITECTURE.md)
* **Local Evaluator Identity**: **Sanchit Jain** (Personal Meeting ID: `948 007 6202`)

