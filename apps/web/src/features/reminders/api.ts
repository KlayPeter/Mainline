import { isDailyReminder, type DailyReminder, type DailyReminderUpdateInput } from "@mainline/contracts";

export class ReminderApiError extends Error {}

async function errorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => undefined) as { message?: unknown } | undefined;
  return typeof payload?.message === "string" ? payload.message : "提醒设置暂时没有保存成功。";
}

export async function fetchDailyReminder(signal?: AbortSignal): Promise<DailyReminder> {
  const response = await fetch("/api/reminders/daily", { signal });

  if (!response.ok) {
    throw new ReminderApiError(await errorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isDailyReminder(payload)) {
    throw new ReminderApiError("本地服务返回了无法识别的提醒设置。");
  }

  return payload;
}

export async function updateDailyReminder(input: DailyReminderUpdateInput): Promise<DailyReminder> {
  const response = await fetch("/api/reminders/daily", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new ReminderApiError(await errorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isDailyReminder(payload)) {
    throw new ReminderApiError("本地服务返回了无法识别的提醒设置。");
  }

  return payload;
}
