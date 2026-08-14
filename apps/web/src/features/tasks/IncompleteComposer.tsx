import { X } from "@phosphor-icons/react";
import { useState } from "react";

import type { Task } from "@mainline/contracts";

import { markTaskIncomplete, TaskApiError } from "./api";

interface IncompleteComposerProps {
  onClose(): void;
  onSaved(task: Task): void;
  task: Task;
}

export function IncompleteComposer({ onClose, onSaved, task }: IncompleteComposerProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      onSaved(await markTaskIncomplete(task.id, { ...(reason.trim() ? { reason } : {}) }));
    } catch (caughtError) {
      setError(caughtError instanceof TaskApiError ? caughtError.message : "这次结算没有保存成功，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  const penaltyCopy = task.penaltyKind === "none"
    ? "没有设置额外惩罚；奖励和经验不会获得。"
    : `将生成一条 24 小时内待兑现的承诺：${task.penaltyDetail}${task.penaltyAmount ? `（${task.penaltyAmount} 元）` : ""}。`;

  return (
    <div className="composer-backdrop" role="presentation">
      <section aria-labelledby="incomplete-composer-heading" aria-modal="true" className="task-composer" role="dialog">
        <header className="composer-header">
          <div>
            <p className="section-kicker">主动结算</p>
            <h2 id="incomplete-composer-heading">这次先如实记下</h2>
          </div>
          <button aria-label="关闭未完成结算面板" className="icon-button" onClick={onClose} type="button"><X size={20} /></button>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <p className="interruption-composer__task">任务：{task.title}</p>
          <p className="result-composer__notice">{penaltyCopy}</p>
          <label className="form-field">
            <span>原因（可选）</span>
            <textarea
              autoFocus
              maxLength={300}
              onChange={(event) => setReason(event.target.value)}
              placeholder="写下真实的阻碍，供之后复盘。"
              rows={4}
              value={reason}
            />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <footer className="composer-actions">
            <button className="text-button" disabled={isSaving} onClick={onClose} type="button">回去继续做</button>
            <button className="danger-button" disabled={isSaving} type="submit">{isSaving ? "正在结算" : "确认未完成"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
