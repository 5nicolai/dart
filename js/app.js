// Einstieg: Router, Service Worker, Update-Hinweis
import { load } from "./store.js";
import { registerSW } from "./sw-update.js";
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
registerSW();
