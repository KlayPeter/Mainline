import { X } from "@phosphor-icons/react";
import { useState } from "react";

import type { Task } from "@mainline/contracts";

import { recordTaskInterruption, TaskApiError } from "./api";

interface TaskInterruptionComposerProps {
  onClose(): void;
  onSaved(task: Task): void;
  task: Task;
}

export function TaskInterruptionComposer({ onClose, onSaved, task }: TaskInterruptionComposerProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      onSaved(await recordTaskInterruption(task.id, reason));
    } catch (caughtError) {
      setError(caughtError instanceof TaskApiError ? caughtError.message : "这次中断暂时没有记录成功。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="composer-backdrop" role="presentation">
      <section aria-labelledby="task-interruption-heading" aria-modal="true" className="task-composer interruption-composer" role="dialog">
        <header className="composer-header">
          <div>
            <p className="section-kicker">记录中断</p>
            <h2 id="task-interruption-heading">先把发生的事记下来</h2>
          </div>
          <button aria-label="关闭中断记录面板" className="icon-button" onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <form className="task-form" onSubmit={handleSubmit}>
          <p className="interruption-composer__task">正在专注：{task.title}</p>
          <label className="form-field" htmlFor="task-interruption-reason">
            <span>发生了什么</span>
            <textarea
              aria-label="发生了什么"
              autoFocus
              id="task-interruption-reason"
              maxLength={300}
              onChange={(event) => setReason(event.target.value)}
              placeholder="例如：临时工作、身体疲惫、刷短视频。"
              required
              rows={5}
              value={reason}
            />
          </label>
          <p className="commitment-settings__notice">记录后会停止本次计时。你可以稍后再继续，不会自动改动任务安排。</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <footer className="composer-actions">
            <button className="text-button" disabled={isSaving} onClick={onClose} type="button">取消</button>
            <button className="primary-button" disabled={isSaving} type="submit">{isSaving ? "正在记录" : "记录中断"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
