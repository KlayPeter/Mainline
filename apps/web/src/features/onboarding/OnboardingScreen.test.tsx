import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OnboardingProvider } from "./OnboardingContext";
import { OnboardingScreen } from "./OnboardingScreen";

const incompleteProfile = {
  completed: false,
  lifeStateTitle: "",
  lifeStateDescription: "",
  lifeStateStartedOn: null,
  lifeStateEndsOn: null,
  currentContext: "",
  timeConstraints: "",
  interruptionPatterns: "",
  rewardPreferences: "",
  penaltyPreferences: "",
  capabilityFocus: "",
  completedAt: null,
  updatedAt: "2026-08-14T08:00:00.000Z",
};

describe("OnboardingScreen", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the user in control of an optional local profile before entering the app", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(incompleteProfile)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...incompleteProfile, completed: true, lifeStateTitle: "毕业后的过渡期", completedAt: "2026-08-14T08:01:00.000Z" })));
    vi.stubGlobal("fetch", fetchMock);

    render(<OnboardingProvider><OnboardingScreen mode="initial" /></OnboardingProvider>);

    await screen.findByRole("heading", { name: "先认识你所在的阶段。" });
    fireEvent.change(screen.getByLabelText("这段人生如何称呼？"), { target: { value: "毕业后的过渡期" } });
    fireEvent.click(screen.getByRole("button", { name: "继续" }));
    await screen.findByRole("heading", { name: "再看一看真实的节奏。" });
    fireEvent.click(screen.getByRole("button", { name: "继续" }));
    await screen.findByRole("heading", { name: "写下会让你愿意行动的东西。" });
    fireEvent.click(screen.getByRole("button", { name: "进入 Mainline" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/onboarding/profile", expect.objectContaining({ method: "PUT" }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ lifeStateTitle: "毕业后的过渡期" });
    expect(screen.getByText("内容只保存在这台设备。所有问题都可以跳过，之后仍能在“我的”里修改。")).toBeVisible();
  });
});
