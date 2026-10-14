/**
 * ORBITAL DEFENSE — RUNTIME CONTRACT
 * ===================================
 * Shapes of live simulation state (read by render/ui) and the Simulation command API
 * (called by the app/ui layer). The simulation is pure TypeScript: no DOM, no three.js,
 * fully deterministic for a given seed + command sequence, steppable headlessly
 * (unit tests, balance simulator in tools/simulate.ts).
 *
 * Hot-loop rule: entities are pooled and reused. Renderer/UI must treat every object
 * here as READ-ONLY and must not hold references to dead entities across frames
 * (check `alive` / compare `uid`).
 */
import type {
  AbilityDef, AttackDef, DifficultyId, EnemyDef, EnemyKind, HeroId, MapData, MinionDef,
  ProjectileDef, ProjectileVisual, RoundDef, TargetMode, TowerClass, TowerId, TowerStats, UpgradeDef,
} from '../data/types';

export type Vec2 = { x: number; y: number };
export type AnyTowerId = TowerId | HeroId;

// ─────────────────────────────────────────────────────────────────────────────
// Entities
// ─────────────────────────────────────────────────────────────────────────────

export interface DotState {
  id: string;
  damage: number;
  interval: number;
  timer: number;           // time until next tick
  remaining: number;       // seconds left
  damageType: import('../data/types').DamageType;
  persistOnPop: boolean;
  sourceTowerUid: number;
}

export interface Enemy {
  uid: number;
  alive: boolean;
  kind: EnemyKind;
  def: EnemyDef;
  hp: number;
  maxHp: number;
  /** Index into map.paths and distance travelled along it (units). */
  pathIndex: number;
  dist: number;
  /** Cached world position + heading (radians, atan2(dy, dx)) updated every tick. */
  x: number;
  y: number;
  heading: number;
  /** Current speed in units/s after slows/freezes (0 when frozen/stunned). */
  speed: number;
  cloaked: boolean;
  regen: boolean;
  fortified: boolean;
  /** Regen ceiling (kind it originally spawned as) and countdown to next regrowth. */
  regenCeiling: EnemyKind;
  regenTimer: number;
  // Status
  slowMult: number;
  slowTimer: number;
  slowId: string;
  slowPersist: boolean;
  freezeTimer: number;
  stunTimer: number;
  shred: number;
  shredTimer: number;
  dots: DotState[];
  transmuteCash: number;
  transmuteTimer: number;
  /** Remaining Body Equivalent (lives lost if it leaks). */
  rbe: number;
  /** Ships & Shellbacks: 0 = pristine … 3 = heavily damaged (75/50/25% HP thresholds). */
  damageStage: number;
  /** Seconds since last damaged (renderer flash). */
  hitFlash: number;
  /** Monotonic spawn order (stable tie-breaks). */
  spawnSeq: number;
}

export interface Projectile {
  uid: number;
  alive: boolean;
  def: ProjectileDef;
  ownerUid: number;          // tower or minion uid
  attackId: string;
  x: number;
  y: number;
  /** Visual height above ground (arc projectiles, orbiters). */
  z: number;
  vx: number;
  vy: number;
  heading: number;
  speed: number;
  damage: number;            // effective damage after buffs
  pierceLeft: number;
  radius: number;
  age: number;
  lifetime: number;
  traveled: number;
  maxDistance: number;
  targetUid: number;         // homing / boomerang target (-1 none)
  /** Boomerang/orbit/arc helpers. */
  originX: number;
  originY: number;
  phase: number;
  returning: boolean;
  targetX: number;
  targetY: number;
  /** Track walkers. */
  pathIndex: number;
  pathDist: number;
  /** Uids already hit (pierce never hits the same enemy twice). */
  hitUids: number[];
  camo: boolean;
  isCrit: boolean;
  visual: ProjectileVisual;
  color: string;
  scale: number;
  depth: number;             // recursion depth for onExpire/onImpact children
}

export interface TowerPoints {
  reticle?: Vec2;            // Missile Silo target
  patrolA?: Vec2;            // Gunship patrol
  patrolB?: Vec2;
  lockPos?: Vec2;            // Gunship lock-in-place position
  lockDir?: number;          // Gatling lock direction (radians)
}

export interface ActiveBuff {
  sourceUid: number;         // tower or ability uid
  buff: import('../data/types').TowerBuff;
  remaining: number;         // Infinity for auras (recomputed every tick)
}

export interface AbilityInstance {
  uid: number;
  towerUid: number;
  def: AbilityDef;
  cooldownLeft: number;
  activeLeft: number;        // > 0 while a timed effect is running
}

export interface Tower {
  uid: number;
  alive: boolean;
  defId: AnyTowerId;
  isHero: boolean;
  name: string;
  towerClass: TowerClass;
  /** Placement (base) position. */
  x: number;
  y: number;
  /** Current firing position (differs from x,y for gunship/interceptor). */
  posX: number;
  posY: number;
  /** Facing / aim angle in radians (atan2(dy, dx)). */
  angle: number;
  tiers: [number, number, number];
  /** Compiled stats (base + purchased upgrades / hero levels). Rebuilt on upgrade. */
  stats: TowerStats;
  /** Range after runtime buffs. */
  range: number;
  /** Cloak detection after runtime buffs. */
  camo: boolean;
  mode: TargetMode;
  points: TowerPoints;
  cooldowns: Record<string, number>;
  shotCounters: Record<string, number>;
  nextCrit: Record<string, number>;
  buffs: ActiveBuff[];
  abilityUids: number[];
  /** Total ₡ spent (placement + upgrades) — sell value = spent * sellRate. */
  spent: number;
  pops: number;
  damageDealt: number;
  cashGenerated: number;
  /** Hero only. */
  level: number;
  xp: number;
  /** Seconds since last attack (renderer plays attack anim when it resets). */
  sinceAttack: number;
  /** Bumped on every upgrade so renderer can swap model variants / play upgrade pop. */
  version: number;
  /** Renderer model variant key, e.g. 'base', 'p1t3', 'p2t5' (or hero 'l1','l7','l13','l20'). */
  variant: string;
  /** Bank (Mining Rig) stored cash. */
  bank: number;
  /** Copied attacks while a copy ability is active (Vexx). */
  copiedAttacks: AttackDef[] | null;
}

export interface Minion {
  uid: number;
  alive: boolean;
  towerUid: number;
  def: MinionDef;
  x: number;
  y: number;
  angle: number;
  lifeLeft: number;
  cooldowns: Record<string, number>;
  phase: number;
  pathIndex: number;
  pathDist: number;
}

export interface Crystal {
  uid: number;
  alive: boolean;
  towerUid: number;
  x: number;
  y: number;
  value: number;
  age: number;
  auto: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Events (drained once per rendered frame; consumed by renderer, audio, UI)
// ─────────────────────────────────────────────────────────────────────────────

export type SimEvent =
  | { t: 'pop'; kind: EnemyKind; x: number; y: number; cloaked: boolean }
  | { t: 'immune'; x: number; y: number }
  | { t: 'shellCrack'; uid: number; kind: EnemyKind; stage: number; x: number; y: number }
  | { t: 'shipDestroyed'; kind: EnemyKind; x: number; y: number }
  | { t: 'leak'; kind: EnemyKind; lives: number; x: number; y: number }
  | { t: 'explosion'; x: number; y: number; radius: number; visual: string }
  | { t: 'fire'; towerUid: number; attackId: string; x: number; y: number; angle: number }
  | { t: 'beam'; x1: number; y1: number; x2: number; y2: number; visual: ProjectileVisual; color: string }
  | { t: 'chain'; points: [number, number][]; color: string }
  | { t: 'pulse'; x: number; y: number; radius: number; visual: string; color: string }
  | { t: 'damageNumber'; x: number; y: number; amount: number; crit: boolean }
  | { t: 'effect'; kind: 'freeze' | 'stun' | 'slow' | 'stripCloak' | 'stripRegen' | 'stripFortify' | 'transmute'; x: number; y: number }
  | { t: 'ability'; towerUid: number; abilityId: string; name: string; x: number; y: number }
  | { t: 'roundStart'; round: number; announce?: string }
  | { t: 'roundEnd'; round: number; bonus: number }
  | { t: 'cash'; amount: number; x?: number; y?: number }
  | { t: 'lives'; amount: number }
  | { t: 'towerPlaced'; towerUid: number; defId: AnyTowerId; x: number; y: number }
  | { t: 'towerUpgraded'; towerUid: number; path: number; tier: number; variant: string }
  | { t: 'towerSold'; towerUid: number; x: number; y: number; value: number }
  | { t: 'heroLevel'; towerUid: number; level: number }
  | { t: 'crystalDrop'; uid: number; x: number; y: number; value: number }
  | { t: 'crystalCollect'; uid: number; x: number; y: number; value: number }
  | { t: 'announce'; text: string; style: 'info' | 'warning' | 'boss' }
  | { t: 'gameOver'; victory: boolean; round: number };

// ─────────────────────────────────────────────────────────────────────────────
// Commands / queries
// ─────────────────────────────────────────────────────────────────────────────

export interface PlaceCheck {
  ok: boolean;
  /** Human-readable reason when !ok: "Can't place on the path", "Void only", "Not enough ₡"… */
  reason?: string;
  cost: number;
}

export type UpgradeStatus = 'available' | 'unaffordable' | 'locked' | 'maxed';

export interface UpgradeOption {
  path: 0 | 1 | 2;
  /** Tiers already owned on this path (0..5). */
  owned: number;
  next: UpgradeDef | null;
  /** Price after difficulty multiplier + discounts. */
  cost: number;
  status: UpgradeStatus;
  /** e.g. "Crosspath limit", "Another Pulse Gunner owns this", "Max tier". */
  lockReason?: string;
}

export interface SimConfig {
  map: MapData;
  difficulty: DifficultyId;
  heroId?: HeroId | null;
  seed?: number;
  /** Override round data (tests / balance sim). Defaults to data/waves.ts ROUNDS. */
  rounds?: RoundDef[];
  /** Override start cash / lives (sandbox, tests). */
  startCash?: number;
  startLives?: number;
  /** Continue into freeplay after the final round instead of ending. */
  freeplay?: boolean;
}

export interface SimStats {
  pops: number;
  leaks: number;
  livesLost: number;
  cashEarned: number;
  towersPlaced: number;
}

export interface SimState {
  readonly config: SimConfig;
  readonly map: MapData;
  time: number;
  tick: number;
  /** Current round number (1-based). Before the first start this is 0. */
  round: number;
  roundActive: boolean;
  /** Seconds elapsed in the current round. */
  roundTime: number;
  finalRound: number;
  freeplay: boolean;
  autoStart: boolean;
  cash: number;
  lives: number;
  gameOver: null | 'victory' | 'defeat';
  enemies: Enemy[];
  projectiles: Projectile[];
  towers: Tower[];
  minions: Minion[];
  crystals: Crystal[];
  abilities: AbilityInstance[];
  heroUid: number;           // -1 if no hero placed
  pointer: Vec2 | null;
  stats: SimStats;
}

export interface Simulation {
  readonly state: SimState;
  /** Advance exactly one fixed tick (TICK_DT). */
  step(): void;
  /** Return and clear events produced since the last drain. */
  drainEvents(): SimEvent[];

  startRound(): boolean;
  setAutoStart(on: boolean): void;

  /** Price of a tower for this difficulty at (x,y) (discount auras apply when x,y given). */
  towerPrice(id: AnyTowerId, x?: number, y?: number): number;
  canPlace(id: AnyTowerId, x: number, y: number): PlaceCheck;
  placeTower(id: AnyTowerId, x: number, y: number): Tower | null;
  getTower(uid: number): Tower | null;
  /** Tower whose footprint contains (x,y), if any. */
  towerAt(x: number, y: number): Tower | null;

  getUpgradeOptions(uid: number): UpgradeOption[];
  buyUpgrade(uid: number, path: 0 | 1 | 2): boolean;
  sellValue(uid: number): number;
  sellTower(uid: number): number;

  cycleTargetMode(uid: number, dir: 1 | -1): TargetMode;
  /** Tower-specific point inputs (reticle, patrol, lock). */
  setTowerPoint(uid: number, slot: keyof TowerPoints, x: number, y: number): void;
  /** Which point slots the tower needs right now, given its mode (UI shows "Set target" etc.). */
  pointSlots(uid: number): (keyof TowerPoints)[];

  activateAbility(abilityUid: number): boolean;
  /** Pointer in sim coords (for Gatling cursor aim, Gunship follow), or null when off-canvas. */
  setPointer(p: Vec2 | null): void;
  /** Collect a crystal pickup near (x,y). Returns ₡ collected. */
  collectAt(x: number, y: number): number;
}
