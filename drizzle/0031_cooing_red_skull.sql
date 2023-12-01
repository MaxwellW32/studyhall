CREATE TABLE `users_to_liked_comments` (
	`user_id` varchar(255) NOT NULL,
	`comment_id` varchar(255) NOT NULL,
	CONSTRAINT `users_to_liked_comments_user_id_comment_id_pk` PRIMARY KEY(`user_id`,`comment_id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_liked_posts` (
	`user_id` varchar(255) NOT NULL,
	`post_id` varchar(255) NOT NULL,
	CONSTRAINT `users_to_liked_posts_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_liked_replies` (
	`user_id` varchar(255) NOT NULL,
	`reply_id` varchar(255) NOT NULL,
	CONSTRAINT `users_to_liked_replies_user_id_reply_id_pk` PRIMARY KEY(`user_id`,`reply_id`)
);
