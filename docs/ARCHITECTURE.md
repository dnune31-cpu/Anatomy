# Orbital Defense — Architecture & Conventions

Original space/alien tower defense for the browser. Mechanics mirror the classic layered-enemy
tower-defense formula (3 paths × 5 tiers, crosspath limits, targeting priorities, heroes, abilities);
**every name, model, map, icon, effect and sound is original**. `tests/originality.test.ts` enforces
names against `src/data/originality.ts`.

Stack: TypeScript + Vite + Three.js, HTML/CSS overlay UI, Howler.js/WebAudio, Vitest. No backend.

## Directory map & ownership

| Path | What | Depends on |
|---|---|---|
| `src/data/types.ts` | **Data contract** (towers, upgrades, effects, enemies, waves, maps) | — |
| `src/data/constants.ts` | world size, tick rate, economy formulas, late-round scaling | — |
| `src/data/enemies.ts`, `immunity.ts`, `difficulty.ts` | Swarm layers/ships, immunity table, modes | types |
| `src/data/towers/<towerId>.ts` | one `TowerDef` per tower (base stats + 15 upgrades) | types |
| `src/data/towers.ts` | `TOWERS` registry, `TOWER_ORDER`, shop order | towers/* |
| `src/data/heroes.ts` | 2 heroes × 20 levels | types |
| `src/data/waves.ts` | `ROUNDS` 1–100 + `freeplayRound(r)` | types, enemies |
| `src/data/maps.ts` | map registry (id, name, difficulty, json url, thumbnail) | types |
| `src/sim/**` | deterministic simulation (no DOM / three) implementing `src/sim/types.ts` | data |
| `src/render/**` | Three.js renderer implementing `src/render/types.ts` | sim types, data |
| `src/ui/**`, `src/app/**` | HTML overlay UI, screens, input, game session loop | sim, render |
| `src/audio/**` | SFX/announcer playback | sim events |
| `src/save/**` | localStorage persistence (try/catch everywhere) | — |
| `public/maps/<id>.json` | `MapData` exported from Blender | — |
| `public/models/**` | Blender-exported `.glb` (Draco + WebP) | — |
| `public/icons/**` | rendered tower/upgrade/hero icons (`.webp`) | — |
| `blender/**` | Python (bpy) scripts that build & export every 3D asset | — |
| `tools/**` | asset optimisation, balance simulator, screenshots | — |
| `vault/**` | Obsidian vault: one note per phase + index | — |

## Coordinates & units

* Sim is 2D. `x` right, `y` **down the screen**. Playfield `300 × 225` centred on origin.
* Sim `(x, y)` == three.js `(X, Z)` == Blender `(X, -Y)`. Up is three `+Y` / Blender `+Z`.
* 1 Blender unit = 1 game unit. Time in seconds, speeds in units/s, angles in radians (`atan2(dy, dx)`).
* Fixed tick 60 Hz (`TICK_DT`). Fast-forward = 3 ticks per tick-interval. Max 12 ticks per frame.

## Game rules (authoritative summary)

* Difficulties (`difficulty.ts`): Cadet 200 lives ×0.85 → R40; Officer 150 ×1.00 → R60;
  Commander 100 ×1.08 → R80; Last Stand 1 ×1.20 → R100. Prices rounded to nearest ₡5.
* Cash: start ₡650; ₡1 per layer popped, diminishing after R50 (`incomePerPop`);
  end-of-round bonus ₡100 + round; sell 70% (Mining Rig 95% inside a T4+ Comms Beacon aura).
* Leak costs lives = remaining RBE.
* Pop logic: destroying a layer spawns its children at the same path distance (spread ±2.5);
  excess damage carries into **each** child. Immune hits consume pierce, deal 0 ("clink").
* Cloaked: untargetable by towers without cloak detection (projectiles can still collide).
  Regen: regrows one step per second up to the spawn kind. Fortified: ×2 HP on Plated, Shellback, ships.
* Crosspath: at most one path ≥ 3; at most two paths > 0; the secondary ≤ 2. Tier-5: only one
  tower of each type may own a given path's tier 5 at once. Upgrades bought in order.
* Targeting: First (closest to exit), Last, Close, Strong (highest rank, then highest RBE) + special modes.

## Upgrade compilation

`compileTowerStats(def.base, tiers)` deep-clones base stats, then applies effects in two passes:
structural ops (set/add/replace/patch/remove attack, abilities, auras, income, mobility, target modes)
then numeric `add`/`mul` stat ops — both in (tier asc, path asc) order. See header of `src/data/types.ts`.

## Asset naming contract (Blender → game)

All GLBs: Y-up, applied transforms, 1 unit = 1 game unit, models **face Blender +Y** (three −Z),
origin at ground centre. Shared toon look is done in-engine (MeshToonMaterial + outline) using the
GLB base-colour texture (a palette atlas, 1024², WebP). Draco + WebP applied by `tools/optimize-glb.mjs`.

| File | Nodes (top level) |
|---|---|
| `models/towers/<towerId>.glb` | `<towerId>__base`, `<towerId>__p{1-3}t{3-5}` (9 variants) and attachments `<towerId>__att_p{1-3}t{1-2}`. Inside each variant: child `turret` (yaw pivot, optional) and empty `muzzle` (projectile origin). |
| `models/heroes/<heroId>.glb` | `<heroId>__l1`, `__l7`, `__l13`, `__l20` |
| `models/enemies/swarm.glb` | `enemy__<layer>` for all 12 layers (single mesh each), `enemy__shellback_d1..d3` crack stages, overlays `mod__regen`, `mod__fortified`, `mod__fortified_plated` |
| `models/enemies/ships.glb` | `ship__<kind>` and `ship__<kind>_d1..d3` (75/50/25% HP), kinds: carrier, battlecruiser, dreadnought, phantom, titan |
| `models/minions.glb` | `minion__<key>` (sentry, phoenix, revived_drone, …) |
| `models/maps/<mapId>.glb` | whole map scene; node names starting `anim_spin_*`/`anim_drift_*` are animated by the renderer |
| `models/manifest.json` | `{ towers: {id: url}, heroes: {id: url}, swarm, ships, minions, maps: {id: url} }` — only assets that exist |

Animations: towers export glTF clips named `<variant>__idle`, `<variant>__attack`, `<variant>__upgrade`,
`<variant>__sell`. Enemies are instanced (hundreds) and animated in the vertex shader (bob/spin); boss
ships swap to damage-state meshes.

Variant selection: main path = highest tier; if it is ≥ 3 the node `p{path}t{tier}` is shown, else `base`.
Attachments `att_p{p}t{1|2}` are shown for each path's tiers 1–2 on top of any variant.

Icons: `icons/towers/<towerId>.webp`, `icons/upgrades/<upgradeId>.webp` (upgradeId = `<towerId>_p{1-3}t{1-5}`),
`icons/heroes/<heroId>.webp`. UI must fall back gracefully when an icon is missing.

## Visual targets

Bright saturated toon look, readable on phones. Palette anchors: deep space `#0b0d2a`, UI navy `#16194a`,
cyan `#2de2e6`, magenta `#ff3cac`, lime `#9bff3c`, sun `#ffd23f`, coral `#ff4d4d`, violet `#8f5cff`.
Layer colours are in `src/data/enemies.ts` and must stay distinct by colour *and* silhouette.
Budgets: towers ≤ 3k tris per variant, enemies ≤ 600, ships ≤ 8k, maps ≤ 40k.
