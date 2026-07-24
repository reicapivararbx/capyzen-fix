CREATE TABLE `banned_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`username` text NOT NULL,
	`reason` text NOT NULL,
	`bannedAt` integer NOT NULL,
	`expiresAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reporterId` integer,
	`messageId` integer,
	`reason` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`messageId`) REFERENCES `global_chat_messages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clan_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clanId` integer NOT NULL,
	`inviterId` integer NOT NULL,
	`inviteeId` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`clanId`) REFERENCES `clans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviterId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inviteeId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clan_invites_clan_invitee_status_unique` ON `clan_invites` (`clanId`,`inviteeId`,`status`);--> statement-breakpoint
CREATE TABLE `clan_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clanId` integer NOT NULL,
	`userId` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joinedAt` integer NOT NULL,
	FOREIGN KEY (`clanId`) REFERENCES `clans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clan_members_user_unique` ON `clan_members` (`userId`);--> statement-breakpoint
CREATE TABLE `clans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`tag` text NOT NULL,
	`description` text,
	`leaderId` integer NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`emblem` text DEFAULT '🛡️' NOT NULL,
	`isPublic` integer DEFAULT true NOT NULL,
	`minLevel` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`leaderId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clans_name_unique` ON `clans` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `clans_tag_unique` ON `clans` (`tag`);--> statement-breakpoint
CREATE TABLE `friend_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`senderId` integer NOT NULL,
	`recipientId` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friend_requests_sender_recipient_unique` ON `friend_requests` (`senderId`,`recipientId`);--> statement-breakpoint
CREATE TABLE `global_chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`senderName` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`mediaUrl` text,
	`mediaType` text,
	`mediaName` text,
	`channel` text DEFAULT 'global' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`ip` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`blockerId` integer NOT NULL,
	`blockedId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`blockerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`blockedId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_blocks_blocker_blocked_unique` ON `user_blocks` (`blockerId`,`blockedId`);--> statement-breakpoint
ALTER TABLE `game_saves` ADD `xpBoost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `coinBoost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `speedBoost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `shieldActive` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `luckBoost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `ownedClothing` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `equippedItems` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `playerName` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `capyName` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `age` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `energy` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `thirst` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `hygiene` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `health` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `fnfSongsCompleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `fnfHighestCombo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game_saves` ADD `millionRewardClaimed` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpires` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);