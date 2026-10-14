/**
 * ORBITAL DEFENSE — DATA CONTRACT
 * ================================
 * Every static game definition (towers, upgrades, heroes, enemies, waves, maps,
 * difficulty) is plain data typed by this file. The simulation in `src/sim`
 * interprets this data; nothing here may import from sim/render/ui.
 *
 * Coordinate system (shared by sim, maps, renderer, Blender):
 *   - Sim space is 2D (x, y). x → right, y → DOWN the screen (toward the camera).
 *   - Sim (x, y)  ==  three.js world (X, Z)  ==  Blender (X, -Y).
 *   - The playfield is WORLD_WIDTH x WORLD_HEIGHT units, centred on the origin.
 *   - 1 Blender unit == 1 game unit. Distances, ranges and speeds are in units
 *     and units/second. Time is in seconds.
 *
 * Upgrade application order (IMPORTANT for data authors):
 *   compileTowerStats(base, tiers) applies purchased upgrades in two passes:
 *     Pass 1 (structural): every effect whose op is NOT 'add'/'mul' — i.e. 'set',
 *       addAttack, replaceAttack, patchAttack, removeAttack, addAbility, addAura,
 *       setIncome, addTargetModes, setMobility, ... — in order (tier asc, path asc).
 *     Pass 2 (numeric): every { op:'stat', mode:'add' | 'mul' } effect, in the same order.
 *   So a tier-1 "+1 pierce to all attacks" (attack:'*') stacks on top of whatever
 *   attacks a tier-5 upgrade on another path created. Use attack:'*' for generic
 *   crosspath bonuses and a specific attack id for targeted changes.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Identifiers
// ─────────────────────────────────────────────────────────────────────────────

export type TowerId =
  | 'pulse_gunner' | 'disc_thrower' | 'gravity_charge' | 'shard_spiker' | 'cryo_node' | 'acid_spitter'
  | 'railgun_sniper' | 'patrol_frigate' | 'interceptor' | 'gunship' | 'missile_silo' | 'gatling_mech'
  | 'psion_adept' | 'star_champion' | 'phase_assassin' | 'void_alchemist'
  | 'mining_rig' | 'spike_deployer' | 'comms_beacon' | 'engineer_unit';

export type HeroId = 'captain_nyra' | 'vexx';

export type TowerClass = 'primary' | 'military' | 'psionic' | 'support' | 'hero';

/** Standard layers (bloon-like) in rank order, then ships. */
export type LayerKind =
  | 'spark' | 'glide' | 'dart' | 'comet' | 'flare'
  | 'shade' | 'frost' | 'psi' | 'plated' | 'twin' | 'prism' | 'shellback';
export type ShipKind = 'carrier' | 'battlecruiser' | 'dreadnought' | 'phantom' | 'titan';
export type EnemyKind = LayerKind | ShipKind;

export type DamageType = 'sharp' | 'explosive' | 'cryo' | 'energy' | 'psionic' | 'normal';

/**
 * Tags used for damage multipliers / filters. 'ship' = any mothership-class enemy,
 * 'boss' = Hive Titan. 'shellback','plated' match those layers (incl. the Phantom
 * Ship which counts as 'plated' and 'shade' for immunities).
 */
export type EnemyTag =
  | 'ship' | 'boss' | 'shellback' | 'plated' | 'fortified' | 'cloaked' | 'regen'
  | 'frozen' | 'stunned' | 'slowed' | 'layer';

export type Placement = 'surface' | 'void' | 'any';

/**
 * Targeting / behaviour modes shown on the tower's targeting button (cycled with arrows).
 * Standard: first | last | close | strong.
 * Railgun Sniper: standard 4 (global range).          Missile Silo: reticle.
 * Gunship: lockInPlace | followTouch | pursuit | patrol (movement modes).
 * Interceptor: circle | loop | eight | centered (flight paths).
 * Gatling Mech: cursor | lockInPlace (aim modes).
 * Spike Deployer: normal | close | far | smart (trap placement).
 * Patrol Frigate: standard 4 (+ 'stealth' unlocked by an upgrade).
 */
export type TargetMode =
  | 'first' | 'last' | 'close' | 'strong'
  | 'reticle' | 'cursor' | 'lockInPlace' | 'followTouch' | 'pursuit' | 'patrol'
  | 'circle' | 'loop' | 'eight' | 'centered'
  | 'normal' | 'far' | 'smart'
  | 'stealth';

/** Priority used to pick an enemy among candidates. */
export type TargetPriority = 'first' | 'last' | 'close' | 'strong';

// ─────────────────────────────────────────────────────────────────────────────
// Status effects (applied to enemies on hit / by pulses / by abilities)
// ─────────────────────────────────────────────────────────────────────────────

interface EffectBase {
  /** Same-id effects don't stack: the stronger/longer one wins (refreshes duration). Defaults to kind. */
  id?: string;
  /** If false (default) ships are unaffected. */
  affectsShips?: boolean;
  /** Hive Titan is immune to stun/knockback/slow/freeze regardless of this flag. */
}

export type StatusEffect =
  /** Speed multiplier (0.5 = half speed). persistOnPop: children keep the slow (acid/goo). */
  | (EffectBase & { kind: 'slow'; mult: number; duration: number; persistOnPop?: boolean; shipMult?: number })
  /** Speed 0. Cryo-immune enemies (Frost, Twin) ignore it. Frozen layers are immune to 'sharp'
   *  damage unless the projectile has canHitFrozen. maxLayers: only freezes enemies whose rank
   *  is <= this LayerKind (undefined = all non-ship layers). */
  | (EffectBase & { kind: 'freeze'; duration: number; maxLayer?: LayerKind })
  /** Speed 0, not cryo. */
  | (EffectBase & { kind: 'stun'; duration: number })
  /** Damage over time (acid, fire). Ticks every `interval` s for `duration` s. */
  | (EffectBase & { kind: 'dot'; damage: number; interval: number; duration: number; damageType: DamageType; persistOnPop?: boolean })
  /** Pushes the enemy back along its path by `distance` units (ships use shipMult, default 0.25). */
  | (EffectBase & { kind: 'knockback'; distance: number; shipMult?: number })
  /** Enemy takes +extraDamage from every hit for `duration` s (armor shred / weaken). */
  | (EffectBase & { kind: 'shred'; extraDamage: number; duration: number })
  /** Permanently removes the modifier from the enemy (and its future children). */
  | (EffectBase & { kind: 'stripCloak' })
  | (EffectBase & { kind: 'stripRegen' })
  | (EffectBase & { kind: 'stripFortify' })
  /** Enemy (and children) yield +cashPerPop extra ₡ per layer popped while affected. */
  | (EffectBase & { kind: 'transmute'; cashPerPop: number; duration: number });

// ─────────────────────────────────────────────────────────────────────────────
// Projectiles & attacks
// ─────────────────────────────────────────────────────────────────────────────

/** How a projectile moves. */
export type ProjectileMotion =
  | 'straight'      // flies in a line at `speed` until lifetime/range ends
  | 'homing'        // steers toward a target (re-acquires when target dies)
  | 'boomerang'     // arcs out to the target and returns to the tower (Disc Thrower)
  | 'orbit'         // circles the tower at `orbitRadius` (blade storm etc.)
  | 'arc'           // lobbed to a fixed ground point, lands after flight time, then expires (mortar)
  | 'stationary'    // sits where spawned (traps, mines, puddles)
  | 'trackReverse'  // walks the enemy path backward from its spawn point (revived drones)
  | 'trackForward'; // rolls the enemy path forward (rare)

/** Visual hint for the renderer (it picks mesh/sprite/colour). */
export type ProjectileVisual =
  | 'bolt' | 'lance' | 'plasmaBall' | 'disc' | 'charge' | 'missile' | 'shard' | 'acid' | 'cryo'
  | 'rail' | 'laser' | 'orb' | 'fire' | 'star' | 'potion' | 'spike' | 'crystal' | 'bullet'
  | 'lightning' | 'wave' | 'drone' | 'blade' | 'beam' | 'none';

export interface SplashDef {
  radius: number;
  damage: number;
  pierce: number;            // max enemies hit by the explosion
  damageType: DamageType;
  effects?: StatusEffect[];
  mult?: Partial<Record<EnemyTag, number>>;
  visual?: 'explosion' | 'implosion' | 'cryoBurst' | 'acidSplash' | 'shockwave' | 'fireburst';
}

export interface SpawnOnEventDef {
  projectile: ProjectileDef;
  count: number;
  /** 'radial' spreads evenly over 360°, 'forward' fans around current heading. */
  pattern: 'radial' | 'forward';
  spreadDeg?: number;
}

export interface ProjectileDef {
  damage: number;
  /** Number of distinct enemies it can hit before expiring. Use 9999 for "infinite". */
  pierce: number;
  damageType: DamageType;
  speed: number;                 // units/s (ignored for stationary/orbit)
  /** Max travel distance for straight/homing. Default = attack range * 1.25. */
  maxDistance?: number;
  /** Seconds before it expires (default 3 for moving, 10 for stationary). */
  lifetime?: number;
  /** Collision radius (default 2). */
  radius?: number;
  motion?: ProjectileMotion;     // default 'straight'
  turnRate?: number;             // radians/s for homing (default 8)
  orbitRadius?: number;          // for 'orbit'
  /** On every hit, re-aim at the nearest un-hit enemy within range (ricochet). */
  bounce?: { range: number };
  /** On first impact, arc lightning to `count` more enemies within `range`. */
  chain?: { count: number; range: number; damageFalloff?: number };
  splash?: SplashDef;            // explosion on impact (and on expiry if explodeOnExpire)
  explodeOnExpire?: boolean;
  onImpact?: SpawnOnEventDef;    // spawn children when it hits something (cluster)
  onExpire?: SpawnOnEventDef;    // spawn children when it expires (split shots, recursive)
  effects?: StatusEffect[];      // applied to every enemy it damages
  mult?: Partial<Record<EnemyTag, number>>;  // damage multipliers vs tags (×4 vs shellback…)
  add?: Partial<Record<EnemyTag, number>>;   // flat bonus damage vs tags (applied before mult)
  canHitFrozen?: boolean;
  /** Ignore all damage-type immunities (like 'normal'). */
  ignoresImmunity?: boolean;
  /** Extra ₡ per layer popped by this projectile (Alchemist transmutation etc.). */
  cashPerPop?: number;
  visual: ProjectileVisual;
  color?: string;                // CSS hex; renderer default per visual
  scale?: number;                // visual scale multiplier (default 1)
}

export type AttackKind =
  | 'projectile'   // fire `count` projectiles at the target
  | 'hitscan'      // instant hit on the target (+ optional splash/chain). Visual is a beam/tracer.
  | 'pulse'        // radial burst centred on the tower affecting up to pierce enemies in `range`
  | 'trap'         // drops a stationary projectile onto the track at a point within range
  | 'spawn';       // creates a minion (sentry, phoenix…) with its own attacks

export interface CritDef {
  /** A crit happens every N shots, N uniformly random in [min,max]. */
  everyMin: number;
  everyMax: number;
  /** Crit shots deal this damage instead of the normal damage. */
  damage: number;
}

export interface MinionDef {
  id: string;
  name: string;
  /** How the minion moves. 'static' sits at a random free spot within the tower's range. */
  movement: 'static' | 'orbitTower' | 'roam' | 'trackReverse';
  speed?: number;
  orbitRadius?: number;
  lifetime: number;              // seconds; Infinity allowed for permanent
  maxCount: number;              // cap of alive minions from this source
  range: number;
  camo?: boolean;
  attacks: AttackDef[];
  model: string;                 // renderer model key, e.g. 'engineer_sentry', 'phoenix'
}

export interface AttackDef {
  /** Unique within the tower. Base attack is conventionally 'main'. */
  id: string;
  kind: AttackKind;
  /** Seconds between shots (before buffs). */
  cooldown: number;
  /** Projectiles per shot. */
  count?: number;
  /** Fan spread in degrees between the outermost projectiles (count>1). */
  spreadDeg?: number;
  /** 'aimed' (default) fires toward the target, 'radial' fires evenly in 360°. */
  pattern?: 'aimed' | 'radial';
  /** Fires even with no target in range (radial patterns, interceptor). */
  alwaysFire?: boolean;
  /** Overrides tower range for this attack. */
  range?: number;
  /** Ignore range entirely (Railgun). */
  globalRange?: boolean;
  /** Priority override when the tower's current mode is a movement/aim mode. */
  priority?: TargetPriority;
  /** Attack only active while the tower is in one of these modes (e.g. ['stealth']). */
  activeInModes?: TargetMode[];
  /** Attack is disabled while the tower is in one of these modes. */
  inactiveInModes?: TargetMode[];
  /** Overrides tower cloak detection for this attack. */
  camo?: boolean;
  projectile?: ProjectileDef;    // projectile/hitscan/trap/pulse payload (pulse uses damage/pierce/effects/damageType)
  crit?: CritDef;
  minion?: MinionDef;            // kind 'spawn'
  /** Only for 'trap': max simultaneous traps from this attack (oldest removed). */
  maxTraps?: number;
  /** Seconds of wind-up before the first shot after placement/round start (default 0). */
  delay?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Buffs, auras, abilities, income, mobility
// ─────────────────────────────────────────────────────────────────────────────

/** Additive/multiplicative buff applied to a tower at runtime (auras, abilities, heroes). */
export interface TowerBuff {
  rangeMult?: number;            // multiplies range (1.1 = +10%)
  rangeAdd?: number;
  rateMult?: number;             // multiplies COOLDOWN (0.85 = 15% faster)
  pierceAdd?: number;
  damageAdd?: number;
  projectileSpeedMult?: number;
  camo?: boolean;                // grants cloak detection
  /** Lets this tower's damage ignore immunities of these types, e.g. sharp hitting Plated. */
  ignoreImmunity?: boolean;
  shipMult?: number;             // extra multiplier vs ships
  homing?: boolean;              // straight projectiles become homing
  abilityCooldownMult?: number;
  /** Purchases of towers/upgrades for towers inside the aura cost this much less (0.1 = 10%). */
  discount?: number;
  /** Sell rate override for matching towers (e.g. 0.95 for Mining Rig). */
  sellRate?: number;
  incomeMult?: number;           // income towers earn more
}

export interface TowerFilter {
  classes?: TowerClass[];
  towerIds?: (TowerId | HeroId)[];
  /** Exclude the aura owner itself (default true). */
  excludeSelf?: boolean;
}

export interface AuraDef {
  id: string;
  /** Default: the owner's current range. */
  radius?: number;
  /** 'global' affects every matching tower on the map. */
  global?: boolean;
  filter?: TowerFilter;
  buff: TowerBuff;
}

export type AbilityEffect =
  /** Buff the owner tower for `duration` seconds. */
  | { kind: 'buffSelf'; buff: TowerBuff; duration: number }
  /** Buff towers within radius (default owner range). */
  | { kind: 'buffTowers'; buff: TowerBuff; duration: number; radius?: number; global?: boolean; filter?: TowerFilter }
  /** Damage every enemy on the map (or only ships) once. */
  | { kind: 'damageAll'; damage: number; damageType: DamageType; target: 'all' | 'ships' | 'nonShips'; effects?: StatusEffect[]; mult?: Partial<Record<EnemyTag, number>>; visual?: string }
  /** Hit the N strongest enemies (optionally ships only) with damage + splash/effects. */
  | { kind: 'strikeStrongest'; count: number; damage: number; damageType: DamageType; shipsOnly?: boolean; splash?: SplashDef; effects?: StatusEffect[]; visual?: string }
  /** Apply status effects to every enemy (in owner range if inRange). */
  | { kind: 'effectAll'; effects: StatusEffect[]; target: 'all' | 'ships' | 'nonShips'; inRange?: boolean; visual?: string }
  /** Summon a minion for `duration` seconds. */
  | { kind: 'summon'; minion: MinionDef; duration: number }
  /** Fire an extra attack repeatedly for `duration` seconds. */
  | { kind: 'burst'; attack: AttackDef; duration: number }
  | { kind: 'cash'; amount: number }
  | { kind: 'lives'; amount: number }
  /** Copy the attacks of the nearest non-hero tower for `duration` (Vexx). */
  | { kind: 'copyNearestTower'; duration: number };

export interface AbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;              // seconds
  /** Cooldown remaining when first granted (default = cooldown * 0.5… BTD-style). */
  initialCooldown?: number;
  effects: AbilityEffect[];
  icon?: string;
}

export interface IncomeDef {
  /** ₡ produced per round (split into `crystals` pickups dropped during the round). */
  perRound: number;
  crystals: number;
  /** Bank mode: income is stored (with interest) instead of dropped; collect via ability. */
  bank?: { capacity: number; interestPct: number };
  /** Crystals collect automatically (true) or need a click/tap (false; auto at round end). */
  autoCollect?: boolean;
  /** Extra lives granted at end of each round. */
  livesPerRound?: number;
}

export interface MobilityDef {
  kind: 'hover' | 'flight';
  speed: number;                 // units/s
  /** Flight: size of the path pattern; hover: max wander distance (Infinity = map). */
  size?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tower stats, upgrades, towers, heroes
// ─────────────────────────────────────────────────────────────────────────────

export interface TowerStats {
  range: number;
  /** Cloak detection. */
  camo: boolean;
  /** Needs line of sight to targets (blocked by obstacles with blocksSight). */
  lineOfSight: boolean;
  attacks: AttackDef[];
  auras?: AuraDef[];
  abilities?: AbilityDef[];
  income?: IncomeDef;
  mobility?: MobilityDef;
  /** Available modes, in cycle order. First entry is the default. */
  targetModes: TargetMode[];
  /** Footprint radius for placement collision. */
  footprint: number;
}

/** Field paths valid for { op:'stat' } on an attack (dot-path into AttackDef). */
export type AttackStatPath =
  | 'cooldown' | 'count' | 'spreadDeg' | 'range' | 'camo' | 'globalRange' | 'alwaysFire' | 'maxTraps'
  | 'projectile.damage' | 'projectile.pierce' | 'projectile.speed' | 'projectile.maxDistance'
  | 'projectile.lifetime' | 'projectile.radius' | 'projectile.damageType' | 'projectile.motion'
  | 'projectile.canHitFrozen' | 'projectile.ignoresImmunity' | 'projectile.cashPerPop' | 'projectile.scale'
  | 'projectile.visual' | 'projectile.color' | 'projectile.orbitRadius' | 'projectile.turnRate'
  | `projectile.mult.${EnemyTag}` | `projectile.add.${EnemyTag}`
  | 'projectile.splash.radius' | 'projectile.splash.damage' | 'projectile.splash.pierce'
  | 'projectile.splash.damageType' | `projectile.splash.mult.${EnemyTag}`
  | 'projectile.chain.count' | 'projectile.chain.range' | 'projectile.bounce.range'
  | 'projectile.onExpire.count' | 'projectile.onImpact.count'
  | 'crit.damage' | 'crit.everyMin' | 'crit.everyMax'
  | 'minion.lifetime' | 'minion.maxCount' | 'minion.range';

/** Field paths valid for { op:'stat' } on the tower itself. */
export type TowerStatPath =
  | 'range' | 'camo' | 'lineOfSight' | 'footprint'
  | 'income.perRound' | 'income.crystals' | 'income.livesPerRound' | 'income.autoCollect'
  | 'income.bank.capacity' | 'income.bank.interestPct'
  | 'mobility.speed' | 'mobility.size';

export type UpgradeEffect =
  /** Change a tower-level stat. mode 'set' is structural (pass 1); add/mul are numeric (pass 2). */
  | { op: 'stat'; target: 'tower'; field: TowerStatPath; mode: 'add' | 'mul' | 'set'; value: number | boolean | string }
  /** Change an attack stat. attack '*' = every attack (including attacks inside minions when includeMinions). */
  | { op: 'stat'; target: 'attack'; attack: string | '*'; field: AttackStatPath; mode: 'add' | 'mul' | 'set'; value: number | boolean | string; includeMinions?: boolean }
  | { op: 'addAttack'; attack: AttackDef }
  | { op: 'replaceAttack'; id: string; attack: AttackDef }
  /** Deep-merge a partial attack (objects merge, arrays replace). */
  | { op: 'patchAttack'; id: string | '*'; patch: DeepPartial<AttackDef> }
  | { op: 'removeAttack'; id: string }
  /** Append status effects to an attack's projectile (or its splash when toSplash). */
  | { op: 'addEffect'; attack: string | '*'; effect: StatusEffect; toSplash?: boolean }
  | { op: 'addAbility'; ability: AbilityDef }
  | { op: 'addAura'; aura: AuraDef }
  | { op: 'patchAura'; id: string; patch: DeepPartial<AuraDef> }
  | { op: 'setIncome'; income: IncomeDef }
  | { op: 'setMobility'; mobility: MobilityDef }
  | { op: 'addTargetModes'; modes: TargetMode[] };

export type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export interface UpgradeDef {
  /** Globally unique, e.g. 'pulse_gunner_p1t3'. */
  id: string;
  name: string;
  /** Player-facing one/two-line description of what changes. */
  description: string;
  /** Base price in ₡ at Officer (1.00×) difficulty. */
  cost: number;
  effects: UpgradeEffect[];
  /** Notes for the Blender artist: what visibly changes on the model at this tier. */
  modelNotes: string;
}

/** Exactly 5 upgrades per path. */
export type UpgradePath = [UpgradeDef, UpgradeDef, UpgradeDef, UpgradeDef, UpgradeDef];

export interface TowerDef {
  id: TowerId;
  name: string;
  class: Exclude<TowerClass, 'hero'>;
  /** Base price in ₡ at Officer (1.00×) difficulty. */
  cost: number;
  placement: Placement;
  description: string;
  /** Mechanical role tag shown in the shop tooltip, e.g. "Single target · Sharp". */
  role: string;
  base: TowerStats;
  pathNames: [string, string, string];
  paths: [UpgradePath, UpgradePath, UpgradePath];
  /** Model family key: public/models/towers/<id>.glb */
  model: string;
}

export interface HeroLevelDef {
  level: number;                 // 2..20 (level 1 is the base)
  /** Cumulative XP needed to reach this level. */
  xp: number;
  description: string;
  effects: UpgradeEffect[];
  /** Model variant shown from this level on: 1 | 7 | 13 | 20. */
  modelTier?: 1 | 7 | 13 | 20;
}

export interface HeroDef {
  id: HeroId;
  name: string;
  cost: number;
  placement: Placement;
  description: string;
  role: string;
  base: TowerStats;
  /** 19 entries for levels 2..20. */
  levels: HeroLevelDef[];
  /** XP per layer popped by the hero. */
  xpPerPop: number;
  /** XP granted at the end of round r: roundXpBase + roundXpPerRound * r. */
  roundXpBase: number;
  roundXpPerRound: number;
  model: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enemies
// ─────────────────────────────────────────────────────────────────────────────

export interface EnemyChildSpec {
  kind: EnemyKind;
  count: number;
  /** Extra modifiers forced on these children (e.g. Phantom spawns cloaked regen shellbacks). */
  mods?: EnemyMods;
}

export interface EnemyMods {
  cloaked?: boolean;
  regen?: boolean;
  fortified?: boolean;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  /** 0..9 for layers, 10+ for ships (used by 'strong' targeting + regen ceilings). */
  rank: number;
  isShip: boolean;
  /** Relative speed (1.0 = Spark). Multiplied by BASE_ENEMY_SPEED. */
  speed: number;
  /** Hit points of this layer (1 for most layers). Fortified doubles HP for plated/shellback/ships. */
  hp: number;
  /** What it splits into when this layer is destroyed. */
  children: EnemyChildSpec[];
  /** Innate damage-type immunities (see immunity.ts). */
  immune: DamageType[];
  /** Innate modifiers (Phantom Ship is innately cloaked). */
  innate?: EnemyMods;
  /** Ships: immune to stun/knockback/slow/freeze entirely (Hive Titan). */
  ccImmune?: boolean;
  /** Collision/visual radius in units. */
  radius: number;
  /** Primary UI/VFX colour. */
  color: string;
  /** Model node key in the enemy GLB (see docs/ARCHITECTURE.md). */
  model: string;
  /** Which layer to regrow into (Regen). Undefined = cannot regrow further. */
  regrowsTo?: LayerKind;
}

// ─────────────────────────────────────────────────────────────────────────────
// Waves
// ─────────────────────────────────────────────────────────────────────────────

export interface SpawnGroup {
  enemy: EnemyKind;
  count: number;
  /** Seconds between consecutive spawns in this group. */
  spacing: number;
  /** Seconds after round start of the first spawn. */
  start: number;
  mods?: EnemyMods;
  /** For multi-entrance maps: path index, or 'alternate' to round-robin. Default 'alternate'. */
  path?: number | 'alternate';
}

export interface RoundDef {
  round: number;
  groups: SpawnGroup[];
  /** Optional banner text (e.g. "Mothership detected"). */
  announce?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty & maps
// ─────────────────────────────────────────────────────────────────────────────

export type DifficultyId = 'cadet' | 'officer' | 'commander' | 'last_stand';

export interface DifficultyDef {
  id: DifficultyId;
  name: string;
  subtitle: string;
  startLives: number;
  costMult: number;
  finalRound: number;
  startCash: number;
  startRound: number;
}

export type MapDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface MapObstacle {
  kind: 'circle' | 'poly';
  x?: number; y?: number; r?: number;        // circle
  points?: [number, number][];               // poly (sim coords)
  blocksSight: boolean;
  blocksPlacement: boolean;
  /** Prop name for debugging. */
  name?: string;
}

/** public/maps/<id>.json — exported from Blender by blender/maps/export_map_json.py */
export interface MapData {
  id: string;
  name: string;
  difficulty: MapDifficulty;
  world: { width: number; height: number };
  /** One or more enemy paths, each an ordered polyline entrance → exit in sim coords. */
  paths: { id: string; points: [number, number][] }[];
  /** Half-width of the path for placement blocking. */
  pathHalfWidth: number;
  /**
   * Placement zones as a grid covering the world. rows[r][c]:
   *   '.' = unbuildable, 's' = Surface, 'v' = Void.
   * Cell (c, r) covers x ∈ [-W/2 + c*cell, ...), y ∈ [-H/2 + r*cell, ...).
   */
  zones: { cellSize: number; cols: number; rows: string[] };
  obstacles: MapObstacle[];
  /** GLB with the map geometry. Relative to /public. */
  model?: string;
  /** Background colour behind the playfield. */
  background?: string;
  /** Thumbnail for map select. */
  thumbnail?: string;
}
