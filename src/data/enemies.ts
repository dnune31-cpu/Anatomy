/**
 * THE SWARM — enemy definitions.
 * Layers pop into their children exactly like a layered-balloon hierarchy;
 * motherships (ships) have large HP pools and release children on destruction.
 */
import type { EnemyDef, EnemyKind, EnemyMods, LayerKind, ShipKind } from './types';
import { IMMUNITY } from './immunity';

export const LAYER_ORDER: LayerKind[] = [
  'spark', 'glide', 'dart', 'comet', 'flare', 'shade', 'frost', 'psi', 'plated', 'twin', 'prism', 'shellback',
];
export const SHIP_ORDER: ShipKind[] = ['carrier', 'phantom', 'battlecruiser', 'dreadnought', 'titan'];
export const ENEMY_ORDER: EnemyKind[] = [...LAYER_ORDER, ...SHIP_ORDER];

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  spark:     { kind: 'spark',     name: 'Spark Drone',  rank: 0, isShip: false, speed: 1.0, hp: 1,  children: [],                                   immune: IMMUNITY.spark,     radius: 3.0, color: '#ff4d4d', model: 'enemy__spark',     regrowsTo: 'glide' },
  glide:     { kind: 'glide',     name: 'Glide Drone',  rank: 1, isShip: false, speed: 1.4, hp: 1,  children: [{ kind: 'spark', count: 1 }],      immune: IMMUNITY.glide,     radius: 3.1, color: '#3a8bff', model: 'enemy__glide',     regrowsTo: 'dart' },
  dart:      { kind: 'dart',      name: 'Dart Drone',   rank: 2, isShip: false, speed: 1.8, hp: 1,  children: [{ kind: 'glide', count: 1 }],      immune: IMMUNITY.dart,      radius: 3.2, color: '#4cd964', model: 'enemy__dart',      regrowsTo: 'comet' },
  comet:     { kind: 'comet',     name: 'Comet Drone',  rank: 3, isShip: false, speed: 3.2, hp: 1,  children: [{ kind: 'dart', count: 1 }],       immune: IMMUNITY.comet,     radius: 3.2, color: '#ffd23f', model: 'enemy__comet',     regrowsTo: 'flare' },
  flare:     { kind: 'flare',     name: 'Flare Drone',  rank: 4, isShip: false, speed: 3.5, hp: 1,  children: [{ kind: 'comet', count: 1 }],      immune: IMMUNITY.flare,     radius: 3.3, color: '#ff6fb5', model: 'enemy__flare',     regrowsTo: 'shade' },
  shade:     { kind: 'shade',     name: 'Shade Drone',  rank: 5, isShip: false, speed: 1.8, hp: 1,  children: [{ kind: 'flare', count: 2 }],      immune: IMMUNITY.shade,     radius: 2.8, color: '#2b2540', model: 'enemy__shade',     regrowsTo: 'twin' },
  frost:     { kind: 'frost',     name: 'Frost Drone',  rank: 5, isShip: false, speed: 2.0, hp: 1,  children: [{ kind: 'flare', count: 2 }],      immune: IMMUNITY.frost,     radius: 2.8, color: '#eef6ff', model: 'enemy__frost',     regrowsTo: 'twin' },
  psi:       { kind: 'psi',       name: 'Psi Drone',    rank: 5, isShip: false, speed: 3.0, hp: 1,  children: [{ kind: 'flare', count: 2 }],      immune: IMMUNITY.psi,       radius: 2.8, color: '#a64dff', model: 'enemy__psi' },
  plated:    { kind: 'plated',    name: 'Plated Drone', rank: 6, isShip: false, speed: 1.0, hp: 1,  children: [{ kind: 'shade', count: 2 }],      immune: IMMUNITY.plated,    radius: 3.4, color: '#8a93a3', model: 'enemy__plated' },
  twin:      { kind: 'twin',      name: 'Twin Drone',   rank: 7, isShip: false, speed: 1.8, hp: 1,  children: [{ kind: 'shade', count: 1 }, { kind: 'frost', count: 1 }], immune: IMMUNITY.twin, radius: 3.3, color: '#d9d9d9', model: 'enemy__twin', regrowsTo: 'prism' },
  prism:     { kind: 'prism',     name: 'Prism Drone',  rank: 8, isShip: false, speed: 2.2, hp: 1,  children: [{ kind: 'twin', count: 2 }],       immune: IMMUNITY.prism,     radius: 3.5, color: '#ff9f1c', model: 'enemy__prism',     regrowsTo: 'shellback' },
  shellback: { kind: 'shellback', name: 'Shellback',    rank: 9, isShip: false, speed: 2.5, hp: 10, children: [{ kind: 'prism', count: 2 }],      immune: IMMUNITY.shellback, radius: 3.8, color: '#c46b3c', model: 'enemy__shellback' },

  carrier:       { kind: 'carrier',       name: 'Carrier',       rank: 10, isShip: true, speed: 1.0,  hp: 200,   children: [{ kind: 'shellback', count: 4 }], immune: IMMUNITY.carrier, radius: 10, color: '#4a90d9', model: 'ship__carrier' },
  phantom:       { kind: 'phantom',       name: 'Phantom Ship',  rank: 11, isShip: true, speed: 2.75, hp: 400,   children: [{ kind: 'shellback', count: 6, mods: { cloaked: true, regen: true } }], immune: IMMUNITY.phantom, innate: { cloaked: true }, radius: 9, color: '#1d1f26', model: 'ship__phantom' },
  battlecruiser: { kind: 'battlecruiser', name: 'Battlecruiser', rank: 12, isShip: true, speed: 0.25, hp: 700,   children: [{ kind: 'carrier', count: 4 }],   immune: IMMUNITY.battlecruiser, radius: 14, color: '#d63a3a', model: 'ship__battlecruiser' },
  dreadnought:   { kind: 'dreadnought',   name: 'Dreadnought',   rank: 13, isShip: true, speed: 0.18, hp: 4000,  children: [{ kind: 'battlecruiser', count: 4 }], immune: IMMUNITY.dreadnought, radius: 18, color: '#6bd13a', model: 'ship__dreadnought' },
  titan:         { kind: 'titan',         name: 'Hive Titan',    rank: 14, isShip: true, speed: 0.18, hp: 20000, children: [{ kind: 'dreadnought', count: 2 }, { kind: 'phantom', count: 3 }], immune: IMMUNITY.titan, ccImmune: true, radius: 24, color: '#b03adf', model: 'ship__titan' },
};

/** HP actually used at spawn for a given kind + modifiers (+ late-round HP scaling for ships/shellbacks). */
export function effectiveHp(kind: EnemyKind, mods: EnemyMods | undefined, hpScale = 1): number {
  const def = ENEMIES[kind];
  let hp = def.hp;
  const fortifiable = def.isShip || kind === 'plated' || kind === 'shellback';
  if (mods?.fortified && fortifiable) hp *= 2;
  if (def.isShip || kind === 'shellback') hp = Math.round(hp * hpScale);
  return hp;
}

/** Children inherit cloaked/regen/fortified from the parent (plus any forced child mods). */
export function childMods(parent: EnemyMods | undefined, forced?: EnemyMods): EnemyMods {
  return {
    cloaked: !!(parent?.cloaked || forced?.cloaked),
    regen: !!(parent?.regen || forced?.regen),
    fortified: !!(parent?.fortified || forced?.fortified),
  };
}

const rbeCache = new Map<string, number>();
/** Remaining Body Equivalent: total layers that must be popped (= lives lost on leak). */
export function rbe(kind: EnemyKind, mods?: EnemyMods, hpScale = 1): number {
  const key = `${kind}|${mods?.fortified ? 1 : 0}|${hpScale}`;
  const cached = rbeCache.get(key);
  if (cached !== undefined) return cached;
  const def = ENEMIES[kind];
  let total = effectiveHp(kind, mods, hpScale);
  for (const c of def.children) total += c.count * rbe(c.kind, childMods(mods, c.mods), hpScale);
  rbeCache.set(key, total);
  return total;
}

/**
 * Regen: the next kind a regen enemy grows into, given the kind it originally spawned as
 * (its ceiling). Returns undefined when it cannot regrow any further.
 */
export function nextRegrowKind(current: EnemyKind, ceiling: EnemyKind): EnemyKind | undefined {
  if (current === ceiling) return undefined;
  const cur = ENEMIES[current];
  const ceil = ENEMIES[ceiling];
  if (cur.isShip || ceil.isShip) return undefined;
  if (cur.rank >= ceil.rank) return undefined;
  const cand = cur.regrowsTo;
  if (!cand) return undefined;
  if (ENEMIES[cand].rank >= ceil.rank) return ceiling;
  return cand;
}
