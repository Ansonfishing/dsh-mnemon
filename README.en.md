# dsh-mnemon

[简体中文](./README.md) | **English**

> **LLM-supervised 4-graph persistent memory for AI agents.**

`dsh-mnemon` is a local Mnemon memory plugin for DeepSeek Harness (DSH). It organizes always-available runtime memory, readable project Documents, and on-demand long-term Memory Spaces into a supervised, searchable, maintainable three-tier system.

Mnemon remains responsible for local SQLite storage, four relationship graphs, and deterministic retrieval. DSH owns prompt integration, lifecycle hooks, subagent orchestration, the WebUI, commands, and permission boundaries. Current user instructions and repository facts always take precedence over historical memory.

## Three memory tiers

| Tier | What belongs here | How it reaches context |
|---|---|---|
| Runtime Memory | User preferences, stable conventions, environment facts, frequently used lessons | `USER.md` / `MEMORY.md` are injected every turn |
| Project Documents | Designs, investigations, procedures, rationale, and handoffs | Deterministic search over active Documents first |
| Memory Spaces | Cross-session facts, decisions, entities, and relationships | Recalled on demand from active Memory Spaces |

```text
                       DSH Agent
                           |
             +-------------+-------------+
             |                           |
       every-turn context          search on demand
             |                           |
             v                           v
    +-----------------+       +---------------------+
    | Runtime Memory  | ----> | Active Documents    |
    | USER / MEMORY   |       | managed Markdown    |
    +-----------------+       +----------+----------+
                                         |
                                  deeper recall
                                         v
                              +---------------------+
                              | Mnemon Memory       |
                              | Spaces + four graphs|
                              +----------+----------+
                                         |
                                  cold reference
                                         v
                              +---------------------+
                              | Archived Documents  |
                              +---------------------+
```

## Highlights

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

Open “Settings -> Plugin Configuration -> Mnemon” to select a storage scope, then create or activate a Memory Space in the conversation's “Memory” tab. Configuration applies after restart. Changing the scope never migrates, merges, or deletes old data automatically.

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

The Web workspace contains Overview, Runtime, Documents, Recall, Entities, Distill, Content, and Status pages. Its main interface follows DSH's global Chinese/English locale.

Common commands:

```text
/mnemon status
/mnemon recall <query>
/mnemon related <full memory ID>
/mnemon remember <stable, self-contained durable insight>
/mnemon forget <full memory ID>
```

The recommended lookup order is: hot memory -> active Documents -> active Memory Spaces -> the cold archived original referenced by a hit. Do not persist temporary progress, raw logs, secrets, or ordinary facts that can be recovered directly from the repository.

## Documentation

- [Documentation hub](./docs/en/README.md)
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

BSD-3-Clause. The Mnemon name and logo belong to the upstream project and are used only to identify the integration.
