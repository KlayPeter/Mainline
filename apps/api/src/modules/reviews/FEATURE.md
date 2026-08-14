---
feature_id: reviews-and-memory
name: 本地复盘与长期记忆
status: active
last_reviewed: 2026-08-14
---

# 本地复盘与长期记忆

按日期保存用户的进展、阻碍和下一步。`keepAsMemory` 是用户明确选择，记录不会自动进入 AI 上下文。

## 代码地图

- `repository.ts`：SQLite 每日复盘读取和幂等保存。
- `service.ts`：日期与文本归一化。
- `routes.ts`：`/reviews` 本地 API。
- `routes.test.ts`：复盘创建、更新与回看测试。
