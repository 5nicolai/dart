// Spielbildschirm: wählt die passende Ansicht und hält den Bildschirm wach
import { h, dialog, confirmDialog } from "../dom.js";
import { get } from "../../store.js";
import { activeMatch, removeMatch } from "../actions.js";
import { renderX01 } from "./play-x01.js";
import { renderCricket } from "./play-cricket.js";
import { renderTrainingPlay } from "./play-training.js";

export function renderPlay(root) {
  const match = activeMatch();
  if (!match) { location.hash = "#/"; return; }
  root.className = "play";
  const release = keepAwake();
  const ctx = {
    finish: () => setTimeout(() => { location.hash = `#/summary/${match.id}`; }, 900),
    menu: (extra = []) => openMenu(match, extra),
  };
  let inner;
  if (match.type === "x01") inner = renderX01(root, match, ctx);
  else if (match.type === "cricket") inner = renderCricket(root, match, ctx);
  else inner = renderTrainingPlay(root, match, ctx);
  return () => { release(); if (typeof inner === "function") inner(); };
}

async function openMenu(match, extra) {
  const v = await dialog({
    title: "Spielmenü",
    body: h("div", { class: "stack" }),
    choices: [
      ...extra,
      { label: "⏸ Pause (Hauptmenü)", value: "pause" },
      { label: "🗑 Spiel abbrechen", value: "abort", cls: "danger" },
    ],
    buttons: [{ label: "Schließen", value: null }],
  });
  if (v === "pause") location.hash = "#/";
  else if (v === "abort") {
    if (await confirmDialog("Spiel abbrechen?", "Das Spiel wird gelöscht und nicht gewertet.", "Abbrechen & löschen", true)) {
      removeMatch(match);
      location.hash = "#/";
    }
  } else if (v && typeof v === "function") v();
}

// Screen Wake Lock, wird bei Sichtbarkeitswechsel neu angefordert
function keepAwake() {
  if (!get().settings.wakeLock || !("wakeLock" in navigator)) return () => {};
  let lock = null;
  let active = true;
  const req = async () => {
    try { if (active && document.visibilityState === "visible") lock = await navigator.wakeLock.request("screen"); } catch { /* nicht erlaubt */ }
  };
  const onVis = () => { if (document.visibilityState === "visible") req(); };
  document.addEventListener("visibilitychange", onVis);
  req();
  return () => {
    active = false;
    document.removeEventListener("visibilitychange", onVis);
    lock?.release().catch(() => {});
  };
}
