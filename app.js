import { filterTracksByName, parseTrackFileName, toTitleCase } from "./gpx-utils.js";
import { buildShareTargets, createShareData, shouldUseNativeShare } from "./share-utils.js";

const fileListElement = document.getElementById("fileList");
const searchInputElement = document.getElementById("searchInput");
const statusElement = document.getElementById("status");
const currentYearElement = document.getElementById("currentYear");
const appVersionContainerElement = document.getElementById("appVersionContainer");
const appVersionLinkElement = document.getElementById("appVersionLink");

const REPO_FALLBACK_OWNER = "paweloczadly";
const REPO_FALLBACK_NAME = "gpx";
const GPX_PATH = "gpx";
const DOWNLOAD_ICON_SVG = "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z' fill='currentColor'/></svg>";
const SHARE_ICON_SVG = "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M18 16a3 3 0 0 0-2.37 1.16L9.91 13.8a3.2 3.2 0 0 0 0-3.6l5.72-3.36A3 3 0 1 0 15 5a3 3 0 0 0 .07.64L9.36 9a3 3 0 1 0 0 6l5.71 3.36A3 3 0 1 0 18 16Z' fill='currentColor'/></svg>";

const ACTIVITY_META = {
  bike: { emoji: "🚵", label: "Rower" },
  rower: { emoji: "🚵", label: "Rower" },
  run: { emoji: "🏃", label: "Bieganie" },
  running: { emoji: "🏃", label: "Bieganie" },
  bieganie: { emoji: "🏃", label: "Bieganie" },
  trekking: { emoji: "🥾", label: "Trekking" },
  hike: { emoji: "🥾", label: "Trekking" },
  hiking: { emoji: "🥾", label: "Trekking" },
};

function getActivityMeta(activityType) {
  if (!activityType) {
    return null;
  }

  return ACTIVITY_META[activityType.toLowerCase()] ?? null;
}

let allTracks = [];
let activeShareMenu = null;
let activeShareOwner = null;

function buildPublicDownloadUrl(fileName) {
  const encodedFileName = encodeURIComponent(fileName);
  const relativePath = `${GPX_PATH}/${encodedFileName}`;
  return new URL(relativePath, window.location.href).toString();
}

async function downloadFile(downloadUrl, fileName) {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać pliku (${response.status}).`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

async function shareTrack(track) {
  const shareData = createShareData(track);

  if (shouldUseNativeShare(navigator)) {
    await navigator.share(shareData);
    return "Udostępniono link.";
  }

  return null;
}

function closeShareMenu() {
  if (activeShareMenu) {
    activeShareMenu.remove();
    activeShareMenu = null;
  }

  if (activeShareOwner) {
    activeShareOwner.classList.remove("fileItemShareOpen");
    activeShareOwner = null;
  }
}

function openShareMenu(track, anchorButton) {
  closeShareMenu();

  const menu = document.createElement("div");
  menu.className = "shareMenu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-label", `Udostępnij plik ${track.fileName}`);

  for (const target of buildShareTargets(track)) {
    if (target.action === "copy") {
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "shareMenuItem";
      copyButton.textContent = target.label;
      copyButton.addEventListener("click", async () => {
        try {
          await copyTextToClipboard(track.publicDownloadUrl);
          statusElement.textContent = "Skopiowano link do schowka.";
        } catch (error) {
          statusElement.textContent = `Nie udało się skopiować linku: ${error.message}`;
        }
        closeShareMenu();
      });
      menu.append(copyButton);
      continue;
    }

    const link = document.createElement("a");
    link.className = "shareMenuItem";
    link.href = target.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = target.label;
    menu.append(link);
  }

  const li = anchorButton.closest("li");
  if (li) {
    li.classList.add("fileItemShareOpen");
    li.append(menu);
    activeShareMenu = menu;
    activeShareOwner = li;

    const closeOnOutsideClick = (event) => {
      if (!menu.contains(event.target) && event.target !== anchorButton) {
        closeShareMenu();
        document.removeEventListener("click", closeOnOutsideClick, true);
      }
    };

    window.setTimeout(() => {
      document.addEventListener("click", closeOnOutsideClick, true);
    }, 0);
  }
}

function inferRepoFromGitHubPages() {
  const host = window.location.hostname;
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (!host.endsWith(".github.io")) {
    return {
      owner: REPO_FALLBACK_OWNER,
      repo: REPO_FALLBACK_NAME,
    };
  }

  const owner = host.replace(/\.github\.io$/, "");
  const repo = pathParts[0] || `${owner}.github.io`;

  return { owner, repo };
}

function getActivityDisplay(activityType) {
  const meta = getActivityMeta(activityType);

  if (meta) {
    return `${meta.emoji} ${meta.label}`;
  }

  if (!activityType) {
    return null;
  }

  return `🏷️ ${toTitleCase(activityType)}`;
}

function getActivitySearchTerms(activityType) {
  if (!activityType) {
    return "";
  }

  const key = activityType.toLowerCase();
  const meta = getActivityMeta(activityType);

  if (!meta) {
    return key;
  }

  return `${key} ${meta.label.toLowerCase()}`;
}

function renderList(items) {
  fileListElement.innerHTML = "";

  if (items.length === 0) {
    statusElement.textContent = "Brak plików pasujących do wyszukiwania.";
    return;
  }

  statusElement.textContent = `Liczba plików: ${items.length}`;

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "fileItem";

    const meta = document.createElement("div");
    meta.className = "fileMeta";

    const dateTag = document.createElement("span");
    dateTag.className = "fileDate";
    dateTag.textContent = item.date;

    const tags = document.createElement("div");
    tags.className = "fileTags";
    tags.append(dateTag);

    const activityDisplay = getActivityDisplay(item.activityType);
    if (activityDisplay) {
      const activityTag = document.createElement("span");
      activityTag.className = "fileDate";
      activityTag.textContent = activityDisplay;
      activityTag.classList.add("fileTagClickable");
      activityTag.setAttribute("role", "button");
      activityTag.setAttribute("tabindex", "0");
      activityTag.setAttribute("aria-label", `Filtruj po aktywności ${activityDisplay}`);
      const activityMeta = getActivityMeta(item.activityType);
      const activityFilterValue = activityMeta?.label ?? toTitleCase(item.activityType);
      const applyActivityFilter = () => {
        searchInputElement.value = activityFilterValue;
        onSearchInput();
      };
      activityTag.addEventListener("click", applyActivityFilter);
      activityTag.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          applyActivityFilter();
        }
      });
      tags.append(activityTag);
    }

    const name = document.createElement("p");
    name.className = "fileName";
    name.textContent = toTitleCase(item.name);

    const actions = document.createElement("div");
    actions.className = "fileActions";

    const downloadButton = document.createElement("button");
    downloadButton.type = "button";
    downloadButton.className = "actionBtn actionBtnPrimary";
    downloadButton.innerHTML = DOWNLOAD_ICON_SVG;
    downloadButton.title = "Pobierz";
    downloadButton.setAttribute("aria-label", `Pobierz plik ${item.fileName}`);
    downloadButton.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        await downloadFile(item.publicDownloadUrl, item.fileName);
      } catch (primaryError) {
        if (item.downloadUrl !== item.publicDownloadUrl) {
          try {
            await downloadFile(item.downloadUrl, item.fileName);
            return;
          } catch (fallbackError) {
            statusElement.textContent = `Nie udało się pobrać pliku ${item.fileName}: ${fallbackError.message}`;
            return;
          }
        }

        statusElement.textContent = `Nie udało się pobrać pliku ${item.fileName}: ${primaryError.message}`;
      }
    });

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.className = "actionBtn actionBtnSecondary";
    shareButton.innerHTML = SHARE_ICON_SVG;
    shareButton.title = "Udostępnij";
    shareButton.setAttribute("aria-label", `Udostępnij plik ${item.fileName}`);
    shareButton.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        const message = await shareTrack(item);
        if (message) {
          statusElement.textContent = message;
          closeShareMenu();
          return;
        }

        openShareMenu(item, shareButton);
      } catch (error) {
        statusElement.textContent = `Nie udało się udostępnić pliku ${item.fileName}: ${error.message}`;
      }
    });

    actions.append(downloadButton, shareButton);

    meta.append(tags, name);
    li.append(meta, actions);
    fragment.append(li);
  });

  fileListElement.append(fragment);
}

function onSearchInput() {
  const filtered = filterTracksByName(allTracks, searchInputElement.value);
  renderList(filtered);
}

async function loadTracksFromManifest() {
  const response = await fetch("./tracks.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Nie udało się wczytać manifestu tracks.json (${response.status}).`);
  }

  const manifest = await response.json();
  const files = Array.isArray(manifest?.files) ? manifest.files : [];

  return files
    .filter((fileName) => typeof fileName === "string" && fileName.toLowerCase().endsWith(".gpx"))
    .map((fileName) => {
      const parsed = parseTrackFileName(fileName);

      if (!parsed) {
        return null;
      }

      return {
        fileName,
        date: parsed.date,
        activityType: parsed.activityType,
        activitySearch: getActivitySearchTerms(parsed.activityType),
        name: parsed.name,
        downloadUrl: buildPublicDownloadUrl(fileName),
        publicDownloadUrl: buildPublicDownloadUrl(fileName),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.fileName.localeCompare(a.fileName));
}

async function loadAndRenderAppVersion() {
  if (!appVersionContainerElement || !appVersionLinkElement) {
    return;
  }

  try {
    const response = await fetch("./version.json", { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const tag = typeof data?.tag === "string" ? data.tag.trim() : "";

    if (!tag) {
      return;
    }

    appVersionLinkElement.textContent = tag;
    const repoInfo = inferRepoFromGitHubPages();
    appVersionLinkElement.href = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/releases/tag/${encodeURIComponent(tag)}`;
    appVersionContainerElement.hidden = false;
  } catch {
    // Ignore missing or malformed version metadata in local/dev contexts.
  }
}

async function init() {
  if (currentYearElement) {
    currentYearElement.textContent = String(new Date().getFullYear());
  }

  loadAndRenderAppVersion();

  searchInputElement.addEventListener("input", onSearchInput);

  try {
    allTracks = await loadTracksFromManifest();

    if (allTracks.length === 0) {
      statusElement.textContent =
        "Nie znaleziono żadnych plików GPX zgodnych z konwencją YYYY-MM-DD-nazwa.gpx w folderze /gpx.";
      return;
    }

    renderList(allTracks);
  } catch (error) {
    statusElement.textContent = `Nie udało się wczytać plików: ${error.message}`;
  }
}

init();
