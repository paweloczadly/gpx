import { toTitleCase } from "./gpx-utils.js";

export function createShareData(track) {
  return {
    title: `GPX: ${toTitleCase(track.name)}`,
    text: `${track.date} • ${toTitleCase(track.name)}`,
    url: track.publicDownloadUrl,
  };
}

export function shouldUseNativeShare(navigatorLike = globalThis.navigator) {
  return typeof navigatorLike?.share === "function";
}

export function buildShareTargets(track) {
  const shareData = createShareData(track);
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedText = encodeURIComponent(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
  const encodedShareText = encodeURIComponent(shareData.text);

  return [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedText}` },
    { label: "Messenger", href: `fb-messenger://share/?link=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}` },
    { label: "Kopiuj link", action: "copy" },
  ];
}
