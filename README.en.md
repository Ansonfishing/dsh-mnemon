# dsh-mnemon

[简体中文](./README.md) | **English**

> **A deep integration of [Mnemon](https://github.com/mnemon-dev/mnemon) and DSH that gives DSH comprehensive memory capabilities.**

`dsh-mnemon` is a local Mnemon memory plugin for DeepSeek Harness (DSH). It organizes always-available runtime memory, readable project Documents, and on-demand long-term Memory Spaces into a supervised, searchable, maintainable three-tier system.

The plugin brings Mnemon's durable Memory Space capabilities into DSH and adds Runtime Memory, Documents, lifecycle integration, bounded subagents, the WebUI, commands, and permission boundaries. Current user instructions and repository facts always take precedence over historical memory.

> **What's more?** More DSH-native capabilities are on the way. **Memory to View.**

## Live demo

[![dsh-mnemon memory system walkthrough covering status, Runtime Memory, the multi-space graph, Documents, recall, entities, and supervised writeback](./docs/assets/dsh-mnemon-memory-system-demo-poster.jpg)](./docs/assets/dsh-mnemon-memory-system-demo.mp4)

**▶ [Watch the complete 77-second walkthrough](./docs/assets/dsh-mnemon-memory-system-demo.mp4)** — A real interaction with status, Runtime Memory, the live multi-space graph, Project Documents, graph-enhanced recall, entity aggregation, supervised writeback, and content maintenance.

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

[![Mnemon Memory Spaces page with the multi-space catalog, activation state, and live relationship graph](./docs/zh-CN/assets/screenshots/overview-memory-graph.png)](./docs/en/project-overview.md)

*Memory Space catalog, activation state, and live relationship graph. Select the image for the [complete project overview](./docs/en/project-overview.md).*

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
dsh plugin --profile web add "github:dsh-external/dsh-mnemon"
dsh --profile web
```

For a local checkout, use an absolute path:

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

Open “Settings -> Plugin Configuration -> Mnemon” to select a storage scope, then create or activate a Memory Space in the conversation's “Memory System” tab. Configuration applies after restart. Changing the scope never migrates, merges, or deletes old data automatically.

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

Common commands:

```text
/mnemon status
/mnemon recall <query>
/mnemon related <full memory ID>
/mnemon remember <stable, self-contained durable insight>
/mnemon forget <full memory ID>
```

The recommended lookup order is: hot memory -> active Documents -> active Memory Spaces -> the archived original referenced by a hit. Do not persist temporary progress, raw logs, secrets, or ordinary facts that can be recovered directly from the repository.

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

MIT.
