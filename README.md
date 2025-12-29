## private_chat – Self‑Destructing Real‑Time Chat Rooms

**private_chat** is a minimal, private chat app that lets you spin up temporary rooms that automatically self‑destruct. Messages are stored in Upstash Redis with a short TTL, and real‑time updates are delivered via Upstash Realtime.

### Features

- **Ephemeral rooms**: Rooms are created on demand and expire automatically after a short time.
- **Self‑destruct timer**: Each room shows a live countdown until messages are permanently deleted.
- **Manual destruction**: Any participant can trigger an immediate room destroy action.
- **Anonymous identities**: Users are given random, anonymous usernames stored only in localStorage.
- **Real‑time messaging**: Messages appear instantly using Upstash Realtime channels.

### Tech Stack

- **Frontend**: Next.js App Router, React, TypeScript, Tailwind CSS
- **State & data**: @tanstack/react-query
- **Backend**: Elysia (via `@elysiajs/eden`) running inside the Next.js route handler
- **Storage**: Upstash Redis (ephemeral room + message storage with TTL)
- **Realtime**: Upstash Realtime

---

## Getting Started (Local Development)

### 1. Install dependencies

In the project root:

```bash
# using npm
npm install

# or using bun
bun install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root with your Upstash credentials. The exact keys depend on your Upstash setup, but it will look roughly like:

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Upstash Realtime (if required by your Realtime project)
UPSTASH_REALTIME_URL=...
UPSTASH_REALTIME_TOKEN=...
```

Refer to the Upstash Redis and Upstash Realtime docs for the precise variable names and how to obtain them.

You can optionally override the API base URL used by the Elysia backend with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If this is not set, the client falls back to the current origin in the browser (or `http://localhost:3000` on the server).

### 3. Run the dev server

```bash
npm run dev
# or
bun dev
```

Then open `http://localhost:3000` in your browser.

---

## How It Works (High‑Level)

- **Lobby (`/`)**
  - Generates or reuses an anonymous username via `use-username`.
  - Calls the Elysia backend to **create a room**, then redirects to `/room/[roomId]`.
  - Handles error states like room not found, full, or destroyed.

- **Room (`/room/[roomId]`)**
  - Shows the **room id** with a copyable link.
  - Displays a **self‑destruct countdown** based on the Redis TTL for the room.
  - Streams **messages** using `react-query` and Upstash Realtime.
  - Supports **manual destruction**, which:
    - Emits a `chat.destroy` event over Realtime.
    - Deletes all room keys from Redis (`meta`, `messages`, etc.).
    - Redirects users back to the lobby with a “room destroyed” notice.

- **Backend (`src/app/api/[[...slugs]]/route.ts`)**
  - Elysia app mounted under `/api` with two main groups:
    - `room` routes: create room, get TTL, destroy room.
    - `messages` routes: post and read messages for a given room.
  - Uses Upstash Redis for:
    - room metadata (`meta:<roomId>`)
    - messages (`messages:<roomId>`)
    - enforcing TTL so rooms and messages automatically expire.
  - Uses an auth middleware to ensure only clients with a valid room token can read/write.

- **Realtime (`src/lib/realtime.ts`, `/app/api/realtime/route.ts`)**
  - Defines a schema with two event types:
    - `chat.message` – a new chat message.
    - `chat.destroy` – signals that a room has been destroyed.
  - Exposes a Realtime handler at `/api/realtime` consumed by the client via `useRealtime`.

---

## Scripts

- **`npm run dev`**: Start the Next.js dev server (and Elysia API) on `http://localhost:3000`.
- **`npm run build`**: Build the production bundle.
- **`npm run start`**: Start the production server (after `npm run build`).
- **`npm run lint`**: Run ESLint.

---

## Production Deployment

You can deploy this app to any platform that supports **Next.js with edge/Node runtimes** and environment variables (e.g. Vercel). Ensure:

- All required **Upstash Redis** and **Upstash Realtime** environment variables are configured in the hosting provider.
- `NEXT_PUBLIC_API_URL` is set to the deployed URL if needed (often not required when frontend and backend share the same origin).

Once deployed, rooms and messages will continue to be ephemeral based on the configured Redis TTL. 
