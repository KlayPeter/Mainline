# Mainline 本地技术设计

**版本：V1.0**
**状态：本地 MVP 技术基线**
**运行方式：单机、本地服务、无账号、无云同步**

## 1. 设计目标

首版技术方案只服务一件事：让单个用户在本机可靠地完成 Mainline 的完整业务闭环。

系统必须满足：

- 数据不会因清理浏览器缓存而丢失；
- DeepSeek API Key 不暴露给浏览器；
- AI 不可用时基础业务仍可运行；
- AI 建议经过用户确认后才能写入正式数据；
- 奖励、经验、契约和记忆的变化可以追溯；
- 凭证图片只保存在本机，不发送给 AI；
- 可以完整备份和恢复 SQLite 数据及图片；
- 将来上线时可以迁移数据库和文件存储，但首版不为此引入分布式组件。

## 2. 非目标

首版不实现：

- 用户注册、登录和权限系统；
- PostgreSQL、MySQL、Redis 或消息队列；
- 云文件、对象存储和多端同步；
- Docker 和生产部署编排；
- 多模型自动路由；
- AI 图像识别；
- 实时协作、社交或多用户隔离；
- 大规模监控、复杂缓存和微服务。

## 3. 总体架构

```text
移动端优先 Web/PWA
        │
        │ HTTP / JSON
        ▼
本地 Node.js 服务
  ├─ 业务规则
  ├─ AI 提案编排
  ├─ 备份与恢复
  └─ 本地文件访问
        │
        ├──────────────► DeepSeek API
        │                  仅发送必要文字
        ▼
SQLite 数据库
        │
        └──────────────► 本地图片目录
```

### 3.1 推荐技术栈

- 前端：TypeScript、Vite、React；
- 本地服务：Node.js、TypeScript、Fastify 或 Hono；
- 数据库：SQLite；
- 数据访问：Drizzle ORM 或直接使用类型化 SQLite 驱动；
- 参数校验：Zod；
- 文件打包：ZIP；
- AI：DeepSeek Chat Completion API，模型 `deepseek-v4-flash`；
- 测试：Vitest，关键页面可增加 Playwright；
- PWA：Service Worker、Web App Manifest、浏览器通知。

具体库可以在实现时调整，但不能改变本地优先、单一事实来源和提案确认机制。

## 4. 本地目录

建议将运行数据放入项目外或 `.gitignore` 覆盖的本地目录：

```text
data/
├── mainline.sqlite
├── evidence/
│   └── 2026/08/<uuid>.<ext>
├── backups/
│   └── mainline-backup-<timestamp>.zip
└── logs/
    └── app.log
```

配置文件：

```text
.env
.env.example
```

`.env` 示例：

```dotenv
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
MAINLINE_PORT=4174
MAINLINE_DATA_DIR=./data
```

`.env`、数据库、图片、备份和日志不得提交到版本控制。

## 5. 数据原则

### 5.1 SQLite 是事实来源

任务、目标、经验、奖惩、复盘和记忆都以 SQLite 为准。浏览器的 LocalStorage 或 IndexedDB 只能保存：

- UI 偏好；
- 未提交表单草稿；
- 短期请求缓存；
- 当日载入状态。

浏览器缓存不得成为唯一业务数据。

### 5.2 AI 只产生提案

AI 返回 `proposal`，不能直接修改正式业务表。流程固定为：

```text
收集事实 → 调用 AI → 校验结构 → 保存提案 → 用户审阅
→ 用户确认 → 业务规则再次校验 → 在事务中应用
```

### 5.3 账本不可覆盖

经验、奖励刷新次数和契约变更使用追加式账本。界面可以显示汇总值，但系统不得直接覆盖历史。

### 5.4 时间保存

- 数据库存储 ISO 8601 时间或 Unix 毫秒；
- 同时保存用户时区 `Asia/Shanghai`；
- 任务时间段区分计划时间和实际时间；
- 日常任务实例按本地日期生成，避免跨日重复。

## 6. 核心表

表名使用小写复数，主键使用 UUID。所有正式业务表包含 `created_at` 和 `updated_at`。

### 6.1 用户上下文

#### `profile`

单行表，保存昵称、时区、当前人生状态引用、问卷状态和偏好版本。

#### `life_states`

- `id`
- `title`
- `description`
- `start_date`
- `expected_end_date`
- `actual_end_date`
- `status`

#### `domains`

初始化职业、学习、创作、健康、生活五条记录。字段包括代码、名称、排序和是否启用。

#### `fixed_schedules`

保存工作、通勤、睡眠、运动等重复时间段：星期、起止时间、生效日期、类型和是否可被排程占用。

### 6.2 章节和目标

#### `chapters`

- `domain_id`
- `title`
- `description`
- `success_criteria_json`
- `start_date`
- `expected_end_date`
- `actual_end_date`
- `status`

业务约束：同一领域最多一个 `active` 章节。

#### `goals`

- `chapter_id`
- `kind`：`main`、`side`
- `is_focus`
- `title`
- `motivation`
- `success_criteria_json`
- `deadline`
- `estimated_minutes`
- `status`

业务约束：同一领域最多一个进行中主线、两个进行中支线；全局最多两个当前焦点。

#### `goal_phases`

保存目标阶段、顺序、完成条件和状态。

#### `milestones`

保存章节或目标的里程碑、成功条件、目标日期、实际结果和状态。

### 6.3 任务和执行

#### `tasks`

关键字段：

- `goal_id`，允许为空；
- `title`、`description`；
- `affiliation`：`main`、`side`、`none`；
- `form`：`one_off`、`routine`、`challenge`、`event`；
- `day_priority`：`today_main`、`important`、`normal`；
- `status`；
- `requires_outcome`；
- `planned_date`、`planned_start_at`、`planned_end_at`；
- `deadline_at`、`estimated_minutes`；
- `completion_criteria_json`；
- `source`：`user`、`accepted_ai_proposal`；
- `contract_id`，允许为空。

业务约束：同一本地日期最多一个未结束的 `today_main`。

#### `task_steps`

保存步骤标题、排序、预计时长和完成状态。

#### `task_dependencies`

保存前置任务关系，禁止形成循环。

#### `routine_rules`

保存日常任务频率、生效区间、跳过规则和下次生成时间。

#### `task_sessions`

保存正计时或番茄计时的实际执行：开始、暂停、恢复、结束、实际分钟数和结束原因。

#### `interruptions`

保存关联任务、发生时间、类别、描述、影响和处理方式。“发生了什么”和执行中断共用该事实模型。

#### `task_resolutions`

保存未完成任务的改期、缩小、暂停、放弃或结束决定，以及决定前后的字段快照。

### 6.4 结果和成长

#### `outcomes`

- `task_id`
- `summary`
- `evidence_text`
- `self_rating`：`below`、`met`、`exceeded`
- `actual_minutes`
- `next_step`
- `ai_assessment_json`
- `confirmed_at`

#### `abilities`

保存能力线名称、说明、等级规则和是否启用。

#### `xp_ledger`

- `ability_id`，允许为空，空值代表通用经验；
- `amount`，首版只允许正数；
- `source_type`、`source_id`；
- `reason`；
- `rule_version`；
- `confirmed_at`。

总经验和能力经验均由账本求和或缓存汇总，不允许消费经验。

### 6.5 奖励和契约

#### `reward_pool`

保存用户批准的奖励：名称、类型、估计成本、预算类别、冷却时间、适用等级和状态。

#### `reward_offers`

保存 AI 选出的奖励候选、来源任务、刷新序号、状态和锁定时间。

#### `reroll_ledger`

保存改运次数变化：`amount`、来源、关联对象和时间。余额不得超过 3；经验账本与该表无关。

#### `contracts`

- `task_id`
- `completion_criteria_snapshot`
- `deadline_snapshot`
- `reward_offer_id`
- `penalty_type`
- `penalty_detail_json`
- `accepted_at`
- `started_at`
- `status`
- `fulfillment_due_at`

任务开始后锁定奖励和契约快照。

#### `contract_changes`

记录契约开始前的改期、前后内容、是否消耗免费次数和附加代价。默认每月 2 次免费改期。

#### `penalty_evidence`

保存契约引用、文件相对路径、原始文件名、MIME、哈希、文字说明和标记兑现时间。API 返回受控文件地址，不暴露任意本地路径。

### 6.6 复盘和记忆

#### `reviews`

保存每日或每周复盘周期、确定性统计快照、用户回答、AI 总结、用户确认结果和状态。

#### `memories`

- `category`
- `content`
- `source_type`、`source_id`
- `status`：`proposed`、`active`、`deleted`
- `last_confirmed_at`

用户可以编辑和软删除。AI 只能创建 `proposed` 记录。

### 6.7 AI 提案

#### `ai_requests`

记录请求类型、模型、上下文摘要、状态、耗时和错误。默认不记录 API Key，也不记录完整敏感提示词。

#### `ai_proposals`

保存请求引用、提案类型、结构化内容、解释、状态、用户修改内容和确认时间。

状态：`pending`、`accepted`、`rejected`、`expired`、`failed`。

## 7. 状态机

### 7.1 任务状态

```text
planned → in_progress → completed
   │           │
   │           ├→ paused → in_progress
   │           ├→ interrupted → in_progress
   │           └→ incomplete → pending_resolution
   │
   ├→ paused
   ├→ abandoned
   └→ closed

pending_resolution → rescheduled | paused | abandoned | closed
```

任务到期后由本地调度器或下一次启动检查，将未完成任务转入 `pending_resolution`。系统不得自动改到明天。

### 7.2 契约状态

```text
draft → accepted → locked
locked → succeeded | breached
breached → awaiting_fulfillment → fulfilled
```

用户开始任务时从 `accepted` 进入 `locked`。锁定后不能刷新或替换奖励。

### 7.3 提案状态

```text
pending → accepted | rejected | expired
```

接受提案时必须重新读取当前数据并校验冲突，避免用户审阅期间事实已经改变。

## 8. 业务服务

本地服务按业务能力拆分，不按数据库表堆控制器：

- `OnboardingService`：问卷、初始结构和偏好；
- `PlanningService`：任务创建、分类、拆解、排程和提案；
- `TodayService`：今日聚合、今日主线和待处理；
- `ExecutionService`：计时、暂停、中断和完成；
- `OutcomeService`：结果报告、AI 评估和结算；
- `GoalService`：章节、目标、阶段和里程碑；
- `GrowthService`：经验规则、能力线和成长记录；
- `ContractService`：奖励、刷新、契约、惩罚和凭证；
- `ReviewService`：每日/每周统计、AI 解释和调整提案；
- `MemoryService`：记忆提取、确认、编辑和删除；
- `BackupService`：数据导出、校验和恢复；
- `NotificationService`：本地通知计划。

## 9. AI 设计

### 9.1 模型配置

默认模型从环境变量读取：

```text
DEEPSEEK_MODEL=deepseek-v4-flash
```

AI Provider 封装统一接口，业务层不直接依赖 DeepSeek 请求格式。首版只配置一个 Provider，不做自动切换。

### 9.2 AI 使用场景

- 初始问卷结构化；
- 任务分类和解释；
- 目标拆解和时间规划；
- 超载风险说明；
- “发生了什么”事件分析；
- 结果报告评估；
- 奖励选择；
- 日常调整建议；
- 每日/每周复盘总结；
- 长期记忆草稿。

### 9.3 上下文最小化

每次请求只发送完成任务所需内容。例如任务规划只需要：相关目标、当天日程、固定时间、预计精力、任务输入和必要偏好。

禁止发送：

- `.env` 和 API Key；
- 惩罚凭证图片和本地文件路径；
- 与当前请求无关的完整历史；
- 未经用户同意的额外数据。

### 9.4 结构化输出

每个 AI 场景定义独立 JSON Schema。服务端必须：

1. 解析 JSON；
2. 使用 Zod 校验；
3. 检查枚举、时长、时间冲突和数值边界；
4. 将其保存为提案；
5. 返回给前端审阅。

解析失败时允许一次修复请求；再次失败则返回可理解的错误，不写业务数据。

### 9.5 确定性规则优先

以下内容由代码决定，AI 只能解释：

- 经验基础值和最大调整范围；
- 每领域目标数量上限；
- 今日主线任务数量；
- 改运次数余额和上限；
- 免费契约改期次数；
- 任务是否过期；
- 契约是否锁定；
- 惩罚兑现截止时间；
- 固定日程冲突和已安排总时长。

### 9.6 AI 降级

DeepSeek 请求失败时：

- 保留用户输入和未提交草稿；
- 提供重试；
- 允许用户手动填写所有字段；
- 使用确定性规则继续完成、结算、复盘和导出；
- 不自动换模型，也不假装生成了 AI 结果。

## 10. 经验规则

经验使用版本化规则配置，例如：

```text
普通任务：基础 10
重要任务：基础 20
今日主线：基础 30
里程碑：基础 50
```

具体数值可在调试阶段调整。重要原则：

- 普通任务不调用 AI 也能结算；
- 结果任务的 AI 调整范围必须受限，例如基础值的 0.8～1.3 倍；
- 能力线分配总和必须等于本次经验；
- 所有结算先预览，用户确认后写入；
- 同一任务只能正式结算一次；
- 经验永不用于刷新或消费。

## 11. 奖励刷新规则

生成奖励时创建 `reward_offer`：

1. AI 从批准的奖励池和预算内选择；
2. 第一次更换不扣改运次数；
3. 后续更换必须事务性扣除 1 次；
4. 用户接受后将候选标记为 `accepted`；
5. 任务开始后标记为 `locked`；
6. `locked` 状态拒绝刷新请求。

周复盘完成和重要里程碑结算可以增加改运次数，但余额最多为 3。

## 12. 本地 API

API 前缀建议为 `/api/v1`。首版主要接口：

### 12.1 系统

- `GET /health`
- `GET /bootstrap`
- `GET /settings`
- `PATCH /settings`

### 12.2 Onboarding

- `GET /onboarding`
- `PUT /onboarding/answers`
- `POST /onboarding/proposal`
- `POST /onboarding/confirm`

### 12.3 章节和目标

- `GET|POST /chapters`
- `GET|PATCH|DELETE /chapters/:id`
- `GET|POST /goals`
- `GET|PATCH|DELETE /goals/:id`
- `POST /goals/:id/breakdown-proposal`
- `POST /chapters/:id/close`

### 12.4 任务

- `GET|POST /tasks`
- `GET|PATCH|DELETE /tasks/:id`
- `POST /tasks/plan-proposal`
- `POST /tasks/:id/start`
- `POST /tasks/:id/pause`
- `POST /tasks/:id/resume`
- `POST /tasks/:id/complete`
- `POST /tasks/:id/outcome-proposal`
- `POST /tasks/:id/resolve`
- `POST /tasks/:id/interruptions`

### 12.5 今天

- `GET /today?date=YYYY-MM-DD`
- `PUT /today/main-task`
- `GET /today/pending-resolution`

### 12.6 提案

- `GET /proposals/:id`
- `POST /proposals/:id/accept`
- `POST /proposals/:id/reject`

### 12.7 奖励和契约

- `GET|POST|PATCH /reward-pool`
- `POST /rewards/generate`
- `POST /rewards/:id/reroll`
- `POST /contracts`
- `POST /contracts/:id/accept`
- `POST /contracts/:id/fulfill`
- `POST /contracts/:id/evidence`
- `GET /evidence/:id/file`

### 12.8 复盘、成长和记忆

- `GET|POST /reviews/daily`
- `GET|POST /reviews/weekly`
- `POST /reviews/:id/proposal`
- `GET /growth`
- `GET /xp-ledger`
- `GET|PATCH|DELETE /memories/:id`
- `POST /memories/:id/confirm`

### 12.9 数据

- `POST /backup/export`
- `POST /backup/validate`
- `POST /backup/restore`

## 13. 事务与幂等

以下操作必须在 SQLite 事务中完成：

- 接受 AI 提案并创建或修改多条业务数据；
- 完成任务并写入经验账本；
- 结算里程碑并增加改运次数；
- 刷新奖励并扣除改运次数；
- 契约违约和生成待兑现惩罚；
- 恢复备份。

完成、结算、刷新和接受提案接口应接收幂等键，防止重复点击产生双倍经验或重复扣除。

## 14. 文件安全

- 只允许 JPEG、PNG、WebP 等批准格式；
- 校验实际文件类型和大小，不只依赖扩展名；
- 使用 UUID 重命名；
- 数据库只保存相对路径；
- 文件读取接口按证据 ID 解析，禁止接受任意路径；
- 防止 `../` 路径穿越；
- 删除凭证时默认进入可恢复状态，最终清理由明确操作触发；
- 图片处理链路不进入 AI 服务。

## 15. 备份与恢复

导出流程：

1. 暂停写事务；
2. 使用 SQLite 安全备份方式生成一致性数据库副本；
3. 收集凭证图片；
4. 生成 `manifest.json`，记录版本、时间、文件哈希和数量；
5. 打包为 ZIP；
6. 写入本地备份目录，并允许浏览器下载。

恢复流程：

1. 上传或选择 ZIP；
2. 校验清单、版本、数据库完整性和文件哈希；
3. 展示将被替换的数据摘要；
4. 用户再次确认；
5. 自动备份当前数据；
6. 原子替换数据库和图片；
7. 重启或重新加载应用。

每周提醒备份。恢复属于破坏性操作，不能静默执行。

## 16. 通知

通知计划保存在数据库，由本地服务计算待提醒事项，前端/PWA负责请求权限和展示。

通知类型：任务开始前、今日主线未开始、临近期限、中断后未恢复、每日复盘、凭证到期和每周备份。

首版本地限制：浏览器或本地服务未运行时，通知可能无法准时出现。系统必须在通知设置页说明该限制，不能承诺类似原生 App 的后台可靠性。

## 17. 隐私与日志

- API Key 只从服务端环境读取，日志必须脱敏；
- 默认不记录完整 AI 输入和输出；
- 调试日志只记录请求类型、耗时、状态和错误摘要；
- 用户可清除 AI 请求历史；
- 凭证图片永不上传给 DeepSeek；
- 所有数据默认只保存在本机；
- 备份包包含个人数据，导出时提示用户妥善保存。

## 18. 测试重点

### 18.1 业务规则

- 每领域主线和支线数量限制；
- 同日只有一个今日主线任务；
- 过期任务进入待处理而非自动滚动；
- 普通任务与结果任务的不同结算路径；
- 经验不能为负或消费；
- 改运次数免费刷新、扣除和上限；
- 开始任务后禁止刷新奖励；
- 契约改期次数和过期惩罚；
- 凭证 24 小时期限；
- 日常任务跳过统计；
- AI 提案必须确认才能应用。

### 18.2 数据可靠性

- 重复完成不能重复发经验；
- 事务失败不留下半套任务或半次结算；
- 删除或修改目标不破坏历史结果；
- 备份后恢复的数据、图片和账本一致；
- 数据库迁移可以从旧版本可靠升级。

### 18.3 AI 边界

- 非法 JSON 和缺失字段；
- AI 给出不存在的目标 ID；
- 超出经验调整范围；
- AI 试图创建未批准奖励或危险惩罚；
- AI 请求超时、限流和断网；
- 提案审阅期间原任务被修改；
- 请求上下文不包含凭证图片或 API Key。

## 19. 迁移到线上时的边界

首版不实现线上能力，但保持以下可迁移性：

- 使用 UUID，避免依赖 SQLite 自增主键；
- 将文件存储封装为接口；
- 将 AI Provider 封装为接口；
- 业务规则不依赖浏览器存储；
- 数据库迁移脚本版本化；
- 本地单用户假设集中在身份上下文层。

未来上线时再引入账号、PostgreSQL、对象存储、同步冲突和后台任务。当前版本不提前实现这些组件。

## 20. 技术验收标准

本地技术方案通过以下验收：

1. 重启浏览器和本地服务后数据仍在。
2. 清理浏览器缓存不会删除核心业务数据。
3. 浏览器网络请求和构建产物中看不到 DeepSeek API Key。
4. AI 关闭后仍能手动创建、执行、完成和复盘。
5. AI 提案在确认前不会改变正式数据。
6. 同一完成请求重复发送不会重复发经验。
7. 任务开始后无法刷新奖励。
8. 凭证图片能本地保存和查看，且不会出现在 AI 请求中。
9. 完整备份可以在空环境中恢复数据库和图片。
10. 所有关键规则都有自动化测试。
