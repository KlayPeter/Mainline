import {
  isTask,
  isTaskListResponse,
  isProgressSnapshot,
  type ProgressSnapshot,
  type Task,
  type TaskCreateInput,
  type TaskIncompleteInput,
  type TaskListResponse,
  type TaskResultSubmissionInput,
  type TaskUpdateInput,
} from "@mainline/contracts";

export class TaskApiError extends Error {}

async function getErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => undefined);

  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as Record<string, unknown>).message;

    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "操作暂时没有完成，请稍后再试。";
}

async function readTask(response: Response): Promise<Task> {
  if (!response.ok) {
    throw new TaskApiError(await getErrorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isTask(payload)) {
    throw new TaskApiError("本地服务返回了无法识别的任务数据。");
  }

  return payload;
}

export async function fetchTasks(date: string, signal?: AbortSignal): Promise<TaskListResponse> {
  const response = await fetch(`/api/tasks?date=${encodeURIComponent(date)}`, { signal });

  if (!response.ok) {
    throw new TaskApiError(await getErrorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isTaskListResponse(payload)) {
    throw new TaskApiError("本地服务返回了无法识别的任务列表。");
  }

  return payload;
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  return readTask(
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  return readTask(
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function startTask(id: string): Promise<Task> {
  return readTask(await fetch(`/api/tasks/${id}/start`, { method: "POST" }));
}

export async function completeTask(id: string): Promise<Task> {
  return readTask(await fetch(`/api/tasks/${id}/complete`, { method: "POST" }));
}

export async function submitTaskResult(id: string, input: TaskResultSubmissionInput): Promise<Task> {
  return readTask(
    await fetch(`/api/tasks/${id}/submit-result`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function confirmTaskResult(id: string): Promise<Task> {
  return readTask(await fetch(`/api/tasks/${id}/confirm-result`, { method: "POST" }));
}

export async function markTaskIncomplete(id: string, input: TaskIncompleteInput): Promise<Task> {
  return readTask(
    await fetch(`/api/tasks/${id}/mark-incomplete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function claimTaskReward(id: string): Promise<Task> {
  return readTask(await fetch(`/api/tasks/${id}/claim-reward`, { method: "POST" }));
}

export async function fulfillTaskPenalty(id: string): Promise<Task> {
  return readTask(await fetch(`/api/tasks/${id}/fulfill-penalty`, { method: "POST" }));
}

export async function fetchProgress(signal?: AbortSignal): Promise<ProgressSnapshot> {
  const response = await fetch("/api/progress", { signal });

  if (!response.ok) {
    throw new TaskApiError(await getErrorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isProgressSnapshot(payload)) {
    throw new TaskApiError("本地服务返回了无法识别的进度数据。");
  }

  return payload;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

  if (!response.ok) {
    throw new TaskApiError(await getErrorMessage(response));
  }
}
