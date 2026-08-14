import type { DatabaseSync } from "node:sqlite";

interface Migration {
  id: string;
  apply(database: DatabaseSync): void;
}

const migrations: readonly Migration[] = [
  {
    id: "20260814_001_local_installation",
    apply(database) {
      database.exec(`
        CREATE TABLE local_installation (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          created_at TEXT NOT NULL
        ) STRICT;

        INSERT INTO local_installation (id, created_at)
        VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(id) DO NOTHING;
      `);
    },
  },
  {
    id: "20260814_002_tasks",
    apply(database) {
      database.exec(`
        CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          details TEXT NOT NULL,
          lane TEXT NOT NULL CHECK (lane IN ('main', 'side', 'growth', 'routine')),
          form TEXT NOT NULL CHECK (form IN ('one_off', 'routine', 'challenge', 'event')),
          scheduled_date TEXT NOT NULL,
          time_block TEXT NOT NULL CHECK (time_block IN ('anytime', 'morning', 'afternoon', 'evening')),
          status TEXT NOT NULL CHECK (status IN (
            'planned',
            'in_progress',
            'paused',
            'interrupted',
            'completed',
            'incomplete',
            'pending_resolution',
            'abandoned',
            'closed'
          )),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          completed_at TEXT
        ) STRICT;

        CREATE INDEX tasks_by_scheduled_date
        ON tasks (scheduled_date, time_block, created_at);

        CREATE UNIQUE INDEX tasks_one_active_main_per_day
        ON tasks (scheduled_date)
        WHERE lane = 'main' AND status IN ('planned', 'in_progress');
      `);
    },
  },
  {
    id: "20260814_003_ai_proposals",
    apply(database) {
      database.exec(`
        CREATE TABLE ai_proposals (
          id TEXT PRIMARY KEY,
          kind TEXT NOT NULL CHECK (kind IN ('task_plan', 'interruption')),
          status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'dismissed')),
          payload_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          resolved_at TEXT
        ) STRICT;

        CREATE INDEX ai_proposals_by_status_and_created_at
        ON ai_proposals (status, created_at DESC);
      `);
    },
  },
  {
    id: "20260814_004_task_outcomes",
    apply(database) {
      database.exec(`
        ALTER TABLE tasks ADD COLUMN completion_mode TEXT NOT NULL DEFAULT 'direct'
        CHECK (completion_mode IN ('direct', 'result_report'));

        ALTER TABLE tasks ADD COLUMN experience_reward INTEGER NOT NULL DEFAULT 10
        CHECK (experience_reward BETWEEN 1 AND 100);

        ALTER TABLE tasks ADD COLUMN experience_granted INTEGER NOT NULL DEFAULT 0
        CHECK (experience_granted BETWEEN 0 AND 150);

        ALTER TABLE tasks ADD COLUMN reward_title TEXT NOT NULL DEFAULT '';

        ALTER TABLE tasks ADD COLUMN reward_status TEXT NOT NULL DEFAULT 'none'
        CHECK (reward_status IN ('none', 'locked', 'available', 'claimed', 'forfeited'));

        ALTER TABLE tasks ADD COLUMN penalty_kind TEXT NOT NULL DEFAULT 'none'
        CHECK (penalty_kind IN ('none', 'money', 'physical', 'custom'));

        ALTER TABLE tasks ADD COLUMN penalty_detail TEXT NOT NULL DEFAULT '';

        ALTER TABLE tasks ADD COLUMN penalty_amount INTEGER
        CHECK (penalty_amount IS NULL OR penalty_amount BETWEEN 1 AND 100000);

        ALTER TABLE tasks ADD COLUMN penalty_status TEXT NOT NULL DEFAULT 'none'
        CHECK (penalty_status IN ('none', 'armed', 'pending', 'fulfilled', 'waived'));

        ALTER TABLE tasks ADD COLUMN penalty_due_at TEXT;
        ALTER TABLE tasks ADD COLUMN result_summary TEXT;

        ALTER TABLE tasks ADD COLUMN self_assessment TEXT
        CHECK (self_assessment IS NULL OR self_assessment IN ('basic', 'solid', 'excellent'));

        ALTER TABLE tasks ADD COLUMN result_submitted_at TEXT;
        ALTER TABLE tasks ADD COLUMN incomplete_reason TEXT;

        CREATE INDEX tasks_by_reward_status ON tasks (reward_status, completed_at);
        CREATE INDEX tasks_by_penalty_status ON tasks (penalty_status, penalty_due_at);
      `);
    },
  },
  {
    id: "20260814_005_chapters_and_goals",
    apply(database) {
      database.exec(`
        CREATE TABLE chapters (
          id TEXT PRIMARY KEY,
          domain TEXT NOT NULL CHECK (domain IN ('career', 'learning', 'creation', 'health', 'life')),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          started_on TEXT NOT NULL,
          ends_on TEXT,
          status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'archived')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        ) STRICT;

        CREATE TABLE goals (
          id TEXT PRIMARY KEY,
          chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE RESTRICT,
          title TEXT NOT NULL,
          definition TEXT NOT NULL,
          metric TEXT NOT NULL,
          target_value INTEGER NOT NULL CHECK (target_value BETWEEN 1 AND 1000000),
          current_value INTEGER NOT NULL DEFAULT 0 CHECK (current_value BETWEEN 0 AND 1000000),
          target_date TEXT,
          status TEXT NOT NULL CHECK (status IN ('active', 'achieved', 'paused', 'abandoned')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        ) STRICT;

        CREATE INDEX chapters_by_status_and_domain ON chapters (status, domain, started_on DESC);
        CREATE INDEX goals_by_chapter_and_status ON goals (chapter_id, status, created_at);
      `);
    },
  },
];

export function applyMigrations(database: DatabaseSync): number {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    ) STRICT;
  `);

  database.exec("BEGIN IMMEDIATE");

  try {
    const hasMigration = database.prepare("SELECT 1 FROM schema_migrations WHERE id = ?");
    const markMigration = database.prepare(
      "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
    );

    for (const migration of migrations) {
      if (hasMigration.get(migration.id)) {
        continue;
      }

      migration.apply(database);
      markMigration.run(migration.id, new Date().toISOString());
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  return getAppliedMigrationCount(database);
}

export function getAppliedMigrationCount(database: DatabaseSync): number {
  const result = database.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get() as {
    count: number;
  };

  return result.count;
}
