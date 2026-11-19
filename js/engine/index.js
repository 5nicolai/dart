// Spieltypen an einer Stelle
import { replay as replayX01 } from "./x01.js";
import { replayCricket } from "./cricket.js";
import { replayATC, replayBobs, replayShanghai, replayCheckout } from "./training.js";

export const GAME_TYPES = {
  x01: { name: "X01", replay: replayX01 },
  cricket: { name: "Cricket", replay: replayCricket },
  atc: { name: "Around the Clock", replay: replayATC, training: true },
  bobs27: { name: "Bob's 27", replay: replayBobs, training: true },
  shanghai: { name: "Shanghai", replay: replayShanghai, training: true },
  checkout: { name: "Checkout-Training", replay: replayCheckout, training: true },
};

export function replayMatch(match) {
  return GAME_TYPES[match.type].replay(match.config, match.events);
}
