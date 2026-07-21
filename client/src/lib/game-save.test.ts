import { describe, it, expect, beforeEach, vi } from "vitest";
import type { GameState } from "@/types/game";
import {
  DEFAULT_GAME_STATE,
  parseGameState,
  loadGameState,
  saveGameState,
  updateGameState,
} from "./game-save";

function createMockStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    length: 0,
  };
}

let mockStorage: Storage;

beforeEach(() => {
  mockStorage = createMockStorage();
  vi.stubGlobal("localStorage", mockStorage);
});

describe("parseGameState", () => {
  it("returns defaults when save is absent (null)", () => {
    const state = parseGameState(null);
    expect(state).toEqual(DEFAULT_GAME_STATE);
  });

  it("returns defaults when save is undefined", () => {
    const state = parseGameState(undefined);
    expect(state).toEqual(DEFAULT_GAME_STATE);
  });

  it("returns defaults when JSON is malformed", () => {
    const state = parseGameState("{bad json}");
    expect(state).toEqual(DEFAULT_GAME_STATE);
  });

  it("returns defaults when input is an empty string", () => {
    const state = parseGameState("");
    expect(state).toEqual(DEFAULT_GAME_STATE);
  });

  it("merges partial fields with defaults", () => {
    const state = parseGameState(JSON.stringify({ coins: 999, level: 5 }));
    expect(state.coins).toBe(999);
    expect(state.level).toBe(5);
    expect(state.hunger).toBe(DEFAULT_GAME_STATE.hunger);
    expect(state.happiness).toBe(DEFAULT_GAME_STATE.happiness);
    expect(state.fnfSongsCompleted).toBe(0);
    expect(state.fnfHighestCombo).toBe(0);
    expect(state.millionRewardClaimed).toBe(false);
  });

  it("flattens legacy nested shape { player: { coins }, capybara: { hunger } }", () => {
    const legacy = JSON.stringify({
      player: { coins: 500, level: 3, xp: 120 },
      capybara: { hunger: 30, happiness: 80 },
    });
    const state = parseGameState(legacy);
    expect(state.coins).toBe(500);
    expect(state.level).toBe(3);
    expect(state.xp).toBe(120);
    expect(state.hunger).toBe(30);
    expect(state.happiness).toBe(80);
  });

  it("preserves coins during migration (never reduced)", () => {
    const state = parseGameState(JSON.stringify({ coins: 9999 }));
    expect(state.coins).toBe(9999);
  });

  it("preserves valid inventory items during migration", () => {
    const state = parseGameState(JSON.stringify({ inventory: { pizza: 5, sushi: 3 } }));
    expect(state.inventory.pizza).toBe(5);
    expect(state.inventory.sushi).toBe(3);
    expect(state.inventory.grama).toBe(0);
  });

  it("preserves fnf fields through round-trip", () => {
    const state = parseGameState(JSON.stringify({
      fnfSongsCompleted: 7,
      fnfHighestCombo: 142,
      millionRewardClaimed: false,
    }));
    expect(state.fnfSongsCompleted).toBe(7);
    expect(state.fnfHighestCombo).toBe(142);
    expect(state.millionRewardClaimed).toBe(false);
  });

  it("handles millionRewardClaimed = true", () => {
    const state = parseGameState(JSON.stringify({ millionRewardClaimed: true }));
    expect(state.millionRewardClaimed).toBe(true);
  });

  it("handles legacy fnf nested shape", () => {
    const legacy = JSON.stringify({
      fnf: { songsCompleted: 10, highestCombo: 200, millionRewardClaimed: true },
    });
    const state = parseGameState(legacy);
    expect(state.fnfSongsCompleted).toBe(10);
    expect(state.fnfHighestCombo).toBe(200);
    expect(state.millionRewardClaimed).toBe(true);
  });

  it("DEFAULT_GAME_STATE has all boost fields with correct defaults", () => {
    expect(DEFAULT_GAME_STATE.speedBoost).toBe(0);
    expect(DEFAULT_GAME_STATE.shieldActive).toBe(false);
    expect(DEFAULT_GAME_STATE.luckBoost).toBe(0);
    expect(DEFAULT_GAME_STATE.xpBoost).toBe(0);
    expect(DEFAULT_GAME_STATE.coinBoost).toBe(0);
  });

  it("parseGameState(null) returns defaults with boost fields", () => {
    const state = parseGameState(null);
    expect(state.speedBoost).toBe(0);
    expect(state.shieldActive).toBe(false);
    expect(state.luckBoost).toBe(0);
    expect(state.xpBoost).toBe(0);
    expect(state.coinBoost).toBe(0);
  });

  it("preserves all boost fields from parsed data", () => {
    const state = parseGameState(JSON.stringify({
      speedBoost: 50,
      shieldActive: true,
      luckBoost: 75,
      xpBoost: 30,
      coinBoost: 20,
    }));
    expect(state.speedBoost).toBe(50);
    expect(state.shieldActive).toBe(true);
    expect(state.luckBoost).toBe(75);
    expect(state.xpBoost).toBe(30);
    expect(state.coinBoost).toBe(20);
  });

  it("falls back to boost defaults when boost fields are absent", () => {
    const state = parseGameState(JSON.stringify({ coins: 100 }));
    expect(state.speedBoost).toBe(0);
    expect(state.shieldActive).toBe(false);
    expect(state.luckBoost).toBe(0);
    expect(state.xpBoost).toBe(0);
    expect(state.coinBoost).toBe(0);
  });

  it("preserves boost fields through save -> JSON -> parse round-trip", () => {
    const original: GameState = {
      ...DEFAULT_GAME_STATE,
      speedBoost: 100,
      shieldActive: true,
      luckBoost: 80,
      xpBoost: 50,
      coinBoost: 25,
    };
    saveGameState(original);
    const raw = mockStorage.getItem("capyzen_game");
    const parsed = parseGameState(raw);
    expect(parsed.speedBoost).toBe(100);
    expect(parsed.shieldActive).toBe(true);
    expect(parsed.luckBoost).toBe(80);
    expect(parsed.xpBoost).toBe(50);
    expect(parsed.coinBoost).toBe(25);
  });

  it("rejects NaN boost values and falls back to defaults", () => {
    const state = parseGameState(JSON.stringify({
      xpBoost: NaN,
      coinBoost: NaN,
      speedBoost: NaN,
      luckBoost: NaN,
    }));
    expect(state.xpBoost).toBe(0);
    expect(state.coinBoost).toBe(0);
    expect(state.speedBoost).toBe(0);
    expect(state.luckBoost).toBe(0);
  });

  it("rejects Infinity and -Infinity boost values and falls back to defaults", () => {
    const state = parseGameState(JSON.stringify({
      xpBoost: Infinity,
      coinBoost: -Infinity,
      speedBoost: Number.POSITIVE_INFINITY,
      luckBoost: Number.NEGATIVE_INFINITY,
    }));
    expect(state.xpBoost).toBe(0);
    expect(state.coinBoost).toBe(0);
    expect(state.speedBoost).toBe(0);
    expect(state.luckBoost).toBe(0);
  });

  it("falls back for corrupt boost fields (string, null, undefined)", () => {
    const state = parseGameState(JSON.stringify({
      xpBoost: "not-a-number",
      coinBoost: "NaN",
      speedBoost: null,
      shieldActive: "yes",
      luckBoost: undefined,
    }));
    expect(state.xpBoost).toBe(0);
    expect(state.coinBoost).toBe(0);
    expect(state.speedBoost).toBe(0);
    expect(state.shieldActive).toBe(false);
    expect(state.luckBoost).toBe(0);
  });

  it("preserves zero boost values (no false positive rejection)", () => {
    const state = parseGameState(JSON.stringify({
      xpBoost: 0,
      coinBoost: 0,
      speedBoost: 0,
      shieldActive: false,
      luckBoost: 0,
    }));
    expect(state.xpBoost).toBe(0);
    expect(state.coinBoost).toBe(0);
    expect(state.speedBoost).toBe(0);
    expect(state.shieldActive).toBe(false);
    expect(state.luckBoost).toBe(0);
  });

  it("preserves finite fractional boost values", () => {
    const state = parseGameState(JSON.stringify({
      xpBoost: 12.5,
      coinBoost: 33.7,
      speedBoost: 0.1,
      luckBoost: 99.9,
    }));
    expect(state.xpBoost).toBeCloseTo(12.5);
    expect(state.coinBoost).toBeCloseTo(33.7);
    expect(state.speedBoost).toBeCloseTo(0.1);
    expect(state.luckBoost).toBeCloseTo(99.9);
  });

  it("defaults ownedClothing to empty array when save is missing it", () => {
    const state = parseGameState(JSON.stringify({ coins: 100 }));
    expect(state.ownedClothing).toEqual([]);
  });

  it("preserves ownedClothing through round-trip", () => {
    const input = JSON.stringify({
      ownedClothing: ["Camiseta Branco", "Óculos Escuros"],
      equippedItems: ["Camiseta Branco"],
    });
    const state = parseGameState(input);
    const serialized = JSON.stringify(state);
    const roundTripped = parseGameState(serialized);
    expect(roundTripped.ownedClothing).toEqual(["Camiseta Branco", "Óculos Escuros"]);
  });

  it("migrates legacy equippedItems to ownedClothing but only for clothing items", () => {
    const legacy = JSON.stringify({
      equippedItems: ["Camiseta Branco", "Poção de Energia 5"],
    });
    const state = parseGameState(legacy);
    expect(state.ownedClothing).toEqual(["Camiseta Branco"]);
    expect(state.equippedItems).toEqual(["Camiseta Branco", "Poção de Energia 5"]);
  });

  it("does not migrate equippedItems to ownedClothing when ownedClothing already exists", () => {
    const input = JSON.stringify({
      equippedItems: ["Camiseta Branco"],
      ownedClothing: ["Óculos Escuros"],
    });
    const state = parseGameState(input);
    expect(state.ownedClothing).toEqual(["Óculos Escuros"]);
    expect(state.equippedItems).toEqual(["Camiseta Branco"]);
  });

  it("merges ownedClothing additively without duplicates", () => {
    updateGameState({ ownedClothing: ["Camiseta Branco", "Óculos Escuros"] });
    updateGameState({ ownedClothing: ["Camiseta Branco", "Regata Branco"] });
    const reloaded = loadGameState();
    expect(reloaded.ownedClothing).toEqual(["Camiseta Branco", "Óculos Escuros", "Regata Branco"]);
  });

  it("never throws for any input", () => {
    const inputs: unknown[] = [
      null,
      undefined,
      42,
      "not json",
      "null",
      "undefined",
      "",
      "[]",
      '"string"',
    ];
    for (const input of inputs) {
      expect(() => parseGameState(input)).not.toThrow();
    }
  });
});

describe("loadGameState", () => {
  it("returns defaults when localStorage is empty", () => {
    const state = loadGameState();
    expect(state).toEqual(DEFAULT_GAME_STATE);
  });

  it("reads saved data from localStorage", () => {
    mockStorage.setItem("capyzen_game", JSON.stringify({ coins: 777 }));
    const state = loadGameState();
    expect(state.coins).toBe(777);
  });
});

describe("saveGameState", () => {
  it("writes correct JSON to localStorage", () => {
    const custom: GameState = { ...DEFAULT_GAME_STATE, coins: 42, fnfSongsCompleted: 3 };
    saveGameState(custom);
    const raw = mockStorage.getItem("capyzen_game");
    expect(raw).toBe(JSON.stringify(custom));
  });
});

describe("updateGameState", () => {
  it("merges partial and saves", () => {
    const result = updateGameState({ coins: 500, fnfSongsCompleted: 5 });
    expect(result.coins).toBe(500);
    expect(result.fnfSongsCompleted).toBe(5);
    expect(result.hunger).toBe(DEFAULT_GAME_STATE.hunger);
    const reloaded = loadGameState();
    expect(reloaded.coins).toBe(500);
    expect(reloaded.fnfSongsCompleted).toBe(5);
  });

  it("merges inventory shallowly", () => {
    updateGameState({ inventory: { pizza: 2 } });
    const reloaded = loadGameState();
    expect(reloaded.inventory.pizza).toBe(2);
    expect(reloaded.inventory.grama).toBe(0);
  });
});
