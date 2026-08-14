import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type {
  OnboardingProfile,
  OnboardingProfileUpdateInput,
} from "@mainline/contracts";

import { fetchOnboardingProfile, updateOnboardingProfile } from "./api";

type OnboardingLoadState = "loading" | "ready" | "error";

interface OnboardingContextValue {
  profile: OnboardingProfile | null;
  loadState: OnboardingLoadState;
  saveProfile(input: OnboardingProfileUpdateInput): Promise<OnboardingProfile>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loadState, setLoadState] = useState<OnboardingLoadState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    void fetchOnboardingProfile(controller.signal)
      .then((nextProfile) => {
        setProfile(nextProfile);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadState("error");
      });

    return () => controller.abort();
  }, []);

  async function saveProfile(input: OnboardingProfileUpdateInput): Promise<OnboardingProfile> {
    const saved = await updateOnboardingProfile(input);
    setProfile(saved);
    setLoadState("ready");
    return saved;
  }

  return (
    <OnboardingContext.Provider value={{ profile, loadState, saveProfile }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingProfile(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("OnboardingProvider 尚未挂载。");
  }

  return context;
}
