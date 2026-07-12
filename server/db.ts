import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { achievements, gameSaves, users } from "../drizzle/schema";
import type { GameSave, InsertAchievement, InsertGameSave, InsertUser } from "../drizzle/schema";
import type { GameState, LeaderboardEntry } from "../client/src/types/game";
import { ENV } from './_core/env';

const DEFAULT_INVENTORY: GameState["inventory"] = {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInventoryKey(key: string): key is keyof GameState["inventory"] {
  return key in DEFAULT_INVENTORY;
}

function parseInventory(serializedInventory: string): GameState["inventory"] {
  const inventory: GameState["inventory"] = { ...DEFAULT_INVENTORY };

  try {
    const parsed: unknown = JSON.parse(serializedInventory);
    if (!isRecord(parsed)) return inventory;

    Object.entries(parsed).forEach(([key, value]) => {
      if (isInventoryKey(key) && typeof value === "number" && Number.isFinite(value)) {
        inventory[key] = value;
      }
    });
  } catch (error) {
    console.warn("[Database] Failed to parse save inventory:", error);
  }

  return inventory;
}

function toGameState(save: GameSave): GameState {
  return {
    coins: save.coins,
    level: save.level,
    xp: save.xp,
    food: save.food,
    poop: save.poop,
    hunger: save.hunger,
    happiness: save.happiness,
    sus: save.sus,
    x: save.x,
    y: save.y,
    speed: save.speed,
    alive: save.alive,
    capyColor: save.capyColor,
    capySize: save.capySize,
    totalScore: save.totalScore,
    totalXP: save.totalXP,
    foodEaten: save.foodEaten,
    gamesPlayed: save.gamesPlayed,
    workCount: save.workCount,
    affectionCount: save.affectionCount,
    bathroomCount: save.bathroomCount,
    colorChanges: save.colorChanges,
    size: save.size,
    inventory: parseInventory(save.inventory),
    energy: 100,
    thirst: 100,
    hygiene: 100,
    health: 100,
    equippedItems: [],
    playerName: '',
    capyName: '',
    age: 0,
  };
}

function toGameSaveValues(userId: number, state: GameState, lastSaved: Date): InsertGameSave {
  return {
    userId,
    coins: state.coins,
    level: state.level,
    xp: state.xp,
    food: state.food,
    poop: state.poop,
    hunger: state.hunger,
    happiness: state.happiness,
    sus: state.sus,
    x: state.x,
    y: state.y,
    speed: state.speed,
    alive: state.alive,
    capyColor: state.capyColor,
    capySize: state.capySize,
    totalScore: state.totalScore,
    totalXP: state.totalXP,
    foodEaten: state.foodEaten,
    gamesPlayed: state.gamesPlayed,
    workCount: state.workCount,
    affectionCount: state.affectionCount,
    bathroomCount: state.bathroomCount,
    colorChanges: state.colorChanges,
    size: state.size,
    inventory: JSON.stringify(state.inventory),
    lastSaved,
  };
}

function normalizeLeaderboardLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 10;
  return Math.max(1, Math.min(100, Math.trunc(limit)));
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function saveGame(userId: number, state: GameState): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save game: database not available");
    return;
  }

  const lastSaved = new Date();
  const values = toGameSaveValues(userId, state, lastSaved);

  try {
    await db.insert(gameSaves).values(values).onDuplicateKeyUpdate({
      set: {
        coins: state.coins,
        level: state.level,
        xp: state.xp,
        food: state.food,
        poop: state.poop,
        hunger: state.hunger,
        happiness: state.happiness,
        sus: state.sus,
        x: state.x,
        y: state.y,
        speed: state.speed,
        alive: state.alive,
        capyColor: state.capyColor,
        capySize: state.capySize,
        totalScore: state.totalScore,
        totalXP: state.totalXP,
        foodEaten: state.foodEaten,
        gamesPlayed: state.gamesPlayed,
        workCount: state.workCount,
        affectionCount: state.affectionCount,
        bathroomCount: state.bathroomCount,
        colorChanges: state.colorChanges,
        size: state.size,
        inventory: values.inventory,
        lastSaved,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to save game:", error);
    throw error;
  }
}

export async function loadGame(userId: number): Promise<GameState | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot load game: database not available");
    return null;
  }

  const result = await db.select().from(gameSaves).where(eq(gameSaves.userId, userId)).limit(1);
  const save = result[0];

  return save ? toGameState(save) : null;
}

export async function deleteGame(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete game: database not available");
    return;
  }

  await db.delete(gameSaves).where(eq(gameSaves.userId, userId));
}

export async function unlockAchievement(userId: number, achievementId: string): Promise<void> {
  if (!achievementId.trim()) {
    throw new Error("Achievement id is required for unlock");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot unlock achievement: database not available");
    return;
  }

  const values: InsertAchievement = { userId, achievementId };

  try {
    await db.insert(achievements).values(values).onDuplicateKeyUpdate({
      set: { achievementId },
    });
  } catch (error) {
    console.error("[Database] Failed to unlock achievement:", error);
    throw error;
  }
}

export async function getAchievements(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get achievements: database not available");
    return [];
  }

  const result = await db
    .select({ achievementId: achievements.achievementId })
    .from(achievements)
    .where(eq(achievements.userId, userId));

  return result.map((achievement) => achievement.achievementId);
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leaderboard: database not available");
    return [];
  }

  const result = await db
    .select({
      username: users.name,
      email: users.email,
      openId: users.openId,
      score: gameSaves.coins,
      level: gameSaves.level,
      lastSaved: gameSaves.lastSaved,
    })
    .from(gameSaves)
    .innerJoin(users, eq(gameSaves.userId, users.id))
    .orderBy(desc(gameSaves.coins))
    .limit(normalizeLeaderboardLimit(limit));

  return result.map((entry) => ({
    username: entry.username ?? entry.email ?? entry.openId,
    score: entry.score,
    level: entry.level,
    timestamp: entry.lastSaved.getTime(),
  }));
}
