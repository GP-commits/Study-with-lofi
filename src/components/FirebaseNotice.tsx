import { getFirebaseEnvStatus } from '../firebase'

export function FirebaseNotice() {
  const status = getFirebaseEnvStatus()
  if (status.ok) return null

  return (
    <div className="notice">
      <div className="noticeTitle">Firebase isn’t configured yet</div>
      <div className="noticeBody">
        Missing env vars: <code>{status.missing.join(', ')}</code>. Create a
        <code> .env.local</code> from <code>.env.example</code> and restart dev server.
      </div>
    </div>
  )
}

