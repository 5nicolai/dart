// Kennzahlen aus Matches
import { replayMatch } from "./engine/index.js";
import { mpr } from "./engine/cricket.js";

export function emptyX01() {
  return { score: 0, darts: 0, f9Score: 0, f9Darts: 0, dd: 0, checkouts: 0, highFinish: 0, highScore: 0,
    c60: 0, c100: 0, c140: 0, c180: 0, bestLeg: null, legsWon: 0, legsPlayed: 0, turns: 0 };
}

export function addX01(acc, legsLog, pIdx) {
  for (const leg of legsLog) {
    const turns = leg.turns.filter((t) => t.p === pIdx);
    if (!turns.length) continue;
    acc.legsPlayed++;
    let legDarts = 0;
    turns.forEach((t, i) => {
      acc.score += t.score;
      acc.darts += t.darts;
      acc.turns++;
      legDarts += t.darts;
      if (i < 3) { acc.f9Score += t.score; acc.f9Darts += t.darts; }
      acc.dd += t.dd || 0;
      if (t.score > acc.highScore) acc.highScore = t.score;
      if (t.score === 180) acc.c180++;
      else if (t.score >= 140) acc.c140++;
      else if (t.score >= 100) acc.c100++;
      else if (t.score >= 60) acc.c60++;
      if (t.checkout) {
        acc.checkouts++;
        if (t.score > acc.highFinish) acc.highFinish = t.score;
      }
    });
    if (leg.winner === pIdx) {
      acc.legsWon++;
      if (acc.bestLeg === null || legDarts < acc.bestLeg) acc.bestLeg = legDarts;
    }
  }
  return acc;
}

export function deriveX01(a) {
  return {
    ...a,
    avg: a.darts ? (a.score / a.darts) * 3 : 0,
    first9: a.f9Darts ? (a.f9Score / a.f9Darts) * 3 : 0,
    checkoutPct: a.dd ? (a.checkouts / a.dd) * 100 : 0,
  };
}

export function x01PlayerStats(state, pIdx) {
  return deriveX01(addX01(emptyX01(), state.legsLog, pIdx));
}

// Gesamtübersicht für einen Spieler über alle abgeschlossenen Matches
export function playerOverview(matches, playerId) {
  const x = emptyX01();
  const series = [];
  const out = {
    matches: 0, matchesWon: 0,
    cricket: { games: 0, won: 0, marks: 0, darts: 0, bestMpr: 0 },
    atc: { games: 0, best: null },
    bobs27: { games: 0, best: null },
    shanghai: { games: 0, best: null },
    checkout: { games: 0, hits: 0, attempts: 0, bestPct: null },
  };
  const sorted = [...matches].sort((a, b) => a.createdAt - b.createdAt);
  for (const m of sorted) {
    const idx = m.config.players.findIndex((p) => p.id === playerId);
    if (idx < 0 || !m.finishedAt) continue;
    const st = replayMatch(m);
    out.matches++;
    if (st.winner === idx && m.config.players.length > 1) out.matchesWon++;
    if (m.type === "x01") {
      addX01(x, st.legsLog, idx);
      const one = x01PlayerStats(st, idx);
      if (one.darts) series.push({ t: m.finishedAt, avg: one.avg, first9: one.first9 });
    } else if (m.type === "cricket") {
      const p = st.players[idx];
      const c = out.cricket;
      c.games++; c.marks += p.effMarks; c.darts += p.darts;
      if (st.winner === idx) c.won++;
      c.bestMpr = Math.max(c.bestMpr, mpr(p));
    } else if (m.type === "atc") {
      const p = st.players[idx];
      out.atc.games++;
      if (st.winner === idx && (out.atc.best === null || p.darts < out.atc.best)) out.atc.best = p.darts;
    } else if (m.type === "bobs27") {
      const p = st.players[idx];
      out.bobs27.games++;
      if (out.bobs27.best === null || p.score > out.bobs27.best) out.bobs27.best = p.score;
    } else if (m.type === "shanghai") {
      const p = st.players[idx];
      out.shanghai.games++;
      if (out.shanghai.best === null || p.score > out.shanghai.best) out.shanghai.best = p.score;
    } else if (m.type === "checkout") {
      const c = out.checkout;
      c.games++; c.hits += st.hits; c.attempts += st.results.length;
      const pct = st.results.length ? (st.hits / st.results.length) * 100 : 0;
      if (c.bestPct === null || pct > c.bestPct) c.bestPct = pct;
    }
  }
  out.x01 = deriveX01(x);
  out.series = series;
  out.cricket.mpr = out.cricket.darts ? (out.cricket.marks / out.cricket.darts) * 3 : 0;
  return out;
}

export const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "–");
