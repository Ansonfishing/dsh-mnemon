# Architecture

[简体中文](../zh-CN/architecture.md) | **English** | [Documentation Center](./README.md)

## Positioning

`dsh-mnemon` is an integration and supervision layer between DSH and Mnemon, not a new database engine:

- DSH provides the root Agent, lifecycle events, subagent providers, tools, commands, settings, and Web extension points;
- the plugin provides the control plane for three knowledge layers, routing policies, transactional barriers, and UI;
- the local `mnemon` CLI provides named Stores, SQLite persistence, four graph types, recall, relationships, and soft deletion.

## Component Diagram

[![dsh-mnemon runtime architecture](../assets/diagrams/en/project-architecture.svg)](../assets/diagrams/en/project-architecture.svg)

Solid lines show deterministic data or control paths; purple dashed lines show LLM-supervised paths. Runtime Memory and Documents use managed files directly. Only Memory Spaces call the local Mnemon CLI through `MnemonRunner`. Click the image to open the original SVG.

## Host Composition Root

`src/index.ts::apply()` assembles the plugin in this order:

```text
settings.register("mnemon")
  -> resolveConfig
  -> createRunner
  -> MnemonService
  -> RuntimeMemoryController
  -> DocumentManager
  -> StorageScopeInspector
  -> MnemonSubagentCoordinator
  -> MnemonLifecycle
  -> tools / commands / prompt sections
  -> register RPC when a Web connection exists
```

The Host declares dependencies on `tools`, `settings`, `commands`, `agents`, and `subagents`. The Web client additionally depends on slots, connection, and DSH locale services.

## Dual Paths for the Root Agent and Workers

The same `mnemon_*` tools route calls according to whether the caller is a subagent, preventing recursive delegation:

```text
root Agent calls mnemon_recall
  -> coordinator starts a bounded recall worker
  -> worker calls mnemon_memory_bodies and mnemon_recall
  -> tool sees origin=subagent
  -> call reaches MnemonService directly
  -> structured evidence returns to root Agent
```

Long-term semantic writes, relationships, soft deletion, and Memory Space creation, updates, and merges use the same pattern. Ordinary Runtime Memory and Document mutations first pass through the coordinator but are usually committed directly by the deterministic control layer; only capacity maintenance or archiving requires an additional worker.

Physical Memory Space deletion is a separate deterministic destructive action. The WebUI must show a second confirmation, then invoke native Mnemon `store remove` through the loopback write RPC; the directory registration is removed only after the CLI deletion succeeds.

## Two Types of Subagent

### `spawn`

`spawn` uses a new isolated context. For each task type, the plugin supplies:

- a fixed persona;
- a minimal tool allowlist;
- a structured output schema within the subset supported by DSH;
- `maxDepth: 1`;
- a cancellable signal and bounded token budget.

It is used for recall, long-term semantic writes, evidence-bound answers, hot-memory maintenance, and Document archiving.

### `fork`

Scored background review requires a provider named `fork` with `inheritsParentContext=true`. It inherits only a completed parent checkpoint and determines whether to maintain hot memory or at most one Project Document. It is not a continuation of the user's task, and it does not inject review reasoning into the main conversation.

The current review allowlist excludes `mnemon_remember`, `mnemon_forget`, and Memory Space maintenance tools, so background review cannot modify long-term Memory Spaces directly.

## Control Plane and Data Plane

```text
LLM-owned judgment                  Host-owned guarantees
------------------                  ---------------------
what is worth keeping               input validation
which Memory Space fits             path boundary
whether two items are duplicates    process timeout/cancel
how to summarize a Document         file lock + atomic rename
whether a reusable artifact exists  UTF-8 capacity accounting
                                     revision conflict rejection
                                     read/write RPC authority
```

Persona constraints must be distinguished from hard Host guarantees. For example, the MEMORY archival worker is instructed to cover every committed hot-memory item, but the Host can strictly validate only the structured action, revision, and byte budget; the Host does validate USER compaction source coverage item by item.

## Web Boundary

The WebUI does not start system processes or open SQLite directly:

```text
browser component
  -> typed client wrapper
  -> DSH RPC authority check
  -> Host validation
  -> controller / service / bounded worker
  -> local CLI or managed files
```

Read channels require `trusted-host`; memory write channels and settings channels require `loopback`. When `writeEnabled=false`, the Host does not register memory write channels.

## Internationalization

`src/client/locales.ts` defines `MnemonKey` from the Chinese key set, and the English dictionary must satisfy the same set of keys; `src/client/index.ts` registers both dictionaries with the DSH locale. The main Web pages and settings card switch immediately with the DSH global language and reuse the global light or dark theme.

Command output, tool-card titles, persisted compatibility-default Memory Space names, and some backend errors are still monolingual. This is a known gap on the Roadmap.

## Key Modules

| Module | Responsibility |
|---|---|
| `src/index.ts` | Host composition and registration |
| `src/config.ts` | Configuration schema, defaults, and resolution |
| `src/process.ts` | Bounded process execution without a shell |
| `src/runner.ts` | CLI discovery, arguments, serialization, and JSON parsing |
| `src/service.ts` | Application facade for long-term memory |
| `src/memory-bodies.ts` | Memory Space catalog metadata |
| `src/runtime-memory.ts` | Hot-memory source of truth and projections |
| `src/documents.ts` | Documents control plane |
| `src/subagent.ts` | Worker orchestration and capacity transactions |
| `src/lifecycle.ts` | Per-root-Agent lifecycle |
| `src/review-activity.ts` | Deterministic review scoring |
| `src/tools.ts` | Model tools and root/worker routing |
| `src/rpc.ts` | Web read/write channels |
| `src/storage-scope.ts` | Read-only inventory of the three storage scopes |
| `src/client/*` | Web workspace, settings, and locale |
