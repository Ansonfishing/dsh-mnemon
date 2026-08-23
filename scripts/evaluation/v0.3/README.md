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
`--routing-guidance off --recall-mode off --writeback-mode off` isolates the
base protocol and tool-schema cost. `--package-root` can point to a built older
worktree for a like-for-like baseline. The idle-review scenario uses two turns
and a short idle interval to measure the background child-agent path.

The direct component suite covers mutations and boundaries without a model:

```sh
node scripts/evaluation/v0.3/components.mjs \
  --output /private/tmp/dsh-mnemon-v03-components.json
```

The output directory contains the redacted profile patch, seeded corpus
manifest, raw request bodies, durable session events, logs, and generated
analysis. Mock usage is explicitly labelled as a character estimate; only a
real run's `provider-reported` usage is valid for token conclusions.

Request bodies contain the synthetic evaluation corpus and conversation, so
they should be treated as evaluation evidence rather than committed fixtures.
The harness stores no authorization header and removes its temporary DSH home,
credential copy, workspace, and Mnemon data directory in `finally`.
