import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import type { OnboardingProfileUpdateInput } from "@mainline/contracts";

import { OnboardingApiError } from "./api";
import { useOnboardingProfile } from "./OnboardingContext";

type OnboardingMode = "initial" | "edit";
type Draft = Required<OnboardingProfileUpdateInput>;

const prompts = [
  {
    label: "你的现在",
    title: "先认识你所在的阶段。",
    description: "不用写得完美。先给这段日子一个称呼，剩下的可以以后再补。",
  },
  {
    label: "现实限制",
    title: "再看一看真实的节奏。",
    description: "工作、疲惫和干扰都不是借口，它们是安排任务时应该被尊重的条件。",
  },
  {
    label: "你想要的支持",
    title: "写下会让你愿意行动的东西。",
    description: "奖励、惩罚和能力方向都由你决定。系统只帮你记住，并在你需要时呈现。",
  },
] as const;

function toDraft(profile: ReturnType<typeof useOnboardingProfile>["profile"]): Draft {
  return {
    lifeStateTitle: profile?.lifeStateTitle ?? "",
    lifeStateDescription: profile?.lifeStateDescription ?? "",
    lifeStateStartedOn: profile?.lifeStateStartedOn ?? "",
    lifeStateEndsOn: profile?.lifeStateEndsOn ?? "",
    currentContext: profile?.currentContext ?? "",
    timeConstraints: profile?.timeConstraints ?? "",
    interruptionPatterns: profile?.interruptionPatterns ?? "",
    rewardPreferences: profile?.rewardPreferences ?? "",
    penaltyPreferences: profile?.penaltyPreferences ?? "",
    capabilityFocus: profile?.capabilityFocus ?? "",
  };
}

interface OnboardingScreenProps {
  mode: OnboardingMode;
  onDone?: () => void;
}

export function OnboardingScreen({ mode, onDone }: OnboardingScreenProps) {
  const { profile, saveProfile } = useOnboardingProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasEditedDraft = useRef(false);
  const prompt = prompts[step];
  const isInitial = mode === "initial";

  useEffect(() => {
    if (!hasEditedDraft.current) {
      setDraft(toDraft(profile));
    }
  }, [profile]);

  function setField(field: keyof Draft, value: string) {
    hasEditedDraft.current = true;
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    if (step < prompts.length - 1) {
      setError(null);
      setStep((current) => current + 1);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const input: OnboardingProfileUpdateInput = {
        lifeStateTitle: draft.lifeStateTitle,
        lifeStateDescription: draft.lifeStateDescription,
        currentContext: draft.currentContext,
        timeConstraints: draft.timeConstraints,
        interruptionPatterns: draft.interruptionPatterns,
        rewardPreferences: draft.rewardPreferences,
        penaltyPreferences: draft.penaltyPreferences,
        capabilityFocus: draft.capabilityFocus,
        ...(draft.lifeStateStartedOn ? { lifeStateStartedOn: draft.lifeStateStartedOn } : {}),
        ...(draft.lifeStateEndsOn ? { lifeStateEndsOn: draft.lifeStateEndsOn } : {}),
      };
      await saveProfile(input);
      onDone?.();
    } catch (caughtError) {
      setError(caughtError instanceof OnboardingApiError ? caughtError.message : "这份资料暂时没有保存成功。");
    } finally {
      setIsSaving(false);
    }
  }

  function field(
    id: keyof Draft,
    label: string,
    options: { hint?: string; rows?: number; type?: "date" | "text" } = {},
  ) {
    const { hint, rows, type = "text" } = options;
    const value = draft[id];

    return (
      <label className="form-field" htmlFor={`onboarding-${id}`}>
        <span>{label}</span>
        {rows ? (
          <textarea
            aria-label={label}
            id={`onboarding-${id}`}
            onChange={(event) => setField(id, event.target.value)}
            rows={rows}
            value={value}
          />
        ) : (
          <input
            aria-label={label}
            id={`onboarding-${id}`}
            onChange={(event) => setField(id, event.target.value)}
            type={type}
            value={value}
          />
        )}
        {hint ? <small>{hint}</small> : null}
      </label>
    );
  }

  const fields = step === 0 ? (
    <>
      {field("lifeStateTitle", "这段人生如何称呼？", { hint: "例如：毕业后的过渡期" })}
      {field("lifeStateDescription", "它大概是什么样的？", { rows: 4 })}
      <div className="form-grid">
        {field("lifeStateStartedOn", "开始日期", { type: "date" })}
        {field("lifeStateEndsOn", "预计结束", { type: "date" })}
      </div>
    </>
  ) : step === 1 ? (
    <>
      {field("currentContext", "最近最需要推进的事", { rows: 4 })}
      {field("timeConstraints", "时间和精力的限制", { rows: 3 })}
      {field("interruptionPatterns", "最容易打断你的事", { rows: 3 })}
    </>
  ) : (
    <>
      {field("rewardPreferences", "愿意给自己的奖励", { rows: 3 })}
      {field("penaltyPreferences", "能接受的惩罚", { rows: 3 })}
      {field("capabilityFocus", "想发展的能力", { rows: 3 })}
    </>
  );

  return (
    <section className={isInitial ? "onboarding-shell" : "profile-editor"} data-theme="dark">
      <div className="onboarding-inner">
        {isInitial ? <p className="wordmark">MAINLINE</p> : null}
        <p className="onboarding-label">{prompt.label}</p>
        <h1>{prompt.title}</h1>
        <p className="lede">{prompt.description}</p>
        <p className="onboarding-privacy">内容只保存在这台设备。所有问题都可以跳过，之后仍能在“我的”里修改。</p>

        <form
          className="onboarding-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {fields}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <footer className="onboarding-actions">
            {step > 0 ? (
              <button className="text-button" onClick={() => setStep((current) => current - 1)} type="button">
                <ArrowLeft aria-hidden="true" size={16} /> 返回
              </button>
            ) : mode === "edit" ? (
              <button className="text-button" onClick={onDone} type="button">返回我的</button>
            ) : <span />}
            <button className="primary-button" disabled={isSaving} type="submit">
              {step === prompts.length - 1 ? <Check aria-hidden="true" size={17} /> : <ArrowRight aria-hidden="true" size={17} />}
              {step === prompts.length - 1 ? (isSaving ? "正在保存" : isInitial ? "进入 Mainline" : "保存资料") : "继续"}
            </button>
          </footer>
        </form>
      </div>
    </section>
  );
}
