import { h, mount, confirmDialog } from "../dom.js";
import { get } from "../../store.js";
import { activeMatch, removeMatch } from "../actions.js";
import { GAME_TYPES } from "../../engine/index.js";

export function renderHome(root) {
  const d = get();
  const active = activeMatch();

  const tile = (href, ic, title, sub, cls = "") =>
    h("button", { class: `tile ${cls}`, onclick: () => (location.hash = href) }, h("span", { class: "ic", "aria-hidden": "true" }, ic), h("b", null, title), sub && h("span", null, sub));

  let resume = null;
  if (active) {
    const names = active.config.players.map((p) => p.name).join(", ");
    const label = active.type === "x01" ? `${active.config.start}` : GAME_TYPES[active.type].name;
    resume = h("div", { class: "stack" },
      h("button", { class: "tile wide resume", onclick: () => (location.hash = "#/play") },
        h("span", { class: "ic" }, "▶"),
        h("div", { class: "grow" }, h("b", null, `Weiterspielen: ${label}`), h("span", { style: { display: "block" } }, names))),
      h("button", { class: "btn small", style: { minHeight: "36px" }, onclick: async () => {
        if (await confirmDialog("Spiel verwerfen?", "Das laufende Spiel wird gelöscht und zählt nicht in der Statistik.", "Verwerfen", true)) {
          removeMatch(active);
          renderHome(root);
        }
      } }, "Laufendes Spiel verwerfen"));
  }

  mount(root, 
    h("section", { class: "hero" },
      h("img", { class: "logo", src: "icons/icon.svg", alt: "" }),
      h("h1", null, "Dart Pro"),
      h("p", null, "Steel-Dart-Zähler · Statistik · Training")),
    resume,
    h("div", { class: "tiles" },
      tile("#/setup/x01", "🎯", "X01", "301 · 501 · Legs & Sets"),
      tile("#/setup/cricket", "✖️", "Cricket", "Standard · Cut-Throat"),
      tile("#/training", "🏋️", "Training", "ATC · Bob's 27 · Shanghai · Checkout"),
      tile("#/stats", "📈", "Statistik", "Averages & Rekorde"),
      tile("#/history", "🗂️", "Verlauf", `${d.matches.filter((m) => m.finishedAt).length} Spiele`),
      tile("#/players", "👥", "Spieler", `${d.players.length} Profile`),
      tile("#/settings", "⚙️", "Einstellungen", "Ansage, Vibration, Backup", "wide"),
    ),
  );
}
