const EQUALISER_HTML = '<span class="place-equaliser" aria-hidden="true"><span></span><span></span><span></span></span>';
const MOON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
const SUN_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

type SoundRow = {
  id: string;
  button: HTMLButtonElement;
  marker: HTMLElement;
  status: HTMLElement;
  audio: HTMLAudioElement;
  prepared: boolean;
};

let currentRow: SoundRow | null = null;
let playbackToken = 0;

function setMarker(row: SoundRow, state: "flag" | "loading" | "playing") {
  if (state === "playing") row.marker.innerHTML = EQUALISER_HTML;
  else if (state === "loading") row.marker.textContent = "···";
  else row.marker.textContent = row.marker.dataset.placeFlag ?? "";
}

function setPlayingState(row: SoundRow, playing: boolean) {
  row.button.classList.toggle("place-sound-row--playing", playing);
  row.button.setAttribute("aria-pressed", String(playing));
  row.button.removeAttribute("aria-busy");
  row.button.closest(".place-sound-list")?.classList.toggle("place-sound-list--playing", playing);
  setMarker(row, playing ? "playing" : "flag");
}

function prepare(row: SoundRow) {
  if (row.prepared) return;
  const primary = row.audio.dataset.audioPrimary ?? "";
  const fallback = row.audio.dataset.audioFallback ?? "";
  row.audio.src = row.audio.canPlayType("audio/mp4") ? primary : fallback;
  row.audio.preload = "none";
  row.audio.loop = true;
  row.prepared = true;
}

function fadeVolume(audio: HTMLAudioElement, target: number, duration: number, token: number) {
  const start = audio.volume;
  const startedAt = performance.now();
  return new Promise<void>((resolve) => {
    const step = (now: number) => {
      if (token !== playbackToken) return resolve();
      const progress = Math.min((now - startedAt) / duration, 1);
      audio.volume = start + (target - start) * progress;
      if (progress < 1) window.requestAnimationFrame(step);
      else resolve();
    };
    window.requestAnimationFrame(step);
  });
}

async function stop(row: SoundRow, token = ++playbackToken) {
  if (!row.audio.paused) await fadeVolume(row.audio, 0, 300, token);
  row.audio.pause();
  row.audio.currentTime = 0;
  row.audio.volume = 1;
  if (token !== playbackToken) return;
  setPlayingState(row, false);
  if (currentRow === row) currentRow = null;
}

function start(row: SoundRow) {
  if (currentRow === row) {
    void stop(row);
    return;
  }

  prepare(row);
  const token = ++playbackToken;
  const previous = currentRow;
  currentRow = row;
  row.button.setAttribute("aria-busy", "true");
  row.status.textContent = `Loading sound from ${row.button.textContent?.trim() ?? "place"}`;
  setMarker(row, "loading");
  row.audio.volume = 0;

  const playPromise = row.audio.play();

  playPromise.then(async () => {
    if (token !== playbackToken) {
      row.audio.pause();
      return;
    }
    if (previous) {
      await fadeVolume(previous.audio, 0, 300, token);
      previous.audio.pause();
      previous.audio.currentTime = 0;
      previous.audio.volume = 1;
      if (token !== playbackToken) {
        row.audio.pause();
        row.audio.currentTime = 0;
        row.audio.volume = 1;
        return;
      }
      setPlayingState(previous, false);
    }
    row.status.textContent = "";
    setPlayingState(row, true);
    await fadeVolume(row.audio, 1, 300, token);
  }).catch(() => {
    if (token !== playbackToken) return;
    row.audio.pause();
    row.audio.currentTime = 0;
    row.audio.volume = 1;
    row.button.removeAttribute("aria-busy");
    setMarker(row, "flag");
    row.status.textContent = "Sound could not be played";
    if (currentRow === row) currentRow = null;
  });
}

function initialiseThemeToggle() {
  const button = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!button) return;
  const render = () => {
    const dark = document.documentElement.classList.contains("dark");
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    button.innerHTML = dark ? SUN_ICON : MOON_ICON;
  };
  button.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
    render();
  });
  render();
}

export function startPlacesClient() {
  document.querySelectorAll<HTMLButtonElement>(".things-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.textContent?.trim();
      if (tab === "vinyls") window.location.assign("/things/vinyls");
    });
  });

  const audioById = new Map(
    Array.from(document.querySelectorAll<HTMLAudioElement>("[data-place-audio]"))
      .map((audio) => [audio.dataset.placeId ?? "", audio] as const),
  );

  document.querySelectorAll<HTMLButtonElement>("[data-place-sound-button]").forEach((button) => {
    const id = button.dataset.placeId ?? "";
    const audio = audioById.get(id);
    const marker = button.querySelector<HTMLElement>("[data-place-marker]");
    const status = button.querySelector<HTMLElement>("[data-place-status]");
    if (!audio || !marker || !status) return;
    const row: SoundRow = { id, button, marker, status, audio, prepared: false };
    button.addEventListener("click", () => start(row));
  });

  initialiseThemeToggle();
}
