import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { DailyReminder, DailyReminderUpdateInput } from "@mainline/contracts";

import { fetchDailyReminder, updateDailyReminder } from "./api";

interface ReminderContextValue {
  reminder: DailyReminder | null;
  saveReminder(input: DailyReminderUpdateInput): Promise<DailyReminder>;
}

const ReminderContext = createContext<ReminderContextValue | null>(null);
const reminderMarkerKey = "mainline:last-daily-reminder";

function getDateMarker(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTime(now: Date): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function useDailyBrowserReminder(reminder: DailyReminder | null) {
  useEffect(() => {
    if (!reminder?.enabled || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const reminderTime = reminder.time;

    function notifyIfDue() {
      const now = new Date();
      const marker = getDateMarker(now);

      if (getCurrentTime(now) !== reminderTime || window.localStorage.getItem(reminderMarkerKey) === marker) {
        return;
      }

      new Notification("Mainline · 今日提醒", { body: "该看一眼今天的主线了。" });
      window.localStorage.setItem(reminderMarkerKey, marker);
    }

    notifyIfDue();
    const intervalId = window.setInterval(notifyIfDue, 30_000);
    return () => window.clearInterval(intervalId);
  }, [reminder]);
}

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminder, setReminder] = useState<DailyReminder | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchDailyReminder(controller.signal).then(setReminder).catch(() => undefined);
    return () => controller.abort();
  }, []);

  useDailyBrowserReminder(reminder);

  async function saveReminder(input: DailyReminderUpdateInput): Promise<DailyReminder> {
    const saved = await updateDailyReminder(input);
    setReminder(saved);
    return saved;
  }

  return <ReminderContext.Provider value={{ reminder, saveReminder }}>{children}</ReminderContext.Provider>;
}

export function useReminderSettings(): ReminderContextValue {
  const context = useContext(ReminderContext);

  if (!context) {
    throw new Error("ReminderProvider 尚未挂载。");
  }

  return context;
}
