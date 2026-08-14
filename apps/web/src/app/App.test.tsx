import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("App shell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the app usable when the local API is offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<App />);

    expect(screen.getByRole("heading", { name: "今天，只留一条主线。" })).toBeVisible();
    expect(screen.getByRole("button", { name: "今天" })).toBeVisible();
    expect(screen.getByRole("button", { name: "目标" })).toBeVisible();
    expect(screen.getByRole("button", { name: "记录" })).toBeVisible();
    expect(screen.getByRole("button", { name: "我的" })).toBeVisible();
    expect(await screen.findByText("本地存档暂不可用")).toBeVisible();
  });
});
