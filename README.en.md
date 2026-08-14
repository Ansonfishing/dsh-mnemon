<h1 align="center">dsh-mnemon</h1>

<p align="center"><a href="./README.md">简体中文</a> | <strong>English</strong></p>

<p align="center">
  <a href="./docs/en/project-overview.md">
    <img src="./docs/assets/dsh-mnemon-memory-system-demo-poster.jpg" alt="Mnemon Memory Spaces page with the multi-space catalog, activation state, and live relationship graph" width="720">
  </a>
</p>

> **A deep integration of [Mnemon](https://github.com/mnemon-dev/mnemon) and DSH that gives DSH comprehensive memory capabilities.**

`dsh-mnemon` is a local Mnemon memory plugin for DeepSeek Harness (DSH). It organizes always-available runtime memory, readable project Documents, and on-demand long-term Memory Spaces into a supervised, searchable, maintainable three-tier system.

The plugin brings Mnemon's durable Memory Space capabilities into DSH and adds Runtime Memory, Documents, lifecycle integration, bounded subagents, the WebUI, commands, and permission boundaries. Current user instructions and repository facts always take precedence over historical memory.

> **What's more?** More DSH-native capabilities are on the way. **Memory to View.**

## Live demo

![dsh-mnemon memory system walkthrough covering status, Runtime Memory, the multi-space graph, Documents, recall, entities, and supervised writeback](./docs/assets/dsh-mnemon-memory-system-demo.gif)

## Three memory tiers

| Tier | What belongs here | How it is retained | How it reaches context |
|---|---|---|---|
| Runtime Memory | User preferences, stable conventions, environment facts, frequently used lessons | Explicit operations or an eligible background review update `memories.json`, then generate `USER.md` / `MEMORY.md` projections | Injected directly every turn |
| Project Documents | Designs, investigations, procedures, rationale, and handoffs | Create or update managed Markdown and `index.json`; capacity maintenance creates a Mnemon cold reference before moving the original | Search active Documents first, then read full text on demand |
| Memory Spaces | Cross-session facts, decisions, entities, and relationships | A bounded `spawn` worker selects the narrowest space, checks duplicates, and writes four-graph memory through Mnemon `remember` / `link` | Recalled on demand from active Memory Spaces only |

```text
Reusable knowledge produced by current work
          |
          +-- Compact, stable, useful every turn
          |      root Agent / eligible fork review
          |                 |
          |      add | replace | remove
          |                 v
          |      memories.json (source of truth)
          |                 |
          |      USER.md + MEMORY.md ----------> every prompt
          |
          +-- Complete designs, research, procedures, handoffs
          |      root Agent / eligible fork review
          |                 |
          |          create | update
          |                 v
          |      index.json + active/*.md ------> full text after search
          |                 |
          |      Mnemon cold reference -> archived/*.md (maintenance)
          |
          `-- Cross-session facts, decisions, entities, relations
                    root Agent
                       |
              spawn: route / deduplicate / write
                       v
              Mnemon CLI -> <space>/mnemon.db
                       |
              spawn: recall active spaces only -> bounded evidence
```

## Highlights

- Proactive memory routing: built-in prompts, lifecycle cues, and tool descriptions encourage the LLM to use every read/write surface when useful; explicit requests to revisit, retain, correct, forget, or document are routed to the matching tier and operation.
- One `global`, `workspace`, or `custom` storage scope for all three tiers.
- A Memory Space directory in which each space has a stable ID, name, routing description, activation state, and its own `mnemon.db`.
- Bounded subagents: isolated `spawn` workers handle durable recall and semantic writes; a `fork` worker inherits a completed checkpoint for background review.
- Safe capacity maintenance: USER memory is compacted locally, MEMORY entries are archived before compaction, and Documents are cold-indexed before migration; revision conflicts preserve the original data.
- Native DSH integration through model tools, `/mnemon` commands, a bilingual Web workspace, global light/dark themes, and diagnostics.
- Local-first execution: the CLI is started with argument arrays and no shell, and no remote memory service is required.

## Prerequisites

- A working DSH Web profile.
- A local `mnemon` CLI.
- A subagent provider supporting `outputSchema`, `toolFilter`, `persona`, and `depthLimit`. Regular semantic work prefers `spawn`; the default background review also requires a provider named `fork` that inherits parent context.

**Compatibility baseline**: `dsh-mnemon` 0.1.0 has been verified end-to-end on a live web profile running `@deepseek-ai/dsh` 0.1.0-rc.6 (2026-08-13 snapshot); last verified 2026-08-14. The plugin declares no fixed minimum-version matrix. DSH moves fast: before upgrading, re-run the [Getting Started](./docs/en/getting-started.md) verification steps in an isolated profile or a backed-up data directory.

## Quick start

Install Mnemon:

```sh
# macOS
brew install --cask mnemon-dev/tap/mnemon

# macOS / Linux via Go
go install github.com/mnemon-dev/mnemon@latest

mnemon --version
```

Install the plugin and restart the DSH Web profile:

```sh
dsh plugin --profile web add dsh-mnemon
dsh --profile web
```

Pre-release builds not yet published to npm can be installed from git:

```sh
dsh plugin --profile web add "github:omdsh-dev/dsh-mnemon"
```

For a local checkout, use an absolute path:

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

Open the dedicated “Settings -> Memory System” page to select a storage scope, then create or activate a Memory Space in the conversation's “Memory System” tab. Storage settings apply after restart; conversation presentation applies live after saving. Changing the scope never migrates, merges, or deletes old data automatically.

Upgrade and uninstall (`dsh plugin` forwards to pnpm inside the profile directory):

```sh
# Upgrade
dsh plugin --profile web update dsh-mnemon

# Uninstall (also removes its bundle registration from the profile)
dsh plugin --profile web remove dsh-mnemon
```

Uninstalling never deletes memory data: `global` data stays in `~/.mnemon`, and `workspace` / `custom` data stays in their directories, so reinstalling picks up where you left off. To pause automatic reads/writes without uninstalling, turn off `writebackMode` / `recallMode` / `lifecycleEnabled` in the plugin configuration (see the [configuration reference](./docs/en/configuration.md) for toggle interactions and the current `tabEnabled` limitation).

## Minimal configuration

Configuration lives in `$DSH_HOME/settings.yaml` (commonly `~/.dsh/settings.yaml` by default):

```yaml
mnemon:
  storageScope: global # global | workspace | custom
```

- `global`: `MNEMON_DATA_DIR`, or `~/.mnemon` when unset.
- `workspace`: `.mnemon` under the DSH Host launch directory.
- `custom`: an absolute or `~/...` path supplied through `dataDir`.

See the [configuration reference](./docs/en/configuration.md) for every option, precedence rules, and read-only mode.

## Entry points

The Web workspace contains Status, Runtime, Memory Spaces, Documents, Distill, Recall, Entities, and Content pages in three divider-separated groups: “Status” stands alone; “Runtime, Memory Spaces, Documents” cover the three storage tiers; “Distill, Recall, Entities, Content” are the read/write tools. Its main interface follows DSH's global Chinese/English locale.

Memory also surfaces inside the conversation flow (conversation interface, **off by default**; enable each surface under Settings → Memory System → Conversation interface — changes apply live on save):

- **Memory tool cards**: every `mnemon_*` tool call renders as a memory-flavoured card — recalls show the query and hit count, writes show the subject summary — expandable to the raw arguments and structured result, with a one-click jump to the matching Memory view page;
- **Turn memory bar**: completed calls are separated into successful recalls, writes, document searches, and inspections, with failures reported independently; expand it for the exact tool names;
- **Save to memory**: every finalized assistant reply carries a “Save to memory” action; the candidate is editable, and submission routes through the isolated memory subagent (judgment, dedupe, distillation) without filling the main conversation context.

Common commands:

```text
/mnemon status
/mnemon recall <query>
/mnemon related <full memory ID>
/mnemon remember <stable, self-contained durable insight>
/mnemon forget <full memory ID>
```

The recommended lookup order is: hot memory -> active Documents -> active Memory Spaces -> the archived original referenced by a hit. Do not persist temporary progress, raw logs, secrets, or ordinary facts that can be recovered directly from the repository.

## Permissions & data

- **Files**: reads/writes data directories through the local `mnemon` CLI — `~/.mnemon` for the `global` scope, a user-chosen directory for `workspace` / `custom`. The plugin never writes those directories directly, and the WebUI never reads SQLite directly. `sourcePaths` cannot escape the originating session workspace or point into the managed Documents directory.
- **Processes**: `mnemon` is started as an argument array with shell disabled, bounded output, and `SIGTERM` then `SIGKILL` on timeout.
- **Network**: the plugin and Mnemon both run locally and make no remote calls; subagent model inference uses DSH's existing provider connection.
- **Credentials**: the plugin stores and reads no credentials or API keys; model credentials are fully managed by DSH and your provider.
- **User data**: all memory content (user profile, project Documents, long-term memory) stays in local SQLite / JSON and is never uploaded.
- **Honest disclosure**: there is no deterministic credential/secret scanner yet — do not write keys, tokens, or private keys into hot memory, Documents, or Memory Spaces. For the full boundaries (process/file/Web/model) and backup/restore, see [Operations, security, and troubleshooting](./docs/en/operations.md).

## Documentation

- [Documentation hub](./docs/en/README.md)
- [Project overview](./docs/en/project-overview.md)
- [Getting started](./docs/en/getting-started.md)
- [Architecture](./docs/en/architecture.md)
- [Storage and three-tier memory model](./docs/en/storage-model.md)
- [Lifecycle and workflows](./docs/en/workflows.md)
- [Configuration reference](./docs/en/configuration.md)
- [WebUI, tools, commands, and RPC](./docs/en/interfaces.md)
- [Operations, security, and troubleshooting](./docs/en/operations.md)
- [Development and verification](./docs/en/development.md)
- [Roadmap](./docs/en/roadmap.md)

## Development

```sh
pnpm install
pnpm run verify
```

`verify` runs TypeScript checks, Vitest, and the production build. Generated artifacts are written to and committed under `lib/`. See the [development guide](./docs/en/development.md) for release and real-WebUI validation procedures.

## License

MIT. For security issues, please report privately through the channels in [SECURITY.md](./SECURITY.md) instead of opening a public issue.
