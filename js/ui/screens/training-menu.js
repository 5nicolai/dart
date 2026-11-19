import { h, mount, topbar } from "../dom.js";

const MODES = [
  ["atc", "🔢", "Around the Clock", "1 bis 20 und Bull der Reihe nach treffen. Wer braucht die wenigsten Darts?"],
  ["bobs27", "🎯", "Bob's 27", "Doppel-Training: Start mit 27 Punkten, D1 bis Bull. Unter 0 ist das Spiel vorbei."],
  ["shanghai", "🀄", "Shanghai", "Runde für Runde auf die Rundenzahl. Single + Double + Triple in einer Aufnahme gewinnt sofort."],
  ["checkout", "✅", "Checkout-Training", "Zufällige Finishes aus deinem Bereich. Wie hoch ist deine Quote?"],
];

export function renderTraining(root) {
  mount(root, 
    topbar("Training"),
    h("div", { class: "list" },
      MODES.map(([id, ic, name, desc]) =>
        h("button", { class: "list-item", onclick: () => (location.hash = `#/setup/${id}`) },
          h("span", { style: { fontSize: "1.6rem" }, "aria-hidden": "true" }, ic),
          h("div", { class: "grow" }, h("div", { class: "title" }, name), h("div", { class: "small muted", style: { marginTop: "2px" } }, desc)),
          h("span", { class: "muted" }, "›")))),
  );
}
