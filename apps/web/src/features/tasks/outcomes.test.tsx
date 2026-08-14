import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IncompleteComposer } from "./IncompleteComposer";
import { ResultComposer } from "./ResultComposer";

const baseTask = {
  id: "task-outcome-1",
  title: "写一份 Agent 教程",
  details: "完成教程与示例项目。",
  lane: "side",
  form: "challenge",
  scheduledDate: "2026-08-14",
  timeBlock: "evening",
  completionMode: "result_report",
  experienceReward: 20,
  experienceGranted: 0,
  rewardTitle: "一瓶可乐",
  rewardStatus: "locked",
  penaltyKind: "physical",
  penaltyDetail: "完成 30 个俯卧撑",
  penaltyAmount: null,
  penaltyStatus: "armed",
  penaltyDueAt: null,
  resultSummary: null,
  selfAssessment: null,
  resultSubmittedAt: null,
  incompleteReason: null,
  status: "planned",
  createdAt: "2026-08-14T08:00:00.000Z",
  updatedAt: "2026-08-14T08:00:00.000Z",
  completedAt: null,
} as const;

describe("task outcome UI", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires a written result and self-assessment before a result task can be confirmed", async () => {
    const onSaved = vi.fn();
    const submittedTask = {
      ...baseTask,
      status: "pending_resolution",
      resultSummary: "完成教程结构和示例项目。",
      selfAssessment: "solid",
      resultSubmittedAt: "2026-08-14T20:00:00.000Z",
      updatedAt: "2026-08-14T20:00:00.000Z",
    } as const;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(submittedTask)));
    vi.stubGlobal("fetch", fetchMock);

    render(<ResultComposer onClose={vi.fn()} onSaved={onSaved} task={baseTask} />);

    fireEvent.change(screen.getByLabelText("成果或进展"), { target: { value: submittedTask.resultSummary } });
    fireEvent.change(screen.getByLabelText("这次的自评"), { target: { value: "solid" } });
    fireEvent.click(screen.getByRole("button", { name: "提交成果" }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(submittedTask));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/tasks/${baseTask.id}/submit-result`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("only records an incomplete outcome after the user explicitly confirms it", async () => {
    const onSaved = vi.fn();
    const incompleteTask = {
      ...baseTask,
      status: "incomplete",
      rewardStatus: "forfeited",
      penaltyStatus: "pending",
      penaltyDueAt: "2026-08-15T20:00:00.000Z",
      incompleteReason: "临时加班。",
      updatedAt: "2026-08-14T20:00:00.000Z",
    } as const;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(incompleteTask)));
    vi.stubGlobal("fetch", fetchMock);

    render(<IncompleteComposer onClose={vi.fn()} onSaved={onSaved} task={baseTask} />);

    fireEvent.change(screen.getByLabelText("原因（可选）"), { target: { value: incompleteTask.incompleteReason } });
    fireEvent.click(screen.getByRole("button", { name: "确认未完成" }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(incompleteTask));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/tasks/${baseTask.id}/mark-incomplete`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
