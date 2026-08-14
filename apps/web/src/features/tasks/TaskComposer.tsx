import { X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import type { Task, TaskCreateInput, TaskForm, TaskLane, TaskTimeBlock } from "@mainline/contracts";

import { createTask, TaskApiError, updateTask } from "./api";
import { getFormLabel, getLaneLabel, getTimeBlockLabel } from "./task-presentation";

interface TaskComposerProps {
  defaultLane?: TaskLane;
  task?: Task;
  scheduledDate: string;
  onClose(): void;
  onSaved(task: Task): void;
}

interface ComposerForm {
  title: string;
  details: string;
  lane: TaskLane;
  form: TaskForm;
  scheduledDate: string;
  timeBlock: TaskTimeBlock;
}

const laneOptions: TaskLane[] = ["main", "side", "growth", "routine"];
const formOptions: TaskForm[] = ["one_off", "routine", "challenge", "event"];
const timeBlockOptions: TaskTimeBlock[] = ["anytime", "morning", "afternoon", "evening"];

function getInitialForm(
  task: Task | undefined,
  scheduledDate: string,
  defaultLane: TaskLane | undefined,
): ComposerForm {
  return {
    title: task?.title ?? "",
    details: task?.details ?? "",
    lane: task?.lane ?? defaultLane ?? "side",
    form: task?.form ?? "one_off",
    scheduledDate: task?.scheduledDate ?? scheduledDate,
    timeBlock: task?.timeBlock ?? "anytime",
  };
}

export function TaskComposer({ defaultLane, task, scheduledDate, onClose, onSaved }: TaskComposerProps) {
  const [form, setForm] = useState<ComposerForm>(() => getInitialForm(task, scheduledDate, defaultLane));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(task, scheduledDate, defaultLane));
    setError(null);
  }, [defaultLane, scheduledDate, task]);

  function updateField<Key extends keyof ComposerForm>(key: Key, value: ComposerForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const input: TaskCreateInput = {
      title: form.title,
      details: form.details,
      lane: form.lane,
      form: form.form,
      scheduledDate: form.scheduledDate,
      timeBlock: form.timeBlock,
    };

    try {
      const saved = task
        ? await updateTask(task.id, input)
        : await createTask(input);
      onSaved(saved);
    } catch (caughtError) {
      setError(
        caughtError instanceof TaskApiError ? caughtError.message : "任务没有保存成功，请稍后再试。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="composer-backdrop" role="presentation">
      <section aria-labelledby="task-composer-heading" aria-modal="true" className="task-composer" role="dialog">
        <header className="composer-header">
          <div>
            <p className="section-kicker">{task ? "编辑任务" : "安排任务"}</p>
            <h2 id="task-composer-heading">{task ? "调整这一件事" : "把事情放到具体一天"}</h2>
          </div>
          <button aria-label="关闭任务面板" className="icon-button" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>任务标题</span>
            <input
              autoFocus
              maxLength={120}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="例如：完成 Agent 课程第一节"
              required
              value={form.title}
            />
          </label>

          <label className="form-field">
            <span>具体内容</span>
            <textarea
              maxLength={1000}
              onChange={(event) => updateField("details", event.target.value)}
              placeholder="写下今天真正要推进的内容。"
              rows={3}
              value={form.details}
            />
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>安排日期</span>
              <input
                onChange={(event) => updateField("scheduledDate", event.target.value)}
                required
                type="date"
                value={form.scheduledDate}
              />
            </label>
            <label className="form-field">
              <span>时间段</span>
              <select
                onChange={(event) => updateField("timeBlock", event.target.value as TaskTimeBlock)}
                value={form.timeBlock}
              >
                {timeBlockOptions.map((option) => (
                  <option key={option} value={option}>
                    {getTimeBlockLabel(option)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>任务归属</span>
              <select onChange={(event) => updateField("lane", event.target.value as TaskLane)} value={form.lane}>
                {laneOptions.map((option) => (
                  <option key={option} value={option}>
                    {getLaneLabel(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>任务形式</span>
              <select onChange={(event) => updateField("form", event.target.value as TaskForm)} value={form.form}>
                {formOptions.map((option) => (
                  <option key={option} value={option}>
                    {getFormLabel(option)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <footer className="composer-actions">
            <button className="text-button" disabled={isSaving} onClick={onClose} type="button">
              取消
            </button>
            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? "正在保存" : task ? "保存调整" : "安排任务"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
