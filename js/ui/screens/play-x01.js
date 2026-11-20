import { h, toast, speak, dialog } from "../dom.js";
import { get, update } from "../../store.js";
import { addEvent, undo } from "../actions.js";
import { replay, visitWouldFinish, minDartsForFinish } from "../../engine/x01.js";
import { checkout, routeLabel, isFinishable } from "../../engine/checkout.js";
import { isValidTurnScore, label, value, BULL } from "../../engine/darts.js";
import { x01PlayerStats, fmt } from "../../stats.js";

const QUICK = [26, 41, 45, 60, 81, 85, 100, 140, 180];
const countTurns = (st) => st.legsLog.reduce((a, l) => a + l.turns.length, 0);

export function renderX01(root, match, ctx) {
  const cfg = match.config;
  let st = replay(cfg, match.events);
  let mode = get().settings.inputMode;
  let buffer = "";
  let mult = 1;
  let busy = false;

  const setMode = (m) => {
    mode = m;
    update((d) => { d.settings.inputMode = m; });
    buffer = ""; mult = 1;
    draw();
  };

  function announce(prevTurns) {
    if (countTurns(st) <= prevTurns && !st.finished) return;
    const t = st.lastTurn;
    if (!t) return;
    const name = cfg.players[t.p].name;
    if (st.finished) {
      toast(cfg.players.length > 1 ? `🏆 ${name} gewinnt!` : "🎯 Geschafft!", "good");
      speak(`Game shot and the match. ${name}`);
      ctx.finish();
      return;
    }
    if (t.setWon) { toast(`Set für ${name}!`, "good"); speak(`Game shot and the set. ${name}`); }
    else if (t.legWon) { toast(`Leg für ${name} (${darts(st, t.p, -1)} Darts)`, "good"); speak(`Game shot. ${name}`); }
    else if (t.bust) { toast("Überworfen!", "bust"); speak("No score"); scheduleRequire(); }
    else {
      if (t.score === 180) toast("🎯 180!", "good");
      speak(t.score === 0 ? "No score" : t.score);
      scheduleRequire();
    }
  }

  // Caller: "<Name>, you require <Rest>" – 5 s nach der Score-Ansage, wenn ein Finish möglich ist
  let requireTimer = null;
  function cancelRequire() {
    if (requireTimer) { clearTimeout(requireTimer); requireTimer = null; }
  }
  function scheduleRequire() {
    cancelRequire();
    const p = st.players[st.current];
    if (!p || !p.opened || !checkout(p.remaining, 3, cfg.outMode)) return;
    const text = `${cfg.players[st.current].name}, you require ${p.remaining}`;
    requireTimer = setTimeout(() => { requireTimer = null; speak(text); }, 5000);
  }

  function commit(ev) {
    cancelRequire();
    const prev = countTurns(st);
    st = addEvent(match, ev);
    buffer = ""; mult = 1;
    draw();
    announce(prev);
  }

  async function submitVisit(v) {
    if (busy) return;
    if (!isValidTurnScore(v)) { toast("Ungültige Aufnahme", "bust"); buffer = ""; draw(); return; }
    const p = st.players[st.current];
    const ev = { t: "v", v };
    busy = true;
    try {
      if (visitWouldFinish(st, v)) {
        const min = minDartsForFinish(p.remaining, cfg.outMode);
        let n = 3;
        if (min < 3) {
          n = await dialog({ title: "Check-out! 🎯", text: "Mit wie vielen Darts?", choices: [1, 2, 3].filter((x) => x >= min).map((x) => ({ label: `${x} Dart${x > 1 ? "s" : ""}`, value: x, cls: "primary" })), dismissable: false });
        }
        let dd = 1;
        if (cfg.outMode !== "single" && n > 1) {
          dd = await dialog({ title: "Darts aufs Doppel?", text: "Für deine Check-out-Quote.", choices: Array.from({ length: n }, (_, i) => ({ label: String(i + 1), value: i + 1 })), dismissable: false });
        }
        ev.n = n; ev.dd = dd;
      } else if (cfg.outMode !== "single" && p.opened && p.remaining <= 100 && isFinishable(p.remaining, 2, cfg.outMode) && p.remaining - v !== 0) {
        const dd = await dialog({ title: "Darts aufs Doppel?", text: `Rest war ${p.remaining}. Wie viele Darts gingen aufs Doppel?`, choices: [0, 1, 2, 3].map((x) => ({ label: String(x), value: x })), dismissable: false });
        ev.dd = dd || 0;
      }
    } finally { busy = false; }
    commit(ev);
  }

  function throwDart(s) {
    if (busy) return;
    let m = s === 0 ? 0 : mult;
    if (s === BULL && m === 3) m = 2;
    commit({ t: "d", s, m: s === 0 ? 0 : m });
  }

  function doUndo() {
    if (mode === "visit" && buffer) { buffer = buffer.slice(0, -1); draw(); return; }
    if (!match.events.length) return;
    cancelRequire();
    st = undo(match);
    buffer = ""; mult = 1;
    toast("Rückgängig");
    draw();
  }

  // ---------- Darstellung ----------
  function darts(state, pIdx, legOffset = 0) {
    const leg = state.legsLog[state.legsLog.length - 1 + legOffset];
    if (!leg) return 0;
    let n = leg.turns.filter((t) => t.p === pIdx).reduce((a, t) => a + t.darts, 0);
    if (legOffset === 0 && state.turn && state.turn.p === pIdx) n += state.turn.darts.length;
    return n;
  }

  function header() {
    const legsInSet = st.players.reduce((a, p) => a + p.legs, 0) + 1;
    const fmtName = cfg.format === "bestof" ? "Best of" : "First to";
    const sub = cfg.sets > 1
      ? `Set ${st.setNo} · Leg ${legsInSet}\n${fmtName} ${cfg.sets} Sets`
      : cfg.legs > 1 ? `Leg ${st.legNo} · ${fmtName} ${cfg.legs}` : `${cfg.start} · ${cfg.outMode === "double" ? "Double-Out" : cfg.outMode === "master" ? "Master-Out" : "Straight-Out"}`;
    return h("header", { class: "topbar" },
      h("button", { class: "icon-btn", "aria-label": "Menü", onclick: () => ctx.menu([{ label: mode === "visit" ? "🎯 Einzeldart-Eingabe" : "🔢 Aufnahme-Eingabe", value: () => setMode(mode === "visit" ? "dart" : "visit") }]) }, "☰"),
      h("div", { class: "sub", style: { whiteSpace: "pre-line" } }, sub),
      h("button", { class: "icon-btn", "aria-label": "Eingabemodus wechseln", onclick: () => setMode(mode === "visit" ? "dart" : "visit") }, mode === "visit" ? "S·D·T" : "123"),
      h("button", { class: "icon-btn", "aria-label": "Rückgängig", disabled: !match.events.length && !buffer, onclick: doUndo }, "↶"),
    );
  }

  function board() {
    const n = st.players.length;
    const cls = n === 1 ? "n1" : n === 2 ? "n2" : "many";
    const showLegs = cfg.legs > 1 || cfg.sets > 1;
    const leg = st.legsLog[st.legsLog.length - 1];
    return h("div", { class: `board ${cls}` }, cfg.players.map((pl, i) => {
      const p = st.players[i];
      const s = x01PlayerStats(st, i);
      const lastTurn = [...leg.turns].reverse().find((t) => t.p === i);
      const legsTxt = showLegs ? (cfg.sets > 1 ? `S ${p.sets} · L ${p.legs}` : `Legs ${p.legs}`) : null;
      const info = [
        h("div", { class: "name" }, st.legStarter === i && n > 1 && h("span", { class: "throw", title: "Anwurf" }), pl.name),
        n > 2 && h("div", { class: "line" }, h("span", null, "Ø ", h("b", null, fmt(s.avg, 1))), legsTxt && h("span", { class: "legs" }, legsTxt), h("span", null, "Letzte ", h("b", null, lastTurn ? (lastTurn.bust ? "Bust" : lastTurn.score) : "–"))),
      ];
      if (n > 2) {
        return h("div", { class: `pcard ${st.current === i ? "active" : ""}`, style: `--pc:${pl.color}` }, h("div", { class: "info" }, info), h("div", { class: "rest" }, p.remaining));
      }
      return h("div", { class: `pcard ${st.current === i ? "active" : ""}`, style: `--pc:${pl.color}` },
        info,
        h("div", { class: "rest" }, p.remaining),
        h("div", { class: "line" }, h("span", null, "Ø ", h("b", null, fmt(s.avg, 1))), h("span", null, "Darts ", h("b", null, darts(st, i)))),
        h("div", { class: "line" }, legsTxt ? h("span", { class: "legs" }, legsTxt) : h("span", null, "First 9 ", h("b", null, fmt(s.first9, 1))), h("span", null, "Letzte ", h("b", null, lastTurn ? (lastTurn.bust ? "Bust" : lastTurn.score) : "–"))),
      );
    }));
  }

  function finishBox() {
    const p = st.players[st.current];
    const left = mode === "dart" && st.turn ? 3 - st.turn.darts.length : 3;
    if (!p.opened) return h("div", { class: "finish none" }, h("span", { class: "route" }, cfg.inMode === "double" ? "Double-In: erst ein Doppel treffen" : "Master-In: Doppel oder Triple zum Start"));
    const r = checkout(p.remaining, left, cfg.outMode);
    if (r) return h("div", { class: "finish" }, h("span", { class: "lbl" }, "Finish"), h("span", { class: "route" }, routeLabel(r)));
    const txt = p.remaining > 170 ? `Noch ${p.remaining - 170} bis zum Finish-Bereich` : left < 3 && isFinishable(p.remaining, 3, cfg.outMode) ? "Mit den restlichen Darts kein Finish – stellen" : "Kein Finish möglich – stellen";
    return h("div", { class: "finish none" }, h("span", { class: "route" }, txt));
  }

  function ticker() {
    const leg = st.legsLog[st.legsLog.length - 1];
    const items = [...leg.turns].reverse().slice(0, 12).map((t) =>
      h("span", { class: t.bust ? "bust" : "" }, cfg.players.length > 1 ? `${cfg.players[t.p].name.slice(0, 8)} ` : "", h("b", null, t.bust ? "Bust" : t.score)));
    if (!items.length) items.push(h("span", null, `Leg ${st.legNo} · ${cfg.players[st.current].name} beginnt`));
    return h("div", { class: "ticker", "aria-label": "Letzte Aufnahmen" }, items);
  }

  function visitPad() {
    const p = st.players[st.current];
    const digit = (dgt) => {
      if (buffer.length >= 3) return;
      const next = buffer === "0" ? dgt : buffer + dgt;
      if (parseInt(next, 10) > 180) { toast("Max. 180"); return; }
      buffer = next; draw();
    };
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => h("button", { class: "key", onclick: () => digit(d) }, d));
    const restBtn = p.remaining <= 180 && p.opened ? h("button", { class: "key sm", onclick: () => submitVisit(p.remaining) }, `Rest ${p.remaining}`) : h("button", { class: "key sm", onclick: () => submitVisit(0) }, "0 / Bust");
    return [
      h("div", { class: "input-display" }, h("span", { class: "lbl" }, `${cfg.players[st.current].name}: Aufnahme`), h("span", { class: "val" }, buffer || "0")),
      h("div", { class: "pad quick" }, QUICK.map((q) => h("button", { class: "key sm", onclick: () => submitVisit(q) }, q)), restBtn),
      h("div", { class: "pad keys" }, keys,
        h("button", { class: "key del", "aria-label": "Löschen", onclick: () => { buffer = buffer.slice(0, -1); draw(); } }, "⌫"),
        h("button", { class: "key", onclick: () => digit("0") }, "0"),
        h("button", { class: "key ok", onclick: () => submitVisit(parseInt(buffer || "0", 10)) }, "OK")),
    ];
  }

  function dartPad() {
    const t = st.turn;
    const thrown = t ? t.darts : [];
    const sum = thrown.reduce((a, d) => a + value(d), 0);
    const slots = [0, 1, 2].map((i) => h("div", { class: `slot ${thrown[i] ? "filled" : ""}` }, thrown[i] ? label(thrown[i]) : "–"));
    const nums = Array.from({ length: 20 }, (_, i) => i + 1).map((n) =>
      h("button", { class: "key", onclick: () => throwDart(n) }, mult === 3 ? `T${n}` : mult === 2 ? `D${n}` : String(n)));
    return [
      h("div", { class: "turn-darts" }, slots, h("div", { class: "sum" }, sum)),
      h("div", { class: "pad mods" },
        h("button", { class: `key sm ${mult === 1 ? "on" : ""}`, onclick: () => { mult = 1; draw(); } }, "Single"),
        h("button", { class: `key sm dbl ${mult === 2 ? "on" : ""}`, onclick: () => { mult = mult === 2 ? 1 : 2; draw(); } }, "Double"),
        h("button", { class: `key sm tpl ${mult === 3 ? "on" : ""}`, onclick: () => { mult = mult === 3 ? 1 : 3; draw(); } }, "Triple")),
      h("div", { class: "pad nums" }, nums),
      h("div", { class: "pad two" },
        h("button", { class: "key sm", disabled: mult === 3, onclick: () => throwDart(BULL) }, mult === 2 ? "Bull (50)" : "25"),
        h("button", { class: "key sm miss", onclick: () => throwDart(0) }, "Miss / 0")),
    ];
  }

  function draw() {
    root.replaceChildren(
      header(),
      board(),
      finishBox(),
      ticker(),
      h("div", { class: "flex-fill" }, mode === "visit" ? visitPad() : dartPad()),
    );
  }

  const onKey = (e) => {
    if (document.querySelector(".overlay")) return;
    if (mode !== "visit") return;
    if (/^[0-9]$/.test(e.key)) { const next = buffer + e.key; if (next.length <= 3 && parseInt(next, 10) <= 180) { buffer = next.replace(/^0+(?=\d)/, ""); draw(); } }
    else if (e.key === "Backspace") { e.preventDefault(); doUndo(); }
    else if (e.key === "Enter") submitVisit(parseInt(buffer || "0", 10));
  };
  window.addEventListener("keydown", onKey);

  draw();
  if (st.finished) ctx.finish();
  return () => { cancelRequire(); window.removeEventListener("keydown", onKey); };
}

