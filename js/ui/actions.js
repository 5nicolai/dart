// Match-Lebenszyklus: anlegen, Ereignisse hinzufügen, rückgängig, beenden
import { get, update, uid, getMatch } from "../store.js";
import { replayMatch } from "../engine/index.js";
import { makeCheckoutTargets } from "../engine/training.js";

export const COLORS = ["#10b981", "#38bdf8", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#facc15", "#fb923c", "#2dd4bf", "#e2e8f0"];

export function startMatch(type, config) {
  const match = { id: uid(), type, config, events: [], createdAt: Date.now(), finishedAt: null };
  update((d) => {
    // ein evtl. offenes, leeres Match verwerfen
    d.matches = d.matches.filter((m) => !(m.id === d.activeId && m.events.length === 0));
    d.matches.push(match);
    d.activeId = match.id;
  });
  location.hash = "#/play";
  return match;
}

export function activeMatch() {
  const d = get();
  return d.activeId ? getMatch(d.activeId) : null;
}

function afterChange(match) {
  const st = replayMatch(match);
  if (st.finished && !match.finishedAt) {
    update((d) => {
      match.finishedAt = Date.now();
      match.winnerIdx = st.winner;
      if (d.activeId === match.id) d.activeId = null;
    });
  }
  return st;
}

export function addEvents(match, evs) {
  update(() => match.events.push(...evs));
  return afterChange(match);
}

export const addEvent = (match, ev) => addEvents(match, [ev]);

export function undo(match) {
  if (!match.events.length) return replayMatch(match);
  update(() => match.events.pop());
  return replayMatch(match);
}

// Beendetes Match wieder öffnen und den letzten Wurf zurücknehmen
export function reopen(match) {
  update((d) => {
    match.finishedAt = null;
    delete match.winnerIdx;
    match.events.pop();
    d.activeId = match.id;
  });
  location.hash = "#/play";
}

export function removeMatch(match) {
  update((d) => {
    d.matches = d.matches.filter((m) => m.id !== match.id);
    if (d.activeId === match.id) d.activeId = null;
  });
}

export function rematch(match) {
  const cfg = JSON.parse(JSON.stringify(match.config));
  if (cfg.players.length > 1) cfg.players.push(cfg.players.shift()); // anderer Spieler beginnt
  if (match.type === "checkout") cfg.targets = makeCheckoutTargets(cfg.min, cfg.max, cfg.count);
  return startMatch(match.type, cfg);
}

export function addPlayer(name, color) {
  const d = get();
  const p = { id: uid(), name: name.trim().slice(0, 24), color: color || COLORS[d.players.length % COLORS.length], createdAt: Date.now() };
  update((dd) => dd.players.push(p));
  return p;
}
