import { formatTimestamp } from '../lib/time'
import { usePresenceList } from '../lib/presence'

export function MembersPanel() {
  const { entries, error } = usePresenceList()

  return (
    <section className="panel members" aria-label="Members online">
      <header className="panelHeader">
        <div className="panelTitle">Members</div>
        <div className="panelMeta">{entries.length} online</div>
      </header>

      <div className="membersBody">
        {error ? (
          <div className="membersEmpty">
            Presence unavailable: <code>{error}</code>
          </div>
        ) : entries.length === 0 ? (
          <div className="membersEmpty">No one is online yet.</div>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="memberRow">
              <div className="memberName">{e.user}</div>
              <div className="memberSeen">{formatTimestamp(e.lastSeen)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

