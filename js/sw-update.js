// Service Worker: Registrierung, Update-Hinweis und manuelles Aktualisieren
import { h, toast } from "./ui/dom.js";

const supported = () => "serviceWorker" in navigator && location.protocol !== "file:";

let registration = null;
// Nur neu laden, wenn der Nutzer das Update angestoßen hat (nicht beim ersten Installieren)
let updateRequested = false;

function activate(worker) {
  updateRequested = true;
  worker.postMessage("skipWaiting");
  // Fallback, falls "controllerchange" ausbleibt
  setTimeout(() => location.reload(), 4000);
}

export function registerSW() {
  if (!supported()) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!updateRequested) return;
    updateRequested = false;
    location.reload();
  });
  navigator.serviceWorker.register("sw.js").then((reg) => {
    registration = reg;
    const offer = (worker) => {
      if (document.querySelector(".update-bar")) return;
      document.body.append(h("div", { class: "update-bar", role: "status" },
        h("span", { class: "grow" }, "Neue Version verfügbar"),
        h("button", { onclick: () => activate(worker) }, "Aktualisieren")));
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

// Wartet, bis ein installierender Worker fertig ist (true) oder verworfen wurde (false)
function waitInstalled(worker, ms = 20000) {
  return new Promise((resolve) => {
    if (worker.state === "installed") return resolve(true);
    const timer = setTimeout(() => resolve(false), ms);
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" || worker.state === "redundant") {
        clearTimeout(timer);
        resolve(worker.state === "installed");
      }
    });
  });
}

/**
 * Holt die neueste Version der Web-App.
 * Gibt es einen neuen Service Worker, wird er aktiviert, sonst werden die Caches
 * geleert und die Seite frisch vom Server geladen. Daten (localStorage) bleiben erhalten.
 * Liefert false, wenn nichts passiert ist (z. B. offline).
 */
export async function updateApp() {
  if (!supported()) { location.reload(); return true; }
  if (!navigator.onLine) { toast("Keine Internetverbindung", "bust"); return false; }
  try {
    const reg = registration || (await navigator.serviceWorker.getRegistration());
    if (reg) {
      await reg.update();
      let worker = reg.waiting;
      if (!worker && reg.installing && (await waitInstalled(reg.installing))) worker = reg.waiting;
      if (worker && navigator.serviceWorker.controller) {
        toast("Neue Version wird geladen…", "good");
        activate(worker);
        return true;
      }
    }
    // Keine neue SW-Version: Caches leeren und frisch laden
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    toast("Lade neueste Version…", "good");
    location.reload();
    return true;
  } catch (err) {
    toast("Update fehlgeschlagen: " + err.message, "bust");
    return false;
  }
}
