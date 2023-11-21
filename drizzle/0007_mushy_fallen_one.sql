DROP INDEX `replies_comment_id_index` ON `replies`;--> statement-breakpoint
ALTER TABLE `communities` ADD `member_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `replies` ADD `replying_to_user_id` varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX `comment_id_idx` ON `replies` (`comment_id`);--> statement-breakpoint
CREATE INDEX `replying_To_user_id_index` ON `replies` (`replying_to_user_id`);--> statement-breakpoint
ALTER TABLE `replies` DROP COLUMN `u_id`;