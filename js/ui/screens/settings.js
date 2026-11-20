import { h, topbar, switchRow, seg, toast, confirmDialog, speak } from "../dom.js";
import { get, update, exportJSON, importJSON, resetAll } from "../../store.js";
import { updateApp } from "../../sw-update.js";

export function renderSettings(root) {
  const draw = () => {
    const s = get().settings;
    const set = (k, v) => { update((d) => { d.settings[k] = v; }); draw(); };
    const file = h("input", { type: "file", accept: "application/json,.json", class: "hidden", onchange: async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const text = await f.text();
        if (!(await confirmDialog("Sicherung laden?", "Alle aktuellen Daten werden durch die Sicherung ersetzt.", "Laden", true))) return;
        importJSON(text);
        toast("Sicherung geladen", "good");
        draw();
      } catch (err) {
        toast("Datei ungültig: " + err.message, "bust");
      }
    } });

    root.replaceChildren(
      topbar("Einstellungen"),
      h("section", { class: "card" }, h("h2", null, "Während des Spiels"),
        switchRow("Vibration", s.haptics, (v) => set("haptics", v), "Kurzes Feedback bei jedem Tipp"),
        switchRow("Score-Ansage", s.voice, (v) => { set("voice", v); if (v) setTimeout(() => speak("One hundred and eighty"), 50); }, "Caller-Ansage der Aufnahmen (Englisch)"),
        h("div", { class: "field", style: { marginTop: "8px" } }, h("label", null, "Pause bis zur Finish-Ansage"),
          seg([[0, "Aus"], [3, "3 s"], [5, "5 s"], [8, "8 s"], [10, "10 s"]], s.requireDelay ?? 5, (v) => set("requireDelay", v)),
          h("p", { class: "small muted" }, "Wartezeit nach der Score-Ansage, bevor „Name, you require …“ gesagt wird.")),
        switchRow("Bildschirm anlassen", s.wakeLock, (v) => set("wakeLock", v), "Verhindert, dass das Display im Spiel ausgeht"),
        h("div", { class: "field", style: { marginTop: "8px" } }, h("label", null, "Standard-Eingabe bei X01"),
          seg([["visit", "Aufnahme (Summe)"], ["dart", "Einzeldart"]], s.inputMode, (v) => set("inputMode", v))),
      ),
      h("section", { class: "card stack" }, h("h2", null, "App"),
        h("p", { class: "small muted" }, "Lädt die neueste Version der Web-App. Deine Daten bleiben erhalten."),
        h("button", { class: "btn block", onclick: async (e) => {
          const btn = e.currentTarget;
          btn.disabled = true; btn.textContent = "Suche Update…";
          if (!(await updateApp())) { btn.disabled = false; btn.textContent = "⟳ App aktualisieren"; }
        } }, "⟳ App aktualisieren"),
      ),
      h("section", { class: "card stack" }, h("h2", null, "Daten"),
        h("p", { class: "small muted" }, "Alle Daten liegen nur auf diesem Gerät im Browser. Erstelle ab und zu eine Sicherung."),
        h("button", { class: "btn block", onclick: () => {
          const blob = new Blob([exportJSON()], { type: "application/json" });
          const a = h("a", { href: URL.createObjectURL(blob), download: `dart-pro-backup-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.append(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          toast("Sicherung exportiert", "good");
        } }, "⬇ Sicherung exportieren"),
        h("button", { class: "btn block", onclick: () => file.click() }, "⬆ Sicherung importieren"),
        file,
        h("button", { class: "btn block danger", onclick: async () => {
          if (await confirmDialog("Alles löschen?", "Spieler, Spiele, Statistik und Einstellungen werden unwiderruflich gelöscht.", "Alles löschen", true)) {
            resetAll(); toast("Alle Daten gelöscht"); draw();
          }
        } }, "Alle Daten löschen"),
      ),
      h("p", { class: "small muted center" }, `Dart Pro · ${get().matches.length} Spiele gespeichert`),
    );
  };
  draw();
}
