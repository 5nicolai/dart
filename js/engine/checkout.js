// Finish-Rechner: sucht den besten Weg mit möglichst wenig Darts.
// Bei gleicher Dart-Anzahl entscheiden Vorlieben (D20/D16, T20/T19, Singles zum Stellen).
import { ALL_TARGETS, BULL, value, isValidFinisher, label } from "./darts.js";

const DOUBLE_ORDER = [20, 16, 18, 12, 10, 8, 14, 6, 4, 19, 17, 15, 13, 11, 9, 7, 5, 3, 2, 1];

function finisherCost(d) {
  if (d.s === BULL) return d.m === 2 ? 6 : 8;
  if (d.m === 2) {
    const i = DOUBLE_ORDER.indexOf(d.s);
    return i < 2 ? i * 0.3 : i < 6 ? 0.4 + i * 0.2 : 2 + i * 0.15;
  }
  if (d.m === 3) return 3 + (20 - d.s) * 0.05;
  return 1 + (20 - d.s) * 0.05;
}

function setupCost(d) {
  if (d.s === BULL) return d.m === 2 ? 5 : 4;
  if (d.m === 1) return (20 - d.s) * 0.05;
  if (d.m === 3) return d.s === 20 ? 0.5 : d.s === 19 ? 1 : 2 + (20 - d.s) * 0.15;
  return 4 + (20 - d.s) * 0.05;
}

const cache = new Map();

/**
 * @param {number} score Rest
 * @param {number} dartsLeft 1–3
 * @param {"double"|"master"|"single"} outMode
 * @returns {Array<{s:number,m:number}>|null}
 */
export function checkout(score, dartsLeft = 3, outMode = "double") {
  if (!Number.isInteger(score) || score <= 0 || score > 180 || dartsLeft < 1) return null;
  const key = `${score}|${dartsLeft}|${outMode}`;
  if (cache.has(key)) return cache.get(key);

  const finishers = ALL_TARGETS.filter((d) => isValidFinisher(d, outMode));
  let result = null;

  for (let n = 1; n <= Math.min(3, dartsLeft) && !result; n++) {
    let best = null;
    let bestCost = Infinity;
    const consider = (route) => {
      const c = finisherCost(route[route.length - 1]) + route.slice(0, -1).reduce((a, d) => a + setupCost(d), 0);
      if (c < bestCost) { bestCost = c; best = route; }
    };
    for (const f of finishers) {
      const rest = score - value(f);
      if (n === 1) {
        if (rest === 0) consider([f]);
      } else if (n === 2) {
        if (rest <= 0) continue;
        for (const a of ALL_TARGETS) if (value(a) === rest) consider([a, f]);
      } else {
        if (rest <= 1) continue;
        for (let i = 0; i < ALL_TARGETS.length; i++) {
          const a = ALL_TARGETS[i];
          const ra = rest - value(a);
          if (ra <= 0) continue;
          for (let j = i; j < ALL_TARGETS.length; j++) {
            const b = ALL_TARGETS[j];
            if (value(b) !== ra) continue;
            const [x, y] = setupCost(a) <= setupCost(b) ? [a, b] : [b, a];
            consider([x, y, f]);
          }
        }
      }
    }
    result = best;
  }

  cache.set(key, result);
  return result;
}

export function isFinishable(score, dartsLeft = 3, outMode = "double") {
  return checkout(score, dartsLeft, outMode) !== null;
}

export function routeLabel(route) {
  return route ? route.map(label).join(" ") : "";
}
