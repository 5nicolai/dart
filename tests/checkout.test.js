import { test, eq, ok } from "./runner.js";
import { checkout, routeLabel, isFinishable } from "../js/engine/checkout.js";
import { value, isValidFinisher } from "../js/engine/darts.js";

const BOGEYS = [169, 168, 166, 165, 163, 162, 159];

test("Checkout: alle Werte 2–170 bei Double-Out gültig oder Bogey", () => {
  for (let s = 2; s <= 170; s++) {
    const r = checkout(s, 3, "double");
    if (BOGEYS.includes(s)) { eq(r, null, `Bogey ${s}`); continue; }
    ok(r, `kein Weg für ${s}`);
    eq(r.reduce((a, d) => a + value(d), 0), s, `Summe ${s}`);
    ok(isValidFinisher(r[r.length - 1], "double"), `${s} endet nicht auf Doppel`);
    ok(r.length <= 3, `${s} zu viele Darts`);
  }
});

test("Checkout: Klassiker", () => {
  eq(routeLabel(checkout(170)), "T20 T20 Bull");
  eq(routeLabel(checkout(100)), "T20 D20");
  eq(routeLabel(checkout(40)), "D20");
  eq(routeLabel(checkout(32)), "D16");
  eq(routeLabel(checkout(50)), "Bull");
  eq(routeLabel(checkout(60)), "20 D20");
});

test("Checkout: 1 und >170 nicht möglich", () => {
  eq(checkout(1), null);
  eq(checkout(171), null);
  eq(checkout(0), null);
});

test("Checkout: verbleibende Darts begrenzen", () => {
  eq(checkout(100, 1), null);
  eq(routeLabel(checkout(100, 2)), "T20 D20");
  eq(checkout(170, 2), null);
  ok(isFinishable(110, 2), "110 mit 2 Darts (T20 Bull)");
  eq(checkout(41, 1), null);
});

test("Checkout: Master-Out und Single-Out", () => {
  eq(routeLabel(checkout(60, 1, "master")), "T20");
  eq(routeLabel(checkout(180, 3, "master")), "T20 T20 T20");
  eq(routeLabel(checkout(1, 1, "single")), "1");
  eq(checkout(1, 3, "master"), null);
  ok(checkout(179, 3, "single") === null, "179 unmöglich");
});
