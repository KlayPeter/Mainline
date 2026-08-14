import { X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import type { AiInterruptionProposal, Task } from "@mainline/contracts";

import {
  acceptAiProposal,
  AiProposalApiError,
  dismissAiProposal,
  fetchPendingAiProposals,
  requestInterruptionAdvice,
} from "./api";

const actionLabels = {
  keep: "先保留原安排",
  reduce: "缩小今天的范围",
  reschedule: "改到另一天处理",
  pause: "先暂停，留待决定",
} as const;

interface InterruptionComposerProps {
  task?: Task;
  onClose(): void;
  onResolved(message: string): void;
}

export function InterruptionComposer({ task, onClose, onResolved }: InterruptionComposerProps) {
  const [message, setMessage] = useState("");
  const [proposal, setProposal] = useState<AiInterruptionProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void fetchPendingAiProposals()
      .then((proposals) => {
        const matchingProposal = proposals.find(
          (item): item is AiInterruptionProposal =>
            item.kind === "interruption" && (!task || item.request.taskId === task.id),
        );

        if (isCurrent && matchingProposal) {
          setProposal(matchingProposal);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [task]);

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsRequesting(true);

    try {
      setProposal(await requestInterruptionAdvice({ message, ...(task ? { taskId: task.id } : {}) }));
    } catch (caughtError) {
      setError(caughtError instanceof AiProposalApiError ? caughtError.message : "AI 建议暂时无法生成，请稍后再试。");
    } finally {
      setIsRequesting(false);
    }
  }

  async function resolveProposal(action: "accept" | "dismiss") {
    if (!proposal) {
      return;
    }

    setError(null);
    setIsResolving(true);

    try {
      if (action === "accept") {
        await acceptAiProposal(proposal.id);
        onResolved("已记下这条调整思路。任务尚未改动，请由你决定下一步。");
      } else {
        await dismissAiProposal(proposal.id);
        onResolved("已忽略这条调整建议，原任务未改动。");
      }
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof AiProposalApiError ? caughtError.message : "建议暂时无法处理，请稍后再试。");
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <div className="composer-backdrop" role="presentation">
      <section aria-labelledby="interruption-heading" aria-modal="true" className="task-composer interruption-composer" role="dialog">
        <header className="composer-header">
          <div>
            <p className="section-kicker">现实有变</p>
            <h2 id="interruption-heading">先把真实情况说清楚</h2>
          </div>
          <button aria-label="关闭现实调整面板" className="icon-button" onClick={onClose} type="button"><X size={20} /></button>
        </header>

        {!proposal ? (
          <form className="task-form" onSubmit={handleRequest}>
            {task ? <p className="interruption-composer__task">正在参考：{task.title}</p> : null}
            <label className="form-field">
              <span>发生了什么</span>
              <textarea autoFocus maxLength={1000} onChange={(event) => setMessage(event.target.value)} placeholder="例如：临时加班，健身和学习的时间都被挤掉了。" required rows={5} value={message} />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <footer className="composer-actions">
              <button className="text-button" disabled={isRequesting} onClick={onClose} type="button">取消</button>
              <button className="primary-button" disabled={isRequesting} type="submit">{isRequesting ? "正在整理" : "给我调整思路"}</button>
            </footer>
          </form>
        ) : (
          <div className="interruption-result">
            <p className="interruption-result__summary">{proposal.content.summary}</p>
            <p className="interruption-result__label">建议：{actionLabels[proposal.content.suggestedAction]}</p>
            <p>{proposal.content.suggestedAdjustment}</p>
            <p className="interruption-result__notice">这只是建议。确认后也不会自动改动任何任务。</p>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <footer className="composer-actions">
              <button className="text-button" disabled={isResolving} onClick={() => void resolveProposal("dismiss")} type="button">忽略建议</button>
              <button className="primary-button" disabled={isResolving} onClick={() => void resolveProposal("accept")} type="button">{isResolving ? "正在确认" : "记下这条思路"}</button>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}
