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
    button.href = item.downloadUrl;
    button.download = item.fileName;
    button.textContent = "Pobierz";
    button.setAttribute("aria-label", `Pobierz plik ${item.fileName}`);

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
