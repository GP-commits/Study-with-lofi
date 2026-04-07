import { YouTubePlayer } from './YouTubePlayer'

export function MusicToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="music">
      <YouTubePlayer hidden muted={!enabled} />
      <button className="button buttonSubtle" type="button" onClick={onToggle}>
        {enabled ? 'Mute music' : 'Enable music'}
      </button>
    </div>
  )
}

