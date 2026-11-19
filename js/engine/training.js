// Trainings-Engines. Jede replay-Funktion bekommt (config, events) und liefert den Zustand.

// ---------- Around the Clock ----------
// Ereignisse: { t: "hit" } | { t: "miss" } — ein Dart auf das aktuelle Ziel
export function atcTargets(config) {
  const t = Array.from({ length: 20 }, (_, i) => i + 1);
  if (config.bull !== false) t.push(25);
  return t;
}

export function replayATC(config, events) {
  const targets = atcTargets(config);
  const st = {
    targets,
    players: config.players.map(() => ({ idx: 0, darts: 0, hits: 0 })),
    current: 0, dartInTurn: 0, finished: false, winner: null,
  };
  for (const ev of events) {
    if (st.finished) break;
    const p = st.players[st.current];
    p.darts++;
    st.dartInTurn++;
    if (ev.t === "hit") {
      p.hits++;
      p.idx++;
      if (p.idx >= targets.length) { st.finished = true; st.winner = st.current; break; }
    }
    if (st.dartInTurn >= 3) { st.dartInTurn = 0; st.current = (st.current + 1) % st.players.length; }
  }
  return st;
}

// ---------- Bob's 27 ----------
// Ereignisse: { t: "r", hits: 0–3 } — eine Runde (3 Darts) auf das aktuelle Doppel
export const BOBS_TARGETS = [...Array.from({ length: 20 }, (_, i) => i + 1), 25];

export function replayBobs(config, events) {
  const st = {
    players: config.players.map(() => ({ score: 27, round: 0, out: false, hits: 0, darts: 0, history: [] })),
    current: 0, finished: false, winner: null,
  };
  const active = () => st.players.map((p, i) => i).filter((i) => !st.players[i].out && st.players[i].round < BOBS_TARGETS.length);
  for (const ev of events) {
    if (st.finished) break;
    const p = st.players[st.current];
    const n = BOBS_TARGETS[p.round];
    const dbl = n * 2;
    const delta = ev.hits > 0 ? ev.hits * dbl : -dbl;
    p.score += delta;
    p.hits += ev.hits;
    p.darts += 3;
    p.history.push({ target: n, hits: ev.hits, delta, score: p.score });
    p.round++;
    if (p.score < 0) p.out = true;
    const left = active();
    if (!left.length) { st.finished = true; break; }
    let next = st.current;
    do { next = (next + 1) % st.players.length; } while (!left.includes(next));
    st.current = next;
  }
  if (st.finished) {
    let best = -Infinity;
    st.players.forEach((p, i) => { const s = p.out ? -1000 + p.round : p.score; if (s > best) { best = s; st.winner = i; } });
  }
  return st;
}

// ---------- Shanghai ----------
// Ereignisse: { t: "d", m: 0–3 } — Treffer-Multiplikator auf die Rundenzahl
export function replayShanghai(config, events) {
  const rounds = config.rounds || 7;
  const st = {
    rounds,
    players: config.players.map(() => ({ score: 0, darts: 0, perRound: [] })),
    current: 0, round: 1, turn: [], finished: false, winner: null, shanghai: false,
  };
  for (const ev of events) {
    if (st.finished) break;
    const p = st.players[st.current];
    p.darts++;
    p.score += ev.m * st.round;
    st.turn.push(ev.m);
    if (st.turn.length >= 3) {
      p.perRound.push(st.turn.reduce((a, m) => a + m * st.round, 0));
      if ([1, 2, 3].every((m) => st.turn.includes(m))) {
        st.finished = true; st.winner = st.current; st.shanghai = true; break;
      }
      st.turn = [];
      st.current = (st.current + 1) % st.players.length;
      if (st.current === 0) {
        st.round++;
        if (st.round > rounds) st.finished = true;
      }
    }
  }
  if (st.finished && st.winner === null) {
    let best = -1;
    st.players.forEach((p, i) => { if (p.score > best) { best = p.score; st.winner = i; } });
  }
  return st;
}

// ---------- Checkout-Training ----------
// config.targets wird beim Anlegen erzeugt. Ereignisse: { t: "r", ok: bool, n: Darts }
export function makeCheckoutTargets(min, max, count, rnd = Math.random) {
  const bogey = new Set([169, 168, 166, 165, 163, 162, 159]);
  const pool = [];
  for (let s = Math.max(2, min); s <= Math.min(170, max); s++) if (!bogey.has(s)) pool.push(s);
  return Array.from({ length: count }, () => pool[Math.floor(rnd() * pool.length)]);
}

export function replayCheckout(config, events) {
  const st = { targets: config.targets, idx: 0, results: [], finished: false, hits: 0, darts: 0 };
  for (const ev of events) {
    if (st.finished) break;
    st.results.push({ target: st.targets[st.idx], ok: !!ev.ok, n: ev.n || config.darts });
    if (ev.ok) st.hits++;
    st.darts += ev.n || config.darts;
    st.idx++;
    if (st.idx >= st.targets.length) st.finished = true;
  }
  st.winner = st.finished ? 0 : null;
  return st;
}
