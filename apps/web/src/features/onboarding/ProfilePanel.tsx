import { PencilSimple } from "@phosphor-icons/react";

import { useOnboardingProfile } from "./OnboardingContext";

export function ProfilePanel({ onEdit }: { onEdit: () => void }) {
  const { profile } = useOnboardingProfile();

  if (!profile?.completed) {
    return null;
  }

  return (
    <section aria-labelledby="profile-heading" className="task-section profile-panel">
      <div className="section-heading">
        <h2 id="profile-heading">我的现在</h2>
        <span>本机保存</span>
      </div>
      <strong>{profile.lifeStateTitle}</strong>
      <p>{profile.lifeStateDescription || "你可以随时补充这段人生的描述。"}</p>
      <button className="text-button" onClick={onEdit} type="button">
        <PencilSimple aria-hidden="true" size={16} /> 调整资料
      </button>
    </section>
  );
}
