CREATE TABLE `academy_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('learner','coach','interviewer','admin') NOT NULL DEFAULT 'learner',
	`preferredLanguage` varchar(8) NOT NULL DEFAULT 'fr',
	`secondLanguage` varchar(8) DEFAULT 'ar',
	`status` enum('active','paused') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_profiles_user_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`scenarioId` int NOT NULL,
	`coachId` int,
	`dueAt` timestamp,
	`status` enum('assigned','in_progress','submitted','reviewed') NOT NULL DEFAULT 'assigned',
	`seedSource` enum('admin','demo') NOT NULL DEFAULT 'admin',
	`consentState` enum('granted','revoked') NOT NULL DEFAULT 'granted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `assignments_learner_scenario_idx` UNIQUE(`learnerId`,`scenarioId`)
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(64) NOT NULL,
	`entity` varchar(48) NOT NULL,
	`entityId` int,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` varchar(64) NOT NULL,
	`status` enum('granted','revoked') NOT NULL DEFAULT 'revoked',
	`policyVersion` varchar(16) NOT NULL DEFAULT '2026-11',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `consent_user_purpose_idx` UNIQUE(`userId`,`purpose`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`mimeType` varchar(64) NOT NULL DEFAULT 'audio/mpeg',
	`durationSeconds` int NOT NULL DEFAULT 0,
	`language` varchar(8) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practice_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`scenarioId` int NOT NULL,
	`assignmentId` int,
	`mode` enum('structured','roleplay','listen') NOT NULL DEFAULT 'structured',
	`language` varchar(8) NOT NULL DEFAULT 'fr',
	`transcript` text,
	`reflection` text,
	`status` enum('draft','submitted','reviewed') NOT NULL DEFAULT 'submitted',
	`aiCoaching` text,
	`aiShared` boolean NOT NULL DEFAULT false,
	`durationSeconds` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `practice_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_facts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product` varchar(64) NOT NULL,
	`version` varchar(32) NOT NULL,
	`status` enum('draft','approved','superseded') NOT NULL DEFAULT 'draft',
	`content` text NOT NULL,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_facts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rubric_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`dimension` varchar(48) NOT NULL,
	`score` int NOT NULL,
	`maxScore` int NOT NULL,
	`attribution` enum('human','ai') NOT NULL DEFAULT 'human',
	`feedback` text,
	`reviewerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rubric_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`folio` int NOT NULL,
	`title` varchar(220) NOT NULL,
	`product` varchar(64) NOT NULL,
	`sector` varchar(64) NOT NULL,
	`persona` varchar(220) NOT NULL,
	`language` varchar(8) NOT NULL,
	`languagePair` varchar(16),
	`difficulty` enum('starter','intermediate','advanced','expert') NOT NULL DEFAULT 'intermediate',
	`modality` enum('audio','text') NOT NULL DEFAULT 'audio',
	`summary` text NOT NULL,
	`brief` text NOT NULL,
	`coachingFocus` text NOT NULL,
	`competencies` text NOT NULL,
	`rubric` text NOT NULL,
	`durationSeconds` int NOT NULL DEFAULT 0,
	`factVersion` varchar(32) NOT NULL DEFAULT 'v1.0',
	`status` enum('published','draft','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `scenarios_slug_idx` UNIQUE(`slug`)
);
