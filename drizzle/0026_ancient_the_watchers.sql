CREATE INDEX `comment_likes_index` ON `comments` (`likes`);--> statement-breakpoint
CREATE INDEX `member_count_index` ON `communities` (`member_count`);--> statement-breakpoint
CREATE INDEX `post_likes_index` ON `posts` (`likes`);--> statement-breakpoint
CREATE INDEX `post_date_posted_index` ON `posts` (`date_posted`);--> statement-breakpoint
CREATE INDEX `reply_likes_index` ON `replies` (`likes`);