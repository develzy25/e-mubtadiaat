CREATE TABLE `jadwal_pelajaran` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`kitab_name` text NOT NULL,
	`hari` text NOT NULL,
	`sesi` text NOT NULL,
	`kwartal` integer NOT NULL,
	`academic_year` text NOT NULL,
	`pengajar` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`class_id`) REFERENCES `kelas_refs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rapot_nilai` (
	`id` text PRIMARY KEY NOT NULL,
	`rapot_id` text NOT NULL,
	`kitab_name` text NOT NULL,
	`tamrin_score` integer NOT NULL,
	`ujian_score` integer NOT NULL,
	`khosh_score` integer NOT NULL,
	`is_fixed_column` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`rapot_id`) REFERENCES `rapot_semester`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rapot_semester` (
	`id` text PRIMARY KEY NOT NULL,
	`santri_id` text NOT NULL,
	`class_id` text NOT NULL,
	`semester` text NOT NULL,
	`academic_year` text NOT NULL,
	`izin_count` integer DEFAULT 0,
	`tanpa_izin_count` integer DEFAULT 0,
	`catatan` text,
	`predikat_override` text,
	`recorded_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`santri_id`) REFERENCES `santri_refs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `kelas_refs`(`id`) ON UPDATE no action ON DELETE no action
);
