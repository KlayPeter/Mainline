import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TodayScreen } from "./TodayScreen";

const plannedTask = {
  id: "task-1",
  title: "完成 Agent 课程第一节",
  details: "记录关键概念并做出一个小练习。",
  goalId: null,
  lane: "main",
  form: "one_off",
  scheduledDate: "2026-08-14",
  timeBlock: "morning",
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
  completedAt: null,
} as const;

describe("TodayScreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a main task and refreshes it after ordinary completion", async () => {
    const completedTask = {
      ...plannedTask,
      status: "completed",
      experienceGranted: 10,
      completedAt: "2026-08-14T09:00:00.000Z",
    } as const;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ tasks: [plannedTask] })))
      .mockResolvedValueOnce(new Response(JSON.stringify(completedTask)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ tasks: [completedTask] })));
    vi.stubGlobal("fetch", fetchMock);

    render(<TodayScreen isComposerOpen={false} onComposerOpenChange={vi.fn()} />);

    expect(await screen.findByRole("heading", { name: plannedTask.title })).toBeVisible();
    expect(screen.getByText("今日主线")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(await screen.findByText(`已完成：${plannedTask.title}，获得 10 经验`)).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(screen.getByText("已完成 · +10 经验", { selector: ".task-card__completed span" })).toBeVisible();
  });
});
