import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PenaltyEvidenceComposer } from "./PenaltyEvidenceComposer";

const evidence = {
  id: "evidence-1",
  taskId: "task-1",
  taskTitle: "完成晚间锻炼",
  kind: "penalty",
  originalFilename: "俯卧撑凭据.png",
  mimeType: "image/png",
  byteSize: 8,
  fileUrl: "/evidence/evidence-1/file",
  createdAt: "2026-08-14T20:00:00.000Z",
} as const;

describe("PenaltyEvidenceComposer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores a chosen image locally before recording the penalty as fulfilled", async () => {
    const onFulfilled = vi.fn().mockResolvedValue(true);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(evidence)));
    vi.stubGlobal("fetch", fetchMock);

    render(<PenaltyEvidenceComposer onClose={vi.fn()} onFulfilled={onFulfilled} taskId={evidence.taskId} taskTitle={evidence.taskTitle} />);

    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], evidence.originalFilename, { type: evidence.mimeType });
    fireEvent.change(screen.getByLabelText("凭据图片"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "留存凭据并兑现" }));

    await vi.waitFor(() => expect(onFulfilled).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/evidence", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ taskId: evidence.taskId, filename: evidence.originalFilename, mimeType: evidence.mimeType });
    expect(screen.getByText("图片只保存在这台电脑，既不会上传到云端，也不会发送给 AI。你也可以不附图片，直接记录已兑现。")).toBeVisible();
  });
});
