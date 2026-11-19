import { test, eq, ok } from "./runner.js";
import { migrate, defaultData, DEFAULT_SETTINGS } from "../js/store.js";

test("Store: Migration aus leer/kaputt", () => {
  eq(migrate(null), defaultData());
  eq(migrate("x"), defaultData());
});

test("Store: Migration filtert ungültige Einträge und ergänzt Settings", () => {
  const d = migrate({
    players: [{ id: "1", name: "A" }, { name: "kaputt" }],
    matches: [{ id: "m", type: "x01", config: { players: [] }, events: [] }, { id: "x" }],
    activeId: "nicht-da",
    settings: { voice: true },
  });
  eq(d.players.length, 1);
  eq(d.matches.length, 1);
  eq(d.activeId, null);
  ok(d.settings.voice);
  eq(d.settings.haptics, DEFAULT_SETTINGS.haptics);
});
