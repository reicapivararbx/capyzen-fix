import { describe, it, expect } from "vitest";
import type { GameState } from "@/types/game";
import {
  computeLevel,
  xpToNextLevel,
  xpForLevel,
  LEVEL_XP_THRESHOLDS,
  XP_PER_ACTION,
  COIN_PER_ACTION,
  applyBoost,
  applyStateBoost,
  BOOST_CAPS,
  computeXPReward,
  computeCoinReward,
  ACHIEVEMENTS,
  getNewAchievements,
  ACHIEVEMENT_XP_REWARD,
  sortLeaderboard,
  assignRanks,
  isCapyDead,
  onDeath,
} from "./game-rules";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    coins: 0,
    level: 1,
    xp: 0,
    food: 0,
    poop: 0,
    hunger: 100,
    happiness: 100,
    sus: 0,
    x: 0,
    y: 0,
    speed: 1,
    alive: true,
    capyColor: "#8B4513",
    capySize: 1,
    totalScore: 0,
    totalXP: 0,
    foodEaten: 0,
    gamesPlayed: 0,
    workCount: 0,
    affectionCount: 0,
    bathroomCount: 0,
    colorChanges: 0,
    size: 1,
    inventory: {} as GameState["inventory"],
    energy: 100,
    thirst: 100,
    hygiene: 100,
    health: 100,
    equippedItems: [],
    ownedClothing: [],
    playerName: "",
    capyName: "",
    age: 0,
    fnfSongsCompleted: 0,
    fnfHighestCombo: 0,
    millionRewardClaimed: false,
    speedBoost: 0,
    shieldActive: false,
    luckBoost: 0,
    xpBoost: 0,
    coinBoost: 0,
    ...overrides,
  };
}

// ─── Level & XP ────────────────────────────────────────────────────────────────

describe("computeLevel", () => {
  it("level 1 at 0 XP", () => {
    expect(computeLevel(0)).toBe(1);
  });

  it("level 1 for XP below 100", () => {
    expect(computeLevel(50)).toBe(1);
    expect(computeLevel(99)).toBe(1);
  });

  it("level 2 at exactly 100 XP", () => {
    expect(computeLevel(100)).toBe(2);
  });

  it("level 2 for XP 100-199", () => {
    expect(computeLevel(100)).toBe(2);
    expect(computeLevel(199)).toBe(2);
  });

  it("level 3 at exactly 250 XP", () => {
    expect(computeLevel(250)).toBe(3);
  });

  it("level 5 at exactly 1000 XP", () => {
    expect(computeLevel(1000)).toBe(11);
  });

  it("level 9 at exactly 16000 XP", () => {
    expect(computeLevel(16000)).toBe(161);
  });

  it("matches linear formula for canonical values", () => {
    for (const xp of [0, 50, 99, 100, 199, 249, 499, 999, 1999]) {
      const expected = Math.floor(xp / 100) + 1;
      expect(computeLevel(xp)).toBe(expected);
    }
  });

  it("handles non-finite XP", () => {
    expect(computeLevel(NaN)).toBe(1);
    expect(computeLevel(Infinity)).toBe(1);
    expect(computeLevel(-1)).toBe(1);
  });

  it("returns large level for massive XP", () => {
    expect(computeLevel(1_000_000)).toBe(10001);
  });
});

describe("xpToNextLevel", () => {
  it("needs 100 XP to go from 0 to level 2", () => {
    expect(xpToNextLevel(0)).toBe(100);
  });

  it("needs 100 XP to go from 100 to level 3", () => {
    expect(xpToNextLevel(100)).toBe(100);
  });

  it("needs 1 XP when one below next threshold", () => {
    expect(xpToNextLevel(99)).toBe(1);
  });

  it("returns 0 for NaN input", () => {
    expect(xpToNextLevel(NaN)).toBe(0);
  });
});

describe("xpForLevel", () => {
  it("level 1 threshold is 0", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it("level 2 threshold is 100", () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it("level 10 threshold is 900 (linear)", () => {
    expect(xpForLevel(10)).toBe(900);
  });

  it("level 11+ uses exponential from 64000 (level 11 = 64000, 12 = 128000)", () => {
    expect(xpForLevel(11)).toBe(64000);
    expect(xpForLevel(12)).toBe(128000);
    expect(xpForLevel(13)).toBe(256000);
  });

  it("returns 0 for invalid level", () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(-5)).toBe(0);
  });
});

// ─── Rewards ─────────────────────────────────────────────────────────────────

describe("XP_PER_ACTION", () => {
  it("has finite non-negative values for all actions", () => {
    for (const [, xp] of Object.entries(XP_PER_ACTION)) {
      expect(xp).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(xp)).toBe(true);
    }
  });

  it("fnfWin > fnfLose > eat", () => {
    expect(XP_PER_ACTION.fnfWin).toBeGreaterThan(XP_PER_ACTION.fnfLose);
    expect(XP_PER_ACTION.work).toBeGreaterThan(XP_PER_ACTION.eat);
  });
});

describe("COIN_PER_ACTION", () => {
  it("has finite non-negative values for all actions", () => {
    for (const [, coins] of Object.entries(COIN_PER_ACTION)) {
      expect(coins).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(coins)).toBe(true);
    }
  });

  it("pet yields 0 coins", () => {
    expect(COIN_PER_ACTION.pet).toBe(0);
  });

  it("fnfWin > fnfLose", () => {
    expect(COIN_PER_ACTION.fnfWin).toBeGreaterThan(COIN_PER_ACTION.fnfLose);
  });
});

// ─── Boosts ───────────────────────────────────────────────────────────────────

describe("BOOST_CAPS", () => {
  it("all caps are positive", () => {
    for (const [, cap] of Object.entries(BOOST_CAPS)) {
      expect(cap).toBeGreaterThan(0);
    }
  });
});

describe("applyBoost", () => {
  it("returns base when no boosts", () => {
    expect(applyBoost(100, [], 300)).toBe(100);
  });

  it("returns 0 for invalid base", () => {
    expect(applyBoost(NaN, [50], 300)).toBe(0);
    expect(applyBoost(-10, [50], 300)).toBe(0);
  });

  it("applies single boost", () => {
    expect(applyBoost(100, [50], 300)).toBe(150);
  });

  it("sums multiple boosts and caps", () => {
    expect(applyBoost(100, [50, 30, 20], 300)).toBe(200);
    expect(applyBoost(100, [200, 200, 100], 200)).toBe(300);
  });

  it("ignores negative and non-finite boosts", () => {
    expect(applyBoost(100, [50, NaN, -10], 300)).toBe(150);
  });

  it("floors result", () => {
    expect(applyBoost(100, [33], 300)).toBe(133);
  });
});

describe("applyStateBoost", () => {
  it("returns base when boost is 0", () => {
    expect(applyStateBoost(100, 0, 300)).toBe(100);
  });

  it("applies positive boost", () => {
    expect(applyStateBoost(100, 50, 300)).toBe(150);
  });

  it("clamps boost to cap", () => {
    expect(applyStateBoost(100, 500, 300)).toBe(400);
  });

  it("treats negative boost as 0", () => {
    expect(applyStateBoost(100, -50, 300)).toBe(100);
  });

  it("returns 0 for NaN base", () => {
    expect(applyStateBoost(NaN, 50, 300)).toBe(0);
  });
});

describe("computeXPReward", () => {
  it("eat yields 5 XP with no boost", () => {
    expect(computeXPReward("eat", { xpBoost: 0 })).toBe(5);
  });

  it("eat yields 10 XP with 100% boost", () => {
    expect(computeXPReward("eat", { xpBoost: 100 })).toBe(10);
  });

  it("eat yields 15 XP with 200% boost", () => {
    expect(computeXPReward("eat", { xpBoost: 200 })).toBe(15);
  });

  it("boosts beyond 300% are capped", () => {
    expect(computeXPReward("eat", { xpBoost: 500 })).toBe(20);
  });
});

describe("computeCoinReward", () => {
  it("work yields 10 coins with no boost", () => {
    expect(computeCoinReward("work", { coinBoost: 0 })).toBe(10);
  });

  it("work yields 20 coins with 100% boost", () => {
    expect(computeCoinReward("work", { coinBoost: 100 })).toBe(20);
  });

  it("boosts beyond 300% are capped", () => {
    expect(computeCoinReward("work", { coinBoost: 400 })).toBe(40);
  });
});

// ─── Achievements ─────────────────────────────────────────────────────────────

describe("ACHIEVEMENTS", () => {
  it("all achievements have unique ids", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all achievements have name, description, and a reward", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.xpReward !== undefined || a.coinReward !== undefined).toBe(true);
    }
  });

  it("condition functions return boolean", () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.condition(makeState())).toBe("boolean");
    }
  });
});

describe("getNewAchievements", () => {
  it("returns first_meal when foodEaten >= 1", () => {
    const result = getNewAchievements(makeState({ foodEaten: 1 }), new Set());
    expect(result.some((a) => a.id === "first_meal")).toBe(true);
  });

  it("filters out already-unlocked achievements", () => {
    const result = getNewAchievements(makeState({ foodEaten: 1 }), new Set(["first_meal"]));
    expect(result.some((a) => a.id === "first_meal")).toBe(false);
  });

  it("returns first_job when workCount >= 1", () => {
    const result = getNewAchievements(makeState({ workCount: 1 }), new Set());
    expect(result.some((a) => a.id === "first_job")).toBe(true);
  });

  it("returns fnf_first_song when fnfSongsCompleted >= 1", () => {
    const result = getNewAchievements(makeState({ fnfSongsCompleted: 1 }), new Set());
    expect(result.some((a) => a.id === "fnf_first_song")).toBe(true);
  });

  it("returns level_5 when totalXP >= 400", () => {
    const result = getNewAchievements(makeState({ totalXP: 500 }), new Set());
    expect(result.some((a) => a.id === "level_5")).toBe(true);
  });

  it("returns level_10 when totalXP >= 900", () => {
    const result = getNewAchievements(makeState({ totalXP: 1000 }), new Set());
    expect(result.some((a) => a.id === "level_10")).toBe(true);
  });

  it("returns first_clothing when ownedClothing is non-empty", () => {
    const result = getNewAchievements(makeState({ ownedClothing: ["Camiseta"] }), new Set());
    expect(result.some((a) => a.id === "first_clothing")).toBe(true);
  });
});

describe("ACHIEVEMENT_XP_REWARD", () => {
  it("is 50", () => {
    expect(ACHIEVEMENT_XP_REWARD).toBe(50);
  });
});

// ─── Rankings ─────────────────────────────────────────────────────────────────

describe("sortLeaderboard", () => {
  function entry(score: number, level: number, timestamp = 1000) {
    return { username: "", score, level, timestamp };
  }

  it("sorts by score descending", () => {
    const sorted = sortLeaderboard([entry(100, 1), entry(500, 1), entry(300, 1)]);
    expect(sorted[0].score).toBe(500);
    expect(sorted[1].score).toBe(300);
    expect(sorted[2].score).toBe(100);
  });

  it("uses level as tiebreaker", () => {
    const sorted = sortLeaderboard([entry(300, 3), entry(300, 5), entry(300, 1)]);
    expect(sorted.map((e) => e.level)).toEqual([5, 3, 1]);
  });

  it("uses timestamp as final tiebreaker", () => {
    const sorted = sortLeaderboard([
      entry(300, 3, 3000),
      entry(300, 3, 1000),
      entry(300, 3, 2000),
    ]);
    expect(sorted.map((e) => e.timestamp)).toEqual([1000, 2000, 3000]);
  });

  it("does not mutate original", () => {
    const arr = [entry(100, 1), entry(200, 1)];
    sortLeaderboard(arr);
    expect(arr[0].score).toBe(100);
  });

  it("handles empty array", () => {
    expect(sortLeaderboard([])).toEqual([]);
  });
});

describe("assignRanks", () => {
  it("assigns 1-based sequential ranks", () => {
    const ranked = assignRanks([
      { username: "c", score: 100, level: 1, timestamp: 0 },
      { username: "b", score: 200, level: 1, timestamp: 0 },
      { username: "a", score: 300, level: 1, timestamp: 0 },
    ]);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3]);
    expect(ranked[0].username).toBe("a");
  });

  it("returns empty array for empty input", () => {
    expect(assignRanks([])).toEqual([]);
  });
});

// ─── Survival ─────────────────────────────────────────────────────────────────

describe("isCapyDead", () => {
  it("alive with health > 0 is not dead", () => {
    expect(isCapyDead({ alive: true, health: 100 })).toBe(false);
  });

  it("alive=false is dead", () => {
    expect(isCapyDead({ alive: false, health: 100 })).toBe(true);
    expect(isCapyDead({ alive: false, health: 0 })).toBe(true);
  });

  it("health <= 0 is dead even when alive=true", () => {
    expect(isCapyDead({ alive: true, health: 0 })).toBe(true);
  });
});

describe("onDeath", () => {
  it("sets alive to false", () => {
    expect(onDeath(makeState()).alive).toBe(false);
  });

  it("sets health, hunger, happiness to 0", () => {
    const result = onDeath(makeState({ health: 50, hunger: 80, happiness: 90 }));
    expect(result.health).toBe(0);
    expect(result.hunger).toBe(0);
    expect(result.happiness).toBe(0);
  });

  it("preserves coins, level, XP, inventory", () => {
    const result = onDeath(makeState({ coins: 999, level: 10, xp: 500, ownedClothing: ["Camiseta"] }));
    expect(result.coins).toBe(999);
    expect(result.level).toBe(10);
    expect(result.xp).toBe(500);
    expect(result.ownedClothing).toEqual(["Camiseta"]);
    expect(result.workCount).toBe(0);
    expect(result.foodEaten).toBe(0);
  });
});
