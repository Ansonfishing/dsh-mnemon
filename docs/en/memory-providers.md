# Long-term memory providers

Memory Spaces are the replaceable third tier in dsh-mnemon. The Memory Space contract stays stable while its provider supplies the data plane. **Mnemon Native is the official, prioritized default**; external providers are opt-in integrations for teams that already use another memory engine or need a different sharing, extraction, or retrieval model.

The first multi-provider implementation covers popular open-source and hosted memory systems, adapted to dsh-mnemon's Host-controlled registry, DSH tools, three-tier model, and WebUI. No external server or SDK is bundled.

## Provider matrix

| Provider | Data plane | Recall / browse | Graph / related | Write | Forget |
|---|---|---|---|---|---|
| **Mnemon Native** | Local `mnemon.db` through the official CLI | Yes / yes | Full typed graph / yes | Exact | Soft delete |
| **OpenViking** | Existing HTTP service and `viking://` memory root | Yes / yes | Projected nodes / no | Async extraction | Guarded hard delete for exact user `.md` resources |
| **Honcho** | v3 workspace conclusions | Yes / yes | No / no | Exact peer conclusion | Hard delete |
| **Mem0** | Platform v3 or self-hosted HTTP API | Yes / yes | No / no | Async extraction | Hard delete |
| **Hindsight** | Memory bank API and knowledge graph | Yes / yes | Provider graph / yes | Async retain | Invalidate (soft) |
| **Holographic** | Local atomic structured-fact file | Yes / yes | Entity/semantic graph / yes | Exact fact | Hard delete |
| **RetainDB** | Project/user-scoped HTTP API | Yes / yes | No / no | Exact memory | Hard delete |
| **ByteRover** | Local `brv` CLI and knowledge directory | Yes / no | No / no | Async curate | Unsupported |
| **Supermemory** | Container-scoped HTTP API | Yes / yes | Projected nodes / no | Async document ingest | Provider forget |

The Host exposes only capabilities an adapter can honor. UI actions and Agent tools do not fabricate missing graph, related, link, browse, or deletion behavior.

## Service and Memory Space fields

| Provider | Service configuration in Settings | Instance configuration in Memory Spaces |
|---|---|---|
| OpenViking | `endpoint`, `apiKey`, `account` | `targetUri`, `user`, `actorPeerId` |
| Honcho | `endpoint`, `apiKey` | `workspace`, `userId`, `agentId` |
| Mem0 | `endpoint`, `apiKey`, `mode` | `userId`, `agentId`, `rerank` |
| Hindsight | `endpoint`, `apiKey` | `bankId`, `budget` |
| Holographic | `dataPath` | `defaultTrust`, `minTrust` |
| RetainDB | `endpoint`, `apiKey` | `project`, `userId` |
| ByteRover | `cliPath`, `apiKey` | `workingDirectory` |
| Supermemory | `endpoint`, `apiKey` | `containerTag`, `searchMode` |

**Settings → Memory System** saves only reusable provider service configuration and never creates a Memory Space. **Memory Spaces → Overview** creates, edits, activates, and removes Memory Spaces while showing only instance scopes such as workspace, user, bank, container, or target URI. The Host merges both layers immediately before calling an adapter. Secrets stay in `<storageRoot>/state/memory-providers.json` with mode `0600`; the WebUI sees only which secrets are configured. Leaving a saved secret blank keeps it, while the explicit clear control removes it.

## Manual and smart placement

Manual placement preserves the existing workflow: create a Memory Space, choose one engine, configure it, and continue to use the same Recall, Content, Entities, and Remember surfaces.

Smart placement builds an allowlist from the candidates selected by the user:

1. The Host enforces data boundary and required-capability rules.
2. If one eligible provider remains, rules select it deterministically.
3. If several remain, an isolated DSH subagent considers the routing description, soft preference, and user-authored strategy prompt.
4. The Host validates the returned provider against the eligible set and persists the decision, reason, confidence, and candidate IDs.

Connection secrets never enter the selector prompt. `local-only` excludes every remote provider before model selection. Mnemon Native remains present as the official local candidate.

## Operational boundaries

- The WebUI never calls external services or local CLIs directly. Provider I/O stays in the Host with cancellation, timeouts, bounded process output, and shell-disabled argument arrays.
- Disconnecting an external Memory Space removes only its local registry entry. It does not delete the provider's data. Per-memory Forget remains a separate capability-controlled action.
- Holographic is a TypeScript adaptation of local structured-fact semantics, using an atomic JSON store and an independent data format and lifecycle implementation.
- Hindsight uses a lightweight liveness probe and reads real statistics, entities, and relationships from the provider's bank stats, entity catalog, and graph responses. Recall and graph remain usable against older deployments that lack the newer statistics surfaces.
- ByteRover exposes focused `status`, `query`, and `curate` operations. Broad knowledge-tree browsing and deletion are intentionally not invented.
- Supermemory browse results merge extracted memory entries with still-browseable ingested documents and deduplicate by provider ID, so documents do not disappear from Content while extraction is incomplete.
- Mnemon Packs include Mnemon Native Memory Spaces, Runtime, and Documents. External connections, credentials, local third-party stores, and remote provider data are excluded.
- Availability, pricing, privacy, retention, and licensing of external products are governed by their respective operators. Review those boundaries before sending private memory to a remote provider.

See [Third-party notices](../../THIRD_PARTY_NOTICES.md) for source attribution and licensing boundaries.
