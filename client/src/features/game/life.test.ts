import { describe, it, expect, vi } from "vitest";
import {
  calculateAge,
  clampStat,
  applyStatDecay,
  calculateHealthPenalty,
  tickLifeState,
  createInitialLifeState,
  calculateAgeFromGameState,
} from "./life";
import type { GameStats, LifeState } from "./life";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const FULL_STATS: GameStats = {
  hunger: 100,
  happiness: 100,
  energy: 100,
  thirst: 100,
  hygiene: 100,
  health: 100,
};

describe("calculateAge", () => {
  it("returns ~2 years for a birth 2 years ago", () => {
    const now = 1_000_000_000_000;
    const birth = now - 2 * MS_PER_YEAR;
    expect(calculateAge(birth, now)).toBe(2);
  });

  it("returns 0 when birth is in the future", () => {
    const now = 1_000_000_000_000;
    expect(calculateAge(now + 10_000, now)).toBe(0);
  });

  it("returns 0 for NaN timestamps", () => {
    const now = 1_000_000_000_000;
    expect(calculateAge(NaN, now)).toBe(0);
    expect(calculateAge(now, NaN)).toBe(0);
  });

  it("returns 0 for negative timestamps", () => {
    const now = 1_000_000_000_000;
    expect(calculateAge(-1, now)).toBe(0);
    expect(calculateAge(now, -1)).toBe(0);
  });

  it("returns 0 for zero timestamps", () => {
    const now = 1_000_000_000_000;
    expect(calculateAge(0, now)).toBe(0);
    expect(calculateAge(now, 0)).toBe(0);
  });

  it("returns 0 when birth is exactly now", () => {
    const now = 1_000_000_000_000;
    expect(calculateAge(now, now)).toBe(0);
  });

  it("returns a positive number for a very old birth", () => {
    const birth = 1;
    const now = birth + 100 * MS_PER_YEAR;
    expect(calculateAge(birth, now)).toBe(100);
  });

  it("floors fractional years", () => {
    const now = 1_000_000_000_000;
    const birth = now - Math.floor(1.5 * MS_PER_YEAR);
    expect(calculateAge(birth, now)).toBe(1);
  });
});

describe("clampStat", () => {
  it("returns 50 for input 50", () => {
    expect(clampStat(50)).toBe(50);
  });

  it("returns 0 for input -10", () => {
    expect(clampStat(-10)).toBe(0);
  });

  it("returns 100 for input 150", () => {
    expect(clampStat(150)).toBe(100);
  });

  it("returns 0 for NaN", () => {
    expect(clampStat(NaN)).toBe(0);
  });

  it("returns 100 for Infinity", () => {
    expect(clampStat(Infinity)).toBe(100);
  });
});

describe("applyStatDecay", () => {
  it("decreases hunger by 0.5 per minute", () => {
    const result = applyStatDecay(FULL_STATS, 60_000);
    expect(result.hunger).toBe(99.5);
  });

  it("changes nothing for 0 deltaMs", () => {
    const result = applyStatDecay(FULL_STATS, 0);
    expect(result).toEqual(FULL_STATS);
    expect(result).not.toBe(FULL_STATS);
  });

  it("decreases all decaying stats proportionally after 10 minutes", () => {
    const result = applyStatDecay(FULL_STATS, 600_000);
    expect(result.hunger).toBe(100 - 0.5 * 10);
    expect(result.happiness).toBe(100 - 0.3 * 10);
    expect(result.energy).toBe(100 - 0.4 * 10);
    expect(result.thirst).toBe(100 - 0.6 * 10);
    expect(result.hygiene).toBe(100 - 0.2 * 10);
    expect(result.health).toBe(100);
  });

  it("clamps stats at 0", () => {
    const lowStats: GameStats = {
      hunger: 0,
      happiness: 0,
      energy: 0.1,
      thirst: 0,
      hygiene: 0,
      health: 100,
    };
    const result = applyStatDecay(lowStats, 60_000);
    expect(result.hunger).toBe(0);
    expect(result.energy).toBe(0);
  });

  it("returns unchanged copy for negative deltaMs", () => {
    const result = applyStatDecay(FULL_STATS, -60_000);
    expect(result).toEqual(FULL_STATS);
    expect(result).not.toBe(FULL_STATS);
  });

  it("returns unchanged copy for NaN deltaMs", () => {
    const result = applyStatDecay(FULL_STATS, NaN);
    expect(result).toEqual(FULL_STATS);
    expect(result).not.toBe(FULL_STATS);
  });
});

describe("calculateHealthPenalty", () => {
  it("returns 0 when all stats are >= 20", () => {
    const stats: GameStats = { ...FULL_STATS, hunger: 50, thirst: 50, hygiene: 50 };
    expect(calculateHealthPenalty(stats)).toBe(0);
  });

  it("returns positive penalty when some stats are below 20", () => {
    const stats: GameStats = { ...FULL_STATS, hunger: 10, thirst: 50, hygiene: 50 };
    expect(calculateHealthPenalty(stats)).toBe(1.0);
  });

  it("returns larger penalty for very low stats", () => {
    const stats: GameStats = { ...FULL_STATS, hunger: 0, thirst: 0, hygiene: 0 };
    expect(calculateHealthPenalty(stats)).toBe(5.0);
  });

  it("returns maximum penalty when all relevant stats are 0", () => {
    const stats: GameStats = { ...FULL_STATS, hunger: 0, thirst: 0, hygiene: 0 };
    expect(calculateHealthPenalty(stats)).toBe(5.0);
  });
});

describe("tickLifeState", () => {
  it("decays stats and keeps capybara alive when healthy", () => {
    const state: LifeState = {
      alive: true,
      age: 5,
      stats: { ...FULL_STATS },
      totalScore: 0,
    };
    const result = tickLifeState(state, 60_000);
    expect(result.alive).toBe(true);
    expect(result.stats.hunger).toBe(99.5);
    expect(result.stats.health).toBe(100);
  });

  it("kills capybara when health drops to 0", () => {
    const dyingState: LifeState = {
      alive: true,
      age: 5,
      stats: { ...FULL_STATS, hunger: 0, thirst: 0, hygiene: 0, health: 1 },
      totalScore: 0,
    };
    const result = tickLifeState(dyingState, 60_000);
    expect(result.alive).toBe(false);
    expect(result.stats.health).toBe(0);
  });

  it("keeps dead capybara unchanged on subsequent ticks", () => {
    const deadState: LifeState = {
      alive: false,
      age: 5,
      stats: { ...FULL_STATS, hunger: 0, health: 0 },
      totalScore: 0,
    };
    const result = tickLifeState(deadState, 60_000);
    expect(result).toBe(deadState);
  });

  it("returns an unchanged copy for 0 deltaMs", () => {
    const state: LifeState = {
      alive: true,
      age: 5,
      stats: { ...FULL_STATS },
      totalScore: 0,
    };
    const result = tickLifeState(state, 0);
    expect(result.alive).toBe(true);
    expect(result.stats.hunger).toBe(100);
    expect(result).not.toBe(state);
  });

  it("returns an unchanged copy for negative deltaMs", () => {
    const state: LifeState = {
      alive: true,
      age: 5,
      stats: { ...FULL_STATS },
      totalScore: 0,
    };
    const result = tickLifeState(state, -60_000);
    expect(result.stats.hunger).toBe(100);
    expect(result).not.toBe(state);
  });

  it("compounds stat decay and health penalty correctly", () => {
    const testState: LifeState = {
      alive: true,
      age: 5,
      stats: { ...FULL_STATS, hunger: 20.1, thirst: 20.1, hygiene: 20.1, health: 10 },
      totalScore: 0,
    };
    const result = tickLifeState(testState, 600_000);
    expect(result.stats.hunger).toBeLessThan(20.1);
    expect(result.stats.health).toBeLessThan(10);
  });
});

describe("createInitialLifeState", () => {
  it("creates a state with alive=true, all stats at 100, age 0, score 0", () => {
    const state = createInitialLifeState();
    expect(state.alive).toBe(true);
    expect(state.age).toBe(0);
    expect(state.totalScore).toBe(0);
    expect(state.stats).toEqual({
      hunger: 100,
      happiness: 100,
      energy: 100,
      thirst: 100,
      hygiene: 100,
      health: 100,
    });
  });
});

describe("calculateAgeFromGameState", () => {
  it("calculates age in minutes from capyzen_start", () => {
    const now = 1_000_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    const gameState = { capyzen_start: now - 2 * MS_PER_YEAR };
    const expectedMinutes = Math.floor(2 * MS_PER_YEAR / 60000);
    expect(calculateAgeFromGameState(gameState)).toBe(expectedMinutes);
  });

  it("returns 0 when capyzen_start is missing", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000_000_000);
    expect(calculateAgeFromGameState({})).toBe(0);
  });
});
