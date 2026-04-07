import { useEffect, useMemo, useState } from 'react'
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
  update,
} from 'firebase/database'
import { getFirebaseDatabase } from '../firebase'
import { roomPath } from './roomPaths'

export type PresenceEntry = {
  id: string
  user: string
  lastSeen: number
}

function normalizePresenceEntry(id: string, v: unknown): PresenceEntry | null {
  if (!v || typeof v !== 'object') return null
  const obj = v as Record<string, unknown>
  const user = typeof obj.user === 'string' ? obj.user : null
  const lastSeen = typeof obj.lastSeen === 'number' ? obj.lastSeen : null
  if (!user || lastSeen === null) return null
  return { id, user, lastSeen }
}

let sessionClientId: string | null = null
function getSessionClientId(): string {
  if (sessionClientId) return sessionClientId
  try {
    sessionClientId =
      globalThis.crypto?.randomUUID?.() ?? `c_${Math.random().toString(16).slice(2)}`
  } catch {
    sessionClientId = `c_${Math.random().toString(16).slice(2)}`
  }
  return sessionClientId
}

export function usePresenceSelf(username: string) {
  const [error, setError] = useState<string | null>(null)

  const clientId = useMemo(() => getSessionClientId(), [])

  const connectedRef = useMemo(() => {
    try {
      const db = getFirebaseDatabase()
      return ref(db, '.info/connected')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize Firebase.')
      return null
    }
  }, [])

  const presenceSelfRef = useMemo(() => {
    try {
      const db = getFirebaseDatabase()
      return ref(db, roomPath('presence', clientId))
    } catch {
      return null
    }
  }, [clientId])

  useEffect(() => {
    if (!connectedRef || !presenceSelfRef) return

    const off = onValue(connectedRef, (snap) => {
      const connected = Boolean(snap.val())
      if (!connected) return

      void onDisconnect(presenceSelfRef).set(null)
      void set(presenceSelfRef, { user: username, lastSeen: serverTimestamp() })
    })

    return () => {
      off()
      // If the user navigates away/unmounts, proactively clear presence.
      void set(presenceSelfRef, null)
    }
  }, [connectedRef, presenceSelfRef, username])

  useEffect(() => {
    if (!presenceSelfRef) return
    const t = window.setInterval(() => {
      void update(presenceSelfRef, { lastSeen: serverTimestamp() })
    }, 30_000)
    return () => window.clearInterval(t)
  }, [presenceSelfRef])

  return { error }
}

export function usePresenceList() {
  const [entries, setEntries] = useState<PresenceEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const presenceAllRef = useMemo(() => {
    try {
      const db = getFirebaseDatabase()
      return ref(db, roomPath('presence'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize Firebase.')
      return null
    }
  }, [])

  useEffect(() => {
    if (!presenceAllRef) return
    const off = onValue(presenceAllRef, (snap) => {
      const v = snap.val()
      if (!v || typeof v !== 'object') {
        setEntries([])
        return
      }
      const obj = v as Record<string, unknown>
      const list = Object.entries(obj)
        .map(([id, val]) => normalizePresenceEntry(id, val))
        .filter((x): x is PresenceEntry => Boolean(x))
        .sort((a, b) => b.lastSeen - a.lastSeen)
      setEntries(list)
    })
    return () => off()
  }, [presenceAllRef])

  return { entries, error }
}

