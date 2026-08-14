import type { DatabaseSync } from "node:sqlite";

import type { DailyReview } from "@mainline/contracts";

interface ReviewRow {
  date: string;
  progress: string;
  obstacles: string;
  next_step: string;
  keep_as_memory: number;
  created_at: string;
  updated_at: string;
}

function toReview(row: ReviewRow): DailyReview {
  return {
    date: row.date,
    progress: row.progress,
    obstacles: row.obstacles,
    nextStep: row.next_step,
    keepAsMemory: row.keep_as_memory === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ReviewRepository {
  constructor(private readonly database: DatabaseSync) {}

  list(limit: number): DailyReview[] {
    return (this.database.prepare("SELECT * FROM daily_reviews ORDER BY date DESC LIMIT ?").all(limit) as unknown as ReviewRow[]).map(toReview);
  }

  find(date: string): DailyReview | undefined {
    const row = this.database.prepare("SELECT * FROM daily_reviews WHERE date = ?").get(date) as ReviewRow | undefined;
    return row ? toReview(row) : undefined;
  }

  save(review: DailyReview): DailyReview {
    this.database.prepare(`
      INSERT INTO daily_reviews (date, progress, obstacles, next_step, keep_as_memory, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET progress = excluded.progress, obstacles = excluded.obstacles,
        next_step = excluded.next_step, keep_as_memory = excluded.keep_as_memory, updated_at = excluded.updated_at
    `).run(review.date, review.progress, review.obstacles, review.nextStep, review.keepAsMemory ? 1 : 0, review.createdAt, review.updatedAt);
    return this.find(review.date)!;
  }
}
