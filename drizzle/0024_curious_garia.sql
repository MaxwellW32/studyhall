ALTER TABLE `comments` MODIFY COLUMN `likes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `comments` MODIFY COLUMN `likes` int NOT NULL;