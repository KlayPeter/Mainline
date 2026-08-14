---
feature_id: task-management
name: Today 与任务管理
status: active
last_reviewed: 2026-08-14
---

# Today 与任务管理（Web）

此目录是任务功能的浏览器入口；功能规则与 API 归属共同记录在 `apps/api/src/modules/tasks/FEATURE.md`。

## 实现流程图

```mermaid
flowchart LR
    Today["TodayScreen"] --> Client["任务 API Client"]
    Composer["TaskComposer"] --> Client
    Result["成果 / 未完成结算"] --> Client
    Progress["我的进度"] --> Client
    Client --> Api["本地 /api/tasks"]
    Api --> Refresh["刷新 Today 事实列表"]
```

## 核心规则

1. 用户操作发送到 API 后才刷新任务事实；React 状态只承载加载、表单和临时交互状态。
2. “记录”底栏按钮打开任务录入，不产生一个空白独立页面。
3. 同日主线冲突要保留服务端原始中文提示，不能在前端静默替换为其他分类。
4. 中文表单控制项必须有可见标签，提交过程不得重复提交。
5. 完成、领取奖励、确认未完成和兑现承诺都必须有显式操作；关闭面板不形成任何任务事实。

## 代码地图

- `TodayScreen.tsx`：日期面板、任务列表、动作反馈。
- `TaskComposer.tsx`：创建和编辑面板。
- `ResultComposer.tsx`、`IncompleteComposer.tsx`：成果提交和主动未完成结算面板。
- `ProgressScreen.tsx`：经验、待领取奖励与待兑现承诺。
- `api.ts`：任务请求与响应校验。
- `task-presentation.ts`：任务枚举对应的中文呈现。

## 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-08-14 | 完成 Today、任务录入与普通完成体验 | `pnpm check` |
| 2026-08-14 | 接入成果确认、奖励领取、承诺结算与个人进度 | `pnpm check` |
