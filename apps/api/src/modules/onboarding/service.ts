import type {
  OnboardingProfile,
  OnboardingProfileUpdateInput,
} from "@mainline/contracts";

import { OnboardingDomainError } from "./errors.js";
import { OnboardingRepository } from "./repository.js";

function normalize(value: string): string {
  return value.trim();
}

function assertDate(value: string | undefined, label: string): void {
  if (!value) {
    return;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new OnboardingDomainError("ONBOARDING_VALIDATION", `${label}不是有效日期。`);
  }
}

export class OnboardingService {
  constructor(private readonly repository: OnboardingRepository) {}

  get(): OnboardingProfile {
    return this.repository.get();
  }

  save(input: OnboardingProfileUpdateInput): OnboardingProfile {
    assertDate(input.lifeStateStartedOn, "开始日期");
    assertDate(input.lifeStateEndsOn, "预计结束日期");

    if (
      input.lifeStateStartedOn
      && input.lifeStateEndsOn
      && input.lifeStateEndsOn < input.lifeStateStartedOn
    ) {
      throw new OnboardingDomainError("ONBOARDING_VALIDATION", "预计结束日期不能早于开始日期。");
    }

    const now = new Date().toISOString();
    return this.repository.save(
      {
        ...input,
        lifeStateTitle: normalize(input.lifeStateTitle) || "当前阶段",
        lifeStateDescription: normalize(input.lifeStateDescription),
        currentContext: normalize(input.currentContext),
        timeConstraints: normalize(input.timeConstraints),
        interruptionPatterns: normalize(input.interruptionPatterns),
        rewardPreferences: normalize(input.rewardPreferences),
        penaltyPreferences: normalize(input.penaltyPreferences),
        capabilityFocus: normalize(input.capabilityFocus),
      },
      now,
      now,
    );
  }
}
