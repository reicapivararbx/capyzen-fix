import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { achievements, gameSaves, users, globalChatMessages, friendRequests } from "../drizzle/schema";
import type { GameSave, InsertAchievement, InsertGameSave, InsertUser, InsertGlobalChatMessage, FriendRequest } from "../drizzle/schema";
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

function parseStringArray(serialized: string): string[] {
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
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
    alive: save.alive === 1,
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
    equippedItems: parseStringArray(save.equippedItems),
    ownedClothing: parseStringArray(save.ownedClothing),
    playerName: '',
    capyName: '',
    age: 0,
    fnfSongsCompleted: 0,
    fnfHighestCombo: 0,
    millionRewardClaimed: false,
    xpBoost: Number.isFinite(save.xpBoost) ? save.xpBoost : 0,
    coinBoost: Number.isFinite(save.coinBoost) ? save.coinBoost : 0,
    speedBoost: Number.isFinite(save.speedBoost) ? save.speedBoost : 0,
    shieldActive: save.shieldActive === 1,
    luckBoost: Number.isFinite(save.luckBoost) ? save.luckBoost : 0,
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
    alive: state.alive ? 1 : 0,
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
    xpBoost: Number.isFinite(state.xpBoost) ? Math.trunc(state.xpBoost) : 0,
    coinBoost: Number.isFinite(state.coinBoost) ? Math.trunc(state.coinBoost) : 0,
    speedBoost: Number.isFinite(state.speedBoost) ? Math.trunc(state.speedBoost) : 0,
    shieldActive: state.shieldActive ? 1 : 0,
    luckBoost: Number.isFinite(state.luckBoost) ? Math.trunc(state.luckBoost) : 0,
    ownedClothing: JSON.stringify(state.ownedClothing ?? []),
    equippedItems: JSON.stringify(state.equippedItems ?? []),
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
      const sqlite = new Database(process.env.DATABASE_URL);
      _db = drizzle(sqlite);
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

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
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
    await db.insert(gameSaves).values(values).onConflictDoUpdate({
      target: gameSaves.userId,
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
        alive: state.alive ? 1 : 0,
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
        xpBoost: Number.isFinite(state.xpBoost) ? Math.trunc(state.xpBoost) : 0,
        coinBoost: Number.isFinite(state.coinBoost) ? Math.trunc(state.coinBoost) : 0,
        speedBoost: Number.isFinite(state.speedBoost) ? Math.trunc(state.speedBoost) : 0,
        shieldActive: state.shieldActive ? 1 : 0,
        luckBoost: Number.isFinite(state.luckBoost) ? Math.trunc(state.luckBoost) : 0,
        ownedClothing: JSON.stringify(state.ownedClothing ?? []),
        equippedItems: JSON.stringify(state.equippedItems ?? []),
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
    await db.insert(achievements).values(values).onConflictDoUpdate({
      target: [achievements.userId, achievements.achievementId],
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

export type ChatMessage = {
  id: number;
  senderName: string;
  content: string;
  createdAt: Date;
};

function normalizeChatLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 50;
  return Math.max(1, Math.min(200, Math.trunc(limit)));
}

export async function getChatMessages(limit = 50): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get chat messages: database not available");
    return [];
  }

  const result = await db
    .select({
      id: globalChatMessages.id,
      senderName: globalChatMessages.senderName,
      content: globalChatMessages.content,
      createdAt: globalChatMessages.createdAt,
    })
    .from(globalChatMessages)
    .orderBy(desc(globalChatMessages.createdAt))
    .limit(normalizeChatLimit(limit));

  return result.reverse();
}

export async function sendChatMessage(
  content: string,
  senderName: string,
  userId: number | null,
): Promise<ChatMessage> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message content cannot be empty");
  }
  if (trimmed.length > 500) {
    throw new Error("Message content too long (max 500 characters)");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const values: InsertGlobalChatMessage = {
    content: trimmed,
    senderName: senderName.trim() || "Anônimo",
    userId,
  };

  const result = await db
    .insert(globalChatMessages)
    .values(values)
    .returning({
      id: globalChatMessages.id,
      senderName: globalChatMessages.senderName,
      content: globalChatMessages.content,
      createdAt: globalChatMessages.createdAt,
    });

  return result[0];
}

// ── Friends ──────────────────────────────────────────────────────────

export type FriendRequestWithUser = {
  id: number;
  senderId: number;
  recipientId: number;
  status: string;
  createdAt: number;
  senderName: string;
  recipientName: string;
};

function resolveUserName(row: { name: string | null; email: string | null; openId: string }): string {
  return row.name ?? row.email ?? row.openId ?? "Anônimo";
}

export async function getUserByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function sendFriendRequest(senderId: number, recipientId: number): Promise<FriendRequest> {
  if (senderId === recipientId) {
    throw new Error("Cannot send friend request to yourself");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(friendRequests)
    .where(
      or(
        and(eq(friendRequests.senderId, senderId), eq(friendRequests.recipientId, recipientId)),
        and(eq(friendRequests.senderId, recipientId), eq(friendRequests.recipientId, senderId)),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const status = existing[0].status;
    if (status === "accepted") throw new Error("Already friends");
    if (status === "pending") throw new Error("Friend request already pending");
    if (status === "rejected") {
      const [updated] = await db
        .update(friendRequests)
        .set({ senderId, recipientId, status: "pending", updatedAt: new Date() })
        .where(eq(friendRequests.id, existing[0].id))
        .returning();
      return updated;
    }
  }

  const recipient = await db.select().from(users).where(eq(users.id, recipientId)).limit(1);
  if (recipient.length === 0) throw new Error("User not found");

  const [inserted] = await db
    .insert(friendRequests)
    .values({ senderId, recipientId })
    .returning();
  return inserted;
}

export async function updateFriendRequest(requestId: number, userId: number, action: "accept" | "reject"): Promise<FriendRequest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [existing] = await db
    .select()
    .from(friendRequests)
    .where(eq(friendRequests.id, requestId))
    .limit(1);

  if (!existing) throw new Error("Friend request not found");
  if (existing.recipientId !== userId) throw new Error("Only the recipient can respond to this request");
  if (existing.status !== "pending") throw new Error("Request already resolved");

  const newStatus = action === "accept" ? "accepted" : "rejected";
  const [updated] = await db
    .update(friendRequests)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(friendRequests.id, requestId))
    .returning();
  return updated;
}

export async function listFriendRequests(userId: number): Promise<FriendRequestWithUser[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: friendRequests.id,
      senderId: friendRequests.senderId,
      recipientId: friendRequests.recipientId,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      senderName: users.name,
      senderEmail: users.email,
      senderOpenId: users.openId,
    })
    .from(friendRequests)
    .innerJoin(users, eq(friendRequests.senderId, users.id))
    .where(and(eq(friendRequests.recipientId, userId), eq(friendRequests.status, "pending")))
    .orderBy(desc(friendRequests.createdAt));

  return result.map((row) => ({
    id: row.id,
    senderId: row.senderId,
    recipientId: row.recipientId,
    status: row.status,
    createdAt: row.createdAt.getTime(),
    senderName: resolveUserName({ name: row.senderName, email: row.senderEmail, openId: row.senderOpenId }),
    recipientName: "",
  }));
}

export async function listOutgoingRequests(userId: number): Promise<FriendRequestWithUser[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: friendRequests.id,
      senderId: friendRequests.senderId,
      recipientId: friendRequests.recipientId,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      recipientName: users.name,
      recipientEmail: users.email,
      recipientOpenId: users.openId,
    })
    .from(friendRequests)
    .innerJoin(users, eq(friendRequests.recipientId, users.id))
    .where(and(eq(friendRequests.senderId, userId), eq(friendRequests.status, "pending")))
    .orderBy(desc(friendRequests.createdAt));

  return result.map((row) => ({
    id: row.id,
    senderId: row.senderId,
    recipientId: row.recipientId,
    status: row.status,
    createdAt: row.createdAt.getTime(),
    senderName: "",
    recipientName: resolveUserName({ name: row.recipientName, email: row.recipientEmail, openId: row.recipientOpenId }),
  }));
}

export async function listFriends(userId: number): Promise<FriendRequestWithUser[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: friendRequests.id,
      senderId: friendRequests.senderId,
      recipientId: friendRequests.recipientId,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      senderName: users.name,
      senderEmail: users.email,
      senderOpenId: users.openId,
    })
    .from(friendRequests)
    .innerJoin(users, eq(friendRequests.senderId, users.id))
    .where(and(
      or(eq(friendRequests.senderId, userId), eq(friendRequests.recipientId, userId)),
      eq(friendRequests.status, "accepted"),
    ))
    .orderBy(desc(friendRequests.createdAt));

  return result.map((row) => ({
    id: row.id,
    senderId: row.senderId,
    recipientId: row.recipientId,
    status: row.status,
    createdAt: row.createdAt.getTime(),
    senderName: resolveUserName({ name: row.senderName, email: row.senderEmail, openId: row.senderOpenId }),
    recipientName: "",
  }));
}

export async function removeFriend(userId: number, friendRequestId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [existing] = await db
    .select()
    .from(friendRequests)
    .where(eq(friendRequests.id, friendRequestId))
    .limit(1);

  if (!existing) throw new Error("Friendship not found");
  if (existing.senderId !== userId && existing.recipientId !== userId) {
    throw new Error("Not part of this friendship");
  }
  if (existing.status !== "accepted") throw new Error("Can only remove accepted friends");

  await db.delete(friendRequests).where(eq(friendRequests.id, friendRequestId));
}
