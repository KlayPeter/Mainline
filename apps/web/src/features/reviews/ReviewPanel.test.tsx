import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewPanel } from "./ReviewPanel";

describe("ReviewPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves a daily review and makes a selected entry available as a memory", async () => {
    const date = new Date().toISOString().slice(0, 10);
    const review = {
      date,
      progress: "完成了今天的工作任务。",
      obstacles: "下班后精力不足。",
      nextStep: "明天先安排 25 分钟学习。",
      keepAsMemory: true,
      createdAt: "2026-08-14T12:00:00.000Z",
      updatedAt: "2026-08-14T12:00:00.000Z",
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ reviews: [] })))
      .mockResolvedValueOnce(new Response(JSON.stringify(review)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ reviews: [review] })));
    vi.stubGlobal("fetch", fetchMock);

    render(<ReviewPanel />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "今天写一下" }));
    fireEvent.change(screen.getByLabelText("有什么进展"), { target: { value: review.progress } });
    fireEvent.change(screen.getByLabelText("什么阻碍了你"), { target: { value: review.obstacles } });
    fireEvent.change(screen.getByLabelText("明天最小的一步"), { target: { value: review.nextStep } });
    fireEvent.click(screen.getByLabelText("这条值得作为长期记忆保留"));
    fireEvent.click(screen.getByRole("button", { name: "保存复盘" }));

    await vi.waitFor(() => expect(screen.getByText(/长期记忆/)).toBeInTheDocument());
    expect(fetchMock).toHaveBeenNthCalledWith(2, `/api/reviews/${date}`, expect.objectContaining({ method: "PUT" }));
  });
});
