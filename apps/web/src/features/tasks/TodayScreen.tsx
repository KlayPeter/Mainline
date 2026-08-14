import { CaretLeft, CaretRight, Check, PencilSimple, Play, Plus, Trash } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import type { Task, TaskLane } from "@mainline/contracts";

import { completeTask, deleteTask, fetchTasks, startTask, TaskApiError } from "./api";
import { TaskComposer } from "./TaskComposer";
import {
  formatTaskDate,
  getStatusLabel,
  getTaskMetadata,
  getTodayDate,
} from "./task-presentation";

interface TodayScreenProps {
  isComposerOpen: boolean;
  onComposerOpenChange(isOpen: boolean): void;
}

type LoadingState = "loading" | "ready" | "error";

interface TaskCardProps {
  actionTaskId: string | null;
  onComplete(task: Task): void;
  onDelete(task: Task): void;
  onEdit(task: Task): void;
  onStart(task: Task): void;
  task: Task;
}

function shiftDate(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00`);
  shifted.setDate(shifted.getDate() + days);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function TaskCard({ actionTaskId, onComplete, onDelete, onEdit, onStart, task }: TaskCardProps) {
  const isActing = actionTaskId === task.id;
  const isCompleted = task.status === "completed";
  const canComplete = task.status === "planned" || task.status === "in_progress";

  return (
    <article className={`task-card task-card--${task.lane} ${isCompleted ? "task-card--completed" : ""}`}>
      <div className="task-card__content">
        <div className="task-card__meta">
          <span>{getTaskMetadata(task)}</span>
          <span>{getStatusLabel(task.status)}</span>
        </div>
        <h3>{task.title}</h3>
        {task.details ? <p>{task.details}</p> : null}
      </div>

      {isCompleted ? (
        <div className="task-card__completed"><Check size={18} /> 已完成</div>
      ) : (
        <div className="task-card__actions">
          {task.status === "planned" ? (
            <button className="small-action" disabled={isActing} onClick={() => onStart(task)} type="button">
              <Play size={16} weight="fill" /> 认领
            </button>
          ) : null}
          {canComplete ? (
            <button className="small-action small-action--signal" disabled={isActing} onClick={() => onComplete(task)} type="button">
              <Check size={18} weight="bold" /> 完成
            </button>
          ) : null}
          <button aria-label={`编辑：${task.title}`} className="small-icon-action" disabled={isActing} onClick={() => onEdit(task)} type="button">
            <PencilSimple size={18} />
          </button>
          <button aria-label={`删除：${task.title}`} className="small-icon-action" disabled={isActing} onClick={() => onDelete(task)} type="button">
            <Trash size={18} />
          </button>
        </div>
      )}
    </article>
  );
}

export function TodayScreen({ isComposerOpen, onComposerOpenChange }: TodayScreenProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [draftLane, setDraftLane] = useState<TaskLane | undefined>();

  const loadTasks = useCallback(async (date: string, signal?: AbortSignal) => {
    setLoadingState("loading");

    try {
      const response = await fetchTasks(date, signal);
      setTasks(response.tasks);
      setLoadingState("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setLoadingState("error");
      setMessage(error instanceof TaskApiError ? error.message : "今天的安排暂时无法读取。");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadTasks(selectedDate, controller.signal);

    return () => controller.abort();
  }, [loadTasks, selectedDate]);

  const mainTask = tasks.find((task) => task.lane === "main");
  const otherTasks = tasks.filter((task) => task.lane !== "main");

  async function refreshWithMessage(nextMessage?: string) {
    await loadTasks(selectedDate);

    if (nextMessage) {
      setMessage(nextMessage);
    }
  }

  async function runTaskAction(task: Task, action: () => Promise<unknown>, successMessage: string) {
    setActionTaskId(task.id);
    setMessage(null);

    try {
      await action();
      await refreshWithMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof TaskApiError ? error.message : "这次操作没有完成，请稍后再试。");
    } finally {
      setActionTaskId(null);
    }
  }

  function handleDelete(task: Task) {
    if (!window.confirm(`删除“${task.title}”？这条未完成任务将不再保留。`)) {
      return;
    }

    void runTaskAction(task, () => deleteTask(task.id), `已删除：${task.title}`);
  }

  function closeComposer() {
    setEditingTask(undefined);
    setDraftLane(undefined);
    onComposerOpenChange(false);
  }

  function openComposer(lane?: TaskLane) {
    setEditingTask(undefined);
    setDraftLane(lane);
    onComposerOpenChange(true);
  }

  return (
    <section aria-labelledby="today-heading" className="today-view">
      <div className="today-heading-row">
        <div>
          <p className="section-kicker">今天</p>
          <h1 id="today-heading">今天，只留一条主线。</h1>
        </div>
        <button className="primary-button primary-button--compact" onClick={() => openComposer()} type="button">
          <Plus size={18} weight="bold" /> 安排
        </button>
      </div>

      <div className="date-switcher">
        <button aria-label="查看前一天" className="small-icon-action" onClick={() => setSelectedDate((date) => shiftDate(date, -1))} type="button">
          <CaretLeft size={18} />
        </button>
        <label>
          <span>{formatTaskDate(selectedDate)}</span>
          <input aria-label="查看日期" onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
        </label>
        <button aria-label="查看后一天" className="small-icon-action" onClick={() => setSelectedDate((date) => shiftDate(date, 1))} type="button">
          <CaretRight size={18} />
        </button>
      </div>

      {message ? <p className="task-feedback" role="status">{message}</p> : null}

      {loadingState === "loading" ? <p className="task-state">正在读取今天的安排…</p> : null}
      {loadingState === "error" ? (
        <button className="text-button" onClick={() => void loadTasks(selectedDate)} type="button">
          重新读取
        </button>
      ) : null}

      {loadingState === "ready" ? (
        <>
          <section aria-labelledby="main-task-heading" className="task-section task-section--main">
            <div className="section-heading">
              <h2 id="main-task-heading">今日主线</h2>
              <span>只能有一条</span>
            </div>
            {mainTask ? (
              <TaskCard
                actionTaskId={actionTaskId}
                onComplete={(task) => void runTaskAction(task, () => completeTask(task.id), `已完成：${task.title}`)}
                onDelete={handleDelete}
                onEdit={setEditingTask}
                onStart={(task) => void runTaskAction(task, () => startTask(task.id), `已认领：${task.title}`)}
                task={mainTask}
              />
            ) : (
              <div className="empty-main-task">
                <h3>还没有主线</h3>
                <p>把今天必须推进的一件事留在这里。其他任务不用和它争位置。</p>
                <button className="text-button" onClick={() => openComposer("main")} type="button">
                  安排一条主线
                </button>
              </div>
            )}
          </section>

          <section aria-labelledby="other-tasks-heading" className="task-section">
            <div className="section-heading">
              <h2 id="other-tasks-heading">其他安排</h2>
              <span>{otherTasks.length} 件</span>
            </div>
            {otherTasks.length ? (
              <div className="task-list">
                {otherTasks.map((task) => (
                  <TaskCard
                    actionTaskId={actionTaskId}
                    key={task.id}
                    onComplete={(currentTask) => void runTaskAction(currentTask, () => completeTask(currentTask.id), `已完成：${currentTask.title}`)}
                    onDelete={handleDelete}
                    onEdit={setEditingTask}
                    onStart={(currentTask) => void runTaskAction(currentTask, () => startTask(currentTask.id), `已认领：${currentTask.title}`)}
                    task={task}
                  />
                ))}
              </div>
            ) : (
              <p className="task-state">没有其他安排。留一点空白，也是一种安排。</p>
            )}
          </section>
        </>
      ) : null}

      {isComposerOpen || editingTask ? (
        <TaskComposer
          defaultLane={draftLane}
          onClose={closeComposer}
          onSaved={(task) => {
            closeComposer();
            void refreshWithMessage(`已安排：${task.title}`);
          }}
          scheduledDate={selectedDate}
          task={editingTask}
        />
      ) : null}
    </section>
  );
}
