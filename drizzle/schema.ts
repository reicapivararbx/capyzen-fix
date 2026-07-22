import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  username: text("username").unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  passwordHash: text("passwordHash"),
  passwordResetToken: text("passwordResetToken"),
  passwordResetExpires: integer("passwordResetExpires", { mode: "timestamp" }),
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
  content: text("content").default("").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaType: text("mediaType"),
  mediaName: text("mediaName"),
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
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

export const loginAttempts = sqliteTable("login_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  ip: text("ip"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
});

export const userBlocks = sqliteTable(
  "user_blocks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    blockerId: integer("blockerId")
      .notNull()
      .references(() => users.id),
    blockedId: integer("blockedId")
      .notNull()
      .references(() => users.id),
    createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  },
  (table) => [unique("user_blocks_blocker_blocked_unique").on(table.blockerId, table.blockedId)],
);

export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = typeof userBlocks.$inferInsert;

export const clans = sqliteTable("clans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  description: text("description"),
  leaderId: integer("leaderId").notNull().references(() => users.id),
  coins: integer("coins").notNull().default(0),
  emblem: text("emblem").notNull().default("🛡️"),
  isPublic: integer("isPublic", { mode: "boolean" }).notNull().default(true),
  minLevel: integer("minLevel").notNull().default(1),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
}, (table) => [
  unique("clans_name_unique").on(table.name),
  unique("clans_tag_unique").on(table.tag),
]);

export type Clan = typeof clans.$inferSelect;
export type InsertClan = typeof clans.$inferInsert;

export const clanMembers = sqliteTable("clan_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clanId: integer("clanId").notNull().references(() => clans.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["leader", "officer", "member"] }).notNull().default("member"),
  joinedAt: integer("joinedAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
}, (table) => [
  unique("clan_members_user_unique").on(table.userId),
]);

export type ClanMember = typeof clanMembers.$inferSelect;
export type InsertClanMember = typeof clanMembers.$inferInsert;

export const clanInvites = sqliteTable("clan_invites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clanId: integer("clanId").notNull().references(() => clans.id, { onDelete: "cascade" }),
  inviterId: integer("inviterId").notNull().references(() => users.id),
  inviteeId: integer("inviteeId").notNull().references(() => users.id),
  status: text("status", { enum: ["pending", "accepted", "declined", "cancelled"] }).notNull().default("pending"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
}, (table) => [
  unique("clan_invites_clan_invitee_status_unique").on(table.clanId, table.inviteeId, table.status),
]);

export type ClanInvite = typeof clanInvites.$inferSelect;
export type InsertClanInvite = typeof clanInvites.$inferInsert;
