-- Add media support columns to global_chat_messages
ALTER TABLE `global_chat_messages` ADD COLUMN `mediaUrl` text;
--> statement-breakpoint
ALTER TABLE `global_chat_messages` ADD COLUMN `mediaType` text;
--> statement-breakpoint
ALTER TABLE `global_chat_messages` ADD COLUMN `mediaName` text;
