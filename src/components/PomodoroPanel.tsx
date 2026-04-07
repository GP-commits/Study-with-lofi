import { useEffect, useMemo, useRef, useState } from 'react'
import { onValue, ref, serverTimestamp, set } from 'firebase/database'
import { getFirebaseDatabase } from '../firebase'
import { roomPath } from '../lib/roomPaths'
import { formatClock } from '../lib/time'

type PomodoroState = {
  startTime: number
  durationMs: number
  label: string
  startedBy?: string
}

function normalizePomodoro(v: unknown): PomodoroState | null {
  if (!v || typeof v !== 'object') return null
  const obj = v as Record<string, unknown>
  const startTime = typeof obj.startTime === 'number' ? obj.startTime : null
  const durationMs = typeof obj.durationMs === 'number' ? obj.durationMs : null
  const label = typeof obj.label === 'string' ? obj.label : null
  const startedBy = typeof obj.startedBy === 'string' ? obj.startedBy : undefined
  if (startTime === null || durationMs === null || !label) return null
  return { startTime, durationMs, label, startedBy }
}

const LOOP: Array<{ label: string; minutes: number }> = [
  { label: 'Focus', minutes: 25 },
  { label: 'Break', minutes: 5 },
  { label: 'Focus', minutes: 25 },
  { label: 'Break', minutes: 10 },
]

export function PomodoroPanel({ username }: { username: string }) {
  const [remote, setRemote] = useState<PomodoroState | null>(null)
  const [serverOffsetMs, setServerOffsetMs] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)
  const didAutostartRef = useRef(false)

  const pomodoroRef = useMemo(() => {
    try {
      const db = getFirebaseDatabase()
      return ref(db, roomPath('pomodoro'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize Firebase.')
      return null
    }
  }, [])

  const offsetRef = useMemo(() => {
    try {
      const db = getFirebaseDatabase()
      return ref(db, '.info/serverTimeOffset')
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!offsetRef) return
    const off = onValue(offsetRef, (snap) => {
      const v = snap.val()
      setServerOffsetMs(typeof v === 'number' ? v : 0)
    })
    return () => off()
  }, [offsetRef])

  useEffect(() => {
    if (!pomodoroRef) return
    const off = onValue(pomodoroRef, (snap) => {
      setRemote(normalizePomodoro(snap.val()))
    })
    return () => off()
  }, [pomodoroRef])

  useEffect(() => {
    if (didAutostartRef.current) return
    if (!pomodoroRef) return
    if (error) return
    if (remote) return
    didAutostartRef.current = true
    void startLoop()
  }, [pomodoroRef, remote, error])

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now() + serverOffsetMs), 250)
    return () => window.clearInterval(t)
  }, [serverOffsetMs])

  // Auto-looping schedule:
  // We only store a single shared `startTime` (and a default `durationMs` for validation/backward-compat).
  // Each client computes the current phase locally by walking the loop durations.
  const loopMs = LOOP.reduce((sum, p) => sum + p.minutes * 60_000, 0)
  const loopStart = remote?.startTime ?? 0
  const elapsed = remote ? Math.max(0, now - loopStart) : 0
  const loopElapsed = remote ? elapsed % loopMs : 0

  let phase = LOOP[0]
  let phaseElapsed = 0
  if (remote) {
    let acc = 0
    for (const p of LOOP) {
      const d = p.minutes * 60_000
      if (loopElapsed < acc + d) {
        phase = p
        phaseElapsed = loopElapsed - acc
        break
      }
      acc += d
    }
  }

  const phaseRemainingMs = remote ? phase.minutes * 60_000 - phaseElapsed : 0
  const remainingSeconds = Math.ceil(Math.max(0, phaseRemainingMs) / 1000)

  async function startLoop() {
    if (!pomodoroRef) return
    try {
      await set(pomodoroRef, {
        startTime: serverTimestamp(),
        // durationMs/label are kept to match the originally described schema and rules,
        // but the UI derives phase from `startTime` + fixed loop pattern.
        durationMs: loopMs,
        label: 'Loop: 25/5/25/10',
        startedBy: username,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start timer.')
    }
  }

  async function reset() {
    // Clearing to null is the simplest “stop” for all clients.
    if (!pomodoroRef) return
    try {
      await set(pomodoroRef, null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset timer.')
    }
  }

  const subtitle =
    remote?.startedBy && remote.startedBy !== username
      ? `Started by ${remote.startedBy}`
      : remote?.startedBy
        ? 'Started by you'
        : 'Idle'

  return (
    <section className="panel timer" aria-label="Pomodoro timer">
      <header className="panelHeader">
        <div className="panelTitle">Pomodoro</div>
        <div className="panelMeta">{subtitle}</div>
      </header>

      <div className="timerBody">
        {error ? (
          <div className="timerHint">
            Timer unavailable: <code>{error}</code>
          </div>
        ) : null}

        <div className="timerLabel">
          {remote ? (
            <>
              {phase.label} • loop 25/5/25/10
            </>
          ) : (
            'No timer running'
          )}
        </div>
        <div className="timerClock" aria-live="polite">
          {remote ? formatClock(remainingSeconds) : '—'}
        </div>
        <div className="timerControls">
          <button
            className="button buttonSubtle"
            onClick={() => void startLoop()}
            type="button"
            disabled={!pomodoroRef || Boolean(remote)}
          >
            Start loop
          </button>
          <button className="button" onClick={() => void reset()} type="button">
            Reset
          </button>
        </div>
      </div>
    </section>
  )
}

