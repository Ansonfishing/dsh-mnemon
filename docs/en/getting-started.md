# Getting Started

[简体中文](../zh-CN/getting-started.md) | **English** | [Documentation Center](./README.md)

## 1. Prerequisites

You need:

- a DSH Web profile that can start successfully;
- a locally executable `mnemon` CLI;
- a DSH subagent provider available for bounded subtasks.

The exact provider requirements are:

```text
regular semantic operations
  -> prefer provider named "spawn"
  -> may fall back to another compatible provider

scored background review
  -> requires provider named "fork"
  -> inheritsParentContext = true

both paths require
  -> outputSchema
  -> toolFilter
  -> persona
  -> depthLimit
```

The plugin does not declare a fixed minimum-version matrix for DSH and Mnemon in its code. Before upgrading, run the verification steps on this page against an isolated data directory.

## 2. Install Mnemon

On macOS, the recommended installation method is Homebrew Cask:

```sh
brew install --cask mnemon-dev/tap/mnemon
```

On macOS or Linux, you can also install it with Go:

```sh
go install github.com/mnemon-dev/mnemon@latest
```

Verify the binary:

```sh
mnemon --version
```

To inspect an upstream Store directly, you can also run `mnemon status`. This command opens the effective Store and may initialize default data or run migrations; do not treat it as a completely side-effect-free installation probe.

If DSH cannot find it on `PATH`, set `MNEMON_CLI_PATH` or configure an absolute path in `mnemon.cliPath`.

## 3. Install the Plugin

Install it into the Web profile:

```sh
dsh plugin --profile web add "github:dsh-external/dsh-mnemon"
```

For a local development checkout:

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

The plugin package's `cordis.patch.yml` mounts the Host plugin; the Web client bundle registers the session workspace and plugin settings card.

## 4. Choose a Storage Scope

Start the DSH Web profile:

```sh
dsh --profile web
```

Under “Settings -> Plugin Configuration -> Mnemon,” choose:

| Scope | Root directory | Best suited for |
|---|---|---|
| `global` | `MNEMON_DATA_DIR` or `~/.mnemon` | Sharing one memory set across multiple workspaces |
| `workspace` | `.mnemon` under the DSH Host startup directory | Project isolation |
| `custom` | `dataDir` | An explicit disk, mounted volume, or dedicated data directory |

Settings are written to `$DSH_HOME/settings.yaml` and take effect after restarting DSH. Switching scopes does not move existing data; to preserve it, stop all writes first and manually copy the entire old root directory.

## 5. Create Your First Memory Space

Open the “Memory System” tab in any session:

1. Open the “Memory Spaces” page.
2. Create a narrowly scoped Memory Space, such as “Project Decisions.”
3. Its description should explain what belongs there and which tasks should recall it.
4. Enable its read toggle, or let the plugin activate it automatically after the first write.

An empty Memory Space may remain inactive by default. Activation controls only the read scope; writes may target any registered Memory Space, and a successful write automatically activates the target.

## 6. Verify the Complete Path

First inspect deterministic status:

```text
/mnemon status
```

Then submit a stable, self-contained item that will remain useful in the future on the “Distill” page. The worker selects a Memory Space, checks for duplicates, and returns a structured receipt. Then verify recall:

```text
/mnemon recall <a focused query that should match the new item>
```

Finally, check that:

- the “Memory Spaces” page shows the active Memory Space and graph;
- “Content” shows the new item and its Memory Space;
- CLI, runtime memory, Memory Space catalog, and subagent status are all healthy under “Status”;
- the recall result includes a complete `memoryBodyId` and memory ID.

## 7. Recommended First Real Conversation

Choose a question that genuinely depends on a historical decision instead of instructing the model to invoke memory tools unconditionally. The expected flow is:

```text
user asks a history-dependent question
  -> pre-step adds a short optional cue
  -> main Agent decides whether history matters
  -> recall worker selects active Memory Spaces
  -> only useful evidence returns to the main Agent
```

Ordinary conversation should not force recall. The current request, existing source files, and live tool results should take precedence over historical content.

## 8. Next Steps

- Read the [storage model](./storage-model.md) before choosing `storageScope`.
- Read the [configuration reference](./configuration.md) to configure read-only mode or disable lifecycle cues.
- Read the [operations guide](./operations.md) to establish backup and pre-upgrade verification procedures.
