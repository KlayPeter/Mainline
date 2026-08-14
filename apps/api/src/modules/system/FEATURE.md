---
feature_id: local-runtime
name: 本地运行时
status: active
last_reviewed: 2026-08-14
---

# 本地运行时

为 Mainline 提供本地 Fastify API 的启动、健康检查和配置边界。

## 实现流程图

```mermaid
flowchart LR
    Web["Web/PWA"] --> Health["GET /health"]
    Health --> App["Fastify App"]
    App --> Result["类型化健康结果"]
```

## 能力边界

### 目标

- 启动本地 Fastify 服务。
- 提供 TypeBox 定义的健康检查响应。
- 读取安全的本地服务端口配置。
- 提供不含用户内容的本地存储就绪状态。
- 提供用户主动下载的本机备份文件。

### 非目标

- 不创建业务数据表。
- 不调用 AI 服务。
- 不提供登录和账号能力。

## 核心规则

1. 路由只负责 HTTP 输入输出，业务逻辑将在后续领域服务中实现。
2. TypeBox 是运行时请求和响应边界。
3. API Key 只可由服务端环境读取，不返回给浏览器。

## 代码地图

### 主要实现

- `apps/api/src/app.ts`：Fastify 实例和路由注册。
- `apps/api/src/index.ts`：本地服务启动。
- `apps/api/src/modules/system/routes.ts`：健康检查 HTTP 边界。
- `apps/api/src/modules/system/routes.ts`：健康检查、存储状态与本机备份下载 HTTP 边界。
- `apps/api/src/modules/system/service.ts`：健康检查事实数据。
- `apps/api/src/modules/system/routes.ts`：健康检查与存储状态 HTTP 边界。

### 主要测试

- `apps/api/src/app.test.ts`：健康检查、存储状态与本机备份响应。
- `apps/api/src/platform/database/local-database.test.ts`：本地存储迁移。

## 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-08-14 | 完成本地健康检查与存储状态 | `pnpm check` |
| 2026-08-14 | 共享任务与目标 Repository 实例，供本地应用装配关联校验 | `pnpm check` |
| 2026-08-14 | 注入本机凭据目录，仅供任务惩罚图片读写 | `pnpm check` |
| 2026-08-14 | 增加用户主动下载的本机备份端点 | `pnpm check` |
