import type { DatabaseSync } from "node:sqlite";

import { LocalEvidenceStore } from "../evidence/local-evidence-store.js";

interface EvidenceBackupRow {
  id: string;
  taskId: string;
  kind: "penalty";
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
}

export interface LocalBackupDocument {
  format: "mainline-local-backup";
  version: 1;
  exportedAt: string;
  data: {
    tasks: unknown[];
    chapters: unknown[];
    goals: unknown[];
    dailyReviews: unknown[];
    dailyReminder: unknown;
    aiProposals: unknown[];
    evidence: Array<Omit<EvidenceBackupRow, "storedFilename"> & { dataBase64: string | null }>;
  };
}

export class LocalBackupService {
  constructor(
    private readonly database: DatabaseSync,
    private readonly evidenceStore: LocalEvidenceStore,
  ) {}

  create(): LocalBackupDocument {
    const evidenceRows = this.database.prepare(`
      SELECT
        id,
        task_id AS taskId,
        kind,
        original_filename AS originalFilename,
        stored_filename AS storedFilename,
        mime_type AS mimeType,
        byte_size AS byteSize,
        created_at AS createdAt
      FROM task_evidence
      ORDER BY created_at ASC
    `).all() as unknown as EvidenceBackupRow[];

    return {
      format: "mainline-local-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        tasks: this.database.prepare("SELECT * FROM tasks ORDER BY created_at ASC").all() as unknown[],
        chapters: this.database.prepare("SELECT * FROM chapters ORDER BY created_at ASC").all() as unknown[],
        goals: this.database.prepare("SELECT * FROM goals ORDER BY created_at ASC").all() as unknown[],
        dailyReviews: this.database.prepare("SELECT * FROM daily_reviews ORDER BY date ASC").all() as unknown[],
        dailyReminder: this.database.prepare("SELECT enabled, time, updated_at FROM daily_reminder_settings WHERE id = 1").get() as unknown,
        aiProposals: this.database.prepare("SELECT * FROM ai_proposals ORDER BY created_at ASC").all() as unknown[],
        evidence: evidenceRows.map(({ storedFilename, ...evidence }) => ({
          ...evidence,
          dataBase64: this.readEvidence(storedFilename),
        })),
      },
    };
  }

  private readEvidence(filename: string): string | null {
    try {
      return this.evidenceStore.read(filename).toString("base64");
    } catch {
      return null;
    }
  }
}
