export function YouTubePlayer({
  hidden = false,
  muted = true,
}: {
  hidden?: boolean
  muted?: boolean
}) {
  const videoId =
    (import.meta.env.VITE_YOUTUBE_VIDEO_ID as string | undefined) ?? 'jfKfPfyJRdk'

  // Autoplay audio is blocked without user interaction on most browsers.
  const src = `https://www.youtube.com/embed/${encodeURIComponent(
    videoId,
  )}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&rel=0&modestbranding=1&playsinline=1`

  if (hidden) {
    return (
      <div className="ytHidden" aria-hidden="true">
        <iframe
          className="ytHiddenFrame"
          src={src}
          title="Lo-fi stream (hidden)"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
    )
  }

  return (
    <section className="panel player" aria-label="Lo-fi stream">
      <header className="panelHeader">
        <div className="panelTitle">Lo-fi stream</div>
        <div className="panelMeta">YouTube</div>
      </header>
      <div className="playerFrameWrap">
        <iframe
          className="playerFrame"
          src={src}
          title="Lo-fi stream"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  )
}

