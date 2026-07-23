import { and, count, desc, eq, gte, ne, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { achievements, gameSaves, users, globalChatMessages, friendRequests, loginAttempts, userBlocks, clans, clanMembers, clanInvites } from "../drizzle/schema";
import type { GameSave, InsertAchievement, InsertGameSave, InsertUser, InsertGlobalChatMessage, FriendRequest, InsertLoginAttempt, InsertUserBlock, Clan, InsertClan, ClanInvite } from "../drizzle/schema";
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
    energy: Number.isFinite(save.energy) ? save.energy : 100,
    thirst: Number.isFinite(save.thirst) ? save.thirst : 100,
    hygiene: Number.isFinite(save.hygiene) ? save.hygiene : 100,
    health: Number.isFinite(save.health) ? save.health : 100,
    equippedItems: parseStringArray(save.equippedItems),
    ownedClothing: parseStringArray(save.ownedClothing),
    playerName: save.playerName ?? '',
    capyName: save.capyName ?? '',
    age: Number.isFinite(save.age) ? save.age : 0,
    fnfSongsCompleted: Number.isFinite(save.fnfSongsCompleted) ? save.fnfSongsCompleted : 0,
    fnfHighestCombo: Number.isFinite(save.fnfHighestCombo) ? save.fnfHighestCombo : 0,
    millionRewardClaimed: save.millionRewardClaimed === 1,
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
    playerName: state.playerName ?? '',
    capyName: state.capyName ?? '',
    age: Number.isFinite(state.age) ? Math.trunc(state.age) : 0,
    energy: Number.isFinite(state.energy) ? Math.trunc(state.energy) : 100,
    thirst: Number.isFinite(state.thirst) ? Math.trunc(state.thirst) : 100,
    hygiene: Number.isFinite(state.hygiene) ? Math.trunc(state.hygiene) : 100,
    health: Number.isFinite(state.health) ? Math.trunc(state.health) : 100,
    fnfSongsCompleted: Number.isFinite(state.fnfSongsCompleted) ? Math.trunc(state.fnfSongsCompleted) : 0,
    fnfHighestCombo: Number.isFinite(state.fnfHighestCombo) ? Math.trunc(state.fnfHighestCombo) : 0,
    millionRewardClaimed: state.millionRewardClaimed ? 1 : 0,
    lastSaved,
  };
}

function normalizeLeaderboardLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 10;
  return Math.max(1, Math.min(100, Math.trunc(limit)));
}

let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;

function runMigrations(sqlite: Database.Database) {
  // migration 0003_add_chat_channel.sql
  const chatCols = sqlite.pragma("table_info(global_chat_messages)") as { name: string }[];
  const hasChannel = chatCols.some((c) => c.name === "channel");
  if (!hasChannel) {
    sqlite.exec("ALTER TABLE `global_chat_messages` ADD COLUMN `channel` text DEFAULT 'global' NOT NULL;");
    console.log("[Migration] Added 'channel' column to global_chat_messages");
  }
  sqlite.exec("CREATE INDEX IF NOT EXISTS `global_chat_messages_channel_idx` ON `global_chat_messages` (`channel`);");

  const saveCols = sqlite.pragma("table_info(game_saves)") as { name: string }[];
  const saveColNames = new Set(saveCols.map((c) => c.name));

  const addColIfMissing = (name: string, definition: string) => {
    if (!saveColNames.has(name)) {
      sqlite.exec(`ALTER TABLE \`game_saves\` ADD COLUMN \`${name}\` ${definition};`);
      console.log(`[Migration] Added '${name}' column to game_saves`);
    }
  };

  addColIfMissing("playerName", "text DEFAULT '' NOT NULL");
  addColIfMissing("capyName", "text DEFAULT '' NOT NULL");
  addColIfMissing("age", "integer DEFAULT 0 NOT NULL");
  addColIfMissing("energy", "integer DEFAULT 100 NOT NULL");
  addColIfMissing("thirst", "integer DEFAULT 100 NOT NULL");
  addColIfMissing("hygiene", "integer DEFAULT 100 NOT NULL");
  addColIfMissing("health", "integer DEFAULT 100 NOT NULL");
  addColIfMissing("fnfSongsCompleted", "integer DEFAULT 0 NOT NULL");
  addColIfMissing("fnfHighestCombo", "integer DEFAULT 0 NOT NULL");
  addColIfMissing("millionRewardClaimed", "integer DEFAULT 0 NOT NULL");
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sqlite = new Database(process.env.DATABASE_URL);
      _sqlite = sqlite;
      runMigrations(sqlite);
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
        playerName: state.playerName ?? '',
        capyName: state.capyName ?? '',
        age: Number.isFinite(state.age) ? Math.trunc(state.age) : 0,
        energy: Number.isFinite(state.energy) ? Math.trunc(state.energy) : 100,
        thirst: Number.isFinite(state.thirst) ? Math.trunc(state.thirst) : 100,
        hygiene: Number.isFinite(state.hygiene) ? Math.trunc(state.hygiene) : 100,
        health: Number.isFinite(state.health) ? Math.trunc(state.health) : 100,
        fnfSongsCompleted: Number.isFinite(state.fnfSongsCompleted) ? Math.trunc(state.fnfSongsCompleted) : 0,
        fnfHighestCombo: Number.isFinite(state.fnfHighestCombo) ? Math.trunc(state.fnfHighestCombo) : 0,
        millionRewardClaimed: state.millionRewardClaimed ? 1 : 0,
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
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaName?: string | null;
  createdAt: Date;
};

function normalizeChatLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 50;
  return Math.max(1, Math.min(200, Math.trunc(limit)));
}

export async function getChatMessages(limit = 50, channel = "global"): Promise<ChatMessage[]> {
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
      mediaUrl: globalChatMessages.mediaUrl,
      mediaType: globalChatMessages.mediaType,
      mediaName: globalChatMessages.mediaName,
      createdAt: globalChatMessages.createdAt,
    })
    .from(globalChatMessages)
    .where(eq(globalChatMessages.channel, channel))
    .orderBy(desc(globalChatMessages.createdAt))
    .limit(normalizeChatLimit(limit));

  return result.reverse();
}

export async function sendChatMessage(
  content: string,
  senderName: string,
  userId: number | null,
  media?: { url: string; type: string; name: string } | null,
  channel = "global",
): Promise<ChatMessage> {
  const trimmed = content.trim();

  if (!trimmed && !media) {
    throw new Error("Message content or media is required");
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
    mediaUrl: media?.url ?? null,
    mediaType: media?.type ?? null,
    mediaName: media?.name ?? null,
    channel,
  };

  const result = await db
    .insert(globalChatMessages)
    .values(values)
    .returning({
      id: globalChatMessages.id,
      senderName: globalChatMessages.senderName,
      content: globalChatMessages.content,
      mediaUrl: globalChatMessages.mediaUrl,
      mediaType: globalChatMessages.mediaType,
      mediaName: globalChatMessages.mediaName,
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

// Auth: username/password account system

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserAccount(username: string, passwordHash: string, email?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const values: InsertUser = {
    openId: `user_${username}`,
    username,
    name: username,
    email: email ?? null,
    passwordHash,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };

  await db.insert(users).values(values);
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePasswordHash(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function setPasswordResetToken(userId: number, token: string, expires: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({ passwordResetToken: token, passwordResetExpires: expires })
    .where(eq(users.id, userId));
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function clearPasswordResetToken(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ passwordResetToken: null, passwordResetExpires: null })
    .where(eq(users.id, userId));
}

export async function recordLoginAttempt(username: string, ip?: string) {
  const db = await getDb();
  if (!db) return;
  const values: InsertLoginAttempt = { username, ip: ip ?? null };
  await db.insert(loginAttempts).values(values);
}

export async function countRecentLoginAttempts(username: string, since: Date) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.$count(
    loginAttempts,
    and(eq(loginAttempts.username, username), gte(loginAttempts.createdAt, since)),
  );
  return result;
}

// ── User Blocks ─────────────────────────────────────────────────────

export async function blockUser(blockerId: number, blockedId: number): Promise<void> {
  if (blockerId === blockedId) {
    throw new Error("Cannot block yourself");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const target = await db.select().from(users).where(eq(users.id, blockedId)).limit(1);
  if (target.length === 0) throw new Error("User not found");

  const existing = await db
    .select()
    .from(userBlocks)
    .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)))
    .limit(1);

  if (existing.length > 0) throw new Error("User already blocked");

  const values: InsertUserBlock = { blockerId, blockedId };
  await db.insert(userBlocks).values(values);

  const existingFriendship = await db
    .select()
    .from(friendRequests)
    .where(
      or(
        and(eq(friendRequests.senderId, blockerId), eq(friendRequests.recipientId, blockedId)),
        and(eq(friendRequests.senderId, blockedId), eq(friendRequests.recipientId, blockerId)),
      ),
    );

  if (existingFriendship.length > 0) {
    for (const fr of existingFriendship) {
      await db.delete(friendRequests).where(eq(friendRequests.id, fr.id));
    }
  }
}

export async function unblockUser(blockerId: number, blockedId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(userBlocks)
    .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)));
}

export async function listBlockedUsers(blockerId: number): Promise<Array<{ blockedId: number; username: string | null; name: string | null }>> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      blockedId: userBlocks.blockedId,
      username: users.username,
      name: users.name,
    })
    .from(userBlocks)
    .innerJoin(users, eq(userBlocks.blockedId, users.id))
    .where(eq(userBlocks.blockerId, blockerId))
    .orderBy(desc(userBlocks.createdAt));

  return result;
}

export async function isBlocking(blockerId: number, blockedId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(userBlocks)
    .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)))
    .limit(1);

  return result.length > 0;
}

export async function createClan(
  leaderId: number,
  name: string,
  tag: string,
  description?: string | null,
  emblem?: string | null,
  isPublic?: boolean,
  minLevel?: number,
): Promise<Clan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(clanMembers).where(eq(clanMembers.userId, leaderId)).limit(1);
  if (existing.length > 0) throw new Error("Você já está em um clan");

  const nameTaken = await db.select().from(clans).where(eq(clans.name, name)).limit(1);
  if (nameTaken.length > 0) throw new Error("Nome de clan já existe");

  const tagTaken = await db.select().from(clans).where(eq(clans.tag, tag)).limit(1);
  if (tagTaken.length > 0) throw new Error("Tag de clan já existe");

  const values: InsertClan = {
    name,
    tag,
    description: description ?? null,
    leaderId,
    emblem: emblem ?? "🛡️",
    isPublic: isPublic ?? true,
    minLevel: minLevel ?? 1,
  };

  const inserted = await db.insert(clans).values(values).returning();
  const clan = inserted[0];

  await db.insert(clanMembers).values({
    clanId: clan.id,
    userId: leaderId,
    role: "leader",
  });

  return clan;
}

export async function getClanById(clanId: number): Promise<Clan | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(clans).where(eq(clans.id, clanId)).limit(1);
  return result[0] ?? null;
}

export async function getClanByMember(
  userId: number,
): Promise<{ clan: Clan; role: string; joinedAt: Date } | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      clan: clans,
      role: clanMembers.role,
      joinedAt: clanMembers.joinedAt,
    })
    .from(clanMembers)
    .innerJoin(clans, eq(clanMembers.clanId, clans.id))
    .where(eq(clanMembers.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function listClanMembers(
  clanId: number,
): Promise<Array<{ userId: number; username: string | null; name: string | null; role: string; joinedAt: Date }>> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      userId: clanMembers.userId,
      username: users.username,
      name: users.name,
      role: clanMembers.role,
      joinedAt: clanMembers.joinedAt,
    })
    .from(clanMembers)
    .innerJoin(users, eq(clanMembers.userId, users.id))
    .where(eq(clanMembers.clanId, clanId))
    .orderBy(desc(clanMembers.joinedAt));

  return result;
}

export async function searchClans(): Promise<Array<Clan & { memberCount: number }>> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: clans.id,
      name: clans.name,
      tag: clans.tag,
      description: clans.description,
      leaderId: clans.leaderId,
      coins: clans.coins,
      emblem: clans.emblem,
      isPublic: clans.isPublic,
      minLevel: clans.minLevel,
      createdAt: clans.createdAt,
      memberCount: count(),
    })
    .from(clans)
    .leftJoin(clanMembers, eq(clans.id, clanMembers.clanId))
    .orderBy(desc(clans.createdAt))
    .groupBy(clans.id);

  return result;
}

export async function disbandClan(clanId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const clan = await db.select().from(clans).where(eq(clans.id, clanId)).limit(1);
  if (clan.length === 0) throw new Error("Clan não encontrado");
  if (clan[0].leaderId !== userId) throw new Error("Apenas o líder pode dissolver o clan");

  await db.delete(clanMembers).where(eq(clanMembers.clanId, clanId));
  await db.delete(clanInvites).where(eq(clanInvites.clanId, clanId));
  await db.delete(clans).where(eq(clans.id, clanId));
}

export async function leaveClan(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const membership = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.userId, userId))
    .limit(1);

  if (membership.length === 0) throw new Error("Você não está em um clan");
  const member = membership[0];
  const clanId = member.clanId;

  if (member.role === "leader") {
    const officers = await db
      .select()
      .from(clanMembers)
      .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.role, "officer")))
      .orderBy(desc(clanMembers.joinedAt))
      .limit(1);

    if (officers.length > 0) {
      await db.update(clanMembers).set({ role: "leader" }).where(eq(clanMembers.id, officers[0].id));
    } else {
      const remaining = await db
        .select({ value: count() })
        .from(clanMembers)
        .where(eq(clanMembers.clanId, clanId));

      if (remaining[0].value <= 1) {
        await db.delete(clanMembers).where(eq(clanMembers.clanId, clanId));
        await db.delete(clanInvites).where(eq(clanInvites.clanId, clanId));
        await db.delete(clans).where(eq(clans.id, clanId));
      } else {
        const nextMember = await db
          .select()
          .from(clanMembers)
          .where(and(eq(clanMembers.clanId, clanId), ne(clanMembers.userId, userId)))
          .orderBy(desc(clanMembers.joinedAt))
          .limit(1);

        if (nextMember.length > 0) {
          await db.update(clanMembers).set({ role: "leader" }).where(eq(clanMembers.id, nextMember[0].id));
          await db.update(clans).set({ leaderId: nextMember[0].userId }).where(eq(clans.id, clanId));
        }
      }
    }
  }

  await db.delete(clanMembers).where(eq(clanMembers.id, member.id));
}

export async function kickClanMember(clanId: number, targetUserId: number, requesterId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const requester = await db
    .select()
    .from(clanMembers)
    .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, requesterId)))
    .limit(1);

  if (requester.length === 0) throw new Error("Você não é membro deste clan");
  if (requester[0].role === "member") throw new Error("Apenas líderes e oficiais podem expulsar membros");

  const target = await db
    .select()
    .from(clanMembers)
    .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, targetUserId)))
    .limit(1);

  if (target.length === 0) throw new Error("Membro não encontrado");
  if (target[0].role === "leader") throw new Error("Não pode expulsar o líder");
  if (target[0].role === "officer" && requester[0].role === "officer") throw new Error("Oficiais não podem expulsar outros oficiais");

  await db.delete(clanMembers).where(eq(clanMembers.id, target[0].id));
}

export async function updateClanRole(
  clanId: number,
  targetUserId: number,
  requesterId: number,
  role: "officer" | "member",
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const requester = await db
    .select()
    .from(clanMembers)
    .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, requesterId)))
    .limit(1);

  if (requester.length === 0) throw new Error("Você não é membro deste clan");
  if (requester[0].role !== "leader") throw new Error("Apenas o líder pode alterar cargos");

  const target = await db
    .select()
    .from(clanMembers)
    .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, targetUserId)))
    .limit(1);

  if (target.length === 0) throw new Error("Membro não encontrado");
  if (target[0].role === "leader") throw new Error("Não pode alterar o cargo do líder");

  await db.update(clanMembers).set({ role }).where(eq(clanMembers.id, target[0].id));
}

export async function transferClanLeadership(clanId: number, newLeaderId: number, requesterId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    const clan = await tx.select().from(clans).where(eq(clans.id, clanId)).limit(1);
    if (clan.length === 0) throw new Error("Clan não encontrado");
    if (clan[0].leaderId !== requesterId) throw new Error("Apenas o líder pode transferir liderança");

    const newLeader = await tx
      .select()
      .from(clanMembers)
      .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, newLeaderId)))
      .limit(1);

    if (newLeader.length === 0) throw new Error("O novo líder deve ser membro do clan");

    await tx.update(clanMembers).set({ role: "leader" }).where(eq(clanMembers.id, newLeader[0].id));
    await tx
      .update(clanMembers)
      .set({ role: "officer" })
      .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, requesterId)));
    await tx.update(clans).set({ leaderId: newLeaderId }).where(eq(clans.id, clanId));
  });
}

export async function updateClanSettings(
  clanId: number,
  userId: number,
  settings: { description?: string | null; emblem?: string | null; isPublic?: boolean; minLevel?: number },
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const clan = await db.select().from(clans).where(eq(clans.id, clanId)).limit(1);
  if (clan.length === 0) throw new Error("Clan não encontrado");
  if (clan[0].leaderId !== userId) throw new Error("Apenas o líder pode alterar configurações");

  const updates: Partial<InsertClan> = {};
  if (settings.description !== undefined) updates.description = settings.description ?? null;
  if (settings.emblem !== undefined) updates.emblem = settings.emblem ?? "🛡️";
  if (settings.isPublic !== undefined) updates.isPublic = settings.isPublic;
  if (settings.minLevel !== undefined) updates.minLevel = settings.minLevel;

  if (Object.keys(updates).length > 0) {
    await db.update(clans).set(updates).where(eq(clans.id, clanId));
  }
}

export async function createClanInvite(clanId: number, inviterId: number, inviteeId: number): Promise<ClanInvite> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const inviterMembership = await db
    .select()
    .from(clanMembers)
    .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, inviterId)))
    .limit(1);

  if (inviterMembership.length === 0) throw new Error("Você não é membro deste clan");
  if (inviterMembership[0].role === "member") throw new Error("Apenas líderes e oficiais podem convidar");

  const inviteeClan = await db.select().from(clanMembers).where(eq(clanMembers.userId, inviteeId)).limit(1);
  if (inviteeClan.length > 0) throw new Error("Usuário já está em um clan");

  const existingInvite = await db
    .select()
    .from(clanInvites)
    .where(and(eq(clanInvites.clanId, clanId), eq(clanInvites.inviteeId, inviteeId), eq(clanInvites.status, "pending")))
    .limit(1);

  if (existingInvite.length > 0) throw new Error("Já existe um convite pendente para este usuário");

  const inserted = await db
    .insert(clanInvites)
    .values({ clanId, inviterId, inviteeId, status: "pending" })
    .returning();

  return inserted[0];
}

export async function acceptClanInvite(inviteId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const invite = await db.select().from(clanInvites).where(eq(clanInvites.id, inviteId)).limit(1);
  if (invite.length === 0) throw new Error("Convite não encontrado");
  if (invite[0].inviteeId !== userId) throw new Error("Este convite não é para você");
  if (invite[0].status !== "pending") throw new Error("Convite já processado");

  const existingClan = await db.select().from(clanMembers).where(eq(clanMembers.userId, userId)).limit(1);
  if (existingClan.length > 0) throw new Error("Você já está em um clan");

  await db.update(clanInvites).set({ status: "accepted" }).where(eq(clanInvites.id, inviteId));
  await db.insert(clanMembers).values({ clanId: invite[0].clanId, userId, role: "member" });
}

export async function declineClanInvite(inviteId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const invite = await db.select().from(clanInvites).where(eq(clanInvites.id, inviteId)).limit(1);
  if (invite.length === 0) throw new Error("Convite não encontrado");
  if (invite[0].inviteeId !== userId) throw new Error("Este convite não é para você");
  if (invite[0].status !== "pending") throw new Error("Convite já processado");

  await db.update(clanInvites).set({ status: "declined" }).where(eq(clanInvites.id, inviteId));
}

export async function listClanInvites(
  userId: number,
): Promise<Array<{ id: number; clanId: number; clanName: string; clanTag: string; clanEmblem: string; inviterId: number; inviterName: string | null; status: string; createdAt: Date }>> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: clanInvites.id,
      clanId: clanInvites.clanId,
      clanName: clans.name,
      clanTag: clans.tag,
      clanEmblem: clans.emblem,
      inviterId: clanInvites.inviterId,
      inviterName: users.name,
      status: clanInvites.status,
      createdAt: clanInvites.createdAt,
    })
    .from(clanInvites)
    .innerJoin(clans, eq(clanInvites.clanId, clans.id))
    .innerJoin(users, eq(clanInvites.inviterId, users.id))
    .where(eq(clanInvites.inviteeId, userId))
    .orderBy(desc(clanInvites.createdAt));

  return result;
}

export async function joinClanPublic(clanId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const clan = await db.select().from(clans).where(eq(clans.id, clanId)).limit(1);
  if (clan.length === 0) throw new Error("Clan não encontrado");
  if (!clan[0].isPublic) throw new Error("Este clan é privado");

  const existing = await db.select().from(clanMembers).where(eq(clanMembers.userId, userId)).limit(1);
  if (existing.length > 0) throw new Error("Você já está em um clan");

  const gameSave = await db.select({ level: gameSaves.level }).from(gameSaves).where(eq(gameSaves.userId, userId)).limit(1);
  const userLevel = gameSave.length > 0 ? gameSave[0].level : 1;
  if (userLevel < clan[0].minLevel) {
    throw new Error(`Nível insuficiente. Nível mínimo: ${clan[0].minLevel}`);
  }

  await db.insert(clanMembers).values({ clanId, userId, role: "member" });
}

export async function listAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    id: users.id,
    username: users.username,
    name: users.name,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
