# WhatsApp Clone

A real-time chat app in the style of WhatsApp: one-to-one chats, group chats, live message delivery, online status and typing indicators.

**Backend:** Spring Boot 4 · Spring Security (JWT) · STOMP over WebSocket · Spring Data JPA · PostgreSQL
**Frontend:** React 19 · Vite · Zustand · Axios · @stomp/stompjs

## Features

- Register and log in (BCrypt-hashed passwords, JWT bearer tokens)
- One-to-one chats and group chats
- Messages delivered instantly over WebSocket and saved in PostgreSQL
- Chat list sorted by latest activity, with last-message preview and unread counts
- Online indicator and "typing…" status
- Date separators, message bubbles and timestamps
- Emoji picker and chat search
- Light and dark mode (follows the system), mobile-friendly layout

## How it works

```
React app ──HTTP + JWT──▶ /api/**          REST: login, users, rooms, message history
          ◀─WebSocket──▶  /ws (STOMP)      live messages, typing, presence
                              │
                              ▼
                         Spring Boot ──▶ PostgreSQL
```

- **Auth:** login and register return a signed JWT. The app sends it as `Authorization: Bearer <token>` on every REST call and in the STOMP `CONNECT` frame.
- **Sending:** the client publishes to `/app/chat/{roomId}`. The server takes the sender from the authenticated session, saves the message, and broadcasts it to `/topic/room/{roomId}`.
- **Access control:** users can only read, send to, or subscribe to rooms they are members of. This is checked on REST calls and on every WebSocket `SUBSCRIBE`.
- **Live updates:** `/topic/typing/{roomId}` carries typing events, `/topic/presence` the set of online user ids, and `/topic/user/{id}/rooms` tells a user about chats they were just added to.

## Running locally

### Prerequisites

- Java 21
- Node.js 20+
- PostgreSQL with a database named `chat_db`:
  ```sql
  CREATE DATABASE chat_db;
  ```

### 1. Backend

```bash
cd backend
cp local.properties.example local.properties   # then edit it
./mvnw spring-boot:run                          # Windows: .\mvnw.cmd spring-boot:run
```

`local.properties` holds your secrets and is git-ignored:

| Key | Description |
| --- | --- |
| `DB_PASSWORD` | Your PostgreSQL password |
| `JWT_SECRET` | Random string of 32+ characters, e.g. `openssl rand -base64 48` |

Optional overrides (as environment variables or in `local.properties`): `DB_URL` (default `jdbc:postgresql://localhost:5432/chat_db`), `DB_USERNAME` (default `postgres`), `JWT_EXPIRATION_HOURS` (default `24`), `PORT` (default `8080`).

Tables are created automatically on first start.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, register two accounts (for example in a normal and a private window), and start chatting.

To point the app at a different backend, copy `frontend/.env.example` to `frontend/.env` and change the URLs.

## Deploying for free

| Part | Host | Free-plan note |
| --- | --- | --- |
| Database | [Neon](https://neon.com) | 0.5 GB storage |
| Backend | [Render](https://render.com) (Docker) | Sleeps after 15 min idle; the first request then takes up to ~1 min |
| Frontend | [Vercel](https://vercel.com) | Static site |

**1. Database (Neon).** Create a project and copy its connection details. The JDBC URL looks like
`jdbc:postgresql://<host>/<database>?sslmode=require`. The username and password are shown separately.

**2. Backend (Render).** New → Blueprint → pick this repo. Render reads [`render.yaml`](render.yaml) and asks for:

| Variable | Value |
| --- | --- |
| `DB_URL` | The Neon JDBC URL from step 1 |
| `DB_USERNAME` / `DB_PASSWORD` | From Neon |
| `CORS_ORIGINS` | Your Vercel URL from step 3, e.g. `https://whatsapp-clone.vercel.app` (enter a placeholder first and update it after step 3) |

`JWT_SECRET` is generated automatically. When it's deployed, `https://<your-service>.onrender.com/api/health` returns `{"status":"UP"}`.

**3. Frontend (Vercel).** Import this repo, set **Root Directory** to `frontend`, and add:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-service>.onrender.com/api` |
| `VITE_WS_URL` | `wss://<your-service>.onrender.com/ws` |

Then put the Vercel URL into `CORS_ORIGINS` on Render. Render redeploys by itself when an environment variable changes.

The login page pings `/api/health` as soon as it opens, so a sleeping backend starts waking up while you type.

## API overview

All endpoints except login and register need `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/users/register` | Create an account → `{ token, user }` |
| POST | `/api/users/login` | Log in with username or email → `{ token, user }` |
| GET | `/api/users/me` | The signed-in user |
| GET | `/api/users` | All users (to start a chat) |
| GET | `/api/users/online` | Ids of users online now |
| GET | `/api/rooms` | My chats, each with its last message |
| POST | `/api/rooms/direct/{userId}` | Open or create my one-to-one chat with a user |
| POST | `/api/rooms/group` | Create a group `{ name, description, memberIds }` |
| POST | `/api/rooms/{roomId}/add-user/{userId}` | Add someone to a group I'm in |
| GET | `/api/messages/room/{roomId}` | Message history, oldest first |
| POST | `/api/messages` | Send a message over HTTP `{ roomId, content }` |

| STOMP destination | Direction | Purpose |
| --- | --- | --- |
| `/app/chat/{roomId}` | client → server | Send a message `{ content }` |
| `/app/typing/{roomId}` | client → server | Typing on/off `{ typing }` |
| `/topic/room/{roomId}` | server → client | New messages |
| `/topic/typing/{roomId}` | server → client | Typing events |
| `/topic/presence` | server → client | Online user ids |
| `/topic/user/{userId}/rooms` | server → client | Chats I was added to |

## Project structure

```
backend/
  src/main/java/realTime/Chat/
    config/       SecurityConfig (JWT, CORS), WebSocketConfig (STOMP)
    security/     JwtService, StompAuthInterceptor, CurrentUser
    controller/   REST controllers + ChatController (STOMP)
    service/      User, Room, Message and Presence services
    entity/       JPA entities
    repository/   Spring Data repositories
    dto/          Request/response records
    exception/    Error → HTTP status mapping
frontend/
  src/
    components/   Login, Chat, Sidebar, ChatWindow, NewChatModal, Avatar
    services/     api.js (Axios), websocket.js (STOMP client)
    store/        Zustand stores for auth and chat state
    utils/        Date and naming helpers
```

## Roadmap

- Read receipts (blue ticks)
- "Last seen" for offline users
- Image and file sharing
- Unread counts that persist across devices
- Edit and delete messages
- Browser notifications
