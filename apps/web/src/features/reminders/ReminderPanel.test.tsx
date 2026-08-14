import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReminderProvider } from "./ReminderContext";
import { ReminderPanel } from "./ReminderPanel";

const disabledReminder = { enabled: false, time: "20:00", updatedAt: "2026-08-14T08:00:00.000Z" } as const;
const enabledReminder = { ...disabledReminder, enabled: true, time: "21:15" } as const;

class TestNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn().mockResolvedValue("granted");

  constructor(_title: string, _options?: NotificationOptions) {}
}

describe("ReminderPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    TestNotification.requestPermission.mockClear();
  });

  it("asks the user for browser permission before saving a local daily reminder", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(disabledReminder)))
      .mockResolvedValueOnce(new Response(JSON.stringify(enabledReminder)));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("Notification", TestNotification);

    render(<ReminderProvider><ReminderPanel /></ReminderProvider>);

    await screen.findByRole("button", { name: "开启提醒" });
    fireEvent.change(screen.getByLabelText("提醒时间"), { target: { value: enabledReminder.time } });
    fireEvent.click(screen.getByRole("button", { name: "开启提醒" }));

    await vi.waitFor(() => expect(TestNotification.requestPermission).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/reminders/daily", expect.objectContaining({ method: "PUT" }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ enabled: true, time: enabledReminder.time });
    expect(screen.getByText("在 Mainline 打开期间，每天到设定时间最多提醒一次；浏览器完全关闭时不会推送。")).toBeVisible();
  });
});
