import type { GameState, LeaderboardEntry } from "@/types/game";

// ─── LEVEL & XP ──────────────────────────────────────────────────────────────

/**
 * XP thresholds for canonical exponential model (level N starts at this XP).
 * Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 500, Level 5: 1000,
 * Level 6: 2000, Level 7: 4000, Level 8: 8000, Level 9: 16000, Level 10: 32000.
 * Level 11+: doubles each level (64000, 128000, ...).
 *
 * NOTE: The current useGameState.addXP() uses a LINEAR formula
 *   `Math.floor(totalXP / 100) + 1` which is NOT equivalent to the exponential
 *   thresholds above (they diverge at XP >= 250). computeLevel() below uses the
 *   linear formula to match current impl. xpForLevel() uses the linear formula
 *   up to level 10, then switches to exponential doubling.
 */
export const LEVEL_XP_THRESHOLDS: readonly number[] = [
  0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000,
];

/** Linear model: level N requires (N-1)*100 XP. Matches useGameState.addXP(). */
export function computeLevel(totalXP: number): number {
  if (!Number.isFinite(totalXP) || totalXP < 0) return 1;
  return Math.floor(totalXP / 100) + 1;
}

/** XP threshold for level N. Linear up to 10, exponential beyond. */
export function xpForLevel(level: number): number {
  if (!Number.isFinite(level) || level < 1) return 0;
  if (level <= 10) return (level - 1) * 100;
  const base = LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  return base * Math.pow(2, level - 11);
}

/** XP needed to reach next level from current total XP. */
export function xpToNextLevel(totalXP: number): number {
  if (!Number.isFinite(totalXP)) return 0;
  const level = computeLevel(totalXP);
  return Math.max(0, xpForLevel(level + 1) - totalXP);
}

// ─── REWARDS ──────────────────────────────────────────────────────────────────

export const XP_PER_ACTION = {
  eat: 5,
  work: 15,
  fnfWin: 50,
  fnfLose: 10,
  explore: 8,
  bathroom: 3,
  pet: 2,
  daily: 20,
} as const;

export type XpAction = keyof typeof XP_PER_ACTION;

export const COIN_PER_ACTION = {
  eat: 1,
  work: 10,
  fnfWin: 50,
  fnfLose: 5,
  explore: 2,
  bathroom: 10,
  pet: 0,
  daily: 25,
} as const;

export type CoinAction = keyof typeof COIN_PER_ACTION;

export const ACHIEVEMENT_XP_REWARD = 50;
export const ACHIEVEMENT_COIN_REWARD = 25;

// ─── BOOSTS ───────────────────────────────────────────────────────────────────

export const BOOST_CAPS = {
  xpBoost: 300,
  coinBoost: 300,
  speedBoost: 200,
  luckBoost: 300,
} as const;

export type BoostType = keyof typeof BOOST_CAPS;

export function applyBoost(base: number, boosts: number[], cap: number): number {
  if (!Number.isFinite(base) || base < 0) return 0;
  if (boosts.length === 0) return base;
  const totalBoost = Math.min(
    Math.max(0, boosts.reduce((sum, b) => sum + (Number.isFinite(b) && b >= 0 ? b : 0), 0)),
    cap,
  );
  return Math.floor(base * (1 + totalBoost / 100));
}

export function applyStateBoost(base: number, boost: number, cap: number): number {
  if (!Number.isFinite(base) || base < 0) return 0;
  const clamped = Math.min(Math.max(0, Number.isFinite(boost) ? boost : 0), cap);
  return Math.floor(base * (1 + clamped / 100));
}

export function computeXPReward(action: XpAction, state: Pick<GameState, "xpBoost">): number {
  const base = XP_PER_ACTION[action] ?? 0;
  return applyStateBoost(base, state.xpBoost, BOOST_CAPS.xpBoost);
}

export function computeCoinReward(action: CoinAction, state: Pick<GameState, "coinBoost">): number {
  const base = COIN_PER_ACTION[action] ?? 0;
  return applyStateBoost(base, state.coinBoost, BOOST_CAPS.coinBoost);
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  xpReward?: number;
  coinReward?: number;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: "first_meal", name: "Primeira Refeicao", description: "Coma sua primeira comida", condition: (s) => s.foodEaten >= 1, xpReward: 50, coinReward: 10 },
  { id: "food_10", name: "Banquete", description: "Coma 10 refeicoes", condition: (s) => s.foodEaten >= 10, xpReward: 100, coinReward: 25 },
  { id: "food_100", name: "Chef Capivaril", description: "Coma 100 refeicoes", condition: (s) => s.foodEaten >= 100, xpReward: 500, coinReward: 100 },
  { id: "first_job", name: "Primeiro Emprego", description: "Trabalhe pela primeira vez", condition: (s) => s.workCount >= 1, xpReward: 30, coinReward: 10 },
  { id: "work_10", name: "Trabalhador", description: "Trabalhe 10 vezes", condition: (s) => s.workCount >= 10, xpReward: 150, coinReward: 50 },
  { id: "work_50", name: "Workaholic", description: "Trabalhe 50 vezes", condition: (s) => s.workCount >= 50, xpReward: 400, coinReward: 150 },
  { id: "fnf_first_song", name: "Friday Night Capy", description: "Complete sua primeira musica no FNF", condition: (s) => s.fnfSongsCompleted >= 1, xpReward: 75, coinReward: 20 },
  { id: "fnf_5_songs", name: "Estrela do Funk", description: "Complete 5 musicas no FNF", condition: (s) => s.fnfSongsCompleted >= 5, xpReward: 200, coinReward: 75 },
  { id: "fnf_million", name: "Million Dollar Combo", description: "Reivindique a recompensa do milhao no FNF", condition: (s) => s.millionRewardClaimed === true, xpReward: 1000, coinReward: 1000 },
  { id: "first_pet", name: "Amigos Para Sempre", description: "Faca carinho na capivara pela primeira vez", condition: (s) => s.affectionCount >= 1, xpReward: 20, coinReward: 5 },
  { id: "pet_50", name: "Amante de Capivaras", description: "Faca carinho 50 vezes", condition: (s) => s.affectionCount >= 50, xpReward: 150, coinReward: 50 },
  { id: "first_bathroom", name: "Higienico", description: "Use o banheiro pela primeira vez", condition: (s) => s.bathroomCount >= 1, xpReward: 15, coinReward: 10 },
  { id: "bathroom_20", name: "Mestre da Limpeza", description: "Use o banheiro 20 vezes", condition: (s) => s.bathroomCount >= 20, xpReward: 80, coinReward: 60 },
  { id: "first_color", name: "Estiloso", description: "Mude a cor da capivara pela primeira vez", condition: (s) => s.colorChanges >= 1, xpReward: 25, coinReward: 5 },
  { id: "first_clothing", name: " fashionista", description: "Vista uma roupa na capivara", condition: (s) => s.ownedClothing.length >= 1, xpReward: 50, coinReward: 15 },
  { id: "level_5", name: "Veterano", description: "Alcance o nivel 5", condition: (s) => computeLevel(s.totalXP) >= 5, xpReward: 100, coinReward: 50 },
  { id: "level_10", name: "Legendario", description: "Alcance o nivel 10", condition: (s) => computeLevel(s.totalXP) >= 10, xpReward: 500, coinReward: 250 },
];

export function getNewAchievements(
  state: GameState,
  unlockedIds: ReadonlySet<string>,
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id) && a.condition(state));
}

// ─── RANKINGS ───────────────────────────────────────────────────────────────

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.level !== a.level) return b.level - a.level;
    return a.timestamp - b.timestamp;
  });
}

export function assignRanks(entries: LeaderboardEntry[]): (LeaderboardEntry & { rank: number })[] {
  return sortLeaderboard(entries).map((entry, index) => ({ ...entry, rank: index + 1 }));
}

// ─── SURVIVAL ───────────────────────────────────────────────────────────────

export function isCapyDead(state: Pick<GameState, "alive" | "health">): boolean {
  return !state.alive || state.health <= 0;
}

export function onDeath(state: GameState): GameState {
  return { ...state, alive: false, health: 0, hunger: 0, happiness: 0 };
}
