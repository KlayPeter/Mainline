# Mainline

一个本地优先、移动端优先的人生任务系统：帮助用户看清今天真正重要的一步，并把目标、任务、复盘、奖励与长期成长沉淀在自己的本机。

## 当前状态

- 已完成：本地 Web/API 工程、全中文移动端外壳、SQLite 本地数据库与迁移基础。
- 开发中：Today、任务 CRUD 与普通任务完成。
- 暂不包含：账号、云同步、线上部署与原生 App。

## 本地运行

需要 Node.js 22+ 和 pnpm 10+。

```bash
pnpm install
pnpm dev
```

- Web：`http://127.0.0.1:5173`
- API：`http://127.0.0.1:4174`
- 本地数据默认保存至 `data/mainline.sqlite`，不会提交到 Git。

## 验证

```bash
pnpm check
```

产品定义、范围和实现故事位于 [docs](./docs/README.md)。
