// X01-Engine: der Zustand entsteht immer durch Abspielen aller Ereignisse.
// Ereignisse:
//   { t: "d", s, m }          ein einzelner Dart
//   { t: "v", v, n?, dd? }    eine ganze Aufnahme (v = Punkte, n = Darts beim Finish, dd = Darts aufs Doppel)
import { value, isValidFinisher, isValidOpener } from "./darts.js";
import { isFinishable } from "./checkout.js";

export const DEFAULT_X01 = {
  start: 501,
  inMode: "single",
  outMode: "double",
  format: "firstto",
  legs: 1,
  sets: 1,
};

export const neededToWin = (format, n) => (format === "bestof" ? Math.floor(n / 2) + 1 : n);

function newLeg(st) {
  const { config } = st;
  st.players.forEach((p) => {
    p.remaining = config.start;
    p.opened = config.inMode === "single";
  });
  st.current = st.legStarter;
  st.legsLog.push({ set: st.setNo, leg: st.legNo, starter: st.legStarter, winner: null, turns: [] });
  st.turn = null;
}

export function createState(config) {
  const st = {
    config,
    players: config.players.map(() => ({ remaining: config.start, opened: true, legs: 0, sets: 0 })),
    current: 0,
    legStarter: 0,
    setStarter: 0,
    setNo: 1,
    legNo: 1,
    turn: null,
    legsLog: [],
    finished: false,
    winner: null,
    lastTurn: null,
  };
  newLeg(st);
  return st;
}

const curLeg = (st) => st.legsLog[st.legsLog.length - 1];

function startTurn(st) {
  const p = st.players[st.current];
  st.turn = { p: st.current, before: p.remaining, darts: [], dd: 0, opened: p.opened };
  return st.turn;
}

function finishTurn(st, { bust = false, checkout = false, dartsCount, dd }) {
  const p = st.players[st.current];
  const t = st.turn;
  if (bust) {
    p.remaining = t.before;
    p.opened = t.opened;
  }
  const record = {
    p: st.current,
    before: t.before,
    after: p.remaining,
    score: bust ? 0 : t.before - p.remaining,
    darts: dartsCount ?? t.darts.length,
    dd: dd ?? t.dd,
    bust,
    checkout,
    list: t.darts.length ? t.darts.map((d) => ({ s: d.s, m: d.m })) : undefined,
  };
  curLeg(st).turns.push(record);
  st.lastTurn = record;
  st.turn = null;

  if (checkout) {
    legWon(st, st.current);
  } else {
    st.current = (st.current + 1) % st.players.length;
  }
}

function legWon(st, w) {
  const { config } = st;
  const n = st.players.length;
  curLeg(st).winner = w;
  const p = st.players[w];
  p.legs++;
  st.lastTurn.legWon = true;
  if (p.legs >= neededToWin(config.format, config.legs)) {
    if (config.sets > 1) {
      p.sets++;
      st.lastTurn.setWon = true;
      if (p.sets >= neededToWin(config.format, config.sets)) {
        st.finished = true;
        st.winner = w;
        return;
      }
      st.players.forEach((q) => (q.legs = 0));
      st.setNo++;
      st.setStarter = (st.setStarter + 1) % n;
      st.legStarter = st.setStarter;
    } else {
      st.finished = true;
      st.winner = w;
      return;
    }
  } else {
    st.legStarter = (st.legStarter + 1) % n;
  }
  st.legNo++;
  newLeg(st);
}

function applyDart(st, d) {
  const { inMode, outMode } = st.config;
  const p = st.players[st.current];
  const t = st.turn || startTurn(st);
  if (p.opened && outMode !== "single" ? isFinishable(p.remaining, 1, outMode) : false) t.dd++;
  t.darts.push(d);

  let scored = 0;
  if (p.opened) scored = value(d);
  else if (isValidOpener(d, inMode)) {
    p.opened = true;
    scored = value(d);
  }

  const rest = p.remaining - scored;
  if (rest < 0 || (rest === 1 && outMode !== "single") || (rest === 0 && !isValidFinisher(d, outMode))) {
    finishTurn(st, { bust: true });
  } else if (rest === 0) {
    p.remaining = 0;
    finishTurn(st, { checkout: true });
  } else {
    p.remaining = rest;
    if (t.darts.length >= 3) finishTurn(st, {});
  }
}

function applyVisit(st, ev) {
  const { outMode } = st.config;
  if (st.turn) finishTurn(st, {}); // angefangene Einzeldart-Aufnahme abschließen
  const p = st.players[st.current];
  startTurn(st);
  const v = ev.v;
  if (!p.opened && v > 0) p.opened = true;
  const rest = p.remaining - v;
  const n = ev.n || 3;
  if (rest < 0 || (rest === 1 && outMode !== "single") || (rest === 0 && !isFinishable(p.remaining, n, outMode))) {
    finishTurn(st, { bust: true, dartsCount: 3, dd: ev.dd || 0 });
  } else if (rest === 0) {
    p.remaining = 0;
    finishTurn(st, { checkout: true, dartsCount: n, dd: ev.dd || 1 });
  } else {
    p.remaining = rest;
    finishTurn(st, { dartsCount: 3, dd: ev.dd || 0 });
  }
}

export function replay(config, events) {
  const st = createState(config);
  for (const ev of events) {
    if (st.finished) break;
    if (ev.t === "d") applyDart(st, ev);
    else if (ev.t === "v") applyVisit(st, ev);
  }
  return st;
}

// Kann die Aufnahme v des aktuellen Spielers ein Finish sein?
export function visitWouldFinish(st, v) {
  const p = st.players[st.current];
  return p.remaining - v === 0 && isFinishable(p.remaining, 3, st.config.outMode);
}

// War vor der Aufnahme ein Finish möglich? (dann wird nach Darts aufs Doppel gefragt)
export function hadFinishChance(st) {
  const p = st.players[st.current];
  return p.opened && st.config.outMode !== "single" && isFinishable(p.remaining, 3, st.config.outMode);
}

// Minimale Darts, mit denen v als Finish möglich ist
export function minDartsForFinish(rest, outMode) {
  for (let n = 1; n <= 3; n++) if (isFinishable(rest, n, outMode)) return n;
  return null;
}
