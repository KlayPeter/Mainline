import { isHealthResponse, type HealthResponse } from "@mainline/contracts";

export async function fetchLocalHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/api/health", { signal });

  if (!response.ok) {
    throw new Error("本地服务暂时不可用。");
  }

  const payload: unknown = await response.json();

  if (!isHealthResponse(payload)) {
    throw new Error("本地服务返回了无法识别的数据。");
  }

  return payload;
}
