import { test, eq, ok } from "./runner.js";
import { replayCricket, mpr } from "../js/engine/cricket.js";

const P = (n) => Array.from({ length: n }, (_, i) => ({ id: "p" + i, name: "P" + i }));
const D = (s, m = 1) => ({ t: "d", s, m });
const close = (n) => [D(n, 3)];

test("Cricket: Treffer schließen, Überschuss punktet", () => {
  const st = replayCricket({ players: P(2) }, [D(20, 3), D(20, 3), D(19, 1)]);
  eq(st.players[0].marks[20], 3);
  eq(st.players[0].points, 60);
  eq(st.players[0].marks[19], 1);
  eq(st.current, 1);
});

test("Cricket: keine Punkte, wenn alle geschlossen haben", () => {
  const st = replayCricket({ players: P(2) }, [D(20, 3), D(0), D(0), D(20, 3), D(0), D(0), D(20, 3)]);
  eq(st.players[0].points, 0);
});

test("Cricket: Cut-Throat gibt Punkte an Gegner", () => {
  const st = replayCricket({ players: P(3), variant: "cutthroat" }, [D(20, 3), D(20, 2)]);
  eq(st.players[0].points, 0);
  eq(st.players[1].points, 40);
  eq(st.players[2].points, 40);
});

test("Cricket: Solo endet, wenn alles zu ist; MPR", () => {
  const evs = [20, 19, 18, 17, 16, 15].flatMap(close).concat([D(25, 2), D(25, 1)]);
  const st = replayCricket({ players: P(1) }, evs);
  ok(st.finished);
  eq(st.winner, 0);
  eq(st.players[0].darts, 8);
  eq(mpr(st.players[0]).toFixed(2), (21 / 8 * 3).toFixed(2));
});

test("Cricket: Sieg nur mit genug Punkten", () => {
  // P1 punktet zuerst 60, P0 schließt alles, liegt aber hinten -> kein Sieg
  const all = [20, 19, 18, 17, 16, 15];
  const evs = [D(0), D(0), D(0), D(20, 3), D(20, 3), D(0)];
  for (const n of all.slice(1)) evs.push(D(n, 3), D(0), D(0), D(0), D(0), D(0));
  evs.push(D(20, 3), D(25, 2), D(25, 1));
  const st = replayCricket({ players: P(2) }, evs);
  ok(!st.finished, "P0 hat 0 Punkte gegen 60");
});
