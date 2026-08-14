import type { Task, TaskForm, TaskLane, TaskStatus, TaskTimeBlock } from "@mainline/contracts";

const laneLabels: Record<TaskLane, string> = {
  main: "主线",
  side: "支线",
  growth: "成长",
  routine: "日常",
};

const formLabels: Record<TaskForm, string> = {
  one_off: "一次任务",
  routine: "重复任务",
  challenge: "挑战任务",
  event: "事件任务",
};

const timeBlockLabels: Record<TaskTimeBlock, string> = {
  anytime: "任意时间",
  morning: "上午",
  afternoon: "下午",
  evening: "晚上",
};

const statusLabels: Record<TaskStatus, string> = {
  planned: "待开始",
  in_progress: "进行中",
  paused: "已暂停",
  interrupted: "被中断",
  completed: "已完成",
  incomplete: "待处理",
  pending_resolution: "待结算",
  abandoned: "已放弃",
  closed: "已关闭",
};

export function getLaneLabel(lane: TaskLane): string {
  return laneLabels[lane];
}

export function getFormLabel(form: TaskForm): string {
  return formLabels[form];
}

export function getTimeBlockLabel(timeBlock: TaskTimeBlock): string {
  return timeBlockLabels[timeBlock];
}

export function getStatusLabel(status: TaskStatus): string {
  return statusLabels[status];
}

export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatTaskDate(date: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export function getTaskMetadata(task: Task): string {
  return `${getLaneLabel(task.lane)} · ${getTimeBlockLabel(task.timeBlock)} · ${getFormLabel(task.form)}`;
}
