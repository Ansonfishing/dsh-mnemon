<h1 align="center">dsh-mnemon</h1>

<p align="center"><strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a></p>

<p align="center">
  <a href="https://github.com/omdsh-dev/dsh-mnemon/blob/main/docs/en/ui-guide.md">
    <img src="https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/media/dsh-mnemon-memory-system-demo-poster.jpg" alt="dsh-mnemon Sidebar Memory System with Memory Space catalog and relationship graph" width="760">
  </a>
</p>

<p align="center"><strong>Local, layered, supervised memory for DeepSeek Harness—with cross-agent sharing through Mnemon.</strong></p>

`dsh-mnemon` integrates [Mnemon](https://github.com/mnemon-dev/mnemon) with DeepSeek Harness (DSH). It brings hot memory needed every turn, full project Documents, and on-demand long-term Memory Spaces into one workbench. The third tier is provider-backed: Mnemon Native remains the official, prioritized engine, while OpenViking, Honcho, Mem0, Hindsight, Holographic, RetainDB, ByteRover, and Supermemory can enter the same Memory Space workflow.

- **Local-first default**: Mnemon Native keeps memory in local SQLite, JSON, and Markdown; every third-party engine is an explicit opt-in.
- **Replaceable long-term tier**: choose among nine engines without changing the Runtime, Documents, Memory Space, or Agent-tool mental model.
- **Explainable smart placement**: keep manual engine selection or let hard rules plus a strategy prompt guide an isolated subagent among eligible providers; the reason and confidence are retained.
- **Three cooperating tiers**: Runtime Memory, Project Documents, and Memory Spaces retain information at the right granularity.
- **Supervised writes**: isolated memory subagents make semantic decisions; the Host enforces paths, permissions, capacity, locks, and revisions.
- **Web and Headless**: a complete Sidebar workbench for interactive management, plus the same Agent tools, memory context, and cwd routing in one-shot Headless tasks.

Current user instructions, repository files, and live tool results always take precedence over historical memory.

## Live demo

![dsh-mnemon Sidebar Memory System and in-conversation interaction demo](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/media/dsh-mnemon-memory-system-demo.gif)

See the [Sidebar and conversation UI guide](./docs/en/ui-guide.md) for the complete visual walkthrough.

## Start in five minutes

### 1. Install Mnemon

```sh
# macOS
brew install --cask mnemon-dev/tap/mnemon

# macOS / Linux via Go
go install github.com/mnemon-dev/mnemon@latest

mnemon --version
```

On Windows, install the official v0.2.3-or-newer release ZIP. This path is auto-discovered without changing `PATH`; see [Getting Started](./docs/en/getting-started.md#2-install-mnemon) for checksum verification:

```powershell
$version = '0.2.3'
$arch = if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture -eq 'Arm64') { 'arm64' } else { 'amd64' }
$archiveName = "mnemon_${version}_windows_${arch}.zip"
$archive = Join-Path $env:TEMP $archiveName
Invoke-WebRequest "https://github.com/mnemon-dev/mnemon/releases/download/v${version}/${archiveName}" -OutFile $archive
$installDir = Join-Path $env:LOCALAPPDATA 'Programs\mnemon'
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Expand-Archive -Path $archive -DestinationPath $installDir -Force
& (Join-Path $installDir 'mnemon.exe') --version
```

### 2. Install the plugin

For the complete Web workbench:

```sh
dsh plugin --profile web add dsh-mnemon
dsh --profile web
```

DSH profiles have independent plugin rosters. Install it separately for one-shot Headless tasks:

```sh
dsh plugin --profile headless add dsh-mnemon
dsh --profile headless "Check durable project context before answering this task."
```

Use an absolute path for a local development checkout:

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
dsh plugin --profile headless add "link:/absolute/path/to/dsh-mnemon"
```

### 3. Open Memory System

New installations use `sidebar` by default. Click **Memory System** in the DSH sidebar, then follow this first-run path:

1. Confirm the Mnemon CLI, Runtime, Memory Spaces, and Documents are healthy under **Status**.
2. Create a narrowly scoped Memory Space under **Memory Spaces → Overview**; either choose the engine manually or guide smart selection with rules and a strategy prompt.
3. Submit one stable, future-useful item through **Remember**.
4. Verify it with a focused question under **Recall**.
5. Return to the conversation and expand **Turn memory** below the answer.

See [Getting Started](./docs/en/getting-started.md) for provider requirements and complete verification.

Headless has no workbench or conversation buttons. It still mounts Runtime context, Documents, Memory Space tools, lifecycle guidance, and supervised writes. With `storageScope=workspace`, its memory root follows the invocation directory. Because the process exits as soon as the one-shot Agent becomes idle, delayed background review is cancelled at shutdown; explicit or model-guided writes completed during the task remain durable.

## One workbench, three memory tiers

| Tier | Best for | How it reaches context |
|---|---|---|
| **Runtime** | User preferences, collaboration rules, project conventions, environment facts | Compact `USER.md` / `MEMORY.md` projections on every turn |
| **Documents** | Designs, investigations, procedures, postmortems, and handoffs | Deterministic search of active Documents, then full text on demand |
| **Memory Spaces** | Cross-session facts, decisions, entities, and relations | Bounded evidence recalled on demand from active spaces only |

The tiers are not simple copies of the same content. Knowledge is routed by frequency, narrative length, and retrieval needs. See [Storage and the three-tier model](./docs/en/storage-model.md).

### Share long-term memory with other agents

Cross-agent sharing applies to the **Memory Spaces** backed by Mnemon. Another Mnemon-enabled agent can recall from or contribute to the same durable facts, entities, and relations when it targets the same `storageRoot` and Store. DSH-managed Runtime Memory and Project Documents are not automatically exposed to other agents.

The default `global` scope uses `~/.mnemon`, making it the simplest shared memory root for local agents. `custom` and `workspace` roots can also be shared, but every participant must align its directory explicitly. A shared root is shared data: establish a trust boundary first, and avoid incompatible offline migration or directory operations while another process is using it.

Third-party spaces follow their provider's own scope—such as an OpenViking URI, Honcho workspace and peers, Hindsight bank, or Supermemory container. See the [provider guide](./docs/en/memory-providers.md) for the capability and connection matrix.

## Sidebar workbench

| Page | Main purpose |
|---|---|
| **Status** | Inspect connection, storage root, tier summaries, and Mnemon / dsh-mnemon versions |
| **Runtime** | Inspect USER / MEMORY capacity; filter, add, edit, or remove hot memory |
| **Memory Spaces** | Manage activation; switch among Overview, Recall, Content, and Entities; open Remember |
| **Documents** | Search, read, create, edit, and archive managed Markdown documents |

Add and edit use consistent dialogs, destructive actions require confirmation, long collections expose filters and progressive loading, and Documents use a dedicated reader.

### Memory inside conversations

| Turn memory | Save to memory |
|---|---|
| [![Expanded Turn memory with exact tool links](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/screenshots/conversation-turn-memory.png)](https://github.com/omdsh-dev/dsh-mnemon/blob/main/docs/assets/screenshots/conversation-turn-memory.png) | [![Confirm save to memory dialog](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/screenshots/conversation-save-dialog.png)](https://github.com/omdsh-dev/dsh-mnemon/blob/main/docs/assets/screenshots/conversation-save-dialog.png) |

- **Turn memory** summarizes recalls, writes, and Document searches for the turn; expand it to jump to the matching page.
- **Save to memory** loads an editable candidate. Only confirmation sends it to the memory subagent for qualification, deduplication, distillation, and writing.

Both are on by default. Disable them independently under **Settings → Memory System → Conversation interface**; saved changes apply live.

## Display and storage

Configuration lives in `$DSH_HOME/settings.yaml` (commonly `~/.dsh/settings.yaml`):

```yaml
mnemon:
  displayMode: sidebar # sidebar | buildin; sidebar by default
  storageScope: global # global | workspace | custom
```

| Choice | Behavior |
|---|---|
| `sidebar` | Default dedicated workbench aligned with official DSH panel styling |
| `buildin` | Preserves the original conversation-area presentation and visuals |
| `global` | Shares `~/.mnemon` (or `MNEMON_DATA_DIR`) across workspaces |
| `workspace` | Uses `<workspace>/.mnemon`; the workbench may inspect another workspace while the Agent still follows the current session |
| `custom` | Uses an absolute or `~/...` path supplied through `dataDir` |

Saved settings apply live without a manual refresh. Changing scope never migrates, merges, or deletes old data. If the inspected workspace differs from the session's effective workspace, the header explains the mismatch and offers one-click alignment.

## Common commands

```text
/mnemon status
/mnemon recall <query>
/mnemon related <full memory ID>
/mnemon remember <stable, self-contained durable insight>
/mnemon forget <full memory ID>
```

Recommended lookup order: Runtime Memory → active Documents → active Memory Spaces → archived original referenced by a hit.

## Data and security boundaries

- Mnemon Native uses the local `mnemon` CLI. External HTTP providers and the ByteRover CLI are called only through the Host; the WebUI neither reads stores nor calls providers directly.
- CLI calls use argument arrays with shell disabled, bounded output, timeouts, and cancellation.
- Provider credentials are stored mode `0600` in `<storageRoot>/state/memory-providers.json`, are never returned to the browser or placement subagent, and are excluded from Mnemon Pack exports. Subagent inference still uses the model provider configured in DSH.
- There is no deterministic secret scanner yet. Never store keys, tokens, private keys, or raw sensitive logs in any tier.
- Uninstalling the plugin does not remove data under `~/.mnemon`, workspace `.mnemon` roots, or custom directories.

See [Operations, security, and troubleshooting](./docs/en/operations.md) for complete boundaries, backup, recovery, and diagnostics.

## Documentation

| I want to… | Start here |
|---|---|
| Install and complete first-run verification | [Getting Started](./docs/en/getting-started.md) |
| Learn every page and conversation entry | [Sidebar and conversation UI guide](./docs/en/ui-guide.md) |
| Understand the three tiers and complete flow | [Project overview](./docs/en/project-overview.md) · [Lifecycle and workflows](./docs/en/workflows.md) |
| Choose or configure a long-term memory provider | [Long-term memory providers](./docs/en/memory-providers.md) |
| Choose storage scope or advanced switches | [Configuration reference](./docs/en/configuration.md) |
| Back up, update, or troubleshoot | [Operations, security, and troubleshooting](./docs/en/operations.md) |
| Integrate tools, commands, or RPC | [Interface reference](./docs/en/interfaces.md) |
| Develop, test, or publish | [Development and verification](./docs/en/development.md) |

See the [documentation hub](./docs/en/README.md) for the full map.

## Development

```sh
pnpm install
pnpm run verify
```

`verify` runs TypeScript checks, Vitest, a reproducible double build, an isolated real Headless-profile activation check, and published-package validation. `lib/` is generated and intentionally not tracked.

## License

MIT. Report security issues privately through [SECURITY.md](./SECURITY.md), not a public issue.
