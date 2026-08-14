import type { DatabaseSync } from "node:sqlite";

import type { Chapter, ChapterWithGoals, Goal, GoalMapResponse } from "@mainline/contracts";

interface ChapterRow {
  id: string; domain: Chapter["domain"]; title: string; description: string; started_on: string; ends_on: string | null;
  status: Chapter["status"]; created_at: string; updated_at: string;
}

interface GoalRow {
  id: string; chapter_id: string; title: string; definition: string; metric: string; target_value: number; current_value: number;
  target_date: string | null; status: Goal["status"]; created_at: string; updated_at: string;
}

interface GoalTaskCountRow {
  goal_id: string;
  task_count: number;
}

function toChapter(row: ChapterRow): Chapter {
  return { id: row.id, domain: row.domain, title: row.title, description: row.description, startedOn: row.started_on, endsOn: row.ends_on, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

function toGoal(row: GoalRow, linkedTaskCount = 0): Goal {
  return { id: row.id, chapterId: row.chapter_id, title: row.title, definition: row.definition, metric: row.metric, targetValue: row.target_value, currentValue: row.current_value, linkedTaskCount, targetDate: row.target_date, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

export class GoalRepository {
  constructor(private readonly database: DatabaseSync) {}

  listMap(): GoalMapResponse {
    const chapters = this.database.prepare("SELECT * FROM chapters ORDER BY status = 'active' DESC, started_on DESC, created_at DESC").all() as unknown as ChapterRow[];
    const goals = this.database.prepare("SELECT * FROM goals ORDER BY status = 'active' DESC, created_at ASC").all() as unknown as GoalRow[];
    const taskCounts = this.database.prepare("SELECT goal_id, COUNT(*) AS task_count FROM tasks WHERE goal_id IS NOT NULL GROUP BY goal_id").all() as unknown as GoalTaskCountRow[];
    const countByGoal = new Map(taskCounts.map((item) => [item.goal_id, item.task_count]));
    const byChapter = new Map<string, Goal[]>();
    for (const row of goals) {
      const goal = toGoal(row, countByGoal.get(row.id) ?? 0);
      byChapter.set(goal.chapterId, [...(byChapter.get(goal.chapterId) ?? []), goal]);
    }
    return { chapters: chapters.map((chapter): ChapterWithGoals => ({ ...toChapter(chapter), goals: byChapter.get(chapter.id) ?? [] })) };
  }

  createChapter(chapter: Chapter): Chapter {
    this.database.prepare("INSERT INTO chapters (id, domain, title, description, started_on, ends_on, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(chapter.id, chapter.domain, chapter.title, chapter.description, chapter.startedOn, chapter.endsOn, chapter.status, chapter.createdAt, chapter.updatedAt);
    return chapter;
  }

  createGoal(goal: Omit<Goal, "linkedTaskCount">): Goal {
    this.database.prepare("INSERT INTO goals (id, chapter_id, title, definition, metric, target_value, current_value, target_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(goal.id, goal.chapterId, goal.title, goal.definition, goal.metric, goal.targetValue, goal.currentValue, goal.targetDate, goal.status, goal.createdAt, goal.updatedAt);
    return { ...goal, linkedTaskCount: 0 };
  }

  findChapter(id: string): Chapter | undefined {
    const row = this.database.prepare("SELECT * FROM chapters WHERE id = ?").get(id) as ChapterRow | undefined;
    return row ? toChapter(row) : undefined;
  }

  findGoal(id: string): Goal | undefined {
    const row = this.database.prepare("SELECT * FROM goals WHERE id = ?").get(id) as GoalRow | undefined;
    return row ? toGoal(row, this.getLinkedTaskCount(id)) : undefined;
  }

  updateProgress(id: string, currentValue: number, status: Goal["status"], updatedAt: string): Goal {
    this.database.prepare("UPDATE goals SET current_value = ?, status = ?, updated_at = ? WHERE id = ?").run(currentValue, status, updatedAt, id);
    return this.findGoal(id)!;
  }

  private getLinkedTaskCount(goalId: string): number {
    const result = this.database.prepare("SELECT COUNT(*) AS task_count FROM tasks WHERE goal_id = ?").get(goalId) as { task_count: number };
    return result.task_count;
  }
}
