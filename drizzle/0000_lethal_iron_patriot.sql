CREATE TABLE `reminders` (
	`id` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`todoid` varchar(255) NOT NULL,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`date` datetime NOT NULL,
	`likes` int,
	CONSTRAINT `todos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `todoididx` ON `reminders` (`todoid`);