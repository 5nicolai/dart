// Persistenz in localStorage mit Schema-Version
export const STORE_KEY = "dartpro_v1";
export const SCHEMA = 1;

export const DEFAULT_SETTINGS = {
  haptics: true,
  voice: false,
  requireDelay: 3, // Sekunden zwischen Score-Ansage und "you require"-Ansage (0 = aus)
  voiceVolume: "high", // Lautstärke der Ansage: low | mid | high
  wakeLock: true,
  inputMode: "visit", // visit | dart
  lastSetup: {},
};

// Erlaubte Werte für die Einstellungen
export const REQUIRE_DELAYS = [0, 1, 2, 3, 6];
export const VOICE_VOLUMES = { low: 0.3, mid: 0.65, high: 1 };

// Auf den nächstgelegenen erlaubten Pausenwert runden (z. B. alte Werte 5/8/10 s → 6 s)
function snapDelay(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.requireDelay;
  return REQUIRE_DELAYS.reduce((best, d) => (Math.abs(d - n) < Math.abs(best - n) ? d : best));
}

export function defaultData() {
  return { v: SCHEMA, players: [], matches: [], activeId: null, settings: { ...DEFAULT_SETTINGS } };
}

export function migrate(raw) {
  const d = defaultData();
  if (!raw || typeof raw !== "object") return d;
  if (Array.isArray(raw.players)) d.players = raw.players.filter((p) => p && p.id && p.name);
  if (Array.isArray(raw.matches)) d.matches = raw.matches.filter((m) => m && m.id && m.type && m.config && Array.isArray(m.events));
  if (raw.activeId && d.matches.some((m) => m.id === raw.activeId)) d.activeId = raw.activeId;
  d.settings = { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
  d.settings.requireDelay = snapDelay(d.settings.requireDelay);
  if (!(d.settings.voiceVolume in VOICE_VOLUMES)) d.settings.voiceVolume = DEFAULT_SETTINGS.voiceVolume;
  return d;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

let data = null;
const listeners = new Set();

function storage() {
  try { return window.localStorage; } catch { return null; }
}

export function load() {
  let raw = null;
  try { raw = JSON.parse(storage()?.getItem(STORE_KEY) || "null"); } catch { raw = null; }
  data = migrate(raw);
  return data;
}

export function get() {
  return data || load();
}

export function save() {
  try { storage()?.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { console.warn("Speichern fehlgeschlagen", e); }
  listeners.forEach((fn) => fn(data));
}

export function update(fn) {
  fn(get());
  save();
}

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function exportJSON() {
  return JSON.stringify({ app: "dart-pro", exportedAt: new Date().toISOString(), ...get() }, null, 2);
}

export function importJSON(text) {
  const raw = JSON.parse(text);
  if (!raw || raw.app !== "dart-pro") throw new Error("Keine Dart-Pro-Sicherung");
  data = migrate(raw);
  save();
  return data;
}

export function resetAll() {
  data = defaultData();
  save();
}

export const getMatch = (id) => get().matches.find((m) => m.id === id);
export const getPlayer = (id) => get().players.find((p) => p.id === id);
