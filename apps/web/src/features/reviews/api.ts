import { isReviewListResponse, type DailyReview, type DailyReviewInput, type ReviewListResponse } from "@mainline/contracts";

export class ReviewApiError extends Error {}

async function errorMessage(response: Response) {
  const payload = await response.json().catch(() => undefined) as { message?: unknown } | undefined;
  return typeof payload?.message === "string" ? payload.message : "复盘暂时没有保存成功。";
}

export async function fetchReviews(): Promise<ReviewListResponse> {
  const response = await fetch("/api/reviews");
  if (!response.ok) throw new ReviewApiError(await errorMessage(response));
  const payload: unknown = await response.json();
  if (!isReviewListResponse(payload)) throw new ReviewApiError("本地服务返回了无法识别的复盘数据。");
  return payload;
}

export async function saveReview(date: string, input: DailyReviewInput): Promise<DailyReview> {
  const response = await fetch(`/api/reviews/${date}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw new ReviewApiError(await errorMessage(response));
  return response.json() as Promise<DailyReview>;
}
