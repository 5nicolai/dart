// Persistenz in localStorage mit Schema-Version
export const STORE_KEY = "dartpro_v1";
export const SCHEMA = 1;

export const DEFAULT_SETTINGS = {
  haptics: true,
  voice: false,
  wakeLock: true,
  inputMode: "visit", // visit | dart
  lastSetup: {},
};

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
