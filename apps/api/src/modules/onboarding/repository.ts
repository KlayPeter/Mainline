import type { DatabaseSync } from "node:sqlite";

import type {
  OnboardingProfile,
  OnboardingProfileUpdateInput,
} from "@mainline/contracts";

interface OnboardingProfileRow {
  life_state_title: string;
  life_state_description: string;
  life_state_started_on: string | null;
  life_state_ends_on: string | null;
  current_context: string;
  time_constraints: string;
  interruption_patterns: string;
  reward_preferences: string;
  penalty_preferences: string;
  capability_focus: string;
  onboarding_completed_at: string | null;
  updated_at: string;
}

function toProfile(row: OnboardingProfileRow): OnboardingProfile {
  return {
    completed: row.onboarding_completed_at !== null,
    lifeStateTitle: row.life_state_title,
    lifeStateDescription: row.life_state_description,
    lifeStateStartedOn: row.life_state_started_on,
    lifeStateEndsOn: row.life_state_ends_on,
    currentContext: row.current_context,
    timeConstraints: row.time_constraints,
    interruptionPatterns: row.interruption_patterns,
    rewardPreferences: row.reward_preferences,
    penaltyPreferences: row.penalty_preferences,
    capabilityFocus: row.capability_focus,
    completedAt: row.onboarding_completed_at,
    updatedAt: row.updated_at,
  };
}

export class OnboardingRepository {
  constructor(private readonly database: DatabaseSync) {}

  get(): OnboardingProfile {
    const row = this.database
      .prepare("SELECT * FROM onboarding_profile WHERE id = 1")
      .get() as unknown as OnboardingProfileRow;

    return toProfile(row);
  }

  save(
    input: OnboardingProfileUpdateInput,
    completedAt: string,
    updatedAt: string,
  ): OnboardingProfile {
    this.database
      .prepare(`
        UPDATE onboarding_profile
        SET
          life_state_title = ?,
          life_state_description = ?,
          life_state_started_on = ?,
          life_state_ends_on = ?,
          current_context = ?,
          time_constraints = ?,
          interruption_patterns = ?,
          reward_preferences = ?,
          penalty_preferences = ?,
          capability_focus = ?,
          onboarding_completed_at = COALESCE(onboarding_completed_at, ?),
          updated_at = ?
        WHERE id = 1
      `)
      .run(
        input.lifeStateTitle,
        input.lifeStateDescription,
        input.lifeStateStartedOn ?? null,
        input.lifeStateEndsOn ?? null,
        input.currentContext,
        input.timeConstraints,
        input.interruptionPatterns,
        input.rewardPreferences,
        input.penaltyPreferences,
        input.capabilityFocus,
        completedAt,
        updatedAt,
      );

    return this.get();
  }
}
