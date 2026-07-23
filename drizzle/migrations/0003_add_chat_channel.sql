-- Add channel column to global_chat_messages for clan-scoped chat
ALTER TABLE `global_chat_messages` ADD COLUMN `channel` text DEFAULT 'global' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `global_chat_messages_channel_idx` ON `global_chat_messages` (`channel`);
