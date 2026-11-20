/** Turns a YouTube/Vimeo URL into a privacy-friendly embed URL (loaded only on click). */
export interface VideoEmbed {
  provider: 'YouTube' | 'Vimeo';
  embedUrl: string;
}

export function videoEmbed(url: string | null | undefined): VideoEmbed | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www|m)\./, '');

  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? parsed.pathname.slice(1)
        : (parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]);
    return id && /^[\w-]{6,}$/.test(id)
      ? { provider: 'YouTube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` }
      : null;
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.match(/(\d{6,})/)?.[1];
    return id ? { provider: 'Vimeo', embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` } : null;
  }
  return null;
}
