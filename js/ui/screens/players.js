import { h, topbar, dialog, confirmDialog, playerDot } from "../dom.js";
import { get, update } from "../../store.js";
import { COLORS, addPlayer } from "../actions.js";

// Dialog zum Anlegen/Bearbeiten. Ergebnis: { name, color } oder null
export async function editPlayerDialog(player = null) {
  let color = player?.color || COLORS[get().players.length % COLORS.length];
  const input = h("input", { class: "text-input", type: "text", maxlength: "24", placeholder: "Name", value: player?.name || "", autocomplete: "off" });
  const colors = h("div", { class: "colors" });
  const drawColors = () => colors.replaceChildren(...COLORS.map((c) =>
    h("button", { class: c === color ? "on" : "", style: { background: c }, "aria-label": `Farbe ${c}`, onclick: () => { color = c; drawColors(); } })));
  drawColors();
  const body = h("div", { class: "stack" }, input, colors);
  setTimeout(() => input.focus(), 50);
  const res = await dialog({
    title: player ? "Spieler bearbeiten" : "Neuer Spieler",
    body,
    buttons: [{ label: "Abbrechen", value: null }, { label: "Speichern", cls: "primary", value: () => ({ name: input.value.trim(), color }) }],
  });
  if (!res || !res.name) return null;
  return res;
}

export async function createPlayerFlow() {
  const res = await editPlayerDialog();
  return res ? addPlayer(res.name, res.color) : null;
}

export function renderPlayers(root) {
  const draw = () => {
    const d = get();
    root.replaceChildren(
      topbar("Spieler", { right: [h("button", { class: "icon-btn on", onclick: async () => { if (await createPlayerFlow()) draw(); } }, "+ Neu")] }),
      d.players.length === 0
        ? h("div", { class: "empty" }, "Noch keine Spieler. Lege dein Profil an, damit deine Statistik gespeichert wird.")
        : h("div", { class: "list" }, d.players.map((p) =>
          h("div", { class: "list-item" },
            playerDot(p, 30),
            h("div", { class: "grow" }, h("div", { class: "title" }, p.name),
              h("div", { class: "meta" }, `${d.matches.filter((m) => m.finishedAt && m.config.players.some((q) => q.id === p.id)).length} Spiele`)),
            h("button", { class: "icon-btn", "aria-label": "Statistik", onclick: () => (location.hash = `#/stats/${p.id}`) }, "📈"),
            h("button", { class: "icon-btn", "aria-label": "Bearbeiten", onclick: async () => {
              const res = await editPlayerDialog(p);
              if (res) { update(() => { p.name = res.name.slice(0, 24); p.color = res.color; }); draw(); }
            } }, "✎"),
            h("button", { class: "icon-btn", "aria-label": "Löschen", onclick: async () => {
              if (await confirmDialog(`${p.name} löschen?`, "Das Profil wird entfernt. Gespeicherte Spiele bleiben im Verlauf erhalten.", "Löschen", true)) {
                update((dd) => { dd.players = dd.players.filter((q) => q.id !== p.id); });
                draw();
              }
            } }, "🗑")))),
      h("button", { class: "btn block", onclick: async () => { if (await createPlayerFlow()) draw(); } }, "+ Spieler hinzufügen"),
    );
  };
  draw();
}
