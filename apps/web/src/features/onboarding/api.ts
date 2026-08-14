import {
  isOnboardingProfile,
  type OnboardingProfile,
  type OnboardingProfileUpdateInput,
} from "@mainline/contracts";

export class OnboardingApiError extends Error {}

async function getMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => undefined)) as { message?: unknown } | undefined;
  return typeof body?.message === "string" ? body.message : "这份资料暂时没有保存成功。";
}

async function readProfile(responsePromise: Promise<Response>): Promise<OnboardingProfile> {
  const response = await responsePromise;

  if (!response.ok) {
    throw new OnboardingApiError(await getMessage(response));
  }

  const data: unknown = await response.json();

  if (!isOnboardingProfile(data)) {
    throw new OnboardingApiError("本地服务返回了无法识别的个人资料。");
  }

  return data;
}

export function fetchOnboardingProfile(signal?: AbortSignal): Promise<OnboardingProfile> {
  return readProfile(fetch("/api/onboarding/profile", { signal }));
}

export function updateOnboardingProfile(
  input: OnboardingProfileUpdateInput,
): Promise<OnboardingProfile> {
  return readProfile(
    fetch("/api/onboarding/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
