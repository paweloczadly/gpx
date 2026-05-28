import { filterTracksByName, parseTrackFileName, toTitleCase } from "./gpx-utils.js";

const fileListElement = document.getElementById("fileList");
const searchInputElement = document.getElementById("searchInput");
const statusElement = document.getElementById("status");
const currentYearElement = document.getElementById("currentYear");

const DEFAULT_GITHUB_OWNER = "paweloczadly";
const DEFAULT_GITHUB_REPO = "gpx";
const DEFAULT_GPX_PATH = "gpx";
const DEFAULT_BRANCH = "main";

function getEnvValue(name) {
  const processEnv = globalThis.process?.env;
  const importMetaEnv = import.meta?.env;
  const windowEnv = typeof window !== "undefined" ? window : undefined;

  const value =
    processEnv?.[name] ??
    importMetaEnv?.[name] ??
    windowEnv?.[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

const GITHUB_OWNER = getEnvValue("GPX_GITHUB_OWNER") ?? DEFAULT_GITHUB_OWNER;
const GITHUB_REPO = getEnvValue("GPX_GITHUB_REPO") ?? DEFAULT_GITHUB_REPO;
const GPX_PATH = getEnvValue("GPX_GPX_PATH") ?? DEFAULT_GPX_PATH;
const BRANCH = getEnvValue("GPX_BRANCH") ?? DEFAULT_BRANCH;

let allTracks = [];

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function buildPublicDownloadUrl(fileName) {
  const encodedFileName = encodeURIComponent(fileName);
  const { origin, hostname, pathname } = window.location;

  if (isLocalHost(hostname)) {
    return `${origin}/${GPX_PATH}/${encodedFileName}`;
  }

  if (!hostname.endsWith(".github.io")) {
    return `${origin}/${encodedFileName}`;
  }

  const pathParts = pathname.split("/").filter(Boolean);
  const owner = hostname.replace(/\.github\.io$/, "");
  const isUserSite = pathParts[0] === `${owner}.github.io`;
  const repoPathPrefix = pathParts.length > 0 && !isUserSite
    ? `/${pathParts[0]}`
    : "";

  return `${origin}${repoPathPrefix}/${encodedFileName}`;
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

function inferRepoFromGitHubPages() {
  const host = window.location.hostname;
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (!host.endsWith(".github.io")) {
    return {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    };
  }

  const owner = host.replace(/\.github\.io$/, "");
  const repo = pathParts[0] || `${owner}.github.io`;

  return { owner, repo };
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

    const name = document.createElement("p");
    name.className = "fileName";
    name.textContent = toTitleCase(item.name);

    const button = document.createElement("a");
    button.className = "downloadBtn";
    button.href = item.publicDownloadUrl;
    button.download = item.fileName;
    button.textContent = "Pobierz";
    button.setAttribute("aria-label", `Pobierz plik ${item.fileName}`);
    button.addEventListener("click", async (event) => {
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

    meta.append(dateTag, name);
    li.append(meta, button);
    fragment.append(li);
  });

  fileListElement.append(fragment);
}

function onSearchInput() {
  const filtered = filterTracksByName(allTracks, searchInputElement.value);
  renderList(filtered);
}

async function loadTracksFromGitHub() {
  const repoInfo = inferRepoFromGitHubPages();

  if (!repoInfo) {
    throw new Error(
      "Nie udało się ustalić repozytorium GitHub. Sprawdź konfigurację GPX_GITHUB_OWNER i GPX_GITHUB_REPO.",
    );
  }

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${GPX_PATH}?ref=${BRANCH}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "upewnij się, że repozytorium na GitHubie jest publiczne.",
      );
    }

    throw new Error(`Błąd GitHub API: ${response.status}`);
  }

  const entries = await response.json();

  return entries
    .filter((entry) => entry.type === "file" && entry.name.toLowerCase().endsWith(".gpx"))
    .map((entry) => {
      const parsed = parseTrackFileName(entry.name);

      if (!parsed) {
        return null;
      }

      return {
        fileName: entry.name,
        date: parsed.date,
        name: parsed.name,
        downloadUrl: entry.download_url,
        publicDownloadUrl: buildPublicDownloadUrl(entry.name),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.fileName.localeCompare(a.fileName));
}

async function init() {
  if (currentYearElement) {
    currentYearElement.textContent = String(new Date().getFullYear());
  }

  searchInputElement.addEventListener("input", onSearchInput);

  try {
    allTracks = await loadTracksFromGitHub();

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
