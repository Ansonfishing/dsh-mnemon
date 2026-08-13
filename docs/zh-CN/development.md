# 开发与验证

**简体中文** | [English](../en/development.md) | [文档中心](./README.md)

## 环境

仓库没有在 `package.json` 中声明 Node、pnpm、DSH 或 Mnemon 的最低版本。使用当前 DSH 开发环境，并在升级依赖时通过完整验证链路确认兼容性。

安装依赖：

```sh
pnpm install
```

## 标准命令

```sh
pnpm run typecheck  # tsc --noEmit
pnpm test           # vitest run
pnpm run build      # declarations + host/client bundles
pnpm run verify     # typecheck + test + build
```

## 目录结构

```text
src/
+-- index.ts                  # Host composition root
+-- config.ts                 # settings schema
+-- process.ts / runner.ts    # local CLI execution
+-- service.ts                # durable-memory facade
+-- memory-bodies.ts          # Memory Space registry
+-- runtime-memory.ts         # hot-memory authority
+-- documents.ts              # managed Documents
+-- subagent.ts               # bounded workers
+-- lifecycle.ts              # root-Agent hooks
+-- review-activity.ts        # activity score
+-- tools.ts / commands.ts    # model and human interfaces
+-- rpc.ts / settings.ts      # Web bridges
+-- storage-scope.ts          # storage inventory
+-- client/                   # React workspace and locales
tests/                        # Vitest suites
lib/                          # committed build artifacts
docs/zh-CN/                   # Chinese documentation
docs/en/                      # English mirror
cordis.patch.yml              # DSH profile bundle patch
```

## 构建产物

```text
tsc -p tsconfig.build.json
  -> lib/types/*              declarations, maps, intermediate ESM

tsdown host bundle
  -> lib/index.js             Node ES2024 ESM

tsdown client bundle
  -> lib/client.js            DSH browser module wrapper
  -> lib/client.js.map

lightningcss plugin
  -> CSS Modules compiled and injected as scoped <style>
```

Host 保持 `cordis` 和 `schemastery` external。Client 保持 React、ReactDOM、JSX runtime 和 Cordis external，其余依赖打入 bundle。

`lib/` 是发布输入的一部分。修改 `src/` 后必须重新构建并检查生成 diff；不要手工编辑 `lib/`。

## 测试层次

现有 Vitest 套件覆盖：

- 配置解析、CLI 查找、进程串行；
- Memory Space 发现、激活、路由与合并；
- recall payload 兼容和图谱解析；
- Runtime JSON/Markdown 一致性、锁、容量、UTF-8 和 revision；
- Documents 路径、frontmatter、搜索、LRU、归档与冲突；
- worker 工具隔离、schema 子集、结构化回执；
- 生命周期 cue、评分、idle debounce、取消和水位保留；
- RPC authority、只读行为和设置 revision；
- Web 工作台、双语文案和关键交互。

这些主要是临时目录、fake runner 和 mock Host 集成测试，不等同于自动化的真实 DSH + Mnemon WebUI E2E。

## 真实 WebUI 验证

发布前使用隔离环境，避免污染个人记忆：

```text
temporary DSH_HOME
temporary MNEMON_DATA_DIR or custom storageScope
temporary workspace
independent Web port
local link installation
```

建议场景：

1. 空根：UI 不报错，能够创建第一个 Memory Space。
2. 普通对话：只出现短 cue，不强制 recall 或写入。
3. 历史问题：Agent 自主 recall，并返回正确 space provenance。
4. 显式沉淀：worker 查重、选择范围并可被再次召回。
5. 多空间：读取只覆盖 active，写入 inactive 后自动激活。
6. Runtime：USER / MEMORY add、replace、remove 和投影一致。
7. Documents：创建、检索、更新、人工归档和原项目文件不变。
8. 评分审查：轻任务不触发；达标后等待 idle；新 turn 能取消并保留水位。
9. 只读：写工具、写命令和写 RPC 被拒绝，读取仍可用。
10. 状态和浏览器控制台：无未处理错误或警告。

容量极限、CLI 超时、revision 冲突和 Host 重启应在专用故障注入环境验证。

## 修改 subagent schema

DSH structured output 只支持一个紧凑 JSON Schema 子集：

```text
type, oneOf, properties, required, additionalProperties,
items, enum, const, and annotation keywords
```

不要加入 `maxItems` 等不受支持关键字。`assertDshOutputSchema()` 会在启动 worker 前递归拒绝未知 schema 键；结果数量等限制由 persona 和 Host parser 双重实现。

## 修改存储格式

Runtime、Documents 和 Memory Space registry 都带版本字段或固定结构。修改时需要：

1. 明确旧格式解析策略；
2. 增加迁移或拒绝路径；
3. 保证临时文件与原子 rename；
4. 补充并发和损坏输入测试；
5. 更新中英文存储、运维和 Roadmap 文档；
6. 在复制的数据根上完成升级/回退验证。

当前没有正式 schema migration 框架，不应静默改变持久格式。

## 文档国际化维护

`docs/zh-CN` 与 `docs/en` 应保持同名文件和相同章节职责。修改默认值、流程或限制时：

- 同步两种语言；
- 保持命令、配置键、路径和代码符号完全一致；
- 使用相对路径互链对应语言页面；
- 架构总览优先使用可访问、无脚本和无外部资源的 SVG；目录树、命令、公式与短协议仍使用可复制的 `text` / ASCII；
- 根 README 只保留摘要，把细节放到单一权威 docs 页面。

Web locale 变更时，中文键集合仍是类型事实源；英文词典必须满足 `Record<MnemonKey, string>`，并保持占位符一致。

## 发布检查

```text
[ ] pnpm run verify
[ ] review source and generated lib diffs
[ ] validate package file list includes README.en.md and docs
[ ] install the built/local bundle into an isolated Web profile
[ ] run real Mnemon CLI and WebUI smoke tests
[ ] verify Chinese and English workspaces
[ ] verify global/workspace/custom paths as applicable
[ ] record tested DSH and Mnemon versions
[ ] back up any data root used for upgrade testing
```

`package.json.files` 当前发布 `lib`、patch、两份根 README、双语公开 docs 和 License；历史研究台账不进入安装包。
