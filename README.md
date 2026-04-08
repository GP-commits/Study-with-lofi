# Study with Lo-Fi
<img width="1905" height="974" alt="image" src="https://github.com/user-attachments/assets/37348c95-1d90-4083-be9b-aaeb7c335baf" />

Static web app (no custom backend server) that provides a shared “study with lo-fi” room:

- **Atmosphere**: full-screen looping GIF background (CSS)
- **Music**: embedded YouTube lo-fi stream
- **Realtime chat**: Firebase Realtime Database (Spark)
- **Synchronized Pomodoro**: shared `startTime` + `durationMs` in Firebase; each client counts down locally
- **Temporary username gate**: username is kept only in memory for the session (no localStorage)
