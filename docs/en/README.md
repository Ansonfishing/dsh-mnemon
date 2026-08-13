# dsh-mnemon Documentation

[简体中文](../zh-CN/README.md) | **English** | [Back to project home](../../README.en.md)

These documents use the current implementation as the source of truth. The root README provides a quick overview; this section expands on design rationale, boundaries, transactional workflows, configuration, and operations.

## Recommended Reading Path

1. [Getting Started](./getting-started.md): installation, initial configuration, and basic verification.
2. [Architecture](./architecture.md): boundaries between the DSH Host, Web Client, control layer, subagents, and the Mnemon CLI.
3. [Storage and the Three-Layer Memory Model](./storage-model.md): semantics and directory layout of Runtime Memory, Documents, and Memory Spaces.
4. [Lifecycle and Core Workflows](./workflows.md): recall, writes, background review, capacity maintenance, and cold archiving.
5. [Configuration Reference](./configuration.md): all settings, defaults, precedence, and provider requirements.
6. [WebUI, Tools, Commands, and RPC](./interfaces.md): all user-facing and model-facing entry points.
7. [Operations, Security, and Troubleshooting](./operations.md): locks, permissions, backup, recovery, and known limitations.
8. [Development and Verification](./development.md): module structure, tests, builds, and release checks.
9. [Roadmap](./roadmap.md): unfinished reliability, operations, and internationalization work.

## Terminology

| 中文 | English | Meaning |
|---|---|---|
| 记忆体 | Memory Space | A native named Mnemon Store with its own `mnemon.db` |
| 运行时热记忆 | Runtime Memory / hot memory | Compact user profile and working memory injected directly into every turn |
| 项目档案 | Project Documents | Complete Markdown project knowledge managed by the plugin |
| 活跃档案 | Active Document | A Document included in default near-field search |
| 冷归档 | Cold archive | Original text that has a long-term index and does not count toward active capacity |
| 沉淀 | Distill / supervised writeback | Persistent writes after LLM judgment, deduplication, and routing |
| 召回 | Recall | Reading historical evidence from active Memory Spaces |

Brand names, commands, tool names, configuration keys, RPC endpoints, and code symbols remain untranslated.

## Documentation Boundaries

- Current user instructions and repository facts take precedence over historical memory.
- `state/` is currently reserved; background review watermarks still exist only in Host process memory.
- The main Web workspace is available in Chinese and English; command output, tool cards, and some backend diagnostics are not yet fully internationalized.
- `docs/sedimentation-research.md` is a historical research record, not a specification or user guide.
