ALTER TABLE `tags_to_communities` DROP FOREIGN KEY `tags_to_communities_tag_id_tags_id_fk`;
--> statement-breakpoint
ALTER TABLE `tags_to_communities` DROP FOREIGN KEY `tags_to_communities_community_id_communities_id_fk`;
--> statement-breakpoint
ALTER TABLE `tags_to_posts` DROP FOREIGN KEY `tags_to_posts_tag_id_tags_id_fk`;
--> statement-breakpoint
ALTER TABLE `tags_to_posts` DROP FOREIGN KEY `tags_to_posts_post_id_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `users_to_communities` DROP FOREIGN KEY `users_to_communities_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `users_to_communities` DROP FOREIGN KEY `users_to_communities_community_id_communities_id_fk`;
--> statement-breakpoint
ALTER TABLE `users_to_study_sessions` DROP FOREIGN KEY `users_to_study_sessions_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `users_to_study_sessions` DROP FOREIGN KEY `users_to_study_sessions_study_session_id_studysessions_id_fk`;
