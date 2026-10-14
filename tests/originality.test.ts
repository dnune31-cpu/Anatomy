import { describe, expect, it } from 'vitest';
import { originalityProblem } from '../src/data/originality';
import { ENEMIES } from '../src/data/enemies';

/** Collects every player-facing name from data modules that exist. */
async function collectNames(): Promise<string[]> {
  const names: string[] = Object.values(ENEMIES).map((e) => e.name);
  const towers = await import('../src/data/towers').catch(() => null);
  if (towers) {
    for (const t of Object.values(towers.TOWERS)) {
      names.push(t.name, ...t.pathNames);
      for (const path of t.paths) for (const u of path) {
        names.push(u.name);
        for (const e of u.effects) if (e.op === 'addAbility') names.push(e.ability.name);
      }
      for (const a of t.base.abilities ?? []) names.push(a.name);
    }
  }
  const heroes = await import('../src/data/heroes').catch(() => null);
  if (heroes) {
    for (const h of Object.values(heroes.HEROES)) {
      names.push(h.name);
      for (const l of h.levels) for (const e of l.effects) if (e.op === 'addAbility') names.push(e.ability.name);
    }
  }
  return names;
}

describe('originality', () => {
  it('no player-facing name copies the reference game', async () => {
    const problems = (await collectNames()).map(originalityProblem).filter(Boolean);
    expect(problems).toEqual([]);
  });
  it('the guard itself catches known names', () => {
    expect(originalityProblem('Sharp Shooter')).toBeTruthy();
    expect(originalityProblem("Dragon's Breath")).toBeTruthy();
    expect(originalityProblem('MOAB Breaker')).toBeTruthy();
    expect(originalityProblem('Titan Core')).toBeNull();
  });
});
