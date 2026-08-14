---
feature_id: ai-proposals
name: AI 规划提案与现实中断
status: active
last_reviewed: 2026-08-14
---

# AI 规划提案与现实中断

为用户提供可确认的 DeepSeek 规划建议，不替用户做任务事实决策。

## 实现流程图

```mermaid
flowchart LR
    User["用户主动请求"] --> Api["/ai/task-plans 或 /ai/interruptions"]
    Api --> Service["AiProposalService"]
    Service --> Adapter["DeepSeek JSON Adapter"]
    Adapter --> Validate["运行时结构校验"]
    Validate --> Proposal[("SQLite ai_proposals")]
    Proposal --> Confirm["用户接受或忽略"]
    Confirm -. "只回填表单，不改任务事实" .-> Task["用户手动保存任务"]
```

## 能力边界

### 目标

- 为任务提供归属、形式、时间段和执行步骤建议。
- 为现实中断提供保留、缩小、改期或暂停的可选建议。
- 保存和解析用户确认过的提案记录。

### 非目标

- 不自动发起 AI 请求。
- 不直接调用 TaskService 的创建、修改或完成方法。
- 不把本地图片或 API Key 放进 AI 上下文。

## 核心规则

1. 路由只处理 TypeBox HTTP 边界；模型调用、解析和提案生命周期收口在 Service/Adapter/Repository。
2. Provider 返回值不能信任，必须在 Adapter 中解析并由 Service 校验后才能入库。
3. `accepted` 只表示用户采纳建议，不代表已完成现实任务。
4. 不可用的模型配置必须返回 `AI_NOT_CONFIGURED`，不能降级为假提案。

## 代码地图

### 主要实现

- `apps/api/src/platform/ai/deepseek-planner.ts`：DeepSeek JSON 请求和第三方返回边界。
- `apps/api/src/modules/ai-proposals/service.ts`：生成、验证和确认提案。
- `apps/api/src/modules/ai-proposals/repository.ts`：提案 SQLite 读写。
- `apps/api/src/modules/ai-proposals/routes.ts`：AI 提案 HTTP 接口。
- `apps/api/src/platform/database/migrations.ts`：提案记录表。
- `apps/web/src/features/ai-proposals/`：任务规划和中断的用户确认体验。

### 主要测试

- `apps/api/src/modules/ai-proposals/routes.test.ts`：Provider 模拟、提案生命周期和错误边界。
- `apps/web/src/features/ai-proposals/`：表单回填和中断建议交互。

## 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-08-14 | 接入 DeepSeek JSON 提案、SQLite 生命周期与接口测试 | `pnpm check` |
