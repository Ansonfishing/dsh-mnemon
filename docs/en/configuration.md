# Configuration Reference

[简体中文](../zh-CN/configuration.md) | **English** | [Documentation Center](./README.md)

## Configuration Location and Activation

The plugin registers the `mnemon` namespace with the DSH settings service. User configuration is stored in:

```text
$DSH_HOME/settings.yaml
```

The default is commonly `~/.dsh/settings.yaml`. All current settings are marked `live`; after Save, the Host initializes a candidate runtime graph and then switches to it atomically.

The Web settings card edits `displayMode`, `storageScope`, and `dataDir`. Other advanced settings must be changed directly in YAML.

## Complete Example

```yaml
mnemon:
  displayMode: sidebar # sidebar | buildin
  storageScope: global # global | workspace | custom
  # dataDir: ~/mnemon-data       # required for custom
  # cliPath: /opt/homebrew/bin/mnemon
  # store: legacy-store          # compatibility discovery hint, not a regular routing target
  timeoutMs: 10000
  defaultRecallLimit: 10
  routingGuidance: true
  lifecycleEnabled: true
  recallMode: guided
  writebackMode: guided
  idleReviewMs: 30000
  tabEnabled: true
  writeEnabled: true
```

## Options

| Setting | Default | Range | Implementation Semantics |
|---|---:|---|---|
| `displayMode` | `sidebar` | `sidebar` / `buildin` | `sidebar` mounts the dedicated sidebar workbench; `buildin` restores the native DSH conversation-area tab; saving switches live and never mounts both entries together |
| `storageScope` | `global` | `global` / `workspace` / `custom` | Controls the root for Runtime, Documents, Memory Spaces, and reserved state as one unit |
| `dataDir` | unset | absolute path, `~`, or `~/...` | Required for `custom`; legacy configurations that set only this option automatically resolve to `custom` |
| `cliPath` | auto-discovered | executable path | Explicitly selects the Mnemon CLI |
| `store` | unset | `[A-Za-z0-9][A-Za-z0-9_-]*` | Compatibility discovery/preference hint for legacy Stores; semantic operations are routed through Memory Spaces |
| `timeoutMs` | `10000` | 100–120000 ms | Hard timeout for a single CLI call |
| `defaultRecallLimit` | `10` | 1–50 | Default recall count for the service and UI; individual entry points may impose a lower limit |
| `routingGuidance` | `true` | boolean | Whether to register an additional tiered-routing system section |
| `lifecycleEnabled` | `true` | boolean | Whether to enable the pre-step cue and score-based background review |
| `recallMode` | `guided` | `guided` / `off` | Whether to inject an on-demand recall cue; does not remove explicit recall |
| `writebackMode` | `guided` | `guided` / `off` | Whether to inject the hot-memory cue and enable score-based background review; does not remove explicit writes |
| `idleReviewMs` | `30000` | 5000–600000 ms | Required continuous idle time after the threshold is reached |
| `tabEnabled` | `true` | boolean | Whether to mount the Web entry selected by `displayMode`; Host RPC, commands, and Agent tools remain registered when off |
| `writeEnabled` | `true` | boolean | Whether to expose semantic write tools, write RPC, and write commands |
| `mnemon-ui.toolviews` | `false` | boolean | In-conversation memory tool cards for `mnemon_*` calls; off by default (opt-in), **applies live after saving** |
| `mnemon-ui.turnBar` | `false` | boolean | Turn-tail memory activity bar; off by default (opt-in), **applies live after saving** |
| `mnemon-ui.saveAction` | `false` | boolean | “Save to memory” action on finalized assistant replies; off by default (opt-in), **applies live after saving** |

Both the `mnemon` Host/storage namespace and the `mnemon-ui` browser-presentation namespace apply live. The storage root switches atomically only after the new runtime graph initializes successfully. Legacy `mnemon.conversationInteraction` values remain a migration default, but new saves write only to `mnemon-ui`.

## Storage Scopes

### `global`

```text
MNEMON_DATA_DIR when non-empty
  otherwise ~/.mnemon
```

Suitable for users who want Runtime, Documents, and Memory Spaces shared across multiple workspaces.

### `workspace`

```text
Agent / tool / lifecycle: resolve(currentSession.header.cwd, ".mnemon")
Web workbench inspection: resolve(workspaceRegistry.get(selectedWorkspaceId).path, ".mnemon")
```

Each DSH workspace owns an independent three-tier memory root. Agents, model tools, commands, and lifecycle hooks route by the current session cwd and are unaffected by the Web workbench's inspection target. The workbench can select only Host-registered workspaces, never an arbitrary path. When inspection and execution differ, the header shows both paths and offers one-click alignment with the current session. Agent-backed actions are rejected while misaligned to prevent writes to the wrong project.

### `custom`

```yaml
mnemon:
  storageScope: custom
  dataDir: /absolute/path/to/mnemon-data
```

`~` and `~/...` are also allowed. Relative paths are rejected.

## CLI Discovery Precedence

```text
config.cliPath
  -> executable MNEMON_CLI_PATH
  -> each PATH directory
  -> ~/.local/bin/mnemon
  -> /opt/homebrew/bin/mnemon
  -> /usr/local/bin/mnemon
  -> /usr/bin/mnemon
```

An explicit `cliPath` is accepted as configured; if it is not executable, actual calls return a launch error.

## Compatibility Store Hint Precedence

```text
config.store
  -> MNEMON_STORE
  -> <storageRoot>/active
  -> default
```

After the Memory Space directory has been established, long-term semantic operations use explicit Memory Space IDs and do not rely on the global active Store for routing.

## Provider Requirements

Regular workers prefer `spawn`. If no provider has that name, another provider with all of the following capabilities can be selected:

```text
outputSchema = true
toolFilter   = true
persona      = true
depthLimit   = true
```

Background review has no fallback: a compatible provider named `fork` must exist and must have:

```text
inheritsParentContext = true
```

A missing `fork` does not block deterministic state or regular UI reads, but a subagent failure is recorded when the review threshold is reached.

## Read-Only Configuration

```yaml
mnemon:
  writeEnabled: false
```

Effects:

- Model write tools are not registered;
- `/dsh-mnemon-write` RPC is not registered;
- `/mnemon remember` and `/mnemon forget` are rejected;
- semantic mutations through `MnemonService` are rejected.

This is feature-level read-only behavior, not a read-only filesystem mode: the Runtime controller may still initialize or repair projections, Document search updates LRU access times, and Mnemon read commands may trigger upstream database migrations. Do not treat `writeEnabled=false` as a safety guarantee for read-only mounts.

## Switch Interactions

```text
writeEnabled=false
  -> overrides all explicit semantic writes

writebackMode=off
  -> no write cue, no scored review
  -> explicit writes remain when writeEnabled=true

recallMode=off
  -> no recall cue
  -> explicit recall remains

lifecycleEnabled=false
  -> no lifecycle cues or review
  -> UI, commands, and explicit tools remain

routingGuidance=false
  -> removes only mnemon:routing
  -> runtime-memory prompt section remains
```

## Display Mode and the `tabEnabled` UI Switch

`displayMode=sidebar` (the default) mounts the “Memory System” sidebar entry and its dedicated center-column workbench. `displayMode=buildin` instead registers the original DSH `conversation.view` tab. Saving first disposes the active entry and then mounts the target, so the two modes never appear simultaneously.

`tabEnabled=false` removes the currently selected Web entry live. Host RPC, commands, and tools remain registered across display-mode and enablement changes so an Agent or command already in progress stays valid.

## Profile Patch Overrides

The bundled `cordis.patch.yml` provides the default config row. A DSH profile configuration with the same ID may replace that row as a whole. When customizing a patch, retain every key that must remain enabled instead of assuming a deep merge.

## Common Configurations

Workspace isolation:

```yaml
mnemon:
  storageScope: workspace
```

A custom data volume and a longer CLI timeout:

```yaml
mnemon:
  storageScope: custom
  dataDir: /Volumes/AgentData/mnemon
  timeoutMs: 30000
```

Keep explicit tools while disabling lifecycle behavior:

```yaml
mnemon:
  lifecycleEnabled: false
```

Disable only background writeback decisions:

```yaml
mnemon:
  writebackMode: off
```
