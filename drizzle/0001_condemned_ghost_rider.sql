CREATE TABLE `comments` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`post_id` varchar(255) NOT NULL,
	`date_posted` datetime NOT NULL,
	`message` varchar(255) NOT NULL,
	`likes` int,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` varchar(255) NOT NULL,
	`user_id` text NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `communities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`community_id` varchar(255),
	`study_session_id` varchar(255),
	`likes` int,
	`date_posted` datetime NOT NULL,
	`message` longtext,
	`video_urls` text,
	`image_urls` text,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studysessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`authorized_member_list` text,
	CONSTRAINT `studysessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags_to_communities` (
	`tag_id` varchar(255) NOT NULL,
	`community_id` varchar(255) NOT NULL,
	CONSTRAINT `tags_to_communities_tag_id_community_id_pk` PRIMARY KEY(`tag_id`,`community_id`)
);
--> statement-breakpoint
CREATE TABLE `tags_to_posts` (
	`tag_id` varchar(255) NOT NULL,
	`post_id` varchar(255) NOT NULL,
	CONSTRAINT `tags_to_posts_tag_id_post_id_pk` PRIMARY KEY(`tag_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_communities` (
	`user_id` varchar(255) NOT NULL,
	`community_id` varchar(255) NOT NULL,
	CONSTRAINT `users_to_communities_user_id_community_id_pk` PRIMARY KEY(`user_id`,`community_id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_study_sessions` (
	`user_id` varchar(255) NOT NULL,
	`study_session_id` varchar(255) NOT NULL,
	CONSTRAINT `users_to_study_sessions_user_id_study_session_id_pk` PRIMARY KEY(`user_id`,`study_session_id`)
);
--> statement-breakpoint
DROP TABLE `reminders`;--> statement-breakpoint
DROP TABLE `todos`;--> statement-breakpoint
CREATE INDEX `comments_post_id_index` ON `comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `community_id_index` ON `posts` (`community_id`);--> statement-breakpoint
CREATE INDEX `study_session_id_index` ON `posts` (`study_session_id`);--> statement-breakpoint
ALTER TABLE `tags_to_communities` ADD CONSTRAINT `tags_to_communities_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tags_to_communities` ADD CONSTRAINT `tags_to_communities_community_id_communities_id_fk` FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tags_to_posts` ADD CONSTRAINT `tags_to_posts_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tags_to_posts` ADD CONSTRAINT `tags_to_posts_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_communities` ADD CONSTRAINT `users_to_communities_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_communities` ADD CONSTRAINT `users_to_communities_community_id_communities_id_fk` FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_study_sessions` ADD CONSTRAINT `users_to_study_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_study_sessions` ADD CONSTRAINT `users_to_study_sessions_study_session_id_studysessions_id_fk` FOREIGN KEY (`study_session_id`) REFERENCES `studysessions`(`id`) ON DELETE no action ON UPDATE no action;