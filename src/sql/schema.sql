CREATE TABLE IF NOT EXISTS "games" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"interpreter"	BLOB NOT NULL,
	"interpreter_type"	TEXT NOT NULL,
	"start_time_utc"	INTEGER,
	"end_time_utc"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "solutions" (
	"id"	INTEGER NOT NULL,
	"submitter_id"	TEXT NOT NULL,
	"content"	BLOB NOT NULL,
	"task_id"	INTEGER NOT NULL,
	"score"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE sqlite_stat1(tbl,idx,stat);
CREATE TABLE IF NOT EXISTS "validation_queue" (
	"id"	INTEGER NOT NULL,
	"submitter_id"	TEXT NOT NULL,
	"content"	BLOB NOT NULL,
	"task_id"	INTEGER NOT NULL,
	"score"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tasks" (
	"id"	INTEGER NOT NULL,
	"game_id"	INTEGER NOT NULL,
	"description"	TEXT NOT NULL,
	"points"	INTEGER NOT NULL,
	"score_program"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "messages" (
	"id"	INTEGER NOT NULL,
	"recipient_id"	TEXT NOT NULL,
	"message"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE INDEX "solutions_main_idx" ON "solutions" (
	"id",
	"submitter_id",
	"task_id",
	"score"
);
CREATE INDEX "tasks_main_idx" ON "tasks" (
	"id",
	"game_id",
	"points"
);
