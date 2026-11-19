// Einstieg: Router, Service Worker, Update-Hinweis
import { load } from "./store.js";
import { h } from "./ui/dom.js";
import { renderHome } from "./ui/screens/home.js";
import { renderSetup } from "./ui/screens/setup.js";
import { renderPlay } from "./ui/screens/play.js";
import { renderSummary } from "./ui/screens/summary.js";
import { renderPlayers } from "./ui/screens/players.js";
import { renderStats } from "./ui/screens/stats.js";
import { renderHistory } from "./ui/screens/history.js";
import { renderSettings } from "./ui/screens/settings.js";
import { renderTraining } from "./ui/screens/training-menu.js";

const routes = [
  [/^#?\/?$/, renderHome],
  [/^#\/setup\/(\w+)$/, renderSetup],
  [/^#\/play$/, renderPlay],
  [/^#\/summary\/(\w+)$/, renderSummary],
  [/^#\/players$/, renderPlayers],
  [/^#\/stats(?:\/(\w+))?$/, renderStats],
  [/^#\/history$/, renderHistory],
  [/^#\/settings$/, renderSettings],
  [/^#\/training$/, renderTraining],
];

const root = document.getElementById("app");
let cleanup = null;

function route() {
  if (typeof cleanup === "function") cleanup();
  cleanup = null;
  document.querySelectorAll(".overlay").forEach((o) => o.remove());
  root.className = "";
  root.replaceChildren();
  const hash = location.hash || "#/";
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) {
      cleanup = fn(root, ...m.slice(1));
      window.scrollTo(0, 0);
      return;
    }
  }
  location.hash = "#/";
}

load();
window.addEventListener("hashchange", route);
route();

// ---------- Service Worker ----------
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  // Nur neu laden, wenn der Nutzer das Update angestoßen hat (nicht beim ersten Installieren)
  let updateRequested = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!updateRequested) return;
    updateRequested = false;
    location.reload();
  });
  navigator.serviceWorker.register("sw.js").then((reg) => {
    const offer = (worker) => {
      if (document.querySelector(".update-bar")) return;
      document.body.append(h("div", { class: "update-bar", role: "status" },
        h("span", { class: "grow" }, "Neue Version verfügbar"),
        h("button", { onclick: () => { updateRequested = true; worker.postMessage("skipWaiting"); } }, "Aktualisieren")));
    };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w?.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) offer(w);
      });
    });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
  }).catch((e) => console.warn("SW-Registrierung fehlgeschlagen", e));
}
