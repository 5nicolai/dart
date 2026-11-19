import { h, topbar, fmtDate } from "../dom.js";
import { get } from "../../store.js";
import { GAME_TYPES } from "../../engine/index.js";

export function renderHistory(root) {
  let filter = "all";
  const draw = () => {
    const all = get().matches.filter((m) => m.finishedAt).sort((a, b) => b.finishedAt - a.finishedAt);
    const list = all.filter((m) => filter === "all" || (filter === "training" ? GAME_TYPES[m.type].training : m.type === filter));
    root.replaceChildren(
      topbar("Verlauf"),
      h("div", { class: "seg" }, [["all", "Alle"], ["x01", "X01"], ["cricket", "Cricket"], ["training", "Training"]].map(([v, l]) =>
        h("button", { class: filter === v ? "on" : "", onclick: () => { filter = v; draw(); } }, l))),
      list.length === 0
        ? h("div", { class: "empty" }, "Noch keine beendeten Spiele.")
        : h("div", { class: "list" }, list.map((m) => {
          const names = m.config.players.map((p) => p.name).join(" · ");
          const w = m.winnerIdx !== undefined && m.winnerIdx !== null && m.config.players.length > 1 ? m.config.players[m.winnerIdx] : null;
          const title = m.type === "x01" ? `${m.config.start}${m.config.legs > 1 || m.config.sets > 1 ? ` · ${m.config.sets > 1 ? m.config.sets + " Sets" : m.config.legs + " Legs"}` : ""}` : GAME_TYPES[m.type].name;
          return h("button", { class: "list-item", onclick: () => (location.hash = `#/summary/${m.id}`) },
            h("div", { class: "grow" },
              h("div", { class: "title" }, title, w && h("span", { class: "muted small" }, `  🏆 ${w.name}`)),
              h("div", { class: "meta" }, `${fmtDate(m.finishedAt)} · ${names}`)),
            h("span", { class: "muted" }, "›"));
        })),
    );
  };
  draw();
}
