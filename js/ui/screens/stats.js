import { h, mount, topbar, playerDot } from "../dom.js";
import { get } from "../../store.js";
import { playerOverview, fmt } from "../../stats.js";
import { lineChart } from "../components/chart.js";

export function renderStats(root, playerId) {
  const d = get();
  if (!d.players.length) {
    mount(root, topbar("Statistik"), h("div", { class: "empty" }, "Lege zuerst ein Spielerprofil an. Gäste werden nicht gespeichert."),
      h("button", { class: "btn primary block", onclick: () => (location.hash = "#/players") }, "Spieler anlegen"));
    return;
  }
  const player = d.players.find((p) => p.id === playerId) || d.players[0];
  const o = playerOverview(d.matches, player.id);
  const x = o.x01;

  const kpi = (val, lbl) => h("div", { class: "kpi" }, h("b", null, val), h("span", null, lbl));
  const kv = (k, v) => h("div", { class: "kv" }, h("span", { class: "muted" }, k), h("b", null, v));

  let chart = h("p", { class: "small muted" }, "Nach dem ersten beendeten X01-Spiel erscheint hier dein Verlauf.");
  const series = o.series.slice(-40);
  if (series.length) {
    const labels = series.map((s) => new Date(s.t).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }));
    chart = lineChart([
      { name: "Ø 3 Darts", color: "#10b981", values: series.map((s) => s.avg) },
      { name: "First 9", color: "#38bdf8", values: series.map((s) => s.first9) },
    ], labels);
  }

  mount(root, 
    topbar("Statistik"),
    h("div", { class: "chips" }, d.players.map((p) =>
      h("button", { class: `chip ${p.id === player.id ? "on" : ""}`, onclick: () => (location.hash = `#/stats/${p.id}`) }, playerDot(p), p.name))),
    h("section", { class: "card" }, h("h2", null, "X01"),
      h("div", { class: "kpis" },
        kpi(fmt(x.avg), "Ø 3 Darts"), kpi(fmt(x.first9), "First 9"), kpi(x.dd ? `${fmt(x.checkoutPct, 1)}%` : "–", "Check-out"),
        kpi(x.highFinish || "–", "High Finish"), kpi(x.bestLeg ?? "–", "Bestes Leg"), kpi(x.highScore || "–", "Höchste Aufn."),
        kpi(x.c180, "180"), kpi(x.c140, "140+"), kpi(x.c100, "100+")),
      h("div", { style: { marginTop: "8px" } },
        kv("60+", x.c60),
        kv("Legs gewonnen / gespielt", `${x.legsWon} / ${x.legsPlayed}`),
        kv("Darts geworfen", x.darts),
        kv("Spiele gesamt (gewonnen*)", `${o.matches} (${o.matchesWon})`)),
      h("p", { class: "small muted", style: { marginTop: "6px" } }, "* nur Spiele mit mehreren Spielern")),
    h("section", { class: "card" }, h("h2", null, "Average-Verlauf (letzte 40 X01-Spiele)"), chart),
    h("section", { class: "card" }, h("h2", null, "Cricket"),
      kv("Spiele / Siege", `${o.cricket.games} / ${o.cricket.won}`),
      kv("MPR gesamt", fmt(o.cricket.mpr)),
      kv("Bestes MPR", fmt(o.cricket.bestMpr))),
    h("section", { class: "card" }, h("h2", null, "Training – Rekorde"),
      kv("Around the Clock (wenigste Darts)", o.atc.best ?? "–"),
      kv("Bob's 27 (höchste Punkte)", o.bobs27.best ?? "–"),
      kv("Shanghai (höchste Punkte)", o.shanghai.best ?? "–"),
      kv("Checkout-Training gesamt", o.checkout.attempts ? `${fmt((o.checkout.hits / o.checkout.attempts) * 100, 0)}% (${o.checkout.hits}/${o.checkout.attempts})` : "–"),
      kv("Checkout-Training beste Quote", o.checkout.bestPct !== null ? `${fmt(o.checkout.bestPct, 0)}%` : "–")),
  );
}
