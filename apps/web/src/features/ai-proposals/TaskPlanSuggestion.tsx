import { Sparkle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import type { AiTaskPlanProposal, TaskForm, TaskLane, TaskTimeBlock } from "@mainline/contracts";

import { getFormLabel, getLaneLabel, getTimeBlockLabel } from "../tasks/task-presentation";
import {
  acceptAiProposal,
  AiProposalApiError,
  dismissAiProposal,
  fetchPendingAiProposals,
  requestTaskPlan,
} from "./api";

interface TaskPlanSuggestionProps {
  details: string;
  onApply(suggestion: {
    lane: TaskLane;
    form: TaskForm;
    timeBlock: TaskTimeBlock;
  }): void;
  scheduledDate: string;
  title: string;
}

export function TaskPlanSuggestion({
  details,
  onApply,
  scheduledDate,
  title,
}: TaskPlanSuggestionProps) {
  const [proposal, setProposal] = useState<AiTaskPlanProposal | null>(null);
  const [pendingPlans, setPendingPlans] = useState<AiTaskPlanProposal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void fetchPendingAiProposals()
      .then((proposals) => {
        if (isCurrent) {
          setPendingPlans(proposals.filter((item): item is AiTaskPlanProposal => item.kind === "task_plan"));
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleRequest() {
    if (!title.trim()) {
      setError("先写下任务标题，AI 才知道要帮你规划什么。");
      return;
    }

    setError(null);
    setIsRequesting(true);

    try {
      const nextProposal = await requestTaskPlan({ title, details, scheduledDate });
      setProposal(nextProposal);
      setPendingPlans((current) => [nextProposal, ...current.filter((item) => item.id !== nextProposal.id)]);
    } catch (caughtError) {
      setError(caughtError instanceof AiProposalApiError ? caughtError.message : "AI 建议暂时无法生成，请稍后再试。");
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleApply() {
    if (!proposal) {
      return;
    }

    setError(null);
    setIsResolving(true);

    try {
      const accepted = await acceptAiProposal(proposal.id);

      if (accepted.kind !== "task_plan") {
        throw new AiProposalApiError("这条建议已经无法用于当前任务。");
      }

      onApply({
        lane: accepted.content.suggestedLane,
        form: accepted.content.suggestedForm,
        timeBlock: accepted.content.suggestedTimeBlock,
      });
      setPendingPlans((current) => current.filter((item) => item.id !== proposal.id));
      setProposal(null);
    } catch (caughtError) {
      setError(caughtError instanceof AiProposalApiError ? caughtError.message : "建议暂时无法确认，请稍后再试。");
    } finally {
      setIsResolving(false);
    }
  }

  async function handleDismiss() {
    if (!proposal) {
      return;
    }

    setError(null);
    setIsResolving(true);

    try {
      await dismissAiProposal(proposal.id);
      setPendingPlans((current) => current.filter((item) => item.id !== proposal.id));
      setProposal(null);
    } catch (caughtError) {
      setError(caughtError instanceof AiProposalApiError ? caughtError.message : "建议暂时无法忽略，请稍后再试。");
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <aside className="ai-suggestion" aria-live="polite">
      <div className="ai-suggestion__heading">
        <div>
          <p className="panel-label">AI 辅助规划</p>
          <p>只提供思路，不会替你安排或修改任务。</p>
        </div>
        <button className="small-action" disabled={isRequesting || isResolving} onClick={() => void handleRequest()} type="button">
          <Sparkle size={16} weight="fill" /> {isRequesting ? "正在思考" : "帮我规划"}
        </button>
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      {!proposal && pendingPlans.length ? (
        <div className="ai-suggestion__pending">
          <p className="ai-suggestion__meta">本机还有 {pendingPlans.length} 条待确认建议</p>
          <div className="ai-suggestion__pending-list">
            {pendingPlans.map((item) => (
              <button key={item.id} onClick={() => setProposal(item)} type="button">
                {item.request.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {proposal ? (
        <div className="ai-suggestion__content">
          <p className="ai-suggestion__analysis">{proposal.content.analysis}</p>
          <p className="ai-suggestion__meta">
            建议归属：{getLaneLabel(proposal.content.suggestedLane)} · {getFormLabel(proposal.content.suggestedForm)} · {getTimeBlockLabel(proposal.content.suggestedTimeBlock)}
          </p>
          {proposal.content.suggestedSteps.length ? (
            <ol className="ai-suggestion__steps">
              {proposal.content.suggestedSteps.map((step, index) => (
                <li key={`${step.title}-${index}`}>
                  <strong>{step.title}</strong>
                  {step.details ? <span>{step.details}</span> : null}
                </li>
              ))}
            </ol>
          ) : null}
          <div className="ai-suggestion__actions">
            <button className="text-button" disabled={isResolving} onClick={() => void handleDismiss()} type="button">忽略建议</button>
            <button className="small-action small-action--signal" disabled={isResolving} onClick={() => void handleApply()} type="button">
              {isResolving ? "正在确认" : "采用分类建议"}
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
