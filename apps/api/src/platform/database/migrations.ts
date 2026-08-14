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
