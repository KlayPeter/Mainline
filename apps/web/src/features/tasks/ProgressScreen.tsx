import { Check, Gift, Warning } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import type { ProgressSnapshot } from "@mainline/contracts";

import { claimTaskReward, fetchProgress, fulfillTaskPenalty, TaskApiError } from "./api";
import { formatTaskDateTime } from "./task-presentation";
import { ReviewPanel } from "../reviews/ReviewPanel";

type LoadingState = "loading" | "ready" | "error";

export function ProgressScreen() {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);

  const loadProgress = useCallback(async (signal?: AbortSignal) => {
    setLoadingState("loading");

    try {
      setProgress(await fetchProgress(signal));
      setLoadingState("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setLoadingState("error");
      setMessage(error instanceof TaskApiError ? error.message : "你的进度存档暂时无法读取。");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadProgress(controller.signal);

    return () => controller.abort();
  }, [loadProgress]);

  async function runAction(taskId: string, action: () => Promise<unknown>, successMessage: string) {
    setActionTaskId(taskId);
    setMessage(null);

    try {
      await action();
      await loadProgress();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof TaskApiError ? error.message : "这次操作没有完成，请稍后再试。");
    } finally {
      setActionTaskId(null);
    }
  }

  return (
    <section aria-labelledby="progress-heading" className="progress-view">
      <p className="section-kicker">我的</p>
      <h1 id="progress-heading">你的存档，在慢慢变厚。</h1>
      <p className="lede">经验来自已经确认完成的事；奖励和承诺由你自己领取与兑现。</p>

      {message ? <p className="task-feedback" role="status">{message}</p> : null}
      {loadingState === "loading" ? <p className="task-state">正在读取你的存档…</p> : null}
      {loadingState === "error" ? <button className="text-button" onClick={() => void loadProgress()} type="button">重新读取</button> : null}

      {loadingState === "ready" && progress ? (
        <>
          <section aria-label="经验" className="experience-block">
            <span>已获得经验</span>
            <strong>{progress.experience}</strong>
          </section>
          <ReviewPanel />

          <section aria-labelledby="rewards-heading" className="task-section">
            <div className="section-heading">
              <h2 id="rewards-heading">待领取奖励</h2>
              <span>{progress.availableRewards.length} 项</span>
            </div>
            {progress.availableRewards.length ? (
              <div className="progress-list">
                {progress.availableRewards.map((reward) => (
                  <article className="progress-card" key={reward.taskId}>
                    <div><Gift size={18} /><p>{reward.rewardTitle}</p><span>来自：{reward.taskTitle}</span></div>
                    <button className="small-action small-action--signal" disabled={actionTaskId === reward.taskId} onClick={() => void runAction(reward.taskId, () => claimTaskReward(reward.taskId), `已领取：${reward.rewardTitle}`)} type="button">领取</button>
                  </article>
                ))}
              </div>
            ) : <p className="task-state">暂时没有待领取奖励。</p>}
          </section>

          <section aria-labelledby="penalties-heading" className="task-section">
            <div className="section-heading">
              <h2 id="penalties-heading">待兑现承诺</h2>
              <span>{progress.pendingPenalties.length} 项</span>
            </div>
            {progress.pendingPenalties.length ? (
              <div className="progress-list">
                {progress.pendingPenalties.map((penalty) => (
                  <article className="progress-card progress-card--penalty" key={penalty.taskId}>
                    <div><Warning size={18} /><p>{penalty.detail}{penalty.amount ? `（${penalty.amount} 元）` : ""}</p><span>来自：{penalty.taskTitle} · 截止：{formatTaskDateTime(penalty.dueAt)}</span></div>
                    <button className="small-action" disabled={actionTaskId === penalty.taskId} onClick={() => void runAction(penalty.taskId, () => fulfillTaskPenalty(penalty.taskId), "已记录承诺兑现。") } type="button"><Check size={16} /> 已兑现</button>
                  </article>
                ))}
              </div>
            ) : <p className="task-state">暂时没有待兑现承诺。</p>}
          </section>
        </>
      ) : null}
    </section>
  );
}
