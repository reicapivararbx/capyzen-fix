export interface GameStats {
  hunger: number;
  happiness: number;
  energy: number;
  thirst: number;
  hygiene: number;
  health: number;
}

export interface LifeState {
  alive: boolean;
  age: number;
  stats: GameStats;
  totalScore: number;
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export function calculateAge(birthTimestampMs: number, nowTimestampMs: number): number {
  if (!Number.isFinite(birthTimestampMs) || !Number.isFinite(nowTimestampMs)) return 0;
  if (birthTimestampMs <= 0 || nowTimestampMs <= 0) return 0;
  if (birthTimestampMs > nowTimestampMs) return 0;
  const ageMs = nowTimestampMs - birthTimestampMs;
  return Math.floor(ageMs / MS_PER_YEAR);
}

export function clampStat(value: number): number {
  if (!Number.isFinite(value)) {
    return value > 0 ? 100 : 0;
  }
  return Math.max(0, Math.min(100, value));
}

export function applyStatDecay(stats: GameStats, deltaMs: number): GameStats {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return { ...stats };

  const minutes = deltaMs / 60000;

  return {
    hunger: clampStat(stats.hunger - 0.5 * minutes),
    happiness: clampStat(stats.happiness - 0.3 * minutes),
    energy: clampStat(stats.energy - 0.4 * minutes),
    thirst: clampStat(stats.thirst - 0.6 * minutes),
    hygiene: clampStat(stats.hygiene - 0.2 * minutes),
    health: stats.health,
  };
}

export function calculateHealthPenalty(stats: GameStats): number {
  let penalty = 0;
  if (stats.hunger < 20) penalty += (20 - stats.hunger) * 0.1;
  if (stats.thirst < 20) penalty += (20 - stats.thirst) * 0.1;
  if (stats.hygiene < 20) penalty += (20 - stats.hygiene) * 0.05;
  return Math.max(0, Math.round(penalty * 10) / 10);
}

export function tickLifeState(current: LifeState, deltaMs: number): LifeState {
  if (!current.alive) return current;
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return { ...current };

  const decayedStats = applyStatDecay(current.stats, deltaMs);
  const penalty = calculateHealthPenalty(decayedStats);
  const newHealth = clampStat(decayedStats.health - penalty);

  return {
    alive: newHealth > 0,
    age: current.age,
    stats: {
      ...decayedStats,
      health: newHealth > 0 ? newHealth : 0,
    },
    totalScore: current.totalScore,
  };
}

export function createInitialLifeState(): LifeState {
  return {
    alive: true,
    age: 0,
    stats: {
      hunger: 100,
      happiness: 100,
      energy: 100,
      thirst: 100,
      hygiene: 100,
      health: 100,
    },
    totalScore: 0,
  };
}

export function calculateAgeFromGameState(gameState?: unknown): number {
  if (gameState && typeof gameState === 'object') {
    const maybe = gameState as Record<string, unknown>;
    const start = maybe['capyzen_start'];
    if (typeof start === 'number' && Number.isFinite(start) && start > 0) {
      const ageMs = Date.now() - start;
      if (ageMs > 0) return Math.floor(ageMs / (24 * 60 * 60 * 1000));
    }
  }
  try {
    const raw = globalThis.localStorage?.getItem('capyzen_start');
    if (!raw) return 0;
    const birthTime = new Date(raw).getTime();
    if (!Number.isFinite(birthTime) || birthTime <= 0) return 0;
    const ageMs = Date.now() - birthTime;
    if (ageMs <= 0) return 0;
    return Math.floor(ageMs / (24 * 60 * 60 * 1000));
  } catch {
    return 0;
  }
}
