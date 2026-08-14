import { Gift, Warning } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import type { ProgressPenalty, ProgressSnapshot, TaskEvidence } from "@mainline/contracts";

import { claimTaskReward, fetchProgress, fetchTaskEvidence, fulfillTaskPenalty, TaskApiError } from "./api";
import { PenaltyEvidenceComposer } from "./PenaltyEvidenceComposer";
import { formatTaskDateTime } from "./task-presentation";
import { ReviewPanel } from "../reviews/ReviewPanel";

type LoadingState = "loading" | "ready" | "error";

export function ProgressScreen() {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<TaskEvidence[]>([]);
  const [penaltyForEvidence, setPenaltyForEvidence] = useState<ProgressPenalty | null>(null);

  const loadProgress = useCallback(async (signal?: AbortSignal) => {
    setLoadingState("loading");

    try {
      const [nextProgress, evidenceResponse] = await Promise.all([fetchProgress(signal), fetchTaskEvidence(signal)]);
      setProgress(nextProgress);
      setEvidence(evidenceResponse.evidence);
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

  async function runAction(taskId: string, action: () => Promise<unknown>, successMessage: string): Promise<boolean> {
    setActionTaskId(taskId);
    setMessage(null);

    try {
      await action();
      await loadProgress();
      setMessage(successMessage);
      return true;
    } catch (error) {
      setMessage(error instanceof TaskApiError ? error.message : "这次操作没有完成，请稍后再试。");
      return false;
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
                    <button className="small-action" disabled={actionTaskId === penalty.taskId} onClick={() => setPenaltyForEvidence(penalty)} type="button">留凭据并兑现</button>
                  </article>
                ))}
              </div>
            ) : <p className="task-state">暂时没有待兑现承诺。</p>}
          </section>

          {evidence.length ? (
            <section aria-labelledby="evidence-heading" className="task-section">
              <div className="section-heading"><h2 id="evidence-heading">已留存凭据</h2><span>{evidence.length} 份</span></div>
              <div className="evidence-list">
                {evidence.map((item) => (
                  <a href={`/api${item.fileUrl}`} key={item.id} rel="noreferrer" target="_blank">
                    <img alt={`${item.taskTitle}的惩罚凭据`} loading="lazy" src={`/api${item.fileUrl}`} />
                    <span>{item.taskTitle}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="backup-heading" className="task-section local-backup">
            <div className="section-heading"><h2 id="backup-heading">本地备份</h2><span>只在本机生成</span></div>
            <p className="task-state">下载一份完整 JSON 存档，包含任务、章节、复盘、AI 提案和凭据图片。恢复导入会在后续版本开放。</p>
            <a className="text-button" download href="/api/system/backup">下载本地备份</a>
          </section>
        </>
      ) : null}
      {penaltyForEvidence ? <PenaltyEvidenceComposer onClose={() => setPenaltyForEvidence(null)} onFulfilled={() => runAction(penaltyForEvidence.taskId, () => fulfillTaskPenalty(penaltyForEvidence.taskId), "已记录承诺兑现。")} taskId={penaltyForEvidence.taskId} taskTitle={penaltyForEvidence.taskTitle} /> : null}
    </section>
  );
}
