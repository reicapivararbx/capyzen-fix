import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$default(() => new Date()).$onUpdate(() => new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).$default(() => new Date()).notNull(),
});

export const gameSaves = sqliteTable("game_saves", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id)
    .unique(),
  coins: integer("coins").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  food: integer("food").default(100).notNull(),
  poop: integer("poop").default(0).notNull(),
  hunger: integer("hunger").default(100).notNull(),
  happiness: integer("happiness").default(100).notNull(),
  sus: integer("sus").default(0).notNull(),
  x: integer("x").default(400).notNull(),
  y: integer("y").default(300).notNull(),
  speed: integer("speed").default(5).notNull(),
  alive: integer("alive").default(1).notNull(),
  capyColor: text("capyColor").default("#8B7355").notNull(),
  capySize: integer("capySize").default(50).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  totalXP: integer("totalXP").default(0).notNull(),
  foodEaten: integer("foodEaten").default(0).notNull(),
  gamesPlayed: integer("gamesPlayed").default(0).notNull(),
  workCount: integer("workCount").default(0).notNull(),
  affectionCount: integer("affectionCount").default(0).notNull(),
  bathroomCount: integer("bathroomCount").default(0).notNull(),
  colorChanges: integer("colorChanges").default(0).notNull(),
  size: integer("size").default(50).notNull(),
  inventory: text("inventory").default("{}").notNull(),
  xpBoost: integer("xpBoost").default(0).notNull(),
  coinBoost: integer("coinBoost").default(0).notNull(),
  speedBoost: integer("speedBoost").default(0).notNull(),
  shieldActive: integer("shieldActive").default(0).notNull(),
  luckBoost: integer("luckBoost").default(0).notNull(),
  ownedClothing: text("ownedClothing").default("[]").notNull(),
  equippedItems: text("equippedItems").default("[]").notNull(),
  lastSaved: integer("lastSaved", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$default(() => new Date()).$onUpdate(() => new Date()).notNull(),
});

export const globalChatMessages = sqliteTable("global_chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .references(() => users.id),
  senderName: text("senderName").notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
});

export const achievements = sqliteTable(
  "achievements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id),
    achievementId: text("achievementId").notNull(),
    unlockedAt: integer("unlockedAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  },
  (table) => [unique("achievements_userId_achievementId_unique").on(table.userId, table.achievementId)],
);

export const friendRequests = sqliteTable(
  "friend_requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    senderId: integer("senderId")
      .notNull()
      .references(() => users.id),
    recipientId: integer("recipientId")
      .notNull()
      .references(() => users.id),
    /** "pending" | "accepted" | "rejected" */
    status: text("status", { enum: ["pending", "accepted", "rejected"] })
      .default("pending")
      .notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$default(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .$default(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("friend_requests_sender_recipient_unique").on(
      table.senderId,
      table.recipientId,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = typeof gameSaves.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = typeof friendRequests.$inferInsert;
export const chatReports = sqliteTable("chat_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reporterId: integer("reporterId")
    .references(() => users.id),
  messageId: integer("messageId")
    .references(() => globalChatMessages.id),
  reason: text("reason").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
});

export const bannedUsers = sqliteTable("banned_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .references(() => users.id),
  username: text("username").notNull(),
  reason: text("reason").notNull(),
  bannedAt: integer("bannedAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
});

export type GlobalChatMessage = typeof globalChatMessages.$inferSelect;
export type InsertGlobalChatMessage = typeof globalChatMessages.$inferInsert;
export type ChatReport = typeof chatReports.$inferSelect;
export type InsertChatReport = typeof chatReports.$inferInsert;
export type BannedUser = typeof bannedUsers.$inferSelect;
export type InsertBannedUser = typeof bannedUsers.$inferInsert;
