# Sidebar and Conversation UI Guide

[简体中文](../zh-CN/ui-guide.md) | **English** | [Documentation hub](./README.md)

This guide follows the default `sidebar` presentation and a real user path through Memory System. Screenshots come from the v0.1.6 interface and use the Chinese locale; names, counts, and content vary with your data.

## Start with the two display modes

Choose the entry point and storage location under **Settings → Memory System**:

[![Memory System settings: Sidebar, Buildin, storage, conversation UI, and backup](../assets/screenshots/settings-memory-system.png)](../assets/screenshots/settings-memory-system.png)

| Mode | Best suited for |
|---|---|
| **Sidebar** (default) | A dedicated workbench opened from the DSH sidebar, visually aligned with official panels such as Task Board and SSH |
| **Buildin** | The original conversation-area tab, preserving the previous layout and visuals for established workflows |

Both modes share functionality, data, and Host services. Only entry and appearance differ. Saving switches live without a browser refresh or duplicate mounts.

## Workbench anatomy

The Sidebar header always answers three questions: which system is open, which storage-location mode is effective, and whether the Host is connected.

The body has four primary tabs: **Status, Runtime, Memory Spaces, and Documents**. Memory Spaces adds **Overview, Recall, Content, and Entities** as secondary tabs, with **Remember** as its primary action.

## 1. Status: establish that the system is ready

[![Status summary for versions, Runtime, Memory Spaces, Documents, and storage root](../assets/screenshots/status-overview.png)](../assets/screenshots/status-overview.png)

Status aggregates:

- installed Mnemon CLI and dsh-mnemon versions;
- USER / MEMORY Runtime counts;
- active Memory Spaces and durable-memory counts;
- active / archived Document counts;
- the current storage root and concrete Runtime, Documents, and Memory Spaces directories.

If this page reports a failure, avoid Remember or Archive until you follow [Troubleshooting](./operations.md#troubleshooting).

### Check and update versions

Open the version area for a read-only check:

[![Check and update Mnemon and dsh-mnemon versions](../assets/screenshots/version-check.png)](../assets/screenshots/version-check.png)

Checking never installs automatically. Update appears only when a newer release exists and the installation source is supported. After an update, the interface rechecks both components and refreshes Status automatically. Restart `dsh web` after a dsh-mnemon update to load new plugin code.

## 2. Runtime: maintain hot memory used every turn

[![Runtime capacity, scope filters, content filter, and unified list](../assets/screenshots/runtime-memory.png)](../assets/screenshots/runtime-memory.png)

The top summarizes User Profile (`USER.md`) and Working Memory (`MEMORY.md`); one list below holds both.

- Filter by All / User Profile / Working Memory.
- Filter by content with the input on the right.
- Chips identify source and importance.
- Edit opens a dialog; Remove enters a destructive flow.
- Long lists expand progressively through “Show N more.”

### Add Runtime Memory

[![Add hot memory dialog with content, category, and importance](../assets/screenshots/runtime-memory-add.png)](../assets/screenshots/runtime-memory-add.png)

A Runtime item should be compact, independent, and repeatedly useful. Put identity, preferences, and explicit collaboration requirements in User Profile; put project, environment, decision, and tool lessons in Working Memory. Temporary progress and raw logs do not belong here.

## 3. Memory Spaces: durable memory and relationships

### Overview

[![Memory Space catalog, activation, and multi-space relationship graph](../assets/screenshots/overview-memory-graph.png)](../assets/screenshots/overview-memory-graph.png)

Each card leads with its name and routing description. Provider identity sits beside the ID and health state, while the familiar read-activation toggle stays at the top right. Creation adds no new top-level concept: it remains **Create Memory Space**, defaulting to **Choose manually** with **Mnemon Native** (official) or **OpenViking** (connect an existing service) inside the dialog. When the current conversation is available, users may opt into **Smart selection**: data boundary and required capabilities are hard rules, while local/shared preference and a strategy prompt guide an isolated subagent. A model runs only when multiple eligible candidates remain, and credentials never enter its context.

Native cards retain statistics, Edit, and Delete. OpenViking cards show the remote URI, asynchronous extraction semantics, and **Disconnect**. Smart-created cards additionally show whether rules or the Agent decided, plus confidence and a concise reason. Disconnect never deletes remote data.

The graph aggregates all active spaces. Mnemon Native supplies complete relationships; OpenViking currently contributes bounded disconnected content nodes and never fabricated edges. Layout, dragging, and reset affect browser presentation only.

### Remember

[![Remember dialog with candidate and optional advanced constraints](../assets/screenshots/remember-dialog.png)](../assets/screenshots/remember-dialog.png)

Normally, provide only a candidate. On confirmation, an isolated memory subagent decides whether it qualifies, chooses the narrowest space, deduplicates, distills, and writes. Expand advanced options only when a target space, category, or importance must be constrained explicitly.

### Recall

[![Recall query, category, strategy, raw evidence, and progressive results](../assets/screenshots/recall-agent-answer.png)](../assets/screenshots/recall-agent-answer.png)

- **Direct recall** returns raw evidence without an answer Agent.
- **Agent query** retrieves the same evidence, then gives it to an evidence-only worker with no Mnemon tools.
- Category and strategy narrow the search.
- Results retain Memory Space, provider, category, importance, engine-native score, and ID; cross-provider order uses rank fusion.
- Related and Forget appear only when the provider supports them. OpenViking currently exposes neither action.

Focused questions are more reliable than broad keywords.

### Content and Entities

| Content | Entities |
|---|---|
| [![Memory content and filters](../assets/screenshots/memory-content.png)](../assets/screenshots/memory-content.png) | [![Entity lookup and related memories](../assets/screenshots/entities-context.png)](../assets/screenshots/entities-context.png) |

- **Content** browses durable memory without recall side effects and supports text/category filtering, Related, clone-from-item, Copy ID, and Forget.
- **Entities** starts with frequent names, then aggregates related facts, decisions, and context for a selected or entered entity.

Both expose visible / total counts and progressive loading.

## 4. Documents: preserve complete project narratives

[![Document capacity, progressive directory, and dedicated Markdown reader](../assets/screenshots/documents-markdown.png)](../assets/screenshots/documents-markdown.png)

Documents are for designs, investigations, procedures, postmortems, and handoffs. The directory loads progressively; the reader keeps title, retrieval description, source, revision, hash, size, and full Markdown. Selecting a Document resets the reader to the top.

Before active capacity is exhausted, least-recently-used Documents are cold-indexed in Mnemon and then moved to archived storage. A failure or revision conflict preserves the active original.

### Create a Document

[![Create managed Document dialog](../assets/screenshots/document-create-dialog.png)](../assets/screenshots/document-create-dialog.png)

Title and retrieval description determine future discoverability; source paths preserve provenance; the body retains Markdown structure. Source project files remain read-only—the workbench creates a managed copy.

## 5. In-conversation interaction

### Turn memory

[![Expanded Turn memory with recalls, Document search, and exact tool links](../assets/screenshots/conversation-turn-memory.png)](../assets/screenshots/conversation-turn-memory.png)

The bar appears only on completed turns with memory activity. Expanding lists exact tools; clicking one opens its matching page while retaining the conversation context.

[![Jump from Turn memory to Memory Space Recall](../assets/screenshots/conversation-memory-jump.png)](../assets/screenshots/conversation-memory-jump.png)

### Save to memory

[![Confirm save to memory and edit the candidate before dispatch](../assets/screenshots/conversation-save-dialog.png)](../assets/screenshots/conversation-save-dialog.png)

Save to memory sits in the native action strip for finalized assistant replies. Clicking only opens confirmation and reads that reply. Edit or cancel freely; writing starts only after **Confirm and send to memory subagent**.

## Workspace mode: separating inspection from execution

Under `storageScope=workspace`, keep two concepts separate:

| Concept | Selected by | Affects |
|---|---|---|
| **Inspected workspace** | Workbench header selector | Which `<workspace>/.mnemon` the UI displays and maintains manually |
| **Effective workspace** | Current conversation / Agent cwd | Which root tools, commands, lifecycle hooks, and subagents actually use |

You may inspect project B while staying in project A's conversation; the Agent still uses A. When they differ, the header explains the mismatch and offers one-click alignment. Agent-backed actions are rejected while misaligned to prevent writes to the wrong project. Switching inspection target unmounts old page state before loading the new root.

`global` and `custom` resolve to one explicit root and need no alignment layer.

## Common interaction rules

- Solid blue is the primary action; blue outline usually means Edit; red is Remove, Delete, Archive, or Forget; neutral actions are View, Copy, and Cancel.
- A Memory Space toggle controls only whether dsh-mnemon includes it in read routing; it is not Mnemon CLI's default Store selection. Before deleting Mnemon's default Store, the plugin switches to another existing Memory Space. The last native Store may be inactive but cannot be deleted.
- Physical deletion of a Mnemon Native space requires dedicated confirmation. OpenViking has an explicit Disconnect confirmation that leaves remote data untouched. Forget is currently Mnemon Native semantic soft deletion.
- Saving settings clears stale page state and reloads automatically; no browser refresh is needed.
- Sidebar primary headings remain stable; secondary headings within Memory Spaces scroll naturally.
- Buildin preserves its established layout and visuals. Functional concepts still apply, though control positions differ.

Next: [Getting Started](./getting-started.md) · [Storage model](./storage-model.md) · [Configuration](./configuration.md) · [Operations](./operations.md)
