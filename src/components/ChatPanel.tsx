import { useEffect, useMemo, useRef, useState } from 'react'
import {
  limitToLast,
  onChildAdded,
  push,
  query,
  ref,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/database'
import { getFirebaseDatabase } from '../firebase'
import { roomPath } from '../lib/roomPaths'
import { formatTimestamp } from '../lib/time'

type ChatMessage = {
  id: string
  user: string
  text: string
  ts: number
}

function normalizeMessage(id: string, v: unknown): ChatMessage | null {
  if (!v || typeof v !== 'object') return null
  const obj = v as Record<string, unknown>
  const user = typeof obj.user === 'string' ? obj.user : null
  const text = typeof obj.text === 'string' ? obj.text : null
  const ts = typeof obj.ts === 'number' ? obj.ts : null
  if (!user || !text || ts === null) return null
  return { id, user, text, ts }
}

export function ChatPanel({ username }: { username: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  const chatRef = useMemo(() => {
    try {
      const db = getFirebaseDatabase()
      return ref(db, roomPath('chat'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize Firebase.')
      return null
    }
  }, [])

  useEffect(() => {
    if (!chatRef) return
    const q = query(chatRef, limitToLast(200))
    const unsubscribers: Unsubscribe[] = []

    const off = onChildAdded(q, (snap) => {
      const msg = normalizeMessage(snap.key ?? '', snap.val())
      if (!msg) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg].sort((a, b) => a.ts - b.ts)
      })
    })
    unsubscribers.push(off)

    return () => {
      for (const u of unsubscribers) u()
    }
  }, [chatRef])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  async function send() {
    const text = draft.trim()
    if (!text) return
    setDraft('')

    if (!chatRef) return
    try {
      await push(chatRef, {
        user: username,
        text,
        ts: serverTimestamp(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message.')
    }
  }

  return (
    <section className="panel chat" aria-label="Chat">
      <header className="panelHeader">
        <div className="panelTitle">Chat</div>
        <div className="panelMeta">Signed in as “{username}”</div>
      </header>

      <div className="chatBody" role="log" aria-live="polite">
        {error ? (
          <div className="chatEmpty">
            Chat unavailable: <code>{error}</code>
          </div>
        ) : messages.length === 0 ? (
          <div className="chatEmpty">No messages yet. Say hi.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="chatMsg">
              <div className="chatMsgMeta">
                <span className="chatTs">{formatTimestamp(m.ts)}</span>
              </div>
              <div className="chatLine">
                <span className="chatUser">{m.user}</span>
                <span className="chatColon">: </span>
                <span className="chatTextInline">{m.text}</span>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        className="chatComposer"
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          maxLength={240}
          disabled={!chatRef}
        />
        <button className="button" type="submit" disabled={!draft.trim() || !chatRef}>
          Send
        </button>
      </form>
    </section>
  )
}

