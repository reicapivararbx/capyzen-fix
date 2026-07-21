import { describe, it, expect } from "vitest";
import type { GameState } from "@/types/game";
import {
  applyPercentageBoost,
  applyXpBoost,
  applyCoinBoost,
  applySpeedBoost,
  applyLuckBonus,
  applyActionBoosts,
  getSpeedBoostPercent,
  hasShield,
  applyShieldAbsorb,
} from "./boost-effects";

function baseState(overrides: Record<string, unknown> = {}): GameState {
  return {
    coins: 0,
    level: 1,
    xp: 0,
    food: 0,
    poop: 0,
    hunger: 0,
    happiness: 0,
    sus: 0,
    x: 0,
    y: 0,
    speed: 0,
    alive: true,
    capyColor: "#C4A882",
    capySize: 50,
    totalScore: 0,
    totalXP: 0,
    foodEaten: 0,
    gamesPlayed: 0,
    workCount: 0,
    affectionCount: 0,
    bathroomCount: 0,
    colorChanges: 0,
    size: 1,
    inventory: {
      grama: 0, batata: 0, hamburger: 0, refri: 0, feijao: 0,
      hotdog: 0, pizza: 0, sushi: 0, tacos: 0, sorvete: 0,
      bolo: 0, chocolate: 0, maçã: 0, banana: 0, melancia: 0,
      morango: 0, uva: 0, cenoura: 0, brócolis: 0, espinafre: 0,
      tomate: 0, queijo: 0, iogurte: 0, leite: 0, pão: 0, arroz: 0,
    },
    energy: 100,
    thirst: 100,
    hygiene: 100,
    health: 100,
    equippedItems: [],
    playerName: "Player",
    capyName: "Capy",
    age: 0,
    fnfSongsCompleted: 0,
    fnfHighestCombo: 0,
    millionRewardClaimed: false,
    ...overrides,
  } as GameState;
}

describe("applyPercentageBoost", () => {
  it("returns base when boost is 0", () => {
    expect(applyPercentageBoost(100, 0)).toBe(100);
  });

  it("adds 10% to base value", () => {
    expect(applyPercentageBoost(100, 10)).toBe(110);
  });

  it("adds 50% to base value", () => {
    expect(applyPercentageBoost(10, 50)).toBe(15);
  });

  it("doubles value at 100% boost", () => {
    expect(applyPercentageBoost(10, 100)).toBe(20);
  });

  it("rounds fractional result (5 + 30% → 7)", () => {
    expect(applyPercentageBoost(5, 30)).toBe(7);
  });

  it("rounds fractional result (10 + 25% → 13)", () => {
    expect(applyPercentageBoost(10, 25)).toBe(13);
  });

  it("clamps negative boost to 0", () => {
    expect(applyPercentageBoost(10, -50)).toBe(10);
  });

  it("clamps NaN boost to 0", () => {
    expect(applyPercentageBoost(10, NaN)).toBe(10);
  });

  it("clamps Infinity boost to 0", () => {
    expect(applyPercentageBoost(10, Infinity)).toBe(10);
  });

  it("clamps undefined boost to 0", () => {
    expect(applyPercentageBoost(10, undefined as unknown as number)).toBe(10);
  });

  it("clamps null boost to 0", () => {
    expect(applyPercentageBoost(10, null as unknown as number)).toBe(10);
  });
});

describe("applyXpBoost", () => {
  it("returns base when boost is 0", () => {
    expect(applyXpBoost(10, 0)).toBe(10);
  });

  it("adds 10% to base XP", () => {
    expect(applyXpBoost(100, 10)).toBe(110);
  });

  it("adds 50% to base XP", () => {
    expect(applyXpBoost(10, 50)).toBe(15);
  });

  it("doubles base XP at 100% boost", () => {
    expect(applyXpBoost(10, 100)).toBe(20);
  });

  it("rounds fractional result (5 + 30% → 7)", () => {
    expect(applyXpBoost(5, 30)).toBe(7);
  });

  it("clamps negative boost to 0", () => {
    expect(applyXpBoost(10, -50)).toBe(10);
  });

  it("clamps NaN boost to 0", () => {
    expect(applyXpBoost(10, NaN)).toBe(10);
  });

  it("clamps Infinity boost to 0", () => {
    expect(applyXpBoost(10, Infinity)).toBe(10);
  });
});

describe("applyCoinBoost", () => {
  it("returns base when boost is 0", () => {
    expect(applyCoinBoost(10, 0)).toBe(10);
  });

  it("adds 10% to base coins", () => {
    expect(applyCoinBoost(100, 10)).toBe(110);
  });

  it("doubles base coins at 100% boost", () => {
    expect(applyCoinBoost(10, 100)).toBe(20);
  });

  it("rounds fractional result (5 + 25% → 6)", () => {
    expect(applyCoinBoost(5, 25)).toBe(6);
  });

  it("clamps negative boost to 0", () => {
    expect(applyCoinBoost(10, -20)).toBe(10);
  });

  it("clamps NaN boost to 0", () => {
    expect(applyCoinBoost(10, NaN)).toBe(10);
  });
});

describe("applySpeedBoost", () => {
  it("returns base step at 0% boost", () => {
    expect(applySpeedBoost(15, 0)).toBe(15);
  });

  it("adds 10% to base step", () => {
    expect(applySpeedBoost(100, 10)).toBe(110);
  });

  it("doubles step at 100% boost", () => {
    expect(applySpeedBoost(15, 100)).toBe(30);
  });

  it("clamps negative boost to 0", () => {
    expect(applySpeedBoost(15, -30)).toBe(15);
  });

  it("clamps NaN boost to 0", () => {
    expect(applySpeedBoost(15, NaN)).toBe(15);
  });
});

describe("applyLuckBonus", () => {
  it("returns base when luck is 0", () => {
    expect(applyLuckBonus(10, 0)).toBe(10);
  });

  it("adds 10% luck bonus", () => {
    expect(applyLuckBonus(100, 10)).toBe(110);
  });

  it("adds 50% luck bonus", () => {
    expect(applyLuckBonus(10, 50)).toBe(15);
  });

  it("doubles value at 100% luck", () => {
    expect(applyLuckBonus(10, 100)).toBe(20);
  });

  it("rounds fractional result (10 + 25% → 13)", () => {
    expect(applyLuckBonus(10, 25)).toBe(13);
  });

  it("clamps negative luck to 0", () => {
    expect(applyLuckBonus(10, -100)).toBe(10);
  });

  it("clamps NaN luck to 0", () => {
    expect(applyLuckBonus(10, NaN)).toBe(10);
  });
});

describe("applyActionBoosts", () => {
  it("applies coinBoost and xpBoost with no luck", () => {
    const state = baseState({ xpBoost: 50, coinBoost: 25, luckBoost: 0 });
    const result = applyActionBoosts(20, 20, state);
    expect(result.coins).toBe(25);
    expect(result.xp).toBe(30);
  });

  it("returns base values when boosts are 0", () => {
    const state = baseState({ xpBoost: 0, coinBoost: 0, luckBoost: 0 });
    const result = applyActionBoosts(20, 20, state);
    expect(result.coins).toBe(20);
    expect(result.xp).toBe(20);
  });

  it("handles missing boost fields as 0", () => {
    const state = baseState();
    const result = applyActionBoosts(20, 20, state);
    expect(result.coins).toBe(20);
    expect(result.xp).toBe(20);
  });

  it("applies luck on top of coin/xp boost", () => {
    const state = baseState({ xpBoost: 0, coinBoost: 0, luckBoost: 50 });
    const result = applyActionBoosts(20, 20, state);
    expect(result.coins).toBe(30);
    expect(result.xp).toBe(30);
  });

  it("stacks coinBoost + luckBoost multiplicatively", () => {
    // 20 * 1.5 (coinBoost 50%) = 30, then 30 * 1.25 (luck 25%) = 38
    const state = baseState({ xpBoost: 0, coinBoost: 50, luckBoost: 25 });
    const result = applyActionBoosts(20, 20, state);
    expect(result.coins).toBe(38);
  });

  it("clamps negative boosts to safe behavior", () => {
    const state = baseState({ xpBoost: -50, coinBoost: -100, luckBoost: -10 });
    const result = applyActionBoosts(20, 20, state);
    expect(result.coins).toBe(20);
    expect(result.xp).toBe(20);
  });
});

describe("getSpeedBoostPercent", () => {
  it("returns speedBoost value when set", () => {
    const state = baseState({ speedBoost: 100 });
    expect(getSpeedBoostPercent(state)).toBe(100);
  });

  it("returns 0 when speedBoost is absent", () => {
    expect(getSpeedBoostPercent(baseState())).toBe(0);
  });

  it("clamps negative speedBoost to 0", () => {
    const state = baseState({ speedBoost: -20 });
    expect(getSpeedBoostPercent(state)).toBe(0);
  });
});

describe("hasShield", () => {
  it("returns true when shieldActive is true", () => {
    const state = baseState({ shieldActive: true });
    expect(hasShield(state)).toBe(true);
  });

  it("returns false when shieldActive is false", () => {
    const state = baseState({ shieldActive: false });
    expect(hasShield(state)).toBe(false);
  });

  it("returns false when shieldActive is absent", () => {
    expect(hasShield(baseState())).toBe(false);
  });
});

describe("applyShieldAbsorb", () => {
  it("returns full damage when shield is inactive", () => {
    expect(applyShieldAbsorb(50, false, 80)).toBe(50);
  });

  it("returns full damage when damage is 0", () => {
    expect(applyShieldAbsorb(0, true, 80)).toBe(0);
  });

  it("returns full damage when damage is negative", () => {
    expect(applyShieldAbsorb(-10, true, 80)).toBe(-10);
  });

  it("absorbs 80% of damage when shield strength is 80", () => {
    expect(applyShieldAbsorb(100, true, 80)).toBe(20);
  });

  it("absorbs 100% of damage when shield strength is 100", () => {
    expect(applyShieldAbsorb(100, true, 100)).toBe(0);
  });

  it("absorbs 10% of damage when shield strength is 10", () => {
    expect(applyShieldAbsorb(100, true, 10)).toBe(90);
  });

  it("clamps negative shield strength to 0 (no absorption)", () => {
    expect(applyShieldAbsorb(100, true, -50)).toBe(100);
  });

  it("clamps NaN shield strength to 0 (no absorption)", () => {
    expect(applyShieldAbsorb(100, true, NaN)).toBe(100);
  });

  it("rounds fractional remaining damage", () => {
    // 100 * (1 - 33/100) = 67
    expect(applyShieldAbsorb(100, true, 33)).toBe(67);
  });
});
