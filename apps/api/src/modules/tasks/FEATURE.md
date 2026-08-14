---
feature_id: task-management
name: Today 与任务管理
status: active
last_reviewed: 2026-08-14
---

# Today 与任务管理

让用户手动把事情安排到具体一天，并在 Today 中认领、结算和保存真实任务结果。

## 实现流程图

```mermaid
flowchart LR
    User["用户录入任务"] --> Web["Today / 任务录入面板"]
    Web --> Api["Fastify /tasks"]
    Api --> Service["TaskService"]
    Service --> Repository["TaskRepository"]
    Repository --> SQLite[("SQLite tasks")]
    SQLite --> Today["按日期返回 Today"]
```

## 能力边界

### 目标

- 保存和读取用户手动创建的日程任务。
- 保证同一天最多一个有效主线任务。
- 支持未形成结果任务的编辑、认领和删除，以及普通任务完成。
- 支持成果提交、自评确认、经验累计、奖励领取和未完成承诺兑现。
- 给移动端提供可读、低密度的 Today 任务面板。

### 非目标

- 不自动安排任务或自行改写用户计划。
- 不自动判断成果质量、调用支付或强制执行现实惩罚。
- 不把任务自动转移到其他日期。

## 核心规则

1. `main` 任务在同一 `scheduledDate` 只能存在一条计划中或进行中的记录。
2. `direct` 任务可直接完成；`result_report` 任务必须先提交成果与自评，再由用户确认完成。
3. `incomplete` 只能由用户主动结算；有预设承诺时才生成 24 小时内待兑现记录，绝不自动滚期或自动处罚。
4. 完成、领取奖励和兑现承诺都是不可由普通编辑接口篡改的事实操作。
5. 所有数据库访问收口在 Repository；路由只负责 TypeBox HTTP 边界与错误映射。

## 代码地图

### 主要实现

- `apps/api/src/modules/tasks/routes.ts`：TypeBox 请求/响应边界。
- `apps/api/src/modules/tasks/service.ts`：任务生命周期和主线唯一性规则。
- `apps/api/src/modules/tasks/repository.ts`：任务 SQL 读写。
- `apps/api/src/platform/database/migrations.ts`：任务表、唯一主线约束与结果/承诺字段迁移。
- `apps/web/src/features/tasks/TodayScreen.tsx`：Today 页面、结果确认、奖励与惩罚操作。
- `apps/web/src/features/tasks/TaskComposer.tsx`：任务录入、完成方式与承诺快照表单。
- `apps/web/src/features/tasks/ResultComposer.tsx`、`IncompleteComposer.tsx`：成果提交与主动未完成结算。
- `apps/web/src/features/tasks/ProgressScreen.tsx`：经验、待领取奖励和待兑现承诺。
- `apps/web/src/features/tasks/api.ts`：浏览器任务 API 客户端。
- `packages/contracts/src/index.ts`：任务 DTO 与 TypeBox Schema。

### 主要测试

- `apps/api/src/modules/tasks/routes.test.ts`：CRUD、主线冲突、成果结算、奖励与承诺状态转换。
- `apps/web/src/features/tasks/TodayScreen.test.tsx`、`outcomes.test.tsx`：Today、成果和主动结算交互反馈。

## 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-08-14 | 完成任务 API、主线约束与生命周期基础 | `pnpm check` |
| 2026-08-14 | 接入任务结果、经验、奖励领取与本地承诺兑现 | `pnpm check` |
