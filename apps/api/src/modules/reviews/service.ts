import type { DailyReview, DailyReviewInput, ReviewListResponse } from "@mainline/contracts";

import { ReviewRepository } from "./repository.js";

function assertDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error("INVALID_DATE");
}

export class ReviewService {
  constructor(private readonly repository: ReviewRepository) {}
  list(): ReviewListResponse { return { reviews: this.repository.list(30) }; }
  save(date: string, input: DailyReviewInput): DailyReview {
    assertDate(date);
    const now = new Date().toISOString();
    const current = this.repository.find(date);
    return this.repository.save({ date, progress: input.progress.trim(), obstacles: input.obstacles.trim(), nextStep: input.nextStep.trim(), keepAsMemory: input.keepAsMemory, createdAt: current?.createdAt ?? now, updatedAt: now });
  }
}
