ALTER TABLE `posts` MODIFY COLUMN `likes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `posts` MODIFY COLUMN `likes` int NOT NULL;--> statement-breakpoint
ALTER TABLE `replies` MODIFY COLUMN `likes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `replies` MODIFY COLUMN `likes` int NOT NULL;