import { test, eq, ok } from "./runner.js";
import { replay, DEFAULT_X01, neededToWin } from "../js/engine/x01.js";

const P = (n) => Array.from({ length: n }, (_, i) => ({ id: "p" + i, name: "P" + i }));
const cfg = (o = {}) => ({ ...DEFAULT_X01, players: P(o.n || 1), ...o });
const D = (s, m = 1) => ({ t: "d", s, m });
const V = (v, n, dd) => ({ t: "v", v, n, dd });

test("X01: Aufnahmen reduzieren den Rest", () => {
  const st = replay(cfg(), [V(100), V(60)]);
  eq(st.players[0].remaining, 341);
  eq(st.legsLog[0].turns.length, 2);
});

test("X01: Bust bei <0, Rest 1 und Finish ohne Doppel (Einzeldart)", () => {
  let st = replay(cfg({ start: 40 }), [D(20, 3)]);
  eq(st.players[0].remaining, 40, "<0");
  ok(st.legsLog[0].turns[0].bust);
  st = replay(cfg({ start: 41 }), [D(20, 2)]);
  eq(st.players[0].remaining, 41, "Rest 1");
  st = replay(cfg({ start: 40 }), [D(20, 1), D(20, 1)]);
  eq(st.players[0].remaining, 40, "Single als Finish");
  st = replay(cfg({ start: 40, outMode: "single" }), [D(20, 1), D(20, 1)]);
  ok(st.finished, "Single-Out erlaubt");
});

test("X01: Bust setzt die ganze Aufnahme zurück", () => {
  const st = replay(cfg({ start: 50 }), [D(20), D(20), D(20)]);
  eq(st.players[0].remaining, 50);
  eq(st.legsLog[0].turns[0].darts, 3);
  eq(st.legsLog[0].turns[0].score, 0);
});

test("X01: Checkout per Einzeldart beendet Solo-Match", () => {
  const st = replay(cfg({ start: 100 }), [D(20, 3), D(20, 2)]);
  ok(st.finished);
  eq(st.winner, 0);
  const t = st.legsLog[0].turns[0];
  ok(t.checkout);
  eq(t.darts, 2);
  eq(t.dd, 1, "ein Dart aufs Doppel");
});

test("X01: Checkout per Aufnahme mit Dart-Anzahl", () => {
  const st = replay(cfg({ start: 100 }), [V(100, 2, 1)]);
  ok(st.finished);
  eq(st.legsLog[0].turns[0].darts, 2);
  const bad = replay(cfg({ start: 169 }), [V(169)]);
  ok(!bad.finished, "169 ist kein Finish");
  eq(bad.players[0].remaining, 169);
});

test("X01: Double-In zählt erst ab Doppel", () => {
  const st = replay(cfg({ inMode: "double" }), [D(20), D(20, 2), D(20)]);
  eq(st.players[0].remaining, 501 - 60);
});

test("X01: Spielerwechsel und Anwurfwechsel pro Leg", () => {
  const st = replay(cfg({ n: 2, start: 40, legs: 2 }), [V(40, 1, 1)]);
  eq(st.players[0].legs, 1);
  eq(st.current, 1, "Leg 2 beginnt Spieler 2");
  eq(st.players[0].remaining, 40);
  eq(st.legsLog.length, 2);
});

test("X01: Sets mit Best-of", () => {
  eq(neededToWin("bestof", 5), 3);
  eq(neededToWin("firstto", 3), 3);
  // Sets: First to 2 Sets, je First to 1 Leg
  const c = cfg({ n: 2, start: 40, legs: 1, sets: 2 });
  let st = replay(c, [V(40, 1, 1)]);
  eq(st.players[0].sets, 1);
  eq(st.setNo, 2);
  eq(st.current, 1, "Set 2 beginnt Spieler 2");
  st = replay(c, [V(40, 1, 1), V(40, 1, 1)]);
  eq(st.players[1].sets, 1);
  st = replay(c, [V(40, 1, 1), V(40, 1, 1), V(40, 1, 1)]);
  ok(st.finished);
  eq(st.winner, 0);
});

test("X01: Undo über Leg-Grenze = Ereignis entfernen", () => {
  const c = cfg({ n: 2, start: 40, legs: 3 });
  const evs = [V(20), V(10), V(20, 1, 1)];
  let st = replay(c, evs);
  eq(st.legsLog.length, 2);
  st = replay(c, evs.slice(0, -1));
  eq(st.legsLog.length, 1);
  eq(st.players[0].remaining, 20);
  eq(st.current, 0);
});

test("X01: Darts aufs Doppel werden gezählt", () => {
  const st = replay(cfg({ start: 40 }), [D(20, 1), D(5, 2), D(5, 2)]);
  ok(st.finished);
  eq(st.legsLog[0].turns[0].dd, 3);
});
