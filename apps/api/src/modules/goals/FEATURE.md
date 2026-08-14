---
feature_id: chapters-and-goals
name: 多领域章节与目标
status: active
last_reviewed: 2026-08-14
---

# 多领域章节与目标

保存用户自己的长期章节与可量化目标；它们与每日主线不同，可并行存在于多个领域。

## 核心规则

1. 领域固定为职业、学习、创作、健康、生活，用户可在每个领域建立多个章节。
2. 目标归属于一个章节；用户更新进度，达到目标值时才自动标记为已达成。
3. 章节与目标均为本机 SQLite 事实；AI 后续只能提供规划建议，不能自行创建。
4. 任务可由用户关联到进行中的目标；目标页显示关联任务数作为执行证据，但目标数值仍只由用户依据成果更新。

## 代码地图

- `repository.ts`：章节、目标读写与层级映射。
- `service.ts`：日期、归属与用户进度规则。
- `routes.ts`：`/chapters`、`/goals` 与目标进度 API。
- `routes.test.ts`：多领域章节和目标达成测试。
- `apps/api/src/modules/tasks/service.ts`：保存或修改任务时校验目标归属。
- `apps/web/src/features/tasks/TaskComposer.tsx`：任务录入时选择可关联的进行中目标。

## 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-08-14 | 建立章节、目标、用户手动进度与 SQLite 迁移 | `pnpm check` |
| 2026-08-14 | 增加用户选择的任务关联与关联任务数展示，不自动改变目标进度 | `pnpm check` |
