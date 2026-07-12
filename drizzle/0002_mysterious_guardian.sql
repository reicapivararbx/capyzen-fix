CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` varchar(64) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_userId_achievementId_unique` UNIQUE(`userId`,`achievementId`)
);
--> statement-breakpoint
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;