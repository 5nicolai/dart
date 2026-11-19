// Dart-Modell: { s: Segment (0 = Miss, 1–20, 25 = Bull-Ring), m: Multiplikator (1–3, Bull max 2) }

export const BULL = 25;

export function dart(s, m = 1) {
  if (s === 0) return { s: 0, m: 0 };
  if (s === BULL && m > 2) m = 2;
  return { s, m };
}

export const value = (d) => d.s * d.m;
export const isDouble = (d) => d.m === 2 && d.s > 0;
export const isTriple = (d) => d.m === 3 && d.s > 0;

export function label(d) {
  if (!d || d.s === 0) return "Miss";
  if (d.s === BULL) return d.m === 2 ? "Bull" : "25";
  return (d.m === 3 ? "T" : d.m === 2 ? "D" : "") + d.s;
}

// Alle sinnvollen Ziele auf der Scheibe
export const ALL_TARGETS = (() => {
  const list = [];
  for (let n = 1; n <= 20; n++) list.push(dart(n, 1), dart(n, 2), dart(n, 3));
  list.push(dart(BULL, 1), dart(BULL, 2));
  return list;
})();

// Werte, die mit 3 Darts nicht als Aufnahme möglich sind
export const IMPOSSIBLE_SCORES = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);

export function isValidTurnScore(v) {
  return Number.isInteger(v) && v >= 0 && v <= 180 && !IMPOSSIBLE_SCORES.has(v);
}

// Erfüllt der Dart die Out-Regel? (single | double | master)
export function isValidFinisher(d, outMode) {
  if (d.s === 0) return false;
  if (outMode === "double") return d.m === 2;
  if (outMode === "master") return d.m >= 2;
  return true;
}

// Erfüllt der Dart die In-Regel?
export function isValidOpener(d, inMode) {
  if (d.s === 0) return false;
  if (inMode === "double") return d.m === 2;
  if (inMode === "master") return d.m >= 2;
  return true;
}
