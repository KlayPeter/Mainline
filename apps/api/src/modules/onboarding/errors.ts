export type OnboardingErrorCode = "ONBOARDING_VALIDATION";

export class OnboardingDomainError extends Error {
  constructor(
    readonly code: OnboardingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OnboardingDomainError";
  }
}
