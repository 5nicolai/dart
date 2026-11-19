import { h, toast, speak } from "../dom.js";
import { addEvent, undo } from "../actions.js";
import { replayMatch } from "../../engine/index.js";
import { BOBS_TARGETS } from "../../engine/training.js";
import { checkout, routeLabel } from "../../engine/checkout.js";

const TITLES = { atc: "Around the Clock", bobs27: "Bob's 27", shanghai: "Shanghai", checkout: "Checkout-Training" };

export function renderTrainingPlay(root, match, ctx) {
  const cfg = match.config;
  let st = replayMatch(match);

  function push(ev) {
    st = addEvent(match, ev);
    draw();
    if (st.finished) {
      const w = st.winner !== null && cfg.players[st.winner] ? cfg.players[st.winner].name : "";
      if (match.type === "shanghai" && st.shanghai) { toast(`SHANGHAI! ${w} gewinnt`, "good"); speak("Shanghai!"); }
      else toast(cfg.players.length > 1 ? `🏆 ${w} gewinnt!` : "Training beendet 🎉", "good");
      ctx.finish();
    }
  }

  const header = (sub) => h("header", { class: "topbar" },
    h("button", { class: "icon-btn", "aria-label": "Menü", onclick: () => ctx.menu() }, "☰"),
    h("div", { class: "sub", style: { whiteSpace: "pre-line" } }, sub),
    h("button", { class: "icon-btn", "aria-label": "Rückgängig", disabled: !match.events.length, onclick: () => { st = undo(match); draw(); } }, "↶"));

  const others = (fn) => cfg.players.length > 1 && h("div", { class: "list" }, cfg.players.map((pl, i) =>
    h("div", { class: "list-item", style: { padding: "8px 12px", border: st.current === i ? "2px solid var(--accent)" : "2px solid transparent" } },
      h("span", { style: { color: pl.color } }, "●"), h("div", { class: "grow title" }, pl.name), h("b", null, fn(i)))));

  const dots = (n) => h("div", { class: "row", style: { justifyContent: "center" } },
    [0, 1, 2].map((i) => h("span", { style: { width: "12px", height: "12px", borderRadius: "50%", background: i < n ? "var(--accent)" : "var(--line)" } })));

  const bigBtns = (cls, items) => h("div", { class: `pad ${cls}`, style: { flex: 1, gridAutoRows: "minmax(64px, 1fr)" } }, items);

  function drawATC() {
    const p = st.players[st.current];
    const tgt = st.targets[Math.min(p.idx, st.targets.length - 1)];
    const pre = cfg.variant === "double" ? "D" : cfg.variant === "triple" && tgt !== 25 ? "T" : cfg.variant === "single" ? "S" : "";
    const tl = tgt === 25 ? (cfg.variant === "double" ? "Bull" : "Bull/25") : pre + tgt;
    return [
      header(`${TITLES.atc}\n${cfg.players[st.current].name} · Darts ${p.darts}`),
      h("div", { class: "card big-target" }, h("div", { class: "l" }, "Ziel"), h("div", { class: "t" }, tl),
        h("div", { class: "progress", style: { marginTop: "10px" } }, h("div", { style: { width: `${(p.idx / st.targets.length) * 100}%` } })),
        h("div", { class: "small muted", style: { marginTop: "6px" } }, `${p.idx}/${st.targets.length} · Trefferquote ${p.darts ? Math.round((p.hits / p.darts) * 100) : 0}%`)),
      others((i) => { const q = st.players[i]; return q.idx >= st.targets.length ? "✓" : st.targets[q.idx] === 25 ? "Bull" : st.targets[q.idx]; }),
      dots(st.dartInTurn),
      h("div", { class: "flex-fill" }, bigBtns("two", [
        h("button", { class: "key miss", onclick: () => push({ t: "miss" }) }, "✗ Daneben"),
        h("button", { class: "key hit", onclick: () => push({ t: "hit" }) }, "✓ Treffer")])),
    ];
  }

  function drawBobs() {
    const p = st.players[st.current];
    const tgt = BOBS_TARGETS[Math.min(p.round, BOBS_TARGETS.length - 1)];
    const val = tgt * 2;
    return [
      header(`${TITLES.bobs27} · Runde ${Math.min(p.round + 1, 21)}/21\n${cfg.players[st.current].name}`),
      h("div", { class: "card big-target" }, h("div", { class: "l" }, "Ziel"), h("div", { class: "t" }, tgt === 25 ? "Bull" : `D${tgt}`),
        h("div", { style: { fontSize: "1.6rem", fontWeight: 900, marginTop: "6px" } }, `${p.score} Punkte`),
        h("div", { class: "small muted" }, `Treffer +${val} je Dart · kein Treffer −${val}`)),
      others((i) => (st.players[i].out ? "raus" : st.players[i].score)),
      h("div", { class: "small muted center" }, "Wie viele Darts haben das Doppel getroffen?"),
      h("div", { class: "flex-fill" }, bigBtns("four", [0, 1, 2, 3].map((n) =>
        h("button", { class: `key ${n === 0 ? "miss" : ""}`, onclick: () => push({ t: "r", hits: n }) }, n)))),
    ];
  }

  function drawShanghai() {
    const p = st.players[st.current];
    const sym = ["–", "S", "D", "T"];
    return [
      header(`${TITLES.shanghai} · Runde ${st.round}/${st.rounds}\n${cfg.players[st.current].name}`),
      h("div", { class: "card big-target" }, h("div", { class: "l" }, "Ziel"), h("div", { class: "t" }, st.round),
        h("div", { style: { fontSize: "1.4rem", fontWeight: 900, marginTop: "6px" } }, `${p.score} Punkte`)),
      others((i) => st.players[i].score),
      h("div", { class: "turn-darts" }, [0, 1, 2].map((i) => h("div", { class: `slot ${st.turn[i] !== undefined ? "filled" : ""}` }, st.turn[i] !== undefined ? sym[st.turn[i]] : "–")),
        h("div", { class: "sum" }, st.turn.reduce((a, m) => a + m * st.round, 0))),
      h("div", { class: "flex-fill" }, bigBtns("four", [
        h("button", { class: "key miss", onclick: () => push({ t: "d", m: 0 }) }, "Miss"),
        h("button", { class: "key", onclick: () => push({ t: "d", m: 1 }) }, "Single"),
        h("button", { class: "key", style: { color: "var(--info)" }, onclick: () => push({ t: "d", m: 2 }) }, "Double"),
        h("button", { class: "key", style: { color: "var(--warn)" }, onclick: () => push({ t: "d", m: 3 }) }, "Triple")])),
    ];
  }

  function drawCheckout() {
    const tgt = st.targets[Math.min(st.idx, st.targets.length - 1)];
    const r = checkout(tgt, 3, "double");
    const done = st.results.length;
    const btns = Array.from({ length: cfg.darts }, (_, i) => i + 1)
      .filter((n) => n >= (r ? r.length : 1))
      .map((n) => h("button", { class: "key hit", style: { fontSize: "1rem" }, onclick: () => push({ t: "r", ok: true, n }) }, `✓ ${n}`));
    return [
      header(`${TITLES.checkout}\n${done + 1}/${st.targets.length} · Quote ${done ? Math.round((st.hits / done) * 100) : 0}%`),
      h("div", { class: "card big-target" }, h("div", { class: "l" }, "Finish"), h("div", { class: "t" }, tgt),
        h("div", { class: "finish", style: { marginTop: "10px" } }, h("span", { class: "lbl" }, "Weg"), h("span", { class: "route" }, routeLabel(r))),
        h("div", { class: "progress", style: { marginTop: "10px" } }, h("div", { style: { width: `${(done / st.targets.length) * 100}%` } }))),
      h("div", { class: "small muted center" }, `Geschafft? Mit wie vielen Darts (max. ${cfg.darts})?`),
      h("div", { class: "flex-fill" },
        h("div", { class: "pad", style: { gridTemplateColumns: `repeat(${Math.min(btns.length, 5)}, 1fr)`, gridAutoRows: "minmax(56px, 1fr)" } }, btns),
        h("button", { class: "key miss", style: { minHeight: "64px" }, onclick: () => push({ t: "r", ok: false, n: cfg.darts }) }, "✗ Nicht geschafft")),
    ];
  }

  function draw() {
    const views = { atc: drawATC, bobs27: drawBobs, shanghai: drawShanghai, checkout: drawCheckout };
    root.replaceChildren(...views[match.type]().filter(Boolean));
  }

  draw();
  if (st.finished) ctx.finish();
}
