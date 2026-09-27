export interface ParsedAudioTrack {
  platform: 'youtube' | 'spotify' | 'direct' | 'other';
  id?: string;
  type?: 'track' | 'album' | 'playlist' | 'episode';
  embedUrl?: string;
  originalUrl: string;
}

/**
 * Verilen müzik bağlantısını (YouTube, YouTube Music, Spotify, doğrudan MP3) ayrıştırır.
 */
export function parseAudioTrack(url: string): ParsedAudioTrack {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { platform: 'other', originalUrl: '' };
  }

  // 1. URL Nesnesi ile Güvenli Çözümleme
  try {
    const parsedUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = parsedUrl.hostname.toLowerCase();

    // YouTube & YouTube Music
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId: string | null = null;
      if (host.includes('youtu.be')) {
        videoId = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0]?.split('?')[0] || null;
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0] || null;
      } else if (parsedUrl.pathname.includes('/embed/')) {
        videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0] || null;
      } else {
        videoId = parsedUrl.searchParams.get('v');
      }

      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          platform: 'youtube',
          id: videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}&playsinline=1`,
          originalUrl: trimmed
        };
      }
    }

    // Spotify
    if (host.includes('spotify.com')) {
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      const typeIndex = parts.findIndex(p => ['track', 'album', 'playlist', 'episode'].includes(p.toLowerCase()));
      if (typeIndex !== -1 && parts[typeIndex + 1]) {
        const type = parts[typeIndex].toLowerCase() as 'track' | 'album' | 'playlist' | 'episode';
        const id = parts[typeIndex + 1].split('?')[0];
        return {
          platform: 'spotify',
          type,
          id,
          embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
          originalUrl: trimmed
        };
      }
    }
  } catch {
    // URL parse hatası durumunda regex kontrollerine geç
  }

  // Regex Fallback - YouTube
  const ytRegex = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      id: videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}&playsinline=1`,
      originalUrl: trimmed
    };
  }

  // Regex Fallback - Spotify
  const spotifyRegex = /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i;
  const spotifyMatch = trimmed.match(spotifyRegex);
  if (spotifyMatch && spotifyMatch[1] && spotifyMatch[2]) {
    const type = spotifyMatch[1].toLowerCase() as 'track' | 'album' | 'playlist' | 'episode';
    const id = spotifyMatch[2];
    return {
      platform: 'spotify',
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      originalUrl: trimmed
    };
  }

  // 3. Doğrudan Ses Dosyası (MP3, WAV, OGG, M4A, AAC)
  if (trimmed.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i)) {
    return {
      platform: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed
    };
  }

  return {
    platform: 'other',
    embedUrl: trimmed,
    originalUrl: trimmed
  };
}

/**
 * Platform adına göre kullanıcı dostu etiket döner.
 */
export function getAudioPlatformLabel(platform: 'youtube' | 'spotify' | 'direct' | 'other'): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube / YouTube Music';
    case 'spotify':
      return 'Spotify';
    case 'direct':
      return 'Ses Dosyası (.mp3)';
    default:
      return 'Müzik Bağlantısı';
  }
}
