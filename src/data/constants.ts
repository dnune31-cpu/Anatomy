/** Global tunables. Balance knobs live here or in the per-entity data modules. */

/** Playfield size in world units (sim x ∈ [-W/2, W/2], y ∈ [-H/2, H/2]). */
export const WORLD_WIDTH = 300;
export const WORLD_HEIGHT = 225;

/** Fixed simulation rate. Fast-forward runs more ticks per rendered frame. */
export const TICK_RATE = 60;
export const TICK_DT = 1 / TICK_RATE;
export const FAST_FORWARD_MULT = 3;
/** Safety cap on simulation ticks per rendered frame (prevents spiral of death). */
export const MAX_TICKS_PER_FRAME = 12;

/** World units per second for an enemy with relative speed 1.0 (Spark Drone). */
export const BASE_ENEMY_SPEED = 30;

/** Children spawned from a popped enemy are spread ± this many units along the path. */
export const CHILD_SPREAD = 2.5;

/** Regen: seconds between regrowth steps. */
export const REGEN_INTERVAL = 1.0;

/** Spatial hash cell size for enemy queries. */
export const GRID_CELL = 16;

/** Default projectile collision radius. */
export const DEFAULT_PROJECTILE_RADIUS = 2;

/** Hero/tower defaults. */
export const DEFAULT_FOOTPRINT = 6;

/** Cash/economy */
export const SELL_RATE = 0.7;
export const PRICE_ROUNDING = 5;

/** Round a price to the nearest ₡5 (never below 5 unless base is 0). */
export function roundPrice(value: number): number {
  if (value <= 0) return 0;
  return Math.max(PRICE_ROUNDING, Math.round(value / PRICE_ROUNDING) * PRICE_ROUNDING);
}

/** Cash awarded per layer popped, by round (diminishing income). */
export function incomePerPop(round: number): number {
  if (round <= 50) return 1;
  if (round <= 60) return 0.5;
  if (round <= 85) return 0.2;
  if (round <= 100) return 0.1;
  return 0.05;
}

/** End-of-round bonus: ₡100 + round number. */
export function endOfRoundBonus(round: number): number {
  return 100 + round;
}

/**
 * Freeplay / late-game scaling (applies to rounds > 80, like the reference game's ramp).
 * Returns multipliers applied to enemy speed and to ship / Shellback HP at spawn.
 */
export function roundScaling(round: number): { speed: number; hp: number } {
  if (round <= 80) return { speed: 1, hp: 1 };
  let speed = 1;
  let hp = 1;
  if (round > 80) {
    const r = Math.min(round, 100) - 80;
    speed += 0.02 * r;
    hp += 0.02 * r;
  }
  if (round > 100) {
    const r = Math.min(round, 150) - 100;
    speed += 0.02 * r;
    hp += 0.05 * r;
  }
  if (round > 150) {
    const r = Math.min(round, 250) - 150;
    speed += 0.01 * r;
    hp += 0.15 * r;
  }
  if (round > 250) {
    const r = round - 250;
    hp += 0.35 * r;
  }
  return { speed, hp };
}
