CREATE INDEX `user_id_index` ON `studysessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `name_index` ON `studysessions` (`name`);--> statement-breakpoint
CREATE INDEX `study_session_id_index` ON `users_to_study_sessions` (`study_session_id`);