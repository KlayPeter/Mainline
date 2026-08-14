---
feature_id: task-management
name: Today 与任务管理
status: active
last_reviewed: 2026-08-14
---

# Today 与任务管理

让用户手动把事情安排到具体一天，并在 Today 中认领与完成真实任务。

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
- 支持未完成任务的编辑、认领和删除，以及普通任务完成。
- 给移动端提供可读、低密度的 Today 任务面板。

### 非目标

- 不自动安排任务或自行改写用户计划。
- 不计算经验、奖励、惩罚或结果质量。
- 不把任务自动转移到其他日期。

## 核心规则

1. `main` 任务在同一 `scheduledDate` 只能存在一条计划中或进行中的记录。
2. 完成后任务是事实记录，本故事不允许编辑或删除。
3. `start` 只允许计划中任务，`complete` 允许计划中或进行中的普通任务。
4. 所有数据库访问收口在 Repository；路由只负责 TypeBox HTTP 边界与错误映射。

## 代码地图

### 主要实现

- `apps/api/src/modules/tasks/routes.ts`：TypeBox 请求/响应边界。
- `apps/api/src/modules/tasks/service.ts`：任务生命周期和主线唯一性规则。
- `apps/api/src/modules/tasks/repository.ts`：任务 SQL 读写。
- `apps/api/src/platform/database/migrations.ts`：任务表与数据库唯一索引。
- `apps/web/src/features/tasks/TodayScreen.tsx`：Today 页面和用户任务操作。
- `apps/web/src/features/tasks/TaskComposer.tsx`：任务录入表单。
- `apps/web/src/features/tasks/api.ts`：浏览器任务 API 客户端。
- `packages/contracts/src/index.ts`：任务 DTO 与 TypeBox Schema。

### 主要测试

- `apps/api/src/modules/tasks/routes.test.ts`：CRUD、主线冲突、状态转换和校验。
- `apps/web/src/features/tasks/TodayScreen.test.tsx`：Today 加载与任务动作反馈。

## 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-08-14 | 完成任务 API、主线约束与生命周期基础 | `pnpm check` |
