import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const gameSaves = mysqlTable("game_saves", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id)
    .unique(),
  coins: int("coins").default(0).notNull(),
  level: int("level").default(1).notNull(),
  xp: int("xp").default(0).notNull(),
  food: int("food").default(100).notNull(),
  poop: int("poop").default(0).notNull(),
  hunger: int("hunger").default(100).notNull(),
  happiness: int("happiness").default(100).notNull(),
  sus: int("sus").default(0).notNull(),
  x: int("x").default(400).notNull(),
  y: int("y").default(300).notNull(),
  speed: int("speed").default(5).notNull(),
  alive: boolean("alive").default(true).notNull(),
  capyColor: varchar("capyColor", { length: 7 }).default("#8B7355").notNull(),
  capySize: int("capySize").default(50).notNull(),
  totalScore: int("totalScore").default(0).notNull(),
  totalXP: int("totalXP").default(0).notNull(),
  foodEaten: int("foodEaten").default(0).notNull(),
  gamesPlayed: int("gamesPlayed").default(0).notNull(),
  workCount: int("workCount").default(0).notNull(),
  affectionCount: int("affectionCount").default(0).notNull(),
  bathroomCount: int("bathroomCount").default(0).notNull(),
  colorChanges: int("colorChanges").default(0).notNull(),
  size: int("size").default(50).notNull(),
  inventory: text("inventory").default("{}").notNull(),
  lastSaved: timestamp("lastSaved").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const achievements = mysqlTable(
  "achievements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    achievementId: varchar("achievementId", { length: 64 }).notNull(),
    unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  },
  (table) => [unique("achievements_userId_achievementId_unique").on(table.userId, table.achievementId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = typeof gameSaves.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
