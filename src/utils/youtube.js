/**
 * Extracts the YouTube Video ID from standard or short YouTube URLs.
 * 
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID (direct string)
 * 
 * @param {string} url - YouTube URL or Video ID
 * @returns {string|null} - Video ID or null if invalid
 */
export function extractYoutubeId(url) {
  if (!url) return null;
  const trimmed = url.trim();
  
  // If it's already a simple alphanumeric ID (usually 11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex to extract from various formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  return null;
}

/**
 * Returns the standard YouTube thumbnail URL for a video ID or URL.
 * Falls back to null if no valid ID can be resolved.
 * 
 * @param {string} urlOrId - YouTube URL or Video ID
 * @returns {string|null}
 */
export function getYoutubeThumbnail(urlOrId) {
  const videoId = extractYoutubeId(urlOrId);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
