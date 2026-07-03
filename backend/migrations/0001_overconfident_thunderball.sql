CREATE TABLE `blok` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `jenjang` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mundzir_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `kamar` (
	`id` text PRIMARY KEY NOT NULL,
	`blok_id` text NOT NULL,
	`name` text NOT NULL,
	`penasihat` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`blok_id`) REFERENCES `blok`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tingkat` (
	`id` text PRIMARY KEY NOT NULL,
	`jenjang_id` text NOT NULL,
	`jenjang_name` text NOT NULL,
	`roman_name` text NOT NULL,
	`mufatish_name` text,
	`target_nadzom` text,
	`target_bait` integer,
	`has_praktek` integer DEFAULT false,
	`praktek_subjects` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`jenjang_id`) REFERENCES `jenjang`(`id`) ON UPDATE no action ON DELETE no action
);
