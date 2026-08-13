# WebUI, Tools, Commands, and RPC

[简体中文](../zh-CN/interfaces.md) | **English** | [Documentation Center](./README.md)

## Web Workspace

The main Web interface follows DSH's global language and light/dark theme. The top navigation is split into three divider-separated groups: “Status” stands alone; “Runtime, Memory Spaces, Documents” cover the three storage tiers; “Distill, Recall, Entities, Content” are the read/write tools. The “Status” page opens by default.

| Page | Purpose | Call Boundary |
|---|---|---|
| Status | Diagnostics for the CLI, runtime hot memory, storage scope, Memory Spaces, Documents, lifecycle, and workers | Aggregated reads |
| Runtime | Inspect and maintain USER / MEMORY hot memory and capacity | Regular mutations are deterministic; capacity maintenance may start a worker |
| Memory Spaces | Memory Space directory, activation switches, a live multi-space graph, and node inspection | Deterministic RPC reads; switches use write RPC |
| Documents | Search, read, create, update, and archive Documents | Search/edit operations use the control layer; archiving starts a worker |
| Distill | Let a memory worker select scope, deduplicate, and write; supports advanced constraints | `spawn` semantic write |
| Recall | Direct smart / keyword / basic retrieval; optional evidence-bounded Agent answers | Direct service reads; Agent answers use a worker with no tools |
| Entities | Frequent entities and entity-related context | Direct service reads |
| Content | Browse active Memory Spaces without recall side effects, copy or clone content, or soft-delete it | Graph reads; deletion uses a worker |

The graph synchronizes every 15 seconds and can also be refreshed manually. Natural layout, uniform reset, dragging, and keyboard adjustments affect only client-side presentation and do not modify Mnemon data.

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
| `supervise` | Submit a Tab candidate to a memory worker |
| `document` | create / update / archive |
| `remember` | Semantic write with optional advanced constraints |
| `link` | Create a relationship |
| `forget` | Soft-delete |
| `body-create` | Create a Memory Space |
| `body-update` | Update metadata or active state |

The entire write channel is not registered when `writeEnabled=false`.

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
