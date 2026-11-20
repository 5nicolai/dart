// Kleine DOM-Helfer ohne Framework
import { get } from "../store.js";

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on") && typeof v === "function") {
        const type = k.slice(2).toLowerCase();
        el.addEventListener(type, type === "click" ? (e) => { haptic(); v(e); } : v);
      } else if (k === "html") el.innerHTML = v;
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
  }
  append(el, children);
  return el;
}

// Inhalt eines Containers ersetzen (null/false werden ignoriert)
export function mount(root, ...children) {
  root.replaceChildren();
  append(root, children);
}

function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export function haptic(ms = 12) {
  if (get().settings.haptics && navigator.vibrate) navigator.vibrate(ms);
}

let voices = null;
export function speak(text) {
  if (!get().settings.voice || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    // Caller spricht immer Englisch (bevorzugt britisch)
    u.lang = "en-GB";
    if (!voices || !voices.length) voices = speechSynthesis.getVoices();
    const lang = (v) => (v.lang || "").replace("_", "-").toLowerCase();
    const en = voices.find((v) => lang(v) === "en-gb") || voices.find((v) => lang(v).startsWith("en"));
    if (en) u.voice = en;
    u.rate = 1.05;
    speechSynthesis.speak(u);
  } catch { /* Sprachausgabe nicht verfügbar */ }
}

let toastTimer = null;
export function toast(msg, kind = "") {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const t = h("div", { class: `toast ${kind}`, role: "status" }, msg);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 1800);
}

/**
 * Modaler Dialog. buttons: [{ label, value, cls }]. Ergebnis: Promise mit value (oder null bei Abbruch).
 * body darf ein Node sein; choices: Raster aus Schnellwahl-Buttons.
 */
export function dialog({ title, text, body, buttons = [], choices = null, dismissable = true }) {
  return new Promise((resolve) => {
    const close = (val) => { ov.remove(); document.removeEventListener("keydown", onKey); resolve(val); };
    const onKey = (e) => { if (e.key === "Escape" && dismissable) close(null); };
    const box = h("div", { class: "dialog", role: "dialog", "aria-modal": "true", "aria-label": title },
      title && h("h3", null, title),
      text && h("p", null, text),
      body,
      choices && h("div", { class: "choices" }, choices.map((c) => h("button", { class: `btn ${c.cls || ""}`, onclick: () => close(c.value) }, c.label))),
      buttons.length && h("div", { class: "actions" }, buttons.map((b) => h("button", { class: `btn ${b.cls || ""}`, onclick: () => close(typeof b.value === "function" ? b.value() : b.value) }, b.label))),
    );
    const ov = h("div", { class: "overlay", onclick: (e) => { if (e.target === ov && dismissable) close(null); } }, box);
    document.body.append(ov);
    document.addEventListener("keydown", onKey);
    const first = box.querySelector("input, button.primary, button");
    if (first) first.focus({ preventScroll: true });
  });
}

export const confirmDialog = (title, text, okLabel = "OK", danger = false) =>
  dialog({ title, text, buttons: [{ label: "Abbrechen", value: false }, { label: okLabel, value: true, cls: danger ? "danger" : "primary" }] });

export function topbar(title, { back = "#/", right = [], sub = null } = {}) {
  return h("header", { class: "topbar" },
    back !== null && h("button", { class: "icon-btn", "aria-label": "Zurück", onclick: () => (typeof back === "function" ? back() : (location.hash = back)) }, "←"),
    sub ? h("div", { class: "sub" }, sub) : h("h1", null, title),
    right,
  );
}

export function seg(options, value, onChange) {
  return h("div", { class: "seg", role: "radiogroup" },
    options.map(([v, label]) => h("button", { class: v === value ? "on" : "", role: "radio", "aria-checked": String(v === value), onclick: () => onChange(v) }, label)));
}

export function stepper(value, { min = 1, max = 99, step = 1, onChange }) {
  return h("div", { class: "stepper" },
    h("button", { "aria-label": "weniger", onclick: () => onChange(Math.max(min, value - step)) }, "−"),
    h("output", null, value),
    h("button", { "aria-label": "mehr", onclick: () => onChange(Math.min(max, value + step)) }, "+"));
}

export function switchRow(label, on, onChange, hint) {
  return h("div", { class: "switch-row" },
    h("div", null, h("div", { style: { fontWeight: 700 } }, label), hint && h("div", { class: "small muted" }, hint)),
    h("button", { class: `switch ${on ? "on" : ""}`, role: "switch", "aria-checked": String(on), "aria-label": label, onclick: () => onChange(!on) }));
}

export function playerDot(p, size = 22) {
  return h("span", { class: "dot", style: { background: p.color || "#94a3b8", width: size + "px", height: size + "px" } }, (p.name || "?").slice(0, 1).toUpperCase());
}

export function fmtDate(ts) {
  return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
