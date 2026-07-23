import type { GameState, Inventory } from "@/types/game";
import shopItems from "@shared/shop-items.json";

const CLOTHING_CATEGORIES = new Set(["Roupa", "Acessório"]);

export function isClothingCategory(category: string): boolean {
  return CLOTHING_CATEGORIES.has(category);
}

const CLOTHING_ITEM_NAMES = new Set(
  shopItems
    .filter((item) => CLOTHING_CATEGORIES.has(item.category))
    .map((item) => item.name),
);

function isClothingItemName(name: string): boolean {
  return CLOTHING_ITEM_NAMES.has(name);
}

const SAVE_KEY = "capyzen_game";

const DEFAULT_INVENTORY: Inventory = {
  grama: 0,
  batata: 0,
  hamburger: 0,
  refri: 0,
  feijao: 0,
  hotdog: 0,
  pizza: 0,
  sushi: 0,
  tacos: 0,
  sorvete: 0,
  bolo: 0,
  chocolate: 0,
  maçã: 0,
  banana: 0,
  melancia: 0,
  morango: 0,
  uva: 0,
  cenoura: 0,
  brócolis: 0,
  espinafre: 0,
  tomate: 0,
  queijo: 0,
  iogurte: 0,
  leite: 0,
  pão: 0,
  arroz: 0,
};

export const DEFAULT_GAME_STATE: GameState = {
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
  inventory: DEFAULT_INVENTORY,
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
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function pickInventory(value: unknown): Inventory {
  if (!isRecord(value)) return { ...DEFAULT_INVENTORY };
  const defaults = DEFAULT_INVENTORY as unknown as Record<string, number>;
  const result: Record<string, number> = {};
  for (const key of Object.keys(defaults)) {
    result[key] = pickNumber((value as Record<string, unknown>)[key], defaults[key]);
  }
  return result as unknown as Inventory;
}

function pickStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function flattenLegacySave(raw: Record<string, unknown>): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  const defaults = DEFAULT_INVENTORY as unknown as Record<string, number>;

  for (const key of Object.keys(raw)) {
    const val = raw[key];

    if (key === "player" && isRecord(val)) {
      for (const pk of Object.keys(val)) {
        const pv = (val as Record<string, unknown>)[pk];
        if (pk === "inventory" && isRecord(pv)) {
          const merged: Record<string, unknown> = {};
          for (const ik of Object.keys(defaults)) {
            merged[ik] = (pv as Record<string, unknown>)[ik] ?? defaults[ik];
          }
          flat.inventory = merged;
        } else {
          flat[pk] = pv;
        }
      }
      continue;
    }

    if (key === "capybara" && isRecord(val)) {
      for (const ck of Object.keys(val)) {
        flat[ck] = (val as Record<string, unknown>)[ck];
      }
      continue;
    }

    if (key === "fnf" && isRecord(val)) {
      flat.fnfSongsCompleted = (val as Record<string, unknown>).songsCompleted;
      flat.fnfHighestCombo = (val as Record<string, unknown>).highestCombo;
      flat.millionRewardClaimed = (val as Record<string, unknown>).millionRewardClaimed;
      continue;
    }

    flat[key] = val;
  }

  return flat;
}

function buildGameStateFromFlat(flat: Record<string, unknown>): GameState {
  const equippedItems = pickStringArray(flat.equippedItems);
  const rawOwnedClothing = pickStringArray(flat.ownedClothing);
  const ownedClothing = rawOwnedClothing.length > 0
    ? rawOwnedClothing
    : equippedItems.filter(isClothingItemName);

  return {
    coins: pickNumber(flat.coins, DEFAULT_GAME_STATE.coins),
    level: pickNumber(flat.level, DEFAULT_GAME_STATE.level),
    xp: pickNumber(flat.xp, DEFAULT_GAME_STATE.xp),
    food: pickNumber(flat.food, DEFAULT_GAME_STATE.food),
    poop: pickNumber(flat.poop, DEFAULT_GAME_STATE.poop),
    hunger: pickNumber(flat.hunger, DEFAULT_GAME_STATE.hunger),
    happiness: pickNumber(flat.happiness, DEFAULT_GAME_STATE.happiness),
    sus: pickNumber(flat.sus, DEFAULT_GAME_STATE.sus),
    x: pickNumber(flat.x, DEFAULT_GAME_STATE.x),
    y: pickNumber(flat.y, DEFAULT_GAME_STATE.y),
    speed: pickNumber(flat.speed, DEFAULT_GAME_STATE.speed),
    alive: pickBoolean(flat.alive, DEFAULT_GAME_STATE.alive),
    capyColor: pickString(flat.capyColor, DEFAULT_GAME_STATE.capyColor),
    capySize: pickNumber(flat.capySize, DEFAULT_GAME_STATE.capySize),
    totalScore: pickNumber(flat.totalScore, DEFAULT_GAME_STATE.totalScore),
    totalXP: pickNumber(flat.totalXP, DEFAULT_GAME_STATE.totalXP),
    foodEaten: pickNumber(flat.foodEaten, DEFAULT_GAME_STATE.foodEaten),
    gamesPlayed: pickNumber(flat.gamesPlayed, DEFAULT_GAME_STATE.gamesPlayed),
    workCount: pickNumber(flat.workCount, DEFAULT_GAME_STATE.workCount),
    affectionCount: pickNumber(flat.affectionCount, DEFAULT_GAME_STATE.affectionCount),
    bathroomCount: pickNumber(flat.bathroomCount, DEFAULT_GAME_STATE.bathroomCount),
    colorChanges: pickNumber(flat.colorChanges, DEFAULT_GAME_STATE.colorChanges),
    size: pickNumber(flat.size, DEFAULT_GAME_STATE.size),
    inventory: pickInventory(flat.inventory),
    energy: pickNumber(flat.energy, DEFAULT_GAME_STATE.energy),
    thirst: pickNumber(flat.thirst, DEFAULT_GAME_STATE.thirst),
    hygiene: pickNumber(flat.hygiene, DEFAULT_GAME_STATE.hygiene),
    health: pickNumber(flat.health, DEFAULT_GAME_STATE.health),
    equippedItems,
    ownedClothing,
    playerName: pickString(flat.playerName, DEFAULT_GAME_STATE.playerName),
    capyName: pickString(flat.capyName, DEFAULT_GAME_STATE.capyName),
    age: pickNumber(flat.age, DEFAULT_GAME_STATE.age),
    fnfSongsCompleted: pickNumber(flat.fnfSongsCompleted, DEFAULT_GAME_STATE.fnfSongsCompleted),
    fnfHighestCombo: pickNumber(flat.fnfHighestCombo, DEFAULT_GAME_STATE.fnfHighestCombo),
    millionRewardClaimed: pickBoolean(flat.millionRewardClaimed, DEFAULT_GAME_STATE.millionRewardClaimed),
    speedBoost: pickNumber(flat.speedBoost, DEFAULT_GAME_STATE.speedBoost),
    shieldActive: pickBoolean(flat.shieldActive, DEFAULT_GAME_STATE.shieldActive),
    luckBoost: pickNumber(flat.luckBoost, DEFAULT_GAME_STATE.luckBoost),
    xpBoost: pickNumber(flat.xpBoost, DEFAULT_GAME_STATE.xpBoost),
    coinBoost: pickNumber(flat.coinBoost, DEFAULT_GAME_STATE.coinBoost),
  };
}

export function parseGameState(raw: unknown): GameState {
  if (raw === null || raw === undefined) {
    return { ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_INVENTORY } };
  }

  if (typeof raw !== "string") {
    if (isRecord(raw)) {
      return buildGameStateFromFlat(flattenLegacySave(raw as Record<string, unknown>));
    }
    return { ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_INVENTORY } };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return { ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_INVENTORY } };
    }
    return buildGameStateFromFlat(flattenLegacySave(parsed as Record<string, unknown>));
  } catch {
    return { ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_INVENTORY } };
  }
}

export function loadGameState(): GameState {
  const raw = globalThis.localStorage?.getItem(SAVE_KEY) ?? null;
  return parseGameState(raw);
}

export function saveGameState(state: GameState): void {
  globalThis.localStorage?.setItem(SAVE_KEY, JSON.stringify(state));
}

export function updateGameState(partial: Partial<GameState>): GameState {
  const current = loadGameState();
  const merged: GameState = { ...current, ...partial };
  if (partial.inventory) {
    merged.inventory = { ...current.inventory, ...partial.inventory };
  }
  if (partial.equippedItems) {
    merged.equippedItems = [...partial.equippedItems];
  }
  if (partial.ownedClothing) {
    const currentOwned = current.ownedClothing ?? [];
    const newItems = partial.ownedClothing.filter((item) => !currentOwned.includes(item));
    merged.ownedClothing = [...currentOwned, ...newItems];
  }
  saveGameState(merged);
  globalThis.dispatchEvent(new CustomEvent("game-state-updated", { detail: merged }));
  return merged;
}
