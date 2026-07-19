import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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
  lastSaved: integer("lastSaved", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$default(() => new Date()).$onUpdate(() => new Date()).notNull(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = typeof gameSaves.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
