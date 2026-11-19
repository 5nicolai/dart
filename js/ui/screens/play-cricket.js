import { h, toast, speak } from "../dom.js";
import { addEvent, addEvents, undo } from "../actions.js";
import { replayCricket, mpr } from "../../engine/cricket.js";
import { label, BULL } from "../../engine/darts.js";
import { fmt } from "../../stats.js";

const MARK = ["", "/", "✕", "Ⓧ"];

export function renderCricket(root, match, ctx) {
  const cfg = match.config;
  let st = replayCricket(cfg, match.events);
  let mult = 1;

  function after(prevTurns) {
    if (st.finished) {
      const name = cfg.players[st.winner].name;
      toast(cfg.players.length > 1 ? `🏆 ${name} gewinnt!` : "🎯 Geschafft!", "good");
      speak(`Game shot. ${name}`);
      ctx.finish();
    } else if (st.turns.length > prevTurns) {
      const t = st.turns[st.turns.length - 1];
      if (t.marks >= 5) toast(`${t.marks} Marks!`, "good");
      speak(t.marks ? `${t.marks} Marks` : "Keine Marks");
    }
  }

  function throwDart(s) {
    const prev = st.turns.length;
    let m = s === 0 ? 0 : mult;
    if (s === BULL && m === 3) m = 2;
    st = addEvent(match, { t: "d", s, m });
    mult = 1;
    draw();
    after(prev);
  }

  function endTurn() {
    const left = 3 - st.turn.length;
    if (left <= 0 || left === 3) return;
    const prev = st.turns.length;
    st = addEvents(match, Array.from({ length: left }, () => ({ t: "d", s: 0, m: 0 })));
    draw();
    after(prev);
  }

  function draw() {
    const n = cfg.players.length;
    const closedByAll = (num) => st.players.every((p) => p.marks[num] >= 3);
    const cells = [h("div", { class: "cell" }, "")];
    cfg.players.forEach((pl, i) => cells.push(
      h("div", { class: `cell head ${st.current === i ? "active" : ""}` },
        h("span", { style: { whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" } }, pl.name),
        h("small", null, st.players[i].points),
        h("span", { class: "muted", style: { fontSize: "0.65rem" } }, `MPR ${fmt(mpr(st.players[i]), 2)}`))));
    for (const num of st.numbers) {
      cells.push(h("div", { class: `cell num ${closedByAll(num) ? "dead" : ""}` }, num === BULL ? "Bull" : num));
      st.players.forEach((p) => {
        const m = p.marks[num];
        cells.push(h("div", { class: "cell" }, h("span", { class: `mark ${m >= 3 ? "m3" : ""}` }, MARK[Math.min(3, m)])));
      });
    }
    const table = h("div", { class: "ctable", style: { gridTemplateColumns: `52px repeat(${n}, 1fr)` } }, cells);

    const thrown = st.turn;
    const slots = [0, 1, 2].map((i) => h("div", { class: `slot ${thrown[i] ? "filled" : ""}` }, thrown[i] ? label(thrown[i]) : "–"));
    const marks = thrown.reduce((a, d) => a + d.eff, 0);

    root.replaceChildren(
      h("header", { class: "topbar" },
        h("button", { class: "icon-btn", "aria-label": "Menü", onclick: () => ctx.menu() }, "☰"),
        h("div", { class: "sub" }, `${cfg.variant === "cutthroat" ? "Cut-Throat" : "Cricket"} · Runde ${st.round}\n${cfg.players[st.current].name} wirft`),
        h("button", { class: "icon-btn", "aria-label": "Rückgängig", disabled: !match.events.length, onclick: () => { st = undo(match); mult = 1; draw(); } }, "↶")),
      table,
      h("div", { class: "turn-darts" }, slots, h("div", { class: "sum" }, `${marks} M`)),
      h("div", { class: "flex-fill" },
        h("div", { class: "pad mods" },
          h("button", { class: `key sm ${mult === 1 ? "on" : ""}`, onclick: () => { mult = 1; draw(); } }, "Single"),
          h("button", { class: `key sm dbl ${mult === 2 ? "on" : ""}`, onclick: () => { mult = mult === 2 ? 1 : 2; draw(); } }, "Double"),
          h("button", { class: `key sm tpl ${mult === 3 ? "on" : ""}`, onclick: () => { mult = mult === 3 ? 1 : 3; draw(); } }, "Triple")),
        h("div", { class: "pad four", style: { flex: 1, gridAutoRows: "minmax(52px, 1fr)" } },
          [20, 19, 18, 17, 16, 15].map((num) => h("button", { class: "key", onclick: () => throwDart(num) }, (mult === 3 ? "T" : mult === 2 ? "D" : "") + num)),
          h("button", { class: "key", disabled: mult === 3, onclick: () => throwDart(BULL) }, mult === 2 ? "Bull" : "25"),
          h("button", { class: "key miss", onclick: () => throwDart(0) }, "Miss")),
        h("button", { class: "btn block", disabled: thrown.length === 0, onclick: endTurn }, "Aufnahme beenden (Rest = Miss)"),
      ),
    );
    root.querySelector(".sub").style.whiteSpace = "pre-line";
  }

  draw();
  if (st.finished) ctx.finish();
}
