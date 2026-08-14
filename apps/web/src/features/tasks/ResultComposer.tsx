import { X } from "@phosphor-icons/react";
import { useState } from "react";

import type { Task, TaskSelfAssessment } from "@mainline/contracts";

import { submitTaskResult, TaskApiError } from "./api";
import { getSelfAssessmentLabel } from "./task-presentation";

const assessmentOptions: TaskSelfAssessment[] = ["basic", "solid", "excellent"];

interface ResultComposerProps {
  onClose(): void;
  onSaved(task: Task): void;
  task: Task;
}

export function ResultComposer({ onClose, onSaved, task }: ResultComposerProps) {
  const [summary, setSummary] = useState("");
  const [selfAssessment, setSelfAssessment] = useState<TaskSelfAssessment>("solid");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      onSaved(await submitTaskResult(task.id, { summary, selfAssessment }));
    } catch (caughtError) {
      setError(caughtError instanceof TaskApiError ? caughtError.message : "成果暂时没有保存成功，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="composer-backdrop" role="presentation">
      <section aria-labelledby="result-composer-heading" aria-modal="true" className="task-composer" role="dialog">
        <header className="composer-header">
          <div>
            <p className="section-kicker">提交成果</p>
            <h2 id="result-composer-heading">这一次，留下了什么？</h2>
          </div>
          <button aria-label="关闭成果面板" className="icon-button" onClick={onClose} type="button"><X size={20} /></button>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <p className="interruption-composer__task">任务：{task.title}</p>
          <label className="form-field">
            <span>成果或进展</span>
            <textarea
              autoFocus
              maxLength={1000}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="例如：完成两节课程，做出一个可运行的小工具，并写下要补的知识点。"
              required
              rows={6}
              value={summary}
            />
          </label>
          <label className="form-field">
            <span>这次的自评</span>
            <select onChange={(event) => setSelfAssessment(event.target.value as TaskSelfAssessment)} value={selfAssessment}>
              {assessmentOptions.map((option) => (
                <option key={option} value={option}>{getSelfAssessmentLabel(option)}</option>
              ))}
            </select>
          </label>
          <p className="result-composer__notice">提交后还需要你确认“算完成”。系统不会替你做这个决定。</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <footer className="composer-actions">
            <button className="text-button" disabled={isSaving} onClick={onClose} type="button">取消</button>
            <button className="primary-button" disabled={isSaving} type="submit">{isSaving ? "正在保存" : "提交成果"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
