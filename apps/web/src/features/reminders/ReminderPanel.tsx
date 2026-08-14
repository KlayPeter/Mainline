import { Bell, BellSlash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { ReminderApiError } from "./api";
import { useReminderSettings } from "./ReminderContext";

function supportsNotifications(): boolean {
  return "Notification" in window;
}

export function ReminderPanel() {
  const { reminder, saveReminder } = useReminderSettings();
  const [time, setTime] = useState("20:00");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (reminder) {
      setTime(reminder.time);
    }
  }, [reminder]);

  async function save(enabled: boolean) {
    if (!reminder) {
      return;
    }

    setError(null);

    if (enabled) {
      if (!supportsNotifications()) {
        setError("当前浏览器不支持系统提醒。");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setError("没有获得通知权限，因此不会开启提醒。");
        return;
      }
    }

    setIsSaving(true);

    try {
      await saveReminder({ enabled, time });
    } catch (caughtError) {
      setError(caughtError instanceof ReminderApiError ? caughtError.message : "提醒设置没有保存成功。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="reminder-heading" className="task-section reminder-panel">
      <div className="section-heading"><h2 id="reminder-heading">每日提醒</h2><span>{reminder?.enabled ? "已开启" : "未开启"}</span></div>
      <p className="task-state">在 Mainline 打开期间，每天到设定时间最多提醒一次；浏览器完全关闭时不会推送。</p>
      {reminder ? (
        <div className="reminder-controls">
          <label className="form-field"><span>提醒时间</span><input aria-label="提醒时间" onChange={(event) => setTime(event.target.value)} type="time" value={time} /></label>
          {reminder.enabled ? (
            <div className="reminder-actions"><button className="text-button" disabled={isSaving} onClick={() => void save(true)} type="button"><Bell size={16} /> 保存时间</button><button className="text-button" disabled={isSaving} onClick={() => void save(false)} type="button"><BellSlash size={16} /> 关闭提醒</button></div>
          ) : <button className="small-action small-action--signal" disabled={isSaving} onClick={() => void save(true)} type="button"><Bell size={16} /> 开启提醒</button>}
        </div>
      ) : <p className="task-state">正在读取提醒设置…</p>}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  );
}
