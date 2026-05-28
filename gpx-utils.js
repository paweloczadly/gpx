const GPX_NAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.gpx$/i;
const ACTIVITY_TYPES = new Set([
  "bike",
  "rower",
  "run",
  "running",
  "bieganie",
  "trekking",
  "hike",
  "hiking",
]);

export function parseTrackFileName(fileName) {
  const match = fileName.match(GPX_NAME_PATTERN);

  if (!match) {
    return null;
  }

  const date = match[1];
  const rest = match[2];
  const firstHyphenIndex = rest.indexOf("-");

  if (firstHyphenIndex > 0) {
    const candidateType = rest.slice(0, firstHyphenIndex).toLowerCase();
    const candidateName = rest.slice(firstHyphenIndex + 1);

    if (ACTIVITY_TYPES.has(candidateType) && candidateName.length > 0) {
      return {
        date,
        activityType: candidateType,
        name: candidateName,
      };
    }
  }

  return {
    date,
    activityType: null,
    name: rest,
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
    const activityType = track.activityType?.toLowerCase() ?? "";
    const activitySearch = track.activitySearch?.toLowerCase() ?? "";
    return name.includes(normalized) || date.includes(normalized) || activityType.includes(normalized) || activitySearch.includes(normalized);
  });
}
