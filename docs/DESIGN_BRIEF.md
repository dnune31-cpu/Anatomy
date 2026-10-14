# Orbital Defense — Design Brief (source of truth)

Space/alien tower defense web game that plays like the classic layered-enemy formula (3 paths × 5
tiers, crosspath limits, targeting priorities, classes, heroes, abilities, rounds, economy) but with
**100% original** names, models, maps, icons, effects and sounds. Copy mechanics, never assets.

## Decisions log (deviations from the original master prompt)

* **Names that matched reference-game names verbatim were renamed** (the brief's own rule "do not copy
  any names" wins): Dragon's Breath → *Solar Breath*; Shimmer → *Veil Breaker*; Recursive Cluster →
  *Fractal Cluster*; Faster Reload → *Quick Loader*; Extra Range → *Long Fuse*; Sharpshooter →
  *Deadeye Scope*; Crossbow Rifle/Crossbow Ace → *Rail Bow* / *Rail Bow Ace*; Juggernaut Core →
  *Titan Core*. `tests/originality.test.ts` guards all names.
* Blender work runs in a local headless Blender 5.2 (`bpy`) because no Blender MCP connector was
  attached; same scripts work inside Blender's UI (`blender --python blender/build_all.py`).
* Obsidian notes are written as a plain Obsidian vault in `vault/` (open the folder as a vault).
* Enemies are rendered with `InstancedMesh` and animated in-shader (bob/spin) rather than skinned
  rigs, so hundreds stay at a handful of draw calls; towers/heroes carry armatures + named clips.
* Textures: palette atlases exported as WebP (KTX2 needs `toktx`, unavailable here; loader supports both).

## 2. Camera, layout, UI

* Fixed top-down orthographic camera, ~75° tilt, no rotation. Fixed 16:9 canvas, letterboxed; pinch zoom on mobile.
* **Top-left:** lives (alien heart-core icon) and cash (credit chip icon, "₡").
* **Top-right:** "ROUND 23/80" counter, settings gear.
* **Right panel:** scrollable tower shop, 2 columns, each card shows a rendered icon and price. Header:
  "UPGRADES" toggle + selected tower name. Cards greyed if unaffordable.
* **Bottom-right:** Start/Fast-forward (▶ → ▶▶ toggle at 3×) and an ability button stack.
* **Bottom-left:** activated-ability bar (cooldown radial fill).
* **Upgrade panel** (opens on tower click, slides over the shop): three path columns, five pips each,
  next upgrade name + icon + price, locked paths with a lock and reason ("Crosspath limit"), targeting
  button with left/right arrows, sell button with sell value, pop counter.
* Range circle when placing/selecting; red if placement invalid.
* Chunky rounded display font with dark outline.

## 3. Core rules

Rounds: 80 Hard, 60 Medium, 40 Easy; freeplay continues with scaling HP/speed.

| Mode | Start lives | Cost multiplier | Final round |
|---|---|---|---|
| Cadet (Easy) | 200 | 0.85× | 40 |
| Officer (Medium) | 150 | 1.00× | 60 |
| Commander (Hard) | 100 | 1.08× | 80 |
| Last Stand (Impoppable) | 1 | 1.20× | 100 |

Prices rounded to nearest ₡5. Start ₡650. ₡1 per layer popped; R51–60 ₡0.5, R61–85 ₡0.2, R86–100 ₡0.1,
after ₡0.05. End-of-round bonus ₡100 + round. Sell 70% (95% for Mining Rig inside a Comms Beacon's T4+
radius). Leaks cost lives = RBE. Placement zones: **Surface** and **Void** (some towers Void-only).
Obstacles block line of sight.

## 4. Enemies — The Swarm

| Tier | Name | Speed | Pops into | Notes |
|---|---|---|---|---|
| 1 | Spark Drone (red) | 1.0 | — | |
| 2 | Glide Drone (blue) | 1.4 | 1 Spark | |
| 3 | Dart Drone (green) | 1.8 | 1 Glide | |
| 4 | Comet Drone (yellow) | 3.2 | 1 Dart | |
| 5 | Flare Drone (pink) | 3.5 | 1 Comet | |
| 6a | Shade Drone (black) | 1.8 | 2 Flare | immune Explosive |
| 6b | Frost Drone (white) | 2.0 | 2 Flare | immune Cryo |
| 6c | Psi Drone (purple) | 3.0 | 2 Flare | immune Energy, Psionic |
| 7 | Plated Drone (lead) | 1.0 | 2 Shade | immune Sharp (+Cryo); needs Explosive/Energy/Psionic/Normal |
| 8 | Twin Drone (zebra) | 1.8 | 1 Shade + 1 Frost | immune Explosive and Cryo |
| 9 | Prism Drone (rainbow) | 2.2 | 2 Twin | |
| 10 | Shellback (ceramic) | 2.5 | 2 Prism | 10 HP shell, cracks visually |

Modifiers: **Cloaked** (needs Cloak Detection; shimmer shader), **Regen** (regrows a layer every 1s up to
spawn tier; pulsing heart-node), **Fortified** (×2 HP on Plated, Shellback, ships; extra plates).

| Ship | HP | Speed | Spawns | Notes |
|---|---|---|---|---|
| Carrier | 200 | 1.0 | 4 Shellbacks | |
| Battlecruiser | 700 | 0.25 | 4 Carriers | |
| Dreadnought | 4,000 | 0.18 | 4 Battlecruisers | |
| Phantom Ship | 400 | 2.75 | 6 Cloaked Regen Shellbacks | innately Cloaked; Plated + Shade immunities |
| Hive Titan | 20,000 | 0.18 | 2 Dreadnoughts + 3 Phantoms | immune to stun/knockback/slow; R100 boss |

Damage types: Sharp, Explosive, Cryo, Energy, Psionic, Normal (hits everything). Table in `src/data/immunity.ts`.

Waves (`src/data/waves.ts`): early rounds teach single layers; ~R22 first Shade; ~R24 first Cloaked;
~R28 first Plated; ~R40 first Carrier; ~R60 Battlecruiser; ~R63 dense Shellback rush; ~R78 Dreadnought;
~R80 multi-Dreadnought finale; Hive Titan at R100 (Last Stand). Each round lists spawn groups:
enemy, modifiers, count, spacing, start delay.

## 5. Towers — Defenders

Classes: **Primary** (cheap, foundational), **Military** (long range, vehicles, special targeting),
**Psionic** (magic class: alien tech, mind powers, unique effects), **Support** (income, buffs, traps,
utility), **Heroes** (one per game, levels 1–20 by XP from pops and rounds).

Universal upgrade rules: 3 paths × 5 tiers; crosspath (one path ≥3, second ≤2, third 0); one tier-5 per
path per tower type at a time; in-order purchases; each tier changes model/stats and sometimes damage
type, Cloak Detection or abilities; some T3+ grant activated abilities (ability bar).
Price guide: T1/T2 ≈ 0.3–1× base; T3 ≈ 1.5–3×; T4 ≈ 5–15×; T5 ≈ 20–100×.

Targeting: First, Last, Close, Strong for all attackers. Special: Railgun Sniper (global, no LOS);
Missile Silo (player reticle anywhere); Gunship (Lock in Place / Follow Touch / Pursuit / Patrol Points);
Interceptor (Circle / Infinite Loop / Figure Eight / Centered Path); Gatling Mech (aim at cursor or lock
direction); Patrol Frigate (Void-only; standard 4 + "Stealth Mode" on one path).

### Roster (20 towers + 2 heroes)

| Class | Tower | Base role | Cost | Placement | Mechanical analogue (reference role only) |
|---|---|---|---|---|---|
| Primary | Pulse Gunner | single bolt, sharp | ₡200 | Surface | basic dart thrower |
| Primary | Disc Thrower | returning blade, sharp | ₡325 | Surface | boomerang |
| Primary | Gravity Charge | explosive blast | ₡525 | Surface | bomb cannon |
| Primary | Shard Spiker | 8-way spray, sharp | ₡280 | Surface | tack sprayer |
| Primary | Cryo Node | freezes nearby, cryo | ₡500 | Surface | freezing aura |
| Primary | Acid Spitter | slows + DoT | ₡275 | Surface | glue/slow + corrosion |
| Military | Railgun Sniper | infinite range, high pierce | ₡350 | Surface | sniper |
| Military | Patrol Frigate | ship, multi-shot | ₡500 | Void | water ship / submarine hybrid |
| Military | Interceptor | flying jet, flight paths | ₡800 | Void | plane |
| Military | Gunship | hovering, follows target | ₡1,600 | Surface | helicopter |
| Military | Missile Silo | target-anywhere artillery | ₡750 | Surface | mortar |
| Military | Gatling Mech | aims at cursor | ₡850 | Surface | cursor-aimed gatling |
| Psionic | Psion Adept | psionic orbs, fire, revive | ₡375 | Surface | wizard |
| Psionic | Star Champion | super-fast hero-tower | ₡2,500 | Surface | super hero tower |
| Psionic | Phase Assassin | throws stars, Cloak Detection | ₡400 | Surface | ninja |
| Psionic | Void Alchemist | buffs + acid potions | ₡550 | Surface | alchemist |
| Support | Mining Rig | generates ₡ crystals | ₡1,250 | Surface | income farm |
| Support | Spike Deployer | lays traps on track | ₡1,000 | Surface | spike/trap factory |
| Support | Comms Beacon | buffs range, can grant Cloak Detection | ₡1,200 | Surface | support village |
| Support | Engineer Unit | sentries, foam | ₡400 | Surface | engineer |

### Template upgrade trees (after originality renames)

**PULSE GUNNER (₡200)** — 1 sharp bolt, pierce 2, damage 1, range 32, attack 0.95s
* Path 1 — Overcharge: Charged Cells ₡140 (pierce +1) → Dense Plasma ₡220 (pierce +2) → Spike Lance ₡300
  (piercing lance, pierce 18, can hit Plated) → Titan Core ₡1,800 (giant rolling plasma ball, pierce 100,
  ×4 vs Shellbacks) → Ultra-Core ₡15,000 (ball splits twice on expiry, huge pierce, ×5 vs ships)
* Path 2 — Rapid Fire: Quick Trigger ₡100 (+15% speed) → Twin Cells ₡190 (+33% speed) → Triple Barrel ₡400
  (3 bolts) → Pulse Fan ₡8,000 (ABILITY 10s: 10× rate + seeking) → Plasma Monarch ₡45,000 (burning plasma
  bolts, huge damage, ×15 vs ships)
* Path 3 — Long Range: Scope Lens ₡90 (+8 range) → Thermal Lens ₡120 (+8 range, Cloak Detection) → Rail Bow
  ₡625 (+damage, +range, crit every 10 shots) → Deadeye Scope ₡2,000 (crits 20 dmg every 8–12 shots) →
  Rail Bow Ace ₡25,000 (crit every 3–5 shots, damage 6, ignores Plated)

**GRAVITY CHARGE (₡525)** — explosive implosion, radius 10, pierce 14, can't hit Shade
* Path 1 — Singularity: Bigger Charges → Heavy Charges → Super Gravity (big radius, can hit Shade) →
  Collapse Bomb (stuns ships) → Event Horizon (massive damage, pulls ships back)
* Path 2 — Cluster: Quick Loader → Missile Pods → Homing Missiles (ships ×3) → Mothership Breaker (×10 vs
  ships) → Fleet Annihilator (massive vs ships)
* Path 3 — Fragment: Long Fuse → Frag Shells → Cluster Charges → Fractal Cluster → Gravity Elite (stuns)

**PSION ADEPT (₡375)** — psionic orb, hits all except Psi Drone
* Path 1 — Arcane: Guided Orbs → Psi Mastery → Shock Lance (lightning chains) → Mind Lord (big orbs) →
  Archmind (summons orb-clones)
* Path 2 — Flame: Fire Wall → Solar Breath → Phoenix Wing (ABILITY: summon fire-bird) → Fire Dynamo →
  Stellar Phoenix (permanent fire-bird)
* Path 3 — Spirit: Spectral Sight (Cloak Detection) → Veil Breaker (removes cloak in radius) →
  Necro-Uplink (revives popped drones as allies walking the track) → Soul Harvester → Prince of Void
  (huge revival army)

Every other tower: all 15 upgrades with name, price, exact stat change, damage-type change, new property
(Cloak Detection, Plated pop, ship bonus), ability if any, model-change notes. Paths cover distinct roles.
Every tower has at least one path granting Cloak Detection OR depends on a Comms Beacon for it.

### Heroes (one per game, levels 1–20)
* **Captain Nyra** (₡540): plasma pistol; L3 ability "Overload Burst"; L10 ability "Orbital Strike";
  +range and Cloak Detection at L5.
* **Vexx the Hivemind** (₡650): psionic; L3 "Mind Snare" (stuns ships 3s); L10 "Swarm Echo" (copies the
  nearest tower's attack); buffs Psionic towers.
* XP curve in data; model swaps at L1, L7, L13, L20.

## 6. Maps
1. **Crater Ridge** (Beginner) — bright moon surface, winding stone-plated path, craters, crashed probe, small Void pools.
2. **Orbital Dock** (Beginner) — station deck, conveyor-lane path, cargo crates block sight.
3. **Nebula Run** (Intermediate) — path floats over violet nebula, mostly Void, few Surface islands.
4. **Ring Belt** (Advanced) — asteroid belt, two entrances, obstacles everywhere.
5. **Hive Core** (Expert) — inside an alien hive, very short path, minimal space.

Each: spline path exported to JSON by a Blender script, props, animated background, Surface/Void zones.

## 9. Quality bar
* On a phone, each enemy layer is instantly distinguishable by colour and silhouette.
* Every upgrade feels like a visible change.
* Popping feels satisfying: bright burst, small sound, number pop for big hits.
* Nothing copied from the reference game except its mechanical rules.
* 60 FPS at round 80 on a mid-range laptop/phone; pooling; no per-frame allocations in hot loops.
