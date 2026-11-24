import { test, eq, ok } from "./runner.js";
import { migrate, defaultData, DEFAULT_SETTINGS, REQUIRE_DELAYS, VOICE_VOLUMES } from "../js/store.js";

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

test("Store: Pause wird auf erlaubte Werte gerundet", () => {
  eq(REQUIRE_DELAYS, [0, 1, 2, 3, 6]);
  eq(migrate({ settings: {} }).settings.requireDelay, 3);
  eq(migrate({ settings: { requireDelay: 0 } }).settings.requireDelay, 0);
  eq(migrate({ settings: { requireDelay: 2 } }).settings.requireDelay, 2);
  eq(migrate({ settings: { requireDelay: 5 } }).settings.requireDelay, 6);
  eq(migrate({ settings: { requireDelay: 10 } }).settings.requireDelay, 6);
  eq(migrate({ settings: { requireDelay: "x" } }).settings.requireDelay, 3);
});

test("Store: Lautstärke der Ansage", () => {
  eq(migrate({ settings: {} }).settings.voiceVolume, "high");
  eq(migrate({ settings: { voiceVolume: "low" } }).settings.voiceVolume, "low");
  eq(migrate({ settings: { voiceVolume: "egal" } }).settings.voiceVolume, "high");
  ok(VOICE_VOLUMES.low < VOICE_VOLUMES.mid && VOICE_VOLUMES.mid < VOICE_VOLUMES.high && VOICE_VOLUMES.high <= 1);
});
