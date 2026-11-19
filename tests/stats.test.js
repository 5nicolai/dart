import { test, eq, ok } from "./runner.js";
import { replay, DEFAULT_X01 } from "../js/engine/x01.js";
import { x01PlayerStats, playerOverview } from "../js/stats.js";

const players = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
const V = (v, n, dd) => ({ t: "v", v, n, dd });

test("Stats: Average, First-9, Zähler", () => {
  const cfg = { ...DEFAULT_X01, start: 501, players: [players[0]] };
  const st = replay(cfg, [V(180), V(140), V(100), V(81)]);
  const s = x01PlayerStats(st, 0);
  eq(s.darts, 12);
  eq(s.avg.toFixed(2), "125.25");
  eq(s.first9.toFixed(2), "140.00");
  eq([s.c180, s.c140, s.c100, s.c60], [1, 1, 1, 1]);
  eq(s.highScore, 180);
});

test("Stats: Checkout-Quote, bestes Leg, Übersicht", () => {
  const cfg = { ...DEFAULT_X01, start: 101, players };
  const events = [V(60), V(0), V(41, 3, 3)];
  const st = replay(cfg, events);
  ok(st.finished);
  const s = x01PlayerStats(st, 0);
  eq(s.checkouts, 1);
  eq(s.dd, 3);
  eq(s.checkoutPct.toFixed(1), "33.3");
  eq(s.bestLeg, 6);
  eq(s.highFinish, 41);
  const m = { id: "m1", type: "x01", config: cfg, events, createdAt: 1, finishedAt: 2 };
  const o = playerOverview([m], "a");
  eq(o.matches, 1);
  eq(o.matchesWon, 1);
  eq(o.series.length, 1);
  eq(playerOverview([m], "b").matchesWon, 0);
});
