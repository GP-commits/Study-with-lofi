import { useEffect, useRef, useState } from 'react'

export function UsernameGate({
  onSetUsername,
}: {
  onSetUsername: (username: string) => void
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit() {
    const cleaned = draft.trim().replace(/\s+/g, ' ')
    if (!cleaned) return
    onSetUsername(cleaned.slice(0, 24))
  }

  return (
    <div className="gate">
      <div className="gateCard" role="dialog" aria-modal="true" aria-label="Enter username">
        <div className="gateTitle">Study with lo-fi</div>
        <div className="gateSubtitle">
          Pick a temporary username for this session. It’s kept only in memory (not stored
          permanently).
        </div>

        <form
          className="gateForm"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. alex"
            maxLength={24}
            autoComplete="off"
          />
          <button className="button" type="submit" disabled={!draft.trim()}>
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

