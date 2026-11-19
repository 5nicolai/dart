// Schlanker SVG-Linienchart mit Fadenkreuz und Antipp-Anzeige (eine Y-Achse)
import { h } from "../dom.js";

const NS = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

/**
 * series: [{ name, color, values: number[] }], xLabels: string[] (gleiche Länge)
 */
export function lineChart(series, xLabels, { height = 190, decimals = 1 } = {}) {
  const W = 340, H = height, pl = 34, pr = 40, pt = 12, pb = 22;
  const all = series.flatMap((x) => x.values).filter(Number.isFinite);
  const n = xLabels.length;
  let lo = Math.min(...all), hi = Math.max(...all);
  const pad = Math.max(2, (hi - lo) * 0.15);
  lo = Math.max(0, Math.floor((lo - pad) / 5) * 5);
  hi = Math.ceil((hi + pad) / 5) * 5;
  const x = (i) => pl + (n === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1));
  const y = (v) => pt + (1 - (v - lo) / (hi - lo || 1)) * (H - pt - pb);

  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": series.map((x) => x.name).join(" und ") + " pro Spiel" });
  // Raster (zurückhaltend)
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = lo + ((hi - lo) * i) / ticks;
    svg.append(s("line", { x1: pl, x2: W - pr, y1: y(v), y2: y(v), stroke: "#334155", "stroke-width": i === 0 ? 1 : 0.5 }));
    const t = s("text", { x: pl - 6, y: y(v) + 3, "text-anchor": "end" });
    t.textContent = Math.round(v);
    svg.append(t);
  }
  // X-Beschriftung: erstes und letztes Spiel
  [[0, "start"], [n - 1, "end"]].forEach(([i, anchor]) => {
    if (n < 2 && i > 0) return;
    const t = s("text", { x: x(i), y: H - 6, "text-anchor": n === 1 ? "middle" : anchor });
    t.textContent = xLabels[i];
    svg.append(t);
  });
  // Linien + Punkte + Direktlabel am Ende
  for (const ser of series) {
    const pts = ser.values.map((v, i) => [x(i), y(v)]);
    svg.append(s("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(""), fill: "none", stroke: ser.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    if (n <= 30) pts.forEach((p) => svg.append(s("circle", { cx: p[0], cy: p[1], r: 3, fill: ser.color, stroke: "#1e293b", "stroke-width": 2 })));
    const last = pts[pts.length - 1];
    const lbl = s("text", { x: last[0] + 6, y: last[1] + 3, style: "fill:#cbd5e1;font-weight:700" });
    lbl.textContent = ser.values[ser.values.length - 1].toFixed(decimals);
    svg.append(lbl);
  }
  // Fadenkreuz
  const cross = s("line", { y1: pt, y2: H - pb, stroke: "#94a3b8", "stroke-width": 1, "stroke-dasharray": "3 3", visibility: "hidden" });
  svg.append(cross);
  const readout = h("div", { class: "small muted", style: { minHeight: "1.3em", marginTop: "4px" } }, "Antippen für Werte");
  const pick = (ev) => {
    const r = svg.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * W;
    let best = 0;
    for (let i = 1; i < n; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    cross.setAttribute("x1", x(best)); cross.setAttribute("x2", x(best)); cross.setAttribute("visibility", "visible");
    readout.replaceChildren(h("b", { style: { color: "var(--text)" } }, xLabels[best]), "  ",
      ...series.flatMap((ser) => [h("span", { style: { color: ser.color } }, "● "), `${ser.name} ${ser.values[best].toFixed(decimals)}   `]));
  };
  svg.addEventListener("pointerdown", pick);
  svg.addEventListener("pointermove", (e) => { if (e.buttons || e.pointerType === "mouse") pick(e); });

  const legend = series.length > 1 && h("div", { class: "legend" }, series.map((ser) => h("span", null, h("i", { style: { background: ser.color } }), ser.name)));
  return h("div", null, svg, legend, readout);
}
