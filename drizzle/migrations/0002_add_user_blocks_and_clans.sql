-- User blocks table
CREATE TABLE IF NOT EXISTS `user_blocks` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `blockerId` integer NOT NULL REFERENCES `users`(`id`),
  `blockedId` integer NOT NULL REFERENCES `users`(`id`),
  `createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `user_blocks_blocker_blocked_unique` ON `user_blocks` (`blockerId`, `blockedId`);
--> statement-breakpoint

-- Clans table
CREATE TABLE IF NOT EXISTS `clans` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `tag` text NOT NULL,
  `description` text,
  `leaderId` integer NOT NULL REFERENCES `users`(`id`),
  `coins` integer DEFAULT 0 NOT NULL,
  `emblem` text DEFAULT '🛡️' NOT NULL,
  `isPublic` integer DEFAULT 1 NOT NULL,
  `minLevel` integer DEFAULT 1 NOT NULL,
  `createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `clans_name_unique` ON `clans` (`name`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `clans_tag_unique` ON `clans` (`tag`);
--> statement-breakpoint

-- Clan members table
CREATE TABLE IF NOT EXISTS `clan_members` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `clanId` integer NOT NULL REFERENCES `clans`(`id`) ON DELETE CASCADE,
  `userId` integer NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `role` text DEFAULT 'member' NOT NULL,
  `joinedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `clan_members_user_unique` ON `clan_members` (`userId`);
--> statement-breakpoint

-- Clan invites table
CREATE TABLE IF NOT EXISTS `clan_invites` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `clanId` integer NOT NULL REFERENCES `clans`(`id`) ON DELETE CASCADE,
  `inviterId` integer NOT NULL REFERENCES `users`(`id`),
  `inviteeId` integer NOT NULL REFERENCES `users`(`id`),
  `status` text DEFAULT 'pending' NOT NULL,
  `createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `clan_invites_clan_invitee_status_unique` ON `clan_invites` (`clanId`, `inviteeId`, `status`);
