# WebUI, Tools, Commands, and RPC

[简体中文](../zh-CN/interfaces.md) | **English** | [Documentation Center](./README.md)

## Web Workspace

`displayMode=sidebar` (the default) opens a dedicated workbench from the sidebar, while `displayMode=buildin` opens the same functional interface through the original DSH `conversation.view` tab. The settings page switches the two modes live and never mounts both simultaneously. Both modes share all functionality, data requests, and workspace state while using isolated appearance definitions. The sidebar entry, workbench title, functional copy, and date formatting subscribe to DSH's global locale and update immediately; the interface also follows the global light/dark theme.

Sidebar uses a minimal skin aligned with official DSH panels: its title is “Memory System,” and it omits the Mnemon logo, header telemetry, and navigation decoration. From the first frame after the title it shows the storage-location mode, the inspection-workspace selector when that mode is Workspace, and a one-click alignment module only when the inspected target differs from the conversation's effective workspace; the status on the right simply says “Connected” and remains visible at compact widths. Its primary tabs are Status, Runtime, Memory Spaces, and Documents. Memory Spaces retains its title and purpose statement above the Overview, Recall, Content, and Entities secondary tabs, with Remember as the primary heading action. Runtime, Memory Spaces, and Documents share one structure — add on the right of the heading, then inspect or search below — and every add or edit flow opens a DSH-style modal. Modal focus stays inside the dialog and returns to the trigger after close. Directory cards pin activation to the top right, place edit and delete in a stable footer, and open a separate destructive confirmation before physical deletion. The Remember modal starts with only the candidate field and optionally expands advanced constraints. Status, Runtime, Memory Spaces, and Documents pin their primary headings to a constant canvas coordinate with no pre-stick settling distance; the Overview, Recall, Content, and Entities content headings are not locked and scroll normally within Memory Spaces. Recall and related results, entity entries, entity memories, and content lists mount in batches with visible/total counters and “show more” controls. Sidebar Runtime is one USER / MEMORY list with visibly chip-shaped labels plus scope and content filters. The Document directory is progressive; desktop Markdown uses an independent reader that resets on selection, while mobile keeps natural page scrolling. Switching the inspected workspace or saving a core setting unmounts the prior page subtree before the new request, clearing cards, filters, dialogs, and scroll state, then reloads the active page automatically without a manual refresh. Primary actions use solid blue, edit uses blue outlines, remove/delete/archive use the red destructive tier, view/related/copy actions remain neutral, and final destructive confirmations use solid red. Typography, buttons, selects, and form density follow the readable conventions used by the Task Board and SSH panels; field content and options keep normal weight, reserving emphasis for necessary headings and labels. Page switches reset the workspace scroll before browser paint so the prior page offset cannot flash. Buildin preserves the Mnemon brand header, status summary, original eight-page grouped navigation, inline forms, and existing visuals. Status opens by default.

| Page / action | Purpose | Call Boundary |
|---|---|---|
| Status | Health of the CLI, runtime hot memory, storage scope, Memory Spaces, and Documents | Aggregated reads |
| Runtime | Inspect capacity, then filter and progressively maintain one USER / MEMORY list by scope or content | Regular mutations are deterministic; capacity maintenance may start a worker |
| Memory Spaces | Directory, activation switches, modal editing, confirmed deletion, a live multi-space graph, and node inspection | Deterministic RPC reads; switches and edits use write RPC; confirmation invokes native Mnemon `store remove` for physical deletion |
| Documents | Progressively browse the directory, then search, read, create, update, and archive in an independent reader | Search/edit operations use the control layer; archiving starts a worker |
| Distill (Sidebar primary action / Buildin page) | Let a memory worker select scope, deduplicate, and write; supports optional expandable constraints | `spawn` semantic write |
| Recall | Direct smart / keyword / basic retrieval; optional evidence-bounded Agent answers | Direct service reads; Agent answers use a worker with no tools |
| Entities | Frequent entities and entity-related context | Direct service reads |
| Content | Browse active Memory Spaces without recall side effects, copy or clone content, or soft-delete it | Graph reads; deletion uses a worker |

The graph synchronizes every 15 seconds and can also be refreshed manually. Natural layout, uniform reset, dragging, and keyboard adjustments affect only client-side presentation and do not modify Mnemon data.

### In-Conversation Interaction

The memory system surfaces inside the conversation flow through two native DSH slots, both purely additive registrations that replace no official rendering:

| Slot | Presentation | Data and interaction |
|---|---|---|
| `conversation.chat.turnTail` (chain) | One “Turn memory · recalled N · wrote M · document search K” line above the turn-tail actions; expanding lists clickable exact tool names | The read-only RPC `turn-activity` counts `mnemon_*` calls per turn from the Host's durable session log; the chain `select` declines open turns, and turns without memory activity render nothing; tool names use `mnemon:anchor` to open the corresponding Memory page |
| `conversation.chat.assistant-actions` (list, id `mnemon-save`) | A single-icon “Save to memory” action beside finalized assistant replies (next to feedback); clicking opens a confirmation panel | The panel extracts the message text by messageId through the read-only RPC `assistant-message` into an editable candidate; only confirmation calls the existing `supervise` write RPC (supervised writeback: memory subagent judgment, dedupe, Memory Space choice) and shows the subagent receipt; read-only deployments are disabled up front with a note |

`turn-activity` and `assistant-message` are new read-only endpoints sharing the existing Host channel and error semantics. The rendering-extension contracts behind the in-conversation interaction and the follow-up inline memory-highlight plan are recorded in the Mnemon document “dsh-mnemon 对话内记忆交互侦察”.

## Model Tools

### Read-Only Tools

| Tool | Purpose | Root Agent Path |
|---|---|---|
| `mnemon_memory_bodies` | Read the Memory Space directory and statistics | Direct service |
| `mnemon_recall` | Recall from one or more active spaces | `spawn` recall worker |
| `mnemon_related` | Traverse relationships from a known ID | `spawn` related worker; the root path always requests two hops |
| `mnemon_status` | Aggregate CLI, configuration, and active-space status | Direct service |
| `mnemon_document_search` | Deterministically search managed Documents | Direct Documents control layer |

Here, “read-only” means that managed bodies and long-term semantic content are not modified. After a hit, `mnemon_document_search` still updates `lastAccessedAt` and rewrites the Document index for LRU ordering.

### Tools Available When `writeEnabled=true`

| Tool | Purpose | Root Agent Path |
|---|---|---|
| `mnemon_runtime_memory` | `add` / `replace` / `remove` hot memory | Deterministic control layer; a worker is used when add overflows |
| `mnemon_document_manage` | Create, update, or archive a Document | Create/update are deterministic; archive uses a worker |
| `mnemon_remember` | Distill one insight into long-term memory | `spawn` write worker |
| `mnemon_link` | Create a typed relationship | `spawn` write worker |
| `mnemon_forget` | Soft-delete by exact ID | `spawn` write worker |
| `mnemon_memory_body_create` | Create an independent Memory Space | `spawn` write worker |
| `mnemon_memory_body_update` | Update name, description, or active state | `spawn` write worker |
| `mnemon_memory_body_merge` | Perform a non-destructive import merge | `spawn` write worker |

When a worker calls a tool with the same name, the call goes directly to the service layer and is not delegated again.

## Tool Admission Guidelines

- Hot memory: explicit user preferences, stable project conventions, environment facts, and frequently useful lessons.
- Document: designs, investigations, procedures, or handoffs with complete structure and rationale.
- Long-term Memory Space: stable insights that explicitly need to persist across tasks or benefit from graph relationships and deep recall.
- Skip: questions, guesses, temporary progress, completion logs, raw output, secrets, and repository facts that are easy to rediscover.

`mnemon_forget` is a destructive semantic operation. It should run only when the user explicitly requests it or when content has been verified as incorrect or obsolete.

## `/mnemon` Commands

```text
/mnemon
/mnemon status
/mnemon recall <query>
/mnemon related <full memory ID>
/mnemon remember <content>
/mnemon forget <exact ID>
```

- An empty `/mnemon` is equivalent to `status`.
- `status` is a deterministic read and does not start a model.
- `recall`, `related`, `remember`, and `forget` use the live Agent containing the command as the worker parent.
- Command recall returns at most 10 results.
- The `forget` argument must be one exact ID containing no spaces.
- Current command help and results are primarily in Chinese and do not yet follow the Web locale.

## RPC Channels

RPC is the internal bridge between the DSH Host and this plugin's Web client. It is not a promised stable external HTTP API.

Workbench data requests carry `sessionId` and an optional `workspaceId`. The Host accepts only workspace IDs registered in `workspaceRegistry`: deterministic reads and human maintenance route to the inspected root selected by `workspaceId`, while agents, tools, and lifecycle hooks continue to route by the Agent cwd for `sessionId`. `status.workspaceContext` returns both roots and their `aligned` state; Agent-backed writes are rejected while they differ.

### Read Channel

```text
channel:   /dsh-mnemon-read
authority: trusted-host
```

| Endpoint | Behavior |
|---|---|
| `runtime-memory` | Runtime snapshot |
| `status` | Aggregated service, lifecycle, Documents, and storage-scope status |
| `documents` | Document directory snapshot |
| `document` | Read one Document |
| `document-search` | Deterministic search; hits update LRU metadata |
| `graph` | Aggregated graph of active Memory Spaces |
| `bodies` | Memory Space directory |
| `list` | Content list |
| `entities` | Entity statistics or entity-related context |
| `search` | Direct Mnemon retrieval |
| `agent-search` | Evidence-bounded answer after direct retrieval |
| `related` | Direct relationship traversal |

### Write Channel

```text
channel:   /dsh-mnemon-write
authority: loopback
```

| Endpoint | Behavior |
|---|---|
| `runtime-memory` | Hot-memory mutation |
| `supervise` | Submit a workspace candidate to a memory worker |
| `document` | create / update / archive |
| `remember` | Semantic write with optional advanced constraints |
| `link` | Create a relationship |
| `forget` | Soft-delete |
| `body-create` | Create a Memory Space |
| `body-update` | Update metadata or active state |

When `writeEnabled=false`, the write channel remains stably registered but every mutation is rejected at the Host boundary.

### Settings Channel

```text
channel:   /dsh-mnemon-settings
authority: loopback
endpoints: get, mutate
```

Mutations use the settings revision to prevent overwriting concurrent edits.

## npm Exports

The root package exposes Host-side composition and core classes:

```text
apply
Config / resolveConfig
createRunner
MnemonService
RuntimeMemoryController
DocumentManager
StorageScopeInspector
MnemonSubagentCoordinator
MnemonLifecycle
```

`dsh-mnemon/client` provides `apply` and `inject` for the DSH client bundle. `MnemonClient` and the RPC endpoints are currently internal implementations and should not be treated as a stable public SDK.

## Internationalization Scope

The Web dictionaries keep Chinese and English keys in one-to-one correspondence. Brand names, tool names, and configuration keys are not translated. Surfaces that are not yet fully internationalized include:

- `/mnemon` command output;
- model-tool card titles;
- some Host validation and diagnostic errors;
- default names and descriptions written during legacy Store compatibility discovery.
