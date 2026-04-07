import './App.css'
import { useState } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { FirebaseNotice } from './components/FirebaseNotice'
import { MembersPanel } from './components/MembersPanel'
import { MusicToggle } from './components/MusicToggle'
import { PomodoroPanel } from './components/PomodoroPanel'
import { UsernameGate } from './components/UsernameGate'
import { usePresenceSelf } from './lib/presence'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)

  const bgUrl = (import.meta.env.VITE_BG_URL as string | undefined) ?? '/lofi-bg.gif'

  return (
    <div className="app" style={{ ['--bg-url' as never]: `url("${bgUrl}")` }}>
      <div className="bg" aria-hidden="true" />
      <div className="bgOverlay" aria-hidden="true" />

      {!username ? (
        <UsernameGate onSetUsername={setUsername} />
      ) : (
        <div className="shell">
          <PresenceSelf username={username} />
          <header className="topbar">
            <div className="brand">Study with lo-fi</div>
            <div className="topbarRight">
              <MusicToggle
                enabled={isMusicEnabled}
                onToggle={() => setIsMusicEnabled((v) => !v)}
              />
              <div className="topbarUser">You’re “{username}”</div>
              <button
                className="button buttonSubtle"
                type="button"
                onClick={() => setUsername(null)}
              >
                Change name
              </button>
            </div>
          </header>

          <main className="stage">
            <FirebaseNotice />

            <div className="float floatPomodoro">
              <PomodoroPanel username={username} />
            </div>

            <div className="float floatChatButton">
              <div className="floatRow">
                <button
                  className="button buttonSubtle"
                  type="button"
                  onClick={() => setIsMembersOpen((v) => !v)}
                >
                  {isMembersOpen ? 'Close members' : 'Members'}
                </button>
                <button
                  className="button buttonSubtle"
                  type="button"
                  onClick={() => setIsChatOpen((v) => !v)}
                >
                  {isChatOpen ? 'Close chat' : 'Open chat'}
                </button>
              </div>
            </div>

            {isChatOpen ? (
              <div className="float floatChatPanel">
                <ChatPanel username={username} />
              </div>
            ) : null}

            {isMembersOpen ? (
              <div className="float floatMembersPanel">
                <MembersPanel />
              </div>
            ) : null}
          </main>

          <footer className="footer" />
        </div>
      )}
    </div>
  )
}

export default App

function PresenceSelf({ username }: { username: string }) {
  usePresenceSelf(username)
  return null
}
