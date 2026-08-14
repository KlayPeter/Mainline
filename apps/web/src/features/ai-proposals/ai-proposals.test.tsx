import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InterruptionComposer } from "./InterruptionComposer";
import { TaskPlanSuggestion } from "./TaskPlanSuggestion";

const taskPlanProposal = {
  id: "proposal-task-plan",
  kind: "task_plan",
  status: "pending",
  request: {
    title: "完成 Agent 课程第一节",
    details: "学习 Planning 和 Filesystem。",
    scheduledDate: "2026-08-14",
  },
  content: {
    analysis: "课程范围不小，先用一个最小练习把学习落到实处。",
    suggestedLane: "growth",
    suggestedForm: "challenge",
    suggestedTimeBlock: "evening",
    suggestedSteps: [{ title: "完成第一节", details: "只做课程与一个小练习。" }],
  },
  createdAt: "2026-08-14T08:00:00.000Z",
  resolvedAt: null,
} as const;

const interruptionProposal = {
  id: "proposal-interruption",
  kind: "interruption",
  status: "pending",
  request: { message: "临时加班，今晚没有完整时间。", taskId: "task-1" },
  content: {
    summary: "加班压缩了今晚的可用精力。",
    suggestedAction: "reduce",
    suggestedAdjustment: "只用 20 分钟回顾课程；不够就由你自己改期。",
  },
  createdAt: "2026-08-14T08:00:00.000Z",
  resolvedAt: null,
} as const;

describe("AI proposal UI", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("only applies a task plan back to the form after the user explicitly accepts it", async () => {
    const onApply = vi.fn();
    const acceptedProposal = { ...taskPlanProposal, status: "accepted", resolvedAt: "2026-08-14T08:01:00.000Z" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ proposals: [] })))
      .mockResolvedValueOnce(new Response(JSON.stringify(taskPlanProposal)))
      .mockResolvedValueOnce(new Response(JSON.stringify(acceptedProposal)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <TaskPlanSuggestion
        details={taskPlanProposal.request.details}
        onApply={onApply}
        scheduledDate={taskPlanProposal.request.scheduledDate}
        title={taskPlanProposal.request.title}
      />,
    );

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "帮我规划" }));
    expect(await screen.findByText(taskPlanProposal.content.analysis)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "采用分类建议" }));
    await vi.waitFor(() => {
      expect(onApply).toHaveBeenCalledWith({ lane: "growth", form: "challenge", timeBlock: "evening" });
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("makes clear that an accepted interruption suggestion still leaves the task untouched", async () => {
    const onClose = vi.fn();
    const onResolved = vi.fn();
    const acceptedProposal = { ...interruptionProposal, status: "accepted", resolvedAt: "2026-08-14T08:01:00.000Z" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ proposals: [] })))
      .mockResolvedValueOnce(new Response(JSON.stringify(interruptionProposal)))
      .mockResolvedValueOnce(new Response(JSON.stringify(acceptedProposal)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <InterruptionComposer
        onClose={onClose}
        onResolved={onResolved}
        task={{
          id: "task-1",
          title: "完成工作需求梳理",
          details: "今天下班前给出初版。",
          lane: "main",
          form: "one_off",
          scheduledDate: "2026-08-14",
          timeBlock: "afternoon",
          status: "planned",
          createdAt: "2026-08-14T08:00:00.000Z",
          updatedAt: "2026-08-14T08:00:00.000Z",
          completedAt: null,
        }}
      />,
    );

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("发生了什么"), { target: { value: interruptionProposal.request.message } });
    fireEvent.click(screen.getByRole("button", { name: "给我调整思路" }));
    expect(await screen.findByText(interruptionProposal.content.summary)).toBeVisible();
    expect(screen.getByText("这只是建议。确认后也不会自动改动任何任务。")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "记下这条思路" }));
    await vi.waitFor(() => {
      expect(onResolved).toHaveBeenCalledWith("已记下这条调整思路。任务尚未改动，请由你决定下一步。");
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
