CREATE INDEX `campaign_account_id_idx` ON `campaigns` (`account_id`);--> statement-breakpoint
CREATE INDEX `contact_campaign_id_idx` ON `contacts` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `contact_campaign_cansend_idx` ON `contacts` (`campaign_id`,`can_send`);--> statement-breakpoint
CREATE INDEX `message_campaign_id_idx` ON `messages` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `message_campaign_status_idx` ON `messages` (`campaign_id`,`status`);--> statement-breakpoint
CREATE INDEX `user_account_id_idx` ON `users` (`account_id`);