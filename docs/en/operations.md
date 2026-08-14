# Operations, Security, and Troubleshooting

[简体中文](../zh-CN/operations.md) | **English** | [Documentation Center](./README.md)

## Health Checks

Check the binary first, then the plugin's aggregated status:

```sh
command -v mnemon
mnemon --version
```

```text
/mnemon status
```

`mnemon status` opens the effective Store, so the upstream CLI may initialize default data or run migrations. It is not a completely side-effect-free read probe. The plugin's Status page also checks active Memory Spaces, Documents, lifecycle state, and subagent counts.

## Security Boundaries

### Process

- `spawn(command, args, { shell: false })`; shell commands are never concatenated.
- stdout + stderr have a combined default limit of 2 MiB.
- Every CLI call is governed by `timeoutMs` and an AbortSignal.
- On timeout or cancellation, the process first receives `SIGTERM`, then `SIGKILL` if it has not exited after 1.5 seconds.
- CLI calls within one `MnemonRunner` are serialized to avoid SQLite lock conflicts from concurrent migrations in the same process.

The serial queue does not replace coordination across DSH processes. When multiple Hosts access the same Mnemon Store concurrently, they still rely on Mnemon/SQLite's own concurrency semantics.

### Files

- Runtime and Documents both use an in-process queue and a cross-instance lock file.
- Lock acquisition waits up to 5 seconds by default; a lock is considered stale only after 30 seconds.
- Writes use temporary files and rename.
- Runtime uses a revision to prevent stale compaction from overwriting concurrent changes.
- Document archiving uses a numeric revision to prevent moving active source text that has since been updated.
- `sourcePaths` cannot escape the initiating session's workspace or point into the managed Documents directory.

### Web

- Read RPC: `trusted-host`.
- Memory write RPC: `loopback`.
- Settings RPC: `loopback`.
- The WebUI neither reads SQLite directly nor starts processes.

### Model

- Workers use a persona, a tool allowlist, structured output, and `maxDepth: 1`.
- User queries, candidate content, Document bodies, and historical memories are all treated as untrusted data.
- The evidence-answer worker has no Mnemon tools and can use only the hits supplied by the Host.

These boundaries are not a secret scanner. There is currently no deterministic credential/secret detection. Do not submit keys, tokens, private keys, or raw sensitive logs to hot memory, Documents, or Memory Spaces.

### Security reporting

Report vulnerabilities privately through the channels in [SECURITY.md](../../SECURITY.md) (GitHub Security Advisories or maintainer email) — do not open a public issue. Typical in-scope issues include data loss, path traversal, lock/revision-check bypasses, subagent isolation breaks, and injection via memory content rendered by the WebUI.

## Backup

All three tiers share `storageRoot`. A consistent backup should cover the entire root, not just `mnemon.db`:

```text
<storageRoot>/runtime
<storageRoot>/documents
<storageRoot>/data
<storageRoot>/state    # when present
```

Recommended procedure:

1. Stop the DSH Host and any other process writing to the same root.
2. Record the current plugin, DSH, and `mnemon --version` versions.
3. Copy the entire root to a new timestamped directory.
4. Generate a file inventory or checksums for the backup.
5. Complete a recovery rehearsal in an isolated path before relying on the backup.

The project currently has no built-in consistent snapshot, export, or recovery command. Copying while the system is running may capture an inconsistent state across files.

## Recovery

1. Stop every DSH/Mnemon process using the target root.
2. Preserve a second copy of the existing root; do not overwrite the only copy of the data.
3. Restore the complete backup to a new directory.
4. First point `storageScope=custom` at the new directory.
5. Start the system and inspect the Runtime projections, Document index, Memory Space directory, and recall.
6. After verification, decide whether to replace the original root.

If `USER.md` / `MEMORY.md` is damaged, the control layer can repair it from a valid `memories.json`. There is no general automatic repair flow for damaged JSON, the Document index, or SQLite.

## Changing Storage Scope

The plugin does not migrate data automatically:

```text
old scope -- change setting + save --> new empty or existing scope

no implicit copy
no implicit merge
no implicit delete
```

When migration is required, stop writes and copy the complete root. Two roots cannot be merged by overwriting directories because JSON indexes, the registry, and multiple databases may conflict. Design an explicit merge procedure against backups instead.

## Troubleshooting

| Symptom | Check and Resolution |
|---|---|
| Mnemon is unavailable | Run `command -v mnemon` and `mnemon --version`; set `MNEMON_CLI_PATH` or `cliPath`, then restart |
| Status is healthy but recall is empty | Check that a Memory Space is active, inspect the current `storageScope` and DSH launch cwd, and make sure the query is focused enough |
| `memoryBodyId is required...` | The active count is not exactly 1; have the worker or caller select a target explicitly |
| `memory body is not active for reading` | Activate the target in Overview; writing to an inactive space is allowed, but reading is not |
| Subagent provider error | Regular tasks require the full isolation capabilities; background review additionally requires `fork + inheritsParentContext` |
| Settings have no effect after saving | Check the UI error; all options should apply live after a successful Save |
| Custom directory is rejected | Use an absolute path, `~`, or `~/...` |
| Document has no workspace | The session must correspond to a live root Agent and include cwd in its session header |
| Source path is rejected | The path must stay within the session workspace and must not reference the managed Documents directory |
| Runtime replace exceeds capacity | Shorten the replacement or organize it explicitly first; current automatic maintenance handles only add overflow |
| CLI timeout | Increase `timeoutMs`; status and graph exports for large Stores may take longer than 10 seconds |
| Lock timeout | Check whether another instance is writing; do not delete a lock that still belongs to a live process |
| Invalid JSON / unexpected viz | The CLI output protocol may be incompatible; validate the version against an isolated root and do not continue writing production data |
| A remote page can read but not write | Write RPC enforces loopback by design |
| `tabEnabled=false` still shows the Tab | The setting currently stops only Host data RPC and does not remove the client slot |
| Local link does not reflect source | Run `pnpm run build`, then restart the DSH profile |

## Known Limitations

### Feature Read-Only Is Not Disk Read-Only

`writeEnabled=false` disables semantic mutations, but startup may still create or repair Runtime files, Document search updates `lastAccessedAt`, and Mnemon reads may trigger upstream migrations. Do not assume it can operate without writes on a genuinely read-only filesystem.

### Shared Scope of Documents

`global` and `custom` may cause multiple workspaces to share one Document index; records do not have a separate workspace-ownership field. `sourcePaths` are validated against the initiating session's cwd only when written.

### Cold-Reference Paths

The current archive-worker prompt uses `.mnemon/documents/archived/<filename>` as its planned reference. Under global/custom scope, the actual file is at `<storageRoot>/documents/archived/<filename>`. When locating the original, use `documents/index.json` or the `relativePath` shown in the UI as the source of truth. This path-expression difference remains to be fixed.

### Cross-System Transactions

“Index first, move second” protects the active source text but is not a rollback-capable distributed transaction across Mnemon SQLite and the filesystem. If a revision conflict occurs after indexing succeeds, the index may retain a duplicate reference; the plugin chooses to preserve data instead of rolling back a completed long-term write.

### Background Watermarks

Scores, the latest checkpoint, and retry state are not persisted. Restarting the Host clears activity that has not yet been processed. Failure backoff, circuit breaking, and a manual retry entry point are not yet implemented either.

### Version Matrix

The project does not yet declare a formal DSH/Mnemon support matrix or schema-migration policy. Back up first and validate against an isolated root before upgrading.

### Internationalization

The main Web workspace is bilingual in Chinese and English, but commands, tool cards, compatibility default metadata, and some error messages are not yet fully internationalized.
