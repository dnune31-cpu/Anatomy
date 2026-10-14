/**
 * Damage-type immunity table — the ONE place to tweak which damage types can hurt which enemies.
 *
 *   sharp      blocked by Plated (lead-like) and the Phantom Ship; also by FROZEN layers
 *   explosive  blocked by Shade, Twin and the Phantom Ship
 *   cryo       blocked by Frost, Twin, Plated and the Phantom Ship (also immune to freeze)
 *   energy     blocked by Psi
 *   psionic    blocked by Psi
 *   normal     hits everything
 *
 * An immune hit still consumes the projectile's pierce (the shot "clinks" off) but deals no damage.
 */
import type { DamageType, EnemyKind } from './types';

export const IMMUNITY: Record<EnemyKind, DamageType[]> = {
  spark: [], glide: [], dart: [], comet: [], flare: [],
  shade: ['explosive'],
  frost: ['cryo'],
  psi: ['energy', 'psionic'],
  plated: ['sharp', 'cryo'],
  twin: ['explosive', 'cryo'],
  prism: [],
  shellback: [],
  carrier: [], battlecruiser: [], dreadnought: [], titan: [],
  phantom: ['sharp', 'explosive', 'cryo'],
};

/** Kinds that cannot be frozen (cryo-immune). Ships also ignore freeze unless the effect affectsShips. */
export function isFreezeImmune(kind: EnemyKind): boolean {
  return IMMUNITY[kind].includes('cryo');
}

export interface DamageCheck {
  kind: EnemyKind;
  frozen: boolean;
  damageType: DamageType;
  ignoresImmunity?: boolean;
  canHitFrozen?: boolean;
}

/** True if the hit deals damage. */
export function canDamage(c: DamageCheck): boolean {
  if (c.ignoresImmunity || c.damageType === 'normal') return true;
  if (IMMUNITY[c.kind].includes(c.damageType)) return false;
  if (c.frozen && c.damageType === 'sharp' && !c.canHitFrozen) return false;
  return true;
}

export const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  sharp: 'Sharp', explosive: 'Explosive', cryo: 'Cryo', energy: 'Energy', psionic: 'Psionic', normal: 'Normal',
};
