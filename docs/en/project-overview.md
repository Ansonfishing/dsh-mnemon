# Project Overview: Local Three-Tier Memory for DSH

[简体中文](../zh-CN/project-overview.md) | **English** | [Documentation Center](./README.md)

> **`dsh-mnemon` deeply integrates [Mnemon](https://github.com/mnemon-dev/mnemon) with DSH, giving DSH comprehensive memory capabilities.**

It separates what must be visible every turn, project knowledge that should remain readable as a whole, and long-term history recalled across sessions into three clear tiers. DSH then supplies routing, lifecycle integration, bounded subagents, and the user interface.

The central goal is to give an Agent long-term continuity while keeping the current task authoritative, context compact, writes auditable, and original data protected when maintenance fails.

[![Mnemon Memory Spaces page showing the Memory Space catalog, activation state, and live multi-space relationship graph](../zh-CN/assets/screenshots/overview-memory-graph.png)](../zh-CN/assets/screenshots/overview-memory-graph.png)

*The overview brings the Memory Space catalog, activation state, statistics, and live multi-space graph into one workspace. Select the image for its original resolution. The screenshot uses the Chinese locale; the workspace also supports English.*

## Why It Exists

With only the current conversation, an Agent cannot reliably carry forward user preferences, project conventions, and historical decisions. Injecting the entire history into every prompt causes context growth, stale-information interference, and additional cost. One memory tier also cannot satisfy all of these needs well:

| Need | Limit of one memory tier | dsh-mnemon approach |
|---|---|---|
| Make stable preferences and conventions available next turn | Retrieval adds latency and can miss | Runtime Memory injects compact projections every turn |
| Read a complete design, investigation, or procedure quickly | Fragmentation destroys narrative structure | Documents preserve searchable Markdown originals |
| Find cross-session facts, decisions, and relationships | Loading everything pollutes current context | Memory Spaces recall graph-enhanced evidence on demand |
| Keep infrequently used long-form material traceable | Keeping it hot consumes capacity forever | Create a durable cold reference before moving the original |
| Let a model judge value without delegating system safety | LLM output cannot guarantee paths, concurrency, or transactions | The LLM owns semantic judgment; the Host owns hard boundaries |

Whichever tier produces a hit, current user instructions, live tool results, and repository facts always take precedence over historical memory. The plugin supplies reviewable evidence and continuity; it does not let old content override current facts.

To satisfy immediate visibility, complete reading, and durable recall together, the plugin establishes a layered, supervised memory architecture between DSH and local persistence.

## Architecture at a Glance

DSH provides the root Agent and extension surfaces, `dsh-mnemon` owns three-tier control, routing, and safety boundaries, and [Mnemon](https://github.com/mnemon-dev/mnemon) supplies the Memory Space capabilities for the durable tier. The plugin manages Runtime projections and Document originals; durable Memory Spaces and archive references are stored and retrieved through Mnemon.

[![dsh-mnemon runtime architecture connecting DSH Web, the root Agent, the supervised control layer, and three local storage tiers](./assets/project-architecture.svg)](./assets/project-architecture.svg)

The architecture has four useful boundaries:

1. **Interaction boundary**: users reach memory through DSH conversations, `/mnemon` commands, model tools, and the Web workspace.
2. **Supervision boundary**: lifecycle hooks provide only short cues; durable recall, semantic writes, and maintenance run in bounded subagents.
3. **Deterministic control boundary**: the Host validates inputs, paths, permissions, revisions, UTF-8 capacity, locks, timeouts, and process arguments.
4. **Local data boundary**: Runtime, Documents, and Memory Spaces share the selected `storageRoot`; memory persistence does not depend on a remote memory service.

See [Architecture](./architecture.md) for detailed module ownership, root/worker dual paths, and RPC trust boundaries.

Architecture boundaries determine who may execute an operation, the built-in prompt determines when the LLM should use a capability proactively, and the three-tier model determines the granularity of retained information and when it reaches context.

## Built-in Prompt and Proactive Memory

Through the system prompt, dynamically injected `USER.md` / `MEMORY.md`, lifecycle cues, and tool descriptions, the plugin presents every read and write capability across Runtime Memory, Documents, Memory Spaces, relationships, and directory maintenance. This encourages the LLM to invoke the relevant capability whenever the current task may benefit instead of waiting for the user to name individual tools.

“Proactive” does not mean unconditional reads and writes on every turn. The current task remains authoritative, work continues without a memory call when none is useful, and a write is complete only with a valid tool receipt. When the user states an explicit intent, the LLM selects a path by information granularity and goal:

| User intent or task signal | Preferred capability |
|---|---|
| Revisit earlier work, find historical evidence, or recover an exact old detail | Search active Documents first, then use `mnemon_recall` / `mnemon_related` when needed |
| Remember a preference or stable convention, or correct old information | `mnemon_runtime_memory` with `add` / `replace` / `remove` |
| Preserve a complete design, investigation, procedure, or handoff | Search Documents, then create or update a managed Document; archive when needed |
| Retain durable facts or decisions, create relations, forget content, or adjust a Memory Space | Let a bounded worker deduplicate and route before using Memory Space write or maintenance capabilities |

Even without the literal words “remember this,” an explicit new reusable fact can justify proactive hot-memory writeback. After completed work reaches the activity-score gate and the root Agent remains idle, a `fork` background review can also conservatively inspect hot memory and project Documents. See [Lifecycle and Core Workflows](./workflows.md) and the [Interface Reference](./interfaces.md) for the complete prompting strategy, gates, and tool permissions.

## The Three-Tier Memory Model

### 1. Runtime Memory: Hot Context Visible Every Turn

Runtime Memory contains compact, frequently used stable information:

- `target=user`: identity, role, long-term preferences, habits, communication style, and explicit collaboration requirements;
- `target=memory`: project conventions, environment facts, decisions, tool behavior, and reusable lessons.

`runtime/memories.json` is the only source of truth. `USER.md` and `MEMORY.md` are deterministic projections injected into every prompt. USER is limited to 4 KiB, MEMORY to 10 KiB, and a single entry to 8 KiB, all measured as UTF-8 bytes.

Ordinary `add`, `replace`, and `remove` operations are handled by the deterministic control layer. Maintenance starts only when an `add` overflows: USER is conservatively compacted by a no-tool local worker, while MEMORY is semantically archived by a bounded worker before hot candidates are compacted. An overflowing `replace` is rejected and does not trigger automatic maintenance.

[![Runtime Memory page showing USER and MEMORY hot context, capacity, and edit actions](../zh-CN/assets/screenshots/runtime-memory.png)](../zh-CN/assets/screenshots/runtime-memory.png)

*The Runtime page places the USER and MEMORY projections side by side with their capacity, importance, categories, and per-entry edit controls.*

### 2. Project Documents: Complete, Readable Project Knowledge

Documents preserve knowledge that is larger than one memory item but still needs fast, complete reading: architecture rationale, investigation findings, operating procedures, incident reviews, and implementation handoffs. Bodies remain Markdown and are searched deterministically by title, description, and content.

A body is limited to 2 MiB, and rendered active Documents are limited to 10 MiB in total. When capacity is insufficient or a user archives manually, a bounded worker first writes a Mnemon cold reference containing a summary and SHA-256. The original moves to `archived/` only if its Document revision is still current. This ordering protects the active original, but it is not a rollback-capable distributed transaction across SQLite and the filesystem.

Document sharing follows `storageScope`. Under `global` or `custom`, several workspaces may share one Document index. The live session workspace constrains new `sourcePaths`; it does not create separate ownership.

[![Project Documents page showing the Document list, metadata, and rendered Markdown original](../zh-CN/assets/screenshots/documents-markdown.png)](../zh-CN/assets/screenshots/documents-markdown.png)

*The Documents page preserves both metadata and Markdown structure, combining list selection, search, and complete reading in one view.*

### 3. Memory Spaces: Isolated Long-Term Recall

Each Memory Space corresponds to a native named Mnemon Store with its own `mnemon.db`. The plugin adds a stable ID, a human-readable name, a routing description, and an active state.

- Reads cover active Memory Spaces only.
- Writes may target any registered Memory Space.
- A successful write to an inactive target activates it automatically.
- When creating a space, the model proposes the semantic name and boundary while the Host generates its stable ID.
- Merge uses non-destructive import; source databases remain and are inactive by default afterward.

The long-term layer retains `temporal`, `semantic`, `causal`, and `entity` relationships. Recall results include their Memory Space provenance and memory ID so the root Agent can traverse related context.

See [Storage and the Three-Tier Memory Model](./storage-model.md) for directory layouts, capacity details, and data authorities.

The tiers are not isolated repositories. Together they form a near-to-far lookup path that expands only when needed, while explicit writes and controlled maintenance retain information at the appropriate frequency and granularity.

## From the Current Request to Durable Retention

### Read: Start Near and Escalate Only When Needed

The plugin follows a near-to-far lookup gradient:

1. Prefer the current request, live tool results, and repository facts.
2. The root Agent can already see Runtime Memory injected for the turn.
3. Search active Documents deterministically when complete project knowledge is needed.
4. Use supervised recall for historical decisions, cross-session facts, or relationships.
5. Follow a cold reference to an archived Document only when the complete original is required.

When the root Agent calls `mnemon_recall`, the coordinator starts an isolated worker. The worker may only inspect the Memory Space catalog, recall, and traverse related items. It selects active spaces by name and description and returns bounded structured evidence. Raw routing reasoning and the complete catalog do not enter the main conversation.

Direct Web search uses the deterministic service. “Agent search” performs the same retrieval first, then starts a no-Mnemon-tool evidence-only worker that can answer solely from the supplied hits and return only valid citations.

[![Recall page showing an Agent answer, source memory IDs, and raw recall results](../zh-CN/assets/screenshots/recall-agent-answer.png)](../zh-CN/assets/screenshots/recall-agent-answer.png)

*Agent search restricts evidence to the current hits while retaining source memory IDs and raw recall entries so the answer remains reviewable.*

In a real conversation, the root Agent can inspect the Memory Space catalog and project Documents before recalling from active spaces. If the current task genuinely needs an inactive space, a controlled workflow can activate it temporarily and restore its prior state after reading. The tool trace keeps lookup order, space selection, and provenance observable.

[![Memory recall in a DSH conversation with Document search, multi-space recall, and state restoration](../zh-CN/assets/screenshots/conversation-recall.png)](../zh-CN/assets/screenshots/conversation-recall.png)

### Write: Separate Semantic Judgment from System Guarantees

The read path determines when memory is useful. The write path must also define who judges value, who persists data, and how original data is protected when an operation fails.

The plugin separates semantic judgment from system guarantees:

| LLM / worker responsibility | Hard Host guarantee |
|---|---|
| Decide whether content deserves long-term retention | Input schema and operation permissions |
| Select the narrowest suitable Memory Space | Paths cannot escape workspace boundaries |
| Identify duplicates, conflicts, and semantic clusters | CLI uses argument arrays with no shell |
| Produce summaries, routing decisions, and relationship reasons | Timeouts, cancellation, output limits, and process serialization |
| Decide whether complex work produced a reusable Document | File locks, temporary files, rename, and revision fences |
| Perform conservative maintenance within its persona | UTF-8 capacity accounting and preservation on failure |

Durable recall, semantic writes, and capacity maintenance use isolated `spawn` workers. Background review uses a checkpoint-inheriting `fork` worker only after a completed turn crosses the activity-score gate and the root Agent remains idle. A new turn cancels pending or active review. Worker context, tools, and output remain bounded while the Host retains deterministic validation; see the workflow guide for complete provider requirements and review boundaries.

See [Lifecycle and Core Workflows](./workflows.md) for recall, writes, capacity maintenance, archiving, and the scoring formula.

When the user explicitly asks to retain stable information, the root Agent selects structured tools by content type and writes individual items while the Host continues to validate the target, capacity, and revision. The final response reports what was actually stored instead of treating internal reasoning as persistence.

[![Memory writeback in a DSH conversation with structured Runtime Memory tool calls and receipts](../zh-CN/assets/screenshots/conversation-writeback.png)](../zh-CN/assets/screenshots/conversation-writeback.png)

### Three-Tier Example: Retaining an Architecture Decision

Suppose a substantial task establishes that “every external CLI must be launched with an argument array and without a shell,” and also produces a complete threat analysis and migration guide:

1. The frequently used operating rule can enter `MEMORY.md` as a compact fact and become visible from the next turn.
2. The complete analysis and migration procedure belong in an active Document, preserving headings, code excerpts, and source files.
3. If the decision should remain recallable across projects, a bounded worker selects a suitable Memory Space, checks for duplicates, writes a self-contained decision, and may link it to related security principles.
4. When someone later asks why shell command concatenation is forbidden, the Agent sees the hot rule first, searches the Document for rationale, and recalls Mnemon evidence only when cross-session relationships matter.
5. If the Document becomes infrequently used and active capacity is needed, the plugin writes a cold reference with its summary and hash before moving the original. The full analysis remains traceable through that reference.

The same knowledge can therefore retain complementary expressions at different frequencies and narrative granularity, without copying the entire Document into every prompt or stretching one short rule into a long record.

These workflows can be initiated proactively through Agent tools and can also be inspected, verified, and maintained in DSH's Memory workspace.

## User and Integration Surfaces

### Web Workspace

The conversation's “Memory System” tab contains eight pages in three divider-separated groups: “Status” stands alone; “Runtime, Memory Spaces, Documents” cover the three storage tiers; “Distill, Recall, Entities, Content” are the read/write tools:

| Page | Primary purpose |
|---|---|
| Status | CLI, runtime hot memory, storage scope, lifecycle, and subagent diagnostics |
| Runtime | USER / MEMORY hot context, capacity, and deterministic maintenance |
| Memory Spaces | Memory Space catalog, activation controls, metadata editing, and a live multi-space graph |
| Documents | Search, read, edit, and archive managed Documents |
| Distill | Give a candidate to a bounded worker for deduplication, routing, and writing |
| Recall | Direct recall, related traversal, and evidence-only Agent search |
| Entities | Frequent entities and their cross-graph context |
| Content | Browse, copy, clone, or soft-delete durable memories |

The primary Web workspace and settings card support Chinese and English and follow DSH's global light/dark theme. Commands, tool cards, and some backend diagnostics are not yet fully internationalized.

[![Entities page showing frequent entities, hit counts, and entity-linked context](../zh-CN/assets/screenshots/entities-context.png)](../zh-CN/assets/screenshots/entities-context.png)

*The Entities page ranks names by hit count and retains related memories, category, importance, score, and Memory Space provenance on the right.*

[![Content page showing durable-memory filters, tags, relationships, and maintenance actions](../zh-CN/assets/screenshots/memory-content.png)](../zh-CN/assets/screenshots/memory-content.png)

*The Content page supports filtering and inspection, then exposes relationship lookup, create-from-current, ID copy, and soft-delete actions.*

### Model Tools and Commands

The plugin registers read and write groups of `mnemon_*` model tools and provides:

```text
/mnemon status
/mnemon recall <query>
/mnemon related <full memory ID>
/mnemon remember <stable, self-contained durable insight>
/mnemon forget <full memory ID>
```

Web RPC is an internal bridge between the DSH Host and the plugin client: reads require `trusted-host`, while memory writes and settings require `loopback`. These channels are not a stable external HTTP SDK. See [WebUI, Tools, Commands, and RPC](./interfaces.md) for the complete interface matrix.

## Local-First Reliability Design

Beyond visibility, deterministic boundaries constrain paths, capacity, concurrency, and failure recovery.

- **Local data**: SQLite, the registry, Runtime JSON, and Documents live under the user-selected root.
- **No-shell execution**: the Mnemon CLI uses `spawn(command, args, { shell: false })`.
- **Bounded processes**: each call has a timeout, cancellation, and a 2 MiB combined stdout + stderr limit.
- **Concurrency control**: Runtime and Documents use in-process queues and cross-instance lock files; CLI calls are serialized within one Runner.
- **Original-first protection**: revision conflicts, worker failures, and invalid receipts never use stale results to overwrite current hot memory or move an active Document.
- **Recoverable projections**: a valid `memories.json` can rebuild `USER.md` and `MEMORY.md`.
- **Least-privilege workers**: every worker has a fixed persona, tool allowlist, structured output, and `maxDepth: 1`.

These boundaries are not a secret scanner or a complete backup system. There is no deterministic credential detection, cross-system rollback, built-in consistent snapshot, or general corruption repair tool yet. Production data needs independent backup and recovery rehearsals; see [Operations, Security, and Troubleshooting](./operations.md).

“Local-first” describes persistence location and CLI execution. It does not guarantee that selected content never leaves the device. If the DSH root model or subagent provider runs remotely, relevant prompts, candidates, or recalled evidence may still be sent to that provider; the actual data-processing boundary depends on the configured DSH model providers.

## Scope and Version Status

`dsh-mnemon` is useful when:

- long-running collaboration needs stable user preferences and working conventions;
- a large project needs design rationale, investigation records, and handoff knowledge;
- several knowledge domains need isolated storage, selective activation, and cross-space recall;
- data should remain local while an LLM handles semantic judgment;
- users need a visible, editable, diagnosable memory experience native to DSH.

It is not intended for bulk persistence of secrets, raw logs, short-lived progress, or ordinary facts that can be reconstructed from the repository. It should not be treated as the source of truth, an authorization system, a backup system, or a proactive notification daemon.

The current release is an early Beta and continues to evolve. See the [Roadmap](./roadmap.md) for selected planned capabilities and iteration priorities.

## Continue Reading

- To run it now: read [Getting Started](./getting-started.md).
- To understand code boundaries: read [Architecture](./architecture.md).
- To choose a data scope: read [Storage and the Three-Tier Memory Model](./storage-model.md) and the [Configuration Reference](./configuration.md).
- To understand transactions and review: read [Lifecycle and Core Workflows](./workflows.md).
- To deploy or upgrade: read [Operations, Security, and Troubleshooting](./operations.md).
- To contribute: read [Development and Verification](./development.md).
