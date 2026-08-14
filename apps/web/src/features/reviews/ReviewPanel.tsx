import { Notebook, Plus } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { DailyReview } from "@mainline/contracts";
import { fetchReviews, ReviewApiError, saveReview } from "./api";

const today = new Date().toISOString().slice(0, 10);

export function ReviewPanel() {
  const [reviews, setReviews] = useState<DailyReview[]>([]); const [open, setOpen] = useState(false); const [error, setError] = useState<string | null>(null);
  async function load() { try { setReviews((await fetchReviews()).reviews); } catch (e) { setError(e instanceof ReviewApiError ? e.message : "复盘暂时无法读取。"); } }
  useEffect(() => { void load(); }, []);
  const memories = reviews.filter((review) => review.keepAsMemory).slice(0, 3);
  async function submit(form: HTMLFormElement) { const v = new FormData(form); try { await saveReview(today, { progress: String(v.get("progress")), obstacles: String(v.get("obstacles")), nextStep: String(v.get("nextStep")), keepAsMemory: v.get("keepAsMemory") === "on" }); setOpen(false); await load(); } catch (e) { setError(e instanceof ReviewApiError ? e.message : "复盘没有保存成功。"); } }
  return <section aria-labelledby="reviews-heading" className="task-section review-panel"><div className="section-heading"><h2 id="reviews-heading">留一段复盘</h2><button className="text-button" onClick={() => setOpen(true)} type="button"><Plus size={16} /> 今天写一下</button></div><p className="task-state">不需要长篇大论，只写真实进展、阻碍和下一步。</p>{memories.length ? <div className="memory-list">{memories.map((review) => <article key={review.date}><span>{review.date} · 长期记忆</span><p>{review.nextStep || review.progress || review.obstacles}</p></article>)}</div> : null}{error ? <p className="form-error">{error}</p> : null}{open ? <div className="composer-backdrop"><form className="task-composer task-form" onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget); }}><header className="composer-header"><div><p className="section-kicker">今日复盘</p><h2>把今天留下来</h2></div><Notebook size={22} /></header><label className="form-field"><span>有什么进展</span><textarea name="progress" rows={3} /></label><label className="form-field"><span>什么阻碍了你</span><textarea name="obstacles" rows={3} /></label><label className="form-field"><span>明天最小的一步</span><textarea name="nextStep" rows={3} /></label><label className="memory-check"><input name="keepAsMemory" type="checkbox" /> 这条值得作为长期记忆保留</label><footer className="composer-actions"><button className="text-button" onClick={() => setOpen(false)} type="button">取消</button><button className="primary-button" type="submit">保存复盘</button></footer></form></div> : null}</section>;
}
