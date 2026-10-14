/**
 * Originality guard. Orbital Defense copies the reference game's MECHANICS only.
 * Every player-facing name (towers, upgrades, abilities, heroes, enemies) must be original.
 * tests/originality.test.ts fails if any name normalises to one of these, or contains a
 * distinctive term. Normalisation: lowercase, strip everything except a–z and 0–9.
 */
export const DISTINCTIVE_TERMS = ['bloon', 'monkey', 'moab', 'zomg', 'bfb', 'ddt', 'banana', 'quincy', 'obyn'];

export const DENYLIST_NAMES: string[] = [
  // towers / heroes / enemies
  'Dart Monkey', 'Boomerang Monkey', 'Bomb Shooter', 'Tack Shooter', 'Ice Monkey', 'Glue Gunner',
  'Sniper Monkey', 'Monkey Sub', 'Monkey Buccaneer', 'Monkey Ace', 'Heli Pilot', 'Mortar Monkey',
  'Dartling Gunner', 'Wizard Monkey', 'Super Monkey', 'Ninja Monkey', 'Alchemist', 'Druid', 'Banana Farm',
  'Spike Factory', 'Monkey Village', 'Engineer Monkey', 'Beast Handler', 'Mermonkey', 'Desperado',
  'Quincy', 'Gwendolin', 'Striker Jones', 'Obyn Greenfoot', 'Captain Churchill', 'Benjamin', 'Ezili',
  'Pat Fusty', 'Adora', 'Admiral Brickell', 'Etienne', 'Sauda', 'Psi', 'Geraldo', 'Corvus', 'Rosalia',
  'Red Bloon', 'Blue Bloon', 'Green Bloon', 'Yellow Bloon', 'Pink Bloon', 'Black Bloon', 'White Bloon',
  'Purple Bloon', 'Lead Bloon', 'Zebra Bloon', 'Rainbow Bloon', 'Ceramic Bloon', 'MOAB', 'BFB', 'ZOMG', 'DDT', 'BAD',
  // primary
  'Sharp Shots', 'Razor Sharp Shots', 'Spike-o-pult', 'Juggernaut', 'Ultra-Juggernaut', 'Quick Shots',
  'Very Quick Shots', 'Triple Shot', 'Super Monkey Fan Club', 'Plasma Monkey Fan Club', 'Long Range Darts',
  'Enhanced Eyesight', 'Crossbow', 'Sharp Shooter', 'Crossbow Master',
  'Improved Rangs', 'Glaives', 'Glaive Ricochet', 'MOAR Glaives', 'Glaive Lord', 'Faster Throwing', 'Faster Rangs',
  'Bionic Boomerang', 'Turbo Charge', 'Perma Charge', 'Long Range Rangs', 'Red Hot Rangs', 'Kylie Boomerang',
  'MOAB Press', 'MOAB Domination',
  'Bigger Bombs', 'Heavy Bombs', 'Really Big Bombs', 'Bloon Impact', 'Bloon Crush', 'Faster Reload',
  'Missile Launcher', 'MOAB Mauler', 'MOAB Assassin', 'MOAB Eliminator', 'Extra Range', 'Frag Bombs',
  'Cluster Bombs', 'Recursive Cluster', 'Bomb Blitz',
  'Faster Shooting', 'Even Faster Shooting', 'Hot Shots', 'Ring of Fire', 'Inferno Ring', 'Long Range Tacks',
  'Super Range Tacks', 'Blade Shooter', 'Blade Maelstrom', 'Super Maelstrom', 'More Tacks', 'Even More Tacks',
  'Tack Sprayer', 'Overdrive', 'The Tack Zone',
  'Permafrost', 'Cold Snap', 'Ice Shards', 'Embrittlement', 'Super Brittle', 'Enhanced Freeze', 'Deep Freeze',
  'Arctic Wind', 'Snowstorm', 'Absolute Zero', 'Larger Radius', 'Re-Freeze', 'Cryo Cannon', 'Icicles', 'Icicle Impale',
  'Glue Soak', 'Corrosive Glue', 'Bloon Dissolver', 'Bloon Liquefier', 'The Bloon Solver', 'Bigger Globs',
  'Glue Splatter', 'Glue Hose', 'Glue Strike', 'Glue Storm', 'Stickier Glue', 'Stronger Glue', 'MOAB Glue',
  'Relentless Glue', 'Super Glue',
  // military
  'Full Metal Jacket', 'Large Calibre', 'Deadly Precision', 'Maim MOAB', 'Cripple MOAB', 'Night Vision Goggles',
  'Shrapnel Shot', 'Bouncing Bullet', 'Supply Drop', 'Elite Sniper', 'Fast Firing', 'Even Faster Firing',
  'Semi-Automatic', 'Full Auto Rifle', 'Elite Defender',
  'Longer Range', 'Advanced Intel', 'Submerge and Support', 'Bloontonium Reactor', 'Energizer', 'Barbed Darts',
  'Heat-tipped Darts', 'Ballistic Missile', 'First Strike Capability', 'Pre-emptive Strike', 'Twin Guns',
  'Airburst Darts', 'Triple Guns', 'Armor Piercing Darts', 'Sub Commander',
  'Grape Shot', 'Hot Shot', 'Cannon Ship', 'Monkey Pirates', 'Pirate Lord', 'Long Range', "Crow's Nest",
  'Merchantman', 'Favored Trades', 'Trade Empire', 'Double Shot', 'Destroyer', 'Aircraft Carrier', 'Carrier Flagship',
  'Rapid Fire', 'Lots More Darts', 'Fighter Plane', 'Operation: Dart Storm', 'Sky Shredder', 'Exploding Pineapple',
  'Spy Plane', 'Bomber Ace', 'Ground Zero', 'Tsar Bomba', 'Sharper Darts', 'Neva-Miss Targeting', 'Spectre',
  'Flying Fortress',
  'Quad Darts', 'Razor Rotors', 'Apache Dartship', 'Apache Prime', 'Bigger Jets', 'IFR', 'Downdraft',
  'Support Chinook', 'Special Poperations', 'Faster Darts', 'Faster Firing', 'MOAB Shove', 'Comanche Defense',
  'Comanche Commander',
  'Bigger Blast', 'Bloon Buster', 'Shell Shock', 'The Big One', 'The Biggest One', 'Rapid Reload', 'Heavy Shells',
  'Artillery Battery', 'Pop and Awe', 'Increased Accuracy', 'Burny Stuff', 'Signal Flare', 'Shattering Shells',
  'Blooncineration',
  'Focused Firing', 'Laser Shock', 'Laser Cannon', 'Plasma Accelerator', 'Ray of Doom', 'Advanced Targeting',
  'Faster Barrel Spin', 'Hydra Rocket Pods', 'Rocket Storm', 'MAD', 'Faster Swivel', 'Powerful Darts', 'Buckshot',
  'Bloon Area Denial System', 'Bloon Exclusion Zone',
  // magic
  'Guided Magic', 'Arcane Blast', 'Arcane Mastery', 'Arcane Spike', 'Archmage', 'Fireball', 'Wall of Fire',
  "Dragon's Breath", 'Summon Phoenix', 'Wizard Lord Phoenix', 'Intense Magic', 'Monkey Sense', 'Shimmer',
  'Necromancer: Unpopped Army', 'Prince of Darkness',
  'Laser Blasts', 'Plasma Blasts', 'Sun Avatar', 'Sun Temple', 'True Sun God', 'Super Range', 'Epic Range',
  'Robo Monkey', 'Tech Terror', 'The Anti-Bloon', 'Knockback', 'Ultravision', 'Dark Knight', 'Dark Champion',
  'Legend of the Night',
  'Ninja Discipline', 'Sharp Shurikens', 'Bloonjitsu', 'Grandmaster Ninja', 'Distraction', 'Counter-Espionage',
  'Shinobi Tactics', 'Bloon Sabotage', 'Grand Saboteur', 'Seeking Shuriken', 'Caltrops', 'Flash Bomb',
  'Sticky Bomb', 'Master Bomber',
  'Larger Potions', 'Acidic Mixture Dip', 'Berserker Brew', 'Stronger Stimulant', 'Permanent Brew',
  'Stronger Acid', 'Perishing Potions', 'Unstable Concoction', 'Transforming Tonic', 'Total Transformation',
  'Acid Pool', 'Lead to Gold', 'Rubber to Gold', 'Bloon Master Alchemist',
  'Hard Thorns', 'Heart of Thunder', 'Druid of the Storm', 'Ball Lightning', 'Superstorm', 'Thorn Swarm',
  'Heart of Oak', 'Druid of the Jungle', "Jungle's Bounty", 'Spirit of the Forest', 'Druidic Reach',
  'Heart of Vengeance', 'Druid of Wrath', 'Poplust', 'Avatar of Wrath',
  // support
  'Increased Production', 'Greater Production', 'Banana Plantation', 'Banana Research Facility', 'Banana Central',
  'Long Life Bananas', 'Valuable Bananas', 'Monkey Bank', 'IMF Loan', 'Monkey-Nomics', 'EZ Collect',
  'Banana Salvage', 'Marketplace', 'Central Market', 'Monkey Wall Street',
  'Bigger Stacks', 'White Hot Spikes', 'Spiked Balls', 'Spiked Mines', 'Super Mines', 'Faster Production',
  'Even Faster Production', 'MOAB SHREDR', 'Spike Storm', 'Carpet of Spikes', 'Long Life Spikes',
  'Deadly Spikes', 'Permaspike', 'Smart Spikes',
  'Bigger Radius', 'Jungle Drums', 'Primary Training', 'Primary Mentoring', 'Primary Expertise', 'Grow Blocker',
  'Radar Scanner', 'Monkey Intelligence Bureau', 'Call to Arms', 'Homeland Defense', 'Monkey Business',
  'Monkey Commerce', 'Monkey Town', 'Monkey City', 'Monkeyopolis',
  'Sentry Gun', 'Faster Engineering', 'Sprockets', 'Sentry Expert', 'Sentry Champion', 'Larger Service Area',
  'Deconstruction', 'Cleansing Foam', 'Overclock', 'Ultraboost', 'Oversize Nails', 'Pin', 'Double Gun',
  'Bloon Trap', 'XXXL Trap',
];

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const DENY = new Set(DENYLIST_NAMES.map(normalizeName));

/** Returns a reason string if the name is not original, else null. */
export function originalityProblem(name: string): string | null {
  const n = normalizeName(name);
  if (DENY.has(n)) return `"${name}" matches a reference-game name`;
  for (const t of DISTINCTIVE_TERMS) if (n.includes(t)) return `"${name}" contains reference-game term "${t}"`;
  return null;
}
