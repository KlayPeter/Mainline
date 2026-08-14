import { Camera, X } from "@phosphor-icons/react";
import { useState } from "react";

import { TaskApiError, uploadTaskEvidence } from "./api";

const acceptedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const maximumEvidenceBytes = 5 * 1024 * 1024;

interface PenaltyEvidenceComposerProps {
  taskId: string;
  taskTitle: string;
  onClose(): void;
  onFulfilled(): Promise<boolean>;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("凭据图片没有读取成功。"));
    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("凭据图片没有读取成功。"));
        return;
      }

      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

export function PenaltyEvidenceComposer({ taskId, taskTitle, onClose, onFulfilled }: PenaltyEvidenceComposerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function selectFile(nextFile: File | null) {
    setError(null);

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!acceptedMimeTypes.includes(nextFile.type as typeof acceptedMimeTypes[number])) {
      setError("只支持 JPEG、PNG 或 WebP 图片。");
      return;
    }

    if (nextFile.size > maximumEvidenceBytes) {
      setError("凭据图片需小于 5 MB。");
      return;
    }

    setFile(nextFile);
  }

  async function submit() {
    setError(null);
    setIsSaving(true);

    try {
      if (file) {
        await uploadTaskEvidence({
          taskId,
          filename: file.name,
          mimeType: file.type as typeof acceptedMimeTypes[number],
          dataBase64: await readFileAsBase64(file),
        });
      }

      if (await onFulfilled()) {
        onClose();
      }
    } catch (caughtError) {
      setError(caughtError instanceof TaskApiError || caughtError instanceof Error ? caughtError.message : "凭据没有保存成功，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="composer-backdrop" role="presentation">
      <section aria-labelledby="penalty-evidence-heading" aria-modal="true" className="task-composer" role="dialog">
        <header className="composer-header">
          <div>
            <p className="section-kicker">兑现承诺</p>
            <h2 id="penalty-evidence-heading">给「{taskTitle}」留个凭据</h2>
          </div>
          <button aria-label="关闭凭据面板" className="icon-button" disabled={isSaving} onClick={onClose} type="button"><X size={20} /></button>
        </header>

        <div className="task-form">
          <p className="task-state">图片只保存在这台电脑，既不会上传到云端，也不会发送给 AI。你也可以不附图片，直接记录已兑现。</p>
          <label className="form-field">
            <span>凭据图片（可选）</span>
            <input accept="image/jpeg,image/png,image/webp" aria-label="凭据图片" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} type="file" />
          </label>
          {file ? <p className="selected-file"><Camera size={16} /> 已选择：{file.name}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <footer className="composer-actions">
            <button className="text-button" disabled={isSaving} onClick={onClose} type="button">取消</button>
            <button className="primary-button" disabled={isSaving} onClick={() => void submit()} type="button">{isSaving ? "正在保存" : file ? "留存凭据并兑现" : "记录已兑现"}</button>
          </footer>
        </div>
      </section>
    </div>
  );
}
