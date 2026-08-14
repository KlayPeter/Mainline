import { CaretLeft, CaretRight, Check, Gift, Pause, PencilSimple, Play, Plus, Trash, Warning } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import type { Task, TaskLane } from "@mainline/contracts";

import {
  claimTaskReward,
  completeTask,
  confirmTaskResult,
  deleteTask,
  fetchTasks,
  fulfillTaskPenalty,
  pauseTask,
  resumeTask,
  startTask,
  TaskApiError,
} from "./api";
import { InterruptionComposer } from "../ai-proposals/InterruptionComposer";
import { IncompleteComposer } from "./IncompleteComposer";
import { ResultComposer } from "./ResultComposer";
import { TaskComposer } from "./TaskComposer";
import { TaskInterruptionComposer } from "./TaskInterruptionComposer";
import {
  formatTaskDate,
  formatTaskDateTime,
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
  onClaimReward(task: Task): void;
  onComplete(task: Task): void;
  onConfirmResult(task: Task): void;
  onDelete(task: Task): void;
  onEdit(task: Task): void;
  onFulfillPenalty(task: Task): void;
  onMarkIncomplete(task: Task): void;
  onPause(task: Task): void;
  onResume(task: Task): void;
  onInterrupt(task: Task): void;
  onSubmitResult(task: Task): void;
  onStart(task: Task): void;
  task: Task;
}

function formatFocusDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) {
    return `${hours} 小时 ${minutes} 分`;
  }

  if (minutes) {
    return `${minutes} 分 ${seconds} 秒`;
  }

  return `${seconds} 秒`;
}

function FocusDuration({ task }: { task: Task }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (task.status !== "in_progress" || !task.activeStartedAt) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(intervalId);
  }, [task.activeStartedAt, task.status]);

  const activeStartedAt = task.activeStartedAt ? new Date(task.activeStartedAt).getTime() : Number.NaN;
  const liveSeconds = Number.isNaN(activeStartedAt)
    ? task.focusSeconds
    : task.focusSeconds + Math.max(0, Math.floor((now - activeStartedAt) / 1_000));

  return <span className="task-card__minor focus-duration">已专注 {formatFocusDuration(liveSeconds)}</span>;
}

function shiftDate(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00`);
  shifted.setDate(shifted.getDate() + days);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function TaskCard({
  actionTaskId,
  onClaimReward,
  onComplete,
  onConfirmResult,
  onDelete,
  onEdit,
  onFulfillPenalty,
  onMarkIncomplete,
  onPause,
  onResume,
  onInterrupt,
  onSubmitResult,
  onStart,
  task,
}: TaskCardProps) {
  const isActing = actionTaskId === task.id;
  const isCompleted = task.status === "completed";
  const canSettleExecution = ["planned", "in_progress", "paused", "interrupted"].includes(task.status);
  const canCompleteDirectly = canSettleExecution && task.completionMode === "direct";
  const canSubmitResult = canSettleExecution && task.completionMode === "result_report";
  const canResolveResult = task.status === "pending_resolution";

  return (
    <article className={`task-card task-card--${task.lane} ${isCompleted ? "task-card--completed" : ""}`}>
      <div className="task-card__content">
        <div className="task-card__meta">
          <span>{getTaskMetadata(task)}</span>
          <span>{getStatusLabel(task.status)}</span>
        </div>
        <h3>{task.title}</h3>
        {task.details ? <p>{task.details}</p> : null}
        {task.status === "pending_resolution" && task.resultSummary ? (
          <p className="task-card__result">已提交：{task.resultSummary}</p>
        ) : null}
      </div>

      {isCompleted ? (
        <div className="task-card__completed task-card__completed--stacked">
          <span><Check size={18} /> 已完成 · +{task.experienceGranted} 经验</span>
          {task.rewardStatus === "available" ? (
            <button className="small-action" disabled={isActing} onClick={() => onClaimReward(task)} type="button">
              <Gift size={16} /> 领取：{task.rewardTitle}
            </button>
          ) : null}
          {task.rewardStatus === "claimed" ? <span className="task-card__minor">已领取：{task.rewardTitle}</span> : null}
        </div>
      ) : task.status === "incomplete" ? (
        <div className="task-card__completed task-card__completed--stacked">
          <span>已按未完成结算</span>
          {task.penaltyStatus === "pending" ? (
            <>
              <span className="task-card__minor">待兑现：{task.penaltyDetail}{task.penaltyAmount ? `（${task.penaltyAmount} 元）` : ""}</span>
              {task.penaltyDueAt ? <span className="task-card__minor">截止：{formatTaskDateTime(task.penaltyDueAt)}</span> : null}
              <button className="small-action" disabled={isActing} onClick={() => onFulfillPenalty(task)} type="button">已兑现惩罚</button>
            </>
          ) : null}
          {task.penaltyStatus === "fulfilled" ? <span className="task-card__minor">承诺已兑现</span> : null}
        </div>
      ) : canResolveResult ? (
        <div className="task-card__actions">
          <span className="task-card__minor">已提交成果，等你确认。</span>
          <button className="small-action small-action--signal" disabled={isActing} onClick={() => onConfirmResult(task)} type="button">
            <Check size={18} weight="bold" /> 算完成
          </button>
          <button className="small-action" disabled={isActing} onClick={() => onMarkIncomplete(task)} type="button">未完成结算</button>
        </div>
      ) : (
        <div className="task-card__actions">
          {task.status !== "planned" ? <FocusDuration task={task} /> : null}
          {task.status === "planned" ? (
            <button className="small-action" disabled={isActing} onClick={() => onStart(task)} type="button">
              <Play size={16} weight="fill" /> 开始专注
            </button>
          ) : null}
          {task.status === "in_progress" ? (
            <>
              <button className="small-action" disabled={isActing} onClick={() => onPause(task)} type="button">
                <Pause size={16} weight="fill" /> 暂停
              </button>
              <button className="small-action" disabled={isActing} onClick={() => onInterrupt(task)} type="button">
                <Warning size={16} /> 记录中断
              </button>
            </>
          ) : null}
          {task.status === "paused" || task.status === "interrupted" ? (
            <button className="small-action" disabled={isActing} onClick={() => onResume(task)} type="button">
              <Play size={16} weight="fill" /> 继续专注
            </button>
          ) : null}
          {canCompleteDirectly ? (
            <button className="small-action small-action--signal" disabled={isActing} onClick={() => onComplete(task)} type="button">
              <Check size={18} weight="bold" /> 完成
            </button>
          ) : null}
          {canSubmitResult ? <button className="small-action small-action--signal" disabled={isActing} onClick={() => onSubmitResult(task)} type="button">提交成果</button> : null}
          {canSettleExecution ? (
            <>
              <button className="small-action" disabled={isActing} onClick={() => onMarkIncomplete(task)} type="button">未完成结算</button>
            </>
          ) : null}
          {task.status === "planned" ? (
            <>
              <button aria-label={`编辑：${task.title}`} className="small-icon-action" disabled={isActing} onClick={() => onEdit(task)} type="button">
                <PencilSimple size={18} />
              </button>
              <button aria-label={`删除：${task.title}`} className="small-icon-action" disabled={isActing} onClick={() => onDelete(task)} type="button">
                <Trash size={18} />
              </button>
            </>
          ) : null}
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
  const [isInterruptionOpen, setIsInterruptionOpen] = useState(false);
  const [resultTask, setResultTask] = useState<Task | undefined>();
  const [incompleteTask, setIncompleteTask] = useState<Task | undefined>();
  const [interruptionTask, setInterruptionTask] = useState<Task | undefined>();

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
              <>
                <TaskCard
                  actionTaskId={actionTaskId}
                  onClaimReward={(task) => void runTaskAction(task, () => claimTaskReward(task.id), `已领取奖励：${task.rewardTitle}`)}
                  onComplete={(task) => void runTaskAction(task, () => completeTask(task.id), `已完成：${task.title}，获得 ${task.experienceReward} 经验`)}
                  onConfirmResult={(task) => void runTaskAction(task, () => confirmTaskResult(task.id), `已确认完成：${task.title}`)}
                  onDelete={handleDelete}
                  onEdit={setEditingTask}
                  onFulfillPenalty={(task) => void runTaskAction(task, () => fulfillTaskPenalty(task.id), "已记录惩罚兑现。")}
                  onMarkIncomplete={setIncompleteTask}
                  onPause={(task) => void runTaskAction(task, () => pauseTask(task.id), `已暂停：${task.title}`)}
                  onResume={(task) => void runTaskAction(task, () => resumeTask(task.id), `继续专注：${task.title}`)}
                  onInterrupt={setInterruptionTask}
                  onSubmitResult={setResultTask}
                  onStart={(task) => void runTaskAction(task, () => startTask(task.id), `已认领：${task.title}`)}
                  task={mainTask}
                />
                <button className="reality-link" onClick={() => setIsInterruptionOpen(true)} type="button">
                  现实有变？调整一下
                </button>
              </>
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
                    onClaimReward={(currentTask) => void runTaskAction(currentTask, () => claimTaskReward(currentTask.id), `已领取奖励：${currentTask.rewardTitle}`)}
                    onComplete={(currentTask) => void runTaskAction(currentTask, () => completeTask(currentTask.id), `已完成：${currentTask.title}`)}
                    onConfirmResult={(currentTask) => void runTaskAction(currentTask, () => confirmTaskResult(currentTask.id), `已确认完成：${currentTask.title}`)}
                    onDelete={handleDelete}
                    onEdit={setEditingTask}
                    onFulfillPenalty={(currentTask) => void runTaskAction(currentTask, () => fulfillTaskPenalty(currentTask.id), "已记录惩罚兑现。")}
                    onMarkIncomplete={setIncompleteTask}
                    onPause={(currentTask) => void runTaskAction(currentTask, () => pauseTask(currentTask.id), `已暂停：${currentTask.title}`)}
                    onResume={(currentTask) => void runTaskAction(currentTask, () => resumeTask(currentTask.id), `继续专注：${currentTask.title}`)}
                    onInterrupt={setInterruptionTask}
                    onSubmitResult={setResultTask}
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

      {isInterruptionOpen ? (
        <InterruptionComposer
          onClose={() => setIsInterruptionOpen(false)}
          onResolved={(nextMessage) => setMessage(nextMessage)}
          task={mainTask}
        />
      ) : null}

      {resultTask ? (
        <ResultComposer
          onClose={() => setResultTask(undefined)}
          onSaved={(task) => {
            setResultTask(undefined);
            void refreshWithMessage(`已提交成果：${task.title}。确认后才会算完成。`);
          }}
          task={resultTask}
        />
      ) : null}

      {incompleteTask ? (
        <IncompleteComposer
          onClose={() => setIncompleteTask(undefined)}
          onSaved={(task) => {
            setIncompleteTask(undefined);
            void refreshWithMessage(task.penaltyStatus === "pending" ? "已结算未完成，请在 24 小时内兑现承诺。" : "已结算为未完成。奖励和经验不会获得。");
          }}
          task={incompleteTask}
        />
      ) : null}

      {interruptionTask ? (
        <TaskInterruptionComposer
          onClose={() => setInterruptionTask(undefined)}
          onSaved={(task) => {
            setInterruptionTask(undefined);
            void refreshWithMessage(`已记录中断：${task.title}。可以稍后再继续。`);
          }}
          task={interruptionTask}
        />
      ) : null}
    </section>
  );
}
