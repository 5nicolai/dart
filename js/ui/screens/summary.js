import { h, mount, topbar, confirmDialog, fmtDate } from "../dom.js";
import { getMatch } from "../../store.js";
import { rematch, reopen, removeMatch } from "../actions.js";
import { replayMatch, GAME_TYPES } from "../../engine/index.js";
import { mpr } from "../../engine/cricket.js";
import { x01PlayerStats, fmt } from "../../stats.js";

export function renderSummary(root, id) {
  const match = getMatch(id);
  if (!match) { location.hash = "#/history"; return; }
  const cfg = match.config;
  const st = replayMatch(match);
  const solo = cfg.players.length === 1;
  const winner = st.winner !== null && st.winner !== undefined ? cfg.players[st.winner] : null;

  let banner;
  if (!match.finishedAt) banner = h("div", { class: "winner-banner" }, h("div", { class: "trophy" }, "⏸"), h("h2", null, "Nicht beendet"));
  else if (solo) banner = h("div", { class: "winner-banner" }, h("div", { class: "trophy" }, "🎉"), h("h2", null, soloHeadline(match, st)));
  else banner = h("div", { class: "winner-banner" }, h("div", { class: "trophy" }, "🏆"), h("h2", null, `${winner?.name} gewinnt`), match.type === "shanghai" && st.shanghai && h("p", null, "mit einem Shanghai!"));

  const sections = [];
  const table = (head, rows) => h("table", { class: "tbl" },
    h("thead", null, h("tr", null, head.map((x) => h("th", null, x)))),
    h("tbody", null, rows.map((r) => h("tr", null, r.map((c) => h("td", null, c))))));
  const names = cfg.players.map((p) => p.name);

  if (match.type === "x01") {
    const stats = cfg.players.map((_, i) => x01PlayerStats(st, i));
    const rows = [
      ["Ø 3 Darts", ...stats.map((s) => fmt(s.avg))],
      ["First 9", ...stats.map((s) => fmt(s.first9))],
      ["Darts", ...stats.map((s) => s.darts)],
      ["Check-out", ...stats.map((s) => (s.dd ? `${fmt(s.checkoutPct, 0)}% (${s.checkouts}/${s.dd})` : "–"))],
      ["High Finish", ...stats.map((s) => s.highFinish || "–")],
      ["Bestes Leg", ...stats.map((s) => (s.bestLeg ? `${s.bestLeg} D.` : "–"))],
      ["Höchste Aufn.", ...stats.map((s) => s.highScore)],
      ["180", ...stats.map((s) => s.c180)],
      ["140+", ...stats.map((s) => s.c140)],
      ["100+", ...stats.map((s) => s.c100)],
      ["60+", ...stats.map((s) => s.c60)],
    ];
    if (!solo) rows.unshift([cfg.sets > 1 ? "Sets" : "Legs", ...st.players.map((p) => (cfg.sets > 1 ? p.sets : p.legs))]);
    sections.push(h("section", { class: "card" }, h("h2", null, "Statistik"), table(["", ...names], rows)));
    const legs = st.legsLog.filter((l) => l.winner !== null);
    if (legs.length > 1 || !solo) {
      sections.push(h("section", { class: "card" }, h("h2", null, "Legs"),
        table(["Leg", "Sieger", "Darts", "Finish"], legs.map((l, i) => {
          const wt = l.turns.filter((t) => t.p === l.winner);
          return [cfg.sets > 1 ? `S${l.set} L${i + 1}` : i + 1, names[l.winner], wt.reduce((a, t) => a + t.darts, 0), wt[wt.length - 1]?.score ?? "–"];
        }))));
    }
  } else if (match.type === "cricket") {
    sections.push(h("section", { class: "card" }, h("h2", null, "Statistik"), table(["", ...names], [
      ["Punkte", ...st.players.map((p) => p.points)],
      ["MPR", ...st.players.map((p) => fmt(mpr(p)))],
      ["Darts", ...st.players.map((p) => p.darts)],
      ["Marks", ...st.players.map((p) => p.effMarks)],
    ])));
  } else if (match.type === "atc") {
    sections.push(h("section", { class: "card" }, h("h2", null, "Ergebnis"), table(["", ...names], [
      ["Ziele", ...st.players.map((p) => `${p.idx}/${st.targets.length}`)],
      ["Darts", ...st.players.map((p) => p.darts)],
      ["Trefferquote", ...st.players.map((p) => (p.darts ? `${Math.round((p.hits / p.darts) * 100)}%` : "–"))],
    ])));
  } else if (match.type === "bobs27") {
    sections.push(h("section", { class: "card" }, h("h2", null, "Ergebnis"), table(["", ...names], [
      ["Punkte", ...st.players.map((p) => (p.out ? `${p.score} (raus)` : p.score))],
      ["Runden", ...st.players.map((p) => p.round)],
      ["Doppel-Quote", ...st.players.map((p) => (p.darts ? `${Math.round((p.hits / p.darts) * 100)}%` : "–"))],
    ])));
  } else if (match.type === "shanghai") {
    sections.push(h("section", { class: "card" }, h("h2", null, "Ergebnis"), table(["Runde", ...names],
      [...Array.from({ length: Math.max(...st.players.map((p) => p.perRound.length)) }, (_, r) => [r + 1, ...st.players.map((p) => p.perRound[r] ?? "–")]),
        ["Summe", ...st.players.map((p) => p.score)]])));
  } else if (match.type === "checkout") {
    sections.push(h("section", { class: "card" }, h("h2", null, `Quote ${st.results.length ? Math.round((st.hits / st.results.length) * 100) : 0}% · ${st.hits}/${st.results.length}`),
      table(["Finish", "Ergebnis"], st.results.map((r) => [r.target, r.ok ? `✓ ${r.n} Dart${r.n > 1 ? "s" : ""}` : "✗"]))));
  }

  mount(root, 
    topbar(GAME_TYPES[match.type].name + (match.type === "x01" ? ` ${cfg.start}` : ""), { back: "#/history" }),
    banner,
    h("p", { class: "small muted center" }, fmtDate(match.createdAt)),
    sections,
    match.finishedAt && h("button", { class: "btn primary big block", onclick: () => rematch(match) }, "↻ Revanche / Nochmal"),
    h("div", { class: "row" },
      h("button", { class: "btn grow", onclick: () => (location.hash = "#/") }, "Hauptmenü"),
      match.finishedAt && h("button", { class: "btn grow", onclick: async () => {
        if (await confirmDialog("Letzten Wurf zurücknehmen?", "Das Spiel wird wieder geöffnet.", "Zurücknehmen")) reopen(match);
      } }, "↶ Letzter Wurf"),
      h("button", { class: "btn danger", "aria-label": "Spiel löschen", onclick: async () => {
        if (await confirmDialog("Spiel löschen?", "Es verschwindet aus Verlauf und Statistik.", "Löschen", true)) { removeMatch(match); location.hash = "#/history"; }
      } }, "🗑")),
  );
}

function soloHeadline(match, st) {
  const p = st.players?.[0];
  switch (match.type) {
    case "x01": { const s = x01PlayerStats(st, 0); return `Ø ${fmt(s.avg)} · ${s.darts} Darts`; }
    case "cricket": return `MPR ${fmt(mpr(p))} · ${p.darts} Darts`;
    case "atc": return `${p.darts} Darts`;
    case "bobs27": return p.out ? `Ausgeschieden bei ${p.round} Runden` : `${p.score} Punkte`;
    case "shanghai": return `${p.score} Punkte`;
    case "checkout": return `${st.hits} von ${st.results.length} gecheckt`;
    default: return "Fertig";
  }
}
