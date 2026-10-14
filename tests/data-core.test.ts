import { describe, expect, it } from 'vitest';
import { ENEMIES, rbe, nextRegrowKind, effectiveHp } from '../src/data/enemies';
import { canDamage } from '../src/data/immunity';
import { priceFor } from '../src/data/difficulty';
import { incomePerPop, endOfRoundBonus } from '../src/data/constants';

describe('enemy data', () => {
  it('RBE matches the layered hierarchy', () => {
    expect(rbe('spark')).toBe(1);
    expect(rbe('flare')).toBe(5);
    expect(rbe('shade')).toBe(11);
    expect(rbe('plated')).toBe(23);
    expect(rbe('twin')).toBe(23);
    expect(rbe('prism')).toBe(47);
    expect(rbe('shellback')).toBe(104);
    expect(rbe('carrier')).toBe(616);
    expect(rbe('battlecruiser')).toBe(3164);
    expect(rbe('dreadnought')).toBe(16656);
    expect(rbe('phantom')).toBe(1024);
  });
  it('fortified doubles plated/shellback/ship HP only', () => {
    expect(effectiveHp('shellback', { fortified: true })).toBe(20);
    expect(effectiveHp('plated', { fortified: true })).toBe(2);
    expect(effectiveHp('carrier', { fortified: true })).toBe(400);
    expect(effectiveHp('flare', { fortified: true })).toBe(1);
  });
  it('regen ceilings', () => {
    expect(nextRegrowKind('spark', 'flare')).toBe('glide');
    expect(nextRegrowKind('flare', 'frost')).toBe('frost');
    expect(nextRegrowKind('prism', 'shellback')).toBe('shellback');
    expect(nextRegrowKind('shellback', 'shellback')).toBeUndefined();
  });
  it('every ship is a ship', () => {
    for (const k of ['carrier', 'battlecruiser', 'dreadnought', 'phantom', 'titan'] as const) expect(ENEMIES[k].isShip).toBe(true);
  });
});

describe('immunity', () => {
  it('core table', () => {
    expect(canDamage({ kind: 'plated', frozen: false, damageType: 'sharp' })).toBe(false);
    expect(canDamage({ kind: 'plated', frozen: false, damageType: 'explosive' })).toBe(true);
    expect(canDamage({ kind: 'shade', frozen: false, damageType: 'explosive' })).toBe(false);
    expect(canDamage({ kind: 'psi', frozen: false, damageType: 'energy' })).toBe(false);
    expect(canDamage({ kind: 'psi', frozen: false, damageType: 'psionic' })).toBe(false);
    expect(canDamage({ kind: 'twin', frozen: false, damageType: 'cryo' })).toBe(false);
    expect(canDamage({ kind: 'phantom', frozen: false, damageType: 'normal' })).toBe(true);
    expect(canDamage({ kind: 'spark', frozen: true, damageType: 'sharp' })).toBe(false);
    expect(canDamage({ kind: 'spark', frozen: true, damageType: 'sharp', canHitFrozen: true })).toBe(true);
  });
});

describe('economy', () => {
  it('prices round to nearest 5', () => {
    expect(priceFor(200, 'officer')).toBe(200);
    expect(priceFor(200, 'cadet')).toBe(170);
    expect(priceFor(200, 'commander')).toBe(215);
    expect(priceFor(200, 'last_stand')).toBe(240);
  });
  it('diminishing income', () => {
    expect(incomePerPop(50)).toBe(1);
    expect(incomePerPop(55)).toBe(0.5);
    expect(incomePerPop(70)).toBe(0.2);
    expect(incomePerPop(90)).toBe(0.1);
    expect(incomePerPop(101)).toBe(0.05);
    expect(endOfRoundBonus(1)).toBe(101);
  });
});
