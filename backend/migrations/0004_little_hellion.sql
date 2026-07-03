CREATE TABLE `kelas_finalization` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`semester` text NOT NULL,
	`academic_year` text NOT NULL,
	`status` text NOT NULL,
	`finalized_by` text,
	`finalized_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`class_id`) REFERENCES `kelas_refs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `rapot_semester` ADD `nilai_akhlaq` integer DEFAULT 8;