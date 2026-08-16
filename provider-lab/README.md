# Provider Lab

This localhost-only lab exercises every long-term Memory Provider supported by
`dsh-mnemon`. Private server deployments run in Docker; Mnemon Native and
Holographic remain in-process, while ByteRover remains a host CLI because that
is its official local integration contract.

## Safety boundary

- Every published port binds to `127.0.0.1`.
- The checked-in OpenViking key is deliberately a local demo credential.
- Provider state lives in named Docker volumes and is excluded from Memory
  Space packs.
- Ollama remains on the host and is reached from containers through
  `host.docker.internal`; no content needs to leave the machine.

## Upstream sources and ports

| Provider | Installation | DSH endpoint |
| --- | --- | --- |
| OpenViking | official GHCR image | `http://127.0.0.1:1933` |
| Honcho | official source Dockerfile + Postgres + Redis | `http://127.0.0.1:18000` |
| Mem0 | official self-host server Dockerfile + pgvector | `http://127.0.0.1:18888` |
| Hindsight | official GHCR standalone image | `http://127.0.0.1:18889` |
| RetainDB | official Local Dockerfile | `http://127.0.0.1:18990` |
| Supermemory | official signed release binary wrapped by Docker | `http://127.0.0.1:18787` |

Hindsight's optional control plane is at `http://127.0.0.1:19999`, and the
RetainDB Local viewer is at `http://127.0.0.1:18991`.

## Start

1. Clone the current upstream repositories into one directory with subfolders
   named `honcho`, `mem0`, and `retaindb`.
2. Copy `.env.example` to `.env` and set `PROVIDER_LAB_SOURCES` to that absolute
   directory.
3. Ensure Ollama has `qwen2.5:3b` and `nomic-embed-text`.
4. Run `docker compose up -d --build` from this directory.
5. Run `node scripts/seed-provider-lab.mjs` from the repository root after
   `pnpm run build`. Pass the Supermemory API key printed by its first-boot log
   as `SUPERMEMORY_API_KEY`.

Use `docker compose ps` and `node scripts/probe-provider-lab.mjs` for a concise
health report. The seed command is idempotent by Memory Space name and avoids
overwriting unrelated user Memory Spaces.

