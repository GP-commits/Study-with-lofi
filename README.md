# Study with lo-fi
<img width="1905" height="974" alt="image" src="https://github.com/user-attachments/assets/37348c95-1d90-4083-be9b-aaeb7c335baf" />

Static web app (no custom backend server) that provides a shared “study with lo-fi” room:

- **Atmosphere**: full-screen looping GIF background (CSS)
- **Music**: embedded YouTube lo-fi stream
- **Realtime chat**: Firebase Realtime Database (Spark)
- **Synchronized Pomodoro**: shared `startTime` + `durationMs` in Firebase; each client counts down locally
- **Temporary username gate**: username is kept only in memory for the session (no localStorage)

## Setup

### 1) Add a background GIF

Place a GIF at `public/lofi-bg.gif` (the CSS references `/lofi-bg.gif`).

### 2) Create a Firebase project (Spark) + Realtime Database

- Create a Firebase project
- Create a Realtime Database (test mode is okay for quick start; see rules below)
- Copy your Web App config values into env vars

### 3) Configure env vars

Copy `.env.example` to `.env.local` and fill in:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Optional:

- `VITE_YOUTUBE_VIDEO_ID` (defaults to `jfKfPfyJRdk`)

### 4) Firebase Realtime Database rules

In Firebase Console → Realtime Database → Rules, paste `firebase-database.rules.json`.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

- Import this repo in Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Add the same environment variables from `.env.local` in Vercel Project Settings

## Data model (Realtime Database)

- `rooms/default/chat/{messageId}`:
  - `{ user: string, text: string, ts: number }`
- `rooms/default/pomodoro`:
  - `null` (idle) or `{ startTime: number, durationMs: number, label: string, startedBy: string }`
