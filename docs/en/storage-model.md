# Storage and the Three-Layer Memory Model

[简体中文](../zh-CN/storage-model.md) | **English** | [Documentation Center](./README.md)

## Why Three Layers

No single storage form can simultaneously be visible on every turn, preserve complete narratives, and support long-term graph-enhanced recall:

| Question | Corresponding layer | Reason |
|---|---|---|
| What must be known directly on the next turn? | Runtime Memory | Tiny and injected directly into the prompt |
| Which design or procedure needs to be read quickly and in full? | active Documents | Preserves Markdown structure without deep recall |
| Which historical facts and relationships should persist across sessions? | Memory Spaces | Independent databases, graph relationships, and on-demand recall |
| What happens when a long document is rarely used but must remain traceable? | archived Documents | Mnemon retains an index while the cold layer retains the original text |

Recommended query gradient:

```text
current request and repository facts
             |
             v
Runtime Memory already in prompt
             |
             v
search active Documents
             |
             v
recall active Memory Spaces
             |
             v
follow an exact cold reference when full text is required
```

## Unified Root Directory

```text
<storageRoot>/
+-- runtime/
|   +-- memories.json
|   +-- USER.md
|   +-- MEMORY.md
+-- documents/
|   +-- index.json
|   +-- active/
|   +-- archived/
+-- data/
|   +-- .dsh-memory-bodies.json
|   +-- <memory-space-id>/
|       +-- mnemon.db
+-- state/                         # reserved; no persistent reviewer yet
```

`storageScope` determines the entire root, not just the Mnemon databases. The `workspace` scope resolves an independent `<workspace>/.mnemon` for every registered DSH workspace. The Web inspection target and current-session execution target are independent; only the latter drives agents, tools, and lifecycle hooks. `state/` is currently recognized only by the status inspector; scored review watermarks remain in the running Host's memory.

## Runtime Memory

### Semantics

- `target=user`: identity, role, long-term preferences, habits, communication style, and explicit collaboration requirements.
- `target=memory`: projects, environment, decisions, conventions, tool characteristics, and reusable experience.
- `importance=critical|normal|low`: retention priority during maintenance.

There is currently no `daily` target.

### Source of Truth and Projections

`runtime/memories.json` is the sole source of truth. Each record contains:

```text
content
created_at
updated_at
target
importance
```

`USER.md` and `MEMORY.md` are deterministic derived files. Each item is normalized to one line, and items are separated by a line containing only `§`; `§` is a reserved character. During startup and prompt assembly, the control layer repairs missing or manually modified projections from the JSON source.

### Operations

- `add` writes an independent new fact; exactly identical content is not added twice.
- `replace` uses a unique substring match on `old_text` to locate and replace an entire item.
- `remove` uses a unique substring to remove an entire item.
- Zero or multiple matches are rejected; no fuzzy mutation is performed.

### Capacity

| Target | Limit | Maintenance method |
|---|---:|---|
| `USER.md` | 4 KiB | A local no-tool worker merges conservatively; content never enters a Memory Space |
| `MEMORY.md` | 10 KiB | A worker archives committed content first, then returns compaction candidates |

Capacity is measured from the actual UTF-8 bytes of the projection body. A single item is limited to 8 KiB. Automatic capacity maintenance is triggered only by an overflowing `add`; an overflowing `replace` fails directly, and the caller should perform explicit maintenance first.

## Project Documents

### Purpose

Documents preserve project knowledge that is more complete than a single memory item but should still be quick to read, such as:

- architecture designs and rationale;
- evidence-backed investigation findings;
- operating procedures, release checklists, and incident reviews;
- implementation handoffs and long-term maintenance notes.

User profiles, ordinary conversation, temporary progress, raw large logs, and secrets should not be stored in Documents.

### Control Plane

`documents/index.json` is the metadata source of truth. It manages IDs, titles, descriptions, status, filenames, source paths, sessions, timestamps, revisions, SHA-256 values, sizes, and Memory Space references. Managed Markdown copies include generated frontmatter.

`sourcePaths`:

- may point only inside the current session workspace;
- are source references only and are never modified by the plugin;
- are not required to exist by the current implementation;
- may not point into the managed `documents/` directory itself.

### Scope

The physical sharing scope of Documents is determined by `storageScope`:

- `workspace`: normally isolated with the project;
- `global` / `custom`: multiple workspaces may share the same `documents/index.json`.

Therefore, “Project Documents” describes the content type and does not guarantee physical isolation by workspace. The current session workspace constrains only `sourcePaths` on new writes.

### Capacity and Hot/Cold Tiering

| Item | Limit |
|---|---:|
| One body | 2 MiB maximum |
| Total active content | 10 MiB maximum, including generated frontmatter |
| Total archived content | Does not count toward the active limit |

The actual rendered size is calculated before creation or update. If capacity is insufficient, the least recently accessed active Document is selected by `lastAccessedAt` and then `updatedAt`; a Mnemon cold reference is written and verified first, and the original text is moved only if its revision remains unchanged.

Default search covers only active Documents. Search updates `lastAccessedAt` for matching Documents, so it is read-only with respect to bodies but writes index metadata.

## Memory Spaces

Each Memory Space is a native named Mnemon Store with maintainable metadata added in `.dsh-memory-bodies.json`:

```text
id            Host-generated stable UUID or discovered compatible Store name
name          human-readable name
description   routing boundary: what belongs here and when to recall it
active        whether it participates in reads
mnemon.db     independent data plane
```

### Read and Write Boundaries

- Recall, graph, content, and entity reads use only active Memory Spaces.
- Reads explicitly targeting an inactive Memory Space are rejected.
- Writes may target any registered Memory Space.
- After a successful write to an inactive target, the plugin activates it automatically.
- Without an explicit target, if the number of active Memory Spaces is not exactly one, the deterministic service requires the caller to choose a target first.

### Creation, Discovery, and Merge

- On creation, the model supplies a name and description; the Host generates the ID.
- An existing `<storageRoot>/data/<store>/mnemon.db` is discovered and registered without moving the database.
- Merge imports source content into the target through Mnemon; the source database remains in place, and by default only the source is marked inactive.
- `forget` is a soft delete by exact ID, not deletion of a database file.

## Four Relationship Types

The Mnemon long-term layer preserves `temporal`, `semantic`, `causal`, and `entity` relationships. The plugin does not require relationships to be created manually for every memory; they should be created only when they genuinely improve future recall. Overview can aggregate memories, entities, relationships, and space membership across multiple active Memory Spaces.

## Data Authority Table

| Data | Authoritative source | Derived/cache |
|---|---|---|
| Hot memory | `runtime/memories.json` | `USER.md`, `MEMORY.md` |
| Documents | `documents/index.json` + managed Markdown | excerpts, search ranking, status aggregation |
| Memory Space catalog | `data/.dsh-memory-bodies.json` + on-disk Stores | Web status aggregation |
| Long-term memory | Each Store's `mnemon.db` | parsed HTML/DOT graph results |
| Review watermark | Host process memory | status-page snapshot; not yet persisted |
