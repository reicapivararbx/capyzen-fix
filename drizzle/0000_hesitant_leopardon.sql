CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`achievementId` text NOT NULL,
	`unlockedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_userId_achievementId_unique` ON `achievements` (`userId`,`achievementId`);--> statement-breakpoint
CREATE TABLE `game_saves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`food` integer DEFAULT 100 NOT NULL,
	`poop` integer DEFAULT 0 NOT NULL,
	`hunger` integer DEFAULT 100 NOT NULL,
	`happiness` integer DEFAULT 100 NOT NULL,
	`sus` integer DEFAULT 0 NOT NULL,
	`x` integer DEFAULT 400 NOT NULL,
	`y` integer DEFAULT 300 NOT NULL,
	`speed` integer DEFAULT 5 NOT NULL,
	`alive` integer DEFAULT 1 NOT NULL,
	`capyColor` text DEFAULT '#8B7355' NOT NULL,
	`capySize` integer DEFAULT 50 NOT NULL,
	`totalScore` integer DEFAULT 0 NOT NULL,
	`totalXP` integer DEFAULT 0 NOT NULL,
	`foodEaten` integer DEFAULT 0 NOT NULL,
	`gamesPlayed` integer DEFAULT 0 NOT NULL,
	`workCount` integer DEFAULT 0 NOT NULL,
	`affectionCount` integer DEFAULT 0 NOT NULL,
	`bathroomCount` integer DEFAULT 0 NOT NULL,
	`colorChanges` integer DEFAULT 0 NOT NULL,
	`size` integer DEFAULT 50 NOT NULL,
	`inventory` text DEFAULT '{}' NOT NULL,
	`lastSaved` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_saves_userId_unique` ON `game_saves` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);