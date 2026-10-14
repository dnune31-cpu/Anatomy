import type { DifficultyDef, DifficultyId } from './types';
import { roundPrice } from './constants';

export const DIFFICULTIES: Record<DifficultyId, DifficultyDef> = {
  cadet:      { id: 'cadet',      name: 'Cadet',      subtitle: 'Easy',       startLives: 200, costMult: 0.85, finalRound: 40,  startCash: 650, startRound: 1 },
  officer:    { id: 'officer',    name: 'Officer',    subtitle: 'Medium',     startLives: 150, costMult: 1.0,  finalRound: 60,  startCash: 650, startRound: 1 },
  commander:  { id: 'commander',  name: 'Commander',  subtitle: 'Hard',       startLives: 100, costMult: 1.08, finalRound: 80,  startCash: 650, startRound: 1 },
  last_stand: { id: 'last_stand', name: 'Last Stand', subtitle: 'Impossible', startLives: 1,   costMult: 1.2,  finalRound: 100, startCash: 650, startRound: 1 },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ['cadet', 'officer', 'commander', 'last_stand'];

/** Final price of anything (tower or upgrade) for a difficulty, with an optional discount (0..1). */
export function priceFor(baseCost: number, difficulty: DifficultyId, discount = 0): number {
  const d = DIFFICULTIES[difficulty];
  return roundPrice(baseCost * d.costMult * (1 - discount));
}
