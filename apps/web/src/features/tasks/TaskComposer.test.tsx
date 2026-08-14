import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TaskComposer } from "./TaskComposer";

vi.mock("../ai-proposals/TaskPlanSuggestion", () => ({
  TaskPlanSuggestion: () => null,
}));

const goalMap = {
  chapters: [{
    id: "chapter-agent",
    domain: "learning",
    title: "Agent 学习",
    description: "完成课程和项目。",
    startedOn: "2026-08-14",
    endsOn: null,
    status: "active",
    createdAt: "2026-08-14T08:00:00.000Z",
    updatedAt: "2026-08-14T08:00:00.000Z",
    goals: [{
      id: "goal-deep-agents",
      chapterId: "chapter-agent",
      title: "完成 Deep Agents 课程",
      definition: "完成课程和项目产出。",
      metric: "完成模块",
      targetValue: 8,
      currentValue: 0,
      linkedTaskCount: 0,
      targetDate: null,
      status: "active",
      createdAt: "2026-08-14T08:00:00.000Z",
      updatedAt: "2026-08-14T08:00:00.000Z",
    }],
  }],
} as const;

const createdTask = {
  id: "task-deep-agents-1",
  title: "学习 Deep Agents 第一节",
  details: "完成 Planning 与 Filesystem 模块。",
  goalId: "goal-deep-agents",
  lane: "side",
  form: "one_off",
  scheduledDate: "2026-08-14",
  timeBlock: "anytime",
  completionMode: "direct",
  experienceReward: 10,
  experienceGranted: 0,
  rewardTitle: "",
  rewardStatus: "none",
  penaltyKind: "none",
  penaltyDetail: "",
  penaltyAmount: null,
  penaltyStatus: "none",
  penaltyDueAt: null,
  resultSummary: null,
  selfAssessment: null,
  resultSubmittedAt: null,
  incompleteReason: null,
  status: "planned",
  createdAt: "2026-08-14T08:00:00.000Z",
  updatedAt: "2026-08-14T08:00:00.000Z",
  startedAt: null,
  activeStartedAt: null,
  focusSeconds: 0,
  interruptionCount: 0,
  completedAt: null,
} as const;

describe("TaskComposer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lets the user choose an active goal and includes it in a new task", async () => {
    const onSaved = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(goalMap)))
      .mockResolvedValueOnce(new Response(JSON.stringify(createdTask)));
    vi.stubGlobal("fetch", fetchMock);

    render(<TaskComposer onClose={vi.fn()} onSaved={onSaved} scheduledDate="2026-08-14" />);

    await vi.waitFor(() => expect(screen.getByRole("option", { name: "完成 Deep Agents 课程" })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("任务标题"), { target: { value: createdTask.title } });
    fireEvent.change(screen.getByLabelText("具体内容"), { target: { value: createdTask.details } });
    fireEvent.change(screen.getByLabelText("关联目标（可选）"), { target: { value: createdTask.goalId } });
    fireEvent.click(screen.getByRole("button", { name: "安排任务" }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(createdTask));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/tasks", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ goalId: createdTask.goalId });
  });
});
