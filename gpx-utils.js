const GPX_NAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.gpx$/i;

export function parseTrackFileName(fileName) {
  const match = fileName.match(GPX_NAME_PATTERN);

  if (!match) {
    return null;
  }

  return {
    date: match[1],
    name: match[2],
  };
}

export function toTitleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

export function filterTracksByName(tracks, query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return tracks;
  }

  return tracks.filter((track) => {
    const name = track.name?.toLowerCase() ?? "";
    const date = track.date?.toLowerCase() ?? "";
    return name.includes(normalized) || date.includes(normalized);
  });
}
