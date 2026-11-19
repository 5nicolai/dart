import { h, topbar, seg, stepper, dialog, playerDot, switchRow } from "../dom.js";
import { get, update, uid } from "../../store.js";
import { startMatch, COLORS } from "../actions.js";
import { createPlayerFlow } from "./players.js";
import { GAME_TYPES } from "../../engine/index.js";
import { DEFAULT_X01 } from "../../engine/x01.js";
import { makeCheckoutTargets } from "../../engine/training.js";

const DEFAULTS = {
  x01: { ...DEFAULT_X01 },
  cricket: { variant: "standard" },
  atc: { variant: "any", bull: true },
  bobs27: {},
  shanghai: { rounds: 7 },
  checkout: { min: 2, max: 170, count: 10, darts: 3 },
};

const MAX_PLAYERS = { checkout: 1 };

export function renderSetup(root, type) {
  if (!GAME_TYPES[type]) { location.hash = "#/"; return; }
  const last = get().settings.lastSetup[type] || {};
  const opts = { ...DEFAULTS[type], ...(last.opts || {}) };
  const known = new Set(get().players.map((p) => p.id));
  let selected = (last.players || []).filter((id) => known.has(id));
  let guests = [];
  const maxP = MAX_PLAYERS[type] || 8;
  if (!selected.length && get().players.length) selected = [get().players[0].id];
  selected = selected.slice(0, maxP);

  const togglePlayer = (id) => {
    if (selected.includes(id)) selected = selected.filter((x) => x !== id);
    else if (selected.length + guests.length < maxP) selected.push(id);
    else if (maxP === 1) selected = [id];
    draw();
  };

  const playerSection = () => {
    const d = get();
    const order = (id) => selected.indexOf(id) + 1;
    return h("section", { class: "card stack" },
      h("h2", null, maxP === 1 ? "Spieler" : `Spieler (${selected.length + guests.length}/${maxP}) – Reihenfolge = Antippen`),
      h("div", { class: "chips" },
        d.players.map((p) => h("button", { class: `chip ${selected.includes(p.id) ? "on" : ""}`, "aria-pressed": String(selected.includes(p.id)), onclick: () => togglePlayer(p.id) },
          playerDot(p), p.name, selected.includes(p.id) && maxP > 1 && h("span", { class: "order" }, order(p.id)))),
        guests.map((g) => h("button", { class: "chip on", onclick: () => { guests = guests.filter((x) => x !== g); draw(); } }, playerDot(g), g.name, " ✕")),
      ),
      h("div", { class: "row" },
        h("button", { class: "btn grow", onclick: async () => {
          const p = await createPlayerFlow();
          if (p) { if (selected.length + guests.length < maxP) selected.push(p.id); else if (maxP === 1) selected = [p.id]; draw(); }
        } }, "+ Spieler"),
        h("button", { class: "btn grow", onclick: async () => {
          if (selected.length + guests.length >= maxP) { if (maxP === 1) selected = []; else return; }
          const n = guests.length + 1;
          guests.push({ id: "guest-" + uid(), name: `Gast ${n}`, color: COLORS[(d.players.length + n) % COLORS.length], guest: true });
          draw();
        } }, "+ Gast"),
        maxP > 1 && h("button", { class: "btn", "aria-label": "Reihenfolge mischen", onclick: () => { selected.sort(() => Math.random() - 0.5); guests.sort(() => Math.random() - 0.5); draw(); } }, "🔀"),
      ),
    );
  };

  const optionSection = () => {
    const set = (k, v) => { opts[k] = v; draw(); };
    const field = (label, control) => h("div", { class: "field" }, h("label", null, label), control);
    if (type === "x01") {
      const starts = [101, 170, 301, 501, 701, 901];
      return h("section", { class: "card stack" }, h("h2", null, "Regeln"),
        field("Startpunkte", h("div", { class: "seg" },
          starts.map((s) => h("button", { class: opts.start === s ? "on" : "", onclick: () => set("start", s) }, s)),
          h("button", { class: starts.includes(opts.start) ? "" : "on", onclick: async () => {
            const input = h("input", { class: "text-input", type: "number", inputmode: "numeric", min: "2", max: "9999", value: opts.start });
            const v = await dialog({ title: "Eigene Startpunkte", body: input, buttons: [{ label: "Abbrechen", value: null }, { label: "OK", cls: "primary", value: () => parseInt(input.value, 10) }] });
            if (v >= 2 && v <= 9999) set("start", v);
          } }, starts.includes(opts.start) ? "Frei" : String(opts.start)))),
        field("In", seg([["single", "Straight"], ["double", "Double"], ["master", "Master"]], opts.inMode, (v) => set("inMode", v))),
        field("Out", seg([["double", "Double"], ["master", "Master"], ["single", "Straight"]], opts.outMode, (v) => set("outMode", v))),
        field("Modus", seg([["firstto", "First to"], ["bestof", "Best of"]], opts.format, (v) => {
          opts.format = v;
          if (v === "bestof") { if (opts.legs % 2 === 0) opts.legs++; if (opts.sets > 1 && opts.sets % 2 === 0) opts.sets++; }
          draw();
        })),
        h("div", { class: "row between" },
          field(opts.sets > 1 ? "Legs pro Set" : "Legs", stepper(opts.legs, { min: 1, max: 21, step: opts.format === "bestof" ? 2 : 1, onChange: (v) => set("legs", v) })),
          field("Sets", stepper(opts.sets, { min: 1, max: 13, step: opts.format === "bestof" && opts.sets > 1 ? 2 : 1, onChange: (v) => set("sets", opts.format === "bestof" && v > 1 && v % 2 === 0 ? v + 1 : v) }))),
        h("p", { class: "small muted" }, describeX01(opts)),
      );
    }
    if (type === "cricket") {
      return h("section", { class: "card stack" }, h("h2", null, "Regeln"),
        field("Variante", seg([["standard", "Standard"], ["cutthroat", "Cut-Throat"]], opts.variant, (v) => set("variant", v))),
        h("p", { class: "small muted" }, opts.variant === "cutthroat"
          ? "Treffer auf eigene geschlossene Zahlen geben Punkte an Gegner, die noch offen sind. Wenig Punkte sind gut."
          : "15–20 und Bull je dreimal treffen. Überzählige Treffer bringen Punkte, solange ein Gegner noch offen ist."));
    }
    if (type === "atc") {
      return h("section", { class: "card stack" }, h("h2", null, "Regeln"),
        field("Was zählt als Treffer", seg([["any", "Ganze Zahl"], ["single", "Single"], ["double", "Double"], ["triple", "Triple"]], opts.variant, (v) => set("variant", v))),
        switchRow("Bull am Ende", opts.bull, (v) => set("bull", v)));
    }
    if (type === "bobs27") {
      return h("section", { class: "card" }, h("h2", null, "Regeln"),
        h("p", { class: "small muted" }, "Start mit 27 Punkten. Pro Runde 3 Darts auf D1, D2 … D20, Bull. Jeder Treffer bringt den Doppelwert, keiner kostet ihn. Unter 0 ist Schluss."));
    }
    if (type === "shanghai") {
      return h("section", { class: "card stack" }, h("h2", null, "Regeln"),
        field("Runden", seg([[7, "1–7"], [10, "1–10"], [20, "1–20"]], opts.rounds, (v) => set("rounds", v))),
        h("p", { class: "small muted" }, "Runde n: alle Darts auf die n. Single, Double und Triple in einer Aufnahme = Shanghai, sofortiger Sieg."));
    }
    if (type === "checkout") {
      const ranges = [[2, 40, "2–40"], [41, 100, "41–100"], [61, 120, "61–120"], [101, 170, "101–170"], [2, 170, "2–170"]];
      const cur = ranges.find((r) => r[0] === opts.min && r[1] === opts.max) || ranges[4];
      return h("section", { class: "card stack" }, h("h2", null, "Einstellungen"),
        field("Bereich", h("div", { class: "seg" }, ranges.map((r) => h("button", { class: r === cur ? "on" : "", onclick: () => { opts.min = r[0]; opts.max = r[1]; draw(); } }, r[2])))),
        field("Darts pro Finish", seg([[3, "3"], [6, "6"], [9, "9"]], opts.darts, (v) => set("darts", v))),
        field("Anzahl Finishes", stepper(opts.count, { min: 5, max: 50, step: 5, onChange: (v) => set("count", v) })));
    }
    return null;
  };

  const start = () => {
    const d = get();
    const players = [...selected.map((id) => d.players.find((p) => p.id === id)).filter(Boolean).map(({ id, name, color }) => ({ id, name, color })), ...guests];
    if (!players.length) return;
    update((dd) => { dd.settings.lastSetup[type] = { players: selected, opts: { ...opts } }; });
    const config = { ...opts, players };
    if (type === "checkout") config.targets = makeCheckoutTargets(opts.min, opts.max, opts.count);
    startMatch(type, config);
  };

  function draw() {
    const count = selected.length + guests.length;
    root.replaceChildren(
      topbar(GAME_TYPES[type].name, { back: GAME_TYPES[type].training ? "#/training" : "#/" }),
      playerSection(),
      optionSection(),
      h("button", { class: "btn primary big block", disabled: count === 0, onclick: start }, count === 0 ? "Spieler wählen" : count === 1 ? "▶ Solo starten" : `▶ Spiel starten (${count} Spieler)`),
    );
  }
  draw();
}

function describeX01(o) {
  const need = (n) => (o.format === "bestof" ? Math.floor(n / 2) + 1 : n);
  const legs = `${o.format === "bestof" ? "Best of" : "First to"} ${o.legs} Leg${o.legs > 1 ? "s" : ""}`;
  const sets = o.sets > 1 ? `, ${o.format === "bestof" ? "Best of" : "First to"} ${o.sets} Sets (${need(o.sets)} Sets zum Sieg, je ${need(o.legs)} Legs)` : ` (${need(o.legs)} zum Sieg)`;
  const io = `${o.inMode === "single" ? "Straight" : o.inMode === "double" ? "Double" : "Master"}-In, ${o.outMode === "single" ? "Straight" : o.outMode === "double" ? "Double" : "Master"}-Out`;
  return `${o.start} · ${io} · ${legs}${sets}`;
}
