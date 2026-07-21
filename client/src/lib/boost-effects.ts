import type { GameState } from "@/types/game";

/** Clamp a boost percentage to a safe non-negative finite number. NaN/Infinity/negative → 0. */
function sanitizeBoost(value: number | undefined): number {
  if (!Number.isFinite(value) || (value as number) < 0) return 0;
  return value as number;
}

/** Apply a percentage boost to a base value. 10 means +10%, 100 means +100%. Integer-safe rounding. */
export function applyPercentageBoost(baseValue: number, boostPercent: number): number {
  return Math.round(baseValue * (1 + sanitizeBoost(boostPercent) / 100));
}

/** Apply XP boost multiplier to base XP reward. */
export function applyXpBoost(baseXp: number, boostPercent: number): number {
  return applyPercentageBoost(baseXp, boostPercent);
}

/** Apply coin boost multiplier to base coin reward. */
export function applyCoinBoost(baseCoins: number, boostPercent: number): number {
  return applyPercentageBoost(baseCoins, boostPercent);
}

/** Calculate movement step from base step and speed boost. */
export function applySpeedBoost(baseStep: number, boostPercent: number): number {
  return applyPercentageBoost(baseStep, boostPercent);
}

/** Apply luck bonus to a value. Deterministic: luck percent becomes extra reward percentage. */
export function applyLuckBonus(value: number, luckValue: number): number {
  return applyPercentageBoost(value, luckValue);
}

/** Apply all relevant boosts to action rewards from GameState. Luck stacks multiplicatively on top. */
export function applyActionBoosts(
  baseCoins: number,
  baseXp: number,
  gameState: Pick<GameState, "coinBoost" | "xpBoost" | "luckBoost">,
): { coins: number; xp: number } {
  const coins = applyLuckBonus(applyCoinBoost(baseCoins, gameState.coinBoost), gameState.luckBoost);
  const xp = applyLuckBonus(applyXpBoost(baseXp, gameState.xpBoost), gameState.luckBoost);
  return { coins, xp };
}

/** Get speedBoost percentage from GameState (0 if undefined). */
export function getSpeedBoostPercent(gameState: Pick<GameState, "speedBoost">): number {
  return sanitizeBoost(gameState.speedBoost);
}

/** Check if shield is active (false if undefined). */
export function hasShield(gameState: Pick<GameState, "shieldActive">): boolean {
  return gameState.shieldActive === true;
}

/** Apply shield damage absorption: returns remaining damage after shield absorbs shieldStrength%. */
export function applyShieldAbsorb(
  damage: number,
  shieldActive: boolean,
  shieldStrength: number,
): number {
  if (!shieldActive || damage <= 0) {
    return damage;
  }
  const clampedStrength = sanitizeBoost(shieldStrength);
  return Math.max(0, Math.round(damage * (1 - clampedStrength / 100)));
}
