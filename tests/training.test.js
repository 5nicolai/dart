import { test, eq, ok } from "./runner.js";
import { replayATC, replayBobs, replayShanghai, replayCheckout, makeCheckoutTargets } from "../js/engine/training.js";

const P = (n) => Array.from({ length: n }, (_, i) => ({ id: "p" + i }));
const H = { t: "hit" }, M = { t: "miss" };

test("ATC: Treffer schalten weiter, Spielerwechsel nach 3 Darts", () => {
  const st = replayATC({ players: P(2) }, [H, H, M, M]);
  eq(st.players[0].idx, 2);
  eq(st.current, 1);
  eq(st.players[1].darts, 1);
});

test("ATC: Solo bis Bull beendet das Spiel", () => {
  const st = replayATC({ players: P(1) }, Array(21).fill(H));
  ok(st.finished);
  eq(st.players[0].darts, 21);
  const noBull = replayATC({ players: P(1), bull: false }, Array(20).fill(H));
  ok(noBull.finished);
});

test("Bob's 27: Punkte und Ausscheiden", () => {
  let st = replayBobs({ players: P(1) }, [{ t: "r", hits: 1 }, { t: "r", hits: 0 }]);
  eq(st.players[0].score, 27 + 2 - 4);
  const zeros = Array(5).fill({ t: "r", hits: 0 });
  st = replayBobs({ players: P(1) }, zeros);
  // 27-2-4-6-8 = 7, dann -10 => -3 -> raus
  ok(st.players[0].out);
  ok(st.finished);
});

test("Shanghai: Punkte und sofortiger Sieg", () => {
  let st = replayShanghai({ players: P(1), rounds: 2 }, [{ t: "d", m: 3 }, { t: "d", m: 0 }, { t: "d", m: 1 }]);
  eq(st.players[0].score, 4);
  eq(st.round, 2);
  st = replayShanghai({ players: P(2) }, [1, 2, 3].map((m) => ({ t: "d", m })));
  ok(st.finished && st.shanghai);
  eq(st.winner, 0);
});

test("Checkout-Training: Quote und Ende", () => {
  const targets = makeCheckoutTargets(2, 170, 3, () => 0);
  eq(targets, [2, 2, 2]);
  const st = replayCheckout({ targets, darts: 3 }, [{ t: "r", ok: true, n: 1 }, { t: "r", ok: false }, { t: "r", ok: true, n: 2 }]);
  ok(st.finished);
  eq(st.hits, 2);
  eq(st.darts, 6);
});
