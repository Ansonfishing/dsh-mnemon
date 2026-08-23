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

The output directory contains the redacted profile patch, seeded corpus
manifest, raw request bodies, durable session events, logs, and generated
analysis. Mock usage is explicitly labelled as a character estimate; only a
real run's `provider-reported` usage is valid for token conclusions.
