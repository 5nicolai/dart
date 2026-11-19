// Cricket-Engine (Standard und Cut-Throat). Ereignisse: { t: "d", s, m }
export const CRICKET_NUMBERS = [20, 19, 18, 17, 16, 15, 25];

export function replayCricket(config, events) {
  const numbers = config.numbers || CRICKET_NUMBERS;
  const cut = config.variant === "cutthroat";
  const st = {
    config,
    numbers,
    players: config.players.map(() => ({ marks: Object.fromEntries(numbers.map((n) => [n, 0])), points: 0, darts: 0, effMarks: 0 })),
    current: 0,
    turn: [],
    turns: [],
    round: 1,
    finished: false,
    winner: null,
  };
  const closedByAll = (n) => st.players.every((p) => p.marks[n] >= 3);
  const allClosed = (p) => numbers.every((n) => p.marks[n] >= 3);

  for (const ev of events) {
    if (st.finished) break;
    if (ev.t !== "d") continue;
    const i = st.current;
    const p = st.players[i];
    p.darts++;
    let eff = 0;
    if (numbers.includes(ev.s)) {
      for (let h = 0; h < ev.m; h++) {
        if (p.marks[ev.s] < 3) { p.marks[ev.s]++; eff++; }
        else if (!closedByAll(ev.s)) {
          eff++;
          if (cut) st.players.forEach((q, j) => { if (j !== i && q.marks[ev.s] < 3) q.points += ev.s; });
          else p.points += ev.s;
        }
      }
    }
    p.effMarks += eff;
    st.turn.push({ s: ev.s, m: ev.m, eff });

    if (allClosed(p)) {
      const others = st.players.filter((_, j) => j !== i).map((q) => q.points);
      const okPts = others.length === 0 || (cut ? p.points <= Math.min(...others) : p.points >= Math.max(...others));
      if (okPts) {
        st.finished = true;
        st.winner = i;
        st.turns.push({ p: i, darts: st.turn, marks: st.turn.reduce((a, d) => a + d.eff, 0) });
        st.turn = [];
        break;
      }
    }
    if (st.turn.length >= 3) {
      st.turns.push({ p: i, darts: st.turn, marks: st.turn.reduce((a, d) => a + d.eff, 0) });
      st.turn = [];
      st.current = (i + 1) % st.players.length;
      if (st.current === 0) st.round++;
    }
  }
  return st;
}

export const mpr = (p) => (p.darts ? (p.effMarks / p.darts) * 3 : 0);
