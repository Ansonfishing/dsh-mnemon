window.__ModuleLoader__.load({
	id: "dsh-mnemon",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/dsh-external/dsh-mnemon/src/client/MnemonSettingsCard.module.css.mjs
		const css$1 = ".j5f0Ia_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;overflow:hidden}.j5f0Ia_panelHeader{box-sizing:border-box;min-height:72px;color:var(--dsw-alias-label-primary);align-items:center;gap:18px;padding:14px 16px;display:flex}.j5f0Ia_panelHeader>div{flex:1;min-width:0}.j5f0Ia_panelHeader h3{margin:0 0 3px;font-size:15px}.j5f0Ia_panelHeader p{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px}.j5f0Ia_panelHeader>strong{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:10px;font-weight:500}.j5f0Ia_body{border-top:1px solid var(--dsw-alias-border-l2);padding:16px}.j5f0Ia_notice{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:9px;margin-bottom:16px;padding:9px 11px;font-size:12px;line-height:18px}.j5f0Ia_notice code{font-family:var(--ds-font-family-code)}.j5f0Ia_primarySettings{gap:14px;max-width:660px;display:grid}.j5f0Ia_field{gap:6px;min-width:0;display:grid}.j5f0Ia_fieldTitle{min-height:18px;color:var(--dsw-alias-label-primary);align-items:center;gap:6px;font-size:12px;font-weight:500;display:flex}.j5f0Ia_fieldTitle em{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover);border-radius:999px;padding:1px 6px;font-size:10px;font-style:normal;font-weight:400}.j5f0Ia_fieldTitle button{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;margin-left:auto;padding:0;font-size:11px}.j5f0Ia_fieldTitle button:hover{color:var(--dsw-alias-label-primary)}.j5f0Ia_field input,.j5f0Ia_field select{box-sizing:border-box;width:100%;height:36px;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2);font-family:var(--ds-font-family-code);border-radius:9px;outline:0;padding:0 10px;font-size:12px}.j5f0Ia_field input:focus,.j5f0Ia_field select:focus{border-color:var(--dsw-alias-state-business-primary)}.j5f0Ia_field small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.j5f0Ia_error,.j5f0Ia_readOnly{margin:12px 0 0;font-size:12px;line-height:18px}.j5f0Ia_error{color:var(--dsw-alias-state-error-primary)}.j5f0Ia_readOnly{color:var(--dsw-alias-label-tertiary)}.j5f0Ia_actions{justify-content:flex-end;gap:8px;margin-top:16px;display:flex}.j5f0Ia_actions button{cursor:pointer;border-radius:9px;height:34px;padding:0 13px;font-size:12px}.j5f0Ia_actions button:disabled{cursor:not-allowed;opacity:.45}.j5f0Ia_discard{color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l2);background:0 0}.j5f0Ia_save{color:#fff;background:var(--dsw-alias-state-business-primary);border:1px solid var(--dsw-alias-state-business-primary)}@media (width<=760px){.j5f0Ia_body{padding:14px}.j5f0Ia_panelHeader{align-items:flex-start}.j5f0Ia_panelHeader>strong{margin-top:4px}}";
		const tagId$1 = "dsh-mnemon/MnemonSettingsCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var MnemonSettingsCard_module_css_default = {
			"card": "j5f0Ia_card",
			"body": "j5f0Ia_body",
			"actions": "j5f0Ia_actions",
			"panelHeader": "j5f0Ia_panelHeader",
			"error": "j5f0Ia_error",
			"primarySettings": "j5f0Ia_primarySettings",
			"notice": "j5f0Ia_notice",
			"field": "j5f0Ia_field",
			"save": "j5f0Ia_save",
			"fieldTitle": "j5f0Ia_fieldTitle",
			"readOnly": "j5f0Ia_readOnly",
			"discard": "j5f0Ia_discard"
		};
		//#endregion
		//#region src/client/locales.ts
		/** Mnemon workspace copy, synchronized with DSH's global locale service. */
		const zh = {
			"tab.label": "记忆体",
			"term.space": "记忆体",
			"term.spaces": "记忆体",
			"category.decision": "决策",
			"category.preference": "偏好",
			"category.fact": "事实",
			"category.insight": "洞察",
			"category.context": "上下文",
			"category.general": "通用",
			"nav.aria": "Mnemon 页面",
			"nav.overview": "总览",
			"nav.overview.detail": "记忆体与实时图谱",
			"nav.runtime": "运行时",
			"nav.runtime.detail": "热记忆与上下文",
			"nav.documents": "档案",
			"nav.documents.detail": "项目知识与冷归档",
			"nav.search": "检索",
			"nav.search.detail": "意图增强召回",
			"nav.entities": "实体",
			"nav.entities.detail": "关系与上下文",
			"nav.remember": "沉淀",
			"nav.remember.detail": "LLM 监督写回",
			"nav.content": "内容",
			"nav.content.detail": "浏览与维护",
			"nav.status": "状态",
			"nav.status.detail": "运行与诊断",
			"common.refresh": "刷新状态",
			"common.loading": "载入中…",
			"common.cancel": "取消",
			"common.copyId": "复制 ID",
			"common.readOnly": "只读模式",
			"common.agentSupervised": "子 Agent 监督",
			"common.active": "已激活",
			"common.inactive": "未激活",
			"common.category": "分类",
			"common.importanceLabel": "重要性",
			"common.importance": "重要性 {value}",
			"common.hops": "{count} 跳",
			"common.allCategories": "全部分类",
			"common.memories": "{count} 条记忆",
			"common.edges": "{count} 条连接",
			"common.count": "{count} 个",
			"header.checking": "检查中",
			"header.connected": "已连接 · {count} 个已激活",
			"header.directoryPending": "已连接 · 目录待同步",
			"header.unavailable": "不可用",
			"header.notReady": "Mnemon 尚未就绪",
			"telemetry.aria": "记忆统计",
			"telemetry.title": "记忆统计",
			"telemetry.memories": "激活记忆",
			"telemetry.graph": "激活图谱",
			"telemetry.entities": "激活实体",
			"telemetry.spaces": "记忆体",
			"sidebar.activeSpaces": "已激活记忆体",
			"overview.title": "记忆体总览",
			"overview.description": "管理全局记忆体的读取边界，并在一张实时四图快照中观察所有已激活记忆体。",
			"overview.interval": "每 15 秒",
			"overview.syncing": "同步中…",
			"overview.syncNow": "立即同步",
			"overview.directory": "记忆体目录",
			"overview.directory.description": "开关只控制读取；写入可选择任意记忆体，写入未激活记忆体后会自动激活。",
			"overview.directory.waiting": "等待目录",
			"overview.directory.unsynced": "目录尚未同步",
			"overview.directory.unsyncedBadge": "目录待同步",
			"overview.storageHealthy": "存储正常",
			"overview.storageUnhealthy": "存储异常",
			"overview.toggleAria": "{name}读取开关",
			"overview.toggling": "切换中",
			"overview.noDescription": "尚未提供路由说明。",
			"overview.unsyncedTitle": "记忆体目录尚未同步",
			"overview.unsyncedShort": "当前 Web 客户端与 DSH Host 状态不一致；重启 Host 后会重新登记既有 Store。",
			"overview.unsyncedLong": "当前 Host 仍在使用旧插件契约；重启 DSH 后会重新发现既有 Store，期间不会删除任何 .db。",
			"overview.emptyTitle": "还没有记忆体",
			"overview.emptyShort": "创建第一个记忆体并写入稳定上下文后，它会出现在这里。",
			"overview.emptyLong": "先在上方创建一个记忆体；首次写入后，它会自动激活并出现在实时快照中。",
			"overview.noActiveTitle": "没有激活的记忆体",
			"overview.noActiveText": "开启至少一个记忆体的读取开关，即可在这里聚合它的实时图谱。",
			"overview.noContentTitle": "已激活记忆体尚无内容",
			"overview.noContentText": "向任意记忆体沉淀稳定上下文后，这里会聚合呈现节点与关系。",
			"overview.create": "＋ 创建空白记忆体",
			"overview.createName": "新记忆体名称",
			"overview.createNamePlaceholder": "名称",
			"overview.createDescription": "新记忆体描述",
			"overview.createDescriptionPlaceholder": "说明哪些内容属于它，以及何时应被召回",
			"overview.creating": "创建中…",
			"overview.createAction": "创建",
			"overview.snapshot": "多记忆体实时快照",
			"overview.waitingSnapshot": "等待首个快照",
			"overview.updatedAt": "更新于 {time}",
			"overview.edgeScope": "空间归属",
			"overview.edgeTemporal": "时间",
			"overview.edgeSemantic": "语义",
			"overview.edgeCausal": "因果",
			"overview.edgeEntity": "实体关联",
			"overview.graphComposition": "{spaces} 个空间 · {memories} 条记忆 · {entities} 个实体",
			"overview.graphCount": "展示 {visible} / {total} 个元素",
			"overview.graphEdges": "{count} 条图谱连接",
			"overview.inspector": "记忆详情",
			"overview.inspectorSpace": "记忆体详情",
			"overview.inspectorEntity": "实体详情",
			"overview.selectNode": "选择一个图谱元素",
			"overview.selectNodeText": "查看记忆体、实体或记忆的精确上下文。",
			"overview.closeInspector": "关闭节点详情",
			"overview.memoryId": "记忆 ID",
			"overview.spaceId": "记忆体 ID",
			"overview.containedMemories": "包含记忆",
			"overview.entityMentions": "索引次数",
			"overview.exploreNode": "围绕它检索",
			"overview.loading": "正在同步记忆体目录与多库图谱…",
			"runtime.title": "运行时记忆",
			"runtime.description": "管理每轮随上下文加载的紧凑热记忆。结构化数据由统一控制层维护，并自动投影为 USER.md 与 MEMORY.md。",
			"runtime.total": "{count} 条热记忆",
			"runtime.refresh": "刷新",
			"runtime.hotContext": "每轮上下文",
			"runtime.addTitle": "添加热记忆",
			"runtime.addDescription": "稳定但仍需频繁使用的信息优先留在这里，长期归档由 Mnemon 记忆体承接。",
			"runtime.content": "运行时记忆内容",
			"runtime.placeholder": "输入一条简洁、独立、未来仍然有用的信息…",
			"runtime.target": "分类",
			"runtime.importance": "重要性",
			"runtime.saving": "处理中…",
			"runtime.addAction": "添加",
			"runtime.target.user": "用户画像",
			"runtime.target.user.description": "身份、角色、习惯、表达偏好与明确的协作要求；容量整理始终留在本地，不进入记忆体。",
			"runtime.target.memory": "工作记忆",
			"runtime.target.memory.description": "项目、环境、决策、约定、工具特性与可复用经验；容量达到上限时按主题归档到一个或多个记忆体。",
			"runtime.importance.critical": "关键",
			"runtime.importance.normal": "普通",
			"runtime.importance.low": "低",
			"runtime.empty": "这个分类还没有热记忆。",
			"runtime.editContent": "编辑运行时记忆",
			"runtime.editAction": "编辑",
			"runtime.saveEdit": "保存修改",
			"runtime.removeAction": "移除",
			"runtime.removeConfirm": "确认移除这条热记忆？",
			"runtime.result.add": "已添加到{target} · 当前 {count} 条",
			"runtime.result.replace": "已更新{target} · 当前 {count} 条",
			"runtime.result.remove": "已从{target}移除 · 当前 {count} 条",
			"runtime.result.maintenance": "容量整理完成：已先归档到记忆体 {spaces}，再更新{target} · 当前 {count} 条",
			"runtime.result.localCompaction": "本地画像整理完成：未写入记忆体，已更新{target} · 当前 {count} 条",
			"runtime.readOnly": "当前部署为只读模式；热记忆仍会进入上下文，但不能在此修改。",
			"runtime.footnote": "memories.json 是唯一事实源；两个 Markdown 文件由控制层生成，不应直接编辑。",
			"documents.title": "项目档案",
			"documents.description": "在当前工作区维护结构化的项目文档。活跃档案参与近场检索；达到 10 MB 上限前，最久未使用的档案会先在 Mnemon 中建立索引，再迁入冷归档。",
			"documents.capacity": "{used} / {limit}",
			"documents.refresh": "刷新",
			"documents.summary": "档案存储摘要",
			"documents.active": "活跃档案",
			"documents.activeHint": "近场检索范围",
			"documents.archivedCount": "冷归档",
			"documents.archivedHint": "不占活跃容量",
			"documents.activeCapacity": "活跃容量",
			"documents.capacityHint": "按实际 UTF-8 文件大小计算",
			"documents.searchAria": "检索项目档案",
			"documents.searchPlaceholder": "搜索设计、调查、流程或交接记录…",
			"documents.search": "检索",
			"documents.scope": "档案范围",
			"documents.new": "新建档案",
			"documents.newTitle": "创建托管档案",
			"documents.editTitle": "编辑活跃档案",
			"documents.editorHint": "控制层会生成 frontmatter、哈希与修订号；原项目文件始终只读。",
			"documents.managedCopy": "托管副本",
			"documents.name": "标题",
			"documents.routing": "检索说明",
			"documents.sources": "来源路径",
			"documents.sourcesPlaceholder": "src/index.ts, docs/architecture.md",
			"documents.markdown": "Markdown 内容",
			"documents.saving": "保存中…",
			"documents.create": "创建档案",
			"documents.save": "保存修订",
			"documents.created": "已创建活跃档案。",
			"documents.createdAfterArchive": "已先迁移 {count} 份旧档案，再创建活跃档案。",
			"documents.updated": "已保存新的档案修订。",
			"documents.updatedAfterArchive": "已先迁移 {count} 份旧档案，再保存修订。",
			"documents.archived": "已建立 Mnemon 冷索引并归档；关联记忆体：{spaces}",
			"documents.list": "项目档案列表",
			"documents.activeList": "活跃目录",
			"documents.archiveList": "冷归档目录",
			"documents.noDescription": "暂无检索说明。",
			"documents.missing": "文件缺失",
			"documents.emptyActive": "还没有活跃档案",
			"documents.emptyActiveText": "复杂对话达到活动评分门槛后会自动审阅并整理档案，也可以在上方手动创建。",
			"documents.emptyArchived": "还没有冷归档",
			"documents.emptyArchivedText": "只有完成 Mnemon 索引的档案才会迁移到这里。",
			"documents.reader": "档案阅读器",
			"documents.selectTitle": "选择一份档案",
			"documents.selectText": "在左侧查看活跃项目知识或沿 Mnemon 引用打开冷归档原文。",
			"documents.coldArchive": "冷归档原文",
			"documents.edit": "编辑",
			"documents.path": "托管路径",
			"documents.revision": "修订",
			"documents.hash": "内容哈希",
			"documents.size": "文件大小",
			"documents.archiveReceipt": "Mnemon 冷索引回执",
			"documents.archiveTitle": "迁入冷归档",
			"documents.archiveDescription": "先由受限子 Agent 写入可检索的 Mnemon 摘要和精确路径，成功后才移动原文。",
			"documents.archive": "归档",
			"documents.archiveConfirm": "确认建立 Mnemon 索引并迁移这份档案？",
			"documents.archiving": "索引并迁移中…",
			"documents.archiveNow": "确认归档",
			"documents.footnote": "`.mnemon/documents/index.json` 是控制面事实源；active 总量固定不超过 10 MB，archived 不计入上限，项目源文件不会被修改。",
			"graph.layoutAria": "图谱布局",
			"graph.layoutNatural": "自然布局",
			"graph.layoutUniform": "均匀布局",
			"graph.layoutCustom": "自定义布局",
			"graph.layoutStatus": "布局状态：{layout}",
			"graph.draggable": "{layout} · 可拖拽",
			"graph.naturalAction": "自然铺开",
			"graph.uniformAction": "均匀重置",
			"graph.aria": "Mnemon 实时记忆图谱，{nodes} 个元素，{edges} 条连接",
			"graph.kindSpace": "记忆体",
			"graph.kindEntity": "实体",
			"card.confirmAria": "确认忘记记忆",
			"card.confirmText": "软删除这条记忆？",
			"card.processing": "处理中…",
			"card.confirmForget": "确认忘记",
			"card.related": "查看关联",
			"card.clone": "基于此新建",
			"card.forget": "忘记",
			"search.title": "检索记忆",
			"search.description": "直连 Mnemon 检索原始证据；需要时可让 Agent 只基于命中内容生成答案。",
			"search.maxResults": "最多 {count} 条",
			"search.placeholder": "为什么选用 SQLite？这个项目有哪些发布约定？",
			"search.queryAria": "记忆查询",
			"search.categoryAria": "记忆分类",
			"search.strategy": "策略",
			"search.modeAria": "检索模式",
			"search.modeSmart": "图增强召回",
			"search.modeKeyword": "关键词检索",
			"search.modeBasic": "基础匹配",
			"search.searching": "检索中…",
			"search.action": "直接检索",
			"search.agentAction": "Agent 查询",
			"search.agentSearching": "Agent 分析中…",
			"search.agentAnswer": "Agent 查询结果",
			"search.agentAnswerHint": "基于下方召回证据",
			"search.startTitle": "从一个明确问题开始",
			"search.startText": "聚焦实体、决策或时间线，比批量加载整库更可靠。",
			"search.emptyTitle": "没有命中",
			"search.emptyText": "换一个更具体的实体、决策或时间线关键词试试。",
			"search.results": "原始召回内容",
			"search.related": "关联记忆",
			"search.closeRelated": "关闭关联记忆",
			"search.traversing": "正在遍历图谱…",
			"search.noRelated": "没有找到两跳内的关联节点。",
			"entities.title": "实体查阅",
			"entities.description": "直连 Mnemon 查阅实体跨越事实、决策与上下文的关系。",
			"entities.count": "{count} 个活跃实体",
			"entities.nameAria": "实体名称",
			"entities.placeholder": "输入任意实体…",
			"entities.action": "查阅",
			"entities.top": "高频实体",
			"entities.frequency": "按出现频率",
			"entities.emptyRail": "写入带实体的记忆后，这里会形成入口。",
			"entities.loading": "正在沿实体关系召回…",
			"entities.selectTitle": "选择或输入一个实体",
			"entities.selectText": "实体视图会聚合与它相关的记忆，而不是只做字面匹配。",
			"entities.emptyTitle": "没有关联记忆",
			"entities.emptyText": "尝试更完整的名称或另一个实体别名。",
			"remember.title": "沉淀记忆",
			"remember.description": "候选内容会进入隔离的记忆子 Agent，由它选择记忆体、查重、提炼并执行写入，不占用主对话上下文。",
			"remember.worker": "记忆子 Agent",
			"remember.readOnlyTitle": "当前为只读模式",
			"remember.readOnlyText": "当前部署禁止记忆写入；如需调整，请修改 DSH 的 Mnemon 配置并重启。",
			"remember.flowTitle": "记忆子 Agent 会完成什么",
			"remember.routeTitle": "判断归属",
			"remember.routeText": "选择既有记忆体，必要时判断是否形成新范围",
			"remember.dedupeTitle": "检索查重",
			"remember.dedupeText": "识别重复、补充或冲突的旧记忆",
			"remember.writeTitle": "结构化写入",
			"remember.writeText": "提炼内容、元数据与必要关系并返回回执",
			"remember.flowText": "子 Agent 只拥有 Mnemon 工具，原始目录和检索过程不会挤占主对话上下文。",
			"remember.delegateTitle": "交给记忆子 Agent",
			"remember.noSession": "无可用会话",
			"remember.ready": "子 Agent 就绪",
			"remember.candidate": "候选内容",
			"remember.candidateAria": "待沉淀内容",
			"remember.placeholder": "输入希望跨任务保留的背景、偏好、决策或洞察。模型会先判断它是否真的值得沉淀。",
			"remember.sessionHint": "当前视图没有绑定活动会话，无法创建记忆子 Agent。",
			"remember.processing": "记忆子 Agent 处理中…",
			"remember.action": "调度子 Agent 判断并沉淀",
			"remember.advanced": "人工高级选项",
			"remember.advancedHint": "为记忆子 Agent 指定目标记忆体与元数据约束",
			"remember.expand": "展开",
			"remember.target": "目标记忆体",
			"remember.entities": "实体（逗号分隔）",
			"remember.tags": "标签（逗号分隔）",
			"remember.advancedText": "高级选项是约束而不是绕过监督；记忆子 Agent 仍会查重并返回结构化回执。",
			"remember.saving": "子 Agent 写入中…",
			"remember.advancedAction": "按高级约束沉淀",
			"remember.skipped": "记忆子 Agent 判断无需写入",
			"remember.completed": "记忆子 Agent 已完成处理",
			"remember.processed": "记忆子 Agent 已处理：{action}",
			"remember.dispatchFailed": "调度失败：{error}",
			"remember.saveFailed": "保存失败：{error}",
			"content.title": "记忆内容",
			"content.description": "无副作用浏览所有已激活记忆体；每条内容都会标明所属记忆体，可继续查阅或维护。",
			"content.count": "{count} 条记忆",
			"content.filterAria": "筛选记忆内容",
			"content.filterPlaceholder": "按内容或精确 ID 筛选…",
			"content.categoryAria": "记忆分类",
			"content.apply": "应用筛选",
			"content.notice": "内容列表读取已激活记忆体的图谱快照，不会增加 recall 访问计数。",
			"content.emptyTitle": "没有符合条件的记忆",
			"content.emptyText": "清空筛选，或前往“沉淀”写入第一条稳定上下文。",
			"status.title": "系统状态",
			"status.description": "聚焦 Mnemon 引擎、记忆体目录和子 Agent 编排；连接配置由 DSH 部署统一管理。",
			"status.nominal": "系统正常",
			"status.checkRequired": "需要检查",
			"status.rechecking": "检查中…",
			"status.recheck": "重新检查",
			"status.aria": "Mnemon 运行状态",
			"status.engine": "记忆引擎",
			"status.engineConnected": "Mnemon 已连接",
			"status.engineUnavailable": "Mnemon 不可用",
			"status.versionWaiting": "等待版本信息",
			"status.spaces": "记忆体",
			"status.activeRatio": "{active} / {total} 已激活",
			"status.directoryUnsynced": "目录尚未同步",
			"status.activeMemories": "{count} 条激活记忆",
			"status.documents": "项目档案",
			"status.documentsWaiting": "等待工作区",
			"status.documentsSession": "绑定活动会话后可用",
			"status.documentRatio": "{active} 份活跃 · {archived} 份冷归档",
			"status.documentUsage": "{used} / {limit} 活跃容量",
			"status.router": "子 Agent 路由",
			"status.routerReady": "记忆子 Agent 可用",
			"status.sessionMissing": "当前会话未绑定",
			"status.orchestrationWaiting": "等待编排状态",
			"status.workerCounts": "召回 {recalls} · 问答 {answers} · 审查 {reviews} · 档案迁移 {documentArchives} · 热记忆归档 {migrations} · 常规写入 {writes}",
			"status.workerSummary": "召回 {recalls} · 审查 {reviews} · 写入 {writes} · 失败 {failures}",
			"status.lifecycle": "子 Agent 生命周期",
			"status.lifecycleText": "pre-step 只提供短提示；后台按用户输入、turn、工具调用量与工具多样性累计评分，达标并持续空闲后，由一个 fork 子 Agent 同时审阅热记忆与复杂项目档案。",
			"status.phaseIdle": "待命",
			"status.phaseSupervised": "受监督请求",
			"status.phaseError": "异常",
			"status.phaseReview": "后台审查",
			"status.prime": "轻量预备",
			"status.primeText": "初始化路由状态，不读取目录或记忆",
			"status.recallWorker": "召回处理",
			"status.recallText": "pre-step 只提醒判断，主模型按需发起召回",
			"status.recallOff": "自动召回已关闭",
			"status.writeWorker": "评分审查",
			"status.writeText": "活动评分达到 {threshold} 后再等待空闲 {seconds} 秒，fork 完整 checkpoint 按需维护热记忆与项目档案",
			"status.writeOff": "后台审查已关闭",
			"status.latestPhase": "最近阶段",
			"status.latestActivity": "最近活动",
			"status.reviewState": "审查状态",
			"status.reviewPending": "评分已达标，等待空闲",
			"status.reviewRunning": "正在审查",
			"status.reviewQualified": "评分已达标，等待本轮完成",
			"status.reviewAccumulating": "累计信号中",
			"status.reviewIdle": "累计信号中",
			"status.activityScore": "活动评分",
			"status.activitySignals": "累计信号",
			"status.activitySignalValues": "{chars} 字符 · {turns} turn · {tools} 次工具 · {unique} 种工具",
			"status.lastReview": "最近审查",
			"status.noReview": "尚未执行",
			"status.reviewAt": "{time} · {action} · 触发分 {score}",
			"status.supervisedRequests": "受监督请求",
			"status.workerFailures": "子 Agent 失败",
			"status.reviewDocuments": "最近更新档案",
			"status.noActivity": "尚无运行记录",
			"status.quickDiagnostics": "快速诊断",
			"status.cliExecutable": "Mnemon CLI 可执行",
			"status.cliMissing": "Mnemon CLI 未找到",
			"status.readingSpaces": "{count} 个记忆体参与读取",
			"status.directoryWaiting": "记忆体目录等待 Host 同步",
			"status.webAgentReady": "WebUI 可创建隔离记忆子 Agent",
			"status.liveSessionMissing": "缺少活动会话",
			"status.lifecycleFailures": "生命周期失败 {count} 次",
			"status.documentsUnavailable": "当前会话的档案目录不可用",
			"status.documentsHealthy": "{count} 份活跃档案可参与近场检索",
			"status.nativeAccess": "原生命令",
			"status.nativeAccessText": "模型侧使用原生 mnemon_* 工具；人工命令不会绕入模型。",
			"status.engineStorage": "引擎与存储",
			"status.online": "在线",
			"status.offline": "离线",
			"status.mnemonVersion": "Mnemon 版本",
			"status.directory": "记忆体目录",
			"status.activeDbSize": "激活数据库大小",
			"status.activeCount": "已激活",
			"status.activeGraphEdges": "激活图谱连接",
			"status.documentDirectory": "项目档案目录",
			"status.activeDocuments": "活跃档案",
			"status.coldDocuments": "冷归档",
			"status.documentCapacity": "活跃档案容量",
			"status.storageDomains": "存储域",
			"status.storageDomainsText": "当前选择决定热记忆、记忆体、项目档案和后台状态共同使用的目录边界。",
			"status.storageBrowseOnly": "查看不会切换写入",
			"status.storageScopeAria": "选择要查看的存储域",
			"status.storageGlobal": "全局",
			"status.storageWorkspace": "工作区",
			"status.storageCustom": "自定义",
			"status.storageCurrent": "当前读写",
			"status.storageWaiting": "正在读取存储域目录…",
			"status.storageCustomUnset": "尚未配置自定义目录。当前只展示已经由 DSH 配置并启用的自定义根。",
			"status.storageWorkspaceUnavailable": "当前会话没有可用的工作区目录。",
			"status.storageActiveRoot": "当前读写根",
			"status.storageViewedRoot": "查看根",
			"status.storageAvailable": "目录可用",
			"status.storageNotCreated": "目录尚未创建",
			"status.storageRuntime": "运行时记忆",
			"status.storageBodies": "记忆体",
			"status.storageDocuments": "项目档案",
			"status.storageState": "后台状态",
			"status.storageReady": "正常",
			"status.storageEmpty": "空",
			"status.storageMissing": "未创建",
			"status.storageInvalid": "需修复",
			"status.storageItems": "项",
			"status.storageRuntimeDetail": "USER {user} · MEMORY {memory}",
			"status.storageBodiesDetail": "{active} 个激活 · {databases} 个数据库",
			"status.storageDocumentsDetail": "{active} 份活跃 · {archived} 份冷归档",
			"status.storageStateReady": "审阅水位已经持久化",
			"status.storageStateVolatile": "当前审阅状态仍由 Host 进程维护",
			"status.storageFootnote": "当前实际读写根：{root}。存储范围只在 DSH「设置 → 插件配置 → Mnemon」中修改，重启后生效；插件不会自动迁移、合并或删除旧内容。",
			"status.flowTitle": "记忆系统流转",
			"status.flowDescription": "对话由监督层分类进入热记忆、项目档案或长期记忆体；随后按场景回到每轮上下文。",
			"status.flowLive": "实时状态",
			"status.flowDegraded": "部分不可用",
			"status.flowConversation": "对话与工具轨迹",
			"status.flowTurns": "用户输入 · Agent 结果 · 工具事件",
			"status.flowSupervisor": "LLM 监督层",
			"status.flowEntries": "{count} 条热记忆",
			"status.flowDocuments": "{active} 份活跃 · {archived} 份冷归档",
			"status.flowContext": "Agent 上下文",
			"status.flowContextDetail": "热注入 · 近场检索 · 按需召回",
			"status.flowReadWrite": "上下文与路由流",
			"status.flowArchive": "容量迁移与冷归档",
			"status.flowCurrentScope": "当前范围：{scope}",
			"config.aria": "Mnemon 插件配置",
			"config.description": "为运行时记忆、项目档案、记忆体和后台状态选择同一个存储边界。",
			"config.unsaved": "有未保存修改",
			"config.restart": "重启后生效",
			"config.noticeBefore": "配置写入",
			"config.noticeAfter": "，重启 DSH 后应用；切换范围不会自动迁移旧内容。",
			"config.scope": "存储范围",
			"config.scopeHint": "全局供所有工作区共享；工作区使用 DSH 启动目录；自定义使用指定目录。",
			"config.scopeAria": "Mnemon 存储范围",
			"config.global": "全局",
			"config.workspace": "工作区",
			"config.custom": "自定义目录",
			"config.customDirectory": "自定义目录",
			"config.customHint": "必须为绝对路径或以 ~/ 开头；整个 Mnemon 数据域都位于此处。",
			"config.customAria": "Mnemon 自定义数据目录",
			"config.invalidScope": "存储范围无效。",
			"config.customRequired": "选择自定义存储时必须填写数据目录。",
			"config.customAbsolute": "自定义目录必须是绝对路径或以 ~/ 开头。",
			"config.saveFailed": "保存失败：{error}",
			"config.readOnly": "当前部署的插件设置为只读。",
			"config.discard": "放弃修改",
			"config.saving": "保存中…",
			"config.save": "保存到 settings.yaml",
			"config.overridden": "已覆盖",
			"config.reset": "恢复默认"
		};
		const en = {
			"tab.label": "Memory",
			"term.space": "Memory Space",
			"term.spaces": "Memory Spaces",
			"category.decision": "Decision",
			"category.preference": "Preference",
			"category.fact": "Fact",
			"category.insight": "Insight",
			"category.context": "Context",
			"category.general": "General",
			"nav.aria": "Mnemon pages",
			"nav.overview": "Overview",
			"nav.overview.detail": "Spaces and live graph",
			"nav.runtime": "Runtime",
			"nav.runtime.detail": "Hot memory and context",
			"nav.documents": "Documents",
			"nav.documents.detail": "Project knowledge and cold archive",
			"nav.search": "Recall",
			"nav.search.detail": "Intent-aware retrieval",
			"nav.entities": "Entities",
			"nav.entities.detail": "Relations and context",
			"nav.remember": "Distill",
			"nav.remember.detail": "LLM-supervised writeback",
			"nav.content": "Content",
			"nav.content.detail": "Browse and maintain",
			"nav.status": "Status",
			"nav.status.detail": "Runtime and diagnostics",
			"common.refresh": "Refresh status",
			"common.loading": "Loading…",
			"common.cancel": "Cancel",
			"common.copyId": "Copy ID",
			"common.readOnly": "Read only",
			"common.agentSupervised": "Subagent supervised",
			"common.active": "Active",
			"common.inactive": "Inactive",
			"common.category": "Category",
			"common.importanceLabel": "Importance",
			"common.importance": "Importance {value}",
			"common.hops": "{count} hops",
			"common.allCategories": "All categories",
			"common.memories": "{count} memories",
			"common.edges": "{count} edges",
			"common.count": "{count}",
			"header.checking": "Checking",
			"header.connected": "Connected · {count} active",
			"header.directoryPending": "Connected · directory pending",
			"header.unavailable": "Unavailable",
			"header.notReady": "Mnemon is not ready",
			"telemetry.aria": "Memory statistics",
			"telemetry.title": "Memory statistics",
			"telemetry.memories": "Active memories",
			"telemetry.graph": "Active graph",
			"telemetry.entities": "Active entities",
			"telemetry.spaces": "Spaces",
			"sidebar.activeSpaces": "Active Memory Spaces",
			"overview.title": "Memory Overview",
			"overview.description": "Control the global read boundary and inspect all active Memory Spaces in one live four-graph snapshot.",
			"overview.interval": "Every 15 seconds",
			"overview.syncing": "Syncing…",
			"overview.syncNow": "Sync now",
			"overview.directory": "Memory Space Directory",
			"overview.directory.description": "Activation controls reads only. Writes may target any space and automatically activate an inactive target.",
			"overview.directory.waiting": "Waiting for directory",
			"overview.directory.unsynced": "Directory not synchronized",
			"overview.directory.unsyncedBadge": "Directory pending",
			"overview.storageHealthy": "Storage healthy",
			"overview.storageUnhealthy": "Storage unavailable",
			"overview.toggleAria": "{name} read toggle",
			"overview.toggling": "Switching",
			"overview.noDescription": "No routing description yet.",
			"overview.unsyncedTitle": "Memory Space directory is not synchronized",
			"overview.unsyncedShort": "The Web client and DSH Host are using different contracts. Restart the Host to register existing Stores.",
			"overview.unsyncedLong": "The Host is still using the previous plugin contract. Restart DSH to rediscover existing Stores; no .db file will be deleted.",
			"overview.emptyTitle": "No Memory Spaces yet",
			"overview.emptyShort": "Create the first space and distill durable context into it.",
			"overview.emptyLong": "Create a Memory Space above. Its first write will activate it and add it to the live snapshot.",
			"overview.noActiveTitle": "No active Memory Spaces",
			"overview.noActiveText": "Enable read access for at least one space to aggregate its live graph here.",
			"overview.noContentTitle": "Active spaces have no content yet",
			"overview.noContentText": "Distill durable context into a space to populate nodes and relations.",
			"overview.create": "+ Create empty Memory Space",
			"overview.createName": "New Memory Space name",
			"overview.createNamePlaceholder": "Name",
			"overview.createDescription": "New Memory Space description",
			"overview.createDescriptionPlaceholder": "Describe what belongs here and when it should be recalled",
			"overview.creating": "Creating…",
			"overview.createAction": "Create",
			"overview.snapshot": "Live multi-space snapshot",
			"overview.waitingSnapshot": "Waiting for the first snapshot",
			"overview.updatedAt": "Updated at {time}",
			"overview.edgeScope": "Space scope",
			"overview.edgeTemporal": "Temporal",
			"overview.edgeSemantic": "Semantic",
			"overview.edgeCausal": "Causal",
			"overview.edgeEntity": "Entity relation",
			"overview.graphComposition": "{spaces} spaces · {memories} memories · {entities} entities",
			"overview.graphCount": "Showing {visible} / {total} elements",
			"overview.graphEdges": "{count} graph edges",
			"overview.inspector": "Memory details",
			"overview.inspectorSpace": "Memory Space details",
			"overview.inspectorEntity": "Entity details",
			"overview.selectNode": "Select a graph element",
			"overview.selectNodeText": "Inspect the exact context for a Memory Space, entity, or memory.",
			"overview.closeInspector": "Close node details",
			"overview.memoryId": "Memory ID",
			"overview.spaceId": "Memory Space ID",
			"overview.containedMemories": "Contained memories",
			"overview.entityMentions": "Indexed mentions",
			"overview.exploreNode": "Recall around this",
			"overview.loading": "Synchronizing the directory and multi-space graph…",
			"runtime.title": "Runtime Memory",
			"runtime.description": "Manage compact hot memory loaded into every turn. A single control plane owns structured data and projects USER.md and MEMORY.md.",
			"runtime.total": "{count} hot memories",
			"runtime.refresh": "Refresh",
			"runtime.hotContext": "Every-turn context",
			"runtime.addTitle": "Add hot memory",
			"runtime.addDescription": "Keep stable, frequently useful information here; Mnemon Memory Spaces remain the durable archive.",
			"runtime.content": "Runtime memory content",
			"runtime.placeholder": "Enter one compact, self-contained fact that will remain useful…",
			"runtime.target": "Target",
			"runtime.importance": "Importance",
			"runtime.saving": "Working…",
			"runtime.addAction": "Add",
			"runtime.target.user": "User Profile",
			"runtime.target.user.description": "Identity, role, habits, communication preferences, and explicit collaboration requirements. Capacity maintenance stays local and never enters a Memory Space.",
			"runtime.target.memory": "Working Memory",
			"runtime.target.memory.description": "Projects, environment, decisions, conventions, tool behavior, and reusable lessons. At capacity, entries are routed into one or more topic-specific Memory Spaces.",
			"runtime.importance.critical": "Critical",
			"runtime.importance.normal": "Normal",
			"runtime.importance.low": "Low",
			"runtime.empty": "No hot memory in this target yet.",
			"runtime.editContent": "Edit runtime memory",
			"runtime.editAction": "Edit",
			"runtime.saveEdit": "Save change",
			"runtime.removeAction": "Remove",
			"runtime.removeConfirm": "Remove this hot-memory entry?",
			"runtime.result.add": "Added to {target} · {count} entries",
			"runtime.result.replace": "Updated {target} · {count} entries",
			"runtime.result.remove": "Removed from {target} · {count} entries",
			"runtime.result.maintenance": "Capacity maintenance complete: archived to {spaces}, then updated {target} · {count} entries",
			"runtime.result.localCompaction": "Local profile compaction complete: no Memory Space write; updated {target} · {count} entries",
			"runtime.readOnly": "This deployment is read only. Hot memory still enters context but cannot be changed here.",
			"runtime.footnote": "memories.json is the only source of truth. The control plane generates both Markdown files; do not edit them directly.",
			"documents.title": "Project Documents",
			"documents.description": "Maintain structured project documents in the current workspace. Active documents support near-field search; before the 10 MB limit is exceeded, the least-recently-used document is indexed in Mnemon and moved to cold storage.",
			"documents.capacity": "{used} / {limit}",
			"documents.refresh": "Refresh",
			"documents.summary": "Document storage summary",
			"documents.active": "Active",
			"documents.activeHint": "Near-field search scope",
			"documents.archivedCount": "Cold archive",
			"documents.archivedHint": "Excluded from active capacity",
			"documents.activeCapacity": "Active capacity",
			"documents.capacityHint": "Measured from actual UTF-8 files",
			"documents.searchAria": "Search project documents",
			"documents.searchPlaceholder": "Search designs, investigations, procedures, or handoffs…",
			"documents.search": "Search",
			"documents.scope": "Document scope",
			"documents.new": "New document",
			"documents.newTitle": "Create managed document",
			"documents.editTitle": "Edit active document",
			"documents.editorHint": "The control plane generates frontmatter, hashes, and revisions. Project source files stay read only.",
			"documents.managedCopy": "Managed copy",
			"documents.name": "Title",
			"documents.routing": "Retrieval description",
			"documents.sources": "Source paths",
			"documents.sourcesPlaceholder": "src/index.ts, docs/architecture.md",
			"documents.markdown": "Markdown content",
			"documents.saving": "Saving…",
			"documents.create": "Create document",
			"documents.save": "Save revision",
			"documents.created": "Active document created.",
			"documents.createdAfterArchive": "Archived {count} older document(s), then created the active document.",
			"documents.updated": "New document revision saved.",
			"documents.updatedAfterArchive": "Archived {count} older document(s), then saved the revision.",
			"documents.archived": "Mnemon cold index created and document archived; Memory Spaces: {spaces}",
			"documents.list": "Project document list",
			"documents.activeList": "Active directory",
			"documents.archiveList": "Cold archive directory",
			"documents.noDescription": "No retrieval description.",
			"documents.missing": "File missing",
			"documents.emptyActive": "No active documents yet",
			"documents.emptyActiveText": "Complex work is reviewed after it reaches the activity-score gate, or you can create a Document above.",
			"documents.emptyArchived": "No cold archives yet",
			"documents.emptyArchivedText": "Only documents with a completed Mnemon index are moved here.",
			"documents.reader": "Document reader",
			"documents.selectTitle": "Select a document",
			"documents.selectText": "Read active project knowledge or follow a Mnemon reference to a cold archived original.",
			"documents.coldArchive": "Cold archived original",
			"documents.edit": "Edit",
			"documents.path": "Managed path",
			"documents.revision": "Revision",
			"documents.hash": "Content hash",
			"documents.size": "File size",
			"documents.archiveReceipt": "Mnemon cold-index receipt",
			"documents.archiveTitle": "Move to cold archive",
			"documents.archiveDescription": "A restricted subagent first stores a searchable Mnemon summary and exact path. The original moves only after that succeeds.",
			"documents.archive": "Archive",
			"documents.archiveConfirm": "Create the Mnemon index and archive this document?",
			"documents.archiving": "Indexing and moving…",
			"documents.archiveNow": "Confirm archive",
			"documents.footnote": "`.mnemon/documents/index.json` is the control-plane source of truth. active stays at or below 10 MB, archived is excluded, and project source files are never modified.",
			"graph.layoutAria": "Graph layout",
			"graph.layoutNatural": "Natural layout",
			"graph.layoutUniform": "Uniform layout",
			"graph.layoutCustom": "Custom layout",
			"graph.layoutStatus": "Layout: {layout}",
			"graph.draggable": "{layout} · draggable",
			"graph.naturalAction": "Natural spread",
			"graph.uniformAction": "Uniform reset",
			"graph.aria": "Mnemon live memory graph with {nodes} elements and {edges} edges",
			"graph.kindSpace": "Memory Space",
			"graph.kindEntity": "Entity",
			"card.confirmAria": "Confirm forgetting memory",
			"card.confirmText": "Soft-delete this memory?",
			"card.processing": "Processing…",
			"card.confirmForget": "Confirm forget",
			"card.related": "View related",
			"card.clone": "Create from this",
			"card.forget": "Forget",
			"search.title": "Recall Memory",
			"search.description": "Query raw Mnemon evidence directly, then optionally ask an Agent to answer from those matches only.",
			"search.maxResults": "Up to {count} results",
			"search.placeholder": "Why did we choose SQLite? What release conventions apply?",
			"search.queryAria": "Memory query",
			"search.categoryAria": "Memory category",
			"search.strategy": "Strategy",
			"search.modeAria": "Recall mode",
			"search.modeSmart": "Graph-enhanced recall",
			"search.modeKeyword": "Keyword search",
			"search.modeBasic": "Basic match",
			"search.searching": "Recalling…",
			"search.action": "Direct search",
			"search.agentAction": "Ask Agent",
			"search.agentSearching": "Agent analyzing…",
			"search.agentAnswer": "Agent answer",
			"search.agentAnswerHint": "Grounded in the recalled evidence below",
			"search.startTitle": "Start with a focused question",
			"search.startText": "A focused entity, decision, or timeline is more reliable than loading the whole database.",
			"search.emptyTitle": "No matches",
			"search.emptyText": "Try a more specific entity, decision, or timeline keyword.",
			"search.results": "Raw recalled evidence",
			"search.related": "Related memories",
			"search.closeRelated": "Close related memories",
			"search.traversing": "Traversing the graph…",
			"search.noRelated": "No related nodes found within two hops.",
			"entities.title": "Entity Explorer",
			"entities.description": "Query Mnemon directly for an entity's facts, decisions, and context.",
			"entities.count": "{count} active entities",
			"entities.nameAria": "Entity name",
			"entities.placeholder": "Enter any entity…",
			"entities.action": "Explore",
			"entities.top": "Top entities",
			"entities.frequency": "By frequency",
			"entities.emptyRail": "Entities appear here after memories with entity metadata are stored.",
			"entities.loading": "Recalling entity relations…",
			"entities.selectTitle": "Select or enter an entity",
			"entities.selectText": "The entity view aggregates related memories instead of relying on literal matching.",
			"entities.emptyTitle": "No related memories",
			"entities.emptyText": "Try the full name or another entity alias.",
			"remember.title": "Distill Memory",
			"remember.description": "An isolated memory subagent selects a Memory Space, checks duplicates, distills the candidate, and completes the write without filling the main conversation context.",
			"remember.worker": "Memory subagent",
			"remember.readOnlyTitle": "Read-only mode",
			"remember.readOnlyText": "This deployment disables memory writes. Change the DSH Mnemon configuration and restart to enable them.",
			"remember.flowTitle": "What the memory subagent does",
			"remember.routeTitle": "Choose ownership",
			"remember.routeText": "Select an existing Memory Space or recognize a durable new scope",
			"remember.dedupeTitle": "Search and deduplicate",
			"remember.dedupeText": "Identify duplicates, additions, or conflicts with existing memories",
			"remember.writeTitle": "Write structured memory",
			"remember.writeText": "Distill content and metadata, create useful relations, and return a receipt",
			"remember.flowText": "The subagent only receives Mnemon tools, keeping the raw directory and retrieval process out of the main context.",
			"remember.delegateTitle": "Send to memory subagent",
			"remember.noSession": "No live session",
			"remember.ready": "Subagent ready",
			"remember.candidate": "Candidate",
			"remember.candidateAria": "Memory candidate",
			"remember.placeholder": "Enter background, preferences, decisions, or insights worth retaining across tasks. The model decides whether they qualify.",
			"remember.sessionHint": "This view is not bound to a live session, so it cannot start a memory subagent.",
			"remember.processing": "Memory subagent is working…",
			"remember.action": "Evaluate and distill",
			"remember.advanced": "Advanced human constraints",
			"remember.advancedHint": "Constrain the target Memory Space and metadata",
			"remember.expand": "Expand",
			"remember.target": "Target Memory Space",
			"remember.entities": "Entities (comma-separated)",
			"remember.tags": "Tags (comma-separated)",
			"remember.advancedText": "Advanced options constrain the subagent; they do not bypass supervision or duplicate checks.",
			"remember.saving": "Subagent is writing…",
			"remember.advancedAction": "Distill with constraints",
			"remember.skipped": "The memory subagent decided not to write",
			"remember.completed": "The memory subagent completed processing",
			"remember.processed": "Memory subagent processed: {action}",
			"remember.dispatchFailed": "Dispatch failed: {error}",
			"remember.saveFailed": "Save failed: {error}",
			"content.title": "Memory Content",
			"content.description": "Browse active Memory Spaces without recall side effects. Every item identifies its owning space and remains maintainable.",
			"content.count": "{count} memories",
			"content.filterAria": "Filter memory content",
			"content.filterPlaceholder": "Filter by content or exact ID…",
			"content.categoryAria": "Memory category",
			"content.apply": "Apply filters",
			"content.notice": "The list reads active graph snapshots without increasing recall access counts.",
			"content.emptyTitle": "No matching memories",
			"content.emptyText": "Clear the filters or distill the first durable memory.",
			"status.title": "System Status",
			"status.description": "Mnemon engine, Memory Space directory, and subagent orchestration. DSH deployment owns connection configuration.",
			"status.nominal": "System nominal",
			"status.checkRequired": "Check required",
			"status.rechecking": "Checking…",
			"status.recheck": "Check again",
			"status.aria": "Mnemon runtime status",
			"status.engine": "Memory engine",
			"status.engineConnected": "Mnemon connected",
			"status.engineUnavailable": "Mnemon unavailable",
			"status.versionWaiting": "Waiting for version",
			"status.spaces": "Memory Spaces",
			"status.activeRatio": "{active} / {total} active",
			"status.directoryUnsynced": "Directory not synchronized",
			"status.activeMemories": "{count} active memories",
			"status.documents": "Project Documents",
			"status.documentsWaiting": "Waiting for workspace",
			"status.documentsSession": "Available after binding a live session",
			"status.documentRatio": "{active} active · {archived} cold",
			"status.documentUsage": "{used} / {limit} active capacity",
			"status.router": "Subagent router",
			"status.routerReady": "Memory subagent available",
			"status.sessionMissing": "No live session bound",
			"status.orchestrationWaiting": "Waiting for orchestration status",
			"status.workerCounts": "{recalls} recalls · {answers} answers · {reviews} reviews · {documentArchives} document moves · {migrations} hot-memory archives · {writes} regular writes",
			"status.workerSummary": "{recalls} recalls · {reviews} reviews · {writes} writes · {failures} failed",
			"status.lifecycle": "Subagent Lifecycle",
			"status.lifecycleText": "Pre-step adds only a short cue. Background activity is scored from user text, turns, completed tool calls, and tool diversity; after the gate and idle delay, one fork child reviews hot memory and substantial project documentation together.",
			"status.phaseIdle": "Idle",
			"status.phaseSupervised": "Supervised request",
			"status.phaseError": "Error",
			"status.phaseReview": "Background review",
			"status.prime": "Prime",
			"status.primeText": "Initialize routing state without reading the directory or memory",
			"status.recallWorker": "Recall worker",
			"status.recallText": "Pre-step only prompts a decision; the main model recalls on demand",
			"status.recallOff": "Automatic recall is disabled",
			"status.writeWorker": "Scored review",
			"status.writeText": "After activity reaches {threshold}, wait {seconds}s idle, fork the full checkpoint, and maintain hot memory or Documents only when justified",
			"status.writeOff": "Background review is disabled",
			"status.latestPhase": "Latest phase",
			"status.latestActivity": "Latest activity",
			"status.reviewState": "Review state",
			"status.reviewPending": "Score reached; waiting for idle",
			"status.reviewRunning": "Reviewing",
			"status.reviewQualified": "Score reached; waiting for turn completion",
			"status.reviewAccumulating": "Accumulating signals",
			"status.reviewIdle": "Accumulating signals",
			"status.activityScore": "Activity score",
			"status.activitySignals": "Accumulated signals",
			"status.activitySignalValues": "{chars} chars · {turns} turns · {tools} tool calls · {unique} tools",
			"status.lastReview": "Last review",
			"status.noReview": "Not run yet",
			"status.reviewAt": "{time} · {action} · trigger score {score}",
			"status.supervisedRequests": "Supervised requests",
			"status.workerFailures": "Subagent failures",
			"status.reviewDocuments": "Documents in last review",
			"status.noActivity": "No activity yet",
			"status.quickDiagnostics": "Quick Diagnostics",
			"status.cliExecutable": "Mnemon CLI executable",
			"status.cliMissing": "Mnemon CLI not found",
			"status.readingSpaces": "{count} Memory Spaces participate in reads",
			"status.directoryWaiting": "Memory Space directory is waiting for Host synchronization",
			"status.webAgentReady": "WebUI can start isolated memory subagents",
			"status.liveSessionMissing": "Live session missing",
			"status.lifecycleFailures": "{count} lifecycle failures",
			"status.documentsUnavailable": "Document directory unavailable for this session",
			"status.documentsHealthy": "{count} active document(s) available for near-field search",
			"status.nativeAccess": "Native commands",
			"status.nativeAccessText": "Models use native mnemon_* tools. Human commands still use supervised routing.",
			"status.engineStorage": "Engine and Storage",
			"status.online": "Online",
			"status.offline": "Offline",
			"status.mnemonVersion": "Mnemon version",
			"status.directory": "Memory Space directory",
			"status.activeDbSize": "Active database size",
			"status.activeCount": "Active",
			"status.activeGraphEdges": "Active graph edges",
			"status.documentDirectory": "Project Documents directory",
			"status.activeDocuments": "Active Documents",
			"status.coldDocuments": "Cold archives",
			"status.documentCapacity": "Active document capacity",
			"status.storageDomains": "Storage Domains",
			"status.storageDomainsText": "The current selection is the shared directory boundary for runtime memory, Memory Spaces, project Documents, and background state.",
			"status.storageBrowseOnly": "Browsing does not switch writes",
			"status.storageScopeAria": "Select a storage domain to inspect",
			"status.storageGlobal": "Global",
			"status.storageWorkspace": "Workspace",
			"status.storageCustom": "Custom",
			"status.storageCurrent": "Current read/write",
			"status.storageWaiting": "Reading storage-domain directories…",
			"status.storageCustomUnset": "No custom directory is configured. This view exposes only a custom root already configured and active in DSH.",
			"status.storageWorkspaceUnavailable": "The current session has no available workspace directory.",
			"status.storageActiveRoot": "Current read/write root",
			"status.storageViewedRoot": "Viewed root",
			"status.storageAvailable": "Directory available",
			"status.storageNotCreated": "Directory not created",
			"status.storageRuntime": "Runtime Memory",
			"status.storageBodies": "Memory Spaces",
			"status.storageDocuments": "Project Documents",
			"status.storageState": "Background State",
			"status.storageReady": "Ready",
			"status.storageEmpty": "Empty",
			"status.storageMissing": "Not created",
			"status.storageInvalid": "Repair needed",
			"status.storageItems": "items",
			"status.storageRuntimeDetail": "USER {user} · MEMORY {memory}",
			"status.storageBodiesDetail": "{active} active · {databases} databases",
			"status.storageDocumentsDetail": "{active} active · {archived} cold",
			"status.storageStateReady": "Review watermarks are persisted",
			"status.storageStateVolatile": "Review state is currently owned by the Host process",
			"status.storageFootnote": "Current read/write root: {root}. Change the scope only in DSH Settings → Plugin Configuration → Mnemon; it applies after restart and never auto-migrates, merges, or deletes old content.",
			"status.flowTitle": "Memory System Flow",
			"status.flowDescription": "The supervisor routes conversation into hot memory, project Documents, or durable Memory Spaces, then returns evidence to each turn as needed.",
			"status.flowLive": "Live state",
			"status.flowDegraded": "Partially unavailable",
			"status.flowConversation": "Conversation and Tools",
			"status.flowTurns": "User input · Agent outcome · tool events",
			"status.flowSupervisor": "LLM Supervisor",
			"status.flowEntries": "{count} hot-memory entries",
			"status.flowDocuments": "{active} active · {archived} cold",
			"status.flowContext": "Agent Context",
			"status.flowContextDetail": "Hot injection · near search · recall",
			"status.flowReadWrite": "Context and routing flow",
			"status.flowArchive": "Capacity migration and cold archive",
			"status.flowCurrentScope": "Current scope: {scope}",
			"config.aria": "Mnemon plugin configuration",
			"config.description": "Choose one storage boundary for runtime memory, project Documents, Memory Spaces, and background state.",
			"config.unsaved": "Unsaved changes",
			"config.restart": "Applies after restart",
			"config.noticeBefore": "Configuration is written to",
			"config.noticeAfter": " and applies after restarting DSH. Switching scopes never migrates existing content automatically.",
			"config.scope": "Storage scope",
			"config.scopeHint": "Global is shared across workspaces; Workspace uses the DSH launch directory; Custom uses the directory below.",
			"config.scopeAria": "Mnemon storage scope",
			"config.global": "Global",
			"config.workspace": "Workspace",
			"config.custom": "Custom directory",
			"config.customDirectory": "Custom directory",
			"config.customHint": "Use an absolute path or ~/ prefix. The complete Mnemon data domain lives here.",
			"config.customAria": "Mnemon custom data directory",
			"config.invalidScope": "The storage scope is invalid.",
			"config.customRequired": "A data directory is required for custom storage.",
			"config.customAbsolute": "The custom directory must be absolute or start with ~/.",
			"config.saveFailed": "Save failed: {error}",
			"config.readOnly": "Plugin settings are read-only in this deployment.",
			"config.discard": "Discard changes",
			"config.saving": "Saving…",
			"config.save": "Save to settings.yaml",
			"config.overridden": "Overridden",
			"config.reset": "Restore default"
		};
		function interpolate(dictionary, key, params) {
			const template = dictionary[key];
			if (params === void 0) return template;
			return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
		}
		function translateZh(key, params) {
			return interpolate(zh, key, params);
		}
		//#endregion
		//#region src/client/MnemonSettingsCard.tsx
		const FIELD_ORDER = ["storageScope", "dataDir"];
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
		}
		function draftOf(value) {
			const resolved = value ?? {};
			return {
				storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? "custom" : "global"),
				dataDir: resolved.dataDir?.trim() ?? ""
			};
		}
		function inheritedDraft(base) {
			return draftOf(record(base));
		}
		function validation(t, draft) {
			if (![
				"global",
				"workspace",
				"custom"
			].includes(draft.storageScope)) return t("config.invalidScope");
			if (draft.storageScope !== "custom") return null;
			const directory = draft.dataDir.trim();
			if (directory === "") return t("config.customRequired");
			if (!(directory === "~" || directory.startsWith("~/") || directory.startsWith("/"))) return t("config.customAbsolute");
			return null;
		}
		function MnemonSettingsCard({ scope, t = translateZh }) {
			const subscribe = (0, react.useMemo)(() => scope.subscribe.bind(scope), [scope]);
			const getSnapshot = (0, react.useMemo)(() => scope.getSnapshot.bind(scope), [scope]);
			const snapshot = (0, react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
			const [draft, setDraft] = (0, react.useState)(() => draftOf(snapshot.value));
			const [dirty, setDirty] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [reset, setReset] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [saving, setSaving] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (dirty.size === 0) setDraft(draftOf(snapshot.value));
			}, [dirty.size, snapshot.value]);
			const overridden = (0, react.useMemo)(() => record(snapshot.user), [snapshot.user]);
			const inherited = (0, react.useMemo)(() => inheritedDraft(snapshot.base), [snapshot.base]);
			const error = validation(t, draft);
			if (snapshot.status === "unavailable") return null;
			const edit = (field, value) => {
				setDraft((current) => ({
					...current,
					[field]: value
				}));
				setDirty((current) => new Set(current).add(field));
				setReset((current) => {
					const next = new Set(current);
					next.delete(field);
					return next;
				});
				setFailed(null);
			};
			const resetField = (field) => {
				setDraft((current) => ({
					...current,
					[field]: inherited[field]
				}));
				setDirty((current) => new Set(current).add(field));
				setReset((current) => new Set(current).add(field));
				setFailed(null);
			};
			const discard = () => {
				setDraft(draftOf(snapshot.value));
				setDirty(/* @__PURE__ */ new Set());
				setReset(/* @__PURE__ */ new Set());
				setFailed(null);
			};
			const save = async () => {
				if (error !== null || dirty.size === 0 || saving) return;
				setSaving(true);
				setFailed(null);
				try {
					const order = draft.storageScope === "custom" ? [...FIELD_ORDER].reverse() : FIELD_ORDER;
					for (const field of order) {
						if (!dirty.has(field)) continue;
						if (reset.has(field) || field === "dataDir" && draft.dataDir.trim() === "") await scope.unset(field);
						else await scope.set(field, draft[field].trim());
					}
					setDirty(/* @__PURE__ */ new Set());
					setReset(/* @__PURE__ */ new Set());
				} catch (reason) {
					setFailed(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setSaving(false);
				}
			};
			const fieldMeta = (field) => Object.hasOwn(overridden, field) && !reset.has(field);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: MnemonSettingsCard_module_css_default.card,
				"aria-label": t("config.aria"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonSettingsCard_module_css_default.panelHeader,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Mnemon" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("config.description") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: dirty.size > 0 ? t("config.unsaved") : t("config.restart") })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonSettingsCard_module_css_default.body,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.notice,
							children: [
								t("config.noticeBefore"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: ".dsh/settings.yaml" }),
								t("config.noticeAfter")
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.primarySettings,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
								t,
								label: t("config.scope"),
								hint: t("config.scopeHint"),
								overridden: fieldMeta("storageScope"),
								onReset: () => resetField("storageScope"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									"aria-label": t("config.scopeAria"),
									value: draft.storageScope,
									onChange: (event) => edit("storageScope", event.target.value),
									disabled: !snapshot.writable,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
											value: "global",
											children: [t("config.global"), " · ~/.mnemon"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
											value: "workspace",
											children: [t("config.workspace"), " · <workspace>/.mnemon"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "custom",
											children: t("config.custom")
										})
									]
								})
							}), draft.storageScope === "custom" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
								t,
								label: t("config.customDirectory"),
								hint: t("config.customHint"),
								overridden: fieldMeta("dataDir"),
								onReset: () => resetField("dataDir"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									"aria-label": t("config.customAria"),
									value: draft.dataDir,
									onChange: (event) => edit("dataDir", event.target.value),
									placeholder: "~/mnemon-data",
									disabled: !snapshot.writable
								})
							})]
						}),
						error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonSettingsCard_module_css_default.error,
							role: "alert",
							children: error
						}),
						failed !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonSettingsCard_module_css_default.error,
							role: "alert",
							children: t("config.saveFailed", { error: failed })
						}),
						!snapshot.writable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonSettingsCard_module_css_default.readOnly,
							children: t("config.readOnly")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.actions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSettingsCard_module_css_default.discard,
								disabled: dirty.size === 0 || saving,
								onClick: discard,
								children: t("config.discard")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSettingsCard_module_css_default.save,
								disabled: dirty.size === 0 || saving || error !== null || !snapshot.writable,
								onClick: () => void save(),
								children: saving ? t("config.saving") : t("config.save")
							})]
						})
					]
				})]
			});
		}
		function SettingField(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: MnemonSettingsCard_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: MnemonSettingsCard_module_css_default.fieldTitle,
						children: [
							props.label,
							props.overridden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: props.t("config.overridden") }),
							props.overridden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (event) => {
									event.preventDefault();
									props.onReset();
								},
								children: props.t("config.reset")
							})
						]
					}),
					props.children,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.hint })
				]
			});
		}
		//#endregion
		//#region src/review-activity.ts
		/**
		* QoderWork 0.9.12's deterministic post-turn review gate.
		*
		* The upstream implementation scores user text length rather than provider
		* token usage, which keeps the gate stable when an adapter omits usage data.
		*/
		const QODERWORK_REVIEW_POLICY = Object.freeze({
			reviewThreshold: 5,
			textLengthScoreUnit: 50,
			textLengthScoreCap: 3,
			toolCountScoreUnit: 5,
			toolCountScoreCap: 2,
			toolDiversityThreshold: 3,
			toolDiversityScoreCap: 2,
			turnScore: 1
		});
		//#endregion
		//#region src/service.ts
		const CATEGORIES = [
			"preference",
			"decision",
			"fact",
			"insight",
			"context",
			"general"
		];
		const JS_STRING = "\"(?:\\\\.|[^\"\\\\])*\"";
		new RegExp(`\\{id:(${JS_STRING}),label:(${JS_STRING}),title:(${JS_STRING}),color:(${JS_STRING}),font:\\{color:"white"\\}\\}`, "g");
		new RegExp(`\\{from:(${JS_STRING}),to:(${JS_STRING}),label:(${JS_STRING}),color:\\{color:(${JS_STRING})\\},arrows:"to"`, "g");
		//#endregion
		//#region src/rpc.ts
		const MNEMON_READ_CHANNEL = "/dsh-mnemon-read";
		const MNEMON_WRITE_CHANNEL = "/dsh-mnemon-write";
		//#endregion
		//#region src/client/api.ts
		var MnemonClient = class {
			connection;
			sessionId;
			constructor(connection, sessionId) {
				this.connection = connection;
				this.sessionId = sessionId;
			}
			async call(channel, endpoint, payload) {
				const response = await this.connection.rpc.call(channel, endpoint, payload);
				if (!response.ok) throw new Error(response.error.message);
				return response.value;
			}
			status() {
				return this.call(MNEMON_READ_CHANNEL, "status", this.sessionId === void 0 ? {} : { sessionId: this.sessionId });
			}
			runtimeMemory() {
				return this.call(MNEMON_READ_CHANNEL, "runtime-memory", {});
			}
			mutateRuntimeMemory(request) {
				return this.call(MNEMON_WRITE_CHANNEL, "runtime-memory", {
					...request,
					sessionId: this.sessionId
				});
			}
			documents() {
				return this.call(MNEMON_READ_CHANNEL, "documents", { sessionId: this.sessionId });
			}
			document(id) {
				return this.call(MNEMON_READ_CHANNEL, "document", {
					sessionId: this.sessionId,
					id
				});
			}
			searchDocuments(query, includeArchived = false, limit = 50) {
				return this.call(MNEMON_READ_CHANNEL, "document-search", {
					sessionId: this.sessionId,
					query,
					includeArchived,
					limit
				});
			}
			mutateDocument(request) {
				return this.call(MNEMON_WRITE_CHANNEL, "document", {
					...request,
					sessionId: this.sessionId
				});
			}
			archiveDocument(id) {
				return this.call(MNEMON_WRITE_CHANNEL, "document", {
					action: "archive",
					id,
					sessionId: this.sessionId
				});
			}
			bodies() {
				return this.call(MNEMON_READ_CHANNEL, "bodies", {});
			}
			graph(memoryBodyIds) {
				return this.call(MNEMON_READ_CHANNEL, "graph", memoryBodyIds === void 0 ? {} : { memoryBodyIds });
			}
			list(request = {}) {
				return this.call(MNEMON_READ_CHANNEL, "list", request);
			}
			entities(entity, limit) {
				return this.call(MNEMON_READ_CHANNEL, "entities", {
					sessionId: this.sessionId,
					...entity === void 0 ? {} : { entity },
					...limit === void 0 ? {} : { limit }
				});
			}
			search(request) {
				return this.call(MNEMON_READ_CHANNEL, "search", {
					...request,
					sessionId: this.sessionId
				});
			}
			agentSearch(request) {
				return this.call(MNEMON_READ_CHANNEL, "agent-search", {
					...request,
					sessionId: this.sessionId
				});
			}
			related(id, memoryBodyId) {
				return this.call(MNEMON_READ_CHANNEL, "related", {
					id,
					depth: 2,
					sessionId: this.sessionId,
					...memoryBodyId === void 0 ? {} : { memoryBodyId }
				});
			}
			remember(request) {
				return this.call(MNEMON_WRITE_CHANNEL, "remember", {
					...request,
					sessionId: this.sessionId
				});
			}
			supervise(content) {
				return this.call(MNEMON_WRITE_CHANNEL, "supervise", {
					sessionId: this.sessionId,
					content
				});
			}
			forget(id, memoryBodyId) {
				return this.call(MNEMON_WRITE_CHANNEL, "forget", {
					id,
					sessionId: this.sessionId,
					...memoryBodyId === void 0 ? {} : { memoryBodyId }
				});
			}
			createBody(request) {
				return this.call(MNEMON_WRITE_CHANNEL, "body-create", request);
			}
			updateBody(memoryBodyId, request) {
				return this.call(MNEMON_WRITE_CHANNEL, "body-update", {
					memoryBodyId,
					...request
				});
			}
		};
		//#endregion
		//#region src/client/MnemonLogo.tsx
		/** Official Mnemon mark from mnemon-dev/mnemon (Apache-2.0). */
		function MnemonLogo({ className, title = "Mnemon" }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className,
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 400 400",
				role: "img",
				"aria-label": title,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						width: "400",
						height: "400",
						fill: "#1A1A1A"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 91.5,153.5 L 98.5,146.5 L 98.5,98.5 L 146.5,98.5 L 153.5,91.5 L 91.5,91.5 Z",
						fill: "#D4D4D8"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 246.5,91.5 L 253.5,98.5 L 301.5,98.5 L 301.5,146.5 L 308.5,153.5 L 308.5,91.5 Z",
						fill: "#D4D4D8"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 91.5,246.5 L 98.5,253.5 L 98.5,301.5 L 146.5,301.5 L 153.5,308.5 L 91.5,308.5 Z",
						fill: "#D4D4D8"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 308.5,246.5 L 301.5,253.5 L 301.5,301.5 L 253.5,301.5 L 246.5,308.5 L 308.5,308.5 Z",
						fill: "#D4D4D8"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", {
						points: "265,187 278,200 265,213",
						fill: "none",
						stroke: "#D4D4D8",
						strokeWidth: "2",
						strokeLinecap: "square"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", {
						points: "135,187 122,200 135,213",
						fill: "none",
						stroke: "#D4D4D8",
						strokeWidth: "2",
						strokeLinecap: "square"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
						points: "200,155 245,200 200,245 155,200",
						fill: "none",
						stroke: "#D4D4D8",
						strokeWidth: "7"
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/dsh-external/dsh-mnemon/src/client/MnemonView.module.css.mjs
		const css = ".lvR3Qq_shell{--mn-bg:var(--dsw-alias-bg-base);--mn-layer-1:var(--dsw-alias-bg-layer-1);--mn-layer-2:var(--dsw-alias-bg-layer-2);--mn-input:var(--dsw-specific-input-major);--mn-text:var(--dsw-alias-label-primary);--mn-muted:var(--dsw-alias-label-secondary);--mn-faint:var(--dsw-alias-label-tertiary);--mn-line:var(--dsw-alias-border-l2);--mn-line-strong:var(--dsw-alias-border-l1);--mn-accent:var(--dsw-alias-state-business-primary);--mn-hover:var(--dsw-alias-interactive-bg-hover);--mn-danger:var(--dsw-alias-state-error-primary);--mn-success:var(--dsw-alias-state-success-primary);--mn-code:var(--ds-font-family-code,\"SFMono-Regular\", Consolas, monospace);box-sizing:border-box;height:100%;min-height:600px;color:var(--mn-text);background:var(--mn-bg);flex-direction:column;font:13px/1.55 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:flex;overflow:hidden}.lvR3Qq_shell *,.lvR3Qq_shell :before,.lvR3Qq_shell :after{box-sizing:border-box}.lvR3Qq_shell button,.lvR3Qq_shell input,.lvR3Qq_shell select,.lvR3Qq_shell textarea{color:inherit;font:inherit}.lvR3Qq_masthead{border-bottom:1px solid var(--mn-line);background:radial-gradient(circle at 70% -70%, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 42%), var(--mn-bg);flex:none;grid-template-columns:minmax(260px,1fr) auto auto;align-items:center;gap:clamp(14px,2vw,28px);min-height:68px;padding:10px clamp(18px,2.5vw,32px);display:grid}.lvR3Qq_brand{align-items:center;gap:11px;min-width:0;display:flex}.lvR3Qq_brandLogo{width:38px;height:38px;box-shadow:0 0 0 1px var(--mn-line-strong);border-radius:9px;flex:none;overflow:hidden}.lvR3Qq_brand h1{letter-spacing:-.02em;margin:1px 0 0;font-size:17px;line-height:1.15}.lvR3Qq_cardKicker,.lvR3Qq_sectionHeading>div>span,.lvR3Qq_entityHeading>span,.lvR3Qq_inspectorHeading>span{color:var(--mn-faint);font:650 9px/1.2 var(--mn-code);letter-spacing:.12em;text-transform:uppercase}.lvR3Qq_statusCluster{border:1px solid var(--mn-line-strong);min-height:34px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:9px;flex:none;align-items:center;gap:8px;padding:0 4px 0 11px;font-size:11px;display:flex}.lvR3Qq_statusDot{border-radius:50%;width:6px;height:6px}.lvR3Qq_online{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 15%, transparent)}.lvR3Qq_offline{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 14%, transparent)}.lvR3Qq_iconButton{width:27px;height:27px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.lvR3Qq_iconButton:hover{color:var(--mn-accent);background:var(--mn-hover)}.lvR3Qq_alert,.lvR3Qq_inlineError{border:1px solid color-mix(in srgb, var(--mn-danger) 32%, transparent);color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 7%, var(--mn-layer-1));border-radius:9px;padding:10px 13px;font-size:12px}.lvR3Qq_alert{flex-direction:column;flex:none;margin:10px clamp(18px,2.5vw,32px) 0;display:flex}.lvR3Qq_telemetry{align-items:center;min-width:0;display:flex}.lvR3Qq_telemetryMetric{border-left:1px solid var(--mn-line);gap:2px;min-width:72px;padding:1px 14px;display:grid}.lvR3Qq_telemetryMetric span{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:9px;overflow:hidden}.lvR3Qq_telemetryMetric strong{font:650 13px/1 var(--mn-code);font-variant-numeric:tabular-nums}.lvR3Qq_workspace{flex-direction:column;flex:1;min-height:0;display:flex}.lvR3Qq_topNavigation{border-bottom:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 72%, var(--mn-bg));flex:none;justify-content:space-between;align-items:stretch;gap:14px;min-width:0;min-height:48px;padding:0 clamp(18px,2.5vw,32px);display:flex}.lvR3Qq_nav{scrollbar-width:none;align-items:stretch;gap:16px;min-width:0;display:flex;overflow-x:auto}.lvR3Qq_nav::-webkit-scrollbar{display:none}.lvR3Qq_nav button{min-width:max-content;color:var(--mn-muted);text-align:left;cursor:pointer;background:0 0;border:0;align-items:center;gap:7px;padding:0 2px;display:flex;position:relative}.lvR3Qq_nav button:hover,.lvR3Qq_nav button[aria-current=page]{color:var(--mn-text)}.lvR3Qq_nav button[aria-current=page]:after{content:\"\";background:var(--mn-accent);border-radius:2px 2px 0 0;height:2px;position:absolute;bottom:-1px;left:0;right:0}.lvR3Qq_nav button[aria-current=page] .lvR3Qq_navGlyph{color:var(--mn-accent)}.lvR3Qq_nav button>span:last-child{min-width:0;display:block}.lvR3Qq_nav button strong{font-size:12px;font-weight:600}.lvR3Qq_nav button small{display:none}.lvR3Qq_navGlyph{color:var(--mn-faint);font:600 13px/1 var(--mn-code)}.lvR3Qq_spaceSummary{border-left:1px solid var(--mn-line);flex:none;grid-template-columns:minmax(0,1fr) auto;align-content:center;gap:1px 9px;min-width:142px;padding:0 0 0 14px;display:grid}.lvR3Qq_spaceSummary>span{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:9px;overflow:hidden}.lvR3Qq_spaceSummary code{color:var(--mn-accent);font:650 12px/1 var(--mn-code);grid-row:span 2;align-self:center}.lvR3Qq_spaceSummary small{color:var(--mn-faint);font-size:9px}.lvR3Qq_canvas{background:var(--mn-bg);flex:1;min-width:0;overflow:auto}.lvR3Qq_page{width:min(1320px,100%);min-height:100%;margin:0 auto;padding:clamp(18px,2.2vw,28px) clamp(18px,2.8vw,34px) 120px}.lvR3Qq_pageHeader{justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:16px;display:flex}.lvR3Qq_pageHeader h2{letter-spacing:-.025em;margin:2px 0;font-size:20px;line-height:1.2}.lvR3Qq_pageHeader p{max-width:690px;color:var(--mn-muted);margin:0;font-size:12px}.lvR3Qq_pageHeaderMeta{flex:none;align-items:center;gap:9px;display:flex}.lvR3Qq_pageHeaderMeta>code{border:1px solid var(--mn-line);color:var(--mn-faint);background:var(--mn-layer-1);font:600 9px/1 var(--mn-code);letter-spacing:.06em;border-radius:7px;padding:6px 8px}.lvR3Qq_primaryButton,.lvR3Qq_secondaryButton,.lvR3Qq_ghostButton,.lvR3Qq_dangerButton,.lvR3Qq_dangerSolidButton{cursor:pointer;border-radius:8px;min-height:34px;padding:0 13px;font-size:12px}.lvR3Qq_primaryButton{border:1px solid var(--mn-accent);color:#fff;background:var(--mn-accent)}.lvR3Qq_secondaryButton{border:1px solid var(--mn-line-strong);color:var(--mn-text);background:var(--mn-layer-1)}.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{background:0 0;border:1px solid #0000;min-height:29px;padding:0 8px}.lvR3Qq_ghostButton{color:var(--mn-muted)}.lvR3Qq_dangerButton{color:var(--mn-danger)}.lvR3Qq_dangerSolidButton{border:1px solid var(--mn-danger);color:#fff;background:var(--mn-danger);min-height:29px}.lvR3Qq_primaryButton:hover,.lvR3Qq_secondaryButton:hover,.lvR3Qq_ghostButton:hover,.lvR3Qq_dangerButton:hover{filter:brightness(.98);background-color:var(--mn-hover)}.lvR3Qq_primaryButton:hover{background-color:var(--mn-accent)}.lvR3Qq_shell button:disabled{cursor:not-allowed;opacity:.48}.lvR3Qq_emptyState{border:1px dashed var(--mn-line-strong);background:color-mix(in srgb, var(--mn-layer-1) 50%, transparent);border-radius:13px;justify-content:center;align-items:center;gap:22px;min-height:220px;padding:30px;display:flex}.lvR3Qq_emptyGlyph{border:1px solid color-mix(in srgb, var(--mn-accent) 35%, var(--mn-line));width:76px;height:76px;color:var(--mn-accent);background:radial-gradient(circle, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 65%);font:500 26px/1 var(--mn-code);border-radius:50%;flex:none;place-items:center;display:grid}.lvR3Qq_emptyState h3{margin:0 0 5px;font-size:16px}.lvR3Qq_emptyState p{max-width:500px;color:var(--mn-muted);margin:0}.lvR3Qq_loadingPanel{border:1px solid var(--mn-line);min-height:220px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:13px;place-items:center;display:grid}.lvR3Qq_inlineError{margin:0 0 14px}.lvR3Qq_muted,.lvR3Qq_loading{color:var(--mn-faint);padding:16px 0;font-size:12px}.lvR3Qq_bodyDirectory{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 72%, var(--mn-bg));border-radius:11px;margin-bottom:12px;padding:12px 14px}.lvR3Qq_bodyDirectoryHeader{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:10px;display:flex}.lvR3Qq_bodyDirectoryHeader h3{margin:1px 0;font-size:13px}.lvR3Qq_bodyDirectoryHeader p{color:var(--mn-muted);margin:0;font-size:10px}.lvR3Qq_bodyDirectoryPath{max-width:min(62vw,720px);color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;margin-top:4px;font-size:9px;display:block;overflow:hidden}.lvR3Qq_bodyDirectoryHeader>strong{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 9px var(--mn-code);border-radius:999px;flex:none;padding:5px 8px}.lvR3Qq_bodyGrid{grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:7px;display:grid}.lvR3Qq_bodyDirectoryEmpty{border:1px dashed color-mix(in srgb, var(--mn-line) 84%, transparent);min-height:92px;color:var(--mn-muted);border-radius:12px;grid-column:1/-1;justify-content:center;align-items:center;gap:14px;display:flex}.lvR3Qq_bodyDirectoryEmpty>span{opacity:.6;font-size:28px}.lvR3Qq_bodyDirectoryEmpty strong{color:var(--mn-text);display:block}.lvR3Qq_bodyDirectoryEmpty p{margin:3px 0 0;font-size:10px}.lvR3Qq_bodyCard{--mn-body-accent:var(--mn-success);border:1px solid var(--mn-line);background:var(--mn-layer-1);opacity:.7;border-radius:9px;min-width:0;padding:9px 10px;transition:opacity .18s,border-color .18s}.lvR3Qq_bodyCard[data-active]{border-color:color-mix(in srgb, var(--mn-body-accent) 42%, var(--mn-line));opacity:1;box-shadow:inset 0 1px 0 color-mix(in srgb, var(--mn-body-accent) 10%, transparent)}.lvR3Qq_bodyCardTop{grid-template-columns:7px minmax(0,1fr) auto;align-items:center;gap:8px;display:grid}.lvR3Qq_bodySignal{background:var(--mn-faint);border-radius:50%;width:7px;height:7px}.lvR3Qq_bodyCard[data-active] .lvR3Qq_bodySignal{background:var(--mn-body-accent);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-body-accent) 14%, transparent)}.lvR3Qq_bodyCard:not([data-healthy]) .lvR3Qq_bodySignal{background:var(--mn-danger);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-danger) 12%, transparent)}.lvR3Qq_bodyCardTop>div{min-width:0;display:grid}.lvR3Qq_bodyCardTop strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.lvR3Qq_bodyCardTop code{color:var(--mn-faint);font:9px var(--mn-code);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.lvR3Qq_bodyHealth{color:var(--mn-success);font:650 8px var(--mn-code);letter-spacing:.07em;text-transform:uppercase}.lvR3Qq_bodyCard:not([data-healthy]) .lvR3Qq_bodyHealth{color:var(--mn-danger)}.lvR3Qq_bodySwitch{min-height:28px;color:var(--mn-faint);cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:0 1px;font-size:9px;display:flex}.lvR3Qq_bodySwitchTrack{border:1px solid var(--mn-line-strong);background:var(--mn-layer-2);border-radius:999px;flex:none;width:29px;height:17px;transition:border-color .18s,background-color .18s;position:relative}.lvR3Qq_bodySwitchTrack i{background:var(--mn-faint);border-radius:50%;width:11px;height:11px;transition:transform .2s cubic-bezier(.2,.8,.2,1),background-color .18s;position:absolute;top:2px;left:2px}.lvR3Qq_bodySwitch:hover{color:var(--mn-text)}.lvR3Qq_bodySwitch:hover .lvR3Qq_bodySwitchTrack{border-color:var(--mn-body-accent)}.lvR3Qq_bodySwitch[aria-checked=true]{color:var(--mn-text)}.lvR3Qq_bodySwitch[aria-checked=true] .lvR3Qq_bodySwitchTrack{border-color:color-mix(in srgb, var(--mn-body-accent) 65%, var(--mn-line));background:color-mix(in srgb, var(--mn-body-accent) 25%, var(--mn-layer-2))}.lvR3Qq_bodySwitch[aria-checked=true] .lvR3Qq_bodySwitchTrack i{background:var(--mn-body-accent);transform:translate(12px)}.lvR3Qq_bodyCard>p{min-height:15px;color:var(--mn-muted);margin:7px 0;font-size:10px;line-height:1.45}.lvR3Qq_bodyCard footer{border-top:1px solid var(--mn-line);color:var(--mn-faint);flex-wrap:wrap;gap:5px 11px;padding-top:6px;font-size:9px;display:flex}.lvR3Qq_bodyCreate{border-top:1px solid var(--mn-line);margin-top:10px;padding-top:8px}.lvR3Qq_bodyCreate summary{cursor:pointer;width:max-content;color:var(--mn-accent);font-size:10px;list-style:none}.lvR3Qq_bodyCreate summary::-webkit-details-marker{display:none}.lvR3Qq_bodyCreate form{grid-template-columns:minmax(130px,.7fr) minmax(150px,.9fr) minmax(230px,1.7fr) auto;gap:7px;margin-top:9px;display:grid}.lvR3Qq_bodyCreate input{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:0;height:34px;padding:0 9px}.lvR3Qq_bodyCreate input:focus{border-color:var(--mn-accent)}.lvR3Qq_graphLayout{grid-template-columns:minmax(0,1fr) minmax(240px,270px);gap:10px;display:grid}.lvR3Qq_graphPanel,.lvR3Qq_graphInspector{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px}.lvR3Qq_graphPanel{min-width:0;overflow:hidden}.lvR3Qq_graphToolbar,.lvR3Qq_graphFooter{min-height:43px;color:var(--mn-muted);justify-content:space-between;align-items:center;gap:14px;padding:0 13px;font-size:10px;display:flex}.lvR3Qq_graphToolbar{border-bottom:1px solid var(--mn-line)}.lvR3Qq_graphToolbar>div:first-child{align-items:center;gap:7px;display:flex}.lvR3Qq_graphToolbar small{color:var(--mn-faint)}.lvR3Qq_liveDot{background:var(--mn-success);width:6px;height:6px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 15%, transparent);border-radius:50%}.lvR3Qq_graphLegend{flex-wrap:wrap;justify-content:flex-end;gap:5px 10px;display:flex}.lvR3Qq_graphLegend span{align-items:center;gap:4px;display:flex}.lvR3Qq_graphLegend span:before{content:\"\";background:var(--edge-color);border-radius:2px;width:13px;height:2px}.lvR3Qq_graphLegend [data-edge=temporal]{--edge-color:#87909f}.lvR3Qq_graphLegend [data-edge=scope]{--edge-color:#708199}.lvR3Qq_graphLegend [data-edge=scope]:before{background:repeating-linear-gradient(90deg, var(--edge-color) 0 4px, transparent 4px 7px)}.lvR3Qq_graphLegend [data-edge=semantic]{--edge-color:#4d7cfe}.lvR3Qq_graphLegend [data-edge=causal]{--edge-color:#ef6b5b}.lvR3Qq_graphLegend [data-edge=entity]{--edge-color:#22a879}.lvR3Qq_graphViewport{background:radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--mn-accent) 6%, transparent), transparent 47%);min-height:clamp(390px,42vw,560px);position:relative;overflow:hidden}.lvR3Qq_graphCanvasControls{z-index:2;border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 88%, transparent);box-shadow:0 6px 18px color-mix(in srgb, var(--mn-text) 7%, transparent);backdrop-filter:blur(10px);border-radius:9px;align-items:center;gap:5px;padding:4px;display:flex;position:absolute;top:10px;right:10px}.lvR3Qq_graphCanvasControls span{color:var(--mn-faint);font:9px var(--mn-code);align-items:center;gap:5px;padding:0 6px;display:flex}.lvR3Qq_graphCanvasControls span i{background:var(--mn-accent);width:5px;height:5px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-accent) 12%, transparent);border-radius:50%}.lvR3Qq_graphCanvasControls button{min-height:26px;color:var(--mn-muted);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;padding:0 8px;font-size:9px}.lvR3Qq_graphCanvasControls button:hover,.lvR3Qq_graphCanvasControls button[data-active]{border-color:var(--mn-line);color:var(--mn-text);background:var(--mn-hover)}.lvR3Qq_graphCanvasControls button[data-active]{color:var(--mn-accent)}.lvR3Qq_graphSvg{touch-action:none;user-select:none;width:100%;height:auto;min-height:clamp(390px,42vw,560px);display:block}.lvR3Qq_graphBackdrop{fill:var(--mn-layer-1)}.lvR3Qq_graphGridLine{stroke:var(--mn-line);stroke-width:.6px;opacity:.5}.lvR3Qq_graphEdge{fill:none;stroke:#87909f;stroke-width:1px;opacity:.32;vector-effect:non-scaling-stroke}.lvR3Qq_graphEdge[data-edge=scope]{stroke:#708199;stroke-dasharray:4 5;opacity:.28}.lvR3Qq_graphEdge[data-edge=semantic]{stroke:#4d7cfe;opacity:.48}.lvR3Qq_graphEdge[data-edge=causal]{stroke:#ef6b5b;opacity:.52}.lvR3Qq_graphEdge[data-edge=entity]{stroke:#22a879;stroke-width:1.45px;opacity:.78}.lvR3Qq_graphNode{--node:#8290a8;cursor:grab;outline:none}.lvR3Qq_graphNode[data-dragging]{cursor:grabbing}.lvR3Qq_graphNode[data-category=decision]{--node:#ef8354}.lvR3Qq_graphNode[data-category=preference]{--node:#a879e1}.lvR3Qq_graphNode[data-category=fact]{--node:#4d7cfe}.lvR3Qq_graphNode[data-category=insight]{--node:#19a77d}.lvR3Qq_graphNode[data-category=context]{--node:#d8a624}.lvR3Qq_graphNode[data-kind=space]{--node:var(--mn-success)}.lvR3Qq_graphNode[data-kind=entity]{--node:#2b9db9}.lvR3Qq_nodeHalo{fill:color-mix(in srgb, var(--node) 18%, var(--mn-layer-1));stroke:color-mix(in srgb, var(--node) 60%, var(--mn-layer-1));stroke-width:1.5px;transition:r .16s}.lvR3Qq_nodeCore{fill:var(--node)}.lvR3Qq_nodeLabel{fill:var(--mn-muted);font:10px var(--mn-code);pointer-events:auto}.lvR3Qq_nodeBodyLabel{fill:var(--mn-faint);font:650 8px var(--mn-code);letter-spacing:.04em;pointer-events:auto}.lvR3Qq_graphSvg[data-density=sparse] .lvR3Qq_nodeLabel{font-size:12px}.lvR3Qq_graphNode:hover .lvR3Qq_nodeHalo,.lvR3Qq_graphNode:focus .lvR3Qq_nodeHalo,.lvR3Qq_graphNode[data-selected] .lvR3Qq_nodeHalo{fill:color-mix(in srgb, var(--node) 28%, var(--mn-layer-1));stroke:var(--node)}.lvR3Qq_graphNode[data-selected] .lvR3Qq_nodeLabel{fill:var(--mn-text);font-weight:650}.lvR3Qq_graphFooter{border-top:1px solid var(--mn-line);min-height:38px;color:var(--mn-faint)}.lvR3Qq_graphInspector{min-height:calc(clamp(390px,42vw,560px) + 83px);padding:15px}.lvR3Qq_inspectorEmpty{text-align:center;flex-direction:column;justify-content:center;align-items:center;height:100%;display:flex}.lvR3Qq_inspectorLogo{opacity:.72;border-radius:11px;width:54px;height:54px;margin-bottom:15px}.lvR3Qq_inspectorEmpty h3{margin:7px 0 3px;font-size:14px}.lvR3Qq_inspectorEmpty p{color:var(--mn-faint);margin:0;font-size:11px}.lvR3Qq_inspectorHeading{justify-content:space-between;align-items:center;display:flex}.lvR3Qq_inspectorHeading button,.lvR3Qq_sectionHeading button{width:27px;height:27px;color:var(--mn-muted);cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.lvR3Qq_inspectorHeading button:hover,.lvR3Qq_sectionHeading button:hover{background:var(--mn-hover)}.lvR3Qq_categoryChip{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 10%, transparent);border-radius:999px;margin-top:24px;padding:3px 8px;font-size:10px;display:inline-flex}.lvR3Qq_graphInspector h3{margin:12px 0 20px;font-size:14px;line-height:1.6}.lvR3Qq_inspectorMeta{margin:0}.lvR3Qq_inspectorMeta>div{border-top:1px solid var(--mn-line);gap:3px;padding:11px 0;display:grid}.lvR3Qq_inspectorMeta dt{color:var(--mn-faint);font:9px var(--mn-code);text-transform:uppercase}.lvR3Qq_inspectorMeta dd{overflow-wrap:anywhere;color:var(--mn-muted);margin:0;font-size:11px}.lvR3Qq_inspectorActions{gap:8px;margin-top:20px;display:grid}.lvR3Qq_searchBar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:13px;margin-bottom:18px;padding:13px}.lvR3Qq_queryField{border:1px solid var(--mn-line-strong);background:var(--mn-input);border-radius:9px;grid-template-columns:24px minmax(0,1fr) 24px;align-items:center;gap:5px;padding:0 10px;display:grid}.lvR3Qq_queryField>span{color:var(--mn-accent);font:18px var(--mn-code)}.lvR3Qq_queryField input{background:0 0;border:0;outline:0;width:100%;height:42px}.lvR3Qq_queryField kbd{color:var(--mn-faint);font:11px var(--mn-code)}.lvR3Qq_searchControls{justify-content:flex-end;align-items:flex-end;gap:10px;padding-top:10px;display:flex}.lvR3Qq_searchActions{align-items:center;gap:7px;display:flex}.lvR3Qq_agentAnswer{border:1px solid color-mix(in srgb, var(--mn-accent) 30%, var(--mn-line));background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 7%, var(--mn-layer-1)), var(--mn-layer-1) 60%);border-radius:11px;margin-bottom:16px;padding:16px 18px}.lvR3Qq_agentAnswerHeading{justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.lvR3Qq_agentAnswerHeading span{color:var(--mn-accent);font:650 9px/1.2 var(--mn-code);letter-spacing:.08em}.lvR3Qq_agentAnswerHeading h3{margin:4px 0 0;font-size:15px}.lvR3Qq_agentAnswerHeading>code{color:var(--mn-faint);font-size:9px}.lvR3Qq_agentAnswer>p{white-space:pre-wrap;color:var(--mn-text);margin:12px 0;font-size:13px;line-height:1.7}.lvR3Qq_agentCitations{border-top:1px solid var(--mn-line);flex-wrap:wrap;gap:5px;padding-top:10px;display:flex}.lvR3Qq_agentCitations code{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:5px;padding:3px 6px;font-size:9px}.lvR3Qq_searchControls label,.lvR3Qq_formGrid label,.lvR3Qq_fieldWide{color:var(--mn-muted);gap:5px;font-size:11px;display:grid}.lvR3Qq_searchControls select,.lvR3Qq_formGrid select,.lvR3Qq_formGrid input,.lvR3Qq_listToolbar input,.lvR3Qq_listToolbar select,.lvR3Qq_entitySearch input{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:140px;height:34px;padding:0 9px}.lvR3Qq_searchControls select:focus,.lvR3Qq_formGrid select:focus,.lvR3Qq_formGrid input:focus,.lvR3Qq_listToolbar input:focus,.lvR3Qq_listToolbar select:focus,.lvR3Qq_entitySearch input:focus,.lvR3Qq_supervisedForm textarea:focus{border-color:var(--mn-accent)}.lvR3Qq_singleColumn{max-width:830px}.lvR3Qq_resultLayout{grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);align-items:start;gap:14px;display:grid}.lvR3Qq_results,.lvR3Qq_relatedPane,.lvR3Qq_entityResults{min-width:0}.lvR3Qq_sectionHeading{justify-content:space-between;align-items:center;gap:16px;min-height:39px;margin-bottom:8px;display:flex}.lvR3Qq_sectionHeading h3{margin:2px 0 0;font-size:15px}.lvR3Qq_sectionHeading>strong{min-width:27px;height:27px;color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 11px var(--mn-code);border-radius:7px;place-items:center;display:grid}.lvR3Qq_relatedPane{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;padding:13px}.lvR3Qq_relatedSource{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:8px;margin:0 0 13px;padding:10px;font-size:11px}.lvR3Qq_insightCard{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;margin-bottom:9px;padding:13px;transition:border-color .15s,transform .15s}.lvR3Qq_insightCard:hover{border-color:var(--mn-line-strong);transform:translateY(-1px)}.lvR3Qq_cardTop{justify-content:space-between;align-items:center;gap:10px;display:flex}.lvR3Qq_badges,.lvR3Qq_tags,.lvR3Qq_entities{flex-wrap:wrap;gap:5px;display:flex}.lvR3Qq_badge{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:999px;padding:2px 6px;font-size:9px}.lvR3Qq_id{color:var(--mn-faint);font:9px var(--mn-code)}.lvR3Qq_content{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0;line-height:1.65}.lvR3Qq_tags{color:var(--mn-accent);font-size:10px}.lvR3Qq_entities{margin-top:7px}.lvR3Qq_entities span{border:1px solid var(--mn-line);color:var(--mn-muted);border-radius:5px;padding:2px 6px;font-size:9px}.lvR3Qq_cardActions{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:3px;min-height:30px;margin-top:10px;padding-top:8px;display:flex}.lvR3Qq_confirmBar{width:100%;color:var(--mn-danger);justify-content:flex-end;align-items:center;gap:5px;font-size:11px;display:flex}.lvR3Qq_confirmBar>span{margin-right:auto}.lvR3Qq_entityLayout{grid-template-columns:265px minmax(0,1fr);align-items:start;gap:16px;display:grid}.lvR3Qq_entityRail{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;padding:13px;position:sticky;top:0}.lvR3Qq_entitySearch{grid-template-columns:minmax(0,1fr) auto;gap:7px;display:grid}.lvR3Qq_entitySearch input{min-width:0}.lvR3Qq_entityHeading{justify-content:space-between;align-items:center;margin:18px 2px 7px;display:flex}.lvR3Qq_entityHeading small{color:var(--mn-faint);font-size:9px}.lvR3Qq_entityList{gap:3px;display:grid}.lvR3Qq_entityList button{min-height:34px;color:var(--mn-muted);cursor:pointer;text-align:left;background:0 0;border:0;border-radius:7px;justify-content:space-between;align-items:center;gap:10px;padding:0 9px;display:flex}.lvR3Qq_entityList button:hover,.lvR3Qq_entityList button[aria-pressed=true]{color:var(--mn-text);background:var(--mn-hover)}.lvR3Qq_entityList strong{color:var(--mn-faint);font:10px var(--mn-code)}.lvR3Qq_entityResults>.lvR3Qq_emptyState{min-height:360px}.lvR3Qq_runtimeComposer,.lvR3Qq_runtimeTarget{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px}.lvR3Qq_runtimeComposer{background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 5%, var(--mn-layer-1)), var(--mn-layer-1) 55%);margin-bottom:13px;padding:15px}.lvR3Qq_runtimeComposerHeading{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:11px;display:flex}.lvR3Qq_runtimeComposerHeading h3{margin:0 0 2px;font-size:14px}.lvR3Qq_runtimeComposerHeading p{color:var(--mn-muted);margin:0;font-size:10px}.lvR3Qq_runtimeComposerHeading>span{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 9px var(--mn-code);border-radius:999px;flex:none;padding:4px 8px}.lvR3Qq_runtimeComposer>textarea,.lvR3Qq_runtimeEntry textarea{resize:vertical;border:1px solid var(--mn-line);width:100%;color:var(--mn-text);background:var(--mn-input);border-radius:9px;outline:0;padding:10px 11px;line-height:1.6}.lvR3Qq_runtimeComposer>textarea:focus,.lvR3Qq_runtimeEntry textarea:focus{border-color:var(--mn-accent)}.lvR3Qq_runtimeComposerActions{justify-content:flex-end;align-items:flex-end;gap:9px;margin-top:10px;display:flex}.lvR3Qq_runtimeComposerActions label{color:var(--mn-faint);gap:4px;font-size:9px;display:grid}.lvR3Qq_runtimeComposerActions select,.lvR3Qq_runtimeEntry select{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:135px;height:34px;padding:0 8px}.lvR3Qq_runtimeNotice,.lvR3Qq_runtimeReadOnly{border:1px solid color-mix(in srgb, var(--mn-success) 28%, var(--mn-line));color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 6%, var(--mn-layer-1));border-radius:9px;margin-bottom:13px;padding:9px 12px;font-size:11px}.lvR3Qq_runtimeReadOnly{color:var(--mn-muted);border-color:var(--mn-line);background:var(--mn-layer-1)}.lvR3Qq_runtimeGrid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:12px;display:grid}.lvR3Qq_runtimeTarget{min-width:0;overflow:hidden}.lvR3Qq_runtimeTargetHeader{justify-content:space-between;align-items:center;gap:14px;padding:14px 15px 9px;display:flex}.lvR3Qq_runtimeTargetHeader>div{gap:1px;display:grid}.lvR3Qq_runtimeTargetHeader span{color:var(--mn-faint);font:650 9px var(--mn-code);letter-spacing:.08em}.lvR3Qq_runtimeTargetHeader h3{margin:0;font-size:15px}.lvR3Qq_runtimeTargetHeader>strong{min-width:28px;height:28px;color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 11px var(--mn-code);border-radius:8px;place-items:center;display:grid}.lvR3Qq_capacityLine{align-items:center;gap:9px;padding:0 15px;display:flex}.lvR3Qq_capacityLine>div{background:var(--mn-layer-2);border-radius:999px;flex:1;height:4px;overflow:hidden}.lvR3Qq_capacityLine i{border-radius:inherit;background:var(--mn-success);height:100%;transition:width .25s;display:block}.lvR3Qq_capacityLine>span{min-width:88px;color:var(--mn-faint);font:9px var(--mn-code);text-align:right}.lvR3Qq_runtimeTargetDescription{min-height:31px;color:var(--mn-muted);margin:8px 15px 12px;font-size:10px}.lvR3Qq_runtimeEntries{border-top:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 36%, var(--mn-layer-1));gap:7px;padding:10px;display:grid}.lvR3Qq_runtimeEntry{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:9px;padding:11px;position:relative}.lvR3Qq_runtimeEntry:before{content:\"\";background:var(--mn-muted);border-radius:0 2px 2px 0;width:2px;position:absolute;top:12px;bottom:12px;left:-1px}.lvR3Qq_runtimeEntry[data-importance=critical]:before{background:var(--mn-danger)}.lvR3Qq_runtimeEntry[data-importance=low]:before{background:var(--mn-faint);opacity:.45}.lvR3Qq_runtimeEntryMeta{justify-content:space-between;align-items:center;gap:12px;display:flex}.lvR3Qq_runtimeEntryMeta>span{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:999px;padding:2px 6px;font-size:9px}.lvR3Qq_runtimeEntry[data-importance=critical] .lvR3Qq_runtimeEntryMeta>span{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 8%, transparent)}.lvR3Qq_runtimeEntryMeta time{color:var(--mn-faint);font:8px var(--mn-code);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.lvR3Qq_runtimeEntry>p{white-space:pre-wrap;overflow-wrap:anywhere;min-height:42px;margin:9px 0;font-size:12px;line-height:1.6}.lvR3Qq_runtimeEntry>select{margin-top:7px}.lvR3Qq_runtimeEntry footer{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:4px;min-height:30px;margin-top:7px;padding-top:7px;display:flex}.lvR3Qq_runtimeEntry footer>span{color:var(--mn-danger);margin-right:auto;font-size:10px}.lvR3Qq_runtimeEmpty{min-height:126px;color:var(--mn-faint);text-align:center;align-content:center;place-items:center;gap:5px;display:grid}.lvR3Qq_runtimeEmpty>span{font:24px var(--mn-code);opacity:.65}.lvR3Qq_runtimeEmpty p{margin:0;font-size:10px}.lvR3Qq_runtimeFootnote{color:var(--mn-faint);margin:10px 2px 0;font-size:9px}.lvR3Qq_documentSummary{grid-template-columns:.7fr .7fr 1.6fr;gap:9px;margin-bottom:12px;display:grid}.lvR3Qq_documentSummary article{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;min-width:0;min-height:91px;padding:13px 14px}.lvR3Qq_documentSummary article>span{color:var(--mn-faint);font-size:9px;display:block}.lvR3Qq_documentSummary article>strong{font:650 21px/1 var(--mn-code);margin:7px 0 4px;display:block}.lvR3Qq_documentSummary article>small{color:var(--mn-muted);font-size:9px}.lvR3Qq_documentCapacity>div{background:var(--mn-layer-2);border-radius:999px;height:4px;margin:7px 0 6px;overflow:hidden}.lvR3Qq_documentCapacity>div i{border-radius:inherit;background:var(--mn-accent);height:100%;transition:width .3s;display:block}.lvR3Qq_documentToolbar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;align-items:center;gap:9px;margin-bottom:12px;padding:9px;display:flex}.lvR3Qq_documentToolbar form{flex:1;grid-template-columns:20px minmax(0,1fr) auto;align-items:center;gap:5px;min-width:260px;padding-left:8px;display:grid}.lvR3Qq_documentToolbar form>span{color:var(--mn-faint);font:15px var(--mn-code)}.lvR3Qq_documentToolbar input,.lvR3Qq_documentEditor input,.lvR3Qq_documentEditor textarea{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;width:100%;padding:8px 10px}.lvR3Qq_documentToolbar input{background:0 0;border-color:#0000;height:34px}.lvR3Qq_documentToolbar input:focus,.lvR3Qq_documentEditor input:focus,.lvR3Qq_documentEditor textarea:focus{border-color:var(--mn-accent)}.lvR3Qq_documentToolbar>div{border:1px solid var(--mn-line);background:var(--mn-layer-2);border-radius:8px;align-items:center;gap:3px;padding:3px;display:flex}.lvR3Qq_documentToolbar>div button{min-height:28px;color:var(--mn-muted);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:0 9px;font-size:10px}.lvR3Qq_documentToolbar>div button[data-active]{color:var(--mn-text);background:var(--mn-layer-1);box-shadow:0 1px 3px color-mix(in srgb, var(--mn-text) 8%, transparent)}.lvR3Qq_documentToolbar>div b{color:var(--mn-faint);font:600 9px var(--mn-code);margin-left:4px}.lvR3Qq_documentWorkspace{grid-template-columns:minmax(250px,310px) minmax(0,1fr);gap:10px;min-height:590px;display:grid}.lvR3Qq_documentList,.lvR3Qq_documentReader{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;min-width:0;overflow:hidden}.lvR3Qq_documentList{align-self:stretch}.lvR3Qq_documentList>header{border-bottom:1px solid var(--mn-line);min-height:42px;color:var(--mn-faint);justify-content:space-between;align-items:center;padding:0 12px;font-size:9px;display:flex}.lvR3Qq_documentList>header code{color:var(--mn-accent)}.lvR3Qq_documentList>button{border:0;border-bottom:1px solid var(--mn-line);width:100%;color:var(--mn-text);text-align:left;cursor:pointer;background:0 0;padding:12px;transition:background-color .15s,box-shadow .15s;display:block}.lvR3Qq_documentList>button:hover{background:var(--mn-hover)}.lvR3Qq_documentList>button[data-selected]{background:color-mix(in srgb, var(--mn-accent) 7%, var(--mn-layer-1));box-shadow:inset 2px 0 var(--mn-accent)}.lvR3Qq_documentList>button>div{justify-content:space-between;align-items:baseline;gap:12px;display:flex}.lvR3Qq_documentList>button strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.lvR3Qq_documentList>button time{color:var(--mn-faint);font:8px var(--mn-code);flex:none}.lvR3Qq_documentList>button p{min-height:30px;color:var(--mn-muted);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:6px 0 9px;font-size:10px;line-height:1.5;display:-webkit-box;overflow:hidden}.lvR3Qq_documentList>button footer{color:var(--mn-faint);align-items:center;gap:8px;font-size:9px;display:flex}.lvR3Qq_documentList>button footer code{margin-left:auto}.lvR3Qq_documentList>button footer em{color:var(--mn-danger);font-style:normal}.lvR3Qq_documentListEmpty{min-height:230px;color:var(--mn-muted);text-align:center;align-content:center;place-items:center;gap:4px;padding:22px;display:grid}.lvR3Qq_documentListEmpty>span{color:var(--mn-accent);font:28px var(--mn-code);opacity:.6;margin-bottom:6px}.lvR3Qq_documentListEmpty p{color:var(--mn-faint);margin:0;font-size:10px}.lvR3Qq_documentReader{padding:16px}.lvR3Qq_documentReader>.lvR3Qq_emptyState{background:0 0;border:0;height:100%}.lvR3Qq_documentDetail>header{border-bottom:1px solid var(--mn-line);justify-content:space-between;align-items:flex-start;gap:18px;padding-bottom:15px;display:flex}.lvR3Qq_documentDetail>header span{color:var(--mn-accent);font:650 9px var(--mn-code);letter-spacing:.08em;text-transform:uppercase}.lvR3Qq_documentDetail>header h3{margin:5px 0 3px;font-size:18px}.lvR3Qq_documentDetail>header p{color:var(--mn-muted);margin:0;font-size:11px}.lvR3Qq_documentDetail>dl{border-top:1px solid var(--mn-line);border-left:1px solid var(--mn-line);grid-template-columns:2fr .45fr .8fr .55fr;margin:13px 0;display:grid}.lvR3Qq_documentDetail>dl>div{border-right:1px solid var(--mn-line);border-bottom:1px solid var(--mn-line);min-width:0;padding:8px 9px}.lvR3Qq_documentDetail dt{color:var(--mn-faint);margin-bottom:3px;font-size:8px}.lvR3Qq_documentDetail dd{text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:9px;overflow:hidden}.lvR3Qq_documentSources{flex-wrap:wrap;align-items:center;gap:5px;margin:11px 0;display:flex}.lvR3Qq_documentSources>span{color:var(--mn-faint);margin-right:4px;font-size:9px}.lvR3Qq_documentSources code,.lvR3Qq_documentArchiveReceipt code{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:5px;padding:3px 6px;font-size:8px}.lvR3Qq_documentDetail>pre{border:1px solid var(--mn-line);min-height:310px;color:var(--mn-text);background:color-mix(in srgb, var(--mn-layer-2) 52%, var(--mn-layer-1));font:11px/1.75 var(--mn-code);white-space:pre-wrap;overflow-wrap:anywhere;border-radius:9px;margin:14px 0 0;padding:16px;overflow:auto}.lvR3Qq_documentArchiveReceipt{border:1px solid color-mix(in srgb, var(--mn-success) 28%, var(--mn-line));background:color-mix(in srgb, var(--mn-success) 5%, transparent);border-radius:9px;margin:12px 0;padding:11px 12px}.lvR3Qq_documentArchiveReceipt p{color:var(--mn-muted);margin:4px 0 8px;font-size:10px}.lvR3Qq_documentArchiveReceipt div{flex-wrap:wrap;gap:5px;display:flex}.lvR3Qq_documentDanger{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:7px;min-height:57px;margin-top:13px;padding-top:12px;display:flex}.lvR3Qq_documentDanger>div{margin-right:auto}.lvR3Qq_documentDanger strong{font-size:11px;display:block}.lvR3Qq_documentDanger p{color:var(--mn-faint);margin:2px 0 0;font-size:9px}.lvR3Qq_documentDanger>span{color:var(--mn-danger);margin-right:auto;font-size:10px}.lvR3Qq_documentEditor{border:1px solid var(--mn-line);background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 5%, var(--mn-layer-1)), var(--mn-layer-1) 55%);border-radius:11px;margin-bottom:12px;padding:15px}.lvR3Qq_documentReader>.lvR3Qq_documentEditor{background:0 0;border:0;margin:0;padding:0}.lvR3Qq_documentEditor>header{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:12px;display:flex}.lvR3Qq_documentEditor h3{margin:0;font-size:14px}.lvR3Qq_documentEditor header p{color:var(--mn-muted);margin:2px 0 0;font-size:10px}.lvR3Qq_documentEditor header>span,.lvR3Qq_documentEditor header>code{color:var(--mn-accent);font:650 9px var(--mn-code)}.lvR3Qq_documentEditor label{color:var(--mn-faint);gap:4px;margin-top:9px;font-size:9px;display:grid}.lvR3Qq_documentEditor textarea{resize:vertical;line-height:1.65}.lvR3Qq_documentEditorMeta{grid-template-columns:.8fr 1.2fr;gap:9px;display:grid}.lvR3Qq_documentEditorMeta label{margin:0}.lvR3Qq_documentEditor footer{justify-content:flex-end;gap:7px;margin-top:11px;display:flex}.lvR3Qq_writebackLayout{grid-template-columns:minmax(220px,280px) minmax(0,1fr);align-items:start;gap:15px;display:grid}.lvR3Qq_writeGuide,.lvR3Qq_supervisedComposer{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px}.lvR3Qq_writeGuide{padding:17px}.lvR3Qq_writeGuide h3{margin:5px 0 15px;font-size:15px}.lvR3Qq_writeGuide ol{counter-reset:gate;gap:13px;margin:0;padding:0;list-style:none;display:grid}.lvR3Qq_writeGuide li{counter-increment:gate;grid-template-columns:22px minmax(0,1fr);column-gap:7px;display:grid}.lvR3Qq_writeGuide li:before{content:\"0\" counter(gate);color:var(--mn-accent);font:10px var(--mn-code);grid-row:span 2}.lvR3Qq_writeGuide li strong{font-size:12px}.lvR3Qq_writeGuide li span,.lvR3Qq_writeGuide p{color:var(--mn-faint);font-size:10px}.lvR3Qq_writeGuide p{border-top:1px solid var(--mn-line);margin:17px 0 0;padding-top:13px}.lvR3Qq_supervisedComposer{overflow:hidden}.lvR3Qq_supervisedForm{padding:18px}.lvR3Qq_supervisedHeading{justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;display:flex}.lvR3Qq_supervisedHeading h3{margin:4px 0 0;font-size:17px}.lvR3Qq_sessionReady,.lvR3Qq_sessionMissing{font:650 9px var(--mn-code);border-radius:999px;padding:4px 8px}.lvR3Qq_sessionReady{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 10%, transparent)}.lvR3Qq_sessionMissing{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 10%, transparent)}.lvR3Qq_supervisedForm textarea{resize:vertical;border:1px solid var(--mn-line);width:100%;color:var(--mn-text);background:var(--mn-input);border-radius:9px;outline:0;padding:12px;line-height:1.65}.lvR3Qq_sessionHint{color:var(--mn-danger);margin:9px 0 0;font-size:11px}.lvR3Qq_formGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:13px;display:grid}.lvR3Qq_fieldWide{grid-column:1/-1}.lvR3Qq_formGrid select,.lvR3Qq_formGrid input{width:100%;min-width:0}.lvR3Qq_formActions{align-items:center;gap:12px;margin-top:15px;display:flex}.lvR3Qq_formActions span{color:var(--mn-muted);font-size:11px}.lvR3Qq_advancedWrite{border-top:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 45%, var(--mn-layer-1))}.lvR3Qq_advancedWrite summary{cursor:pointer;justify-content:space-between;align-items:center;gap:16px;min-height:58px;padding:10px 18px;list-style:none;display:flex}.lvR3Qq_advancedWrite summary::-webkit-details-marker{display:none}.lvR3Qq_advancedWrite summary>span:first-child{gap:2px;display:grid}.lvR3Qq_advancedWrite summary strong{font-size:12px}.lvR3Qq_advancedWrite summary small{color:var(--mn-faint);font-size:10px}.lvR3Qq_advancedWrite summary>span:last-child{color:var(--mn-accent);font:10px var(--mn-code)}.lvR3Qq_advancedWrite[open] summary{border-bottom:1px solid var(--mn-line)}.lvR3Qq_advancedWrite[open] summary>span:last-child{font-size:0}.lvR3Qq_advancedWrite[open] summary>span:last-child:after{content:\"−\";font-size:13px}.lvR3Qq_manualForm{padding:3px 18px 18px}.lvR3Qq_manualActions{justify-content:space-between;align-items:center;gap:14px;margin-top:15px;display:flex}.lvR3Qq_manualActions p{max-width:520px;color:var(--mn-faint);margin:0;font-size:10px}.lvR3Qq_listToolbar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;grid-template-columns:minmax(0,1fr) 170px auto;gap:9px;padding:12px;display:grid}.lvR3Qq_listToolbar input,.lvR3Qq_listToolbar select{width:100%;min-width:0}.lvR3Qq_listNotice{color:var(--mn-faint);margin:10px 0 16px;font-size:10px}.lvR3Qq_listNotice span{color:var(--mn-success);font:650 9px var(--mn-code);letter-spacing:.08em;margin-right:7px}.lvR3Qq_memoryList{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:9px;display:grid}.lvR3Qq_memoryList .lvR3Qq_insightCard{height:100%;margin:0}.lvR3Qq_healthStrip{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:13px;display:grid;overflow:hidden}.lvR3Qq_healthStrip article{box-sizing:border-box;border-right:1px solid var(--mn-line);align-items:flex-start;gap:10px;min-width:0;min-height:78px;padding:14px 15px;display:flex}.lvR3Qq_healthStrip article>div{min-width:0}.lvR3Qq_healthStrip article:last-child{border-right:0}.lvR3Qq_healthStrip small{color:var(--mn-faint);font:650 9px var(--mn-code);letter-spacing:.08em;margin-bottom:4px;display:block}.lvR3Qq_healthStrip strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;display:block;overflow:hidden}.lvR3Qq_healthStrip p{color:var(--mn-muted);text-overflow:ellipsis;white-space:nowrap;margin:3px 0 0;font-size:10px;overflow:hidden}.lvR3Qq_healthIndicator{width:7px;height:7px;box-shadow:0 0 0 4px color-mix(in srgb, currentColor 9%, transparent);border-radius:50%;flex:none;margin-top:3px}.lvR3Qq_healthGood{color:var(--mn-success);background:currentColor}.lvR3Qq_healthBad{color:var(--mn-danger);background:currentColor}.lvR3Qq_healthMuted{color:var(--mn-faint);background:currentColor}.lvR3Qq_memoryFlow{border:1px solid var(--mn-line);background:radial-gradient(circle at 52% 42%, color-mix(in srgb, var(--mn-accent) 6%, transparent), transparent 32%), var(--mn-layer-1);border-radius:12px;margin-bottom:13px;padding:16px;overflow:hidden}.lvR3Qq_memoryFlowCanvas{border:1px solid var(--mn-line);background-image:linear-gradient(color-mix(in srgb, var(--mn-line) 45%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--mn-line) 45%, transparent) 1px, transparent 1px);background-size:24px 24px;background-color:color-mix(in srgb, var(--mn-layer-2) 34%, transparent);border-radius:11px;margin-top:13px;position:relative;overflow:hidden}.lvR3Qq_memoryFlowCanvas:after{pointer-events:none;content:\"\";background:linear-gradient(90deg, var(--mn-layer-1), transparent 14%, transparent 86%, var(--mn-layer-1));opacity:.22;position:absolute;inset:0}.lvR3Qq_memoryFlowCanvas svg{width:100%;min-width:730px;height:auto;display:block}.lvR3Qq_flowPaths path{fill:none;stroke:color-mix(in srgb, var(--mn-accent) 46%, var(--mn-line));stroke-width:1.5px}.lvR3Qq_flowArrow{fill:var(--mn-accent);stroke:none}.lvR3Qq_flowArchiveArrow{fill:var(--mn-success);stroke:none}.lvR3Qq_flowPaths .lvR3Qq_flowArchivePath{stroke:color-mix(in srgb, var(--mn-success) 58%, var(--mn-line));stroke-dasharray:4 5}.lvR3Qq_flowParticles circle{fill:var(--mn-accent);filter:var(--flow-glow)}.lvR3Qq_flowParticles .lvR3Qq_flowArchiveParticle{fill:var(--mn-success)}.lvR3Qq_flowNode rect{fill:color-mix(in srgb, var(--mn-layer-1) 94%, transparent);stroke:var(--mn-line);stroke-width:1px}.lvR3Qq_flowNode circle{fill:var(--mn-success)}.lvR3Qq_flowNode[data-state=idle] circle{fill:var(--mn-faint);filter:none}.lvR3Qq_flowNode[data-state=error] circle{fill:var(--mn-danger);filter:none}.lvR3Qq_flowNode text{font-family:var(--mn-sans)}.lvR3Qq_flowNodeLabel{fill:var(--mn-text);font-size:12px;font-weight:650}.lvR3Qq_flowNodeMeta{fill:var(--mn-muted);font-size:9px}.lvR3Qq_flowNodeValue{fill:var(--mn-accent);font-size:15px;font-weight:650;font-family:var(--mn-code)!important}.lvR3Qq_flowSupervisor rect{fill:color-mix(in srgb, var(--mn-accent) 6%, var(--mn-layer-1));stroke:color-mix(in srgb, var(--mn-accent) 28%, var(--mn-line))}.lvR3Qq_flowSupervisor[data-state=ready] circle{fill:var(--mn-accent)}.lvR3Qq_flowLegend{color:var(--mn-faint);flex-wrap:wrap;gap:9px 18px;margin-top:10px;font-size:9px;display:flex}.lvR3Qq_flowLegend span{align-items:center;gap:6px;display:inline-flex}.lvR3Qq_flowLegend span:last-child{margin-left:auto}.lvR3Qq_flowLegend i{background:var(--mn-accent);width:18px;height:1px}.lvR3Qq_flowLegend span:nth-child(2) i{border-top:1px dashed var(--mn-success);background:0 0;height:0}@media (prefers-reduced-motion:reduce){.lvR3Qq_flowParticles{display:none}}.lvR3Qq_storageDomains{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;margin-bottom:13px;padding:16px}.lvR3Qq_storageRoot{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 45%, transparent);border-radius:9px;justify-content:space-between;align-items:center;gap:18px;min-width:0;margin-top:12px;padding:11px 12px;display:flex}.lvR3Qq_storageRoot>div:first-child{gap:4px;min-width:0;display:grid}.lvR3Qq_storageRoot span,.lvR3Qq_storageRoot small{color:var(--mn-faint);font-size:9px}.lvR3Qq_storageRoot code{color:var(--mn-muted);text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.lvR3Qq_storageRoot>div:last-child{flex:none;justify-items:end;gap:3px;display:grid}.lvR3Qq_storageRoot strong{font:650 11px var(--mn-code)}.lvR3Qq_storageAreaGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:8px;display:grid}.lvR3Qq_storageAreaGrid article{box-sizing:border-box;border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 30%, var(--mn-layer-1));border-radius:9px;flex-direction:column;min-width:0;min-height:150px;padding:12px;display:flex}.lvR3Qq_storageAreaGrid article>header{justify-content:space-between;align-items:center;gap:8px;display:flex}.lvR3Qq_storageAreaGrid article>header>div{align-items:center;gap:7px;min-width:0;display:flex}.lvR3Qq_storageAreaGrid article>header span{background:var(--mn-faint);border-radius:50%;flex:none;width:6px;height:6px}.lvR3Qq_storageAreaGrid article[data-status=ready]>header span{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 9%, transparent)}.lvR3Qq_storageAreaGrid article[data-status=invalid]>header span{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 9%, transparent)}.lvR3Qq_storageAreaGrid article>header strong{text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.lvR3Qq_storageAreaGrid article>header em{color:var(--mn-faint);font:normal 8px var(--mn-code);white-space:nowrap}.lvR3Qq_storageAreaMetric{align-items:baseline;gap:5px;margin-top:14px;display:flex}.lvR3Qq_storageAreaMetric strong{font:650 20px var(--mn-code)}.lvR3Qq_storageAreaMetric span{color:var(--mn-faint);font-size:9px}.lvR3Qq_storageAreaMetric code{color:var(--mn-muted);margin-left:auto;font-size:9px}.lvR3Qq_storageAreaGrid article>p{min-height:28px;color:var(--mn-muted);margin:8px 0;font-size:9px;line-height:1.5}.lvR3Qq_storagePath{border-top:1px solid var(--mn-line);color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;margin-top:auto;padding-top:8px;font-size:8px;display:block;overflow:hidden}.lvR3Qq_storageAreaGrid article>small{color:var(--mn-danger);margin-top:6px;font-size:8px;line-height:1.4;display:block}.lvR3Qq_storageUnavailable{border:1px dashed var(--mn-line);min-height:126px;color:var(--mn-muted);text-align:center;border-radius:9px;place-content:center;gap:5px;margin-top:12px;display:grid}.lvR3Qq_storageUnavailable strong{font-size:12px}.lvR3Qq_storageUnavailable p{max-width:520px;color:var(--mn-faint);margin:0;font-size:10px}.lvR3Qq_storageFootnote{color:var(--mn-faint);margin:11px 0 0;font-size:9px;line-height:1.5}.lvR3Qq_lifecyclePanel{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;margin-top:0;padding:16px}.lvR3Qq_statusSectionHeader{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.lvR3Qq_statusSectionHeader h3{margin:4px 0 0;font-size:15px}.lvR3Qq_statusSectionHeader p{max-width:590px;color:var(--mn-muted);margin:5px 0 0;font-size:10px}.lvR3Qq_phaseBadge{border:1px solid color-mix(in srgb, var(--mn-accent) 25%, var(--mn-line));color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 7%, transparent);font:650 9px var(--mn-code);border-radius:999px;padding:4px 8px}.lvR3Qq_lifecycleFlow{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 52%, transparent);border-radius:9px;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:15px;display:grid;overflow:hidden}.lvR3Qq_lifecycleFlow article{border-right:1px solid var(--mn-line);grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:8px;padding:12px;display:grid}.lvR3Qq_lifecycleFlow article:last-child{border-right:0}.lvR3Qq_lifecycleFlow article[data-disabled]{opacity:.48}.lvR3Qq_lifecycleFlow article>span{color:var(--mn-accent);font:650 9px var(--mn-code)}.lvR3Qq_lifecycleFlow strong{font-size:11px;display:block}.lvR3Qq_lifecycleFlow p{color:var(--mn-faint);margin:4px 0 0;font-size:9px;line-height:1.45}.lvR3Qq_lifecycleFlow code{color:var(--mn-muted);font-size:10px}.lvR3Qq_lifecycleFoot{border-top:1px solid var(--mn-line);color:var(--mn-faint);flex-wrap:wrap;gap:8px 18px;margin-top:13px;padding-top:12px;font-size:9px;display:flex}.lvR3Qq_lifecycleFoot strong{color:var(--mn-text);margin-left:3px;font-weight:600}.lvR3Qq_runtimeBadge{font:650 9px var(--mn-code);border-radius:999px;padding:3px 7px}.lvR3Qq_runtimeOnline{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 10%, transparent)}.lvR3Qq_runtimeOffline{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 10%, transparent)}@media (width<=1000px){.lvR3Qq_graphLayout{display:block;position:relative}.lvR3Qq_graphInspector{z-index:3;width:min(270px,100% - 20px);min-height:0;box-shadow:0 12px 38px color-mix(in srgb, var(--mn-text) 13%, transparent);position:absolute;top:53px;bottom:39px;right:10px;overflow:auto}.lvR3Qq_graphInspector[data-empty]{display:none}.lvR3Qq_resultLayout,.lvR3Qq_memoryList{grid-template-columns:1fr}.lvR3Qq_storageAreaGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.lvR3Qq_runtimeGrid{grid-template-columns:1fr}.lvR3Qq_documentWorkspace{grid-template-columns:minmax(220px,270px) minmax(0,1fr)}.lvR3Qq_documentDetail>dl{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=760px){.lvR3Qq_shell{min-height:500px}.lvR3Qq_masthead{grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;min-height:76px;padding:10px 14px}.lvR3Qq_brandLogo{width:36px;height:36px}.lvR3Qq_statusCluster>span:not(.lvR3Qq_statusDot){display:none}.lvR3Qq_telemetry{border-top:1px solid var(--mn-line);grid-column:1/-1;justify-content:space-between;padding-top:8px}.lvR3Qq_telemetryMetric{text-align:center;flex:1;justify-items:center;gap:3px;min-width:0;padding:0 5px}.lvR3Qq_telemetryMetric:first-child{border-left:0}.lvR3Qq_topNavigation{padding:0 10px}.lvR3Qq_nav{flex:1}.lvR3Qq_nav button{text-align:center;flex-direction:column;justify-content:center;gap:3px;min-width:60px;padding:4px 3px}.lvR3Qq_spaceSummary{display:none}.lvR3Qq_navGlyph{line-height:1}.lvR3Qq_page{padding:18px 13px 26px}.lvR3Qq_pageHeader{gap:10px;display:grid}.lvR3Qq_pageHeaderMeta{justify-content:space-between}.lvR3Qq_entityLayout,.lvR3Qq_writebackLayout{grid-template-columns:1fr}.lvR3Qq_runtimeComposerHeading,.lvR3Qq_runtimeComposerActions{flex-direction:column;align-items:stretch}.lvR3Qq_runtimeComposerActions select,.lvR3Qq_runtimeComposerActions button{width:100%}.lvR3Qq_documentSummary{grid-template-columns:repeat(2,minmax(0,1fr))}.lvR3Qq_documentCapacity{grid-column:1/-1}.lvR3Qq_documentToolbar{flex-direction:column;align-items:stretch}.lvR3Qq_documentToolbar form{min-width:0}.lvR3Qq_documentToolbar>div,.lvR3Qq_documentToolbar>button{width:100%}.lvR3Qq_documentToolbar>div button{flex:1}.lvR3Qq_documentWorkspace{grid-template-columns:1fr;min-height:0}.lvR3Qq_documentList{max-height:330px;overflow:auto}.lvR3Qq_documentReader{min-height:430px}.lvR3Qq_documentEditorMeta{grid-template-columns:1fr}.lvR3Qq_manualActions{flex-direction:column;align-items:stretch}.lvR3Qq_entityRail{position:static}.lvR3Qq_searchControls{grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.lvR3Qq_searchActions{grid-column:1/-1}.lvR3Qq_searchActions>button{flex:1}.lvR3Qq_searchControls select{width:100%;min-width:0}.lvR3Qq_listToolbar{grid-template-columns:1fr}.lvR3Qq_bodyDirectoryHeader{display:grid}.lvR3Qq_bodyCreate form{grid-template-columns:1fr}.lvR3Qq_graphViewport,.lvR3Qq_graphSvg{min-height:390px}.lvR3Qq_graphCanvasControls{top:7px;right:7px}.lvR3Qq_graphCanvasControls span{display:none}.lvR3Qq_healthStrip,.lvR3Qq_lifecycleFlow{grid-template-columns:1fr}.lvR3Qq_storageRoot{flex-direction:column;align-items:flex-start}.lvR3Qq_storageRoot>div:last-child{justify-items:start}.lvR3Qq_storageAreaGrid{grid-template-columns:1fr}.lvR3Qq_memoryFlowCanvas{overflow-x:auto}.lvR3Qq_memoryFlowCanvas svg{width:730px}.lvR3Qq_flowLegend span:last-child{width:100%;margin-left:0}.lvR3Qq_healthStrip article,.lvR3Qq_lifecycleFlow article{border-right:0;border-bottom:1px solid var(--mn-line)}.lvR3Qq_healthStrip article:last-child,.lvR3Qq_lifecycleFlow article:last-child{border-bottom:0}}";
		const tagId = "dsh-mnemon/MnemonView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MnemonView_module_css_default = {
			"statusCluster": "lvR3Qq_statusCluster",
			"storageAreaMetric": "lvR3Qq_storageAreaMetric",
			"graphInspector": "lvR3Qq_graphInspector",
			"page": "lvR3Qq_page",
			"inspectorLogo": "lvR3Qq_inspectorLogo",
			"healthBad": "lvR3Qq_healthBad",
			"flowSupervisor": "lvR3Qq_flowSupervisor",
			"resultLayout": "lvR3Qq_resultLayout",
			"capacityLine": "lvR3Qq_capacityLine",
			"telemetry": "lvR3Qq_telemetry",
			"singleColumn": "lvR3Qq_singleColumn",
			"cardKicker": "lvR3Qq_cardKicker",
			"bodyDirectoryEmpty": "lvR3Qq_bodyDirectoryEmpty",
			"shell": "lvR3Qq_shell",
			"entitySearch": "lvR3Qq_entitySearch",
			"statusSectionHeader": "lvR3Qq_statusSectionHeader",
			"bodyCreate": "lvR3Qq_bodyCreate",
			"graphLegend": "lvR3Qq_graphLegend",
			"graphCanvasControls": "lvR3Qq_graphCanvasControls",
			"healthIndicator": "lvR3Qq_healthIndicator",
			"tags": "lvR3Qq_tags",
			"runtimeEntries": "lvR3Qq_runtimeEntries",
			"primaryButton": "lvR3Qq_primaryButton",
			"documentSources": "lvR3Qq_documentSources",
			"runtimeNotice": "lvR3Qq_runtimeNotice",
			"runtimeReadOnly": "lvR3Qq_runtimeReadOnly",
			"online": "lvR3Qq_online",
			"navGlyph": "lvR3Qq_navGlyph",
			"entityHeading": "lvR3Qq_entityHeading",
			"emptyState": "lvR3Qq_emptyState",
			"bodyGrid": "lvR3Qq_bodyGrid",
			"runtimeComposerHeading": "lvR3Qq_runtimeComposerHeading",
			"formActions": "lvR3Qq_formActions",
			"liveDot": "lvR3Qq_liveDot",
			"inspectorMeta": "lvR3Qq_inspectorMeta",
			"flowParticles": "lvR3Qq_flowParticles",
			"flowArchiveParticle": "lvR3Qq_flowArchiveParticle",
			"documentEditor": "lvR3Qq_documentEditor",
			"graphEdge": "lvR3Qq_graphEdge",
			"storageAreaGrid": "lvR3Qq_storageAreaGrid",
			"entityList": "lvR3Qq_entityList",
			"cardTop": "lvR3Qq_cardTop",
			"sessionMissing": "lvR3Qq_sessionMissing",
			"runtimeEntryMeta": "lvR3Qq_runtimeEntryMeta",
			"sessionReady": "lvR3Qq_sessionReady",
			"entityResults": "lvR3Qq_entityResults",
			"runtimeFootnote": "lvR3Qq_runtimeFootnote",
			"flowNode": "lvR3Qq_flowNode",
			"writebackLayout": "lvR3Qq_writebackLayout",
			"supervisedComposer": "lvR3Qq_supervisedComposer",
			"flowNodeLabel": "lvR3Qq_flowNodeLabel",
			"secondaryButton": "lvR3Qq_secondaryButton",
			"flowLegend": "lvR3Qq_flowLegend",
			"iconButton": "lvR3Qq_iconButton",
			"graphToolbar": "lvR3Qq_graphToolbar",
			"runtimeTargetDescription": "lvR3Qq_runtimeTargetDescription",
			"badge": "lvR3Qq_badge",
			"flowNodeValue": "lvR3Qq_flowNodeValue",
			"entities": "lvR3Qq_entities",
			"cardActions": "lvR3Qq_cardActions",
			"documentArchiveReceipt": "lvR3Qq_documentArchiveReceipt",
			"listNotice": "lvR3Qq_listNotice",
			"dangerButton": "lvR3Qq_dangerButton",
			"bodySwitchTrack": "lvR3Qq_bodySwitchTrack",
			"bodyHealth": "lvR3Qq_bodyHealth",
			"relatedPane": "lvR3Qq_relatedPane",
			"flowPaths": "lvR3Qq_flowPaths",
			"phaseBadge": "lvR3Qq_phaseBadge",
			"offline": "lvR3Qq_offline",
			"storageDomains": "lvR3Qq_storageDomains",
			"writeGuide": "lvR3Qq_writeGuide",
			"brand": "lvR3Qq_brand",
			"alert": "lvR3Qq_alert",
			"sessionHint": "lvR3Qq_sessionHint",
			"nodeCore": "lvR3Qq_nodeCore",
			"healthGood": "lvR3Qq_healthGood",
			"runtimeOffline": "lvR3Qq_runtimeOffline",
			"graphFooter": "lvR3Qq_graphFooter",
			"masthead": "lvR3Qq_masthead",
			"advancedWrite": "lvR3Qq_advancedWrite",
			"loading": "lvR3Qq_loading",
			"supervisedHeading": "lvR3Qq_supervisedHeading",
			"graphSvg": "lvR3Qq_graphSvg",
			"documentWorkspace": "lvR3Qq_documentWorkspace",
			"canvas": "lvR3Qq_canvas",
			"bodyCard": "lvR3Qq_bodyCard",
			"entityRail": "lvR3Qq_entityRail",
			"documentReader": "lvR3Qq_documentReader",
			"flowArrow": "lvR3Qq_flowArrow",
			"storageRoot": "lvR3Qq_storageRoot",
			"storageUnavailable": "lvR3Qq_storageUnavailable",
			"flowArchivePath": "lvR3Qq_flowArchivePath",
			"queryField": "lvR3Qq_queryField",
			"fieldWide": "lvR3Qq_fieldWide",
			"results": "lvR3Qq_results",
			"documentCapacity": "lvR3Qq_documentCapacity",
			"documentList": "lvR3Qq_documentList",
			"sectionHeading": "lvR3Qq_sectionHeading",
			"bodyCardTop": "lvR3Qq_bodyCardTop",
			"manualActions": "lvR3Qq_manualActions",
			"storageFootnote": "lvR3Qq_storageFootnote",
			"pageHeaderMeta": "lvR3Qq_pageHeaderMeta",
			"graphLayout": "lvR3Qq_graphLayout",
			"agentCitations": "lvR3Qq_agentCitations",
			"bodySwitch": "lvR3Qq_bodySwitch",
			"categoryChip": "lvR3Qq_categoryChip",
			"searchControls": "lvR3Qq_searchControls",
			"healthStrip": "lvR3Qq_healthStrip",
			"bodyDirectoryHeader": "lvR3Qq_bodyDirectoryHeader",
			"nodeLabel": "lvR3Qq_nodeLabel",
			"agentAnswer": "lvR3Qq_agentAnswer",
			"telemetryMetric": "lvR3Qq_telemetryMetric",
			"runtimeTarget": "lvR3Qq_runtimeTarget",
			"dangerSolidButton": "lvR3Qq_dangerSolidButton",
			"healthMuted": "lvR3Qq_healthMuted",
			"searchActions": "lvR3Qq_searchActions",
			"loadingPanel": "lvR3Qq_loadingPanel",
			"inspectorEmpty": "lvR3Qq_inspectorEmpty",
			"listToolbar": "lvR3Qq_listToolbar",
			"lifecycleFlow": "lvR3Qq_lifecycleFlow",
			"runtimeOnline": "lvR3Qq_runtimeOnline",
			"id": "lvR3Qq_id",
			"documentEditorMeta": "lvR3Qq_documentEditorMeta",
			"inlineError": "lvR3Qq_inlineError",
			"inspectorHeading": "lvR3Qq_inspectorHeading",
			"workspace": "lvR3Qq_workspace",
			"supervisedForm": "lvR3Qq_supervisedForm",
			"runtimeEmpty": "lvR3Qq_runtimeEmpty",
			"graphPanel": "lvR3Qq_graphPanel",
			"bodyDirectoryPath": "lvR3Qq_bodyDirectoryPath",
			"graphViewport": "lvR3Qq_graphViewport",
			"formGrid": "lvR3Qq_formGrid",
			"documentSummary": "lvR3Qq_documentSummary",
			"nodeBodyLabel": "lvR3Qq_nodeBodyLabel",
			"flowArchiveArrow": "lvR3Qq_flowArchiveArrow",
			"agentAnswerHeading": "lvR3Qq_agentAnswerHeading",
			"brandLogo": "lvR3Qq_brandLogo",
			"confirmBar": "lvR3Qq_confirmBar",
			"statusDot": "lvR3Qq_statusDot",
			"bodyDirectory": "lvR3Qq_bodyDirectory",
			"insightCard": "lvR3Qq_insightCard",
			"relatedSource": "lvR3Qq_relatedSource",
			"runtimeTargetHeader": "lvR3Qq_runtimeTargetHeader",
			"documentListEmpty": "lvR3Qq_documentListEmpty",
			"lifecyclePanel": "lvR3Qq_lifecyclePanel",
			"lifecycleFoot": "lvR3Qq_lifecycleFoot",
			"nodeHalo": "lvR3Qq_nodeHalo",
			"muted": "lvR3Qq_muted",
			"runtimeBadge": "lvR3Qq_runtimeBadge",
			"documentDanger": "lvR3Qq_documentDanger",
			"memoryFlowCanvas": "lvR3Qq_memoryFlowCanvas",
			"searchBar": "lvR3Qq_searchBar",
			"badges": "lvR3Qq_badges",
			"runtimeGrid": "lvR3Qq_runtimeGrid",
			"runtimeComposerActions": "lvR3Qq_runtimeComposerActions",
			"storagePath": "lvR3Qq_storagePath",
			"documentToolbar": "lvR3Qq_documentToolbar",
			"nav": "lvR3Qq_nav",
			"graphBackdrop": "lvR3Qq_graphBackdrop",
			"inspectorActions": "lvR3Qq_inspectorActions",
			"runtimeEntry": "lvR3Qq_runtimeEntry",
			"pageHeader": "lvR3Qq_pageHeader",
			"documentDetail": "lvR3Qq_documentDetail",
			"manualForm": "lvR3Qq_manualForm",
			"graphGridLine": "lvR3Qq_graphGridLine",
			"emptyGlyph": "lvR3Qq_emptyGlyph",
			"bodySignal": "lvR3Qq_bodySignal",
			"entityLayout": "lvR3Qq_entityLayout",
			"ghostButton": "lvR3Qq_ghostButton",
			"graphNode": "lvR3Qq_graphNode",
			"content": "lvR3Qq_content",
			"memoryFlow": "lvR3Qq_memoryFlow",
			"spaceSummary": "lvR3Qq_spaceSummary",
			"flowNodeMeta": "lvR3Qq_flowNodeMeta",
			"topNavigation": "lvR3Qq_topNavigation",
			"runtimeComposer": "lvR3Qq_runtimeComposer",
			"memoryList": "lvR3Qq_memoryList"
		};
		//#endregion
		//#region src/client/MnemonView.tsx
		const PAGE_NAV = [
			{
				id: "overview",
				label: "nav.overview",
				detail: "nav.overview.detail",
				glyph: "◇"
			},
			{
				id: "runtime",
				label: "nav.runtime",
				detail: "nav.runtime.detail",
				glyph: "◫"
			},
			{
				id: "documents",
				label: "nav.documents",
				detail: "nav.documents.detail",
				glyph: "▤"
			},
			{
				id: "explore",
				label: "nav.search",
				detail: "nav.search.detail",
				glyph: "⌕"
			},
			{
				id: "entities",
				label: "nav.entities",
				detail: "nav.entities.detail",
				glyph: "◎"
			},
			{
				id: "remember",
				label: "nav.remember",
				detail: "nav.remember.detail",
				glyph: "+"
			},
			{
				id: "list",
				label: "nav.content",
				detail: "nav.content.detail",
				glyph: "≡"
			},
			{
				id: "status",
				label: "nav.status",
				detail: "nav.status.detail",
				glyph: "⌘"
			}
		];
		const CATEGORY_KEYS = {
			decision: "category.decision",
			preference: "category.preference",
			fact: "category.fact",
			insight: "category.insight",
			context: "category.context",
			general: "category.general"
		};
		const I18nContext = (0, react.createContext)(translateZh);
		function useT() {
			return (0, react.useContext)(I18nContext);
		}
		function categoryLabel(t, category) {
			return CATEGORY_KEYS[category] === void 0 ? category : t(CATEGORY_KEYS[category]);
		}
		function humanBytes(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		}
		function message(error) {
			return error instanceof Error ? error.message : String(error);
		}
		function short(value, max) {
			return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
		}
		function insightKey(insight) {
			return `${insight.memoryBodyId ?? "memory"}:${insight.id}`;
		}
		function PageHeader(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.pageHeader,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: props.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: props.description })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonView_module_css_default.pageHeaderMeta,
					children: [props.meta !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: props.meta }), props.action]
				})]
			});
		}
		function EmptyState(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.emptyState,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: MnemonView_module_css_default.emptyGlyph,
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: props.glyph })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: props.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: props.children })] })]
			});
		}
		function InsightCard(props) {
			const t = useT();
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [forgetting, setForgetting] = (0, react.useState)(false);
			const { insight } = props;
			const meta = [
				insight.memoryBodyName,
				insight.category !== void 0 ? categoryLabel(t, insight.category) : void 0,
				insight.importance !== void 0 ? t("common.importance", { value: insight.importance }) : void 0,
				insight.score !== void 0 ? `score ${insight.score.toFixed(3)}` : void 0,
				insight.depth !== void 0 ? t("common.hops", { count: insight.depth }) : void 0
			].filter((entry) => entry !== void 0);
			const forget = async () => {
				setForgetting(true);
				try {
					await props.onForget(insight);
				} finally {
					setForgetting(false);
					setConfirming(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: MnemonView_module_css_default.insightCard,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.cardTop,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonView_module_css_default.badges,
							children: meta.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MnemonView_module_css_default.badge,
								children: entry
							}, entry))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
							className: MnemonView_module_css_default.id,
							title: insight.id,
							children: insight.id.slice(0, 8)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: MnemonView_module_css_default.content,
						children: insight.content
					}),
					(insight.tags?.length ?? 0) > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.tags,
						children: insight.tags.map((tag) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["#", tag] }, tag))
					}),
					(insight.entities?.length ?? 0) > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.entities,
						children: insight.entities.map((entity) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: entity }, entity))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.cardActions,
						children: confirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.confirmBar,
							role: "group",
							"aria-label": t("card.confirmAria"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("card.confirmText") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.dangerSolidButton,
									disabled: forgetting,
									onClick: () => void forget(),
									children: forgetting ? t("card.processing") : t("card.confirmForget")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.ghostButton,
									disabled: forgetting,
									onClick: () => setConfirming(false),
									children: t("common.cancel")
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							props.onRelated !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => props.onRelated?.(insight),
								children: t("card.related")
							}),
							props.onClone !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => props.onClone?.(insight),
								children: t("card.clone")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => void navigator.clipboard?.writeText(insight.id),
								children: t("common.copyId")
							}),
							props.writeEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.dangerButton,
								onClick: () => setConfirming(true),
								children: t("card.forget")
							})
						] })
					})
				]
			});
		}
		const GRAPH_WIDTH = 930;
		const GRAPH_HEIGHT = 520;
		const GRAPH_MARGIN_X = 58;
		const GRAPH_MARGIN_Y = 58;
		const CATEGORY_ORDER = [
			"space",
			"entity",
			"preference",
			"decision",
			"fact",
			"insight",
			"context",
			"general"
		];
		function hash(value) {
			let result = 2166136261;
			for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
			return result >>> 0;
		}
		function graphNodeKey(node) {
			return node.graphId ?? node.id;
		}
		function graphNodeKind(node) {
			return node.kind ?? "memory";
		}
		function spaceGraphId(id) {
			return `space:${id}`;
		}
		function entityGraphId(entity) {
			return `entity:${encodeURIComponent(normalizeEntity(entity))}`;
		}
		function normalizeEntity(entity) {
			return entity.normalize("NFKC").trim().toLocaleLowerCase();
		}
		/** Add routing scopes and entity indexes without issuing another recall. */
		function enrichMultiSpaceGraph(graph, bodies) {
			if (graph.nodes.length === 0) return graph;
			const memories = graph.nodes.map((node) => ({
				...node,
				kind: "memory"
			}));
			const memoriesByBody = /* @__PURE__ */ new Map();
			for (const node of memories) {
				if (node.memoryBodyId === void 0) continue;
				memoriesByBody.set(node.memoryBodyId, [...memoriesByBody.get(node.memoryBodyId) ?? [], node]);
			}
			const activeBodies = bodies.filter((body) => body.active && ((memoriesByBody.get(body.id)?.length ?? 0) > 0 || (body.stats?.topEntities.length ?? 0) > 0));
			const spaceNodes = activeBodies.map((body) => ({
				id: body.id,
				graphId: spaceGraphId(body.id),
				kind: "space",
				category: "space",
				content: body.name,
				color: "#22a879",
				memoryBodyId: body.id,
				memoryBodyName: body.name,
				occurrenceCount: body.stats?.totalInsights ?? memoriesByBody.get(body.id)?.length ?? 0
			}));
			const edges = graph.edges.filter((edge) => edge.type !== "entity");
			for (const body of activeBodies) for (const memory of memoriesByBody.get(body.id) ?? []) edges.push({
				sourceId: spaceGraphId(body.id),
				targetId: graphNodeKey(memory),
				label: "scope",
				color: "#708199",
				type: "scope"
			});
			const bodiesById = new Map(activeBodies.map((body) => [body.id, body]));
			const indexedEntities = /* @__PURE__ */ new Map();
			for (const memory of memories) {
				const body = memory.memoryBodyId === void 0 ? void 0 : bodiesById.get(memory.memoryBodyId);
				if (body === void 0) continue;
				const seen = /* @__PURE__ */ new Set();
				for (const rawEntity of memory.entities ?? []) {
					const entity = rawEntity.trim();
					const key = normalizeEntity(entity);
					if (key === "" || seen.has(key)) continue;
					seen.add(key);
					const current = indexedEntities.get(key);
					if (current === void 0) indexedEntities.set(key, {
						entity,
						memories: [memory],
						bodies: [body]
					});
					else {
						current.memories.push(memory);
						if (!current.bodies.some((candidate) => candidate.id === body.id)) current.bodies.push(body);
					}
				}
			}
			const entities = [...indexedEntities.values()].sort((left, right) => right.memories.length - left.memories.length || left.entity.localeCompare(right.entity)).slice(0, 24);
			const entityNodes = entities.map((item) => ({
				id: item.entity,
				graphId: entityGraphId(item.entity),
				kind: "entity",
				category: "entity",
				content: item.entity,
				color: "#2b9db9",
				occurrenceCount: item.memories.length,
				memoryBodyIds: item.bodies.map((body) => body.id),
				memoryBodyNames: item.bodies.map((body) => body.name)
			}));
			for (const item of entities) {
				const key = entityGraphId(item.entity);
				for (const memory of item.memories) edges.push({
					sourceId: key,
					targetId: graphNodeKey(memory),
					label: item.entity,
					color: "#22a879",
					type: "entity"
				});
			}
			return {
				...graph,
				nodes: [
					...spaceNodes,
					...entityNodes,
					...memories
				],
				edges
			};
		}
		function graphKindLabel(t, node) {
			const kind = graphNodeKind(node);
			return kind === "space" ? t("graph.kindSpace") : kind === "entity" ? t("graph.kindEntity") : categoryLabel(t, node.category ?? "general");
		}
		function activeCategoryAnchors(grouped) {
			const categories = [...grouped.keys()].sort((left, right) => {
				const leftIndex = CATEGORY_ORDER.indexOf(left);
				const rightIndex = CATEGORY_ORDER.indexOf(right);
				return (leftIndex < 0 ? CATEGORY_ORDER.length : leftIndex) - (rightIndex < 0 ? CATEGORY_ORDER.length : rightIndex);
			});
			const anchors = /* @__PURE__ */ new Map();
			if (categories.length === 1) {
				anchors.set(categories[0], {
					x: GRAPH_WIDTH / 2,
					y: GRAPH_HEIGHT / 2
				});
				return anchors;
			}
			categories.forEach((category, index) => {
				const angle = -Math.PI / 2 + index / categories.length * Math.PI * 2;
				anchors.set(category, {
					x: GRAPH_WIDTH / 2 + Math.cos(angle) * Math.min(250, 115 + categories.length * 23),
					y: GRAPH_HEIGHT / 2 + Math.sin(angle) * Math.min(165, 78 + categories.length * 15)
				});
			});
			return anchors;
		}
		function clampGraphPosition(position) {
			return {
				x: Math.min(872, Math.max(GRAPH_MARGIN_X, position.x)),
				y: Math.min(462, Math.max(GRAPH_MARGIN_Y, position.y))
			};
		}
		function naturalGraphPositions(nodes, edges) {
			const positions = /* @__PURE__ */ new Map();
			const grouped = /* @__PURE__ */ new Map();
			for (const node of nodes) {
				const category = node.category ?? "general";
				grouped.set(category, [...grouped.get(category) ?? [], node]);
			}
			const anchors = activeCategoryAnchors(grouped);
			for (const [category, items] of grouped) {
				const anchor = anchors.get(category) ?? {
					x: GRAPH_WIDTH / 2,
					y: GRAPH_HEIGHT / 2
				};
				items.forEach((node, index) => {
					const seed = hash(graphNodeKey(node));
					const angle = index * 2.399963 + seed % 37 / 37 * .4;
					const radius = items.length === 1 ? 0 : 24 + Math.sqrt(index + 1) * 35;
					positions.set(graphNodeKey(node), clampGraphPosition({
						x: anchor.x + Math.cos(angle) * radius,
						y: anchor.y + Math.sin(angle) * radius
					}));
				});
			}
			const velocities = new Map(nodes.map((node) => [graphNodeKey(node), {
				x: 0,
				y: 0
			}]));
			const visibleIds = new Set(nodes.map(graphNodeKey));
			const visibleEdges = edges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId));
			for (let iteration = 0; iteration < 150; iteration += 1) {
				const cooling = 1 - iteration / 180;
				for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
					const left = nodes[leftIndex];
					const leftPosition = positions.get(graphNodeKey(left));
					const leftVelocity = velocities.get(graphNodeKey(left));
					for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
						const right = nodes[rightIndex];
						const rightPosition = positions.get(graphNodeKey(right));
						const rightVelocity = velocities.get(graphNodeKey(right));
						let dx = leftPosition.x - rightPosition.x;
						let dy = leftPosition.y - rightPosition.y;
						if (dx === 0 && dy === 0) {
							dx = hash(graphNodeKey(left)) % 13 - 6 || 1;
							dy = hash(graphNodeKey(right)) % 11 - 5 || -1;
						}
						const distanceSquared = Math.max(100, dx * dx + dy * dy);
						const distance = Math.sqrt(distanceSquared);
						const force = Math.min(9, 18e3 / distanceSquared) * cooling + (distance < 66 ? (66 - distance) * .08 : 0);
						const forceX = dx / distance * force;
						const forceY = dy / distance * force;
						leftVelocity.x += forceX;
						leftVelocity.y += forceY;
						rightVelocity.x -= forceX;
						rightVelocity.y -= forceY;
					}
				}
				for (const edge of visibleEdges) {
					const source = positions.get(edge.sourceId);
					const target = positions.get(edge.targetId);
					const sourceVelocity = velocities.get(edge.sourceId);
					const targetVelocity = velocities.get(edge.targetId);
					const dx = target.x - source.x;
					const dy = target.y - source.y;
					const distance = Math.max(1, Math.hypot(dx, dy));
					const sparseScale = nodes.length <= 3 ? 2 : nodes.length <= 8 ? 1.45 : 1;
					const spring = (distance - (edge.type === "scope" ? 138 : edge.type === "entity" ? 94 : edge.type === "semantic" ? 118 : 106) * sparseScale) * .018 * cooling;
					const forceX = dx / distance * spring;
					const forceY = dy / distance * spring;
					sourceVelocity.x += forceX;
					sourceVelocity.y += forceY;
					targetVelocity.x -= forceX;
					targetVelocity.y -= forceY;
				}
				for (const node of nodes) {
					const key = graphNodeKey(node);
					const position = positions.get(key);
					const velocity = velocities.get(key);
					const anchor = anchors.get(node.category ?? "general") ?? {
						x: GRAPH_WIDTH / 2,
						y: GRAPH_HEIGHT / 2
					};
					velocity.x += (anchor.x - position.x) * .0035 * cooling + (GRAPH_WIDTH / 2 - position.x) * 8e-4;
					velocity.y += (anchor.y - position.y) * .0035 * cooling + (GRAPH_HEIGHT / 2 - position.y) * 8e-4;
					velocity.x = Math.max(-12, Math.min(12, velocity.x * .76));
					velocity.y = Math.max(-12, Math.min(12, velocity.y * .76));
					positions.set(key, clampGraphPosition({
						x: position.x + velocity.x,
						y: position.y + velocity.y
					}));
				}
			}
			return positions;
		}
		function uniformGraphPositions(nodes) {
			const positions = /* @__PURE__ */ new Map();
			const ordered = [...nodes].sort((left, right) => {
				const categoryDifference = CATEGORY_ORDER.indexOf(left.category ?? "general") - CATEGORY_ORDER.indexOf(right.category ?? "general");
				return categoryDifference === 0 ? left.id.localeCompare(right.id) : categoryDifference;
			});
			const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length * 1.65)));
			const rows = Math.max(1, Math.ceil(ordered.length / columns));
			const cellWidth = 814 / columns;
			const cellHeight = 404 / rows;
			ordered.forEach((node, index) => {
				const row = Math.floor(index / columns);
				const column = index % columns;
				const rowLength = Math.min(columns, ordered.length - row * columns);
				const rowOffset = (columns - rowLength) * cellWidth / 2;
				positions.set(graphNodeKey(node), {
					x: GRAPH_MARGIN_X + rowOffset + cellWidth * (column + .5),
					y: GRAPH_MARGIN_Y + cellHeight * (row + .5)
				});
			});
			return positions;
		}
		function graphPoint(svg, clientX, clientY) {
			const matrix = svg.getScreenCTM?.();
			if (matrix !== null && matrix !== void 0 && typeof svg.createSVGPoint === "function") {
				const point = svg.createSVGPoint();
				point.x = clientX;
				point.y = clientY;
				return clampGraphPosition(point.matrixTransform(matrix.inverse()));
			}
			const bounds = svg.getBoundingClientRect();
			const width = bounds.width || GRAPH_WIDTH;
			const height = bounds.height || GRAPH_HEIGHT;
			return clampGraphPosition({
				x: (clientX - bounds.left) * GRAPH_WIDTH / width,
				y: (clientY - bounds.top) * GRAPH_HEIGHT / height
			});
		}
		function MemoryGraph(props) {
			const t = useT();
			const visibleNodes = (0, react.useMemo)(() => {
				const spaces = props.graph.nodes.filter((node) => graphNodeKind(node) === "space");
				const entities = props.graph.nodes.filter((node) => graphNodeKind(node) === "entity").slice(0, 20);
				const memories = props.graph.nodes.filter((node) => graphNodeKind(node) === "memory").slice(0, Math.max(0, 60 - spaces.length - entities.length));
				return [
					...spaces,
					...entities,
					...memories
				].slice(0, 60);
			}, [props.graph.nodes]);
			const visibleIds = (0, react.useMemo)(() => new Set(visibleNodes.map(graphNodeKey)), [visibleNodes]);
			const visibleKinds = (0, react.useMemo)(() => new Map(visibleNodes.map((node) => [graphNodeKey(node), graphNodeKind(node)])), [visibleNodes]);
			const edges = (0, react.useMemo)(() => {
				const priority = /* @__PURE__ */ new Map([
					["entity", 0],
					["scope", 1],
					["causal", 2],
					["semantic", 3],
					["temporal", 4]
				]);
				return props.graph.edges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).map((edge, index) => ({
					edge,
					index
				})).sort((left, right) => (priority.get(left.edge.type ?? "temporal") ?? 5) - (priority.get(right.edge.type ?? "temporal") ?? 5) || left.index - right.index).slice(0, 180).map(({ edge }) => edge);
			}, [props.graph.edges, visibleIds]);
			const curvedEdges = (0, react.useMemo)(() => {
				const groups = /* @__PURE__ */ new Map();
				edges.forEach((edge, index) => {
					const key = [edge.sourceId, edge.targetId].sort().join("::");
					groups.set(key, [...groups.get(key) ?? [], index]);
				});
				return edges.map((edge, index) => {
					const key = [edge.sourceId, edge.targetId].sort().join("::");
					const group = groups.get(key) ?? [index];
					return {
						edge,
						offset: (group.indexOf(index) - (group.length - 1) / 2) * 12
					};
				});
			}, [edges]);
			const layoutKey = `${visibleNodes.map((node) => `${graphNodeKey(node)}:${graphNodeKind(node)}:${node.category ?? "general"}`).join("|")}::${edges.map((edge) => `${edge.sourceId}>${edge.targetId}:${edge.type ?? "temporal"}`).join("|")}`;
			const naturalLayout = (0, react.useMemo)(() => naturalGraphPositions(visibleNodes, edges), [layoutKey]);
			const [positions, setPositions] = (0, react.useState)(() => naturalLayout);
			const [layoutMode, setLayoutMode] = (0, react.useState)("natural");
			const positionsRef = (0, react.useRef)(positions);
			const animationRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const commitPositions = (0, react.useCallback)((next) => {
				positionsRef.current = next;
				setPositions(next);
			}, []);
			const cancelAnimation = (0, react.useCallback)(() => {
				if (animationRef.current !== null && typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(animationRef.current);
				animationRef.current = null;
			}, []);
			const animateTo = (0, react.useCallback)((target, mode) => {
				cancelAnimation();
				setLayoutMode(mode);
				if (typeof window.requestAnimationFrame !== "function") {
					commitPositions(target);
					return;
				}
				const start = new Map(positionsRef.current);
				const startedAt = performance.now();
				const tick = (time) => {
					const progress = Math.min(1, (time - startedAt) / 620);
					const eased = 1 - Math.pow(1 - progress, 3);
					const next = /* @__PURE__ */ new Map();
					for (const [id, destination] of target) {
						const origin = start.get(id) ?? {
							x: GRAPH_WIDTH / 2,
							y: GRAPH_HEIGHT / 2
						};
						next.set(id, {
							x: origin.x + (destination.x - origin.x) * eased,
							y: origin.y + (destination.y - origin.y) * eased
						});
					}
					commitPositions(next);
					if (progress < 1) animationRef.current = window.requestAnimationFrame(tick);
					else animationRef.current = null;
				};
				animationRef.current = window.requestAnimationFrame(tick);
			}, [cancelAnimation, commitPositions]);
			(0, react.useEffect)(() => {
				animateTo(naturalLayout, "natural");
			}, [layoutKey]);
			(0, react.useEffect)(() => () => cancelAnimation(), [cancelAnimation]);
			const beginDrag = (event, nodeId) => {
				cancelAnimation();
				dragRef.current = {
					nodeId,
					pointerId: event.pointerId,
					startX: event.clientX,
					startY: event.clientY,
					moved: false
				};
				event.currentTarget.setPointerCapture?.(event.pointerId);
			};
			const moveDrag = (event) => {
				const drag = dragRef.current;
				const svg = event.currentTarget.ownerSVGElement;
				if (drag === null || svg === null || drag.pointerId !== event.pointerId) return;
				if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) return;
				drag.moved = true;
				const point = graphPoint(svg, event.clientX, event.clientY);
				const next = new Map(positionsRef.current);
				next.set(drag.nodeId, point);
				commitPositions(next);
				setLayoutMode("custom");
			};
			const endDrag = (event) => {
				const drag = dragRef.current;
				if (drag === null || drag.pointerId !== event.pointerId) return;
				const svg = event.currentTarget.ownerSVGElement;
				if (drag.moved && svg !== null) {
					const next = new Map(positionsRef.current);
					next.set(drag.nodeId, graphPoint(svg, event.clientX, event.clientY));
					commitPositions(next);
				}
				dragRef.current = null;
				event.currentTarget.releasePointerCapture?.(event.pointerId);
				if (!drag.moved) {
					const node = visibleNodes.find((candidate) => graphNodeKey(candidate) === drag.nodeId);
					if (node !== void 0) props.onSelect(node);
				}
			};
			const cancelDrag = (event) => {
				if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
			};
			const nudge = (nodeId, dx, dy) => {
				cancelAnimation();
				const current = positionsRef.current.get(nodeId);
				if (current === void 0) return;
				const next = new Map(positionsRef.current);
				next.set(nodeId, clampGraphPosition({
					x: current.x + dx,
					y: current.y + dy
				}));
				commitPositions(next);
				setLayoutMode("custom");
			};
			const layoutLabel = t(layoutMode === "natural" ? "graph.layoutNatural" : layoutMode === "uniform" ? "graph.layoutUniform" : "graph.layoutCustom");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.graphCanvasControls,
				role: "toolbar",
				"aria-label": t("graph.layoutAria"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						role: "status",
						"aria-label": t("graph.layoutStatus", { layout: layoutLabel }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), t("graph.draggable", { layout: layoutLabel })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-active": layoutMode === "natural" || void 0,
						onClick: () => animateTo(naturalGraphPositions(visibleNodes, edges), "natural"),
						children: t("graph.naturalAction")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-active": layoutMode === "uniform" || void 0,
						onClick: () => animateTo(uniformGraphPositions(visibleNodes), "uniform"),
						children: t("graph.uniformAction")
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: MnemonView_module_css_default.graphSvg,
				viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`,
				role: "img",
				"data-layout": layoutMode,
				"data-density": visibleNodes.length <= 12 ? "sparse" : "dense",
				"aria-label": t("graph.aria", {
					nodes: props.graph.nodes.length,
					edges: props.graph.edges.length
				}),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pattern", {
						id: "mnemon-grid",
						width: "26",
						height: "26",
						patternUnits: "userSpaceOnUse",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M 26 0 L 0 0 0 26",
							className: MnemonView_module_css_default.graphGridLine,
							fill: "none"
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("filter", {
						id: "mnemon-glow",
						x: "-100%",
						y: "-100%",
						width: "300%",
						height: "300%",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("feGaussianBlur", {
							stdDeviation: "4",
							result: "blur"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("feMergeNode", { in: "blur" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("feMergeNode", { in: "SourceGraphic" })] })]
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						width: GRAPH_WIDTH,
						height: GRAPH_HEIGHT,
						className: MnemonView_module_css_default.graphBackdrop
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						width: GRAPH_WIDTH,
						height: GRAPH_HEIGHT,
						fill: "url(#mnemon-grid)"
					}),
					curvedEdges.map(({ edge, offset }, index) => {
						const source = positions.get(edge.sourceId) ?? naturalLayout.get(edge.sourceId) ?? {
							x: GRAPH_WIDTH / 2,
							y: GRAPH_HEIGHT / 2
						};
						const target = positions.get(edge.targetId) ?? naturalLayout.get(edge.targetId) ?? {
							x: GRAPH_WIDTH / 2,
							y: GRAPH_HEIGHT / 2
						};
						const dx = target.x - source.x;
						const dy = target.y - source.y;
						const distance = Math.max(1, Math.hypot(dx, dy));
						const direction = edge.sourceId.localeCompare(edge.targetId) <= 0 ? 1 : -1;
						const controlX = (source.x + target.x) / 2 - dy / distance * offset * direction;
						const controlY = (source.y + target.y) / 2 + dx / distance * offset * direction;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`,
							className: MnemonView_module_css_default.graphEdge,
							"data-edge": edge.type ?? "temporal",
							"data-source-id": edge.sourceId,
							"data-target-id": edge.targetId,
							"data-source-kind": visibleKinds.get(edge.sourceId),
							"data-target-kind": visibleKinds.get(edge.targetId)
						}, `${edge.sourceId}-${edge.targetId}-${index}`);
					}),
					visibleNodes.map((node, index) => {
						const nodeKey = graphNodeKey(node);
						const position = positions.get(nodeKey) ?? naturalLayout.get(nodeKey) ?? {
							x: GRAPH_WIDTH / 2,
							y: GRAPH_HEIGHT / 2
						};
						const selected = props.selectedId === nodeKey;
						const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
							className: MnemonView_module_css_default.graphNode,
							"data-node-id": nodeKey,
							"data-category": node.category ?? "general",
							"data-kind": graphNodeKind(node),
							"data-selected": selected || void 0,
							transform: `translate(${position.x} ${position.y})`,
							role: "button",
							tabIndex: 0,
							"aria-label": `${graphKindLabel(t, node)}: ${short(node.content, 80)}`,
							"data-dragging": dragRef.current?.nodeId === nodeKey || void 0,
							onPointerDown: (event) => beginDrag(event, nodeKey),
							onPointerMove: moveDrag,
							onPointerUp: endDrag,
							onPointerCancel: cancelDrag,
							onLostPointerCapture: cancelDrag,
							onClick: () => props.onSelect(node),
							onKeyDown: (event) => {
								if (event.key === "Enter" || event.key === " ") props.onSelect(node);
								else if (event.key === "ArrowLeft") {
									event.preventDefault();
									nudge(nodeKey, -12, 0);
								} else if (event.key === "ArrowRight") {
									event.preventDefault();
									nudge(nodeKey, 12, 0);
								} else if (event.key === "ArrowUp") {
									event.preventDefault();
									nudge(nodeKey, 0, -12);
								} else if (event.key === "ArrowDown") {
									event.preventDefault();
									nudge(nodeKey, 0, 12);
								}
							},
							children: [
								graphNodeKind(node) === "space" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
									x: selected ? -20 : -17,
									y: selected ? -15 : -13,
									width: selected ? 40 : 34,
									height: selected ? 30 : 26,
									rx: "9",
									className: MnemonView_module_css_default.nodeHalo,
									filter: selected ? "url(#mnemon-glow)" : void 0
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									r: selected ? 6 : 5,
									className: MnemonView_module_css_default.nodeCore
								})] }) : graphNodeKind(node) === "entity" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: selected ? "M 0 -18 L 18 0 L 0 18 L -18 0 Z" : "M 0 -14 L 14 0 L 0 14 L -14 0 Z",
									className: MnemonView_module_css_default.nodeHalo,
									filter: selected ? "url(#mnemon-glow)" : void 0
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									r: selected ? 5 : 4,
									className: MnemonView_module_css_default.nodeCore
								})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									r: selected ? 17 : visibleNodes.length <= 12 ? 14 : 11,
									className: MnemonView_module_css_default.nodeHalo,
									filter: selected ? "url(#mnemon-glow)" : void 0
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									r: selected ? 7 : visibleNodes.length <= 12 ? 6 : 4.5,
									className: MnemonView_module_css_default.nodeCore
								})] }),
								(selected || visibleNodes.length <= 12) && graphNodeKind(node) === "memory" && node.memoryBodyName !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
									x: "0",
									y: "-18",
									textAnchor: "middle",
									className: MnemonView_module_css_default.nodeBodyLabel,
									children: short(node.memoryBodyName, 12)
								}),
								showLabel && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
									x: visibleNodes.length <= 12 ? 19 : 15,
									y: "4",
									className: MnemonView_module_css_default.nodeLabel,
									children: short(node.content.replace(/\s+/gu, " "), selected ? 34 : visibleNodes.length <= 12 ? 26 : 19)
								})
							]
						}, nodeKey);
					})
				]
			})] });
		}
		function OverviewPage(props) {
			const t = useT();
			const [graph, setGraph] = (0, react.useState)(null);
			const [catalog, setCatalog] = (0, react.useState)(null);
			const [selected, setSelected] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [changing, setChanging] = (0, react.useState)(null);
			const [creating, setCreating] = (0, react.useState)(false);
			const [bodyName, setBodyName] = (0, react.useState)("");
			const [bodyDescription, setBodyDescription] = (0, react.useState)("");
			const [catalogUnavailable, setCatalogUnavailable] = (0, react.useState)(false);
			const load = (0, react.useCallback)(async (quiet = false) => {
				if (!quiet) setLoading(true);
				setError(null);
				try {
					const [nextCatalog, next] = await Promise.all([props.client.bodies().then((next) => {
						setCatalogUnavailable(false);
						return next;
					}).catch(() => {
						setCatalogUnavailable(!props.catalogKnown);
						return {
							items: props.fallbackBodies,
							total: props.fallbackBodies.length,
							activeCount: props.fallbackBodies.filter((body) => body.active).length,
							directory: props.fallbackDirectory ?? "",
							generatedAt: (/* @__PURE__ */ new Date()).toISOString()
						};
					}), props.client.graph()]);
					const enriched = enrichMultiSpaceGraph(next, nextCatalog.items);
					setCatalog(nextCatalog);
					setGraph(enriched);
					setSelected((current) => current === null ? null : enriched.nodes.find((node) => graphNodeKey(node) === graphNodeKey(current)) ?? null);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setLoading(false);
				}
			}, [
				props.catalogKnown,
				props.client,
				props.fallbackBodies,
				props.fallbackDirectory
			]);
			(0, react.useEffect)(() => {
				load();
				const timer = window.setInterval(() => void load(true), 15e3);
				return () => window.clearInterval(timer);
			}, [load, props.revision]);
			const toggle = async (body) => {
				setChanging(body.id);
				setError(null);
				try {
					await props.client.updateBody(body.id, { active: !body.active });
					await load(true);
					props.onMutate();
				} catch (reason) {
					setError(message(reason));
				} finally {
					setChanging(null);
				}
			};
			const create = async (event) => {
				event.preventDefault();
				if (bodyName.trim() === "" || bodyDescription.trim() === "") return;
				setCreating(true);
				setError(null);
				try {
					await props.client.createBody({
						name: bodyName,
						description: bodyDescription
					});
					setBodyName("");
					setBodyDescription("");
					await load(true);
					props.onMutate();
				} catch (reason) {
					setError(message(reason));
				} finally {
					setCreating(false);
				}
			};
			const generated = graph === null ? t("overview.waitingSnapshot") : t("overview.updatedAt", { time: new Date(graph.generatedAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			}) });
			const graphSpaces = graph?.nodes.filter((node) => graphNodeKind(node) === "space").length ?? 0;
			const graphEntities = graph?.nodes.filter((node) => graphNodeKind(node) === "entity").length ?? 0;
			const graphMemories = graph?.nodes.filter((node) => graphNodeKind(node) === "memory").length ?? 0;
			const selectedKind = selected === null ? null : graphNodeKind(selected);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("overview.title"),
						description: t("overview.description"),
						meta: t("overview.interval"),
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							disabled: loading,
							onClick: () => void load(),
							children: loading ? t("overview.syncing") : t("overview.syncNow")
						})
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.bodyDirectory,
						"aria-label": t("overview.directory"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.bodyDirectoryHeader,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("overview.directory") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("overview.directory.description") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
										className: MnemonView_module_css_default.bodyDirectoryPath,
										children: catalogUnavailable ? t("overview.directory.unsynced") : catalog?.directory || props.fallbackDirectory || t("overview.directory.waiting")
									})
								] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: catalogUnavailable ? t("overview.directory.unsyncedBadge") : `${catalog?.activeCount ?? "—"} / ${catalog?.total ?? "—"} ${t("common.active")}` })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.bodyGrid,
								children: [catalog?.items.map((body) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: MnemonView_module_css_default.bodyCard,
									"data-active": body.active || void 0,
									"data-healthy": body.healthy || void 0,
									title: body.error,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.bodyCardTop,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: MnemonView_module_css_default.bodySignal }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: body.name }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: body.id }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
														className: MnemonView_module_css_default.bodyHealth,
														children: body.healthy ? t("overview.storageHealthy") : t("overview.storageUnhealthy")
													})
												] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: MnemonView_module_css_default.bodySwitch,
													role: "switch",
													"aria-checked": body.active,
													"aria-label": t("overview.toggleAria", { name: body.name }),
													disabled: !props.writeEnabled || changing === body.id,
													onClick: () => void toggle(body),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: MnemonView_module_css_default.bodySwitchTrack,
														"aria-hidden": "true",
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {})
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: changing === body.id ? t("overview.toggling") : body.active ? t("common.active") : t("common.inactive") })]
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: body.description || t("overview.noDescription") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("common.memories", { count: body.stats?.totalInsights ?? 0 }) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("common.edges", { count: body.stats?.edgeCount ?? 0 }) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: humanBytes(body.stats?.dbSizeBytes ?? 0) })
										] })
									]
								}, body.id)), catalog?.total === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.bodyDirectoryEmpty,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "◇" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: catalogUnavailable ? t("overview.unsyncedTitle") : t("overview.emptyTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: catalogUnavailable ? t("overview.unsyncedShort") : t("overview.emptyShort") })] })]
								})]
							}),
							props.writeEnabled && !catalogUnavailable && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								className: MnemonView_module_css_default.bodyCreate,
								open: catalog?.total === 0 ? true : void 0,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("overview.create") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
									onSubmit: (event) => void create(event),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											"aria-label": t("overview.createName"),
											value: bodyName,
											onChange: (event) => setBodyName(event.target.value),
											placeholder: t("overview.createNamePlaceholder"),
											required: true
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											"aria-label": t("overview.createDescription"),
											value: bodyDescription,
											onChange: (event) => setBodyDescription(event.target.value),
											placeholder: t("overview.createDescriptionPlaceholder"),
											required: true
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											className: MnemonView_module_css_default.secondaryButton,
											disabled: creating,
											children: creating ? t("overview.creating") : t("overview.createAction")
										})
									]
								})]
							})
						]
					}),
					!catalogUnavailable && graph !== null && graph.nodes.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.graphLayout,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.graphPanel,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.graphToolbar,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: MnemonView_module_css_default.liveDot }),
										t("overview.snapshot"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: generated })
									] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.graphLegend,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "scope",
												children: t("overview.edgeScope")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "temporal",
												children: t("overview.edgeTemporal")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "semantic",
												children: t("overview.edgeSemantic")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "causal",
												children: t("overview.edgeCausal")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "entity",
												children: t("overview.edgeEntity")
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.graphViewport,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MemoryGraph, {
										graph,
										selectedId: selected === null ? void 0 : graphNodeKey(selected),
										onSelect: setSelected
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.graphFooter,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.graphComposition", {
										spaces: graphSpaces,
										memories: graphMemories,
										entities: graphEntities
									}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("overview.graphCount", {
											visible: Math.min(graph.nodes.length, 60),
											total: graph.nodes.length
										}),
										" · ",
										t("overview.graphEdges", { count: graph.edges.length })
									] })]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
							className: MnemonView_module_css_default.graphInspector,
							"data-empty": selected === null || void 0,
							children: selected === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.inspectorEmpty,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonLogo, {
										className: MnemonView_module_css_default.inspectorLogo,
										title: t("overview.inspector")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("overview.selectNode") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("overview.selectNodeText") })
								]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.inspectorHeading,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(selectedKind === "space" ? "overview.inspectorSpace" : selectedKind === "entity" ? "overview.inspectorEntity" : "overview.inspector") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSelected(null),
										"aria-label": t("overview.closeInspector"),
										children: "×"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: MnemonView_module_css_default.categoryChip,
									children: graphKindLabel(t, selected)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: selected.content }),
								selectedKind === "space" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
									className: MnemonView_module_css_default.inspectorMeta,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("overview.spaceId") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.memoryBodyId ?? selected.id }) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("overview.containedMemories") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.occurrenceCount ?? 0 })] })]
								}) : selectedKind === "entity" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
									className: MnemonView_module_css_default.inspectorMeta,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("overview.entityMentions") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.occurrenceCount ?? 0 })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("term.spaces") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.memoryBodyNames?.join(" · ") || "—" })] })]
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
									className: MnemonView_module_css_default.inspectorMeta,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("term.space") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [
											selected.memoryBodyName ?? "—",
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.memoryBodyId ?? "" })
										] })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("overview.memoryId") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.id }) })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("common.category") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: categoryLabel(t, selected.category ?? "general") })] })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.inspectorActions,
									children: [selectedKind !== "space" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.primaryButton,
										onClick: () => props.onExplore(selected.content),
										children: t("overview.exploreNode")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.secondaryButton,
										onClick: () => void navigator.clipboard?.writeText(selected.id),
										children: t("common.copyId")
									})]
								})
							] })
						})]
					}) : !loading && error === null ? catalogUnavailable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "◇",
						title: t("overview.unsyncedTitle"),
						children: t("overview.unsyncedLong")
					}) : catalog?.total === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "◇",
						title: t("overview.emptyTitle"),
						children: t("overview.emptyLong")
					}) : catalog?.activeCount === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "◇",
						title: t("overview.noActiveTitle"),
						children: t("overview.noActiveText")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "◇",
						title: t("overview.noContentTitle"),
						children: t("overview.noContentText")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.loadingPanel,
						children: t("overview.loading")
					})
				]
			});
		}
		function ExplorePage(props) {
			const t = useT();
			const [query, setQuery] = (0, react.useState)(props.seed);
			const [mode, setMode] = (0, react.useState)("smart");
			const [category, setCategory] = (0, react.useState)("");
			const [results, setResults] = (0, react.useState)([]);
			const [searchKind, setSearchKind] = (0, react.useState)(null);
			const [agentAnswer, setAgentAnswer] = (0, react.useState)(null);
			const [searched, setSearched] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [relatedTo, setRelatedTo] = (0, react.useState)(null);
			const [related, setRelated] = (0, react.useState)([]);
			const [relatedLoading, setRelatedLoading] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (props.seed !== "") setQuery(props.seed);
			}, [props.seed]);
			const runSearch = async (withAgent) => {
				if (query.trim() === "") return;
				setSearchKind(withAgent ? "agent" : "direct");
				setSearched(true);
				setError(null);
				setRelatedTo(null);
				setAgentAnswer(null);
				try {
					const request = {
						query,
						mode,
						...category === "" ? {} : { category },
						limit: props.status?.defaultRecallLimit ?? 10
					};
					if (withAgent) {
						const response = await props.client.agentSearch(request);
						setResults(response.results);
						setAgentAnswer({
							answer: response.answer,
							citations: response.citations,
							runId: response.delegation.runId
						});
					} else setResults((await props.client.search(request)).results);
				} catch (reason) {
					setError(message(reason));
					setResults([]);
					setAgentAnswer(null);
				} finally {
					setSearchKind(null);
				}
			};
			const search = (event) => {
				event.preventDefault();
				runSearch(false);
			};
			const searching = searchKind !== null;
			const showRelated = async (insight) => {
				setRelatedTo(insight);
				setRelated([]);
				setRelatedLoading(true);
				setError(null);
				try {
					setRelated(await props.client.related(insight.id, insight.memoryBodyId));
				} catch (reason) {
					setError(message(reason));
				} finally {
					setRelatedLoading(false);
				}
			};
			const forget = async (insight) => {
				await props.onForget(insight);
				setResults((items) => items.filter((item) => insightKey(item) !== insightKey(insight)));
				setRelated((items) => items.filter((item) => insightKey(item) !== insightKey(insight)));
				if (relatedTo !== null && insightKey(relatedTo) === insightKey(insight)) setRelatedTo(null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("search.title"),
						description: t("search.description"),
						meta: t("search.maxResults", { count: props.status?.defaultRecallLimit ?? "—" })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: MnemonView_module_css_default.searchBar,
						onSubmit: (event) => void search(event),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.queryField,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "⌕"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: t("search.placeholder"),
									"aria-label": t("search.queryAria")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "↵" })
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.searchControls,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("common.category"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: category,
									onChange: (event) => setCategory(event.target.value),
									"aria-label": t("search.categoryAria"),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("common.allCategories")
									}), CATEGORIES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value,
										children: categoryLabel(t, value)
									}, value))]
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("search.strategy"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: mode,
									onChange: (event) => setMode(event.target.value),
									"aria-label": t("search.modeAria"),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "smart",
											children: t("search.modeSmart")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "keyword",
											children: t("search.modeKeyword")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "basic",
											children: t("search.modeBasic")
										})
									]
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.searchActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.secondaryButton,
										disabled: searching || query.trim() === "",
										children: searchKind === "direct" ? t("search.searching") : t("search.action")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.primaryButton,
										disabled: searching || query.trim() === "" || props.status?.lifecycle?.sessionAvailable !== true,
										onClick: () => void runSearch(true),
										children: searchKind === "agent" ? t("search.agentSearching") : t("search.agentAction")
									})]
								})
							]
						})]
					}),
					agentAnswer !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.agentAnswer,
						"aria-label": t("search.agentAnswer"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.agentAnswerHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("search.agentAnswerHint") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("search.agentAnswer") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: agentAnswer.runId.slice(0, 8) })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: agentAnswer.answer }),
							agentAnswer.citations.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.agentCitations,
								children: agentAnswer.citations.map((citation) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: citation }, citation))
							})
						]
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					!searched && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "⌕",
						title: t("search.startTitle"),
						children: t("search.startText")
					}),
					searched && !searching && results.length === 0 && error === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "0",
						title: t("search.emptyTitle"),
						children: t("search.emptyText")
					}),
					results.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: relatedTo === null ? MnemonView_module_css_default.singleColumn : MnemonView_module_css_default.resultLayout,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.results,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.sectionHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("search.results") }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: results.length })]
							}), results.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
								insight,
								writeEnabled: props.writeEnabled,
								onForget: forget,
								onRelated: (item) => void showRelated(item)
							}, insightKey(insight)))]
						}), relatedTo !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: MnemonView_module_css_default.relatedPane,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.sectionHeading,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("search.related") }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setRelatedTo(null),
										"aria-label": t("search.closeRelated"),
										children: "×"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: MnemonView_module_css_default.relatedSource,
									children: relatedTo.content
								}),
								relatedLoading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.loading,
									children: t("search.traversing")
								}),
								!relatedLoading && related.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.muted,
									children: t("search.noRelated")
								}),
								related.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
									insight,
									writeEnabled: props.writeEnabled,
									onForget: forget,
									onRelated: (item) => void showRelated(item)
								}, insightKey(insight)))
							]
						})]
					})
				]
			});
		}
		function EntitiesPage(props) {
			const t = useT();
			const [view, setView] = (0, react.useState)({
				items: [],
				insights: []
			});
			const [entity, setEntity] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const load = (0, react.useCallback)(async (selected) => {
				setLoading(true);
				setError(null);
				try {
					setView(await props.client.entities(selected, 20));
				} catch (reason) {
					setError(message(reason));
				} finally {
					setLoading(false);
				}
			}, [props.client]);
			(0, react.useEffect)(() => {
				load();
			}, [load, props.revision]);
			const submit = (event) => {
				event.preventDefault();
				if (entity.trim() !== "") load(entity);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					title: t("entities.title"),
					description: t("entities.description"),
					meta: t("entities.count", { count: view.items.length })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonView_module_css_default.entityLayout,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: MnemonView_module_css_default.entityRail,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: MnemonView_module_css_default.entitySearch,
								onSubmit: submit,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									"aria-label": t("entities.nameAria"),
									value: entity,
									onChange: (event) => setEntity(event.target.value),
									placeholder: t("entities.placeholder")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									className: MnemonView_module_css_default.primaryButton,
									disabled: loading || entity.trim() === "",
									children: t("entities.action")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.entityHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("entities.top") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("entities.frequency") })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.entityList,
								children: view.items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": view.selected === item.entity,
									onClick: () => {
										setEntity(item.entity);
										load(item.entity);
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.entity }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.count })]
								}, item.entity))
							}),
							!loading && view.items.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonView_module_css_default.muted,
								children: t("entities.emptyRail")
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.entityResults,
						children: [
							error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.inlineError,
								role: "alert",
								children: error
							}),
							loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.loadingPanel,
								children: t("entities.loading")
							}),
							!loading && view.selected === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
								glyph: "◎",
								title: t("entities.selectTitle"),
								children: t("entities.selectText")
							}),
							!loading && view.selected !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.sectionHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: view.selected }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: view.insights.length })]
							}), view.insights.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
								glyph: "0",
								title: t("entities.emptyTitle"),
								children: t("entities.emptyText")
							}) : view.insights.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
								insight,
								writeEnabled: props.writeEnabled,
								onForget: props.onForget,
								onRelated: () => props.onExplore(insight.content)
							}, insightKey(insight)))] })
						]
					})]
				})]
			});
		}
		function RuntimePage(props) {
			const t = useT();
			const [snapshot, setSnapshot] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [target, setTarget] = (0, react.useState)("memory");
			const [importance, setImportance] = (0, react.useState)("normal");
			const [content, setContent] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			const [editing, setEditing] = (0, react.useState)(null);
			const [editContent, setEditContent] = (0, react.useState)("");
			const [editImportance, setEditImportance] = (0, react.useState)("normal");
			const [removing, setRemoving] = (0, react.useState)(null);
			const load = (0, react.useCallback)(async () => {
				setLoading(true);
				setError(null);
				try {
					setSnapshot(await props.client.runtimeMemory());
				} catch (reason) {
					setError(message(reason));
				} finally {
					setLoading(false);
				}
			}, [props.client]);
			(0, react.useEffect)(() => {
				load();
			}, [load, props.revision]);
			const entryKey = (entry) => `${entry.target}:${entry.created_at}:${entry.content}`;
			const mutate = async (request) => {
				setNotice(null);
				setError(null);
				const result = await props.client.mutateRuntimeMemory(request);
				setNotice(result.maintenance === void 0 ? t(`runtime.result.${request.action}`, {
					target: t(`runtime.target.${request.target}`),
					count: result.entryCount
				}) : result.maintenance.kind === "local-compaction" ? t("runtime.result.localCompaction", {
					target: t(`runtime.target.${request.target}`),
					count: result.entryCount
				}) : t("runtime.result.maintenance", {
					target: t(`runtime.target.${request.target}`),
					count: result.entryCount,
					spaces: result.maintenance.memoryBodyIds.join(", ") || "—"
				}));
				await load();
				props.onMutate();
			};
			const add = async (event) => {
				event.preventDefault();
				if (content.trim() === "") return;
				setSaving(true);
				try {
					await mutate({
						action: "add",
						target,
						content,
						importance
					});
					setContent("");
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSaving(false);
				}
			};
			const beginEdit = (entry) => {
				setEditing(entryKey(entry));
				setEditContent(entry.content);
				setEditImportance(entry.importance);
				setRemoving(null);
			};
			const replace = async (entry) => {
				if (editContent.trim() === "") return;
				setSaving(true);
				try {
					await mutate({
						action: "replace",
						target: entry.target,
						old_text: entry.content,
						content: editContent,
						importance: editImportance
					});
					setEditing(null);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSaving(false);
				}
			};
			const remove = async (entry) => {
				setSaving(true);
				try {
					await mutate({
						action: "remove",
						target: entry.target,
						old_text: entry.content
					});
					setRemoving(null);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSaving(false);
				}
			};
			const targetPanel = (value) => {
				const view = snapshot?.targets[value];
				const entries = snapshot?.entries.filter((entry) => entry.target === value) ?? [];
				const percentage = view === void 0 || view.limit === 0 ? 0 : Math.min(100, Math.round(view.used / view.limit * 100));
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: MnemonView_module_css_default.runtimeTarget,
					"aria-label": t(`runtime.target.${value}`),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: MnemonView_module_css_default.runtimeTargetHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: value === "user" ? "USER.md" : "MEMORY.md" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t(`runtime.target.${value}`) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: view?.entryCount ?? 0 })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.capacityLine,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${percentage}%` } }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: view === void 0 ? "—" : `${humanBytes(view.used)} / ${humanBytes(view.limit)}` })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonView_module_css_default.runtimeTargetDescription,
							children: t(`runtime.target.${value}.description`)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.runtimeEntries,
							children: [entries.map((entry) => {
								const key = entryKey(entry);
								const isEditing = editing === key;
								const isRemoving = removing === key;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: MnemonView_module_css_default.runtimeEntry,
									"data-importance": entry.importance,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.runtimeEntryMeta,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(`runtime.importance.${entry.importance}`) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
												dateTime: entry.updated_at,
												children: new Date(entry.updated_at).toLocaleString()
											})]
										}),
										isEditing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
											"aria-label": t("runtime.editContent"),
											value: editContent,
											onChange: (event) => setEditContent(event.target.value),
											rows: 4
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: entry.content }),
										isEditing && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
											"aria-label": t("runtime.importance"),
											value: editImportance,
											onChange: (event) => setEditImportance(event.target.value),
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "critical",
													children: t("runtime.importance.critical")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "normal",
													children: t("runtime.importance.normal")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "low",
													children: t("runtime.importance.low")
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", { children: isRemoving ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("runtime.removeConfirm") }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: MnemonView_module_css_default.dangerSolidButton,
												disabled: saving,
												onClick: () => void remove(entry),
												children: t("runtime.removeAction")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: MnemonView_module_css_default.ghostButton,
												onClick: () => setRemoving(null),
												children: t("common.cancel")
											})
										] }) : isEditing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: MnemonView_module_css_default.primaryButton,
											disabled: saving || editContent.trim() === "",
											onClick: () => void replace(entry),
											children: t("runtime.saveEdit")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: MnemonView_module_css_default.ghostButton,
											onClick: () => setEditing(null),
											children: t("common.cancel")
										})] }) : props.writeEnabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: MnemonView_module_css_default.ghostButton,
											onClick: () => beginEdit(entry),
											children: t("runtime.editAction")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: MnemonView_module_css_default.dangerButton,
											onClick: () => {
												setRemoving(key);
												setEditing(null);
											},
											children: t("runtime.removeAction")
										})] }) : null })
									]
								}, key);
							}), !loading && entries.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.runtimeEmpty,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "○" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("runtime.empty") })]
							})]
						})
					]
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("runtime.title"),
						description: t("runtime.description"),
						meta: snapshot === null ? t("common.loading") : t("runtime.total", { count: snapshot.entries.length }),
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							disabled: loading,
							onClick: () => void load(),
							children: t("runtime.refresh")
						})
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.runtimeNotice,
						role: "status",
						children: notice
					}),
					props.writeEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: MnemonView_module_css_default.runtimeComposer,
						onSubmit: (event) => void add(event),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.runtimeComposerHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("runtime.addTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("runtime.addDescription") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("runtime.hotContext") })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								"aria-label": t("runtime.content"),
								value: content,
								onChange: (event) => setContent(event.target.value),
								rows: 3,
								placeholder: t("runtime.placeholder")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.runtimeComposerActions,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("runtime.target"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: target,
										onChange: (event) => setTarget(event.target.value),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "memory",
											children: t("runtime.target.memory")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "user",
											children: t("runtime.target.user")
										})]
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("runtime.importance"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: importance,
										onChange: (event) => setImportance(event.target.value),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "critical",
												children: t("runtime.importance.critical")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "normal",
												children: t("runtime.importance.normal")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "low",
												children: t("runtime.importance.low")
											})
										]
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.primaryButton,
										disabled: saving || content.trim() === "",
										children: saving ? t("runtime.saving") : t("runtime.addAction")
									})
								]
							})
						]
					}),
					!props.writeEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.runtimeReadOnly,
						children: t("runtime.readOnly")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.runtimeGrid,
						children: [targetPanel("user"), targetPanel("memory")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: MnemonView_module_css_default.runtimeFootnote,
						children: t("runtime.footnote")
					})
				]
			});
		}
		function RememberPage(props) {
			const t = useT();
			const [content, setContent] = (0, react.useState)(props.seed);
			const [category, setCategory] = (0, react.useState)("general");
			const [importance, setImportance] = (0, react.useState)(3);
			const [tags, setTags] = (0, react.useState)("");
			const [entities, setEntities] = (0, react.useState)("");
			const [memoryBodyId, setMemoryBodyId] = (0, react.useState)("");
			const [supervising, setSupervising] = (0, react.useState)(false);
			const [saving, setSaving] = (0, react.useState)(false);
			const [result, setResult] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (props.seed !== "") setContent(props.seed);
			}, [props.seed]);
			(0, react.useEffect)(() => {
				if (memoryBodyId === "" && props.memoryBodies.length > 0) setMemoryBodyId((props.memoryBodies.find((body) => body.active) ?? props.memoryBodies[0]).id);
			}, [memoryBodyId, props.memoryBodies]);
			const supervise = async (event) => {
				event.preventDefault();
				if (content.trim() === "" || props.sessionId === void 0) return;
				setSupervising(true);
				setResult(null);
				try {
					const response = await props.client.supervise(content);
					setResult(`${t(response.action === "skipped" ? "remember.skipped" : "remember.completed")}${response.memoryBodyIds.length === 0 ? "" : ` · ${response.memoryBodyIds.join(", ")}`}${response.summary === "" ? "" : ` · ${response.summary}`}`);
					setContent("");
					props.onMutate();
				} catch (reason) {
					setResult(t("remember.dispatchFailed", { error: message(reason) }));
				} finally {
					setSupervising(false);
				}
			};
			const manualSave = async (event) => {
				event.preventDefault();
				if (content.trim() === "") return;
				setSaving(true);
				setResult(null);
				try {
					const response = await props.client.remember({
						content,
						category,
						importance,
						tags: tags.split(",").map((value) => value.trim()).filter(Boolean),
						entities: entities.split(",").map((value) => value.trim()).filter(Boolean),
						source: "user",
						...memoryBodyId === "" ? {} : { memoryBodyId }
					});
					const action = typeof response.action === "string" ? response.action : "saved";
					const summary = typeof response.summary === "string" ? response.summary : "";
					setResult(action === "skipped" ? `${t("remember.skipped")}${summary === "" ? "" : ` · ${summary}`}` : `${t("remember.processed", { action })}${summary === "" ? "" : ` · ${summary}`}`);
					if (action !== "skipped") {
						setContent("");
						setTags("");
						setEntities("");
						props.onMutate();
					}
				} catch (reason) {
					setResult(t("remember.saveFailed", { error: message(reason) }));
				} finally {
					setSaving(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					title: t("remember.title"),
					description: t("remember.description"),
					meta: props.writeEnabled ? t("remember.worker") : t("common.readOnly")
				}), !props.writeEnabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					glyph: "⊘",
					title: t("remember.readOnlyTitle"),
					children: t("remember.readOnlyText")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonView_module_css_default.writebackLayout,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: MnemonView_module_css_default.writeGuide,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("remember.flowTitle") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ol", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("remember.routeTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("remember.routeText") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("remember.dedupeTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("remember.dedupeText") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("remember.writeTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("remember.writeText") })] })
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("remember.flowText") })
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.supervisedComposer,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: MnemonView_module_css_default.supervisedForm,
							onSubmit: (event) => void supervise(event),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.supervisedHeading,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("remember.delegateTitle") }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: props.sessionId === void 0 ? MnemonView_module_css_default.sessionMissing : MnemonView_module_css_default.sessionReady,
										children: props.sessionId === void 0 ? t("remember.noSession") : t("remember.ready")
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: MnemonView_module_css_default.fieldWide,
									children: [t("remember.candidate"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										"aria-label": t("remember.candidateAria"),
										value: content,
										onChange: (event) => setContent(event.target.value),
										maxLength: 8e3,
										rows: 8,
										placeholder: t("remember.placeholder")
									})]
								}),
								props.sessionId === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: MnemonView_module_css_default.sessionHint,
									children: t("remember.sessionHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.primaryButton,
										disabled: supervising || content.trim() === "" || props.sessionId === void 0,
										children: supervising ? t("remember.processing") : t("remember.action")
									}), result !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										role: "status",
										children: result
									})]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: MnemonView_module_css_default.advancedWrite,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("remember.advanced") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("remember.advancedHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("remember.expand") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: MnemonView_module_css_default.manualForm,
								onSubmit: (event) => void manualSave(event),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formGrid,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: MnemonView_module_css_default.fieldWide,
											children: [t("remember.target"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
												"aria-label": t("remember.target"),
												value: memoryBodyId,
												onChange: (event) => setMemoryBodyId(event.target.value),
												children: props.memoryBodies.map((body) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
													value: body.id,
													children: [
														body.name,
														" · ",
														body.id,
														body.active ? ` · ${t("common.active")}` : ""
													]
												}, body.id))
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("common.category"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
											value: category,
											onChange: (event) => setCategory(event.target.value),
											children: CATEGORIES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value,
												children: categoryLabel(t, value)
											}, value))
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("common.importanceLabel"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
											value: importance,
											onChange: (event) => setImportance(Number(event.target.value)),
											children: [
												1,
												2,
												3,
												4,
												5
											].map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
												value,
												children: [value, " / 5"]
											}, value))
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: MnemonView_module_css_default.fieldWide,
											children: [t("remember.entities"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												value: entities,
												onChange: (event) => setEntities(event.target.value),
												placeholder: "SQLite, DSH"
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: MnemonView_module_css_default.fieldWide,
											children: [t("remember.tags"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												value: tags,
												onChange: (event) => setTags(event.target.value),
												placeholder: "architecture, local-first"
											})]
										})
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.manualActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("remember.advancedText") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.secondaryButton,
										disabled: saving || content.trim() === "" || props.sessionId === void 0 || memoryBodyId === "",
										children: saving ? t("remember.saving") : t("remember.advancedAction")
									})]
								})]
							})]
						})]
					})]
				})]
			});
		}
		function ListPage(props) {
			const t = useT();
			const [query, setQuery] = (0, react.useState)("");
			const [category, setCategory] = (0, react.useState)("");
			const [view, setView] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const load = (0, react.useCallback)(async () => {
				setLoading(true);
				setError(null);
				try {
					setView(await props.client.list({
						...query.trim() === "" ? {} : { query },
						...category === "" ? {} : { category },
						limit: 1e3
					}));
				} catch (reason) {
					setError(message(reason));
				} finally {
					setLoading(false);
				}
			}, [
				category,
				props.client,
				query
			]);
			(0, react.useEffect)(() => {
				load();
			}, [props.revision]);
			const submit = (event) => {
				event.preventDefault();
				load();
			};
			const forget = async (insight) => {
				await props.onForget(insight);
				setView((current) => current === null ? current : {
					...current,
					total: Math.max(0, current.total - 1),
					items: current.items.filter((item) => insightKey(item) !== insightKey(insight))
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("content.title"),
						description: t("content.description"),
						meta: t("content.count", { count: view?.total ?? "—" })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: MnemonView_module_css_default.listToolbar,
						onSubmit: submit,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								"aria-label": t("content.filterAria"),
								value: query,
								onChange: (event) => setQuery(event.target.value),
								placeholder: t("content.filterPlaceholder")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("content.categoryAria"),
								value: category,
								onChange: (event) => setCategory(event.target.value),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: t("common.allCategories")
								}), CATEGORIES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value,
									children: categoryLabel(t, value)
								}, value))]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								className: MnemonView_module_css_default.primaryButton,
								disabled: loading,
								children: loading ? t("common.loading") : t("content.apply")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.listNotice,
						children: t("content.notice")
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					!loading && view?.items.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "≡",
						title: t("content.emptyTitle"),
						children: t("content.emptyText")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.memoryList,
						children: view?.items.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
							insight,
							writeEnabled: props.writeEnabled,
							onForget: forget,
							onClone: props.onClone,
							onRelated: () => props.onExplore(insight.content)
						}, insightKey(insight)))
					})
				]
			});
		}
		function DocumentsPage(props) {
			const t = useT();
			const [snapshot, setSnapshot] = (0, react.useState)(null);
			const [items, setItems] = (0, react.useState)([]);
			const [selectedId, setSelectedId] = (0, react.useState)(null);
			const [selected, setSelected] = (0, react.useState)(null);
			const [status, setStatus] = (0, react.useState)("active");
			const [query, setQuery] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const [saving, setSaving] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [composing, setComposing] = (0, react.useState)(false);
			const [editing, setEditing] = (0, react.useState)(false);
			const [confirmArchive, setConfirmArchive] = (0, react.useState)(false);
			const [title, setTitle] = (0, react.useState)("");
			const [description, setDescription] = (0, react.useState)("");
			const [content, setContent] = (0, react.useState)("");
			const [sources, setSources] = (0, react.useState)("");
			const display = (0, react.useCallback)(async (nextQuery, nextStatus) => {
				setLoading(true);
				setError(null);
				try {
					const current = await props.client.documents();
					const filtered = (nextQuery.trim() === "" ? current.documents : (await props.client.searchDocuments(nextQuery, nextStatus === "archived")).results).filter((record) => record.status === nextStatus);
					setSnapshot(current);
					setItems(filtered);
					setSelectedId((previous) => previous !== null && filtered.some((record) => record.id === previous) ? previous : filtered[0]?.id ?? null);
				} catch (reason) {
					setError(message(reason));
					setSnapshot(null);
					setItems([]);
					setSelectedId(null);
				} finally {
					setLoading(false);
				}
			}, [props.client]);
			(0, react.useEffect)(() => {
				display(query, status);
			}, [
				display,
				props.revision,
				status
			]);
			(0, react.useEffect)(() => {
				if (selectedId === null) {
					setSelected(null);
					return;
				}
				let active = true;
				props.client.document(selectedId).then((value) => {
					if (active) setSelected(value);
				}).catch((reason) => {
					if (active) setError(message(reason));
				});
				return () => {
					active = false;
				};
			}, [
				props.client,
				selectedId,
				props.revision
			]);
			const resetComposer = () => {
				setTitle("");
				setDescription("");
				setContent("");
				setSources("");
				setComposing(false);
			};
			const sourcePaths = (value) => value.split(/\r?\n|,/gu).map((path) => path.trim()).filter(Boolean);
			const create = async (event) => {
				event.preventDefault();
				setSaving(true);
				setError(null);
				setNotice(null);
				try {
					const result = await props.client.mutateDocument({
						action: "create",
						title,
						description,
						content,
						sourcePaths: sourcePaths(sources)
					});
					setNotice(result.maintenance === void 0 ? t("documents.created") : t("documents.createdAfterArchive", { count: result.maintenance.archivedDocumentIds.length }));
					setStatus("active");
					setQuery("");
					resetComposer();
					props.onMutate();
					await display("", "active");
					setSelectedId(result.document.id);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSaving(false);
				}
			};
			const beginEdit = () => {
				if (selected === null) return;
				setTitle(selected.title);
				setDescription(selected.description);
				setContent(selected.content);
				setSources(selected.sourcePaths.join("\n"));
				setEditing(true);
				setComposing(false);
				setConfirmArchive(false);
			};
			const update = async (event) => {
				event.preventDefault();
				if (selected === null) return;
				setSaving(true);
				setError(null);
				setNotice(null);
				try {
					const result = await props.client.mutateDocument({
						action: "update",
						id: selected.id,
						title,
						description,
						content,
						sourcePaths: sourcePaths(sources)
					});
					setNotice(result.maintenance === void 0 ? t("documents.updated") : t("documents.updatedAfterArchive", { count: result.maintenance.archivedDocumentIds.length }));
					setEditing(false);
					props.onMutate();
					await display(query, status);
					setSelectedId(result.document.id);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSaving(false);
				}
			};
			const archive = async () => {
				if (selected === null) return;
				setSaving(true);
				setError(null);
				setNotice(null);
				try {
					const result = await props.client.archiveDocument(selected.id);
					setNotice(t("documents.archived", { spaces: result.maintenance?.memoryBodyIds.join(", ") || "—" }));
					setConfirmArchive(false);
					setStatus("archived");
					setQuery("");
					props.onMutate();
					await display("", "archived");
					setSelectedId(result.document.id);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSaving(false);
				}
			};
			const usage = snapshot === null ? 0 : Math.min(100, snapshot.activeBytes / snapshot.limitBytes * 100);
			const activeCount = snapshot?.activeCount ?? 0;
			const archivedCount = snapshot?.archivedCount ?? 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("documents.title"),
						description: t("documents.description"),
						meta: snapshot === null ? t("common.loading") : t("documents.capacity", {
							used: humanBytes(snapshot.activeBytes),
							limit: humanBytes(snapshot.limitBytes)
						}),
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							disabled: loading,
							onClick: () => void display(query, status),
							children: t("documents.refresh")
						})
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.runtimeNotice,
						role: "status",
						children: notice
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.documentSummary,
						"aria-label": t("documents.summary"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("documents.active") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: activeCount }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("documents.activeHint") })
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("documents.archivedCount") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: archivedCount }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("documents.archivedHint") })
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
								className: MnemonView_module_css_default.documentCapacity,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("documents.activeCapacity") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: snapshot === null ? "—" : `${usage.toFixed(1)}%` }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${usage}%` } }) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("documents.capacityHint") })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.documentToolbar,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								onSubmit: (event) => {
									event.preventDefault();
									display(query, status);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "⌕"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										"aria-label": t("documents.searchAria"),
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: t("documents.searchPlaceholder")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.secondaryButton,
										children: t("documents.search")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								role: "group",
								"aria-label": t("documents.scope"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-active": status === "active" || void 0,
									onClick: () => setStatus("active"),
									children: [
										t("documents.active"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: activeCount })
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-active": status === "archived" || void 0,
									onClick: () => setStatus("archived"),
									children: [
										t("documents.archivedCount"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: archivedCount })
									]
								})]
							}),
							props.writeEnabled && props.sessionId !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.primaryButton,
								onClick: () => {
									setComposing((value) => !value);
									setEditing(false);
								},
								children: composing ? t("common.cancel") : t("documents.new")
							})
						]
					}),
					composing && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: MnemonView_module_css_default.documentEditor,
						onSubmit: (event) => void create(event),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("documents.newTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("documents.editorHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("documents.managedCopy") })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.documentEditorMeta,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.name"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: title,
									onChange: (event) => setTitle(event.target.value),
									required: true
								})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.routing"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: description,
									onChange: (event) => setDescription(event.target.value)
								})] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.sources"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: sources,
								onChange: (event) => setSources(event.target.value),
								placeholder: t("documents.sourcesPlaceholder")
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.markdown"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								value: content,
								onChange: (event) => setContent(event.target.value),
								rows: 10,
								required: true
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: resetComposer,
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								className: MnemonView_module_css_default.primaryButton,
								disabled: saving || title.trim() === "" || content.trim() === "",
								children: saving ? t("documents.saving") : t("documents.create")
							})] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.documentWorkspace,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: MnemonView_module_css_default.documentList,
							"aria-label": t("documents.list"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: status === "active" ? t("documents.activeList") : t("documents.archiveList") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: items.length })] }),
								items.map((document) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-selected": selectedId === document.id || void 0,
									onClick: () => {
										setSelectedId(document.id);
										setEditing(false);
										setConfirmArchive(false);
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: document.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
											dateTime: document.updatedAt,
											children: new Date(document.updatedAt).toLocaleDateString()
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: document.description || document.excerpt || t("documents.noDescription") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: humanBytes(document.sizeBytes) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: document.id.slice(0, 8) }),
											document.healthy === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: t("documents.missing") })
										] })
									]
								}, document.id)),
								!loading && items.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.documentListEmpty,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▤" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: status === "active" ? t("documents.emptyActive") : t("documents.emptyArchived") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: status === "active" ? t("documents.emptyActiveText") : t("documents.emptyArchivedText") })
									]
								}),
								loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.loading,
									children: t("common.loading")
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
							className: MnemonView_module_css_default.documentReader,
							"aria-label": t("documents.reader"),
							children: selected === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
								glyph: "▤",
								title: t("documents.selectTitle"),
								children: t("documents.selectText")
							}) : editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: MnemonView_module_css_default.documentEditor,
								onSubmit: (event) => void update(event),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("documents.editTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("documents.editorHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.id })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.documentEditorMeta,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.name"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											value: title,
											onChange: (event) => setTitle(event.target.value),
											required: true
										})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.routing"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											value: description,
											onChange: (event) => setDescription(event.target.value)
										})] })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.sources"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										value: sources,
										onChange: (event) => setSources(event.target.value)
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("documents.markdown"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										value: content,
										onChange: (event) => setContent(event.target.value),
										rows: 18,
										required: true
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.ghostButton,
										onClick: () => setEditing(false),
										children: t("common.cancel")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.primaryButton,
										disabled: saving,
										children: saving ? t("documents.saving") : t("documents.save")
									})] })
								]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
								className: MnemonView_module_css_default.documentDetail,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selected.status === "active" ? t("documents.active") : t("documents.coldArchive") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: selected.title }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: selected.description || t("documents.noDescription") })
									] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: props.writeEnabled && selected.status === "active" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.secondaryButton,
										onClick: beginEdit,
										children: t("documents.edit")
									}) })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("documents.path") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.relativePath }) })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("documents.revision") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.revision })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("documents.hash") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.contentHash.slice(0, 16) }) })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("documents.size") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: humanBytes(selected.sizeBytes) })] })
									] }),
									selected.sourcePaths.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.documentSources,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("documents.sources") }), selected.sourcePaths.map((path) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: path }, path))]
									}),
									selected.status === "archived" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.documentArchiveReceipt,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("documents.archiveReceipt") }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: selected.archiveSummary }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: selected.memoryBodyIds.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: id }, id)) })
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: selected.content }),
									props.writeEnabled && selected.status === "active" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", {
										className: MnemonView_module_css_default.documentDanger,
										children: confirmArchive ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("documents.archiveConfirm") }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: MnemonView_module_css_default.dangerSolidButton,
												disabled: saving,
												onClick: () => void archive(),
												children: saving ? t("documents.archiving") : t("documents.archiveNow")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: MnemonView_module_css_default.ghostButton,
												onClick: () => setConfirmArchive(false),
												children: t("common.cancel")
											})
										] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("documents.archiveTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("documents.archiveDescription") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: MnemonView_module_css_default.dangerButton,
											onClick: () => setConfirmArchive(true),
											children: t("documents.archive")
										})] })
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: MnemonView_module_css_default.runtimeFootnote,
						children: t("documents.footnote")
					})
				]
			});
		}
		function StatusPage(props) {
			const t = useT();
			const status = props.status;
			const lifecycle = status?.lifecycle;
			const current = lifecycle?.current;
			const workers = lifecycle?.subagents;
			const documents = status?.documents;
			const reviewActivity = current?.reviewActivity;
			const reviewThreshold = reviewActivity?.threshold ?? QODERWORK_REVIEW_POLICY.reviewThreshold;
			const catalogKnown = status?.memoryBodies !== void 0;
			const memoryBodies = (0, react.useMemo)(() => status?.memoryBodies ?? [], [status]);
			const activeBodies = memoryBodies.filter((body) => body.active).length;
			const phase = current?.lastPhase === void 0 || current.lastPhase === "idle" ? t("status.phaseIdle") : current.lastPhase === "supervised" ? t("status.phaseSupervised") : current.lastPhase === "error" ? t("status.phaseError") : current.lastPhase === "prime" ? t("status.prime") : current.lastPhase === "recall" ? t("status.recallWorker") : current.lastPhase === "review" ? t("status.phaseReview") : t("status.writeWorker");
			const reviewState = current?.reviewRunning === true ? t("status.reviewRunning") : current?.idleReviewPending === true ? t("status.reviewPending") : reviewActivity?.eligible === true ? t("status.reviewQualified") : t("status.reviewAccumulating");
			const lastReview = current?.lastReviewAt === void 0 ? t("status.noReview") : t("status.reviewAt", {
				time: new Date(current.lastReviewAt).toLocaleTimeString(),
				action: current.lastReviewAction ?? "—",
				score: current.lastReviewScore ?? "—"
			});
			const storage = status?.storage;
			const selectedScopeKind = storage?.activeKind ?? "global";
			const selectedScope = storage?.scopes.find((scope) => scope.kind === selectedScopeKind);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("status.title"),
						description: t("status.description"),
						meta: status?.healthy === true && lifecycle?.sessionAvailable === true ? t("status.nominal") : t("status.checkRequired"),
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							onClick: props.onRefresh,
							children: props.loading ? t("status.rechecking") : t("status.recheck")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.healthStrip,
						"aria-label": t("status.aria"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${status?.healthy === true ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthBad}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.engine") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: status?.healthy === true ? t("status.engineConnected") : t("status.engineUnavailable") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: status?.version === void 0 ? t("status.versionWaiting") : `CLI ${status.version}` })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${activeBodies > 0 ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthMuted}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.spaces") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: catalogKnown ? t("status.activeRatio", {
									active: activeBodies,
									total: memoryBodies.length
								}) : t("status.directoryUnsynced") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("status.activeMemories", { count: status?.stats?.totalInsights ?? 0 }) })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${documents === void 0 ? MnemonView_module_css_default.healthMuted : MnemonView_module_css_default.healthGood}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.documents") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: documents === void 0 ? t("status.documentsWaiting") : t("status.documentRatio", {
									active: documents.activeCount,
									archived: documents.archivedCount
								}) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: documents === void 0 ? t("status.documentsSession") : t("status.documentUsage", {
									used: humanBytes(documents.activeBytes),
									limit: humanBytes(documents.limitBytes)
								}) })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${lifecycle?.sessionAvailable === true ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthBad}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.router") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: lifecycle?.sessionAvailable === true ? t("status.routerReady") : t("status.sessionMissing") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: workers === void 0 ? t("status.orchestrationWaiting") : t("status.workerSummary", {
									recalls: workers.recalls,
									reviews: workers.reviews ?? 0,
									writes: workers.writes,
									failures: workers.failures ?? 0
								}) })
							] })] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MemorySystemFlow, {
						status,
						reviewState
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StorageDomains, {
						catalog: storage,
						selected: selectedScope,
						selectedKind: selectedScopeKind
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.lifecyclePanel,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.statusSectionHeader,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("status.lifecycle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("status.lifecycleText") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: MnemonView_module_css_default.phaseBadge,
									children: phase
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.lifecycleFlow,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "01" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.prime") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("status.primeText") })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: lifecycle?.counters.primes ?? 0 })
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
										"data-disabled": lifecycle?.recallMode === "off" || void 0,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "02" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.recallWorker") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: lifecycle?.recallMode === "guided" ? t("status.recallText") : t("status.recallOff") })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: workers?.recalls ?? 0 })
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
										"data-disabled": lifecycle?.writebackMode === "off" || void 0,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "03" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.writeWorker") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: lifecycle?.writebackMode === "guided" ? t("status.writeText", {
												threshold: reviewThreshold,
												seconds: Math.round((lifecycle.idleReviewMs ?? 0) / 1e3)
											}) : t("status.writeOff") })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: workers?.reviews ?? 0 })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.lifecycleFoot,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("status.activitySignals"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.activitySignalValues", {
											chars: reviewActivity?.totalUserTextLength ?? 0,
											turns: reviewActivity?.turnCount ?? 0,
											tools: reviewActivity?.toolCallCount ?? 0,
											unique: reviewActivity?.uniqueToolCount ?? 0
										}) })
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("status.lastReview"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: lastReview })
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("status.workerFailures"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: workers?.failures ?? 0 })
									] })
								]
							}),
							current?.lastError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.inlineError,
								role: "alert",
								children: ["Lifecycle：", current.lastError]
							})
						]
					})
				]
			});
		}
		function storageScopeLabel(t, kind) {
			return t(kind === "global" ? "status.storageGlobal" : kind === "workspace" ? "status.storageWorkspace" : "status.storageCustom");
		}
		function storageAreaLabel(t, kind) {
			return t(kind === "runtime" ? "status.storageRuntime" : kind === "memory-bodies" ? "status.storageBodies" : kind === "documents" ? "status.storageDocuments" : "status.storageState");
		}
		function storageAreaDetails(t, area) {
			if (area.kind === "runtime") return t("status.storageRuntimeDetail", {
				user: area.details.userEntries ?? 0,
				memory: area.details.memoryEntries ?? 0
			});
			if (area.kind === "memory-bodies") return t("status.storageBodiesDetail", {
				active: area.details.activeBodies ?? 0,
				databases: area.details.databases ?? 0
			});
			if (area.kind === "documents") return t("status.storageDocumentsDetail", {
				active: area.details.activeDocuments ?? 0,
				archived: area.details.archivedDocuments ?? 0
			});
			return area.details.reviewLedger === true ? t("status.storageStateReady") : t("status.storageStateVolatile");
		}
		function StorageDomains(props) {
			const t = useT();
			const areaStatus = (status) => t(status === "ready" ? "status.storageReady" : status === "empty" ? "status.storageEmpty" : status === "missing" ? "status.storageMissing" : "status.storageInvalid");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: MnemonView_module_css_default.storageDomains,
				"aria-label": t("status.storageDomains"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.statusSectionHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("status.storageDomains") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("status.storageDomainsText") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonView_module_css_default.phaseBadge,
							children: storageScopeLabel(t, props.selectedKind)
						})]
					}),
					props.catalog === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.storageUnavailable,
						children: t("status.storageWaiting")
					}) : props.selected?.root === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.storageUnavailable,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: storageScopeLabel(t, props.selectedKind) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: props.selectedKind === "custom" ? t("status.storageCustomUnset") : t("status.storageWorkspaceUnavailable") })]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.storageRoot,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							storageScopeLabel(t, props.selectedKind),
							" · ",
							t("status.storageActiveRoot")
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: props.selected.root })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: humanBytes(props.selected.totalBytes) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.selected.available ? t("status.storageAvailable") : t("status.storageNotCreated") })] })]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.storageAreaGrid,
						children: props.selected.areas.map((area) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
							"data-status": area.status,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: storageAreaLabel(t, area.kind) })
								] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: areaStatus(area.status) })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.storageAreaMetric,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: area.itemCount }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("status.storageItems") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: humanBytes(area.bytes) })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: storageAreaDetails(t, area) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
									className: MnemonView_module_css_default.storagePath,
									children: area.path
								}),
								area.issue !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: area.issue })
							]
						}, area.kind))
					})] }),
					props.catalog !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: MnemonView_module_css_default.storageFootnote,
						children: t("status.storageFootnote", { root: props.catalog.activeRoot })
					})
				]
			});
		}
		function MemorySystemFlow(props) {
			const t = useT();
			const status = props.status;
			const id = (0, react.useId)().replace(/:/g, "");
			const titleId = `${id}-title`;
			const descriptionId = `${id}-description`;
			const arrowId = `${id}-arrow`;
			const archiveArrowId = `${id}-archive-arrow`;
			const glowId = `${id}-glow`;
			const pathId = (name) => `${id}-${name}`;
			const activeScope = status?.storage?.scopes.find((scope) => scope.active);
			const runtime = activeScope?.areas.find((area) => area.kind === "runtime");
			const documentArea = activeScope?.areas.find((area) => area.kind === "documents");
			const documents = status?.documents;
			const bodies = status?.memoryBodies ?? [];
			const activeBodies = bodies.filter((body) => body.active).length;
			const score = status?.lifecycle?.current?.reviewActivity?.score ?? 0;
			const threshold = status?.lifecycle?.current?.reviewActivity?.threshold ?? QODERWORK_REVIEW_POLICY.reviewThreshold;
			const hostReady = status?.lifecycle?.sessionAvailable === true;
			const flowActive = status?.healthy === true && hostReady;
			const areaState = (area) => area?.status === "invalid" ? "error" : area?.status === "ready" ? "ready" : "idle";
			const markerEnd = `url(#${arrowId})`;
			const archiveMarkerEnd = `url(#${archiveArrowId})`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: MnemonView_module_css_default.memoryFlow,
				"aria-label": t("status.flowTitle"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.statusSectionHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("status.flowTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("status.flowDescription") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${MnemonView_module_css_default.runtimeBadge} ${flowActive ? MnemonView_module_css_default.runtimeOnline : MnemonView_module_css_default.runtimeOffline}`,
							children: flowActive ? t("status.flowLive") : t("status.flowDegraded")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.memoryFlowCanvas,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 1040 326",
							role: "img",
							"aria-labelledby": `${titleId} ${descriptionId}`,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", {
									id: titleId,
									children: t("status.flowTitle")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("desc", {
									id: descriptionId,
									children: t("status.flowDescription")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
										id: arrowId,
										markerWidth: "8",
										markerHeight: "8",
										refX: "7",
										refY: "4",
										orient: "auto",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											className: MnemonView_module_css_default.flowArrow,
											d: "M0 0L8 4L0 8Z"
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
										id: archiveArrowId,
										markerWidth: "8",
										markerHeight: "8",
										refX: "7",
										refY: "4",
										orient: "auto",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											className: MnemonView_module_css_default.flowArchiveArrow,
											d: "M0 0L8 4L0 8Z"
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("filter", {
										id: glowId,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("feGaussianBlur", {
											stdDeviation: "3",
											result: "blur"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("feMergeNode", { in: "blur" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("feMergeNode", { in: "SourceGraphic" })] })]
									})
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowPaths,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("ingest"),
											markerEnd,
											d: "M190 163 C235 163 245 163 284 163"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("hot"),
											markerEnd,
											d: "M446 148 C486 130 500 88 548 78"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("docs"),
											markerEnd,
											d: "M446 163 C486 163 500 163 548 163"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("durable"),
											markerEnd,
											d: "M446 178 C486 198 500 241 548 248"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("hot-context"),
											markerEnd,
											d: "M712 78 C770 85 784 133 836 148"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("doc-context"),
											markerEnd,
											d: "M712 163 C762 163 788 163 836 163"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("recall"),
											markerEnd,
											d: "M712 248 C770 239 785 192 836 178"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("hot-archive"),
											markerEnd: archiveMarkerEnd,
											className: MnemonView_module_css_default.flowArchivePath,
											d: "M630 112 C630 145 630 199 630 218"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											id: pathId("doc-archive"),
											markerEnd: archiveMarkerEnd,
											className: MnemonView_module_css_default.flowArchivePath,
											d: "M670 195 C681 213 674 225 658 232"
										})
									]
								}),
								flowActive && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowParticles,
									style: { "--flow-glow": `url(#${glowId})` },
									"aria-hidden": "true",
									children: [[
										"ingest",
										"hot",
										"docs",
										"durable",
										"hot-context",
										"doc-context",
										"recall"
									].map((path, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
										r: "3",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("animateMotion", {
											dur: `${2.4 + index * .16}s`,
											begin: `${index * -.47}s`,
											repeatCount: "indefinite",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("mpath", { href: `#${pathId(path)}` })
										})
									}, path)), ["hot-archive", "doc-archive"].map((path, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
										className: MnemonView_module_css_default.flowArchiveParticle,
										r: "3",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("animateMotion", {
											dur: `${3.1 + index * .35}s`,
											begin: `${index * -1.1}s`,
											repeatCount: "indefinite",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("mpath", { href: `#${pathId(path)}` })
										})
									}, path))]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowNode,
									"data-state": hostReady ? "ready" : "idle",
									transform: "translate(30 119)",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											width: "160",
											height: "88",
											rx: "15"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "20",
											cy: "20",
											r: "4"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeLabel,
											x: "18",
											y: "47",
											children: t("status.flowConversation")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeMeta,
											x: "18",
											y: "67",
											children: t("status.flowTurns")
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: `${MnemonView_module_css_default.flowNode} ${MnemonView_module_css_default.flowSupervisor}`,
									"data-state": hostReady ? "ready" : "idle",
									transform: "translate(284 105)",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											width: "162",
											height: "116",
											rx: "17"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "20",
											cy: "20",
											r: "4"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeLabel,
											x: "18",
											y: "48",
											children: t("status.flowSupervisor")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeMeta,
											x: "18",
											y: "69",
											children: props.reviewState
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("text", {
											className: MnemonView_module_css_default.flowNodeValue,
											x: "18",
											y: "96",
											children: [
												score,
												" / ",
												threshold
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowNode,
									"data-state": areaState(runtime),
									transform: "translate(548 35)",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											width: "164",
											height: "78",
											rx: "14"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "20",
											cy: "19",
											r: "4"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeLabel,
											x: "18",
											y: "43",
											children: t("status.storageRuntime")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeMeta,
											x: "18",
											y: "62",
											children: t("status.flowEntries", { count: runtime?.itemCount ?? 0 })
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowNode,
									"data-state": areaState(documentArea),
									transform: "translate(548 124)",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											width: "164",
											height: "78",
											rx: "14"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "20",
											cy: "19",
											r: "4"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeLabel,
											x: "18",
											y: "43",
											children: t("status.storageDocuments")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeMeta,
											x: "18",
											y: "62",
											children: t("status.flowDocuments", {
												active: documents?.activeCount ?? 0,
												archived: documents?.archivedCount ?? 0
											})
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowNode,
									"data-state": status?.healthy === false ? "error" : activeBodies > 0 ? "ready" : "idle",
									transform: "translate(548 213)",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											width: "164",
											height: "78",
											rx: "14"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "20",
											cy: "19",
											r: "4"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeLabel,
											x: "18",
											y: "43",
											children: t("term.spaces")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeMeta,
											x: "18",
											y: "62",
											children: t("status.activeRatio", {
												active: activeBodies,
												total: bodies.length
											})
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: MnemonView_module_css_default.flowNode,
									"data-state": hostReady ? "ready" : "idle",
									transform: "translate(836 119)",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											width: "174",
											height: "88",
											rx: "15"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "20",
											cy: "20",
											r: "4"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeLabel,
											x: "18",
											y: "47",
											children: t("status.flowContext")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: MnemonView_module_css_default.flowNodeMeta,
											x: "18",
											y: "67",
											children: t("status.flowContextDetail")
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.flowLegend,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), t("status.flowReadWrite")] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), t("status.flowArchive")] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("status.flowCurrentScope", { scope: storageScopeLabel(t, status?.storage?.activeKind ?? "global") }) })
						]
					})
				]
			});
		}
		function MnemonView(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(I18nContext.Provider, {
				value: props.t ?? translateZh,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonWorkspace, { ...props })
			});
		}
		function MnemonWorkspace({ connection, sessionId }) {
			const t = useT();
			const client = (0, react.useMemo)(() => new MnemonClient(connection, sessionId), [connection, sessionId]);
			const [page, setPage] = (0, react.useState)("overview");
			const [status, setStatus] = (0, react.useState)(null);
			const [statusLoading, setStatusLoading] = (0, react.useState)(true);
			const [statusError, setStatusError] = (0, react.useState)(null);
			const [revision, setRevision] = (0, react.useState)(0);
			const [searchSeed, setSearchSeed] = (0, react.useState)("");
			const [rememberSeed, setRememberSeed] = (0, react.useState)("");
			const loadStatus = (0, react.useCallback)(async () => {
				setStatusLoading(true);
				setStatusError(null);
				try {
					setStatus(await client.status());
				} catch (reason) {
					setStatusError(message(reason));
				} finally {
					setStatusLoading(false);
				}
			}, [client]);
			(0, react.useEffect)(() => {
				loadStatus();
			}, [loadStatus]);
			const mutate = (0, react.useCallback)(() => {
				setRevision((value) => value + 1);
				loadStatus();
			}, [loadStatus]);
			const forget = (0, react.useCallback)(async (insight) => {
				await client.forget(insight.id, insight.memoryBodyId);
				mutate();
			}, [client, mutate]);
			const explore = (0, react.useCallback)((query) => {
				setSearchSeed(query);
				setPage("explore");
			}, []);
			const clone = (0, react.useCallback)((insight) => {
				setRememberSeed(insight.content);
				setPage("remember");
			}, []);
			const refreshAll = () => {
				setRevision((value) => value + 1);
				loadStatus();
			};
			const writeEnabled = status?.writeEnabled === true;
			const stats = status?.stats;
			const catalogKnown = status?.memoryBodies !== void 0;
			const memoryBodies = (0, react.useMemo)(() => status?.memoryBodies ?? [], [status]);
			const activeBodies = memoryBodies.filter((body) => body.active).length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: MnemonView_module_css_default.shell,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: MnemonView_module_css_default.masthead,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.brand,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonLogo, { className: MnemonView_module_css_default.brandLogo }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "Mnemon" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: MnemonView_module_css_default.telemetry,
								"aria-label": t("telemetry.aria"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.telemetryMetric,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("telemetry.memories") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.totalInsights ?? "—" })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.telemetryMetric,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("telemetry.graph") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.edgeCount ?? "—" })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.telemetryMetric,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("telemetry.entities") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.topEntities.length ?? "—" })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.telemetryMetric,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("telemetry.spaces") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: status === null || !catalogKnown ? "—" : activeBodies })]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.statusCluster,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.statusDot} ${status?.healthy === true ? MnemonView_module_css_default.online : MnemonView_module_css_default.offline}` }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLoading ? t("header.checking") : status?.healthy === true ? catalogKnown ? t("header.connected", { count: activeBodies }) : t("header.directoryPending") : t("header.unavailable") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.iconButton,
										onClick: refreshAll,
										"aria-label": t("common.refresh"),
										children: "↻"
									})
								]
							})
						]
					}),
					(statusError !== null || status?.healthy === false) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.alert,
						role: "alert",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("header.notReady") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusError ?? status?.error })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.workspace,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.topNavigation,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
								className: MnemonView_module_css_default.nav,
								"aria-label": t("nav.aria"),
								children: PAGE_NAV.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-current": page === item.id ? "page" : void 0,
									onClick: () => setPage(item.id),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.navGlyph,
										"aria-hidden": "true",
										children: item.glyph
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t(item.label) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t(item.detail) })] })]
								}, item.id))
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.spaceSummary,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("sidebar.activeSpaces") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: catalogKnown ? `${activeBodies} / ${memoryBodies.length}` : "— / —" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: writeEnabled ? t("common.agentSupervised") : t("common.readOnly") })
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.canvas,
							children: [
								page === "overview" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OverviewPage, {
									client,
									revision,
									writeEnabled,
									fallbackBodies: memoryBodies,
									fallbackDirectory: status?.memoryBodyDirectory,
									catalogKnown,
									onMutate: mutate,
									onExplore: explore
								}),
								page === "runtime" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RuntimePage, {
									client,
									revision,
									writeEnabled,
									onMutate: mutate
								}),
								page === "documents" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DocumentsPage, {
									client,
									revision,
									writeEnabled,
									...sessionId === void 0 ? {} : { sessionId },
									onMutate: mutate
								}),
								page === "explore" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorePage, {
									client,
									status,
									seed: searchSeed,
									writeEnabled,
									onForget: forget
								}),
								page === "entities" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntitiesPage, {
									client,
									revision,
									writeEnabled,
									onForget: forget,
									onExplore: explore
								}),
								page === "remember" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RememberPage, {
									client,
									sessionId,
									memoryBodies: status?.memoryBodies ?? [],
									writeEnabled,
									seed: rememberSeed,
									onMutate: mutate
								}),
								page === "list" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListPage, {
									client,
									revision,
									writeEnabled,
									onForget: forget,
									onClone: clone,
									onExplore: explore
								}),
								page === "status" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusPage, {
									status,
									loading: statusLoading,
									onRefresh: () => void loadStatus()
								})
							]
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/settings.ts
		const MNEMON_SETTINGS_CHANNEL = "/dsh-mnemon-settings";
		//#endregion
		//#region src/client/settings.ts
		var MnemonSettingsScope = class {
			connection;
			snapshot = {
				status: "loading",
				writable: false,
				mode: "host"
			};
			listeners = /* @__PURE__ */ new Set();
			tail = Promise.resolve();
			constructor(connection) {
				this.connection = connection;
				this.load();
			}
			getSnapshot = () => this.snapshot;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => this.listeners.delete(listener);
			};
			set(field, value) {
				return this.write({
					op: "set",
					path: [field],
					value
				});
			}
			unset(field) {
				return this.write({
					op: "unset",
					path: [field]
				});
			}
			async load() {
				const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, "get", {});
				if (!response.ok) {
					this.publish({
						status: "unavailable",
						writable: false,
						mode: "host"
					});
					return;
				}
				this.publish(response.value);
			}
			write(op) {
				const task = this.tail.then(async () => {
					const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, "mutate", {
						ops: [op],
						...this.snapshot.revision === void 0 ? {} : { expectedRevision: this.snapshot.revision }
					});
					if (!response.ok) throw new Error(response.error.message);
					this.publish(response.value);
				});
				this.tail = task.catch(() => {});
				return task;
			}
			publish(snapshot) {
				this.snapshot = snapshot;
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"connection",
			"locale"
		];
		/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
		function apply(rawContext) {
			const ctx = rawContext;
			const settings = new MnemonSettingsScope(ctx.connection);
			const namespace = "mnemon";
			ctx.effect(() => ctx.locale.register(namespace, {
				zh,
				en
			}), "dsh-mnemon: locale dictionaries");
			const translate = ctx.locale.bind(namespace);
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "mnemon",
				order: 30,
				label: () => translate("tab.label"),
				locale: namespace,
				inject: () => ({
					connection: ctx.connection,
					settingsScope: settings,
					t: translate
				})
			}, MnemonView));
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "mnemon",
				order: 30,
				locale: namespace,
				inject: () => ({
					scope: settings,
					t: translate
				})
			}, MnemonSettingsCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map