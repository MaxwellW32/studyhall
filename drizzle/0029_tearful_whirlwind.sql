DROP INDEX `replying_To_user_id_index` ON `replies`;--> statement-breakpoint
ALTER TABLE `replies` MODIFY COLUMN `replying_to_user_id` varchar(255);