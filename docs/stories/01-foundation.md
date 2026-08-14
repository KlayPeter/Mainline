# Story 01：工程基础

## 目标

建立 Mainline 的本地开发基础，使后续功能可以按 `apps/web`、`apps/api`、`packages/contracts` 三工作区独立实现和验证。

## 范围

- 初始化 Git 仓库；
- 建立 pnpm Workspace 与 Turbo 脚本；
- 建立 React + Vite Web 应用；
- 建立 Node.js + Fastify API；
- 建立共享 TypeScript 契约包；
- 建立 TypeBox 输入边界的最小示例；
- 建立移动端应用外壳、双主题和基础导航；
- 建立功能文档索引与三个基础功能 Owner 文档；
- 保留旧静态 HTML/CSS，不将其接入新工程。

## 非目标

- SQLite 数据表与业务接口；
- DeepSeek 调用；
- 任务、目标、复盘或奖惩功能；
- 迁移旧静态页的代码或视觉。

## 验收标准

1. `pnpm install` 能完成依赖安装。
2. `pnpm typecheck`、`pnpm test`、`pnpm build` 均通过。
3. Web 可以显示新的全中文应用外壳，并在 390px 宽度正常使用。
4. API 的 `GET /health` 返回类型化健康结果。
5. Web 使用共享契约展示 API 未连接时的降级信息。
6. 所有新增功能都有 `FEATURE.md`，并登记到功能目录。
7. 本故事在独立提交中完成。

## 实现备注

- API 使用 Fastify 与 TypeBox，符合 `AGENTS.md` 的输入边界要求。
- Web 只保存主题和临时界面状态；业务数据将从后续 API 读取。
- 当前不引入 SQLite、ORM、AI SDK 或复杂状态库，避免在基础阶段过度设计。

## 完成记录

- 2026-08-14：完成 `pnpm install` 和 `pnpm check`；Web、API 与共享契约可独立构建。
- 2026-08-14：在 390px 宽度的浏览器中验证中文应用外壳、底部导航、主题切换与 API 连通状态。
- 2026-08-14：直接请求 `GET /health`，确认返回共享契约定义的健康响应。
