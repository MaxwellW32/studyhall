CREATE TABLE `replies` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`u_id` varchar(255) NOT NULL,
	`comment_id` varchar(255) NOT NULL,
	`date_posted` datetime NOT NULL,
	`message` varchar(255) NOT NULL,
	`likes` int,
	CONSTRAINT `replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `replies_comment_id_index` ON `replies` (`comment_id`);--> statement-breakpoint
CREATE INDEX `username_index` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `user_id_index` ON `users` (`id`);--> statement-breakpoint
ALTER TABLE `comments` DROP COLUMN `reply_id`;