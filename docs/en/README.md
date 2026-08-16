# dsh-mnemon Documentation

[简体中文](../zh-CN/README.md) | **English** | [Project home](../../README.md)

This hub is organized by what you need to accomplish. New users should follow Getting Started, then use the visual guide for the interface. Reference documents are for deployment, integration, and development work.

## New-user path

1. [Getting Started](./getting-started.md): install Mnemon and the plugin, choose storage, and complete first-run verification.
2. [Sidebar and conversation UI guide](./ui-guide.md): learn Status, Runtime, Memory Spaces, Documents, and in-conversation entry points.
3. [Project overview](./project-overview.md): understand the three-tier model, cross-agent sharing boundary, read/write boundaries, and complete flow.

## Find a task

| I want to… | Document |
|---|---|
| Decide which tier should retain something | [Storage and the three-tier model](./storage-model.md) |
| Share durable memory between DSH and other Mnemon-enabled agents | [Project overview: Cross-agent sharing](./project-overview.md#cross-agent-sharing-boundary) · [Configuration: Sharing scope](./configuration.md#choose-a-cross-agent-sharing-scope) |
| Learn when injection, recall, remembering, and archiving happen | [Lifecycle and workflows](./workflows.md) |
| Switch Sidebar / Buildin or global / workspace / custom storage | [Configuration reference](./configuration.md) |
| Understand workspace inspection versus the Agent's effective directory | [UI guide: Workspace mode](./ui-guide.md#workspace-mode-separating-inspection-from-execution) |
| Check or update Mnemon and dsh-mnemon | [Operations: Version checks and updates](./operations.md#version-checks-and-updates) |
| Back up, restore, or migrate the complete memory root | [Operations: Backup and recovery](./operations.md#backup-and-recovery) |
| Troubleshoot empty recall, misalignment, CLI, or provider errors | [Operations and troubleshooting](./operations.md#troubleshooting) |
| Use model tools, `/mnemon` commands, or internal RPC | [Interface reference](./interfaces.md) |
| Understand Host, workers, control plane, and data plane | [Architecture](./architecture.md) |
| Modify code, screenshots, tests, or releases | [Development and verification](./development.md) |
| See planned work | [Roadmap](./roadmap.md) |

## Core terms

| Term | Code / alternate name | Meaning |
|---|---|---|
| Memory System | 记忆系统 | The complete dsh-mnemon entry in DSH |
| Runtime Memory | USER / MEMORY | Hot memory projected into every turn |
| Project Documents | Documents / 档案 | Managed, searchable project knowledge that keeps full Markdown structure |
| Memory Space | 记忆体 | An independent, activatable, on-demand Mnemon Store |
| Cross-agent memory sharing | 跨 Agent 共享 | Mnemon-enabled agents use the same root and Store to share durable memory, not the complete DSH context |
| Remember | Distill / 沉淀 | Submit a candidate to a supervised subagent for qualification, dedupe, and writing |
| Recall | 召回 | Retrieve bounded evidence from active Memory Spaces |
| Archive | 归档 | Create a cold reference before moving an infrequently used Document out of active storage |

## Documentation boundaries

- User documentation targets the v0.1.5 Sidebar-default experience while covering the compatible Buildin presentation.
- Architecture diagrams describe stable execution boundaries, not live monitoring. Use Status for current counts and versions.
- RPC is an internal Host-to-client protocol, not a promised stable external API.
- There is no formal fixed DSH / Mnemon version matrix yet. Back up and validate in an isolated root before upgrading.
