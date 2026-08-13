# Development and Verification

[简体中文](../zh-CN/development.md) | **English** | [Documentation Center](./README.md)

## Environment

The repository does not declare minimum Node, pnpm, DSH, or Mnemon versions in `package.json`. Use the current DSH development environment and verify compatibility through the full validation chain whenever dependencies are upgraded.

Install dependencies:

```sh
pnpm install
```

## Standard Commands

```sh
pnpm run typecheck  # tsc --noEmit
pnpm test           # vitest run
pnpm run build      # declarations + host/client bundles
pnpm run verify     # typecheck + test + build
```

## Directory Structure

```text
src/
+-- index.ts                  # Host composition root
+-- config.ts                 # settings schema
+-- process.ts / runner.ts    # local CLI execution
+-- service.ts                # durable-memory facade
+-- memory-bodies.ts          # Memory Space registry
+-- runtime-memory.ts         # hot-memory authority
+-- documents.ts              # managed Documents
+-- subagent.ts               # bounded workers
+-- lifecycle.ts              # root-Agent hooks
+-- review-activity.ts        # activity score
+-- tools.ts / commands.ts    # model and human interfaces
+-- rpc.ts / settings.ts      # Web bridges
+-- storage-scope.ts          # storage inventory
+-- client/                   # React workspace and locales
tests/                        # Vitest suites
lib/                          # committed build artifacts
docs/zh-CN/                   # Chinese documentation
docs/en/                      # English mirror
cordis.patch.yml              # DSH profile bundle patch
```

## Build Artifacts

```text
tsc -p tsconfig.build.json
  -> lib/types/*              declarations, maps, intermediate ESM

tsdown host bundle
  -> lib/index.js             Node ES2024 ESM

tsdown client bundle
  -> lib/client.js            DSH browser module wrapper
  -> lib/client.js.map

lightningcss plugin
  -> CSS Modules compiled and injected as scoped <style>
```

The Host keeps `cordis` and `schemastery` external. The client keeps React, ReactDOM, the JSX runtime, and Cordis external; all other dependencies are included in the bundle.

`lib/` is part of the publishing input. After modifying `src/`, rebuild and inspect the generated diff. Do not edit `lib/` manually.

## Test Layers

The existing Vitest suites cover:

- configuration parsing, CLI discovery, and process serialization;
- Memory Space discovery, activation, routing, and merge;
- recall-payload compatibility and graph parsing;
- Runtime JSON/Markdown consistency, locks, capacity, UTF-8, and revisions;
- Document paths, frontmatter, search, LRU, archiving, and conflicts;
- worker tool isolation, the schema subset, and structured receipts;
- lifecycle cues, scoring, idle debounce, cancellation, and watermark retention;
- RPC authority, read-only behavior, and settings revisions;
- the Web workspace, bilingual copy, and key interactions.

These are primarily integration tests using temporary directories, fake runners, and a mock Host. They are not equivalent to automated end-to-end tests of the real DSH + Mnemon WebUI.

## Real WebUI Verification

Use an isolated environment before release to avoid contaminating personal memory:

```text
temporary DSH_HOME
temporary MNEMON_DATA_DIR or custom storageScope
temporary workspace
independent Web port
local link installation
```

Recommended scenarios:

1. Empty root: the UI reports no errors and can create the first Memory Space.
2. Regular conversation: only a short cue appears; recall and writes are not forced.
3. Historical question: the Agent independently recalls and returns the correct space provenance.
4. Explicit distillation: the worker deduplicates, selects a scope, and writes content that can be recalled again.
5. Multiple spaces: reads cover only active spaces; writing to an inactive space activates it automatically afterward.
6. Runtime: USER / MEMORY add, replace, remove, and projection consistency.
7. Documents: create, retrieve, update, manually cold-archive, and leave original project files unchanged.
8. Score-based review: light tasks do not trigger it; after reaching the threshold it waits for idle; a new turn can cancel it while preserving the watermark.
9. Read-only: write tools, write commands, and write RPC are rejected while reads remain available.
10. Status and browser console: no unhandled errors or warnings.

Capacity limits, CLI timeouts, revision conflicts, and Host restarts should be verified in a dedicated fault-injection environment.

## Modifying Subagent Schemas

DSH structured output supports only a compact JSON Schema subset:

```text
type, oneOf, properties, required, additionalProperties,
items, enum, const, and annotation keywords
```

Do not add unsupported keywords such as `maxItems`. `assertDshOutputSchema()` recursively rejects unknown schema keys before starting a worker; result-count and similar limits are enforced by both the persona and the Host parser.

## Modifying Storage Formats

Runtime, Documents, and the Memory Space registry each have a version field or fixed structure. Changes require:

1. Define how the old format is parsed;
2. add a migration or rejection path;
3. preserve temporary-file and atomic-rename behavior;
4. add tests for concurrency and damaged inputs;
5. update the Chinese and English storage, operations, and Roadmap documents;
6. verify upgrade and rollback against a copied data root.

There is currently no formal schema-migration framework, so persistent formats must not change silently.

## Maintaining Documentation Internationalization

`docs/zh-CN` and `docs/en` should contain matching filenames with the same section responsibilities. When changing defaults, workflows, or limitations:

- update both languages;
- keep commands, configuration keys, paths, and code symbols exactly the same;
- cross-link corresponding language pages with relative paths;
- prefer accessible SVGs with no scripts or external resources for architecture overviews; keep directory trees, commands, formulas, and short protocols as copyable `text` / ASCII;
- keep only summaries in the root READMEs and place details on one authoritative docs page.

When the Web locale changes, the Chinese key set remains the type source of truth. The English dictionary must satisfy `Record<MnemonKey, string>` and preserve the same placeholders.

## Release Checklist

```text
[ ] pnpm run verify
[ ] review source and generated lib diffs
[ ] validate package file list includes README.en.md and docs
[ ] install the built/local bundle into an isolated Web profile
[ ] run real Mnemon CLI and WebUI smoke tests
[ ] verify Chinese and English workspaces
[ ] verify global/workspace/custom paths as applicable
[ ] record tested DSH and Mnemon versions
[ ] back up any data root used for upgrade testing
```

`package.json.files` currently publishes `lib`, the patch, both root READMEs, the public bilingual docs, and the License; the historical research ledger is excluded from the installed package.
