# dsh-mnemon v0.3 evaluation harness

This harness runs a real DSH Headless profile against an isolated Mnemon data
root. It seeds Runtime Memory, managed Documents, and three Mnemon Native
Memory Spaces, then records every provider request and durable Agent event.

The mock path is deterministic and never uses a credential:

```sh
pnpm run build
node scripts/evaluation/v0.3/run.mjs \
  --provider mock \
  --scenario deterministic \
  --output /private/tmp/dsh-mnemon-v03-deterministic
node scripts/evaluation/v0.3/analyze.mjs \
  /private/tmp/dsh-mnemon-v03-deterministic
```

The real path copies the configured DSH credential file into the temporary
profile, forwards the authorization header through an in-process loopback
proxy, and deletes the entire profile after the run. Neither the header nor
the credential value is recorded:

```sh
node scripts/evaluation/v0.3/run.mjs \
  --provider real \
  --scenario real-conversation \
  --output /private/tmp/dsh-mnemon-v03-real
```

Use the natural-language recall scenario to observe whether the model chooses
retrieval without being told which tool to call:

```sh
node scripts/evaluation/v0.3/run.mjs \
  --provider real \
  --scenario autonomous-recall \
  --output /private/tmp/dsh-mnemon-v03-autonomous-recall
```

Context-only runs support reproducible ablations. The following examples
measure DSH without Mnemon, an empty Mnemon corpus, the realistic corpus, and
catalog scaling respectively:

```sh
node scripts/evaluation/v0.3/run.mjs --provider real --scenario context-only \
  --corpus empty --mnemon off --output /private/tmp/dsh-only
node scripts/evaluation/v0.3/run.mjs --provider real --scenario context-only \
  --corpus empty --output /private/tmp/mnemon-empty
node scripts/evaluation/v0.3/run.mjs --provider real --scenario context-only \
  --corpus realistic --output /private/tmp/mnemon-realistic
node scripts/evaluation/v0.3/run.mjs --provider real --scenario context-only \
  --corpus scale --output /private/tmp/mnemon-scale
```

`--corpus max-runtime` fills Runtime Memory close to its configured limits.
`--corpus capacity --scenario capacity-maintenance` exercises the real
overflow archive/compaction/retry path. `--scenario single-recall` is a
one-turn natural-language recall benchmark suitable for repeated A/B samples.
`--routing-guidance off --recall-mode off --writeback-mode off` isolates the
base protocol and tool-schema cost. `--package-root` can point to a built older
worktree for a like-for-like baseline. The harness detects pre-TurnView v0.2
graphs and records their live Runtime projection instead of inventing a View.
The idle-review scenario uses two turns and a short idle interval to measure
the background child-agent path.

The direct component suite covers mutations and boundaries without a model:

```sh
node scripts/evaluation/v0.3/components.mjs \
  --output /private/tmp/dsh-mnemon-v03-components.json
```

Query robustness is measured separately from LLM scheduling. Five fresh native
corpora are queried with natural, sparse, misleading, English, and absent
paraphrases; both versions read each exact same corpus:

```sh
node scripts/evaluation/v0.3/retrieval-benchmark.mjs \
  --baseline-root /private/tmp/dsh-mnemon-eval-v0216 \
  --repetitions 5 \
  --output /private/tmp/dsh-mnemon-v03-retrieval-benchmark.json
```

This reports hit@1, hit@6, empty-result behavior, result characters, and native
tool latency. It does not use a Provider model and therefore must not be used
to infer autonomous tool-choice quality.

The cross-version suite opens one canonical data root in both directions:

```sh
node scripts/evaluation/v0.3/compatibility.mjs \
  --baseline-root /private/tmp/dsh-mnemon-eval-v0216 \
  --output /private/tmp/dsh-mnemon-v0216-v03-compatibility.json
```

The output directory contains the redacted profile patch, seeded corpus
manifest, raw request bodies, durable session events, logs, and generated
analysis. Mock usage is explicitly labelled as a character estimate; only a
real run's `provider-reported` usage is valid for token conclusions.

For a resumable release A/B, run the interleaved suite against a clean v0.2.16
worktree. It alternates baseline/current order to reduce provider and prompt
cache drift, repeats stochastic scenarios, and aggregates median and p95
distributions:

```sh
node scripts/evaluation/v0.3/release-suite.mjs \
  --baseline-root /private/tmp/dsh-mnemon-eval-v0216 \
  --output /private/tmp/dsh-mnemon-v03-release-benchmark-20260824
```

`--mode smoke` reduces every selected case to one sample. `--only` accepts a
comma-separated case list and makes an interrupted suite cheap to resume. A
partial output directory is moved under `_partial/` before retry; completed
runs whose package commit still matches are reused.

In addition to the earlier conversation, autonomous recall, isolated recall,
idle review, capacity, and context matrices, the release suite adds:

- `steady-state`: eight hot-memory or unrelated turns where every memory tool
  call is a false-positive scheduling cost;
- `recall-matrix`: Document, durable-only, missing-history, and irrelevant
  queries in one continuous session, exposing evidence carry-over;
- `runtime-mutations`: add, next-turn visibility, replace, stale suppression,
  remove, and deleted-fact suppression.

The capture proxy forwards real SSE chunks as they arrive and records response
headers, first byte, and completion separately. Analysis schema v2 also reports
turn wall time, memory-tool result characters, tool event latency, failures,
and unexpected memory calls. Provider request latency is still reported, but
must not be mistaken for user wall time because concurrent calls can overlap.
An execution timeout now terminates DSH but still flushes captured requests and
logs before failing the run. `--execution-timeout-ms` can extend the default
300-second ceiling for a diagnostic rerun without changing the release pass
criterion. `--max-tokens` overrides a fixture's root response budget for
diagnostic runs; release-suite measurements always use the fixture default.

Request bodies contain the synthetic evaluation corpus and conversation, so
they should be treated as evaluation evidence rather than committed fixtures.
The harness stores no authorization header and removes its temporary DSH home,
credential copy, workspace, and Mnemon data directory in `finally`.
