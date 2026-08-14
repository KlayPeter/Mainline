import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TaskInterruptionComposer } from "./TaskInterruptionComposer";

const activeTask = {
  id: "task-focus-1",
  title: "完成 Agent 课程练习",
  details: "实现一个小工具。",
  goalId: null,
  lane: "side",
  form: "one_off",
  scheduledDate: "2026-08-14",
  timeBlock: "evening",
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
  status: "in_progress",
  createdAt: "2026-08-14T08:00:00.000Z",
  updatedAt: "2026-08-14T20:00:00.000Z",
  startedAt: "2026-08-14T20:00:00.000Z",
  activeStartedAt: "2026-08-14T20:00:00.000Z",
  focusSeconds: 0,
  interruptionCount: 0,
  completedAt: null,
} as const;

describe("TaskInterruptionComposer", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("records a user-written interruption without asking AI to change the task", async () => {
    const interruptedTask = { ...activeTask, status: "interrupted", activeStartedAt: null, interruptionCount: 1 } as const;
    const onSaved = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(interruptedTask)));
    vi.stubGlobal("fetch", fetchMock);

    render(<TaskInterruptionComposer onClose={vi.fn()} onSaved={onSaved} task={activeTask} />);

    fireEvent.change(screen.getByLabelText("发生了什么"), { target: { value: "临时工作插入。" } });
    fireEvent.click(screen.getByRole("button", { name: "记录中断" }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(interruptedTask));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/tasks/${activeTask.id}/interrupt`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
