ALTER TABLE `comments` MODIFY COLUMN `likes` int;--> statement-breakpoint
ALTER TABLE `posts` MODIFY COLUMN `likes` int;--> statement-breakpoint
ALTER TABLE `replies` MODIFY COLUMN `likes` int;