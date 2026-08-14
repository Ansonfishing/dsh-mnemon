window.__ModuleLoader__.load({
	id: "dsh-mnemon",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/settings.ts
		const MNEMON_SETTINGS_CHANNEL = "/dsh-mnemon-settings";
		const MNEMON_SETTINGS_NAMESPACE = "mnemon";
		const MNEMON_UI_SETTINGS_NAMESPACE = "mnemon-ui";
		//#endregion
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/omdsh-dev/dsh-mnemon/src/client/MnemonSettingsCard.module.css.mjs
		const css$4 = ".pDTviq_page{box-sizing:border-box;width:100%;min-width:0;max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:28px;padding-bottom:28px;font-family:inherit;display:flex}.pDTviq_page *,.pDTviq_page :before,.pDTviq_page :after{box-sizing:border-box}.pDTviq_page button,.pDTviq_page input{color:inherit;font:inherit}.pDTviq_loading{min-height:140px;color:var(--dsw-alias-label-tertiary);text-align:center;margin:0;font-size:13px;line-height:140px}.pDTviq_pageHeader h1{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}.pDTviq_pageHeader p{max-width:64ch;color:var(--dsw-alias-label-tertiary);margin:8px 0 0;font-size:14px;line-height:22px}.pDTviq_section{flex-direction:column;gap:12px;min-width:0;display:flex}.pDTviq_sectionHeading{justify-content:space-between;align-items:flex-start;gap:18px;min-width:0;display:flex}.pDTviq_sectionHeading>div{flex:1;min-width:0}.pDTviq_sectionHeading h2{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}.pDTviq_sectionHeading p{max-width:66ch;color:var(--dsw-alias-label-tertiary);margin:1px 0 0;font-size:12px;line-height:18px}.pDTviq_choiceGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;display:grid}.pDTviq_choiceCard{cursor:pointer;min-width:0;display:block}.pDTviq_choiceCard>input,.pDTviq_toggleRow>input,.pDTviq_visuallyHidden{clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.pDTviq_choiceFace{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;justify-content:center;gap:1px;min-width:0;min-height:66px;padding:10px 34px 10px 13px;transition:border-color .14s,background-color .14s;display:flex;position:relative}.pDTviq_choiceFace:hover{background:var(--dsw-alias-interactive-bg-hover)}.pDTviq_choiceFace strong{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:21px;overflow:hidden}.pDTviq_choiceFace small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:17px;overflow:hidden}.pDTviq_check{font-size:14px;line-height:18px;display:none;position:absolute;top:11px;right:12px}.pDTviq_choiceCard>input:checked+.pDTviq_choiceFace{border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-interactive-bg-hover)}.pDTviq_choiceCard>input:checked+.pDTviq_choiceFace .pDTviq_check{display:block}.pDTviq_choiceCard>input:disabled+.pDTviq_choiceFace{cursor:default;opacity:.42}.pDTviq_choiceCard:has(input:disabled){cursor:default}.pDTviq_settingRow,.pDTviq_toggleRow{border-top:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:18px;min-width:0;min-height:62px;padding:11px 0;display:flex}.pDTviq_settingCopy{flex-direction:column;flex:1;min-width:0;display:flex}.pDTviq_settingCopy strong{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:21px}.pDTviq_settingCopy small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.pDTviq_settingCopy code{font-family:var(--ds-font-family-code,ui-monospace, monospace)}.pDTviq_directoryControl{align-items:center;gap:8px;min-width:0;max-width:60%;display:flex}.pDTviq_directoryControl code{min-width:0;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,ui-monospace, monospace);text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.pDTviq_rowGroup{border-bottom:1px solid var(--dsw-alias-border-l2)}.pDTviq_toggleRow{cursor:pointer}.pDTviq_toggleRow:first-child{border-top:1px solid var(--dsw-alias-border-l2)}.pDTviq_toggleRow:has(input:disabled){cursor:default;opacity:.46}.pDTviq_switch{background:var(--dsw-alias-bg-layer-2);width:40px;height:24px;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2);border-radius:999px;flex:none;transition:background-color .14s;display:block;position:relative}.pDTviq_switch i{background:var(--dsw-alias-bg-layer-3);width:18px;height:18px;box-shadow:0 1px 3px color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);border-radius:50%;transition:transform .14s;position:absolute;top:3px;left:3px}.pDTviq_toggleRow>input:checked+.pDTviq_switch{background:var(--dsw-alias-label-primary);box-shadow:none}.pDTviq_toggleRow>input:checked+.pDTviq_switch i{transform:translate(16px)}.pDTviq_pillButton,.pDTviq_primaryPill,.pDTviq_actions button{appearance:none;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);height:36px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;background:0 0;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}.pDTviq_pillButton:hover:not(:disabled),.pDTviq_actions button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}.pDTviq_pillButton:disabled,.pDTviq_primaryPill:disabled,.pDTviq_actions button:disabled,.pDTviq_textButton:disabled{cursor:default;opacity:.4}.pDTviq_primaryPill,.pDTviq_save{color:var(--dsw-alias-label-primary-foreground)!important;background:var(--dsw-alias-button-primary-fill)!important;border-color:#0000!important}.pDTviq_primaryPill:hover:not(:disabled),.pDTviq_save:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)!important}.pDTviq_textButton{appearance:none;box-sizing:border-box;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;background:0 0;border:0;border-radius:14px;flex:none;justify-content:center;align-items:center;padding:0 10px;font-size:12px;line-height:18px;display:inline-flex}.pDTviq_textButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.pDTviq_activePath{width:fit-content;max-width:100%;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;margin-top:4px;font-size:11px;line-height:17px;overflow:hidden}.pDTviq_scopeMeta{color:var(--dsw-alias-label-tertiary);margin-top:1px;font-size:10px;font-style:normal;line-height:15px}.pDTviq_rowActions{flex:none;align-items:center;gap:8px;display:flex}.pDTviq_importBar{background:var(--dsw-alias-bg-layer-2);border-radius:12px;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:10px;min-width:0;padding:10px 12px;display:grid}.pDTviq_importBar>div{min-width:0;display:grid}.pDTviq_importBar strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;line-height:18px;overflow:hidden}.pDTviq_importBar small{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:15px}.pDTviq_importBar .pDTviq_textButton{padding:0 10px}.pDTviq_feedback,.pDTviq_packFeedback{gap:4px;display:grid}.pDTviq_feedback:empty,.pDTviq_packFeedback:empty{display:none}.pDTviq_feedback p,.pDTviq_packFeedback p{overflow-wrap:anywhere;margin:0;font-size:12px;line-height:18px}.pDTviq_error{color:var(--dsw-alias-state-error-primary)}.pDTviq_success{color:var(--dsw-alias-state-success-primary)}.pDTviq_readOnly{color:var(--dsw-alias-label-tertiary)}.pDTviq_packSuccess{color:var(--dsw-alias-state-success-primary)}.pDTviq_actions{display:none}.pDTviq_actionsVisible{border-top:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:16px;padding-top:14px;display:flex}.pDTviq_actions>span{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.pDTviq_actions>div{gap:8px;display:flex}.pDTviq_discard{color:var(--dsw-alias-label-primary);background:0 0;border-color:var(--dsw-alias-border-l2)!important}.pDTviq_settingsNote{color:var(--dsw-alias-label-tertiary);margin:-14px 0 0;font-size:10px;line-height:16px}.pDTviq_settingsNote code{color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,ui-monospace, monospace)}.pDTviq_choiceCard>input:focus-visible+.pDTviq_choiceFace,.pDTviq_toggleRow>input:focus-visible+.pDTviq_switch,.pDTviq_pillButton:focus-visible,.pDTviq_primaryPill:focus-visible,.pDTviq_textButton:focus-visible,.pDTviq_actions button:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}@media (width<=620px){.pDTviq_page{gap:24px}.pDTviq_choiceGrid{grid-template-columns:minmax(0,1fr)}.pDTviq_settingRow{flex-direction:column;align-items:stretch;gap:9px}.pDTviq_directoryControl{justify-content:space-between;max-width:none}.pDTviq_rowActions{width:100%}.pDTviq_rowActions button{flex:1}.pDTviq_importBar{grid-template-columns:minmax(0,1fr) auto}.pDTviq_importBar .pDTviq_primaryPill{grid-column:1/-1}.pDTviq_actionsVisible{flex-direction:column;align-items:stretch}.pDTviq_actions>div,.pDTviq_actions button{flex:1}}@media (prefers-reduced-motion:reduce){.pDTviq_choiceFace,.pDTviq_switch,.pDTviq_switch i{transition:none}}";
		const tagId$4 = "dsh-mnemon/MnemonSettingsCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var MnemonSettingsCard_module_css_default = {
			"pageHeader": "pDTviq_pageHeader",
			"sectionHeading": "pDTviq_sectionHeading",
			"settingCopy": "pDTviq_settingCopy",
			"choiceFace": "pDTviq_choiceFace",
			"directoryControl": "pDTviq_directoryControl",
			"importBar": "pDTviq_importBar",
			"choiceGrid": "pDTviq_choiceGrid",
			"feedback": "pDTviq_feedback",
			"visuallyHidden": "pDTviq_visuallyHidden",
			"toggleRow": "pDTviq_toggleRow",
			"rowGroup": "pDTviq_rowGroup",
			"section": "pDTviq_section",
			"pillButton": "pDTviq_pillButton",
			"scopeMeta": "pDTviq_scopeMeta",
			"primaryPill": "pDTviq_primaryPill",
			"loading": "pDTviq_loading",
			"actionsVisible": "pDTviq_actionsVisible",
			"packSuccess": "pDTviq_packSuccess",
			"rowActions": "pDTviq_rowActions",
			"error": "pDTviq_error",
			"settingRow": "pDTviq_settingRow",
			"actions": "pDTviq_actions",
			"settingsNote": "pDTviq_settingsNote",
			"save": "pDTviq_save",
			"page": "pDTviq_page",
			"success": "pDTviq_success",
			"packFeedback": "pDTviq_packFeedback",
			"activePath": "pDTviq_activePath",
			"textButton": "pDTviq_textButton",
			"check": "pDTviq_check",
			"readOnly": "pDTviq_readOnly",
			"discard": "pDTviq_discard",
			"choiceCard": "pDTviq_choiceCard",
			"switch": "pDTviq_switch"
		};
		//#endregion
		//#region src/client/locales.ts
		/** Mnemon workspace copy, synchronized with DSH's global locale service. */
		const zh = {
			"tab.label": "记忆系统",
			"term.space": "记忆体",
			"term.spaces": "记忆体",
			"category.decision": "决策",
			"category.preference": "偏好",
			"category.fact": "事实",
			"category.insight": "洞察",
			"category.context": "上下文",
			"category.general": "通用",
			"nav.aria": "Mnemon 页面",
			"nav.group.system": "系统",
			"nav.group.storage": "三层记忆",
			"nav.group.tools": "读写工具",
			"nav.bodies": "记忆体",
			"nav.bodies.detail": "记忆体目录与实时图谱",
			"nav.runtime": "运行时",
			"nav.runtime.detail": "热记忆与上下文",
			"nav.documents": "档案",
			"nav.documents.detail": "项目知识与归档",
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
			"overview.title": "记忆体",
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
			"overview.editBody": "编辑",
			"overview.editBodyAria": "编辑{name}",
			"overview.editName": "名称",
			"overview.editDescription": "路由说明",
			"overview.saveBody": "保存",
			"overview.savingBody": "保存中…",
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
			"overview.previewAria": "查看全文",
			"overview.previewTitle": "内容全文",
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
			"documents.description": "在当前工作区维护结构化的项目文档。活跃档案参与近场检索；达到 10 MB 上限前，最久未使用的档案会先在 Mnemon 中建立索引，再迁入归档。",
			"documents.capacity": "{used} / {limit}",
			"documents.refresh": "刷新",
			"documents.summary": "档案存储摘要",
			"documents.active": "活跃档案",
			"documents.activeHint": "近场检索范围",
			"documents.archivedCount": "归档",
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
			"documents.archiveList": "归档目录",
			"documents.noDescription": "暂无检索说明。",
			"documents.missing": "文件缺失",
			"documents.emptyActive": "还没有活跃档案",
			"documents.emptyActiveText": "复杂对话达到活动评分门槛后会自动审阅并整理档案，也可以在上方手动创建。",
			"documents.emptyArchived": "还没有归档",
			"documents.emptyArchivedText": "只有完成 Mnemon 索引的档案才会迁移到这里。",
			"documents.reader": "档案阅读器",
			"documents.selectTitle": "选择一份档案",
			"documents.selectText": "在左侧查看活跃项目知识或沿 Mnemon 引用打开归档原文。",
			"documents.coldArchive": "归档原文",
			"documents.edit": "编辑",
			"documents.path": "托管路径",
			"documents.revision": "修订",
			"documents.hash": "内容哈希",
			"documents.size": "文件大小",
			"documents.archiveReceipt": "Mnemon 冷索引回执",
			"documents.archiveTitle": "迁入归档",
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
			"toolview.recallTitle": "记忆召回",
			"toolview.writeTitle": "记忆沉淀",
			"toolview.genericSummary": "Mnemon 工具调用",
			"toolview.running": "处理中…",
			"toolview.recallSummary": "{query} · {count} 条命中",
			"toolview.relatedSummary": "{id} · 关联 {count} 条",
			"toolview.documentSearchSummary": "{query} · {count} 份档案命中",
			"toolview.statusHealthy": "Mnemon 引擎正常",
			"toolview.statusUnhealthy": "Mnemon 引擎异常",
			"toolview.bodiesSummary": "{count} 个记忆体 · {active} 个激活",
			"toolview.runtimeSummary": "{action} {target} 热记忆",
			"toolview.runtimeSummaryWithContent": "{action} {target} 热记忆 · {content}",
			"toolview.documentManageSummary": "{action} 项目档案",
			"toolview.documentManageSummaryWithTitle": "{action} 项目档案 · {title}",
			"toolview.bodyUpdateSummary": "更新记忆体 {id}",
			"toolview.bodyMergeSummary": "合并到 {target} · {count} 个来源",
			"toolview.openView": "在记忆视图中打开",
			"toolview.inspect": "查看轨迹",
			"toolview.args": "参数",
			"toolview.result": "结果",
			"toolview.noResult": "尚无结果",
			"turnTail.label": "本回合记忆",
			"turnTail.recall": "召回 {count}",
			"turnTail.write": "沉淀 {count}",
			"turnTail.documents": "档案检索 {count}",
			"turnTail.inspect": "检查 {count}",
			"turnTail.failed": "失败 {count}",
			"turnTail.toolList": "本回合记忆工具",
			"turnTail.openView": "打开记忆视图",
			"saveAction.button": "存入记忆",
			"saveAction.title": "将这条回复交给记忆子 Agent",
			"saveAction.hint": "子 Agent 会判断是否值得沉淀，并查重、提炼、选择记忆体后写入；不会挤占主对话上下文。",
			"saveAction.fetching": "提取消息文本…",
			"saveAction.missing": "无法从会话记录提取这条消息的文本。",
			"saveAction.candidate": "候选内容（可编辑）",
			"saveAction.truncated": "原回复较长，这里仅载入前 {limit} 个字符。",
			"saveAction.submit": "交给记忆子 Agent 判断",
			"saveAction.submitting": "调度中…",
			"saveAction.result": "记忆子 Agent：{summary}",
			"saveAction.failed": "调度失败：{error}",
			"saveAction.readOnly": "当前部署为只读模式，无法写入记忆。",
			"saveAction.close": "收起",
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
			"remember.readOnlyText": "当前部署禁止记忆写入；如需调整，请修改 DSH 的 Mnemon 配置并保存。",
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
			"content.showing": "当前显示 {visible} / {total}",
			"content.showMore": "再显示 {count} 条",
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
			"status.engineChecking": "正在检查本地引擎",
			"status.versionWaiting": "等待版本信息",
			"status.spaces": "记忆体",
			"status.activeRatio": "{active} / {total} 已激活",
			"status.runtime": "运行时",
			"status.runtimeRatio": "{user} 用户 · {memory} 项目",
			"status.runtimeBytes": "{bytes} 已使用",
			"status.runtimeWaiting": "等待同步",
			"status.runtimeWaitingDetail": "宿主存储清单待返回",
			"status.directoryUnsynced": "目录尚未同步",
			"status.activeMemories": "{count} 条激活记忆",
			"status.documents": "项目档案",
			"status.documentsWaiting": "等待工作区",
			"status.documentsSession": "绑定活动会话后可用",
			"status.documentRatio": "{active} 份活跃 · {archived} 份归档",
			"status.documentUsage": "{used} / {limit} 活跃容量",
			"status.router": "子 Agent 路由",
			"status.routerReady": "记忆子 Agent 可用",
			"status.sessionMissing": "当前会话未绑定",
			"status.routerChecking": "正在同步会话能力",
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
			"status.coldDocuments": "归档",
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
			"status.storageDocumentsDetail": "{active} 份活跃 · {archived} 份归档",
			"status.storageStateReady": "审阅水位已经持久化",
			"status.storageStateVolatile": "当前审阅状态仍由 Host 进程维护",
			"status.storageFootnote": "当前实际读写根：{root}。存储范围只在 DSH「设置 → 记忆系统」中修改，保存后实时生效；插件不会自动迁移、合并或删除旧内容。",
			"status.flowTitle": "记忆系统流转",
			"status.flowDescription": "按真实执行边界展开每轮注入、确定性文件控制、语义 worker、CLI 数据面、归档与 fork 审查。",
			"status.flowLive": "实时状态",
			"status.flowDegraded": "部分不可用",
			"status.flowConversation": "用户 / 当前任务",
			"status.flowTurns": "当前轮输入与工具轨迹",
			"status.flowSupervisor": "Root Agent",
			"status.flowEntries": "{count} 条热记忆",
			"status.flowDocuments": "{active} 份活跃 · {archived} 份归档",
			"status.flowContext": "证据 / 回执",
			"status.flowContextDetail": "结构化结果返回当前任务",
			"status.flowReadWrite": "确定性 Host 路径",
			"status.flowArchive": "LLM 监督路径",
			"status.flowCurrentScope": "当前范围：{scope}",
			"status.flowLaneContext": "每轮上下文",
			"status.flowLaneContextDetail": "Runtime 每轮注入；Documents 仅按需检索",
			"status.flowLaneSemantic": "按需语义操作",
			"status.flowLaneSemanticDetail": "隔离 worker 决策，Host 服务执行",
			"status.flowLaneMaintenance": "空闲维护与归档",
			"status.flowLaneMaintenanceDetail": "fork 审查与先索引后迁移",
			"status.flowRuntimeMeta": "USER.md + MEMORY.md · {count} 条",
			"status.flowPromptAssembly": "每轮 prompt assembly",
			"status.flowDocumentSearch": "Document 确定性检索",
			"status.flowOnDemand": "按需，不注入全文",
			"status.flowRootMeta": "路由工具调用，不直接访问 SQLite",
			"status.flowStructuredReturn": "结构化证据 / 回执",
			"status.flowEvidenceMeta": "带来源返回 Root Agent",
			"status.flowSemanticRequest": "recall · write · related",
			"status.flowSpawnWorker": "spawn 隔离 worker",
			"status.flowSpawnMeta": "语义判断 · 最小工具白名单",
			"status.flowService": "MnemonService",
			"status.flowServiceMeta": "校验 · 归一化 · 聚合",
			"status.flowRunnerCli": "Runner → 本地 CLI",
			"status.flowRunnerCliMeta": "超时 / 取消 / JSON 进程边界",
			"status.flowHostBridge": "Mnemon Host Bridge",
			"status.flowHostBridgeMeta": "Service → Runner → 本地 CLI",
			"status.flowSpacesMeta": "{active}/{total} 已激活 · {insights} 条记忆",
			"status.flowDeterministicWrites": "普通 Runtime 与 Document 变更",
			"status.flowDeterministicWritesMeta": "add / replace / remove · create / update",
			"status.flowControlPlane": "Host 确定性控制层",
			"status.flowControlPlaneMeta": "锁 · 原子写 · revision · 容量",
			"status.flowReviewGate": "活动评分与空闲门控",
			"status.flowReviewGateMeta": "{score}/{threshold} · idle {seconds}s",
			"status.flowForkReview": "fork 完成检查点",
			"status.flowForkReviewMeta": "{state} · 只维护 Runtime / Document",
			"status.flowReviewTargets": "Runtime / active Document",
			"status.flowReviewTargetsMeta": "保守维护 · 新轮次会取消审查",
			"status.flowColdArchive": "spawn 归档 worker",
			"status.flowColdArchiveMeta": "容量维护 / 人工归档",
			"status.flowIndexFirst": "1 · 先写 / 验证 Mnemon 冷索引",
			"status.flowRevisionMove": "2 · revision fence 后迁移原文",
			"status.flowRevisionMoveMeta": "{archived} 份已归档 · 失败或冲突保留 active",
			"status.flowArchivedDocuments": "已归档 Documents",
			"status.flowRecent": "最近活动",
			"status.flowRunning": "正在运行",
			"status.flowPending": "等待空闲",
			"status.flowStatic": "执行边界",
			"status.flowLegendReady": "可用 / 已就绪",
			"status.flowLegendRecent": "当前或最近链路",
			"status.flowLegendBoundary": "虚线表示 LLM 判断边界",
			"config.aria": "Mnemon 记忆系统配置",
			"config.tab": "Mnemon",
			"config.title": "记忆系统设置",
			"config.description": "统一配置运行时记忆、项目档案、记忆体和对话界面；点击保存后立即生效。",
			"config.unsaved": "有未保存修改",
			"config.ready": "已保存并实时生效",
			"config.noticeBefore": "配置写入",
			"config.noticeAfter": "；所有设置点击保存后实时生效。切换范围不会自动迁移旧内容。",
			"config.storageTitle": "存储位置",
			"config.storageDescription": "决定 Mnemon 的运行时记忆、项目档案与记忆体保存在哪里；保存后原子切换。",
			"config.scope": "存储范围",
			"config.scopeHint": "全局供所有工作区共享；工作区使用 DSH 启动目录；自定义使用指定目录。",
			"config.scopeAria": "Mnemon 存储范围",
			"config.global": "全局",
			"config.workspace": "工作区",
			"config.custom": "自定义",
			"config.customHintShort": "选择一个目录",
			"config.customSelected": "已选择目录",
			"config.customPack": "自定义 Pack",
			"config.customPackAria": "选择自定义 Mnemon Pack",
			"config.customPackRequired": "请选择或添加一个自定义 Pack。",
			"config.customDefaultName": "自定义 Pack",
			"config.noCustomPacks": "尚未配置 Pack",
			"config.addPack": "添加 Pack",
			"config.cancelAddPack": "取消添加",
			"config.removePack": "移除",
			"config.customPackNameAria": "新 Pack 名称",
			"config.customPackNamePlaceholder": "例如：项目记忆",
			"config.newPackDirectoryAria": "新 Pack 数据目录",
			"config.confirmAddPack": "加入列表",
			"config.customDirectory": "自定义目录",
			"config.customHint": "整个 Mnemon 数据域都位于此处。",
			"config.customAria": "Mnemon 自定义数据目录",
			"config.customBrowseHint": "使用 DSH 原生目录选择器，只保存这一个目录。",
			"config.customNotSelected": "尚未选择",
			"config.customBrowse": "浏览…",
			"config.customBrowseAgain": "重新选择",
			"config.customBrowsing": "选择中…",
			"config.customBrowseUnavailable": "当前 DSH 主机未提供原生目录选择器。",
			"config.invalidScope": "存储范围无效。",
			"config.customRequired": "选择自定义存储时必须填写数据目录。",
			"config.customAbsolute": "自定义目录必须是绝对路径或以 ~/ 开头。",
			"config.saveFailed": "保存失败：{error}",
			"config.readOnly": "当前部署的插件设置为只读。",
			"config.discard": "放弃修改",
			"config.saving": "保存中…",
			"config.save": "保存",
			"config.overridden": "已覆盖",
			"config.interactionTitle": "对话界面",
			"config.interactionLive": "实时生效",
			"config.interactionHint": "保存后实时生效；关闭某项后恢复 DSH 原生呈现。",
			"config.interactionToolviews": "记忆工具卡",
			"config.interactionToolviewsHint": "展示 mnemon_* 工具的状态与摘要",
			"config.interactionTurnBar": "回合记忆条",
			"config.interactionTurnBarHint": "在回合尾部展示召回、沉淀与检索活动",
			"config.interactionSaveAction": "存入记忆按钮",
			"config.interactionSaveActionHint": "在已定稿回复旁提供受监督的记忆沉淀入口",
			"config.interactionOn": "开启",
			"config.packTitle": "备份与迁移",
			"config.packDescription": "整体导出与导入当前生效目录；导入始终落到下方显示的位置。",
			"config.packActiveTarget": "当前生效目录",
			"config.packTargetLoading": "正在读取运行目标…",
			"config.packUnavailable": "当前 DSH 主机不支持 Mnemon ZIP 备份通道。",
			"config.packFull": "整体 Pack",
			"config.packFullHint": "Runtime、Documents 与记忆体",
			"config.packRuntime": "Runtime",
			"config.packRuntimeHint": "热记忆与 USER / MEMORY 投影",
			"config.packDocuments": "Documents",
			"config.packDocumentsHint": "项目文档、归档与索引",
			"config.packMemorySpaces": "记忆体",
			"config.packMemorySpacesHint": "目录清单与 mnemon.db",
			"config.packExport": "导出",
			"config.packImport": "导入",
			"config.packExporting": "导出中…",
			"config.packInspecting": "检查中…",
			"config.packImporting": "导入中…",
			"config.packChooseFile": "选择{component}文件",
			"config.packFormatHint": "统一使用 .mnemonpack（ZIP + manifest + SHA-256）；记忆体仍以独立 mnemon.db 保存在包内。",
			"config.packPreviewEyebrow": "导入预览",
			"config.packUnnamed": "未命名 Mnemon Pack",
			"config.packSource": "来源",
			"config.packDestination": "导入到",
			"config.packArchiveSize": "压缩 / 展开",
			"config.packComponents": "选择要导入的组件",
			"config.packComponentSummary": "{items} 项 · {files} 个文件 · {size}",
			"config.packHasData": "目标已有数据",
			"config.packMerge": "安全合并（推荐）",
			"config.packMergeHint": "保留现有内容；冲突项自动去重或生成新 ID。",
			"config.packMergeAction": "合并导入",
			"config.packReplace": "覆盖当前组件？",
			"config.packReplaceHint": "所选组件会被 Pack 内容原子替换；其他组件不受影响。",
			"config.packReplaceAction": "覆盖导入…",
			"config.packConfirmReplace": "确认覆盖",
			"config.packComponentMissing": "这个 Pack 不包含所选组件。",
			"config.packExported": "已导出 {file}（{size}）。",
			"config.packImported": "已将 {components} 导入 {root}。",
			"config.packFailed": "ZIP 操作失败：{error}",
			"config.packSimpleDescription": "将当前生效目录整体导出为一个 ZIP，或从 ZIP 安全合并恢复。",
			"config.packWholeZip": "当前目录 ZIP",
			"config.packWholeZipHint": "包含 Runtime、Documents 和全部记忆体。",
			"config.packImportZip": "导入 ZIP",
			"config.packExportZip": "导出 ZIP",
			"config.packChooseZip": "选择 Mnemon 备份 ZIP",
			"config.packUnnamedZip": "Mnemon 备份.zip",
			"config.packZipReady": "校验通过 · {components} 个组件 · {items} 项 · {size}",
			"config.packImportZipAction": "安全导入",
			"config.packImportedWhole": "已将 ZIP 安全合并到 {root}。"
		};
		const en = {
			"tab.label": "Memory System",
			"term.space": "Memory Space",
			"term.spaces": "Memory Spaces",
			"category.decision": "Decision",
			"category.preference": "Preference",
			"category.fact": "Fact",
			"category.insight": "Insight",
			"category.context": "Context",
			"category.general": "General",
			"nav.aria": "Mnemon pages",
			"nav.group.system": "System",
			"nav.group.storage": "Memory tiers",
			"nav.group.tools": "Read and write",
			"nav.bodies": "Memory Spaces",
			"nav.bodies.detail": "Directory and live graph",
			"nav.runtime": "Runtime",
			"nav.runtime.detail": "Hot memory and context",
			"nav.documents": "Documents",
			"nav.documents.detail": "Project knowledge and archive",
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
			"overview.title": "Memory Spaces",
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
			"overview.editBody": "Edit",
			"overview.editBodyAria": "Edit {name}",
			"overview.editName": "Name",
			"overview.editDescription": "Routing description",
			"overview.saveBody": "Save",
			"overview.savingBody": "Saving…",
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
			"overview.previewAria": "View full content",
			"overview.previewTitle": "Full content",
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
			"documents.description": "Maintain structured project documents in the current workspace. Active documents support near-field search; before the 10 MB limit is exceeded, the least-recently-used document is indexed in Mnemon and moved to the archive.",
			"documents.capacity": "{used} / {limit}",
			"documents.refresh": "Refresh",
			"documents.summary": "Document storage summary",
			"documents.active": "Active",
			"documents.activeHint": "Near-field search scope",
			"documents.archivedCount": "Archive",
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
			"documents.archiveList": "Archive directory",
			"documents.noDescription": "No retrieval description.",
			"documents.missing": "File missing",
			"documents.emptyActive": "No active documents yet",
			"documents.emptyActiveText": "Complex work is reviewed after it reaches the activity-score gate, or you can create a Document above.",
			"documents.emptyArchived": "No archives yet",
			"documents.emptyArchivedText": "Only documents with a completed Mnemon index are moved here.",
			"documents.reader": "Document reader",
			"documents.selectTitle": "Select a document",
			"documents.selectText": "Read active project knowledge or follow a Mnemon reference to an archived original.",
			"documents.coldArchive": "Archived original",
			"documents.edit": "Edit",
			"documents.path": "Managed path",
			"documents.revision": "Revision",
			"documents.hash": "Content hash",
			"documents.size": "File size",
			"documents.archiveReceipt": "Mnemon cold-index receipt",
			"documents.archiveTitle": "Move to archive",
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
			"toolview.recallTitle": "Memory recall",
			"toolview.writeTitle": "Memory write",
			"toolview.genericSummary": "Mnemon tool call",
			"toolview.running": "Working…",
			"toolview.recallSummary": "{query} · {count} hits",
			"toolview.relatedSummary": "{id} · {count} related",
			"toolview.documentSearchSummary": "{query} · {count} documents",
			"toolview.statusHealthy": "Mnemon engine healthy",
			"toolview.statusUnhealthy": "Mnemon engine unhealthy",
			"toolview.bodiesSummary": "{count} spaces · {active} active",
			"toolview.runtimeSummary": "{action} {target} hot memory",
			"toolview.runtimeSummaryWithContent": "{action} {target} hot memory · {content}",
			"toolview.documentManageSummary": "{action} project document",
			"toolview.documentManageSummaryWithTitle": "{action} project document · {title}",
			"toolview.bodyUpdateSummary": "Update Memory Space {id}",
			"toolview.bodyMergeSummary": "Merge into {target} · {count} sources",
			"toolview.openView": "Open in Memory view",
			"toolview.inspect": "Inspect",
			"toolview.args": "Arguments",
			"toolview.result": "Result",
			"toolview.noResult": "No result yet",
			"turnTail.label": "Turn memory",
			"turnTail.recall": "recalled {count}",
			"turnTail.write": "wrote {count}",
			"turnTail.documents": "document search {count}",
			"turnTail.inspect": "inspected {count}",
			"turnTail.failed": "failed {count}",
			"turnTail.toolList": "Memory tools this turn",
			"turnTail.openView": "Open Memory view",
			"saveAction.button": "Save to memory",
			"saveAction.title": "Send this reply to the memory subagent",
			"saveAction.hint": "The subagent decides whether it qualifies, then dedupes, distills, chooses a Memory Space, and writes without filling the main conversation context.",
			"saveAction.fetching": "Extracting message text…",
			"saveAction.missing": "Could not extract this message text from the session log.",
			"saveAction.candidate": "Candidate (editable)",
			"saveAction.truncated": "This reply is long; only the first {limit} characters are loaded here.",
			"saveAction.submit": "Send to memory subagent",
			"saveAction.submitting": "Dispatching…",
			"saveAction.result": "Memory subagent: {summary}",
			"saveAction.failed": "Dispatch failed: {error}",
			"saveAction.readOnly": "This deployment is read only; memory writes are disabled.",
			"saveAction.close": "Collapse",
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
			"remember.readOnlyText": "This deployment disables memory writes. Change and save the DSH Mnemon configuration to enable them.",
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
			"content.showing": "Showing {visible} / {total}",
			"content.showMore": "Show {count} more",
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
			"status.engineChecking": "Checking the local engine",
			"status.versionWaiting": "Waiting for version",
			"status.spaces": "Memory Spaces",
			"status.activeRatio": "{active} / {total} active",
			"status.runtime": "Runtime",
			"status.runtimeRatio": "{user} user · {memory} project",
			"status.runtimeBytes": "{bytes} used",
			"status.runtimeWaiting": "Waiting",
			"status.runtimeWaitingDetail": "Awaiting the Host storage inventory",
			"status.directoryUnsynced": "Directory not synchronized",
			"status.activeMemories": "{count} active memories",
			"status.documents": "Project Documents",
			"status.documentsWaiting": "Waiting for workspace",
			"status.documentsSession": "Available after binding a live session",
			"status.documentRatio": "{active} active · {archived} archived",
			"status.documentUsage": "{used} / {limit} active capacity",
			"status.router": "Subagent router",
			"status.routerReady": "Memory subagent available",
			"status.sessionMissing": "No live session bound",
			"status.routerChecking": "Synchronizing session capabilities",
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
			"status.coldDocuments": "Archives",
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
			"status.storageDocumentsDetail": "{active} active · {archived} archived",
			"status.storageStateReady": "Review watermarks are persisted",
			"status.storageStateVolatile": "Review state is currently owned by the Host process",
			"status.storageFootnote": "Current read/write root: {root}. Change the scope only in DSH Settings → Memory System; it applies live after Save and never auto-migrates, merges, or deletes old content.",
			"status.flowTitle": "Memory System Flow",
			"status.flowDescription": "Maps the real execution boundaries across per-turn injection, deterministic file control, semantic workers, the CLI data plane, archive, and fork review.",
			"status.flowLive": "Live state",
			"status.flowDegraded": "Partially unavailable",
			"status.flowConversation": "User / Current Task",
			"status.flowTurns": "Current-turn input and tool trace",
			"status.flowSupervisor": "Root Agent",
			"status.flowEntries": "{count} hot-memory entries",
			"status.flowDocuments": "{active} active · {archived} archived",
			"status.flowContext": "Evidence / Receipts",
			"status.flowContextDetail": "Structured results return to the task",
			"status.flowReadWrite": "Deterministic Host path",
			"status.flowArchive": "LLM-supervised path",
			"status.flowCurrentScope": "Current scope: {scope}",
			"status.flowLaneContext": "Per-turn Context",
			"status.flowLaneContextDetail": "Runtime is injected every turn; Documents are searched on demand",
			"status.flowLaneSemantic": "On-demand Semantic Operations",
			"status.flowLaneSemanticDetail": "An isolated worker decides; Host services execute",
			"status.flowLaneMaintenance": "Idle Maintenance and Archive",
			"status.flowLaneMaintenanceDetail": "Fork review plus index-before-move archival",
			"status.flowRuntimeMeta": "USER.md + MEMORY.md · {count} entries",
			"status.flowPromptAssembly": "every-turn prompt assembly",
			"status.flowDocumentSearch": "Deterministic Document Search",
			"status.flowOnDemand": "on demand; no full-content injection",
			"status.flowRootMeta": "routes tools; never opens SQLite directly",
			"status.flowStructuredReturn": "structured evidence / receipt",
			"status.flowEvidenceMeta": "returns to the Root Agent with sources",
			"status.flowSemanticRequest": "recall · write · related",
			"status.flowSpawnWorker": "spawn Isolated Worker",
			"status.flowSpawnMeta": "semantic judgment · minimal tool allowlist",
			"status.flowService": "MnemonService",
			"status.flowServiceMeta": "validate · normalize · aggregate",
			"status.flowRunnerCli": "Runner → Local CLI",
			"status.flowRunnerCliMeta": "timeout / cancel / JSON process boundary",
			"status.flowHostBridge": "Mnemon Host Bridge",
			"status.flowHostBridgeMeta": "Service → Runner → local CLI",
			"status.flowSpacesMeta": "{active}/{total} active · {insights} memories",
			"status.flowDeterministicWrites": "Ordinary Runtime and Document Changes",
			"status.flowDeterministicWritesMeta": "add / replace / remove · create / update",
			"status.flowControlPlane": "Deterministic Host Control",
			"status.flowControlPlaneMeta": "locks · atomic writes · revision · capacity",
			"status.flowReviewGate": "Activity Score and Idle Gate",
			"status.flowReviewGateMeta": "{score}/{threshold} · idle {seconds}s",
			"status.flowForkReview": "fork Completed Checkpoint",
			"status.flowForkReviewMeta": "{state} · Runtime / Document maintenance only",
			"status.flowReviewTargets": "Runtime / active Document",
			"status.flowReviewTargetsMeta": "conservative upkeep · a new turn cancels review",
			"status.flowColdArchive": "spawn Archive Worker",
			"status.flowColdArchiveMeta": "capacity maintenance / manual archive",
			"status.flowIndexFirst": "1 · write / verify the Mnemon cold index",
			"status.flowRevisionMove": "2 · move the original after revision fence",
			"status.flowRevisionMoveMeta": "{archived} archived · failure or conflict keeps active content",
			"status.flowArchivedDocuments": "Archived Documents",
			"status.flowRecent": "Recent activity",
			"status.flowRunning": "Running",
			"status.flowPending": "Waiting for idle",
			"status.flowStatic": "Execution boundary",
			"status.flowLegendReady": "Available / ready",
			"status.flowLegendRecent": "Current or recent path",
			"status.flowLegendBoundary": "Dashed lines mark LLM judgment boundaries",
			"config.aria": "Mnemon memory system configuration",
			"config.tab": "Mnemon",
			"config.title": "Memory system settings",
			"config.description": "Configure runtime memory, project Documents, Memory Spaces, and conversation UI together. Changes apply immediately after Save.",
			"config.unsaved": "Unsaved changes",
			"config.ready": "Saved and applied live",
			"config.noticeBefore": "Configuration is written to",
			"config.noticeAfter": ". All settings apply live after Save. Switching scopes never migrates existing content automatically.",
			"config.storageTitle": "Storage location",
			"config.storageDescription": "Choose where Mnemon keeps runtime memory, project Documents, and Memory Spaces. Save atomically switches the active root.",
			"config.scope": "Storage scope",
			"config.scopeHint": "Global is shared across workspaces; Workspace uses the DSH launch directory; Custom uses the directory below.",
			"config.scopeAria": "Mnemon storage scope",
			"config.global": "Global",
			"config.workspace": "Workspace",
			"config.custom": "Custom",
			"config.customHintShort": "Choose one directory",
			"config.customSelected": "Directory selected",
			"config.customPack": "Custom Pack",
			"config.customPackAria": "Select a custom Mnemon Pack",
			"config.customPackRequired": "Select or add a custom Pack.",
			"config.customDefaultName": "Custom Pack",
			"config.noCustomPacks": "No Packs configured",
			"config.addPack": "Add Pack",
			"config.cancelAddPack": "Cancel adding",
			"config.removePack": "Remove",
			"config.customPackNameAria": "New Pack name",
			"config.customPackNamePlaceholder": "For example: Project memory",
			"config.newPackDirectoryAria": "New Pack data directory",
			"config.confirmAddPack": "Add to list",
			"config.customDirectory": "Custom directory",
			"config.customHint": "The complete Mnemon data domain lives here.",
			"config.customAria": "Mnemon custom data directory",
			"config.customBrowseHint": "Use DSH's native directory picker; only this one directory is stored.",
			"config.customNotSelected": "Not selected",
			"config.customBrowse": "Browse…",
			"config.customBrowseAgain": "Choose again",
			"config.customBrowsing": "Choosing…",
			"config.customBrowseUnavailable": "This DSH host does not provide the native directory picker.",
			"config.invalidScope": "The storage scope is invalid.",
			"config.customRequired": "A data directory is required for custom storage.",
			"config.customAbsolute": "The custom directory must be absolute or start with ~/.",
			"config.saveFailed": "Save failed: {error}",
			"config.readOnly": "Plugin settings are read-only in this deployment.",
			"config.discard": "Discard changes",
			"config.saving": "Saving…",
			"config.save": "Save",
			"config.overridden": "Overridden",
			"config.interactionTitle": "Conversation interface",
			"config.interactionLive": "Live",
			"config.interactionHint": "Changes apply live after saving. Disabling an item restores DSH's native presentation.",
			"config.interactionToolviews": "Memory tool cards",
			"config.interactionToolviewsHint": "Show status and summaries for mnemon_* tools",
			"config.interactionTurnBar": "Turn memory bar",
			"config.interactionTurnBarHint": "Show recall, write, and search activity below each turn",
			"config.interactionSaveAction": "Save to memory action",
			"config.interactionSaveActionHint": "Add supervised memory distillation beside finalized replies",
			"config.interactionOn": "Enabled",
			"config.packTitle": "Backup and migration",
			"config.packDescription": "Export or import the complete effective directory. Imports always target the location shown below.",
			"config.packActiveTarget": "Active directory",
			"config.packTargetLoading": "Loading the running target…",
			"config.packUnavailable": "This DSH host does not provide the Mnemon ZIP backup channel.",
			"config.packFull": "Complete Pack",
			"config.packFullHint": "Runtime, Documents, and Memory Spaces",
			"config.packRuntime": "Runtime",
			"config.packRuntimeHint": "Hot memory and USER / MEMORY projections",
			"config.packDocuments": "Documents",
			"config.packDocumentsHint": "Project documents, archive, and index",
			"config.packMemorySpaces": "Memory Spaces",
			"config.packMemorySpacesHint": "Catalog and mnemon.db databases",
			"config.packExport": "Export",
			"config.packImport": "Import",
			"config.packExporting": "Exporting…",
			"config.packInspecting": "Inspecting…",
			"config.packImporting": "Importing…",
			"config.packChooseFile": "Choose a {component} file",
			"config.packFormatHint": "Uses .mnemonpack throughout (ZIP + manifest + SHA-256). Each Memory Space remains a separate mnemon.db inside the Pack.",
			"config.packPreviewEyebrow": "Import preview",
			"config.packUnnamed": "Unnamed Mnemon Pack",
			"config.packSource": "Source",
			"config.packDestination": "Import into",
			"config.packArchiveSize": "Archive / expanded",
			"config.packComponents": "Components to import",
			"config.packComponentSummary": "{items} items · {files} files · {size}",
			"config.packHasData": "Target has data",
			"config.packMerge": "Safe merge (recommended)",
			"config.packMergeHint": "Keeps existing data; conflicting items are deduplicated or assigned new IDs.",
			"config.packMergeAction": "Merge import",
			"config.packReplace": "Replace current components?",
			"config.packReplaceHint": "Selected components are atomically replaced by the Pack; other components are unchanged.",
			"config.packReplaceAction": "Replace import…",
			"config.packConfirmReplace": "Confirm replace",
			"config.packComponentMissing": "This Pack does not contain the selected component.",
			"config.packExported": "Exported {file} ({size}).",
			"config.packImported": "Imported {components} into {root}.",
			"config.packFailed": "ZIP operation failed: {error}",
			"config.packSimpleDescription": "Export the complete effective directory as one ZIP, or safely merge-restore it from a ZIP.",
			"config.packWholeZip": "Current directory ZIP",
			"config.packWholeZipHint": "Includes Runtime, Documents, and every Memory Space.",
			"config.packImportZip": "Import ZIP",
			"config.packExportZip": "Export ZIP",
			"config.packChooseZip": "Choose a Mnemon backup ZIP",
			"config.packUnnamedZip": "Mnemon backup.zip",
			"config.packZipReady": "Verified · {components} components · {items} items · {size}",
			"config.packImportZipAction": "Safe import",
			"config.packImportedWhole": "Safely merged the ZIP into {root}."
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
		//#region src/rpc.ts
		const MNEMON_READ_CHANNEL = "/dsh-mnemon-read";
		const MNEMON_WRITE_CHANNEL = "/dsh-mnemon-write";
		const MNEMON_PACK_CHANNEL = "/dsh-mnemon-pack";
		//#endregion
		//#region src/client/api.ts
		const turnActivityCache = /* @__PURE__ */ new WeakMap();
		async function loadTurnActivities(connection, sessionId, requiredCursor) {
			let sessions = turnActivityCache.get(connection);
			if (sessions === void 0) {
				sessions = /* @__PURE__ */ new Map();
				turnActivityCache.set(connection, sessions);
			}
			const key = sessionId ?? "";
			let entry = sessions.get(key);
			if (entry === void 0) {
				entry = {
					cursor: -1,
					activities: /* @__PURE__ */ new Map()
				};
				sessions.set(key, entry);
			}
			if (entry.cursor >= requiredCursor) return {
				cursor: entry.cursor,
				activities: [...entry.activities.values()]
			};
			if (entry.inFlight !== void 0) {
				const snapshot = await entry.inFlight;
				return snapshot.cursor >= requiredCursor ? snapshot : loadTurnActivities(connection, sessionId, requiredCursor);
			}
			const request = connection.rpc.call(MNEMON_READ_CHANNEL, "turn-activities", sessionId === void 0 ? {} : { sessionId }).then((response) => {
				if (!response.ok) throw new Error(response.error.message);
				const snapshot = response.value;
				entry.cursor = snapshot.cursor;
				entry.activities = new Map(snapshot.activities.map((activity) => [activity.turn, activity]));
				return snapshot;
			}).finally(() => {
				delete entry.inFlight;
			});
			entry.inFlight = request;
			return request;
		}
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
			/** Settled memory-tool activity of one turn, shared across all mounted tails. */
			async turnActivity(turn, cursor = 0) {
				return (await loadTurnActivities(this.connection, this.sessionId, cursor)).activities.find((activity) => activity.turn === turn) ?? null;
			}
			/** Plain text of one finalized assistant message; null when absent or empty. */
			assistantMessageText(messageId) {
				return this.call(MNEMON_READ_CHANNEL, "assistant-message", {
					sessionId: this.sessionId,
					messageId
				});
			}
			remember(request) {
				return this.call(MNEMON_WRITE_CHANNEL, "remember", {
					...request,
					sessionId: this.sessionId
				});
			}
			supervise(content, idempotencyKey) {
				return this.call(MNEMON_WRITE_CHANNEL, "supervise", {
					sessionId: this.sessionId,
					content,
					...idempotencyKey === void 0 ? {} : { idempotencyKey }
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
			packTarget() {
				return this.call(MNEMON_PACK_CHANNEL, "target", {});
			}
			exportPack() {
				return this.call(MNEMON_PACK_CHANNEL, "export", {});
			}
			inspectPack(base64, fileName) {
				return this.call(MNEMON_PACK_CHANNEL, "inspect", {
					base64,
					...fileName === void 0 ? {} : { fileName }
				});
			}
			importPack(base64) {
				return this.call(MNEMON_PACK_CHANNEL, "import", { base64 });
			}
		};
		//#endregion
		//#region src/client/MnemonPackSection.tsx
		const ZIP_ACCEPT = ".zip,application/zip";
		function fileBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("Could not read ZIP file"));
				reader.onload = () => {
					const value = reader.result;
					if (typeof value !== "string") return reject(/* @__PURE__ */ new Error("Could not read ZIP file"));
					const separator = value.indexOf(",");
					if (separator < 0) return reject(/* @__PURE__ */ new Error("ZIP file encoding is invalid"));
					resolve(value.slice(separator + 1));
				};
				reader.readAsDataURL(file);
			});
		}
		function bytesFromBase64(base64) {
			const binary = atob(base64);
			const buffer = new ArrayBuffer(binary.length);
			const bytes = new Uint8Array(buffer);
			for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
			return buffer;
		}
		function download(result) {
			const blob = new Blob([bytesFromBase64(result.base64)], { type: result.mimeType });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = result.fileName;
			anchor.hidden = true;
			document.body.append(anchor);
			anchor.click();
			anchor.remove();
			window.setTimeout(() => URL.revokeObjectURL(url), 0);
		}
		function formatBytes(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			return `${(bytes / 1048576).toFixed(1)} MB`;
		}
		function MnemonPackSection({ connection, refreshKey, t }) {
			const client = (0, react.useMemo)(() => connection === void 0 ? null : new MnemonClient(connection), [connection]);
			const input = (0, react.useRef)(null);
			const [target, setTarget] = (0, react.useState)(null);
			const [pending, setPending] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(client === null ? null : "target");
			const [failed, setFailed] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let active = true;
				if (client === null) return;
				setBusy("target");
				setFailed(null);
				client.packTarget().then((value) => {
					if (active) setTarget(value);
				}).catch((reason) => {
					if (active) setFailed(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					if (active) setBusy(null);
				});
				return () => {
					active = false;
				};
			}, [client, refreshKey]);
			const scopeLabel = (scope) => scope === "global" ? t("config.global") : scope === "workspace" ? t("config.workspace") : t("config.custom");
			const exportZip = async () => {
				if (client === null || busy !== null) return;
				setBusy("export");
				setFailed(null);
				setNotice(null);
				try {
					const result = await client.exportPack();
					download(result);
					setNotice(t("config.packExported", {
						file: result.fileName,
						size: formatBytes(result.bytes)
					}));
				} catch (reason) {
					setFailed(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setBusy(null);
				}
			};
			const inspectZip = async (file) => {
				if (client === null || busy !== null) return;
				setBusy("inspect");
				setFailed(null);
				setNotice(null);
				setPending(null);
				try {
					const base64 = await fileBase64(file);
					const preview = await client.inspectPack(base64, file.name);
					setPending({
						base64,
						preview
					});
				} catch (reason) {
					setFailed(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setBusy(null);
				}
			};
			const chooseFile = (event) => {
				const file = event.currentTarget.files?.[0];
				event.currentTarget.value = "";
				if (file !== void 0) inspectZip(file);
			};
			const importZip = async () => {
				if (client === null || pending === null || busy !== null) return;
				setBusy("import");
				setFailed(null);
				setNotice(null);
				try {
					const result = await client.importPack(pending.base64);
					setNotice(t("config.packImportedWhole", { root: result.targetRoot }));
					setPending(null);
				} catch (reason) {
					setFailed(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setBusy(null);
				}
			};
			const items = pending?.preview.manifest.summary.reduce((sum, component) => sum + component.items, 0) ?? 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: MnemonSettingsCard_module_css_default.section,
				"aria-labelledby": "mnemon-pack-heading",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonSettingsCard_module_css_default.sectionHeading,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							id: "mnemon-pack-heading",
							children: t("config.packTitle")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("config.packSimpleDescription") })] })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonSettingsCard_module_css_default.settingRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonSettingsCard_module_css_default.settingCopy,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("config.packWholeZip") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("config.packWholeZipHint") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
										className: MnemonSettingsCard_module_css_default.activePath,
										title: target?.root,
										children: target?.root ?? t("config.packTargetLoading")
									}),
									target !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", {
										className: MnemonSettingsCard_module_css_default.scopeMeta,
										children: scopeLabel(target.scope)
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonSettingsCard_module_css_default.rowActions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonSettingsCard_module_css_default.pillButton,
									disabled: client === null || busy !== null,
									onClick: () => input.current?.click(),
									children: busy === "inspect" ? t("config.packInspecting") : t("config.packImportZip")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonSettingsCard_module_css_default.pillButton,
									disabled: client === null || busy !== null || target === null,
									onClick: () => void exportZip(),
									children: busy === "export" ? t("config.packExporting") : t("config.packExportZip")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: input,
								className: MnemonSettingsCard_module_css_default.visuallyHidden,
								type: "file",
								accept: ZIP_ACCEPT,
								"aria-label": t("config.packChooseZip"),
								onChange: chooseFile
							})
						]
					}),
					pending !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonSettingsCard_module_css_default.importBar,
						role: "status",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: pending.preview.fileName ?? t("config.packUnnamedZip") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("config.packZipReady", {
								components: pending.preview.manifest.components.length,
								items,
								size: formatBytes(pending.preview.archiveBytes)
							}) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSettingsCard_module_css_default.textButton,
								disabled: busy !== null,
								onClick: () => setPending(null),
								children: t("common.cancel")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSettingsCard_module_css_default.primaryPill,
								disabled: busy !== null,
								onClick: () => void importZip(),
								children: busy === "import" ? t("config.packImporting") : t("config.packImportZipAction")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonSettingsCard_module_css_default.packFeedback,
						"aria-live": "polite",
						children: [
							failed !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonSettingsCard_module_css_default.error,
								role: "alert",
								children: t("config.packFailed", { error: failed })
							}),
							notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonSettingsCard_module_css_default.packSuccess,
								children: notice
							}),
							client === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonSettingsCard_module_css_default.readOnly,
								children: t("config.packUnavailable")
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/MnemonSettingsCard.tsx
		const CORE_FIELDS = ["storageScope", "dataDir"];
		const INTERACTION_FIELDS = [
			"toolviews",
			"turnBar",
			"saveAction"
		];
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
		}
		function legacyPackDirectory(value) {
			const packs = value.customPacks ?? [];
			return packs.find((pack) => pack.id === value.customPackId)?.dataDir?.trim() ?? (packs.length === 1 ? packs[0]?.dataDir?.trim() : void 0) ?? "";
		}
		function coreDraft(value) {
			const resolved = value ?? {};
			const dataDir = resolved.dataDir?.trim() || legacyPackDirectory(resolved);
			return {
				storageScope: resolved.storageScope ?? (dataDir === "" ? "global" : "custom"),
				dataDir
			};
		}
		function interactionDraft(value) {
			return {
				toolviews: value?.toolviews === true,
				turnBar: value?.turnBar === true,
				saveAction: value?.saveAction === true
			};
		}
		function draftOf(core, interaction) {
			return {
				...coreDraft(core),
				...interactionDraft(interaction)
			};
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
		function useScope(scope) {
			const subscribe = (0, react.useMemo)(() => scope.subscribe.bind(scope), [scope]);
			const getSnapshot = (0, react.useMemo)(() => scope.getSnapshot.bind(scope), [scope]);
			return (0, react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
		}
		function operations(fields, dirty, draft) {
			return fields.flatMap((field) => {
				if (!dirty.has(field)) return [];
				if (field === "dataDir" && draft.dataDir.trim() === "") return [{
					op: "unset",
					path: [field]
				}];
				const value = draft[field];
				return [{
					op: "set",
					path: [field],
					value: typeof value === "string" ? value.trim() : value
				}];
			});
		}
		async function commit(scope, edits) {
			if (scope.mutate !== void 0) return scope.mutate(edits);
			for (const edit of edits) if (edit.path.length === 1) {
				if (edit.op === "set") await scope.set(edit.path[0], edit.value);
				else await scope.unset(edit.path[0]);
			} else if (edit.op === "set") await scope.setPath(edit.path, edit.value);
			else await scope.unsetPath(edit.path);
		}
		/** Dedicated Mnemon page contributed directly to DSH's settings navigation. */
		function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, connection, pickDirectory, t = translateZh }) {
			const interactionScope = suppliedInteractionScope ?? scope;
			const coreSnapshot = useScope(scope);
			const interactionSnapshot = useScope(interactionScope);
			const [draft, setDraft] = (0, react.useState)(() => draftOf(coreSnapshot.value, interactionSnapshot.value));
			const [dirty, setDirty] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [saving, setSaving] = (0, react.useState)(false);
			const [browsing, setBrowsing] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(null);
			const [applied, setApplied] = (0, react.useState)(false);
			const [targetRevision, setTargetRevision] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				if (dirty.size === 0) setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value));
			}, [
				dirty.size,
				coreSnapshot.value,
				interactionSnapshot.value
			]);
			const coreUser = (0, react.useMemo)(() => record(coreSnapshot.user), [coreSnapshot.user]);
			const error = validation(t, draft);
			const loading = coreSnapshot.status === "loading" || interactionSnapshot.status === "loading";
			const writable = coreSnapshot.writable && interactionSnapshot.writable;
			if (coreSnapshot.status === "unavailable" && interactionSnapshot.status === "unavailable") return null;
			const edit = (field, value) => {
				setDraft((current) => ({
					...current,
					[field]: value
				}));
				setDirty((current) => new Set(current).add(field));
				setFailed(null);
				setApplied(false);
			};
			const browse = async () => {
				if (pickDirectory === void 0 || browsing) return;
				setBrowsing(true);
				setFailed(null);
				try {
					const path = await pickDirectory();
					if (path !== null) {
						if (draft.storageScope !== "custom") edit("storageScope", "custom");
						edit("dataDir", path);
					}
				} catch (reason) {
					setFailed(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setBrowsing(false);
				}
			};
			const discard = () => {
				setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value));
				setDirty(/* @__PURE__ */ new Set());
				setFailed(null);
				setApplied(false);
			};
			const save = async () => {
				if (error !== null || dirty.size === 0 || saving || !writable) return;
				setSaving(true);
				setFailed(null);
				try {
					const coreOps = operations(CORE_FIELDS, dirty, draft);
					if (coreOps.length > 0) {
						if (Object.hasOwn(coreUser, "customPackId")) coreOps.push({
							op: "unset",
							path: ["customPackId"]
						});
						if (Object.hasOwn(coreUser, "customPacks")) coreOps.push({
							op: "unset",
							path: ["customPacks"]
						});
					}
					const interactionOps = operations(INTERACTION_FIELDS, dirty, draft);
					await Promise.all([...coreOps.length === 0 ? [] : [commit(scope, coreOps)], ...interactionOps.length === 0 ? [] : [commit(interactionScope, interactionOps)]]);
					setDirty(/* @__PURE__ */ new Set());
					setApplied(true);
					if (coreOps.length > 0) setTargetRevision((revision) => revision + 1);
				} catch (reason) {
					setFailed(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setSaving(false);
				}
			};
			const coreDisabled = loading || saving || browsing || !coreSnapshot.writable;
			const interactionDisabled = loading || saving || !interactionSnapshot.writable;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: MnemonSettingsCard_module_css_default.page,
				"aria-label": t("config.aria"),
				"aria-busy": saving || loading || browsing,
				children: loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: MnemonSettingsCard_module_css_default.loading,
					role: "status",
					children: t("common.loading")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: MnemonSettingsCard_module_css_default.pageHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: t("config.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("config.description") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonSettingsCard_module_css_default.section,
						"aria-labelledby": "mnemon-storage-heading",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonSettingsCard_module_css_default.sectionHeading,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: "mnemon-storage-heading",
									children: t("config.storageTitle")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("config.storageDescription") })] })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonSettingsCard_module_css_default.choiceGrid,
								role: "radiogroup",
								"aria-label": t("config.scopeAria"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoiceCard, {
										id: "mnemon-storage-global",
										name: "mnemon-storage",
										label: t("config.global"),
										detail: "~/.mnemon",
										checked: draft.storageScope === "global",
										disabled: coreDisabled,
										onChange: () => edit("storageScope", "global")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoiceCard, {
										id: "mnemon-storage-workspace",
										name: "mnemon-storage",
										label: t("config.workspace"),
										detail: "<workspace>/.mnemon",
										checked: draft.storageScope === "workspace",
										disabled: coreDisabled,
										onChange: () => edit("storageScope", "workspace")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoiceCard, {
										id: "mnemon-storage-custom",
										name: "mnemon-storage",
										label: t("config.custom"),
										detail: draft.dataDir === "" ? t("config.customHintShort") : t("config.customSelected"),
										checked: draft.storageScope === "custom",
										disabled: coreDisabled,
										onChange: () => {
											edit("storageScope", "custom");
											if (draft.dataDir === "") browse();
										}
									})
								]
							}),
							draft.storageScope === "custom" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonSettingsCard_module_css_default.settingRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonSettingsCard_module_css_default.settingCopy,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("config.customDirectory") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("config.customBrowseHint") })]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonSettingsCard_module_css_default.directoryControl,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
										title: draft.dataDir,
										children: draft.dataDir || t("config.customNotSelected")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonSettingsCard_module_css_default.pillButton,
										disabled: coreDisabled || pickDirectory === void 0,
										onClick: () => void browse(),
										children: browsing ? t("config.customBrowsing") : draft.dataDir === "" ? t("config.customBrowse") : t("config.customBrowseAgain")
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonSettingsCard_module_css_default.section,
						"aria-labelledby": "mnemon-interaction-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonSettingsCard_module_css_default.sectionHeading,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mnemon-interaction-heading",
								children: t("config.interactionTitle")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("config.interactionHint") })] })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.rowGroup,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleRow, {
									id: "mnemon-interaction-toolviews",
									label: t("config.interactionToolviews"),
									hint: t("config.interactionToolviewsHint"),
									checked: draft.toolviews,
									disabled: interactionDisabled,
									onChange: (value) => edit("toolviews", value)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleRow, {
									id: "mnemon-interaction-turn-bar",
									label: t("config.interactionTurnBar"),
									hint: t("config.interactionTurnBarHint"),
									checked: draft.turnBar,
									disabled: interactionDisabled,
									onChange: (value) => edit("turnBar", value)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleRow, {
									id: "mnemon-interaction-save-action",
									label: t("config.interactionSaveAction"),
									hint: t("config.interactionSaveActionHint"),
									checked: draft.saveAction,
									disabled: interactionDisabled,
									onChange: (value) => edit("saveAction", value)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonPackSection, {
						...connection === void 0 ? {} : { connection },
						refreshKey: targetRevision,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonSettingsCard_module_css_default.feedback,
						"aria-live": "polite",
						children: [
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
							applied && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonSettingsCard_module_css_default.success,
								role: "status",
								children: t("config.ready")
							}),
							pickDirectory === void 0 && draft.storageScope === "custom" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonSettingsCard_module_css_default.readOnly,
								children: t("config.customBrowseUnavailable")
							}),
							!writable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: MnemonSettingsCard_module_css_default.readOnly,
								children: t("config.readOnly")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: `${MnemonSettingsCard_module_css_default.actions} ${dirty.size > 0 ? MnemonSettingsCard_module_css_default.actionsVisible : ""}`,
						"aria-live": "polite",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("config.unsaved") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonSettingsCard_module_css_default.discard,
							disabled: saving,
							onClick: discard,
							children: t("config.discard")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonSettingsCard_module_css_default.save,
							disabled: saving || error !== null || !writable,
							onClick: () => void save(),
							children: saving ? t("config.saving") : t("config.save")
						})] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: MnemonSettingsCard_module_css_default.settingsNote,
						children: [
							t("config.noticeBefore"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: ".dsh/settings.yaml" }),
							t("config.noticeAfter")
						]
					})
				] })
			});
		}
		function ChoiceCard(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: MnemonSettingsCard_module_css_default.choiceCard,
				htmlFor: props.id,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					name: props.name,
					type: "radio",
					"aria-label": props.label,
					checked: props.checked,
					disabled: props.disabled,
					onChange: props.onChange
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: MnemonSettingsCard_module_css_default.choiceFace,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: props.label }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.detail }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonSettingsCard_module_css_default.check,
							"aria-hidden": "true",
							children: "✓"
						})
					]
				})]
			});
		}
		function ToggleRow(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: MnemonSettingsCard_module_css_default.toggleRow,
				htmlFor: props.id,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: MnemonSettingsCard_module_css_default.settingCopy,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: props.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.hint })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						type: "checkbox",
						"aria-label": props.label,
						checked: props.checked,
						disabled: props.disabled,
						onChange: (event) => props.onChange(event.target.checked)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: MnemonSettingsCard_module_css_default.switch,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {})
					})
				]
			});
		}
		//#endregion
		//#region src/client/anchor.ts
		const MNEMON_ANCHOR_EVENT = "mnemon:anchor";
		const pendingBySession = /* @__PURE__ */ new Map();
		function keyOf(sessionId) {
			return sessionId === void 0 || sessionId === "" ? "*" : sessionId;
		}
		/** Ask the Mnemon view to open a page; held until a matching view consumes it. */
		function dispatchMnemonAnchor(anchor) {
			pendingBySession.set(keyOf(anchor.sessionId), anchor);
			window.dispatchEvent(new CustomEvent(MNEMON_ANCHOR_EVENT, { detail: anchor }));
		}
		/** Take the anchor held for this session (usually at mount time), or null. */
		function consumeMnemonAnchor(sessionId) {
			const key = keyOf(sessionId);
			const anchor = pendingBySession.get(key);
			if (anchor === void 0) return null;
			pendingBySession.delete(key);
			return anchor;
		}
		/** Subscribe to anchors addressed to this session; returns an unsubscribe. */
		function subscribeMnemonAnchor(sessionId, onAnchor) {
			const key = keyOf(sessionId);
			const handler = (event) => {
				const anchor = event.detail;
				if (anchor !== void 0 && keyOf(anchor.sessionId) === key) {
					if (pendingBySession.get(key) === anchor) pendingBySession.delete(key);
					onAnchor(anchor);
				}
			};
			window.addEventListener(MNEMON_ANCHOR_EVENT, handler);
			return () => window.removeEventListener(MNEMON_ANCHOR_EVENT, handler);
		}
		//#endregion
		//#region node_modules/.pnpm/markdown-to-jsx@7.7.17_react@18.3.1/node_modules/markdown-to-jsx/dist/index.module.js
		function n() {
			return n = Object.assign ? Object.assign.bind() : function(r) {
				for (var n = 1; n < arguments.length; n++) {
					var e = arguments[n];
					for (var t in e) Object.prototype.hasOwnProperty.call(e, t) && (r[t] = e[t]);
				}
				return r;
			}, n.apply(this, arguments);
		}
		var e = ["children", "options"];
		var u = [
			"allowFullScreen",
			"allowTransparency",
			"autoComplete",
			"autoFocus",
			"autoPlay",
			"cellPadding",
			"cellSpacing",
			"charSet",
			"classId",
			"colSpan",
			"contentEditable",
			"contextMenu",
			"crossOrigin",
			"encType",
			"formAction",
			"formEncType",
			"formMethod",
			"formNoValidate",
			"formTarget",
			"frameBorder",
			"hrefLang",
			"inputMode",
			"keyParams",
			"keyType",
			"marginHeight",
			"marginWidth",
			"maxLength",
			"mediaGroup",
			"minLength",
			"noValidate",
			"radioGroup",
			"readOnly",
			"rowSpan",
			"spellCheck",
			"srcDoc",
			"srcLang",
			"srcSet",
			"tabIndex",
			"useMap"
		].reduce(function(r, n) {
			return r[n.toLowerCase()] = n, r;
		}, {
			class: "className",
			for: "htmlFor"
		});
		var a = {
			amp: "&",
			apos: "'",
			gt: ">",
			lt: "<",
			nbsp: "\xA0",
			quot: "“"
		};
		var i = [
			"style",
			"script",
			"pre"
		];
		var o = [
			"src",
			"href",
			"data",
			"formAction",
			"srcDoc",
			"action"
		];
		var c = /([-A-Z0-9_:]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|(?:\{((?:\\.|{[^}]*?}|[^}])*)\})))?/gi;
		var f = /\n{2,}$/;
		var l = /^(\s*>[\s\S]*?)(?=\n\n|$)/;
		var _ = /^ *> ?/gm;
		var d = /^(?:\[!([^\]]*)\]\n)?([\s\S]*)/;
		var s = /^ {2,}\n/;
		var v = /^(?:([-*_])( *\1){2,}) *(?:\n *)+\n/;
		var p = /^(?: {1,3})?(`{3,}|~{3,}) *(\S+)? *([^\n]*?)?\n([\s\S]*?)(?:\1\n?|$)/;
		var y = /^(?: {4}[^\n]+\n*)+(?:\n *)+\n?/;
		var h = /^(`+)((?:\\`|(?!\1)`|[^`])+)\1/;
		var g = /^(?:\n *)*\n/;
		var m = /\r\n?/g;
		var k = /^\[\^([^\]]+)](:(.*)((\n+ {4,}.*)|(\n(?!\[\^).+))*)/;
		var x = /^\[\^([^\]]+)]/;
		var q = /\f/g;
		var b = /^---[ \t]*\n(.|\n)*\n---[ \t]*\n/;
		var S = /^\s*?\[(x|\s)\]/;
		var z = /^ *(#{1,6}) *([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/;
		var $ = /^ *(#{1,6}) +([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/;
		var E = /^([^\n]+)\n *(=|-)\2{2,} *\n/;
		var A = /^ *(?!<[a-z][^ >/]* ?\/>)<([a-z][^ >/]*) ?((?:[^>]*[^/])?)>\n?(\s*(?:<\1[^>]*?>[\s\S]*?<\/\1>|(?!<\1\b)[\s\S])*?)<\/\1>(?!<\/\1>)\n*/i;
		var R = /&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi;
		var B = /^<!--[\s\S]*?(?:-->)/;
		var L = /^(data|aria|x)-[a-z_][a-z\d_.-]*$/;
		var O = /^ *<([a-z][a-z0-9:]*)(?:\s+((?:<.*?>|[^>])*))?\/?>(?!<\/\1>)(\s*\n)?/i;
		var j = /^\{.*\}$/;
		var C = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/;
		var I = /^<([^ >]+[:@\/][^ >]+)>/;
		var T = /-([a-z])?/gi;
		var M = /^(\|.*)\n(?: *(\|? *[-:]+ *\|[-| :]*)\n((?:.*\|.*\n)*))?\n?/;
		var w = /^[^\n]+(?:  \n|\n{2,})/;
		var D = /^\[([^\]]*)\]:\s+<?([^\s>]+)>?\s*("([^"]*)")?/;
		var F = /^!\[([^\]]*)\] ?\[([^\]]*)\]/;
		var P = /^\[([^\]]*)\] ?\[([^\]]*)\]/;
		var Z = /(\n|^[-*]\s|^#|^ {2,}|^-{2,}|^>\s)/;
		var N = /\t/g;
		var G = /(^ *\||\| *$)/g;
		var U = /^ *:-+: *$/;
		var V = /^ *:-+ *$/;
		var H = /^ *-+: *$/;
		var Q = function(r) {
			return "(?=[\\s\\S]+?\\1" + (r ? "\\1" : "") + ")";
		};
		var W = "((?:\\[.*?\\][([].*?[)\\]]|<.*?>(?:.*?<.*?>)?|`.*?`|\\\\\\1|[\\s\\S])+?)";
		var J = RegExp("^([*_])\\1" + Q(1) + W + "\\1\\1(?!\\1)");
		var K = RegExp("^([*_])" + Q(0) + W + "\\1(?!\\1)");
		var X = RegExp("^(==)" + Q(0) + W + "\\1");
		var Y = RegExp("^(~~)" + Q(0) + W + "\\1");
		var rr = /^(:[a-zA-Z0-9-_]+:)/;
		var nr = /^\\([^0-9A-Za-z\s])/;
		var er = /\\([^0-9A-Za-z\s])/g;
		var tr = /^[\s\S](?:(?!  \n|[0-9]\.|http)[^=*_~\-\n:<`\\\[!])*/;
		var ur = /^\n+/;
		var ar = /^([ \t]*)/;
		var ir = /(?:^|\n)( *)$/;
		var or = "(?:\\d+\\.)";
		var cr = "(?:[*+-])";
		function fr(r) {
			return "( *)(" + (1 === r ? or : cr) + ") +";
		}
		var lr = fr(1);
		var _r = fr(2);
		function dr(r) {
			return RegExp("^" + (1 === r ? lr : _r));
		}
		var sr = dr(1);
		var vr = dr(2);
		function pr(r) {
			return RegExp("^" + (1 === r ? lr : _r) + "[^\\n]*(?:\\n(?!\\1" + (1 === r ? or : cr) + " )[^\\n]*)*(\\n|$)", "gm");
		}
		var yr = pr(1);
		var hr = pr(2);
		function gr(r) {
			var n = 1 === r ? or : cr;
			return RegExp("^( *)(" + n + ") [\\s\\S]+?(?:\\n{2,}(?! )(?!\\1" + n + " (?!" + n + " ))\\n*|\\s*\\n*$)");
		}
		var mr = gr(1);
		var kr = gr(2);
		function xr(r, n) {
			var e = 1 === n, t = e ? mr : kr, u = e ? yr : hr, a = e ? sr : vr;
			return {
				t: function(r) {
					return a.test(r);
				},
				u: jr(function(r, n) {
					var e = ir.exec(n.prevCapture);
					return e && (n.list || !n.inline && !n.simple) ? t.exec(r = e[1] + r) : null;
				}),
				i: 1,
				o: function(r, n, t) {
					var i = e ? +r[2] : void 0, o = r[0].replace(f, "\n").match(u), c = !1;
					return {
						items: o.map(function(r, e) {
							var u = a.exec(r)[0].length, i = RegExp("^ {1," + u + "}", "gm"), f = r.replace(i, "").replace(a, ""), l = e === o.length - 1, _ = -1 !== f.indexOf("\n\n") || l && c;
							c = _;
							var d, s = t.inline, v = t.list;
							t.list = !0, _ ? (t.inline = !1, d = zr(f) + "\n\n") : (t.inline = !0, d = zr(f));
							var p = n(d, t);
							return t.inline = s, t.list = v, p;
						}),
						ordered: e,
						start: i
					};
				},
				l: function(n, e, t) {
					return r(n.ordered ? "ol" : "ul", {
						key: t.key,
						start: "20" === n.type ? n.start : void 0
					}, n.items.map(function(n, u) {
						return r("li", { key: u }, e(n, t));
					}));
				}
			};
		}
		var qr = RegExp("^\\[((?:\\[[^\\[\\]]*(?:\\[[^\\[\\]]*\\][^\\[\\]]*)*\\]|[^\\[\\]])*)\\]\\(\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*\\)");
		var br = /^!\[(.*?)\]\( *((?:\([^)]*\)|[^() ])*) *"?([^)"]*)?"?\)/;
		function Sr(r) {
			return "string" == typeof r;
		}
		function zr(r) {
			for (var n = r.length; n > 0 && r[n - 1] <= " ";) n--;
			return r.slice(0, n);
		}
		function $r(r, n) {
			return r.startsWith(n);
		}
		function Er(r, n, e) {
			if (Array.isArray(e)) {
				for (var t = 0; t < e.length; t++) if ($r(r, e[t])) return !0;
				return !1;
			}
			return e(r, n);
		}
		function Ar(r) {
			return r.replace(/[ÀÁÂÃÄÅàáâãäåæÆ]/g, "a").replace(/[çÇ]/g, "c").replace(/[ðÐ]/g, "d").replace(/[ÈÉÊËéèêë]/g, "e").replace(/[ÏïÎîÍíÌì]/g, "i").replace(/[Ññ]/g, "n").replace(/[øØœŒÕõÔôÓóÒò]/g, "o").replace(/[ÜüÛûÚúÙù]/g, "u").replace(/[ŸÿÝý]/g, "y").replace(/[^a-z0-9- ]/gi, "").replace(/ /gi, "-").toLowerCase();
		}
		function Rr(r) {
			return H.test(r) ? "right" : U.test(r) ? "center" : V.test(r) ? "left" : null;
		}
		function Br(r, n, e, t) {
			var u = e.inTable;
			e.inTable = !0;
			var a = [[]], i = "";
			function o() {
				if (i) {
					var r = a[a.length - 1];
					r.push.apply(r, n(i, e)), i = "";
				}
			}
			return r.trim().split(/(`[^`]*`|\\\||\|)/).filter(Boolean).forEach(function(r, n, e) {
				"|" === r.trim() && (o(), t) ? 0 !== n && n !== e.length - 1 && a.push([]) : i += r;
			}), o(), e.inTable = u, a;
		}
		function Lr(r, n, e) {
			e.inline = !0;
			var t = r[2] ? r[2].replace(G, "").split("|").map(Rr) : [], u = r[3] ? function(r, n, e) {
				return r.trim().split("\n").map(function(r) {
					return Br(r, n, e, !0);
				});
			}(r[3], n, e) : [], a = Br(r[1], n, e, !!u.length);
			return e.inline = !1, u.length ? {
				align: t,
				cells: u,
				header: a,
				type: "25"
			} : {
				children: a,
				type: "21"
			};
		}
		function Or(r, n) {
			return null == r.align[n] ? {} : { textAlign: r.align[n] };
		}
		function jr(r) {
			return r.inline = 1, r;
		}
		function Cr(r) {
			return jr(function(n, e) {
				return e.inline ? r.exec(n) : null;
			});
		}
		function Ir(r) {
			return jr(function(n, e) {
				return e.inline || e.simple ? r.exec(n) : null;
			});
		}
		function Tr(r) {
			return function(n, e) {
				return e.inline || e.simple ? null : r.exec(n);
			};
		}
		function Mr(r) {
			return jr(function(n) {
				return r.exec(n);
			});
		}
		var wr = /(javascript|vbscript|data(?!:image)):/i;
		function Dr(r) {
			try {
				var n = decodeURIComponent(r).replace(/[^A-Za-z0-9/:]/g, "");
				if (wr.test(n)) return null;
			} catch (r) {
				return null;
			}
			return r;
		}
		function Fr(r) {
			return r ? r.replace(er, "$1") : r;
		}
		function Pr(r, n, e) {
			var t = e.inline || !1, u = e.simple || !1;
			e.inline = !0, e.simple = !0;
			var a = r(n, e);
			return e.inline = t, e.simple = u, a;
		}
		function Zr(r, n, e) {
			var t = e.inline || !1, u = e.simple || !1;
			e.inline = !1, e.simple = !0;
			var a = r(n, e);
			return e.inline = t, e.simple = u, a;
		}
		function Nr(r, n, e) {
			var t = e.inline || !1;
			e.inline = !1;
			var u = r(n, e);
			return e.inline = t, u;
		}
		var Gr = function(r, n, e) {
			return { children: Pr(n, r[2], e) };
		};
		function Ur() {
			return {};
		}
		function Vr() {
			return null;
		}
		function Hr() {
			return [].slice.call(arguments).filter(Boolean).join(" ");
		}
		function Qr(r, n, e) {
			for (var t = r, u = n.split("."); u.length && void 0 !== (t = t[u[0]]);) u.shift();
			return t || e;
		}
		function Wr(r, n) {
			var e = Qr(n, r);
			return e ? "function" == typeof e || "object" == typeof e && "render" in e ? e : Qr(n, r + ".component", r) : r;
		}
		function Jr(e, t) {
			var f;
			void 0 === e && (e = ""), void 0 === t && (t = {}), t.overrides = t.overrides || {}, t.namedCodesToUnicode = t.namedCodesToUnicode ? n({}, a, t.namedCodesToUnicode) : a;
			var G = t.slugify || Ar, U = t.sanitizer || Dr, V = t.createElement || react.createElement, H = [
				l,
				p,
				y,
				t.enforceAtxHeadings ? $ : z,
				E,
				M,
				mr,
				kr
			], Q = [].concat(H, [
				w,
				A,
				B,
				O
			]);
			function W(r, n) {
				for (var e = 0; e < r.length; e++) if (r[e].test(n)) return !0;
				return !1;
			}
			function er(r, e) {
				var u = Qr(t.overrides, r + ".props", {});
				return V.apply(void 0, [Wr(r, t.overrides), n({}, e, u, { className: Hr(null == e ? void 0 : e.className, u.className) || void 0 })].concat([].slice.call(arguments, 2)));
			}
			function ir(r) {
				r = r.replace(b, "");
				var n = !1;
				t.forceInline ? n = !0 : t.forceBlock || (n = !1 === Z.test(r));
				for (var e = dr(_r(n ? r : zr(r).replace(ur, "") + "\n\n", { inline: n })); Sr(e[e.length - 1]) && !e[e.length - 1].trim();) e.pop();
				if (null === t.wrapper) return e;
				var u, a = t.wrapper || (n ? "span" : "div");
				if (e.length > 1 || t.forceWrapper) u = e;
				else {
					if (1 === e.length) return "string" == typeof (u = e[0]) ? er("span", { key: "outer" }, u) : u;
					u = null;
				}
				return V(a, { key: "outer" }, u);
			}
			function or(r, n) {
				if (!n || !n.trim()) return null;
				var e = n.match(c);
				return e ? e.reduce(function(n, e) {
					var t = e.indexOf("=");
					if (-1 !== t) {
						var a = function(r) {
							return -1 !== r.indexOf("-") && null === r.match(L) && (r = r.replace(T, function(r, n) {
								return n.toUpperCase();
							})), r;
						}(e.slice(0, t)).trim(), i = function(r) {
							var n = r[0];
							return ("\"" === n || "'" === n) && r.length >= 2 && r[r.length - 1] === n ? r.slice(1, -1) : r;
						}(e.slice(t + 1).trim()), c = u[a] || a;
						if ("ref" === c) return n;
						var f = n[c] = function(r, n, e, t) {
							return "style" === n ? function(r) {
								var n = [], e = "", t = !1, u = !1, a = "";
								if (!r) return n;
								for (var i = 0; i < r.length; i++) {
									var o = r[i];
									if ("\"" !== o && "'" !== o || t || (u ? o === a && (u = !1, a = "") : (u = !0, a = o)), "(" === o && e.endsWith("url") ? t = !0 : ")" === o && t && (t = !1), ";" !== o || u || t) e += o;
									else {
										var c = e.trim();
										if (c) {
											var f = c.indexOf(":");
											if (f > 0) {
												var l = c.slice(0, f).trim(), _ = c.slice(f + 1).trim();
												n.push([l, _]);
											}
										}
										e = "";
									}
								}
								var d = e.trim();
								if (d) {
									var s = d.indexOf(":");
									if (s > 0) {
										var v = d.slice(0, s).trim(), p = d.slice(s + 1).trim();
										n.push([v, p]);
									}
								}
								return n;
							}(e).reduce(function(n, e) {
								var u = e[0], a = e[1];
								return n[u.replace(/(-[a-z])/g, function(r) {
									return r[1].toUpperCase();
								})] = t(a, r, u), n;
							}, {}) : -1 !== o.indexOf(n) ? t(Fr(e), r, n) : (e.match(j) && (e = Fr(e.slice(1, e.length - 1))), "true" === e || "false" !== e && e);
						}(r, a, i, U);
						"string" == typeof f && (A.test(f) || O.test(f)) && (n[c] = ir(f.trim()));
					} else "style" !== e && (n[u[e] || e] = !0);
					return n;
				}, {}) : null;
			}
			var cr = [], fr = {}, lr = ((f = {})[0] = {
				t: [">"],
				u: Tr(l),
				i: 1,
				o: function(r, n, e) {
					var t = r[0].replace(_, "").match(d);
					return {
						alert: t[1],
						children: n(t[2], e)
					};
				},
				l: function(r, n, e) {
					var t = { key: e.key };
					return r.alert && (t.className = "markdown-alert-" + G(r.alert.toLowerCase(), Ar), r.children.unshift({
						attrs: {},
						children: [{
							type: "27",
							text: r.alert
						}],
						noInnerParse: !0,
						type: "11",
						tag: "header"
					})), er("blockquote", t, n(r.children, e));
				}
			}, f[1] = {
				t: ["  "],
				u: Mr(s),
				i: 1,
				o: Ur,
				l: function(r, n, e) {
					return er("br", { key: e.key });
				}
			}, f[2] = {
				t: [
					"--",
					"__",
					"**",
					"- ",
					"* ",
					"_ "
				],
				u: Tr(v),
				i: 1,
				o: Ur,
				l: function(r, n, e) {
					return er("hr", { key: e.key });
				}
			}, f[3] = {
				t: ["    "],
				u: Tr(y),
				i: 0,
				o: function(r) {
					return {
						lang: void 0,
						text: Fr(zr(r[0].replace(/^ {4}/gm, "")))
					};
				},
				l: function(r, e, t) {
					return er("pre", { key: t.key }, er("code", n({}, r.attrs, { className: r.lang ? "lang-" + r.lang : "" }), r.text));
				}
			}, f[4] = {
				t: ["```", "~~~"],
				u: Tr(p),
				i: 0,
				o: function(r) {
					return {
						attrs: or("code", r[3] || ""),
						lang: r[2] || void 0,
						text: r[4],
						type: "3"
					};
				}
			}, f[5] = {
				t: ["`"],
				u: Ir(h),
				i: 3,
				o: function(r) {
					return { text: Fr(r[2]) };
				},
				l: function(r, n, e) {
					return er("code", { key: e.key }, r.text);
				}
			}, f[6] = {
				t: ["[^"],
				u: Tr(k),
				i: 0,
				o: function(r) {
					return cr.push({
						footnote: r[2],
						identifier: r[1]
					}), {};
				},
				l: Vr
			}, f[7] = {
				t: ["[^"],
				u: Cr(x),
				i: 1,
				o: function(r) {
					return {
						target: "#" + G(r[1], Ar),
						text: r[1]
					};
				},
				l: function(r, n, e) {
					return er("a", {
						key: e.key,
						href: U(r.target, "a", "href")
					}, er("sup", { key: e.key }, r.text));
				}
			}, f[8] = {
				t: ["[ ]", "[x]"],
				u: Cr(S),
				i: 1,
				o: function(r) {
					return { completed: "x" === r[1].toLowerCase() };
				},
				l: function(r, n, e) {
					return er("input", {
						checked: r.completed,
						key: e.key,
						readOnly: !0,
						type: "checkbox"
					});
				}
			}, f[9] = {
				t: ["#"],
				u: Tr(t.enforceAtxHeadings ? $ : z),
				i: 1,
				o: function(r, n, e) {
					return {
						children: Pr(n, r[2], e),
						id: G(r[2], Ar),
						level: r[1].length
					};
				},
				l: function(r, n, e) {
					return er("h" + r.level, {
						id: r.id,
						key: e.key
					}, n(r.children, e));
				}
			}, f[10] = {
				t: function(r) {
					var n = r.indexOf("\n");
					return n > 0 && n < r.length - 1 && ("=" === r[n + 1] || "-" === r[n + 1]);
				},
				u: Tr(E),
				i: 1,
				o: function(r, n, e) {
					return {
						children: Pr(n, r[1], e),
						level: "=" === r[2] ? 1 : 2,
						type: "9"
					};
				}
			}, f[11] = {
				t: ["<"],
				u: Mr(A),
				i: 1,
				o: function(r, n, e) {
					var t = r[3].match(ar), u = RegExp("^" + t[1], "gm"), a = r[3].replace(u, ""), o = W(Q, a) ? Nr : Pr, c = r[1].toLowerCase(), f = -1 !== i.indexOf(c), l = (f ? c : r[1]).trim(), _ = {
						attrs: or(l, r[2]),
						noInnerParse: f,
						tag: l
					};
					if (e.inAnchor = e.inAnchor || "a" === c, f) _.text = r[3];
					else {
						var d = e.inHTML;
						e.inHTML = !0, _.children = o(n, a, e), e.inHTML = d;
					}
					return e.inAnchor = !1, _;
				},
				l: function(r, e, t) {
					return er(r.tag, n({ key: t.key }, r.attrs), r.text || (r.children ? e(r.children, t) : ""));
				}
			}, f[13] = {
				t: ["<"],
				u: Mr(O),
				i: 1,
				o: function(r) {
					var n = r[1].trim();
					return {
						attrs: or(n, r[2] || ""),
						tag: n
					};
				},
				l: function(r, e, t) {
					return er(r.tag, n({}, r.attrs, { key: t.key }));
				}
			}, f[12] = {
				t: ["<!--"],
				u: Mr(B),
				i: 1,
				o: function() {
					return {};
				},
				l: Vr
			}, f[14] = {
				t: ["!["],
				u: Ir(br),
				i: 1,
				o: function(r) {
					return {
						alt: Fr(r[1]),
						target: Fr(r[2]),
						title: Fr(r[3])
					};
				},
				l: function(r, n, e) {
					return er("img", {
						key: e.key,
						alt: r.alt || void 0,
						title: r.title || void 0,
						src: U(r.target, "img", "src")
					});
				}
			}, f[15] = {
				t: ["["],
				u: Cr(qr),
				i: 3,
				o: function(r, n, e) {
					return {
						children: Zr(n, r[1], e),
						target: Fr(r[2]),
						title: Fr(r[3])
					};
				},
				l: function(r, n, e) {
					return er("a", {
						key: e.key,
						href: U(r.target, "a", "href"),
						title: r.title
					}, n(r.children, e));
				}
			}, f[16] = {
				t: ["<"],
				u: Cr(I),
				i: 0,
				o: function(r) {
					var n = r[1], e = !1;
					return -1 !== n.indexOf("@") && -1 === n.indexOf("//") && (e = !0, n = n.replace("mailto:", "")), {
						children: [{
							text: n,
							type: "27"
						}],
						target: e ? "mailto:" + n : n,
						type: "15"
					};
				}
			}, f[17] = {
				t: function(r, n) {
					return !n.inAnchor && !t.disableAutoLink && ($r(r, "http://") || $r(r, "https://"));
				},
				u: Cr(C),
				i: 0,
				o: function(r) {
					return {
						children: [{
							text: r[1],
							type: "27"
						}],
						target: r[1],
						title: void 0,
						type: "15"
					};
				}
			}, f[20] = xr(er, 1), f[33] = xr(er, 2), f[19] = {
				t: ["\n"],
				u: Tr(g),
				i: 3,
				o: Ur,
				l: function() {
					return "\n";
				}
			}, f[21] = {
				u: jr(function(r, n) {
					if (n.inline || n.simple || n.inHTML && -1 === r.indexOf("\n\n") && -1 === n.prevCapture.indexOf("\n\n")) return null;
					for (var e = "", t = 0;;) {
						var u = r.indexOf("\n", t), a = r.slice(t, -1 === u ? void 0 : u + 1);
						if (W(H, a)) break;
						if (e += a, -1 === u || !a.trim()) break;
						t = u + 1;
					}
					var i = zr(e);
					return "" === i ? null : [
						e,
						,
						i
					];
				}),
				i: 3,
				o: Gr,
				l: function(r, n, e) {
					return er("p", { key: e.key }, n(r.children, e));
				}
			}, f[22] = {
				t: ["["],
				u: Cr(D),
				i: 0,
				o: function(r) {
					return fr[r[1]] = {
						target: r[2],
						title: r[4]
					}, {};
				},
				l: Vr
			}, f[23] = {
				t: ["!["],
				u: Ir(F),
				i: 0,
				o: function(r) {
					return {
						alt: r[1] ? Fr(r[1]) : void 0,
						ref: r[2]
					};
				},
				l: function(r, n, e) {
					return fr[r.ref] ? er("img", {
						key: e.key,
						alt: r.alt,
						src: U(fr[r.ref].target, "img", "src"),
						title: fr[r.ref].title
					}) : null;
				}
			}, f[24] = {
				t: function(r) {
					return "[" === r[0] && -1 === r.indexOf("](");
				},
				u: Cr(P),
				i: 0,
				o: function(r, n, e) {
					return {
						children: n(r[1], e),
						fallbackChildren: r[0],
						ref: r[2]
					};
				},
				l: function(r, n, e) {
					return fr[r.ref] ? er("a", {
						key: e.key,
						href: U(fr[r.ref].target, "a", "href"),
						title: fr[r.ref].title
					}, n(r.children, e)) : er("span", { key: e.key }, r.fallbackChildren);
				}
			}, f[25] = {
				t: ["|"],
				u: Tr(M),
				i: 1,
				o: Lr,
				l: function(r, n, e) {
					var t = r;
					return er("table", { key: e.key }, er("thead", null, er("tr", null, t.header.map(function(r, u) {
						return er("th", {
							key: u,
							style: Or(t, u)
						}, n(r, e));
					}))), er("tbody", null, t.cells.map(function(r, u) {
						return er("tr", { key: u }, r.map(function(r, u) {
							return er("td", {
								key: u,
								style: Or(t, u)
							}, n(r, e));
						}));
					})));
				}
			}, f[27] = {
				u: jr(function(r, n) {
					var e;
					return $r(r, ":") && (e = rr.exec(r)), e || tr.exec(r);
				}),
				i: 4,
				o: function(r) {
					var n = r[0];
					return { text: -1 === n.indexOf("&") ? n : n.replace(R, function(r, n) {
						return t.namedCodesToUnicode[n] || r;
					}) };
				},
				l: function(r) {
					return r.text;
				}
			}, f[28] = {
				t: ["**", "__"],
				u: Ir(J),
				i: 2,
				o: function(r, n, e) {
					return { children: n(r[2], e) };
				},
				l: function(r, n, e) {
					return er("strong", { key: e.key }, n(r.children, e));
				}
			}, f[29] = {
				t: function(r) {
					var n = r[0];
					return ("*" === n || "_" === n) && r[1] !== n;
				},
				u: Ir(K),
				i: 3,
				o: function(r, n, e) {
					return { children: n(r[2], e) };
				},
				l: function(r, n, e) {
					return er("em", { key: e.key }, n(r.children, e));
				}
			}, f[30] = {
				t: ["\\"],
				u: Ir(nr),
				i: 1,
				o: function(r) {
					return {
						text: r[1],
						type: "27"
					};
				}
			}, f[31] = {
				t: ["=="],
				u: Ir(X),
				i: 3,
				o: Gr,
				l: function(r, n, e) {
					return er("mark", { key: e.key }, n(r.children, e));
				}
			}, f[32] = {
				t: ["~~"],
				u: Ir(Y),
				i: 3,
				o: Gr,
				l: function(r, n, e) {
					return er("del", { key: e.key }, n(r.children, e));
				}
			}, f);
			!0 === t.disableParsingRawHTML && (delete lr[11], delete lr[13]);
			var _r = function(r) {
				var n = Object.keys(r);
				function e(t, u) {
					var a = [];
					if (u.prevCapture = u.prevCapture || "", t.trim()) for (; t;) for (var i = 0; i < n.length;) {
						var o = n[i], c = r[o];
						if (!c.t || Er(t, u, c.t)) {
							var f = c.u(t, u);
							if (f && f[0]) {
								t = t.substring(f[0].length);
								var l = c.o(f, e, u);
								u.prevCapture += f[0], l.type || (l.type = o), a.push(l);
								break;
							}
							i++;
						} else i++;
					}
					return u.prevCapture = "", a;
				}
				return n.sort(function(n, e) {
					return r[n].i - r[e].i || (n < e ? -1 : 1);
				}), function(r, n) {
					return e(function(r) {
						return r.replace(m, "\n").replace(q, "").replace(N, "    ");
					}(r), n);
				};
			}(lr), dr = function(r, n) {
				return function e(t, u) {
					if (void 0 === u && (u = {}), Array.isArray(t)) {
						for (var a = u.key, i = [], o = !1, c = 0; c < t.length; c++) {
							u.key = c;
							var f = e(t[c], u), l = Sr(f);
							l && o ? i[i.length - 1] += f : null !== f && i.push(f), o = l;
						}
						return u.key = a, i;
					}
					return function(e, t, u) {
						var a = r[e.type].l;
						return n ? n(function() {
							return a(e, t, u);
						}, e, t, u) : a(e, t, u);
					}(t, e, u);
				};
			}(lr, t.renderRule), sr = ir(e);
			return cr.length ? er("div", null, sr, er("footer", { key: "footer" }, cr.map(function(r) {
				return er("div", {
					id: G(r.identifier, Ar),
					key: r.identifier
				}, r.identifier, dr(_r(r.footnote, { inline: !0 })));
			}))) : sr;
		}
		function index_module_default(n) {
			var t = n.children, u = n.options, a = function(r, n) {
				if (null == r) return {};
				var e, t, u = {}, a = Object.keys(r);
				for (t = 0; t < a.length; t++) n.indexOf(e = a[t]) >= 0 || (u[e] = r[e]);
				return u;
			}(n, e);
			return react.cloneElement(Jr(null == t ? "" : t, u), a);
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
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/omdsh-dev/dsh-mnemon/src/client/MnemonView.module.css.mjs
		const css$3 = ".OkhtbG_shell{--mn-bg:var(--dsw-alias-bg-base);--mn-layer-1:var(--dsw-alias-bg-layer-1);--mn-layer-2:var(--dsw-alias-bg-layer-2);--mn-input:var(--dsw-specific-input-major);--mn-text:var(--dsw-alias-label-primary);--mn-muted:var(--dsw-alias-label-secondary);--mn-faint:var(--dsw-alias-label-tertiary);--mn-line:var(--dsw-alias-border-l2);--mn-line-strong:var(--dsw-alias-border-l1);--mn-accent:var(--dsw-alias-state-business-primary);--mn-hover:var(--dsw-alias-interactive-bg-hover);--mn-danger:var(--dsw-alias-state-error-primary);--mn-success:var(--dsw-alias-state-success-primary);--mn-code:var(--ds-font-family-code,\"SFMono-Regular\", Consolas, monospace);--mn-sans:system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;box-sizing:border-box;min-width:0;height:100%;min-height:600px;color:var(--mn-text);background:var(--mn-bg);font:13px/1.55 var(--mn-sans);-webkit-tap-highlight-color:transparent;flex-direction:column;display:flex;overflow:hidden}.OkhtbG_shell *,.OkhtbG_shell :before,.OkhtbG_shell :after{box-sizing:border-box}.OkhtbG_shell button,.OkhtbG_shell input,.OkhtbG_shell select,.OkhtbG_shell textarea{color:inherit;font:inherit}.OkhtbG_shell button,.OkhtbG_shell select{touch-action:manipulation}.OkhtbG_shell button:focus-visible,.OkhtbG_shell input:focus-visible,.OkhtbG_shell select:focus-visible,.OkhtbG_shell textarea:focus-visible,.OkhtbG_shell summary:focus-visible,.OkhtbG_shell [role=button]:focus-visible{outline:2px solid var(--mn-accent);outline-offset:2px}.OkhtbG_masthead{border-bottom:1px solid var(--mn-line);background:radial-gradient(circle at 70% -70%, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 42%), var(--mn-bg);flex:none;grid-template-columns:minmax(260px,1fr) auto auto;align-items:center;gap:clamp(14px,2vw,28px);min-height:68px;padding:10px clamp(18px,2.5vw,32px);display:grid}.OkhtbG_brand{align-items:center;gap:11px;min-width:0;display:flex}.OkhtbG_brandLogo{width:38px;height:38px;box-shadow:0 0 0 1px var(--mn-line-strong);border-radius:9px;flex:none;overflow:hidden}.OkhtbG_brand h1{letter-spacing:-.02em;margin:1px 0 0;font-size:17px;line-height:1.15}.OkhtbG_cardKicker,.OkhtbG_sectionHeading>div>span,.OkhtbG_entityHeading>span,.OkhtbG_inspectorHeading>span{color:var(--mn-faint);font:650 9px/1.2 var(--mn-code);letter-spacing:.12em;text-transform:uppercase}.OkhtbG_statusCluster{border:1px solid var(--mn-line-strong);min-height:34px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:9px;flex:none;align-items:center;gap:8px;padding:0 4px 0 11px;font-size:11px;display:flex}.OkhtbG_statusDot{border-radius:50%;width:6px;height:6px}.OkhtbG_online{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 15%, transparent)}.OkhtbG_offline{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 14%, transparent)}.OkhtbG_checking{background:var(--mn-faint);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-faint) 12%, transparent)}.OkhtbG_iconButton{width:32px;height:32px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.OkhtbG_iconButton:hover{color:var(--mn-accent);background:var(--mn-hover)}.OkhtbG_alert,.OkhtbG_inlineError{border:1px solid color-mix(in srgb, var(--mn-danger) 32%, transparent);color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 7%, var(--mn-layer-1));border-radius:9px;padding:10px 13px;font-size:12px}.OkhtbG_alert{flex-direction:column;flex:none;margin:10px clamp(18px,2.5vw,32px) 0;display:flex}.OkhtbG_telemetry{align-items:center;min-width:0;display:flex}.OkhtbG_telemetryMetric{border-left:1px solid var(--mn-line);gap:2px;min-width:72px;padding:1px 14px;display:grid}.OkhtbG_telemetryMetric span{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:9px;overflow:hidden}.OkhtbG_telemetryMetric strong{font:650 13px/1 var(--mn-code);font-variant-numeric:tabular-nums}.OkhtbG_workspace{flex-direction:column;flex:1;min-height:0;display:flex}.OkhtbG_topNavigation{border-bottom:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 72%, var(--mn-bg));flex:none;justify-content:space-between;align-items:stretch;gap:14px;min-width:0;min-height:48px;padding:0 clamp(18px,2.5vw,32px);display:flex}.OkhtbG_nav{overscroll-behavior-inline:contain;scrollbar-width:none;align-items:stretch;gap:10px;min-width:0;display:flex;overflow-x:auto}.OkhtbG_nav::-webkit-scrollbar{display:none}.OkhtbG_navGroup{align-items:stretch;gap:14px;min-width:0;display:flex}.OkhtbG_navGroupDivider{background:var(--mn-line);flex:none;align-self:center;width:1px;height:22px}.OkhtbG_nav button{min-width:max-content;min-height:44px;color:var(--mn-muted);text-align:left;cursor:pointer;background:0 0;border:0;align-items:center;gap:7px;padding:0 3px;display:flex;position:relative}.OkhtbG_nav button:hover,.OkhtbG_nav button[aria-current=page]{color:var(--mn-text)}.OkhtbG_nav button[aria-current=page]:after{content:\"\";background:var(--mn-accent);border-radius:2px 2px 0 0;height:2px;position:absolute;bottom:-1px;left:0;right:0}.OkhtbG_nav button[aria-current=page] .OkhtbG_navGlyph{color:var(--mn-accent)}.OkhtbG_nav button>span:last-child{min-width:0;display:block}.OkhtbG_nav button strong{font-size:12px;font-weight:600}.OkhtbG_nav button small{display:none}.OkhtbG_navGlyph{color:var(--mn-faint);font:600 13px/1 var(--mn-code)}@media (width>=1000px){.OkhtbG_nav button{min-height:50px}.OkhtbG_nav button small{color:var(--mn-faint);margin-top:1px;font-size:9px;line-height:1.3;display:block}}.OkhtbG_spaceSummary{border-left:1px solid var(--mn-line);flex:none;grid-template-columns:minmax(0,1fr) auto;align-content:center;gap:1px 9px;min-width:142px;padding:0 0 0 14px;display:grid}.OkhtbG_spaceSummary>span{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:9px;overflow:hidden}.OkhtbG_spaceSummary code{color:var(--mn-accent);font:650 12px/1 var(--mn-code);grid-row:span 2;align-self:center}.OkhtbG_spaceSummary small{color:var(--mn-faint);font-size:9px}.OkhtbG_canvas{overscroll-behavior-x:contain;overscroll-behavior-y:auto;scroll-behavior:auto;-webkit-overflow-scrolling:touch;background:var(--mn-bg);flex:1;min-width:0;overflow:auto}.OkhtbG_page{width:min(1320px,100%);min-height:100%;margin:0 auto;padding:clamp(18px,2.2vw,28px) clamp(18px,2.8vw,34px) clamp(150px,18vh,190px)}.OkhtbG_pageHeader{justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:16px;display:flex}.OkhtbG_pageHeader h2{letter-spacing:-.025em;margin:2px 0;font-size:20px;line-height:1.2}.OkhtbG_pageHeader p{max-width:72ch;color:var(--mn-muted);margin:0;font-size:12px;line-height:1.65}.OkhtbG_pageHeaderMeta{flex:none;align-items:center;gap:9px;display:flex}.OkhtbG_pageHeaderMeta>code{border:1px solid var(--mn-line);color:var(--mn-faint);background:var(--mn-layer-1);font:600 9px/1 var(--mn-code);letter-spacing:.06em;border-radius:7px;padding:6px 8px}.OkhtbG_primaryButton,.OkhtbG_secondaryButton,.OkhtbG_ghostButton,.OkhtbG_dangerButton,.OkhtbG_dangerSolidButton{cursor:pointer;border-radius:8px;min-height:36px;padding:0 13px;font-size:12px;transition:border-color .14s,background-color .14s,color .14s,transform .14s}.OkhtbG_primaryButton{border:1px solid var(--mn-accent);color:#fff;background:var(--mn-accent)}.OkhtbG_secondaryButton{border:1px solid var(--mn-line-strong);color:var(--mn-text);background:var(--mn-layer-1)}.OkhtbG_ghostButton,.OkhtbG_dangerButton{background:0 0;border:1px solid #0000;min-height:32px;padding:0 9px}.OkhtbG_ghostButton{color:var(--mn-muted)}.OkhtbG_dangerButton{color:var(--mn-danger)}.OkhtbG_dangerSolidButton{border:1px solid var(--mn-danger);color:#fff;background:var(--mn-danger);min-height:29px}.OkhtbG_primaryButton:hover,.OkhtbG_secondaryButton:hover,.OkhtbG_ghostButton:hover,.OkhtbG_dangerButton:hover{filter:brightness(.98);background-color:var(--mn-hover)}.OkhtbG_primaryButton:hover{background-color:var(--mn-accent)}.OkhtbG_shell button:disabled{cursor:not-allowed;opacity:.48}.OkhtbG_emptyState{border:1px dashed var(--mn-line-strong);background:color-mix(in srgb, var(--mn-layer-1) 50%, transparent);border-radius:13px;justify-content:center;align-items:center;gap:22px;min-height:220px;padding:30px;display:flex}.OkhtbG_emptyGlyph{border:1px solid color-mix(in srgb, var(--mn-accent) 35%, var(--mn-line));width:76px;height:76px;color:var(--mn-accent);background:radial-gradient(circle, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 65%);font:500 26px/1 var(--mn-code);border-radius:50%;flex:none;place-items:center;display:grid}.OkhtbG_emptyState h3{margin:0 0 5px;font-size:16px}.OkhtbG_emptyState p{max-width:500px;color:var(--mn-muted);margin:0}.OkhtbG_loadingPanel{border:1px solid var(--mn-line);min-height:220px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:13px;place-items:center;display:grid}.OkhtbG_inlineError{margin:0 0 14px}.OkhtbG_muted,.OkhtbG_loading{color:var(--mn-faint);padding:16px 0;font-size:12px}.OkhtbG_bodyDirectory{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 72%, var(--mn-bg));border-radius:11px;margin-bottom:12px;padding:12px 14px}.OkhtbG_bodyDirectoryHeader{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:10px;display:flex}.OkhtbG_bodyDirectoryHeader h3{margin:1px 0;font-size:13px}.OkhtbG_bodyDirectoryHeader p{color:var(--mn-muted);margin:0;font-size:10px}.OkhtbG_bodyDirectoryPath{max-width:min(62vw,720px);color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;margin-top:4px;font-size:9px;display:block;overflow:hidden}.OkhtbG_bodyDirectoryHeader>strong{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 9px var(--mn-code);border-radius:999px;flex:none;padding:5px 8px}.OkhtbG_bodyGrid{grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:7px;display:grid}.OkhtbG_bodyDirectoryEmpty{border:1px dashed color-mix(in srgb, var(--mn-line) 84%, transparent);min-height:92px;color:var(--mn-muted);border-radius:12px;grid-column:1/-1;justify-content:center;align-items:center;gap:14px;display:flex}.OkhtbG_bodyDirectoryEmpty>span{opacity:.6;font-size:28px}.OkhtbG_bodyDirectoryEmpty strong{color:var(--mn-text);display:block}.OkhtbG_bodyDirectoryEmpty p{margin:3px 0 0;font-size:10px}.OkhtbG_bodyCard{--mn-body-accent:var(--mn-success);border:1px solid var(--mn-line);background:var(--mn-layer-1);opacity:.7;border-radius:9px;min-width:0;padding:9px 10px;transition:opacity .18s,border-color .18s}.OkhtbG_bodyCard[data-active]{border-color:color-mix(in srgb, var(--mn-body-accent) 42%, var(--mn-line));opacity:1;box-shadow:inset 0 1px 0 color-mix(in srgb, var(--mn-body-accent) 10%, transparent)}.OkhtbG_bodyCardTop{grid-template-columns:7px minmax(0,1fr) auto;align-items:center;gap:8px;display:grid}.OkhtbG_bodySignal{background:var(--mn-faint);border-radius:50%;width:7px;height:7px}.OkhtbG_bodyCard[data-active] .OkhtbG_bodySignal{background:var(--mn-body-accent);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-body-accent) 14%, transparent)}.OkhtbG_bodyCard:not([data-healthy]) .OkhtbG_bodySignal{background:var(--mn-danger);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-danger) 12%, transparent)}.OkhtbG_bodyCardTop>div{min-width:0;display:grid}.OkhtbG_bodyCardTop strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.OkhtbG_bodyCardTop code{color:var(--mn-faint);font:9px var(--mn-code);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.OkhtbG_bodyHealth{color:var(--mn-success);font:650 8px var(--mn-code);letter-spacing:.07em;text-transform:uppercase}.OkhtbG_bodyCard:not([data-healthy]) .OkhtbG_bodyHealth{color:var(--mn-danger)}.OkhtbG_bodySwitch{min-height:32px;color:var(--mn-faint);cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:0 1px;font-size:9.5px;display:flex}.OkhtbG_bodySwitchTrack{border:1px solid var(--mn-line-strong);background:var(--mn-layer-2);border-radius:999px;flex:none;width:29px;height:17px;transition:border-color .18s,background-color .18s;position:relative}.OkhtbG_bodySwitchTrack i{background:var(--mn-faint);border-radius:50%;width:11px;height:11px;transition:transform .2s cubic-bezier(.2,.8,.2,1),background-color .18s;position:absolute;top:2px;left:2px}.OkhtbG_bodySwitch:hover{color:var(--mn-text)}.OkhtbG_bodySwitch:hover .OkhtbG_bodySwitchTrack{border-color:var(--mn-body-accent)}.OkhtbG_bodySwitch[aria-checked=true]{color:var(--mn-text)}.OkhtbG_bodySwitch[aria-checked=true] .OkhtbG_bodySwitchTrack{border-color:color-mix(in srgb, var(--mn-body-accent) 65%, var(--mn-line));background:color-mix(in srgb, var(--mn-body-accent) 25%, var(--mn-layer-2))}.OkhtbG_bodySwitch[aria-checked=true] .OkhtbG_bodySwitchTrack i{background:var(--mn-body-accent);transform:translate(12px)}.OkhtbG_bodyCardActions{align-items:center;gap:6px;display:flex}.OkhtbG_bodyEditButton{width:28px;height:28px;color:var(--mn-muted);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:7px;place-items:center;font-size:12px;display:grid}.OkhtbG_bodyEditButton:hover{color:var(--mn-text);border-color:var(--mn-line);background:var(--mn-hover)}.OkhtbG_bodyEdit{gap:9px;padding-top:2px;display:grid}.OkhtbG_bodyEdit label{color:var(--mn-faint);gap:4px;font-size:9px;display:grid}.OkhtbG_bodyEdit input,.OkhtbG_bodyEdit textarea{border:1px solid var(--mn-line);width:100%;color:var(--mn-text);background:var(--mn-input);border-radius:8px;outline:0;padding:7px 9px;font-size:12px;line-height:1.5}.OkhtbG_bodyEdit textarea{resize:vertical}.OkhtbG_bodyEdit input:focus,.OkhtbG_bodyEdit textarea:focus{border-color:var(--mn-accent)}.OkhtbG_bodyEditActions{justify-content:flex-end;gap:7px;display:flex}.OkhtbG_bodyCard>p{min-height:15px;color:var(--mn-muted);margin:7px 0;font-size:10px;line-height:1.45}.OkhtbG_bodyCard footer{border-top:1px solid var(--mn-line);color:var(--mn-faint);flex-wrap:wrap;gap:5px 11px;padding-top:6px;font-size:9px;display:flex}.OkhtbG_bodyCreate{border-top:1px solid var(--mn-line);margin-top:10px;padding-top:8px}.OkhtbG_bodyCreate summary{cursor:pointer;width:max-content;color:var(--mn-accent);font-size:10px;list-style:none}.OkhtbG_bodyCreate summary::-webkit-details-marker{display:none}.OkhtbG_bodyCreate form{grid-template-columns:minmax(130px,.7fr) minmax(150px,.9fr) minmax(230px,1.7fr) auto;gap:7px;margin-top:9px;display:grid}.OkhtbG_bodyCreate input{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:0;height:34px;padding:0 9px}.OkhtbG_bodyCreate input:focus{border-color:var(--mn-accent)}.OkhtbG_graphLayout{grid-template-columns:minmax(0,1fr) minmax(240px,270px);gap:10px;display:grid}.OkhtbG_graphPanel,.OkhtbG_graphInspector{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px}.OkhtbG_graphPanel{min-width:0;overflow:hidden}.OkhtbG_graphToolbar,.OkhtbG_graphFooter{min-height:43px;color:var(--mn-muted);justify-content:space-between;align-items:center;gap:14px;padding:0 13px;font-size:10px;display:flex}.OkhtbG_graphToolbar{border-bottom:1px solid var(--mn-line)}.OkhtbG_graphToolbar>div:first-child{align-items:center;gap:7px;display:flex}.OkhtbG_graphToolbar small{color:var(--mn-faint)}.OkhtbG_liveDot{background:var(--mn-success);width:6px;height:6px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 15%, transparent);border-radius:50%}.OkhtbG_graphLegend{flex-wrap:wrap;justify-content:flex-end;gap:5px 10px;display:flex}.OkhtbG_graphLegend span{align-items:center;gap:4px;display:flex}.OkhtbG_graphLegend span:before{content:\"\";background:var(--edge-color);border-radius:2px;width:13px;height:2px}.OkhtbG_graphLegend [data-edge=temporal]{--edge-color:#87909f}.OkhtbG_graphLegend [data-edge=scope]{--edge-color:#708199}.OkhtbG_graphLegend [data-edge=scope]:before{background:repeating-linear-gradient(90deg, var(--edge-color) 0 4px, transparent 4px 7px)}.OkhtbG_graphLegend [data-edge=semantic]{--edge-color:#4d7cfe}.OkhtbG_graphLegend [data-edge=causal]{--edge-color:#ef6b5b}.OkhtbG_graphLegend [data-edge=entity]{--edge-color:#22a879}.OkhtbG_graphViewport{background:radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--mn-accent) 6%, transparent), transparent 47%);min-height:clamp(390px,42vw,560px);position:relative;overflow:hidden}.OkhtbG_graphCanvasControls{z-index:2;border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 88%, transparent);box-shadow:0 6px 18px color-mix(in srgb, var(--mn-text) 7%, transparent);backdrop-filter:blur(10px);border-radius:9px;align-items:center;gap:5px;padding:4px;display:flex;position:absolute;top:10px;right:10px}.OkhtbG_graphCanvasControls span{color:var(--mn-faint);font:9px var(--mn-code);align-items:center;gap:5px;padding:0 6px;display:flex}.OkhtbG_graphCanvasControls span i{background:var(--mn-accent);width:5px;height:5px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-accent) 12%, transparent);border-radius:50%}.OkhtbG_graphCanvasControls button{min-height:30px;color:var(--mn-muted);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;padding:0 9px;font-size:9.5px}.OkhtbG_graphCanvasControls button:hover,.OkhtbG_graphCanvasControls button[data-active]{border-color:var(--mn-line);color:var(--mn-text);background:var(--mn-hover)}.OkhtbG_graphCanvasControls button[data-active]{color:var(--mn-accent)}.OkhtbG_graphSvg{touch-action:pan-y pinch-zoom;user-select:none;width:100%;height:clamp(390px,42vw,560px);display:block}.OkhtbG_graphBackdrop{fill:var(--mn-layer-1)}.OkhtbG_graphGridLine{stroke:var(--mn-line);stroke-width:.6px;opacity:.5}.OkhtbG_graphEdge{fill:none;stroke:#87909f;stroke-width:1px;opacity:.32;vector-effect:non-scaling-stroke}.OkhtbG_graphEdge[data-edge=scope]{stroke:#708199;stroke-dasharray:4 5;opacity:.28}.OkhtbG_graphEdge[data-edge=semantic]{stroke:#4d7cfe;opacity:.48}.OkhtbG_graphEdge[data-edge=causal]{stroke:#ef6b5b;opacity:.52}.OkhtbG_graphEdge[data-edge=entity]{stroke:#22a879;stroke-width:1.45px;opacity:.78}.OkhtbG_graphNode{--node:#8290a8;cursor:grab;touch-action:none;outline:none}.OkhtbG_graphNode[data-dragging]{cursor:grabbing}.OkhtbG_graphNode[data-category=decision]{--node:#ef8354}.OkhtbG_graphNode[data-category=preference]{--node:#a879e1}.OkhtbG_graphNode[data-category=fact]{--node:#4d7cfe}.OkhtbG_graphNode[data-category=insight]{--node:#19a77d}.OkhtbG_graphNode[data-category=context]{--node:#d8a624}.OkhtbG_graphNode[data-kind=space]{--node:var(--mn-success)}.OkhtbG_graphNode[data-kind=entity]{--node:#2b9db9}.OkhtbG_nodeHalo{fill:color-mix(in srgb, var(--node) 18%, var(--mn-layer-1));stroke:color-mix(in srgb, var(--node) 60%, var(--mn-layer-1));stroke-width:1.5px;transition:r .16s}.OkhtbG_nodeCore{fill:var(--node)}.OkhtbG_nodeLabel{fill:var(--mn-muted);font:10px var(--mn-code);pointer-events:auto}.OkhtbG_nodeBodyLabel{fill:var(--mn-faint);font:650 8px var(--mn-code);letter-spacing:.04em;pointer-events:auto}.OkhtbG_graphSvg[data-density=sparse] .OkhtbG_nodeLabel{font-size:12px}.OkhtbG_graphNode:hover .OkhtbG_nodeHalo,.OkhtbG_graphNode:focus .OkhtbG_nodeHalo,.OkhtbG_graphNode[data-selected] .OkhtbG_nodeHalo{fill:color-mix(in srgb, var(--node) 28%, var(--mn-layer-1));stroke:var(--node)}.OkhtbG_graphNode[data-selected] .OkhtbG_nodeLabel{fill:var(--mn-text);font-weight:650}.OkhtbG_graphFooter{border-top:1px solid var(--mn-line);min-height:38px;color:var(--mn-faint)}.OkhtbG_graphInspector{min-width:0;min-height:calc(clamp(390px,42vw,560px) + 83px);padding:15px;overflow:hidden}.OkhtbG_inspectorEmpty{text-align:center;flex-direction:column;justify-content:center;align-items:center;height:100%;display:flex}.OkhtbG_inspectorLogo{opacity:.72;border-radius:11px;width:54px;height:54px;margin-bottom:15px}.OkhtbG_inspectorEmpty h3{margin:7px 0 3px;font-size:14px}.OkhtbG_inspectorEmpty p{color:var(--mn-faint);margin:0;font-size:11px}.OkhtbG_inspectorHeading{justify-content:space-between;align-items:center;display:flex}.OkhtbG_inspectorHeading button,.OkhtbG_sectionHeading button{width:32px;height:32px;color:var(--mn-muted);cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.OkhtbG_inspectorHeading button:hover,.OkhtbG_sectionHeading button:hover{background:var(--mn-hover)}.OkhtbG_categoryChip{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 10%, transparent);border-radius:999px;margin-top:24px;padding:3px 8px;font-size:10px;display:inline-flex}.OkhtbG_inspectorTitleRow{align-items:flex-start;gap:8px;min-width:0;margin:12px 0 20px;display:flex}.OkhtbG_inspectorTitle{overflow-wrap:anywhere;white-space:pre-wrap;-webkit-line-clamp:6;-webkit-box-orient:vertical;flex:1;min-width:0;margin:0;font-size:14px;line-height:1.6;display:-webkit-box;overflow:hidden}.OkhtbG_inspectorEye{border:1px solid var(--mn-line);width:27px;height:27px;color:var(--mn-muted);background:var(--mn-layer-1);cursor:pointer;border-radius:7px;flex:none;place-items:center;transition:color .15s,border-color .15s,background-color .15s;display:grid}.OkhtbG_inspectorEye:hover{color:var(--mn-accent);border-color:var(--mn-line-strong);background:var(--mn-hover)}.OkhtbG_inspectorMeta{margin:0}.OkhtbG_inspectorMeta>div{border-top:1px solid var(--mn-line);gap:3px;padding:11px 0;display:grid}.OkhtbG_inspectorMeta dt{color:var(--mn-faint);font:9px var(--mn-code);text-transform:uppercase}.OkhtbG_inspectorMeta dd{overflow-wrap:anywhere;color:var(--mn-muted);margin:0;font-size:11px}.OkhtbG_inspectorActions{gap:8px;margin-top:20px;display:grid}.OkhtbG_previewOverlay{z-index:40;background:color-mix(in srgb, var(--mn-bg) 58%, transparent);backdrop-filter:blur(4px);place-items:center;padding:clamp(16px,4vw,48px);display:grid;position:fixed;inset:0}.OkhtbG_previewDialog{border:1px solid var(--mn-line-strong);background:var(--mn-layer-1);width:min(680px,100%);max-height:min(76dvh,640px);box-shadow:0 24px 64px color-mix(in srgb, var(--mn-text) 20%, transparent);border-radius:13px;flex-direction:column;display:flex;overflow:hidden}.OkhtbG_previewHeading{border-bottom:1px solid var(--mn-line);flex:none;justify-content:space-between;align-items:center;gap:12px;min-height:46px;padding:0 14px 0 16px;display:flex}.OkhtbG_previewHeading>span{color:var(--mn-accent);font:650 9px/1.2 var(--mn-code);letter-spacing:.08em;text-transform:uppercase}.OkhtbG_previewHeading button{width:32px;height:32px;color:var(--mn-muted);cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;font-size:15px;display:grid}.OkhtbG_previewHeading button:hover{background:var(--mn-hover)}.OkhtbG_previewMeta{border-bottom:1px solid var(--mn-line);color:var(--mn-faint);font:9px var(--mn-code);text-overflow:ellipsis;white-space:nowrap;flex:none;padding:8px 16px;overflow:hidden}.OkhtbG_previewBody{-webkit-overflow-scrolling:touch;min-height:0;padding:14px 16px 18px;overflow:auto}.OkhtbG_previewBody p{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--mn-text);margin:0;font-size:13px;line-height:1.7}.OkhtbG_searchBar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:13px;margin-bottom:18px;padding:13px}.OkhtbG_queryField{border:1px solid var(--mn-line-strong);background:var(--mn-input);border-radius:9px;grid-template-columns:24px minmax(0,1fr) 24px;align-items:center;gap:5px;padding:0 10px;display:grid}.OkhtbG_queryField>span{color:var(--mn-accent);font:18px var(--mn-code)}.OkhtbG_queryField input{background:0 0;border:0;outline:0;width:100%;height:42px}.OkhtbG_queryField kbd{color:var(--mn-faint);font:11px var(--mn-code)}.OkhtbG_searchControls{justify-content:flex-end;align-items:flex-end;gap:10px;padding-top:10px;display:flex}.OkhtbG_searchActions{align-items:center;gap:7px;display:flex}.OkhtbG_agentAnswer{border:1px solid color-mix(in srgb, var(--mn-accent) 30%, var(--mn-line));background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 7%, var(--mn-layer-1)), var(--mn-layer-1) 60%);border-radius:11px;margin-bottom:16px;padding:16px 18px}.OkhtbG_agentAnswerHeading{justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.OkhtbG_agentAnswerHeading span{color:var(--mn-accent);font:650 9px/1.2 var(--mn-code);letter-spacing:.08em}.OkhtbG_agentAnswerHeading h3{margin:4px 0 0;font-size:15px}.OkhtbG_agentAnswerHeading>code{color:var(--mn-faint);font-size:9px}.OkhtbG_agentAnswer>p{white-space:pre-wrap;color:var(--mn-text);margin:12px 0;font-size:13px;line-height:1.7}.OkhtbG_agentCitations{border-top:1px solid var(--mn-line);flex-wrap:wrap;gap:5px;padding-top:10px;display:flex}.OkhtbG_agentCitations code{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:5px;padding:3px 6px;font-size:9px}.OkhtbG_searchControls label,.OkhtbG_formGrid label,.OkhtbG_fieldWide{color:var(--mn-muted);gap:5px;font-size:11px;display:grid}.OkhtbG_searchControls select,.OkhtbG_formGrid select,.OkhtbG_formGrid input,.OkhtbG_listToolbar input,.OkhtbG_listToolbar select,.OkhtbG_entitySearch input{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:140px;height:34px;padding:0 9px}.OkhtbG_searchControls select:focus,.OkhtbG_formGrid select:focus,.OkhtbG_formGrid input:focus,.OkhtbG_listToolbar input:focus,.OkhtbG_listToolbar select:focus,.OkhtbG_entitySearch input:focus,.OkhtbG_supervisedForm textarea:focus{border-color:var(--mn-accent)}.OkhtbG_singleColumn{max-width:830px}.OkhtbG_resultLayout{grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);align-items:start;gap:14px;display:grid}.OkhtbG_results,.OkhtbG_relatedPane,.OkhtbG_entityResults{min-width:0}.OkhtbG_sectionHeading{justify-content:space-between;align-items:center;gap:16px;min-height:39px;margin-bottom:8px;display:flex}.OkhtbG_sectionHeading h3{margin:2px 0 0;font-size:15px}.OkhtbG_sectionHeading>strong{min-width:27px;height:27px;color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 11px var(--mn-code);border-radius:7px;place-items:center;display:grid}.OkhtbG_relatedPane{border:1px solid var(--mn-line);background:var(--mn-layer-1);-webkit-overflow-scrolling:touch;border-radius:12px;max-height:calc(100dvh - 230px);padding:13px;scroll-margin-top:14px;position:sticky;top:12px;overflow:auto}.OkhtbG_relatedSource{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:8px;margin:0 0 13px;padding:10px;font-size:11px}.OkhtbG_insightCard{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;min-width:0;margin-bottom:9px;padding:14px;transition:border-color .15s,transform .15s,box-shadow .15s}.OkhtbG_insightCard:hover{border-color:var(--mn-line-strong);transform:translateY(-1px)}.OkhtbG_cardTop{justify-content:space-between;align-items:center;gap:10px;display:flex}.OkhtbG_badges,.OkhtbG_tags,.OkhtbG_entities{flex-wrap:wrap;gap:5px;display:flex}.OkhtbG_badge{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:999px;padding:2px 6px;font-size:9px}.OkhtbG_id{color:var(--mn-faint);font:9px var(--mn-code)}.OkhtbG_content{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0;line-height:1.65}.OkhtbG_tags{color:var(--mn-accent);font-size:10px}.OkhtbG_entities{margin-top:7px}.OkhtbG_entities span{border:1px solid var(--mn-line);color:var(--mn-muted);border-radius:5px;padding:2px 6px;font-size:9px}.OkhtbG_cardActions{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:3px;min-height:30px;margin-top:10px;padding-top:8px;display:flex}.OkhtbG_confirmBar{width:100%;color:var(--mn-danger);justify-content:flex-end;align-items:center;gap:5px;font-size:11px;display:flex}.OkhtbG_confirmBar>span{margin-right:auto}.OkhtbG_entityLayout{grid-template-columns:265px minmax(0,1fr);align-items:start;gap:16px;display:grid}.OkhtbG_entityRail{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;padding:13px;position:sticky;top:0}.OkhtbG_entitySearch{grid-template-columns:minmax(0,1fr) auto;gap:7px;display:grid}.OkhtbG_entitySearch input{min-width:0}.OkhtbG_entityHeading{justify-content:space-between;align-items:center;margin:18px 2px 7px;display:flex}.OkhtbG_entityHeading small{color:var(--mn-faint);font-size:9px}.OkhtbG_entityList{gap:3px;display:grid}.OkhtbG_entityList button{min-height:34px;color:var(--mn-muted);cursor:pointer;text-align:left;background:0 0;border:0;border-radius:7px;justify-content:space-between;align-items:center;gap:10px;padding:0 9px;display:flex}.OkhtbG_entityList button:hover,.OkhtbG_entityList button[aria-pressed=true]{color:var(--mn-text);background:var(--mn-hover)}.OkhtbG_entityList strong{color:var(--mn-faint);font:10px var(--mn-code)}.OkhtbG_entityResults>.OkhtbG_emptyState{min-height:360px}.OkhtbG_runtimeComposer,.OkhtbG_runtimeTarget{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px}.OkhtbG_runtimeComposer{background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 5%, var(--mn-layer-1)), var(--mn-layer-1) 55%);margin-bottom:13px;padding:15px}.OkhtbG_runtimeComposerHeading{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:11px;display:flex}.OkhtbG_runtimeComposerHeading h3{margin:0 0 2px;font-size:14px}.OkhtbG_runtimeComposerHeading p{color:var(--mn-muted);margin:0;font-size:10px}.OkhtbG_runtimeComposerHeading>span{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 9px var(--mn-code);border-radius:999px;flex:none;padding:4px 8px}.OkhtbG_runtimeComposer>textarea,.OkhtbG_runtimeEntry textarea{resize:vertical;border:1px solid var(--mn-line);width:100%;color:var(--mn-text);background:var(--mn-input);border-radius:9px;outline:0;padding:10px 11px;line-height:1.6}.OkhtbG_runtimeComposer>textarea:focus,.OkhtbG_runtimeEntry textarea:focus{border-color:var(--mn-accent)}.OkhtbG_runtimeComposerActions{justify-content:flex-end;align-items:flex-end;gap:9px;margin-top:10px;display:flex}.OkhtbG_runtimeComposerActions label{color:var(--mn-faint);gap:4px;font-size:9px;display:grid}.OkhtbG_runtimeComposerActions select,.OkhtbG_runtimeEntry select{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:135px;height:34px;padding:0 8px}.OkhtbG_runtimeNotice,.OkhtbG_runtimeReadOnly{border:1px solid color-mix(in srgb, var(--mn-success) 28%, var(--mn-line));color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 6%, var(--mn-layer-1));border-radius:9px;margin-bottom:13px;padding:9px 12px;font-size:11px}.OkhtbG_runtimeReadOnly{color:var(--mn-muted);border-color:var(--mn-line);background:var(--mn-layer-1)}.OkhtbG_runtimeGrid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:12px;display:grid}.OkhtbG_runtimeTarget{min-width:0;overflow:hidden}.OkhtbG_runtimeTargetHeader{justify-content:space-between;align-items:center;gap:14px;padding:14px 15px 9px;display:flex}.OkhtbG_runtimeTargetHeader>div{gap:1px;display:grid}.OkhtbG_runtimeTargetHeader span{color:var(--mn-faint);font:650 9px var(--mn-code);letter-spacing:.08em}.OkhtbG_runtimeTargetHeader h3{margin:0;font-size:15px}.OkhtbG_runtimeTargetHeader>strong{min-width:28px;height:28px;color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 11px var(--mn-code);border-radius:8px;place-items:center;display:grid}.OkhtbG_capacityLine{align-items:center;gap:9px;padding:0 15px;display:flex}.OkhtbG_capacityLine>div{background:var(--mn-layer-2);border-radius:999px;flex:1;height:4px;overflow:hidden}.OkhtbG_capacityLine i{border-radius:inherit;background:var(--mn-success);height:100%;transition:width .25s;display:block}.OkhtbG_capacityLine>span{min-width:88px;color:var(--mn-faint);font:9px var(--mn-code);text-align:right}.OkhtbG_runtimeTargetDescription{min-height:31px;color:var(--mn-muted);margin:8px 15px 12px;font-size:10px}.OkhtbG_runtimeEntries{border-top:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 36%, var(--mn-layer-1));gap:7px;padding:10px;display:grid}.OkhtbG_runtimeEntry{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:9px;padding:11px;position:relative}.OkhtbG_runtimeEntry:before{content:\"\";background:var(--mn-muted);border-radius:0 2px 2px 0;width:2px;position:absolute;top:12px;bottom:12px;left:-1px}.OkhtbG_runtimeEntry[data-importance=critical]:before{background:var(--mn-danger)}.OkhtbG_runtimeEntry[data-importance=low]:before{background:var(--mn-faint);opacity:.45}.OkhtbG_runtimeEntryMeta{justify-content:space-between;align-items:center;gap:12px;display:flex}.OkhtbG_runtimeEntryMeta>span{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:999px;padding:2px 6px;font-size:9px}.OkhtbG_runtimeEntry[data-importance=critical] .OkhtbG_runtimeEntryMeta>span{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 8%, transparent)}.OkhtbG_runtimeEntryMeta time{color:var(--mn-faint);font:8px var(--mn-code);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.OkhtbG_runtimeEntry>p{white-space:pre-wrap;overflow-wrap:anywhere;min-height:42px;margin:9px 0;font-size:12px;line-height:1.6}.OkhtbG_runtimeEntry>select{margin-top:7px}.OkhtbG_runtimeEntry footer{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:4px;min-height:30px;margin-top:7px;padding-top:7px;display:flex}.OkhtbG_runtimeEntry footer>span{color:var(--mn-danger);margin-right:auto;font-size:10px}.OkhtbG_runtimeEmpty{min-height:126px;color:var(--mn-faint);text-align:center;align-content:center;place-items:center;gap:5px;display:grid}.OkhtbG_runtimeEmpty>span{font:24px var(--mn-code);opacity:.65}.OkhtbG_runtimeEmpty p{margin:0;font-size:10px}.OkhtbG_runtimeFootnote{color:var(--mn-faint);margin:10px 2px 0;font-size:9px}.OkhtbG_documentSummary{grid-template-columns:.7fr .7fr 1.6fr;gap:9px;margin-bottom:12px;display:grid}.OkhtbG_documentSummary article{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;min-width:0;min-height:91px;padding:13px 14px}.OkhtbG_documentSummary article>span{color:var(--mn-faint);font-size:9px;display:block}.OkhtbG_documentSummary article>strong{font:650 21px/1 var(--mn-code);margin:7px 0 4px;display:block}.OkhtbG_documentSummary article>small{color:var(--mn-muted);font-size:9px}.OkhtbG_documentCapacity>div{background:var(--mn-layer-2);border-radius:999px;height:4px;margin:7px 0 6px;overflow:hidden}.OkhtbG_documentCapacity>div i{border-radius:inherit;background:var(--mn-accent);height:100%;transition:width .3s;display:block}.OkhtbG_documentToolbar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;align-items:center;gap:9px;margin-bottom:12px;padding:9px;display:flex}.OkhtbG_documentToolbar form{flex:1;grid-template-columns:20px minmax(0,1fr) auto;align-items:center;gap:5px;min-width:260px;padding-left:8px;display:grid}.OkhtbG_documentToolbar form>span{color:var(--mn-faint);font:15px var(--mn-code)}.OkhtbG_documentToolbar input,.OkhtbG_documentEditor input,.OkhtbG_documentEditor textarea{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;width:100%;padding:8px 10px}.OkhtbG_documentToolbar input{background:0 0;border-color:#0000;height:34px}.OkhtbG_documentToolbar input:focus,.OkhtbG_documentEditor input:focus,.OkhtbG_documentEditor textarea:focus{border-color:var(--mn-accent)}.OkhtbG_documentToolbar>div{border:1px solid var(--mn-line);background:var(--mn-layer-2);border-radius:8px;align-items:center;gap:3px;padding:3px;display:flex}.OkhtbG_documentToolbar>div button{min-height:32px;color:var(--mn-muted);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:0 10px;font-size:10.5px}.OkhtbG_documentToolbar>div button[data-active]{color:var(--mn-text);background:var(--mn-layer-1);box-shadow:0 1px 3px color-mix(in srgb, var(--mn-text) 8%, transparent)}.OkhtbG_documentToolbar>div b{color:var(--mn-faint);font:600 9px var(--mn-code);margin-left:4px}.OkhtbG_documentWorkspace{grid-template-columns:minmax(250px,310px) minmax(0,1fr);gap:10px;min-height:590px;display:grid}.OkhtbG_documentList,.OkhtbG_documentReader{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;min-width:0;overflow:hidden}.OkhtbG_documentList{align-self:stretch}.OkhtbG_documentList>header{border-bottom:1px solid var(--mn-line);min-height:42px;color:var(--mn-faint);justify-content:space-between;align-items:center;padding:0 12px;font-size:9px;display:flex}.OkhtbG_documentList>header code{color:var(--mn-accent)}.OkhtbG_documentList>button{border:0;border-bottom:1px solid var(--mn-line);width:100%;color:var(--mn-text);text-align:left;cursor:pointer;background:0 0;padding:12px;transition:background-color .15s,box-shadow .15s;display:block}.OkhtbG_documentList>button:hover{background:var(--mn-hover)}.OkhtbG_documentList>button[data-selected]{background:color-mix(in srgb, var(--mn-accent) 7%, var(--mn-layer-1));box-shadow:inset 2px 0 var(--mn-accent)}.OkhtbG_documentList>button>div{justify-content:space-between;align-items:baseline;gap:12px;display:flex}.OkhtbG_documentList>button strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.OkhtbG_documentList>button time{color:var(--mn-faint);font:8px var(--mn-code);flex:none}.OkhtbG_documentList>button p{min-height:30px;color:var(--mn-muted);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:6px 0 9px;font-size:10px;line-height:1.5;display:-webkit-box;overflow:hidden}.OkhtbG_documentList>button footer{color:var(--mn-faint);align-items:center;gap:8px;font-size:9px;display:flex}.OkhtbG_documentList>button footer code{margin-left:auto}.OkhtbG_documentList>button footer em{color:var(--mn-danger);font-style:normal}.OkhtbG_documentListEmpty{min-height:230px;color:var(--mn-muted);text-align:center;align-content:center;place-items:center;gap:4px;padding:22px;display:grid}.OkhtbG_documentListEmpty>span{color:var(--mn-accent);font:28px var(--mn-code);opacity:.6;margin-bottom:6px}.OkhtbG_documentListEmpty p{color:var(--mn-faint);margin:0;font-size:10px}.OkhtbG_documentReader{padding:clamp(16px,2vw,22px)}.OkhtbG_documentReader>.OkhtbG_emptyState{background:0 0;border:0;height:100%}.OkhtbG_documentDetail>header{border-bottom:1px solid var(--mn-line);justify-content:space-between;align-items:flex-start;gap:18px;padding-bottom:15px;display:flex}.OkhtbG_documentDetail>header span{color:var(--mn-accent);font:650 9px var(--mn-code);letter-spacing:.08em;text-transform:uppercase}.OkhtbG_documentDetail>header h3{margin:5px 0 3px;font-size:18px}.OkhtbG_documentDetail>header p{color:var(--mn-muted);margin:0;font-size:11px}.OkhtbG_documentDetail>dl{border-top:1px solid var(--mn-line);border-left:1px solid var(--mn-line);grid-template-columns:2fr .45fr .8fr .55fr;margin:13px 0;display:grid}.OkhtbG_documentDetail>dl>div{border-right:1px solid var(--mn-line);border-bottom:1px solid var(--mn-line);min-width:0;padding:8px 9px}.OkhtbG_documentDetail dt{color:var(--mn-faint);margin-bottom:3px;font-size:8px}.OkhtbG_documentDetail dd{text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:9px;overflow:hidden}.OkhtbG_documentSources{flex-wrap:wrap;align-items:center;gap:5px;margin:11px 0;display:flex}.OkhtbG_documentSources>span{color:var(--mn-faint);margin-right:4px;font-size:9px}.OkhtbG_documentSources code,.OkhtbG_documentArchiveReceipt code{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:5px;padding:3px 6px;font-size:8px}.OkhtbG_markdownBody{overflow-wrap:anywhere;border:1px solid var(--mn-line);min-height:310px;color:var(--mn-text);background:color-mix(in srgb, var(--mn-layer-2) 30%, var(--mn-layer-1));border-radius:10px;margin:16px 0 0;padding:clamp(18px,2.5vw,28px);font-size:13px;line-height:1.78}.OkhtbG_markdownBody>:first-child{margin-top:0}.OkhtbG_markdownBody>:last-child{margin-bottom:0}.OkhtbG_markdownBody h1,.OkhtbG_markdownBody h2,.OkhtbG_markdownBody h3,.OkhtbG_markdownBody h4{color:var(--mn-text);letter-spacing:-.015em;margin:1.55em 0 .65em;line-height:1.3}.OkhtbG_markdownBody h1{border-bottom:1px solid var(--mn-line);padding-bottom:.35em;font-size:1.75em}.OkhtbG_markdownBody h2{border-bottom:1px solid var(--mn-line);padding-bottom:.3em;font-size:1.42em}.OkhtbG_markdownBody h3{font-size:1.18em}.OkhtbG_markdownBody p,.OkhtbG_markdownBody ul,.OkhtbG_markdownBody ol,.OkhtbG_markdownBody blockquote,.OkhtbG_markdownBody table,.OkhtbG_markdownBody pre{margin:.85em 0}.OkhtbG_markdownBody ul,.OkhtbG_markdownBody ol{padding-left:1.6em}.OkhtbG_markdownBody li+li{margin-top:.3em}.OkhtbG_markdownBody blockquote{border-left:3px solid var(--mn-accent);color:var(--mn-muted);background:color-mix(in srgb, var(--mn-accent) 4%, transparent);margin-inline:0;padding:.15em 1em}.OkhtbG_markdownBody code{color:var(--mn-text);background:var(--mn-layer-2);font:.88em/1.55 var(--mn-code);border-radius:5px;padding:.15em .38em}.OkhtbG_markdownBody pre{border:1px solid var(--mn-line);background:var(--mn-layer-2);border-radius:9px;max-width:100%;padding:14px 16px;overflow:auto}.OkhtbG_markdownBody pre code{background:0 0;padding:0;font-size:11px}.OkhtbG_markdownBody a{color:var(--mn-accent);text-underline-offset:3px;text-decoration-thickness:1px}.OkhtbG_markdownBody hr{border:0;border-top:1px solid var(--mn-line);margin:1.8em 0}.OkhtbG_markdownBody table{border-collapse:collapse;max-width:100%;display:block;overflow-x:auto}.OkhtbG_markdownBody th,.OkhtbG_markdownBody td{border:1px solid var(--mn-line);text-align:left;vertical-align:top;padding:8px 10px}.OkhtbG_markdownBody th{background:var(--mn-layer-2);font-weight:600}.OkhtbG_markdownBody img{border-radius:8px;max-width:100%;height:auto}.OkhtbG_documentArchiveReceipt{border:1px solid color-mix(in srgb, var(--mn-success) 28%, var(--mn-line));background:color-mix(in srgb, var(--mn-success) 5%, transparent);border-radius:9px;margin:12px 0;padding:11px 12px}.OkhtbG_documentArchiveReceipt p{color:var(--mn-muted);margin:4px 0 8px;font-size:10px}.OkhtbG_documentArchiveReceipt div{flex-wrap:wrap;gap:5px;display:flex}.OkhtbG_documentDanger{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:7px;min-height:57px;margin-top:13px;padding-top:12px;display:flex}.OkhtbG_documentDanger>div{margin-right:auto}.OkhtbG_documentDanger strong{font-size:11px;display:block}.OkhtbG_documentDanger p{color:var(--mn-faint);margin:2px 0 0;font-size:9px}.OkhtbG_documentDanger>span{color:var(--mn-danger);margin-right:auto;font-size:10px}.OkhtbG_documentEditor{border:1px solid var(--mn-line);background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 5%, var(--mn-layer-1)), var(--mn-layer-1) 55%);border-radius:11px;margin-bottom:12px;padding:15px}.OkhtbG_documentReader>.OkhtbG_documentEditor{background:0 0;border:0;margin:0;padding:0}.OkhtbG_documentEditor>header{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:12px;display:flex}.OkhtbG_documentEditor h3{margin:0;font-size:14px}.OkhtbG_documentEditor header p{color:var(--mn-muted);margin:2px 0 0;font-size:10px}.OkhtbG_documentEditor header>span,.OkhtbG_documentEditor header>code{color:var(--mn-accent);font:650 9px var(--mn-code)}.OkhtbG_documentEditor label{color:var(--mn-faint);gap:4px;margin-top:9px;font-size:9px;display:grid}.OkhtbG_documentEditor textarea{resize:vertical;line-height:1.65}.OkhtbG_documentEditorMeta{grid-template-columns:.8fr 1.2fr;gap:9px;display:grid}.OkhtbG_documentEditorMeta label{margin:0}.OkhtbG_documentEditor footer{justify-content:flex-end;gap:7px;margin-top:11px;display:flex}.OkhtbG_writebackLayout{grid-template-columns:minmax(220px,280px) minmax(0,1fr);align-items:start;gap:15px;display:grid}.OkhtbG_writeGuide,.OkhtbG_supervisedComposer{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px}.OkhtbG_writeGuide{padding:17px}.OkhtbG_writeGuide h3{margin:5px 0 15px;font-size:15px}.OkhtbG_writeGuide ol{counter-reset:gate;gap:13px;margin:0;padding:0;list-style:none;display:grid}.OkhtbG_writeGuide li{counter-increment:gate;grid-template-columns:22px minmax(0,1fr);column-gap:7px;display:grid}.OkhtbG_writeGuide li:before{content:\"0\" counter(gate);color:var(--mn-accent);font:10px var(--mn-code);grid-row:span 2}.OkhtbG_writeGuide li strong{font-size:12px}.OkhtbG_writeGuide li span,.OkhtbG_writeGuide p{color:var(--mn-faint);font-size:10px}.OkhtbG_writeGuide p{border-top:1px solid var(--mn-line);margin:17px 0 0;padding-top:13px}.OkhtbG_supervisedComposer{overflow:hidden}.OkhtbG_supervisedForm{padding:18px}.OkhtbG_supervisedHeading{justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;display:flex}.OkhtbG_supervisedHeading h3{margin:4px 0 0;font-size:17px}.OkhtbG_sessionReady,.OkhtbG_sessionMissing{font:650 9px var(--mn-code);border-radius:999px;padding:4px 8px}.OkhtbG_sessionReady{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 10%, transparent)}.OkhtbG_sessionMissing{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 10%, transparent)}.OkhtbG_supervisedForm textarea{resize:vertical;border:1px solid var(--mn-line);width:100%;color:var(--mn-text);background:var(--mn-input);border-radius:9px;outline:0;padding:12px;line-height:1.65}.OkhtbG_sessionHint{color:var(--mn-danger);margin:9px 0 0;font-size:11px}.OkhtbG_formGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:13px;display:grid}.OkhtbG_fieldWide{grid-column:1/-1}.OkhtbG_formGrid select,.OkhtbG_formGrid input{width:100%;min-width:0}.OkhtbG_formActions{align-items:center;gap:12px;margin-top:15px;display:flex}.OkhtbG_formActions span{color:var(--mn-muted);font-size:11px}.OkhtbG_advancedWrite{border-top:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 45%, var(--mn-layer-1))}.OkhtbG_advancedWrite summary{cursor:pointer;justify-content:space-between;align-items:center;gap:16px;min-height:58px;padding:10px 18px;list-style:none;display:flex}.OkhtbG_advancedWrite summary::-webkit-details-marker{display:none}.OkhtbG_advancedWrite summary>span:first-child{gap:2px;display:grid}.OkhtbG_advancedWrite summary strong{font-size:12px}.OkhtbG_advancedWrite summary small{color:var(--mn-faint);font-size:10px}.OkhtbG_advancedWrite summary>span:last-child{color:var(--mn-accent);font:10px var(--mn-code)}.OkhtbG_advancedWrite[open] summary{border-bottom:1px solid var(--mn-line)}.OkhtbG_advancedWrite[open] summary>span:last-child{font-size:0}.OkhtbG_advancedWrite[open] summary>span:last-child:after{content:\"−\";font-size:13px}.OkhtbG_manualForm{padding:3px 18px 18px}.OkhtbG_manualActions{justify-content:space-between;align-items:center;gap:14px;margin-top:15px;display:flex}.OkhtbG_manualActions p{max-width:520px;color:var(--mn-faint);margin:0;font-size:10px}.OkhtbG_listToolbar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;grid-template-columns:minmax(0,1fr) 170px auto;gap:9px;padding:12px;display:grid}.OkhtbG_listToolbar input,.OkhtbG_listToolbar select{width:100%;min-width:0}.OkhtbG_listNotice{color:var(--mn-faint);margin:10px 0 16px;font-size:10px}.OkhtbG_listNotice span{color:var(--mn-success);font:650 9px var(--mn-code);letter-spacing:.08em;margin-right:7px}.OkhtbG_memoryList{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:9px;display:grid}.OkhtbG_memoryList .OkhtbG_insightCard{height:100%;margin:0}.OkhtbG_listProgress{border-top:1px solid var(--mn-line);min-height:58px;color:var(--mn-faint);justify-content:center;align-items:center;gap:13px;margin-top:12px;padding:10px;font-size:10px;display:flex}.OkhtbG_healthStrip{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:13px;display:grid;overflow:hidden}.OkhtbG_healthStrip article{box-sizing:border-box;border-right:1px solid var(--mn-line);align-items:flex-start;gap:10px;min-width:0;min-height:78px;padding:14px 15px;display:flex}.OkhtbG_healthStrip article>div{min-width:0}.OkhtbG_healthStrip article:last-child{border-right:0}.OkhtbG_healthStrip small{color:var(--mn-faint);font:650 10px var(--mn-code);letter-spacing:.06em;margin-bottom:4px;display:block}.OkhtbG_healthStrip strong{text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;display:block;overflow:hidden}.OkhtbG_healthStrip p{color:var(--mn-muted);text-overflow:ellipsis;white-space:nowrap;margin:3px 0 0;font-size:10.5px;overflow:hidden}.OkhtbG_healthIndicator{width:7px;height:7px;box-shadow:0 0 0 4px color-mix(in srgb, currentColor 9%, transparent);border-radius:50%;flex:none;margin-top:3px}.OkhtbG_healthGood{color:var(--mn-success);background:currentColor}.OkhtbG_healthBad{color:var(--mn-danger);background:currentColor}.OkhtbG_healthMuted{color:var(--mn-faint);background:currentColor}.OkhtbG_memoryFlow{border:1px solid var(--mn-line);background:radial-gradient(circle at 52% 10%, color-mix(in srgb, var(--mn-accent) 5%, transparent), transparent 28%), var(--mn-layer-1);border-radius:12px;margin-bottom:13px;padding:16px;overflow:hidden;container:OkhtbG_mnemon-flow/inline-size}.OkhtbG_memoryFlowCanvas{overscroll-behavior-inline:contain;border:1px solid var(--mn-line);background-image:linear-gradient(color-mix(in srgb, var(--mn-line) 36%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--mn-line) 36%, transparent) 1px, transparent 1px);background-size:24px 24px;background-color:color-mix(in srgb, var(--mn-layer-2) 28%, transparent);scrollbar-color:var(--mn-line-strong) transparent;border-radius:11px;margin-top:13px;overflow:auto hidden}.OkhtbG_flowArchitecture{gap:10px;min-width:840px;padding:10px;display:grid}.OkhtbG_flowLane{border:1px solid color-mix(in srgb, var(--mn-line) 82%, transparent);background:color-mix(in srgb, var(--mn-layer-1) 92%, transparent);min-width:0;box-shadow:inset 3px 0 0 color-mix(in srgb, var(--mn-accent) 34%, transparent);border-radius:10px;overflow:hidden}.OkhtbG_flowLane[data-lane=semantic]{box-shadow:inset 3px 0 #8b6ce77a}.OkhtbG_flowLane[data-lane=maintenance]{box-shadow:inset 3px 0 #d18a3c85}.OkhtbG_flowLane>header{border-bottom:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 42%, transparent);align-items:center;gap:9px;min-height:46px;padding:8px 12px;display:flex}.OkhtbG_flowLane>header>span{color:var(--mn-accent);font:650 9px var(--mn-code)}.OkhtbG_flowLane>header>div{gap:1px;min-width:0;display:grid}.OkhtbG_flowLane>header strong{font-size:12px}.OkhtbG_flowLane>header small{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:9.5px;overflow:hidden}.OkhtbG_flowTrack{align-items:stretch;gap:0;min-width:0;padding:11px 12px;display:flex}.OkhtbG_flowTrack+.OkhtbG_flowTrack{padding-top:0}.OkhtbG_flowSecondaryTrack,.OkhtbG_flowReviewTrack,.OkhtbG_flowArchiveTrack{border-top:1px dashed color-mix(in srgb, var(--mn-line) 72%, transparent);padding-top:11px!important}.OkhtbG_flowArchitectureNode{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 96%, transparent);border-radius:9px;flex:1 1 0;grid-template-columns:7px minmax(0,1fr);align-content:center;gap:9px;min-width:0;min-height:84px;padding:11px;transition:border-color .2s,background-color .2s,box-shadow .2s;display:grid;position:relative}.OkhtbG_flowArchitectureNode[data-kind=worker]{border-style:dashed;border-color:color-mix(in srgb, #8b6ce7 46%, var(--mn-line));background:color-mix(in srgb, #8b6ce7 4%, var(--mn-layer-1))}.OkhtbG_flowArchitectureNode[data-kind=store]{background:color-mix(in srgb, var(--mn-success) 3%, var(--mn-layer-1))}.OkhtbG_flowArchitectureNode[data-kind=task]{background:color-mix(in srgb, var(--mn-accent) 3%, var(--mn-layer-1))}.OkhtbG_flowArchitectureNode[data-emphasis=active]{border-color:color-mix(in srgb, var(--mn-accent) 56%, var(--mn-line));box-shadow:0 0 0 2px color-mix(in srgb, var(--mn-accent) 8%, transparent)}.OkhtbG_flowArchitectureNode[data-emphasis=recent]{border-color:color-mix(in srgb, var(--mn-success) 48%, var(--mn-line))}.OkhtbG_flowArchitectureNode[data-emphasis=pending]{border-color:color-mix(in srgb, #d18a3c 55%, var(--mn-line))}.OkhtbG_flowArchitectureSignal{background:var(--mn-faint);width:7px;height:7px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-faint) 8%, transparent);border-radius:50%;margin-top:4px}.OkhtbG_flowArchitectureNode[data-state=ready] .OkhtbG_flowArchitectureSignal{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 10%, transparent)}.OkhtbG_flowArchitectureNode[data-state=error] .OkhtbG_flowArchitectureSignal{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 10%, transparent)}.OkhtbG_flowArchitectureNode>div{align-content:start;gap:5px;min-width:0;display:grid}.OkhtbG_flowArchitectureNode strong{overflow-wrap:break-word;word-break:normal;font-size:11.5px;line-height:1.35}.OkhtbG_flowArchitectureNode small{color:var(--mn-faint);overflow-wrap:anywhere;font-size:9.5px;line-height:1.45}.OkhtbG_flowConnector{width:clamp(38px,4.2vw,56px);color:var(--mn-faint);text-align:center;flex:none;place-content:center stretch;gap:5px;padding:0 4px;display:grid;position:relative}.OkhtbG_flowConnector span{overflow-wrap:anywhere;min-height:13px;font:8px/1.3 var(--mn-code)}.OkhtbG_flowConnector i{background:color-mix(in srgb, var(--mn-accent) 55%, var(--mn-line));height:1px;display:block;position:relative}.OkhtbG_flowConnector i:after{border-top:1px solid var(--mn-accent);border-right:1px solid var(--mn-accent);content:\"\";width:6px;height:6px;position:absolute;top:-3px;right:-1px;transform:rotate(45deg)}.OkhtbG_flowConnector[data-kind=worker] i{border-top:1px dashed color-mix(in srgb, #8b6ce7 72%, var(--mn-line));background:0 0;height:0}.OkhtbG_flowConnector[data-kind=worker] i:after{border-color:#8b6ce7}.OkhtbG_flowConnector[data-active]{color:var(--mn-text)}.OkhtbG_flowConnector[data-active] i{height:2px}.OkhtbG_flowConnector[data-active] i:before{z-index:1;content:\"\";background:var(--mn-accent);border-radius:50%;width:5px;height:5px;animation:1.9s cubic-bezier(.35,0,.65,1) infinite OkhtbG_flowTrace;position:absolute;top:-2px;left:0}.OkhtbG_flowConnector[data-kind=worker][data-active] i:before{background:#8b6ce7;top:-3px}@keyframes OkhtbG_flowTrace{0%{opacity:0;left:0}12%{opacity:1}88%{opacity:1}to{opacity:0;left:calc(100% - 5px)}}@keyframes OkhtbG_flowTraceVertical{0%{opacity:0;top:0}12%{opacity:1}88%{opacity:1}to{opacity:0;top:calc(100% - 5px)}}.OkhtbG_flowLegend{color:var(--mn-faint);flex-wrap:wrap;gap:9px 18px;margin-top:10px;font-size:9px;display:flex}.OkhtbG_flowLegend span{align-items:center;gap:6px;display:inline-flex}.OkhtbG_flowLegend span:last-child{margin-left:auto}.OkhtbG_flowLegend i{background:var(--mn-accent);width:18px;height:1px}.OkhtbG_flowLegend span:nth-child(2) i{background:0 0;border-top:1px dashed #8b6ce7;height:0}.OkhtbG_flowLegend b{background:var(--mn-success);width:6px;height:6px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 10%, transparent);border-radius:50%}@container OkhtbG_mnemon-flow (width<=700px){.OkhtbG_flowArchitecture{min-width:0;padding:8px}.OkhtbG_flowLane>header{align-items:flex-start}.OkhtbG_flowLane>header small{white-space:normal}.OkhtbG_flowTrack{flex-direction:column;padding:10px}.OkhtbG_flowArchitectureNode{flex:none;width:100%;min-height:72px}.OkhtbG_flowConnector{place-content:center;width:100%;height:42px;padding:5px 0}.OkhtbG_flowConnector span{min-height:0}.OkhtbG_flowConnector i{justify-self:center;width:1px;height:18px}.OkhtbG_flowConnector i:after{top:auto;bottom:0;right:-3px;transform:rotate(135deg)}.OkhtbG_flowConnector[data-kind=worker] i{border-top:0;border-left:1px dashed color-mix(in srgb, #8b6ce7 72%, var(--mn-line));width:0;height:18px}.OkhtbG_flowConnector[data-active] i{width:2px;height:18px}.OkhtbG_flowConnector[data-active] i:before{animation:1.9s cubic-bezier(.35,0,.65,1) infinite OkhtbG_flowTraceVertical;top:0;left:-2px}.OkhtbG_flowConnector[data-kind=worker][data-active] i:before{top:0}}.OkhtbG_storageDomains{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;margin-bottom:13px;padding:16px}.OkhtbG_storageRoot{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 45%, transparent);border-radius:9px;justify-content:space-between;align-items:center;gap:18px;min-width:0;margin-top:12px;padding:11px 12px;display:flex}.OkhtbG_storageRoot>div:first-child{gap:4px;min-width:0;display:grid}.OkhtbG_storageRoot span,.OkhtbG_storageRoot small{color:var(--mn-faint);font-size:9px}.OkhtbG_storageRoot code{color:var(--mn-muted);text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.OkhtbG_storageRoot>div:last-child{flex:none;justify-items:end;gap:3px;display:grid}.OkhtbG_storageRoot strong{font:650 11px var(--mn-code)}.OkhtbG_storageAreaGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:8px;display:grid}.OkhtbG_storageAreaGrid article{box-sizing:border-box;border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 30%, var(--mn-layer-1));border-radius:9px;flex-direction:column;min-width:0;min-height:150px;padding:12px;display:flex}.OkhtbG_storageAreaGrid article>header{justify-content:space-between;align-items:center;gap:8px;display:flex}.OkhtbG_storageAreaGrid article>header>div{align-items:center;gap:7px;min-width:0;display:flex}.OkhtbG_storageAreaGrid article>header span{background:var(--mn-faint);border-radius:50%;flex:none;width:6px;height:6px}.OkhtbG_storageAreaGrid article[data-status=ready]>header span{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 9%, transparent)}.OkhtbG_storageAreaGrid article[data-status=invalid]>header span{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 9%, transparent)}.OkhtbG_storageAreaGrid article>header strong{text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.OkhtbG_storageAreaGrid article>header em{color:var(--mn-faint);font:normal 8px var(--mn-code);white-space:nowrap}.OkhtbG_storageAreaMetric{align-items:baseline;gap:5px;margin-top:14px;display:flex}.OkhtbG_storageAreaMetric strong{font:650 20px var(--mn-code)}.OkhtbG_storageAreaMetric span{color:var(--mn-faint);font-size:9px}.OkhtbG_storageAreaMetric code{color:var(--mn-muted);margin-left:auto;font-size:9px}.OkhtbG_storageAreaGrid article>p{min-height:28px;color:var(--mn-muted);margin:8px 0;font-size:9px;line-height:1.5}.OkhtbG_storagePath{border-top:1px solid var(--mn-line);color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;margin-top:auto;padding-top:8px;font-size:8px;display:block;overflow:hidden}.OkhtbG_storageAreaGrid article>small{color:var(--mn-danger);margin-top:6px;font-size:8px;line-height:1.4;display:block}.OkhtbG_storageUnavailable{border:1px dashed var(--mn-line);min-height:126px;color:var(--mn-muted);text-align:center;border-radius:9px;place-content:center;gap:5px;margin-top:12px;display:grid}.OkhtbG_storageUnavailable strong{font-size:12px}.OkhtbG_storageUnavailable p{max-width:520px;color:var(--mn-faint);margin:0;font-size:10px}.OkhtbG_storageFootnote{color:var(--mn-faint);margin:11px 0 0;font-size:9px;line-height:1.5}.OkhtbG_lifecyclePanel{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;margin-top:0;padding:16px}.OkhtbG_statusSectionHeader{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.OkhtbG_statusSectionHeader h3{margin:4px 0 0;font-size:15px}.OkhtbG_statusSectionHeader p{max-width:590px;color:var(--mn-muted);margin:5px 0 0;font-size:10px}.OkhtbG_phaseBadge{border:1px solid color-mix(in srgb, var(--mn-accent) 25%, var(--mn-line));color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 7%, transparent);font:650 9px var(--mn-code);border-radius:999px;padding:4px 8px}.OkhtbG_lifecycleFlow{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 52%, transparent);border-radius:9px;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:15px;display:grid;overflow:hidden}.OkhtbG_lifecycleFlow article{border-right:1px solid var(--mn-line);grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:8px;padding:12px;display:grid}.OkhtbG_lifecycleFlow article:last-child{border-right:0}.OkhtbG_lifecycleFlow article[data-disabled]{opacity:.48}.OkhtbG_lifecycleFlow article>span{color:var(--mn-accent);font:650 9px var(--mn-code)}.OkhtbG_lifecycleFlow strong{font-size:11px;display:block}.OkhtbG_lifecycleFlow p{color:var(--mn-faint);margin:4px 0 0;font-size:9px;line-height:1.45}.OkhtbG_lifecycleFlow code{color:var(--mn-muted);font-size:10px}.OkhtbG_lifecycleFoot{border-top:1px solid var(--mn-line);color:var(--mn-faint);flex-wrap:wrap;gap:8px 18px;margin-top:13px;padding-top:12px;font-size:9px;display:flex}.OkhtbG_lifecycleFoot strong{color:var(--mn-text);margin-left:3px;font-weight:600}.OkhtbG_runtimeBadge{font:650 9px var(--mn-code);border-radius:999px;padding:3px 7px}.OkhtbG_runtimeOnline{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 10%, transparent)}.OkhtbG_runtimeOffline{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 10%, transparent)}.OkhtbG_runtimePending{color:var(--mn-muted);background:var(--mn-layer-2)}@media (width<=1000px){.OkhtbG_graphLayout{display:block;position:relative}.OkhtbG_graphInspector{width:auto;min-height:0;box-shadow:none;margin-top:10px;position:static;overflow:visible}.OkhtbG_graphInspector[data-empty]{display:none}.OkhtbG_resultLayout{grid-template-columns:1fr}.OkhtbG_relatedPane{grid-row:1;max-height:none;position:static}.OkhtbG_memoryList{grid-template-columns:1fr}.OkhtbG_storageAreaGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.OkhtbG_runtimeGrid{grid-template-columns:1fr}.OkhtbG_documentWorkspace{grid-template-columns:minmax(220px,270px) minmax(0,1fr)}.OkhtbG_documentDetail>dl{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=760px){.OkhtbG_shell{min-height:500px;overflow:visible}.OkhtbG_masthead{grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;min-height:76px;padding:10px 14px}.OkhtbG_brandLogo{width:36px;height:36px}.OkhtbG_statusCluster>span:not(.OkhtbG_statusDot){display:none}.OkhtbG_telemetry{border-top:1px solid var(--mn-line);grid-column:1/-1;justify-content:space-between;padding-top:8px}.OkhtbG_telemetryMetric{text-align:center;flex:1;justify-items:center;gap:3px;min-width:0;padding:0 5px}.OkhtbG_telemetryMetric:first-child{border-left:0}.OkhtbG_topNavigation{padding:0 10px;position:relative}.OkhtbG_topNavigation:after{z-index:2;pointer-events:none;content:\"›\";width:34px;color:var(--mn-faint);background:linear-gradient(90deg, transparent, var(--mn-layer-1) 72%);font:16px var(--mn-code);place-items:center end;padding-right:5px;display:grid;position:absolute;top:0;bottom:0;right:0}.OkhtbG_nav{flex:1;padding-right:26px;scroll-padding-inline:10px 34px}.OkhtbG_navGroup{gap:3px}.OkhtbG_navGroupDivider{height:18px}.OkhtbG_nav button{text-align:center;flex-direction:column;justify-content:center;gap:3px;min-width:60px;padding:4px 3px}.OkhtbG_spaceSummary{display:none}.OkhtbG_navGlyph{line-height:1}.OkhtbG_page{padding:18px 13px calc(170px + env(safe-area-inset-bottom,0px))}.OkhtbG_pageHeader{gap:10px;display:grid}.OkhtbG_pageHeaderMeta{justify-content:space-between}.OkhtbG_entityLayout,.OkhtbG_writebackLayout{grid-template-columns:1fr}.OkhtbG_runtimeComposerHeading,.OkhtbG_runtimeComposerActions{flex-direction:column;align-items:stretch}.OkhtbG_runtimeComposerActions select,.OkhtbG_runtimeComposerActions button{width:100%}.OkhtbG_documentSummary{grid-template-columns:repeat(2,minmax(0,1fr))}.OkhtbG_documentCapacity{grid-column:1/-1}.OkhtbG_documentToolbar{flex-direction:column;align-items:stretch}.OkhtbG_documentToolbar form{min-width:0}.OkhtbG_documentToolbar>div,.OkhtbG_documentToolbar>button{width:100%}.OkhtbG_documentToolbar>div button{flex:1}.OkhtbG_documentWorkspace{grid-template-columns:1fr;min-height:0}.OkhtbG_documentList{-webkit-overflow-scrolling:touch;max-height:330px;overflow:auto}.OkhtbG_documentReader{min-height:430px}.OkhtbG_documentEditorMeta{grid-template-columns:1fr}.OkhtbG_manualActions{flex-direction:column;align-items:stretch}.OkhtbG_entityRail{position:static}.OkhtbG_searchControls{grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.OkhtbG_searchActions{grid-column:1/-1}.OkhtbG_searchActions>button{flex:1}.OkhtbG_searchControls select{width:100%;min-width:0}.OkhtbG_listToolbar{grid-template-columns:1fr}.OkhtbG_bodyDirectoryHeader{display:grid}.OkhtbG_bodyCreate form{grid-template-columns:1fr}.OkhtbG_graphViewport{min-height:360px}.OkhtbG_graphSvg{height:390px}.OkhtbG_graphCanvasControls{top:7px;right:7px}.OkhtbG_graphCanvasControls span{display:none}.OkhtbG_previewOverlay{padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}.OkhtbG_previewDialog{max-height:min(84dvh,640px)}.OkhtbG_healthStrip,.OkhtbG_lifecycleFlow{grid-template-columns:1fr}.OkhtbG_storageRoot{flex-direction:column;align-items:flex-start}.OkhtbG_storageRoot>div:last-child{justify-items:start}.OkhtbG_storageAreaGrid{grid-template-columns:1fr}.OkhtbG_flowLegend span:last-child{width:100%;margin-left:0}.OkhtbG_healthStrip article,.OkhtbG_lifecycleFlow article{border-right:0;border-bottom:1px solid var(--mn-line)}.OkhtbG_healthStrip article:last-child,.OkhtbG_lifecycleFlow article:last-child{border-bottom:0}}@media (width<=520px){.OkhtbG_masthead{min-height:68px}.OkhtbG_brand h1{font-size:16px}.OkhtbG_telemetryMetric span{font-size:10px}.OkhtbG_nav{scroll-snap-type:x proximity}.OkhtbG_nav button{scroll-snap-align:start;min-width:68px}.OkhtbG_pageHeader h2{font-size:19px}.OkhtbG_pageHeaderMeta{flex-wrap:wrap;align-items:stretch}.OkhtbG_pageHeaderMeta>code{align-items:center;min-height:34px;display:flex}.OkhtbG_pageHeaderMeta>button{flex:1}.OkhtbG_emptyState{text-align:center;flex-direction:column;gap:14px;min-height:190px;padding:24px 18px}.OkhtbG_emptyGlyph{width:62px;height:62px}.OkhtbG_documentDetail>header,.OkhtbG_documentDanger,.OkhtbG_supervisedHeading,.OkhtbG_cardTop{flex-direction:column;align-items:flex-start}.OkhtbG_documentDetail>header>div:last-child,.OkhtbG_documentDetail>header button{width:100%}.OkhtbG_documentDanger>div,.OkhtbG_documentDanger>span{margin-right:0}.OkhtbG_documentDanger>button{width:100%}.OkhtbG_documentDetail>dl{grid-template-columns:1fr}.OkhtbG_markdownBody{padding:16px;font-size:12.5px}.OkhtbG_cardActions,.OkhtbG_confirmBar{flex-wrap:wrap;align-items:stretch}.OkhtbG_cardActions button{flex:1}.OkhtbG_confirmBar>span{width:100%;margin:0 0 4px}.OkhtbG_formActions{flex-direction:column;align-items:stretch}.OkhtbG_formActions button{width:100%}.OkhtbG_formGrid,.OkhtbG_searchControls{grid-template-columns:1fr}}@media (width<=1000px) and (height<=760px){.OkhtbG_shell{min-height:0}.OkhtbG_masthead{min-height:58px}.OkhtbG_telemetryMetric{min-width:0;padding:1px 9px}.OkhtbG_topNavigation{min-height:44px}.OkhtbG_nav button{min-height:42px}.OkhtbG_graphViewport{min-height:300px}.OkhtbG_graphSvg{height:300px}}@media (width<=760px) and (pointer:coarse){.OkhtbG_shell input,.OkhtbG_shell select,.OkhtbG_shell textarea{font-size:16px!important}}@media (prefers-reduced-motion:reduce){.OkhtbG_shell *,.OkhtbG_shell :before,.OkhtbG_shell :after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}.OkhtbG_insightCard:hover{transform:none}.OkhtbG_flowConnector[data-active] i:before{display:none}}";
		const tagId$3 = "dsh-mnemon/MnemonView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var MnemonView_module_css_default = {
			"supervisedForm": "OkhtbG_supervisedForm",
			"flowReviewTrack": "OkhtbG_flowReviewTrack",
			"navGroup": "OkhtbG_navGroup",
			"inspectorEmpty": "OkhtbG_inspectorEmpty",
			"insightCard": "OkhtbG_insightCard",
			"cardActions": "OkhtbG_cardActions",
			"inspectorHeading": "OkhtbG_inspectorHeading",
			"alert": "OkhtbG_alert",
			"telemetry": "OkhtbG_telemetry",
			"pageHeaderMeta": "OkhtbG_pageHeaderMeta",
			"emptyGlyph": "OkhtbG_emptyGlyph",
			"graphPanel": "OkhtbG_graphPanel",
			"inspectorEye": "OkhtbG_inspectorEye",
			"runtimeTarget": "OkhtbG_runtimeTarget",
			"manualForm": "OkhtbG_manualForm",
			"healthMuted": "OkhtbG_healthMuted",
			"writeGuide": "OkhtbG_writeGuide",
			"memoryFlowCanvas": "OkhtbG_memoryFlowCanvas",
			"flowLegend": "OkhtbG_flowLegend",
			"phaseBadge": "OkhtbG_phaseBadge",
			"agentAnswer": "OkhtbG_agentAnswer",
			"loading": "OkhtbG_loading",
			"bodyCard": "OkhtbG_bodyCard",
			"offline": "OkhtbG_offline",
			"graphBackdrop": "OkhtbG_graphBackdrop",
			"queryField": "OkhtbG_queryField",
			"pageHeader": "OkhtbG_pageHeader",
			"canvas": "OkhtbG_canvas",
			"graphLayout": "OkhtbG_graphLayout",
			"advancedWrite": "OkhtbG_advancedWrite",
			"flowArchitecture": "OkhtbG_flowArchitecture",
			"iconButton": "OkhtbG_iconButton",
			"brand": "OkhtbG_brand",
			"graphFooter": "OkhtbG_graphFooter",
			"inspectorTitleRow": "OkhtbG_inspectorTitleRow",
			"resultLayout": "OkhtbG_resultLayout",
			"writebackLayout": "OkhtbG_writebackLayout",
			"healthGood": "OkhtbG_healthGood",
			"supervisedHeading": "OkhtbG_supervisedHeading",
			"runtimeEntries": "OkhtbG_runtimeEntries",
			"previewMeta": "OkhtbG_previewMeta",
			"lifecyclePanel": "OkhtbG_lifecyclePanel",
			"masthead": "OkhtbG_masthead",
			"nodeBodyLabel": "OkhtbG_nodeBodyLabel",
			"content": "OkhtbG_content",
			"flowTraceVertical": "OkhtbG_flowTraceVertical",
			"listToolbar": "OkhtbG_listToolbar",
			"inspectorLogo": "OkhtbG_inspectorLogo",
			"online": "OkhtbG_online",
			"memoryFlow": "OkhtbG_memoryFlow",
			"runtimeEntryMeta": "OkhtbG_runtimeEntryMeta",
			"capacityLine": "OkhtbG_capacityLine",
			"bodyHealth": "OkhtbG_bodyHealth",
			"cardTop": "OkhtbG_cardTop",
			"shell": "OkhtbG_shell",
			"bodyCreate": "OkhtbG_bodyCreate",
			"previewDialog": "OkhtbG_previewDialog",
			"previewHeading": "OkhtbG_previewHeading",
			"bodyCardTop": "OkhtbG_bodyCardTop",
			"relatedPane": "OkhtbG_relatedPane",
			"graphCanvasControls": "OkhtbG_graphCanvasControls",
			"runtimeGrid": "OkhtbG_runtimeGrid",
			"cardKicker": "OkhtbG_cardKicker",
			"documentCapacity": "OkhtbG_documentCapacity",
			"documentToolbar": "OkhtbG_documentToolbar",
			"documentArchiveReceipt": "OkhtbG_documentArchiveReceipt",
			"nodeLabel": "OkhtbG_nodeLabel",
			"bodyDirectoryEmpty": "OkhtbG_bodyDirectoryEmpty",
			"bodyEditButton": "OkhtbG_bodyEditButton",
			"graphSvg": "OkhtbG_graphSvg",
			"searchControls": "OkhtbG_searchControls",
			"runtimeComposer": "OkhtbG_runtimeComposer",
			"flowArchitectureNode": "OkhtbG_flowArchitectureNode",
			"runtimeComposerActions": "OkhtbG_runtimeComposerActions",
			"healthIndicator": "OkhtbG_healthIndicator",
			"healthBad": "OkhtbG_healthBad",
			"mnemon-flow": "OkhtbG_mnemon-flow",
			"inspectorTitle": "OkhtbG_inspectorTitle",
			"inspectorMeta": "OkhtbG_inspectorMeta",
			"markdownBody": "OkhtbG_markdownBody",
			"badges": "OkhtbG_badges",
			"formGrid": "OkhtbG_formGrid",
			"runtimeNotice": "OkhtbG_runtimeNotice",
			"supervisedComposer": "OkhtbG_supervisedComposer",
			"sessionMissing": "OkhtbG_sessionMissing",
			"storageAreaGrid": "OkhtbG_storageAreaGrid",
			"runtimeComposerHeading": "OkhtbG_runtimeComposerHeading",
			"runtimeFootnote": "OkhtbG_runtimeFootnote",
			"flowLane": "OkhtbG_flowLane",
			"listNotice": "OkhtbG_listNotice",
			"storageFootnote": "OkhtbG_storageFootnote",
			"ghostButton": "OkhtbG_ghostButton",
			"runtimeEntry": "OkhtbG_runtimeEntry",
			"storageDomains": "OkhtbG_storageDomains",
			"statusSectionHeader": "OkhtbG_statusSectionHeader",
			"runtimeBadge": "OkhtbG_runtimeBadge",
			"id": "OkhtbG_id",
			"bodyEditActions": "OkhtbG_bodyEditActions",
			"graphViewport": "OkhtbG_graphViewport",
			"searchActions": "OkhtbG_searchActions",
			"fieldWide": "OkhtbG_fieldWide",
			"storageRoot": "OkhtbG_storageRoot",
			"primaryButton": "OkhtbG_primaryButton",
			"graphLegend": "OkhtbG_graphLegend",
			"graphGridLine": "OkhtbG_graphGridLine",
			"badge": "OkhtbG_badge",
			"healthStrip": "OkhtbG_healthStrip",
			"runtimeOffline": "OkhtbG_runtimeOffline",
			"entityLayout": "OkhtbG_entityLayout",
			"loadingPanel": "OkhtbG_loadingPanel",
			"workspace": "OkhtbG_workspace",
			"runtimeReadOnly": "OkhtbG_runtimeReadOnly",
			"flowConnector": "OkhtbG_flowConnector",
			"singleColumn": "OkhtbG_singleColumn",
			"runtimeEmpty": "OkhtbG_runtimeEmpty",
			"sectionHeading": "OkhtbG_sectionHeading",
			"flowArchitectureSignal": "OkhtbG_flowArchitectureSignal",
			"results": "OkhtbG_results",
			"documentList": "OkhtbG_documentList",
			"confirmBar": "OkhtbG_confirmBar",
			"nodeHalo": "OkhtbG_nodeHalo",
			"storageAreaMetric": "OkhtbG_storageAreaMetric",
			"muted": "OkhtbG_muted",
			"dangerSolidButton": "OkhtbG_dangerSolidButton",
			"agentAnswerHeading": "OkhtbG_agentAnswerHeading",
			"storageUnavailable": "OkhtbG_storageUnavailable",
			"navGroupDivider": "OkhtbG_navGroupDivider",
			"statusCluster": "OkhtbG_statusCluster",
			"entityRail": "OkhtbG_entityRail",
			"runtimeTargetDescription": "OkhtbG_runtimeTargetDescription",
			"bodyDirectoryHeader": "OkhtbG_bodyDirectoryHeader",
			"bodyCardActions": "OkhtbG_bodyCardActions",
			"graphEdge": "OkhtbG_graphEdge",
			"searchBar": "OkhtbG_searchBar",
			"graphToolbar": "OkhtbG_graphToolbar",
			"previewBody": "OkhtbG_previewBody",
			"listProgress": "OkhtbG_listProgress",
			"flowTrace": "OkhtbG_flowTrace",
			"liveDot": "OkhtbG_liveDot",
			"sessionReady": "OkhtbG_sessionReady",
			"manualActions": "OkhtbG_manualActions",
			"sessionHint": "OkhtbG_sessionHint",
			"documentSources": "OkhtbG_documentSources",
			"documentSummary": "OkhtbG_documentSummary",
			"previewOverlay": "OkhtbG_previewOverlay",
			"documentDetail": "OkhtbG_documentDetail",
			"nav": "OkhtbG_nav",
			"flowTrack": "OkhtbG_flowTrack",
			"nodeCore": "OkhtbG_nodeCore",
			"bodyGrid": "OkhtbG_bodyGrid",
			"bodyDirectoryPath": "OkhtbG_bodyDirectoryPath",
			"tags": "OkhtbG_tags",
			"bodyEdit": "OkhtbG_bodyEdit",
			"graphInspector": "OkhtbG_graphInspector",
			"bodySignal": "OkhtbG_bodySignal",
			"page": "OkhtbG_page",
			"brandLogo": "OkhtbG_brandLogo",
			"dangerButton": "OkhtbG_dangerButton",
			"memoryList": "OkhtbG_memoryList",
			"bodySwitch": "OkhtbG_bodySwitch",
			"secondaryButton": "OkhtbG_secondaryButton",
			"graphNode": "OkhtbG_graphNode",
			"navGlyph": "OkhtbG_navGlyph",
			"bodyDirectory": "OkhtbG_bodyDirectory",
			"bodySwitchTrack": "OkhtbG_bodySwitchTrack",
			"inspectorActions": "OkhtbG_inspectorActions",
			"documentWorkspace": "OkhtbG_documentWorkspace",
			"documentReader": "OkhtbG_documentReader",
			"entitySearch": "OkhtbG_entitySearch",
			"runtimeTargetHeader": "OkhtbG_runtimeTargetHeader",
			"statusDot": "OkhtbG_statusDot",
			"documentListEmpty": "OkhtbG_documentListEmpty",
			"documentEditorMeta": "OkhtbG_documentEditorMeta",
			"categoryChip": "OkhtbG_categoryChip",
			"entityResults": "OkhtbG_entityResults",
			"documentEditor": "OkhtbG_documentEditor",
			"relatedSource": "OkhtbG_relatedSource",
			"formActions": "OkhtbG_formActions",
			"checking": "OkhtbG_checking",
			"flowArchiveTrack": "OkhtbG_flowArchiveTrack",
			"lifecycleFoot": "OkhtbG_lifecycleFoot",
			"entityHeading": "OkhtbG_entityHeading",
			"lifecycleFlow": "OkhtbG_lifecycleFlow",
			"spaceSummary": "OkhtbG_spaceSummary",
			"emptyState": "OkhtbG_emptyState",
			"agentCitations": "OkhtbG_agentCitations",
			"entities": "OkhtbG_entities",
			"runtimePending": "OkhtbG_runtimePending",
			"documentDanger": "OkhtbG_documentDanger",
			"flowSecondaryTrack": "OkhtbG_flowSecondaryTrack",
			"storagePath": "OkhtbG_storagePath",
			"inlineError": "OkhtbG_inlineError",
			"topNavigation": "OkhtbG_topNavigation",
			"entityList": "OkhtbG_entityList",
			"runtimeOnline": "OkhtbG_runtimeOnline",
			"telemetryMetric": "OkhtbG_telemetryMetric"
		};
		//#endregion
		//#region src/client/MnemonView.tsx
		/** 系统 → 三层存储 → 读写工具；组间以分隔线呈现。 */
		const PAGE_NAV = [
			{
				aria: "nav.group.system",
				entries: [{
					id: "status",
					label: "nav.status",
					detail: "nav.status.detail",
					glyph: "⌘"
				}]
			},
			{
				aria: "nav.group.storage",
				entries: [
					{
						id: "runtime",
						label: "nav.runtime",
						detail: "nav.runtime.detail",
						glyph: "◫"
					},
					{
						id: "overview",
						label: "nav.bodies",
						detail: "nav.bodies.detail",
						glyph: "◇"
					},
					{
						id: "documents",
						label: "nav.documents",
						detail: "nav.documents.detail",
						glyph: "▤"
					}
				]
			},
			{
				aria: "nav.group.tools",
				entries: [
					{
						id: "remember",
						label: "nav.remember",
						detail: "nav.remember.detail",
						glyph: "+"
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
						id: "list",
						label: "nav.content",
						detail: "nav.content.detail",
						glyph: "≡"
					}
				]
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
		/** Full-text popup for a selected graph node whose inspector preview is clamped. */
		function ContentPreview(props) {
			const t = useT();
			const close = (0, react.useCallback)(() => props.onClose(), [props]);
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if (event.key === "Escape") props.onClose();
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [props]);
			const meta = [
				props.kind,
				props.node.id,
				props.node.memoryBodyName
			].filter((entry) => entry !== void 0).join(" · ");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: MnemonView_module_css_default.previewOverlay,
				onPointerDown: (event) => {
					if (event.target === event.currentTarget) props.onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonView_module_css_default.previewDialog,
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("overview.previewTitle"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: MnemonView_module_css_default.previewHeading,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.previewTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: close,
								"aria-label": t("common.cancel"),
								children: "×"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonView_module_css_default.previewMeta,
							children: meta
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonView_module_css_default.previewBody,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: props.node.content })
						})
					]
				})
			});
		}
		const SAFE_LINK_PATTERN = /^(?:https?:|mailto:|#|\/)/iu;
		function safeLink(href) {
			if (href == null) return void 0;
			const value = href.trim();
			return SAFE_LINK_PATTERN.test(value) ? value : void 0;
		}
		/** Render managed Markdown without raw HTML and with a deliberately small link surface. */
		function DocumentMarkdown(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: MnemonView_module_css_default.markdownBody,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(index_module_default, {
					options: {
						disableParsingRawHTML: true,
						forceBlock: true,
						overrides: { a: { component: ({ href, children, ...rest }) => {
							const target = safeLink(href);
							return target === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								...rest,
								href: target,
								target: target.startsWith("http") ? "_blank" : void 0,
								rel: target.startsWith("http") ? "noreferrer noopener" : void 0,
								children
							});
						} } }
					},
					children: props.content
				})
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
			const [editingBody, setEditingBody] = (0, react.useState)(null);
			const [editName, setEditName] = (0, react.useState)("");
			const [editDescription, setEditDescription] = (0, react.useState)("");
			const [savingBody, setSavingBody] = (0, react.useState)(null);
			const [preview, setPreview] = (0, react.useState)(null);
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
			const beginEdit = (body) => {
				setEditingBody(body.id);
				setEditName(body.name);
				setEditDescription(body.description ?? "");
				setError(null);
			};
			const saveEdit = async (event, body) => {
				event.preventDefault();
				if (editName.trim() === "") return;
				setSavingBody(body.id);
				setError(null);
				try {
					await props.client.updateBody(body.id, {
						name: editName,
						description: editDescription
					});
					setEditingBody(null);
					await load(true);
					props.onMutate();
				} catch (reason) {
					setError(message(reason));
				} finally {
					setSavingBody(null);
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
								children: [catalog?.items.map((body) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("article", {
									className: MnemonView_module_css_default.bodyCard,
									"data-active": body.active || void 0,
									"data-healthy": body.healthy || void 0,
									"data-editing": editingBody === body.id || void 0,
									title: body.error,
									children: editingBody === body.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
										className: MnemonView_module_css_default.bodyEdit,
										onSubmit: (event) => void saveEdit(event, body),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("overview.editName"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												"aria-label": t("overview.editName"),
												value: editName,
												onChange: (event) => setEditName(event.target.value),
												maxLength: 100,
												required: true
											})] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("overview.editDescription"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
												"aria-label": t("overview.editDescription"),
												value: editDescription,
												onChange: (event) => setEditDescription(event.target.value),
												rows: 3,
												maxLength: 1e3
											})] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: MnemonView_module_css_default.bodyEditActions,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "submit",
													className: MnemonView_module_css_default.primaryButton,
													disabled: savingBody === body.id || editName.trim() === "",
													children: savingBody === body.id ? t("overview.savingBody") : t("overview.saveBody")
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: MnemonView_module_css_default.ghostButton,
													onClick: () => setEditingBody(null),
													children: t("common.cancel")
												})]
											})
										]
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
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
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: MnemonView_module_css_default.bodyCardActions,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
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
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: MnemonView_module_css_default.bodyEditButton,
														"aria-label": t("overview.editBodyAria", { name: body.name }),
														title: t("overview.editBody"),
														disabled: !props.writeEnabled,
														onClick: () => beginEdit(body),
														children: "✎"
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: body.description || t("overview.noDescription") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("common.memories", { count: body.stats?.totalInsights ?? 0 }) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("common.edges", { count: body.stats?.edgeCount ?? 0 }) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: humanBytes(body.stats?.dbSizeBytes ?? 0) })
										] })
									] })
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.inspectorTitleRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										className: MnemonView_module_css_default.inspectorTitle,
										children: selected.content
									}), selectedKind === "memory" && selected.content.length > 140 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.inspectorEye,
										onClick: () => setPreview(selected),
										"aria-label": t("overview.previewAria"),
										title: t("overview.previewAria"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
											viewBox: "0 0 16 16",
											width: "13",
											height: "13",
											"aria-hidden": "true",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
												d: "M1 8s2.6-4.4 7-4.4S15 8 15 8s-2.6 4.4-7 4.4S1 8 1 8z",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "1.5"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
												cx: "8",
												cy: "8",
												r: "2.1",
												fill: "currentColor"
											})]
										})
									})]
								}),
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
					}),
					preview !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ContentPreview, {
						node: preview,
						kind: graphKindLabel(t, preview),
						onClose: () => setPreview(null)
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
				if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(() => document.getElementById("mnemon-related-pane")?.scrollIntoView({
					block: "nearest",
					behavior: "smooth"
				}));
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
							id: "mnemon-related-pane",
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
			const PAGE_SIZE = 48;
			const t = useT();
			const [query, setQuery] = (0, react.useState)("");
			const [category, setCategory] = (0, react.useState)("");
			const [view, setView] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [visibleLimit, setVisibleLimit] = (0, react.useState)(PAGE_SIZE);
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
				setVisibleLimit(PAGE_SIZE);
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
			const visibleItems = view?.items.slice(0, visibleLimit) ?? [];
			const remaining = Math.max(0, (view?.items.length ?? 0) - visibleItems.length);
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
						children: visibleItems.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
							insight,
							writeEnabled: props.writeEnabled,
							onForget: forget,
							onClone: props.onClone,
							onRelated: () => props.onExplore(insight.content)
						}, insightKey(insight)))
					}),
					view !== null && view.items.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.listProgress,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("content.showing", {
							visible: visibleItems.length,
							total: view.items.length
						}) }), remaining > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							onClick: () => setVisibleLimit((value) => value + PAGE_SIZE),
							children: t("content.showMore", { count: Math.min(PAGE_SIZE, remaining) })
						})]
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
				setSelected(null);
				if (selectedId === null) return;
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
										setSelected(null);
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DocumentMarkdown, { content: selected.content }),
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
			const runtimeArea = selectedScope?.areas.find((area) => area.kind === "runtime");
			const runtimeUserEntries = runtimeArea === void 0 ? 0 : Number(runtimeArea.details.userEntries ?? 0);
			const runtimeMemoryEntries = runtimeArea === void 0 ? 0 : Number(runtimeArea.details.memoryEntries ?? 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						title: t("status.title"),
						description: t("status.description"),
						meta: status === null && props.loading ? t("common.loading") : status?.healthy === true && lifecycle?.sessionAvailable === true ? t("status.nominal") : t("status.checkRequired"),
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							disabled: props.loading,
							onClick: props.onRefresh,
							children: props.loading ? t("status.rechecking") : t("status.recheck")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.healthStrip,
						"aria-label": t("status.aria"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${status === null ? MnemonView_module_css_default.healthMuted : status.healthy ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthBad}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.engine") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: status === null ? t("status.engineChecking") : status.healthy ? t("status.engineConnected") : t("status.engineUnavailable") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: status?.version === void 0 ? t("status.versionWaiting") : `CLI ${status.version}` })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${runtimeArea === void 0 ? MnemonView_module_css_default.healthMuted : runtimeArea.status === "invalid" ? MnemonView_module_css_default.healthBad : MnemonView_module_css_default.healthGood}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.runtime") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: runtimeArea === void 0 ? t("status.runtimeWaiting") : t("status.runtimeRatio", {
									user: runtimeUserEntries,
									memory: runtimeMemoryEntries
								}) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: runtimeArea === void 0 ? t("status.runtimeWaitingDetail") : t("status.runtimeBytes", { bytes: humanBytes(runtimeArea.bytes) }) })
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${lifecycle === void 0 ? MnemonView_module_css_default.healthMuted : lifecycle.sessionAvailable ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthBad}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.router") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: lifecycle === void 0 ? t("status.routerChecking") : lifecycle.sessionAvailable ? t("status.routerReady") : t("status.sessionMissing") }),
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
			const activeScope = status?.storage?.scopes.find((scope) => scope.active);
			const runtime = activeScope?.areas.find((area) => area.kind === "runtime");
			const documentArea = activeScope?.areas.find((area) => area.kind === "documents");
			const documents = status?.documents;
			const bodies = status?.memoryBodies ?? [];
			const activeBodies = bodies.filter((body) => body.active).length;
			const score = status?.lifecycle?.current?.reviewActivity?.score ?? 0;
			const threshold = status?.lifecycle?.current?.reviewActivity?.threshold ?? QODERWORK_REVIEW_POLICY.reviewThreshold;
			const idleSeconds = Math.round((status?.lifecycle?.idleReviewMs ?? 3e4) / 1e3);
			const hostReady = status?.lifecycle?.sessionAvailable === true;
			const flowActive = status?.healthy === true && hostReady;
			const areaState = (area) => area?.status === "invalid" ? "error" : area?.status === "ready" ? "ready" : "idle";
			const current = status?.lifecycle?.current;
			const lastWorkerOperation = (status?.lifecycle?.subagents)?.lastOperation;
			const spawnRecent = lastWorkerOperation !== void 0 && lastWorkerOperation !== "review";
			const archiveRecent = lastWorkerOperation === "document-archive" || lastWorkerOperation === "migration";
			const reviewState = current?.reviewRunning === true ? "running" : current?.idleReviewPending === true ? "pending" : "idle";
			const rootRunning = current?.status === "running";
			const semanticActive = rootRunning && (current?.lastPhase === "recall" || current?.lastPhase === "supervised");
			const runtimeCount = runtime?.itemCount ?? 0;
			const insights = status?.stats?.totalInsights ?? 0;
			const flowNode = (title, meta, state = "idle", kind = "host", emphasis) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: MnemonView_module_css_default.flowArchitectureNode,
				"data-state": state,
				"data-kind": kind,
				"data-emphasis": emphasis,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: MnemonView_module_css_default.flowArchitectureSignal,
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: meta })] })]
			});
			const connector = (label, kind = "host", active = false) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.flowConnector,
				"data-kind": kind,
				"data-active": active || void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" })]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: MnemonView_module_css_default.memoryFlow,
				"aria-label": t("status.flowTitle"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.statusSectionHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("status.flowTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("status.flowDescription") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${MnemonView_module_css_default.runtimeBadge} ${status === null ? MnemonView_module_css_default.runtimePending : flowActive ? MnemonView_module_css_default.runtimeOnline : MnemonView_module_css_default.runtimeOffline}`,
							children: status === null ? t("common.loading") : flowActive ? t("status.flowLive") : t("status.flowDegraded")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.memoryFlowCanvas,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.flowArchitecture,
							role: "img",
							"aria-label": `${t("status.flowTitle")}：${t("status.flowDescription")}`,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: MnemonView_module_css_default.flowLane,
									"data-lane": "context",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "01" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.flowLaneContext") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.flowLaneContextDetail") })] })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.flowTrack,
											children: [
												flowNode(t("status.storageRuntime"), t("status.flowRuntimeMeta", { count: runtimeCount }), areaState(runtime), "store"),
												connector(t("status.flowPromptAssembly"), "host"),
												flowNode(t("status.flowSupervisor"), t("status.flowRootMeta"), hostReady ? "ready" : "idle", "host", rootRunning ? "active" : void 0),
												connector("↔", "host", rootRunning),
												flowNode(t("status.flowConversation"), t("status.flowTurns"), hostReady ? "ready" : "idle", "task")
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: `${MnemonView_module_css_default.flowTrack} ${MnemonView_module_css_default.flowSecondaryTrack}`,
											children: [
												flowNode(t("status.flowSupervisor"), t("status.flowRootMeta"), hostReady ? "ready" : "idle", "host"),
												connector(t("status.flowOnDemand"), "host"),
												flowNode(t("status.flowDocumentSearch"), t("status.flowOnDemand"), areaState(documentArea), "host"),
												connector("→", "host"),
												flowNode(t("status.storageDocuments"), t("status.flowDocuments", {
													active: documents?.activeCount ?? 0,
													archived: documents?.archivedCount ?? 0
												}), areaState(documentArea), "store"),
												connector("↩", "host"),
												flowNode(t("status.flowContext"), t("status.flowEvidenceMeta"), hostReady ? "ready" : "idle", "task")
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: MnemonView_module_css_default.flowLane,
									"data-lane": "semantic",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "02" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.flowLaneSemantic") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.flowLaneSemanticDetail") })] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.flowTrack,
										children: [
											flowNode(t("status.flowSupervisor"), t("status.flowSemanticRequest"), hostReady ? "ready" : "idle", "task"),
											connector("→", "worker", semanticActive),
											flowNode(t("status.flowSpawnWorker"), `${t("status.flowSpawnMeta")}${spawnRecent ? ` · ${t("status.flowRecent")}` : ""}`, hostReady ? "ready" : "idle", "worker", semanticActive ? "active" : spawnRecent ? "recent" : void 0),
											connector("→", "worker", semanticActive),
											flowNode(t("status.flowHostBridge"), t("status.flowHostBridgeMeta"), status?.healthy === false ? "error" : status?.healthy === true ? "ready" : "idle", "host"),
											connector("↔", "host", semanticActive),
											flowNode(t("term.spaces"), t("status.flowSpacesMeta", {
												active: activeBodies,
												total: bodies.length,
												insights
											}), status?.healthy === false ? "error" : activeBodies > 0 ? "ready" : "idle", "store"),
											connector("↩", "host", semanticActive),
											flowNode(t("status.flowContext"), t("status.flowEvidenceMeta"), hostReady ? "ready" : "idle", "task")
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: MnemonView_module_css_default.flowLane,
									"data-lane": "maintenance",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "03" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("status.flowLaneMaintenance") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("status.flowLaneMaintenanceDetail") })] })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: `${MnemonView_module_css_default.flowTrack} ${MnemonView_module_css_default.flowMaintenanceTrack}`,
											children: [
												flowNode(t("status.flowDeterministicWrites"), t("status.flowDeterministicWritesMeta"), hostReady ? "ready" : "idle", "task"),
												connector("→", "host"),
												flowNode(t("status.flowControlPlane"), t("status.flowControlPlaneMeta"), areaState(runtime), "host"),
												connector("→", "host"),
												flowNode(t("status.storageRuntime"), t("status.storageDocuments"), areaState(documentArea), "store")
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: `${MnemonView_module_css_default.flowTrack} ${MnemonView_module_css_default.flowReviewTrack}`,
											children: [
												flowNode(t("status.flowReviewGate"), t("status.flowReviewGateMeta", {
													score,
													threshold,
													seconds: idleSeconds
												}), current?.reviewActivity?.eligible === true ? "ready" : "idle", "task", reviewState === "pending" ? "pending" : void 0),
												connector("→", "worker", reviewState === "running"),
												flowNode(t("status.flowForkReview"), t("status.flowForkReviewMeta", { state: props.reviewState }), current?.lastError === void 0 ? hostReady ? "ready" : "idle" : "error", "worker", reviewState === "running" ? "active" : reviewState === "pending" ? "pending" : void 0),
												connector("→", "host", reviewState === "running"),
												flowNode(t("status.flowReviewTargets"), t("status.flowReviewTargetsMeta"), areaState(documentArea), "host"),
												connector("↩", "host", reviewState === "running"),
												flowNode(t("status.flowContext"), t("status.flowEvidenceMeta"), hostReady ? "ready" : "idle", "task")
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: `${MnemonView_module_css_default.flowTrack} ${MnemonView_module_css_default.flowArchiveTrack}`,
											children: [
												flowNode(t("status.storageDocuments"), t("status.flowDocuments", {
													active: documents?.activeCount ?? 0,
													archived: documents?.archivedCount ?? 0
												}), areaState(documentArea), "store"),
												connector("→", "worker"),
												flowNode(t("status.flowColdArchive"), `${t("status.flowColdArchiveMeta")}${archiveRecent ? ` · ${t("status.flowRecent")}` : ""}`, hostReady ? "ready" : "idle", "worker", archiveRecent ? "recent" : void 0),
												connector("→", "worker"),
												flowNode(t("status.flowHostBridge"), t("status.flowHostBridgeMeta"), status?.healthy === false ? "error" : status?.healthy === true ? "ready" : "idle", "host"),
												connector("→", "host"),
												flowNode(t("status.flowIndexFirst"), t("term.spaces"), status?.healthy === false ? "error" : activeBodies > 0 ? "ready" : "idle", "store"),
												connector("→", "host"),
												flowNode(t("status.flowRevisionMove"), t("status.flowRevisionMoveMeta", { archived: documents?.archivedCount ?? 0 }), areaState(documentArea), "store")
											]
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {}), t("status.flowLegendRecent")] }),
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
			const [page, setPage] = (0, react.useState)("status");
			const canvasRef = (0, react.useRef)(null);
			/** Pages share one plugin-owned scroll container; never mutate DSH ancestor scrollports. */
			const resetViewportScroll = (0, react.useCallback)(() => {
				const canvas = canvasRef.current;
				if (canvas !== null) canvas.scrollTop = 0;
			}, []);
			(0, react.useEffect)(() => {
				resetViewportScroll();
			}, [page, resetViewportScroll]);
			(0, react.useEffect)(() => {
				const frame = window.requestAnimationFrame(() => resetViewportScroll());
				return () => window.cancelAnimationFrame(frame);
			}, [resetViewportScroll]);
			const [status, setStatus] = (0, react.useState)(null);
			const [statusLoading, setStatusLoading] = (0, react.useState)(true);
			const [statusError, setStatusError] = (0, react.useState)(null);
			const [revision, setRevision] = (0, react.useState)(0);
			const [searchSeed, setSearchSeed] = (0, react.useState)("");
			const [rememberSeed, setRememberSeed] = (0, react.useState)("");
			/** Conversation surfaces ask this view to open a page (optionally with a seed). */
			const applyAnchor = (0, react.useCallback)((anchor) => {
				if (anchor.seed !== void 0 && anchor.seed !== "") {
					if (anchor.page === "explore") setSearchSeed(anchor.seed);
					if (anchor.page === "remember") setRememberSeed(anchor.seed);
				}
				setPage(anchor.page);
			}, []);
			(0, react.useEffect)(() => {
				const held = consumeMnemonAnchor(sessionId);
				if (held !== null) applyAnchor(held);
				return subscribeMnemonAnchor(sessionId, applyAnchor);
			}, [sessionId, applyAnchor]);
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.statusDot} ${statusLoading && status === null ? MnemonView_module_css_default.checking : status?.healthy === true ? MnemonView_module_css_default.online : MnemonView_module_css_default.offline}` }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLoading ? t("header.checking") : status?.healthy === true ? catalogKnown ? t("header.connected", { count: activeBodies }) : t("header.directoryPending") : t("header.unavailable") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.iconButton,
										disabled: statusLoading,
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
								children: PAGE_NAV.map((group, groupIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.navGroup,
									role: "group",
									"aria-label": t(group.aria),
									children: group.entries.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-current": page === item.id ? "page" : void 0,
										onClick: () => setPage(item.id),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: MnemonView_module_css_default.navGlyph,
											"aria-hidden": "true",
											children: item.glyph
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t(item.label) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t(item.detail) })] })]
									}, item.id))
								}), groupIndex < PAGE_NAV.length - 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: MnemonView_module_css_default.navGroupDivider,
									"aria-hidden": "true"
								})] }, group.aria))
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
							ref: canvasRef,
							"data-testid": "mnemon-canvas",
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
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/omdsh-dev/dsh-mnemon/src/client/MnemonToolviews.module.css.mjs
		const css$2 = ".LRq0UW_root{min-width:0;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}.LRq0UW_row{cursor:pointer;border-radius:6px;align-items:center;gap:6px;height:24px;display:flex;position:relative}.LRq0UW_row:hover{background:var(--dsw-alias-interactive-bg-hover)}.LRq0UW_row:focus-visible{outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.LRq0UW_dot{border-radius:50%;flex:none;width:6px;height:6px}.LRq0UW_dotRunning{background:var(--dsw-alias-state-info-primary,#4f7cff);animation:1.4s ease-in-out infinite LRq0UW_mnemonToolPulse}.LRq0UW_dotOk{background:var(--dsw-alias-state-success-primary)}.LRq0UW_dotError{background:var(--dsw-alias-state-error-primary)}.LRq0UW_dotStopped{background:var(--dsw-alias-state-warn-primary)}@keyframes LRq0UW_mnemonToolPulse{0%,to{opacity:1}50%{opacity:.35}}@media (prefers-reduced-motion:reduce){.LRq0UW_dotRunning{animation:none}}.LRq0UW_leading{opacity:.85;border-radius:3px;flex:none;width:14px;height:14px}.LRq0UW_title{flex:none;font-size:12px;font-weight:500;line-height:16px}.LRq0UW_summary{white-space:nowrap;text-overflow:ellipsis;min-width:0;color:var(--dsw-alias-label-secondary);flex:auto;font-size:12px;line-height:16px;overflow:hidden}.LRq0UW_actions{opacity:0;flex:none;align-items:center;gap:4px;transition:opacity .12s;display:inline-flex}.LRq0UW_row:hover .LRq0UW_actions,.LRq0UW_row:focus-visible .LRq0UW_actions,.LRq0UW_root[data-open] .LRq0UW_actions{opacity:1}.LRq0UW_actionButton{cursor:pointer;height:20px;color:var(--dsw-alias-label-secondary);background:0 0;border:none;border-radius:5px;padding:0 8px;font-size:11px;line-height:20px}.LRq0UW_actionButton:hover{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.LRq0UW_chevron{opacity:.7;flex:none;width:12px;height:12px;transition:transform .12s}.LRq0UW_chevron:before{content:\"\";border-bottom:1.5px solid;border-right:1.5px solid;width:6px;height:6px;transition:transform .12s;display:block;transform:translate(2px,1px)rotate(45deg)}.LRq0UW_chevronOpen:before{transform:translate(2px,4px)rotate(-135deg)}.LRq0UW_details{border-left:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-markdown-code-block);cursor:default;border-radius:0 8px 8px 0;flex-direction:column;gap:6px;min-width:0;margin:2px 0 4px 26px;padding:8px 10px;display:flex}.LRq0UW_detailSection{min-width:0}.LRq0UW_detailLabel{color:var(--dsw-alias-label-caption);letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px;font-size:10px;font-weight:650;display:block}.LRq0UW_detailCode{white-space:pre-wrap;word-break:break-word;max-height:220px;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,Consolas, monospace);margin:0;font-size:11px;line-height:16px;overflow:auto}.LRq0UW_detailEmpty{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px}";
		const tagId$2 = "dsh-mnemon/MnemonToolviews.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var MnemonToolviews_module_css_default = {
			"summary": "LRq0UW_summary",
			"chevron": "LRq0UW_chevron",
			"detailLabel": "LRq0UW_detailLabel",
			"detailCode": "LRq0UW_detailCode",
			"dot": "LRq0UW_dot",
			"detailEmpty": "LRq0UW_detailEmpty",
			"detailSection": "LRq0UW_detailSection",
			"actions": "LRq0UW_actions",
			"row": "LRq0UW_row",
			"dotRunning": "LRq0UW_dotRunning",
			"details": "LRq0UW_details",
			"dotOk": "LRq0UW_dotOk",
			"actionButton": "LRq0UW_actionButton",
			"leading": "LRq0UW_leading",
			"dotError": "LRq0UW_dotError",
			"title": "LRq0UW_title",
			"chevronOpen": "LRq0UW_chevronOpen",
			"mnemonToolPulse": "LRq0UW_mnemonToolPulse",
			"dotStopped": "LRq0UW_dotStopped",
			"root": "LRq0UW_root"
		};
		//#endregion
		//#region src/client/MnemonToolviews.tsx
		const READ_TOOLS = /* @__PURE__ */ new Set([
			"mnemon_recall",
			"mnemon_related",
			"mnemon_document_search",
			"mnemon_status",
			"mnemon_memory_bodies"
		]);
		/** Anchor destination per tool: where "open in Memory view" should land. */
		const ANCHOR_TARGETS = {
			mnemon_recall: {
				page: "explore",
				seed: (args) => typeof args.query === "string" && args.query.trim() !== "" ? args.query.trim() : void 0
			},
			mnemon_related: {
				page: "explore",
				seed: (args) => typeof args.id === "string" && args.id.trim() !== "" ? args.id.trim() : void 0
			},
			mnemon_document_search: { page: "documents" },
			mnemon_status: { page: "status" },
			mnemon_memory_bodies: { page: "overview" },
			mnemon_runtime_memory: { page: "runtime" },
			mnemon_document_manage: { page: "documents" },
			mnemon_remember: { page: "overview" },
			mnemon_forget: { page: "overview" },
			mnemon_link: { page: "overview" },
			mnemon_memory_body_create: { page: "overview" },
			mnemon_memory_body_update: { page: "overview" },
			mnemon_memory_body_merge: { page: "overview" }
		};
		function isSettled(block) {
			return typeof block === "object" && block !== null && "kind" in block;
		}
		/** Parse the call's raw arguments JSON; always returns a plain object. */
		function argsOf(block) {
			const record = block;
			const raw = typeof record?.call?.argsRaw === "string" ? record.call.argsRaw : typeof record?.argsRaw === "string" ? record.argsRaw : "";
			if (raw === "") return {};
			try {
				const parsed = JSON.parse(raw);
				return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
			} catch {
				return {};
			}
		}
		/** Joined text blocks of a settled result; empty while running. */
		function resultText(block) {
			if (!isSettled(block)) return "";
			const content = block.content;
			if (!Array.isArray(content)) return "";
			return content.filter((item) => typeof item === "object" && item !== null && item.type === "text" && typeof item.text === "string").map((item) => String(item.text)).join("");
		}
		/** Parsed result JSON when the output is one object; otherwise null. */
		function outputJson(block) {
			const text = resultText(block);
			if (text === "") return null;
			try {
				const parsed = JSON.parse(text);
				return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : null;
			} catch {
				return null;
			}
		}
		function truncateInline(value, max) {
			const normalized = value.replace(/\s+/g, " ").trim();
			return normalized.length <= max ? normalized : `${normalized.slice(0, max)}…`;
		}
		function truncateBlock(value, max) {
			const normalized = value.trim();
			return normalized.length <= max ? normalized : `${normalized.slice(0, max)}\n…`;
		}
		function countOf(value) {
			return Array.isArray(value) ? value.length : void 0;
		}
		/** Tool-specific one-line summary from the call args and the settled output. */
		function summaryFor(toolName, args, out, t) {
			switch (toolName) {
				case "mnemon_recall": {
					const query = typeof args.query === "string" ? truncateInline(args.query, 56) : "";
					const hits = out === null ? void 0 : countOf(out.results);
					return hits === void 0 ? query : t("toolview.recallSummary", {
						query,
						count: hits
					});
				}
				case "mnemon_related": {
					const id = typeof args.id === "string" ? args.id : "";
					const hits = out === null ? void 0 : countOf(out.results);
					return hits === void 0 ? truncateInline(id, 56) : t("toolview.relatedSummary", {
						id: truncateInline(id, 28),
						count: hits
					});
				}
				case "mnemon_document_search": {
					const query = typeof args.query === "string" ? truncateInline(args.query, 56) : "";
					const hits = out === null ? void 0 : countOf(out.results);
					return hits === void 0 ? query : t("toolview.documentSearchSummary", {
						query,
						count: hits
					});
				}
				case "mnemon_status": return out === null ? t("toolview.running") : out.healthy === true ? t("toolview.statusHealthy") : t("toolview.statusUnhealthy");
				case "mnemon_memory_bodies": return out === null ? t("toolview.running") : t("toolview.bodiesSummary", {
					count: out.total ?? 0,
					active: out.activeCount ?? 0
				});
				case "mnemon_remember": return typeof args.content === "string" ? truncateInline(args.content, 56) : t("toolview.genericSummary");
				case "mnemon_runtime_memory": {
					const action = typeof args.action === "string" ? args.action : "";
					const target = typeof args.target === "string" ? args.target : "";
					const content = typeof args.content === "string" ? truncateInline(args.content, 40) : "";
					return content === "" ? t("toolview.runtimeSummary", {
						action,
						target
					}) : t("toolview.runtimeSummaryWithContent", {
						action,
						target,
						content
					});
				}
				case "mnemon_document_manage": {
					const action = typeof args.action === "string" ? args.action : "";
					const title = typeof args.title === "string" ? truncateInline(args.title, 40) : "";
					return title === "" ? t("toolview.documentManageSummary", { action }) : t("toolview.documentManageSummaryWithTitle", {
						action,
						title
					});
				}
				case "mnemon_link": return `${typeof args.sourceId === "string" ? truncateInline(args.sourceId, 18) : "?"} → ${typeof args.targetId === "string" ? truncateInline(args.targetId, 18) : "?"}`;
				case "mnemon_forget": return typeof args.id === "string" ? truncateInline(args.id, 56) : t("toolview.genericSummary");
				case "mnemon_memory_body_create": return typeof args.name === "string" ? truncateInline(args.name, 56) : t("toolview.genericSummary");
				case "mnemon_memory_body_update": {
					const id = typeof args.memoryBodyId === "string" ? truncateInline(args.memoryBodyId, 32) : "";
					return id === "" ? t("toolview.genericSummary") : t("toolview.bodyUpdateSummary", { id });
				}
				case "mnemon_memory_body_merge": return t("toolview.bodyMergeSummary", {
					target: typeof args.targetMemoryBodyId === "string" ? truncateInline(args.targetMemoryBodyId, 24) : "?",
					count: countOf(args.sourceMemoryBodyIds) ?? 0
				});
				default: return t("toolview.genericSummary");
			}
		}
		/** Render one mnemon_* tool call as a memory-flavoured row with expandable evidence. */
		const MnemonToolView = (0, react.memo)(function MnemonToolView({ toolName, block, inspect, sessionId, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const settled = isSettled(block);
			const record = block;
			const state = !settled ? "running" : record?.error?.code === "interrupted" ? "stopped" : record?.isError === true ? "error" : "ok";
			const args = (0, react.useMemo)(() => argsOf(block), [block]);
			const out = (0, react.useMemo)(() => outputJson(block), [block]);
			const text = (0, react.useMemo)(() => resultText(block), [block]);
			const title = READ_TOOLS.has(toolName) ? t("toolview.recallTitle") : t("toolview.writeTitle");
			const summary = summaryFor(toolName, args, out, t);
			const target = ANCHOR_TARGETS[toolName];
			const seed = target?.seed?.(args);
			const toggle = () => setOpen((value) => !value);
			const openView = (event) => {
				event.stopPropagation();
				if (target === void 0) return;
				dispatchMnemonAnchor({
					page: target.page,
					...seed === void 0 ? {} : { seed },
					...sessionId === void 0 ? {} : { sessionId }
				});
			};
			const inspectCall = (event) => {
				event.stopPropagation();
				inspect?.();
			};
			const showArgs = Object.keys(args).length > 0;
			const showResult = text !== "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonToolviews_module_css_default.root,
				"data-state": state,
				"data-open": open || void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonToolviews_module_css_default.row,
					role: "button",
					tabIndex: 0,
					"aria-expanded": open,
					"aria-label": `${title}：${summary}`,
					onClick: toggle,
					onKeyDown: (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							toggle();
						}
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${MnemonToolviews_module_css_default.dot} ${state === "running" ? MnemonToolviews_module_css_default.dotRunning : state === "error" ? MnemonToolviews_module_css_default.dotError : state === "stopped" ? MnemonToolviews_module_css_default.dotStopped : MnemonToolviews_module_css_default.dotOk}`,
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonLogo, {
							className: MnemonToolviews_module_css_default.leading,
							title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonToolviews_module_css_default.title,
							children: title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonToolviews_module_css_default.summary,
							children: summary
						}),
						(inspect !== void 0 || target !== void 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: MnemonToolviews_module_css_default.actions,
							onClick: (event) => event.stopPropagation(),
							children: [target !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonToolviews_module_css_default.actionButton,
								onClick: openView,
								title: t("toolview.openView"),
								children: t("toolview.openView")
							}), settled && inspect !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonToolviews_module_css_default.actionButton,
								onClick: inspectCall,
								title: t("toolview.inspect"),
								children: t("toolview.inspect")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${MnemonToolviews_module_css_default.chevron} ${open ? MnemonToolviews_module_css_default.chevronOpen : ""}`,
							"aria-hidden": "true"
						})
					]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonToolviews_module_css_default.details,
					onClick: (event) => event.stopPropagation(),
					children: [
						showArgs && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonToolviews_module_css_default.detailSection,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MnemonToolviews_module_css_default.detailLabel,
								children: t("toolview.args")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: MnemonToolviews_module_css_default.detailCode,
								children: truncateBlock(JSON.stringify(args, null, 2), 2e3)
							})]
						}),
						showResult && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonToolviews_module_css_default.detailSection,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MnemonToolviews_module_css_default.detailLabel,
								children: t("toolview.result")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: MnemonToolviews_module_css_default.detailCode,
								children: truncateBlock(text, 4e3)
							})]
						}),
						!showArgs && !showResult && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonToolviews_module_css_default.detailEmpty,
							children: state === "running" ? t("toolview.running") : t("toolview.noResult")
						})
					]
				})]
			});
		});
		/** Tool name → toolview component, registered as keyed `tool.call.toolview` entries. */
		const MNEMON_TOOLVIEW_NAMES = Object.keys(ANCHOR_TARGETS);
		//#endregion
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/omdsh-dev/dsh-mnemon/src/client/MnemonTurnTail.module.css.mjs
		const css$1 = ".t5hXpG_root{min-width:0;margin:2px 0}.t5hXpG_bar{cursor:pointer;min-width:0;max-width:100%;height:22px;color:var(--dsw-alias-label-tertiary);background:0 0;border:1px solid #0000;border-radius:6px;align-items:center;gap:6px;padding:0 8px 0 6px;font-size:11px;line-height:22px;display:flex}.t5hXpG_bar:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.t5hXpG_bar:focus-visible{outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.t5hXpG_mark{opacity:.8;flex:none;font-size:10px}.t5hXpG_label{flex:none;font-weight:600}.t5hXpG_metrics{align-items:center;gap:6px;min-width:0;display:inline-flex;overflow:hidden}.t5hXpG_metrics span{white-space:nowrap}.t5hXpG_failureMetric{color:var(--dsw-alias-state-error-primary,#d44)}.t5hXpG_chevron{opacity:.7;flex:none;width:8px;height:8px;margin-left:auto}.t5hXpG_chevron:before{content:\"\";border-bottom:1.5px solid;border-right:1.5px solid;width:5px;height:5px;transition:transform .12s;display:block;transform:rotate(45deg)translate(-1px,-1px)}.t5hXpG_chevronOpen:before{transform:rotate(-135deg)translate(0)}.t5hXpG_details{border-left:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-markdown-code-block);border-radius:0 8px 8px 0;align-items:center;gap:10px;min-width:0;margin:2px 0 4px;padding:6px 8px;display:flex}.t5hXpG_detailLabel{color:var(--dsw-alias-label-caption);letter-spacing:.08em;text-transform:uppercase;flex:none;font-size:10px;font-weight:650}.t5hXpG_tools{flex-wrap:wrap;flex:auto;gap:4px;min-width:0;display:flex}.t5hXpG_toolChip{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,Consolas, monospace);white-space:nowrap;border-radius:4px;padding:0 6px;font-size:10px;line-height:18px}.t5hXpG_viewButton{cursor:pointer;height:20px;color:var(--dsw-alias-state-business-primary);background:0 0;border:none;border-radius:5px;flex:none;padding:0 8px;font-size:11px;line-height:20px}.t5hXpG_viewButton:hover{background:var(--dsw-alias-interactive-bg-active)}";
		const tagId$1 = "dsh-mnemon/MnemonTurnTail.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var MnemonTurnTail_module_css_default = {
			"chevronOpen": "t5hXpG_chevronOpen",
			"viewButton": "t5hXpG_viewButton",
			"failureMetric": "t5hXpG_failureMetric",
			"details": "t5hXpG_details",
			"toolChip": "t5hXpG_toolChip",
			"tools": "t5hXpG_tools",
			"label": "t5hXpG_label",
			"bar": "t5hXpG_bar",
			"mark": "t5hXpG_mark",
			"root": "t5hXpG_root",
			"chevron": "t5hXpG_chevron",
			"metrics": "t5hXpG_metrics",
			"detailLabel": "t5hXpG_detailLabel"
		};
		//#endregion
		//#region src/client/MnemonTurnTail.tsx
		function turnNumber(turn) {
			const value = turn?.turn;
			return typeof value === "number" ? value : void 0;
		}
		/** Whether this entry renders for the owner; chain selectors decline quietly. */
		function selectMnemonTurnTail(owner) {
			return owner.turn.status === "closed" ? {} : null;
		}
		/** One-line memory-activity bar under a completed turn; hides when the turn touched no memory. */
		const MnemonTurnTail = (0, react.memo)(function MnemonTurnTail({ turn, seq, sessionId, connection, t }) {
			const [activity, setActivity] = (0, react.useState)(void 0);
			const [open, setOpen] = (0, react.useState)(false);
			const number = turnNumber(turn);
			(0, react.useEffect)(() => {
				if (number === void 0) {
					setActivity(null);
					return;
				}
				let alive = true;
				new MnemonClient(connection, sessionId).turnActivity(number, seq).then((result) => {
					if (alive) setActivity(result);
				}).catch(() => {
					if (alive) setActivity(null);
				});
				return () => {
					alive = false;
				};
			}, [
				connection,
				sessionId,
				number,
				seq
			]);
			if (activity === void 0 || activity === null) return null;
			if (number === void 0) return null;
			const openView = (event) => {
				event.stopPropagation();
				dispatchMnemonAnchor({
					page: "status",
					...sessionId === void 0 ? {} : { sessionId }
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonTurnTail_module_css_default.root,
				"data-open": open || void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: MnemonTurnTail_module_css_default.bar,
					"aria-expanded": open,
					onClick: () => setOpen((value) => !value),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonTurnTail_module_css_default.mark,
							"aria-hidden": "true",
							children: "◈"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonTurnTail_module_css_default.label,
							children: t("turnTail.label")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: MnemonTurnTail_module_css_default.metrics,
							children: [
								activity.recalls > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("turnTail.recall", { count: activity.recalls }) }),
								activity.writes > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("turnTail.write", { count: activity.writes }) }),
								activity.documentSearches > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("turnTail.documents", { count: activity.documentSearches }) }),
								activity.inspections > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("turnTail.inspect", { count: activity.inspections }) }),
								activity.failures > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: MnemonTurnTail_module_css_default.failureMetric,
									children: t("turnTail.failed", { count: activity.failures })
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${MnemonTurnTail_module_css_default.chevron} ${open ? MnemonTurnTail_module_css_default.chevronOpen : ""}`,
							"aria-hidden": "true"
						})
					]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonTurnTail_module_css_default.details,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonTurnTail_module_css_default.detailLabel,
							children: t("turnTail.toolList")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonTurnTail_module_css_default.tools,
							children: activity.names.map((name, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
								className: MnemonTurnTail_module_css_default.toolChip,
								children: name
							}, `${name}-${index}`))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonTurnTail_module_css_default.viewButton,
							onClick: openView,
							children: t("turnTail.openView")
						})
					]
				})]
			});
		});
		//#endregion
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/omdsh-dev/dsh-mnemon/src/client/MnemonSaveAction.module.css.mjs
		const css = ".FDcGda_wrap{display:inline-flex;position:relative}.FDcGda_button{cursor:pointer;height:22px;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;border-radius:5px;align-items:center;gap:4px;padding:0 7px;font-size:11px;line-height:22px;display:inline-flex}.FDcGda_button:hover,.FDcGda_button[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.FDcGda_button:focus-visible{outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.FDcGda_glyph{opacity:.85;font-size:10px}.FDcGda_panel{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);width:min(340px,100vw - 32px);color:var(--dsw-alias-label-primary);border-radius:10px;padding:10px 12px;font-size:12px;line-height:18px;position:absolute;top:calc(100% + 4px);right:0;box-shadow:0 8px 24px #0000002e}.FDcGda_panel:popover-open{top:var(--mn-save-panel-top);right:auto;left:var(--mn-save-panel-left);width:var(--mn-save-panel-width);margin:0;position:fixed}.FDcGda_panelHeader{justify-content:space-between;align-items:center;gap:8px;display:flex}.FDcGda_panelHeader strong{font-size:12px;font-weight:600}.FDcGda_close{cursor:pointer;width:20px;height:20px;color:var(--dsw-alias-label-secondary);background:0 0;border:none;border-radius:5px;font-size:14px;line-height:18px}.FDcGda_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.FDcGda_hint{color:var(--dsw-alias-label-secondary);margin:6px 0 0;font-size:11px;line-height:16px}.FDcGda_status{color:var(--dsw-alias-label-tertiary);margin-top:8px;font-size:11px}.FDcGda_readOnly{background:var(--dsw-alias-state-warn-bg,transparent);color:var(--dsw-alias-state-warn-primary);border-radius:6px;margin-top:8px;padding:6px 8px;font-size:11px}.FDcGda_candidate{margin-top:8px;display:block}.FDcGda_candidate>span{color:var(--dsw-alias-label-caption);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;font-size:10px;font-weight:650;display:block}.FDcGda_candidate textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);resize:vertical;background:var(--dsw-specific-input-major,var(--dsw-alias-bg-base));width:100%;max-height:160px;color:var(--dsw-alias-label-primary);font:12px/18px var(--ds-font-family-code,Consolas, monospace);border-radius:8px;padding:8px 10px;display:block}.FDcGda_candidate textarea:focus-visible{outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.FDcGda_truncated{color:var(--dsw-alias-label-tertiary);margin-top:4px;font-size:10px;line-height:14px;display:block}.FDcGda_outcome{background:var(--dsw-alias-state-success-bg,transparent);color:var(--dsw-alias-state-success-primary);border-radius:6px;margin-top:8px;padding:6px 8px;font-size:11px}.FDcGda_failure{background:var(--dsw-alias-state-error-bg,transparent);color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere;border-radius:6px;margin-top:8px;padding:6px 8px;font-size:11px}.FDcGda_submit{cursor:pointer;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-state-business-primary));width:100%;height:28px;color:var(--dsw-alias-button-primary-text,#fff);border:none;border-radius:7px;margin-top:10px;font-size:12px;font-weight:600;line-height:28px}.FDcGda_submit:hover:not(:disabled){filter:brightness(1.06)}.FDcGda_submit:disabled{cursor:default;opacity:.5}.FDcGda_submit:focus-visible{outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:2px}";
		const tagId = "dsh-mnemon/MnemonSaveAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MnemonSaveAction_module_css_default = {
			"truncated": "FDcGda_truncated",
			"submit": "FDcGda_submit",
			"panelHeader": "FDcGda_panelHeader",
			"status": "FDcGda_status",
			"candidate": "FDcGda_candidate",
			"wrap": "FDcGda_wrap",
			"readOnly": "FDcGda_readOnly",
			"button": "FDcGda_button",
			"panel": "FDcGda_panel",
			"hint": "FDcGda_hint",
			"outcome": "FDcGda_outcome",
			"glyph": "FDcGda_glyph",
			"close": "FDcGda_close",
			"failure": "FDcGda_failure"
		};
		//#endregion
		//#region src/client/MnemonSaveAction.tsx
		const PREVIEW_LIMIT = 8e3;
		/** Save-to-memory action on finalized assistant messages, routed through the supervised writeback gate. */
		const MnemonSaveAction = (0, react.memo)(function MnemonSaveAction({ messageId, sessionId, connection, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [writeEnabled, setWriteEnabled] = (0, react.useState)(void 0);
			const [candidate, setCandidate] = (0, react.useState)(void 0);
			const [truncated, setTruncated] = (0, react.useState)(false);
			const [missing, setMissing] = (0, react.useState)(false);
			const [submitting, setSubmitting] = (0, react.useState)(false);
			const [outcome, setOutcome] = (0, react.useState)(null);
			const [failure, setFailure] = (0, react.useState)(null);
			const textareaRef = (0, react.useRef)(null);
			const wrapRef = (0, react.useRef)(null);
			const buttonRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const openRef = (0, react.useRef)(false);
			const requestVersionRef = (0, react.useRef)(0);
			const submitActiveRef = (0, react.useRef)(false);
			const setPanelOpen = (next) => {
				requestVersionRef.current += 1;
				openRef.current = next;
				setOpen(next);
			};
			(0, react.useEffect)(() => {
				if (!open) {
					setWriteEnabled(void 0);
					setCandidate(void 0);
					setTruncated(false);
					setMissing(false);
					setSubmitting(submitActiveRef.current);
					setOutcome(null);
					setFailure(null);
					return;
				}
				const requestVersion = ++requestVersionRef.current;
				let alive = true;
				setSubmitting(submitActiveRef.current);
				const client = new MnemonClient(connection, sessionId);
				client.status().then((status) => {
					if (alive && requestVersionRef.current === requestVersion) setWriteEnabled(status.writeEnabled);
				}).catch(() => {
					if (alive && requestVersionRef.current === requestVersion) setWriteEnabled(false);
				});
				client.assistantMessageText(messageId).then((result) => {
					if (!alive || requestVersionRef.current !== requestVersion) return;
					if (result === null || result.text === "") setMissing(true);
					else {
						setTruncated(result.text.length > PREVIEW_LIMIT);
						setCandidate(result.text.slice(0, PREVIEW_LIMIT));
					}
				}).catch(() => {
					if (alive && requestVersionRef.current === requestVersion) setMissing(true);
				});
				return () => {
					alive = false;
				};
			}, [
				open,
				connection,
				sessionId,
				messageId
			]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOnEscape = (event) => {
					if (event.key === "Escape") setPanelOpen(false);
				};
				const closeOutside = (event) => {
					if (event.target instanceof Node && !wrapRef.current?.contains(event.target)) setPanelOpen(false);
				};
				document.addEventListener("keydown", closeOnEscape);
				document.addEventListener("pointerdown", closeOutside);
				return () => {
					document.removeEventListener("keydown", closeOnEscape);
					document.removeEventListener("pointerdown", closeOutside);
				};
			}, [open]);
			(0, react.useLayoutEffect)(() => {
				if (!open) return;
				const panel = panelRef.current;
				const button = buttonRef.current;
				if (panel === null || button === null || typeof panel.showPopover !== "function") return;
				const reposition = () => {
					const anchor = button.getBoundingClientRect();
					const padding = 16;
					const width = Math.min(340, Math.max(240, window.innerWidth - 32));
					panel.style.setProperty("--mn-save-panel-width", `${width}px`);
					const left = Math.min(Math.max(padding, anchor.right - width), Math.max(padding, window.innerWidth - width - padding));
					panel.style.setProperty("--mn-save-panel-left", `${left}px`);
					const below = anchor.bottom + 4;
					const above = anchor.top - panel.getBoundingClientRect().height - 4;
					const top = below + panel.getBoundingClientRect().height <= window.innerHeight - padding || above < padding ? below : above;
					panel.style.setProperty("--mn-save-panel-top", `${Math.max(padding, top)}px`);
				};
				panel.setAttribute("popover", "manual");
				panel.showPopover();
				reposition();
				window.addEventListener("resize", reposition);
				document.addEventListener("scroll", reposition, true);
				return () => {
					window.removeEventListener("resize", reposition);
					document.removeEventListener("scroll", reposition, true);
					if (panel.matches(":popover-open")) panel.hidePopover();
				};
			}, [open]);
			const submit = () => {
				const content = textareaRef.current?.value.trim() ?? "";
				if (content === "" || writeEnabled !== true || submitActiveRef.current) return;
				const requestVersion = requestVersionRef.current;
				submitActiveRef.current = true;
				setSubmitting(true);
				setFailure(null);
				setOutcome(null);
				new MnemonClient(connection, sessionId).supervise(content, messageId).then((result) => {
					if (!openRef.current || requestVersionRef.current !== requestVersion) return;
					setOutcome({
						summary: result.summary,
						action: result.action
					});
					setCandidate(content);
				}).catch((reason) => {
					if (openRef.current && requestVersionRef.current === requestVersion) setFailure(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					submitActiveRef.current = false;
					if (openRef.current) setSubmitting(false);
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: MnemonSaveAction_module_css_default.wrap,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					ref: buttonRef,
					type: "button",
					className: MnemonSaveAction_module_css_default.button,
					"aria-expanded": open,
					title: t("saveAction.button"),
					onClick: () => setPanelOpen(!openRef.current),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: MnemonSaveAction_module_css_default.glyph,
						"aria-hidden": "true",
						children: "◈"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: MnemonSaveAction_module_css_default.label,
						children: t("saveAction.button")
					})]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: panelRef,
					className: MnemonSaveAction_module_css_default.panel,
					role: "dialog",
					"aria-label": t("saveAction.title"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: MnemonSaveAction_module_css_default.panelHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("saveAction.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSaveAction_module_css_default.close,
								"aria-label": t("saveAction.close"),
								onClick: () => setPanelOpen(false),
								children: "×"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonSaveAction_module_css_default.hint,
							children: t("saveAction.hint")
						}),
						writeEnabled === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonSaveAction_module_css_default.readOnly,
							role: "status",
							children: t("saveAction.readOnly")
						}),
						candidate === void 0 && !missing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonSaveAction_module_css_default.status,
							children: t("saveAction.fetching")
						}),
						missing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonSaveAction_module_css_default.status,
							role: "status",
							children: t("saveAction.missing")
						}),
						candidate !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: MnemonSaveAction_module_css_default.candidate,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("saveAction.candidate") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									ref: textareaRef,
									rows: 5,
									defaultValue: candidate
								}),
								truncated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
									className: MnemonSaveAction_module_css_default.truncated,
									children: t("saveAction.truncated", { limit: PREVIEW_LIMIT })
								})
							]
						}),
						outcome !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonSaveAction_module_css_default.outcome,
							role: "status",
							children: t("saveAction.result", { summary: outcome.summary })
						}),
						failure !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MnemonSaveAction_module_css_default.failure,
							role: "alert",
							children: t("saveAction.failed", { error: failure })
						}),
						candidate !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonSaveAction_module_css_default.submit,
							disabled: submitting || writeEnabled !== true,
							onClick: submit,
							children: submitting ? t("saveAction.submitting") : t("saveAction.submit")
						})
					]
				})]
			});
		});
		//#endregion
		//#region src/client/settings.ts
		var MnemonSettingsScope = class {
			connection;
			namespace;
			snapshot = {
				status: "loading",
				writable: false,
				mode: "host"
			};
			listeners = /* @__PURE__ */ new Set();
			tail = Promise.resolve();
			constructor(connection, namespace = MNEMON_SETTINGS_NAMESPACE) {
				this.connection = connection;
				this.namespace = namespace;
				this.load();
			}
			getSnapshot = () => this.snapshot;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => this.listeners.delete(listener);
			};
			set(field, value) {
				return this.mutate([{
					op: "set",
					path: [field],
					value
				}]);
			}
			unset(field) {
				return this.mutate([{
					op: "unset",
					path: [field]
				}]);
			}
			/** Set a nested field (e.g. ['conversationInteraction', 'toolviews']). */
			setPath(path, value) {
				return this.mutate([{
					op: "set",
					path,
					value
				}]);
			}
			/** Unset a nested field, falling back to its schema default. */
			unsetPath(path) {
				return this.mutate([{
					op: "unset",
					path
				}]);
			}
			mutate(ops) {
				return this.write(ops);
			}
			async load() {
				try {
					const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, "get", { namespace: this.namespace });
					if (!response.ok) {
						this.publish({
							status: "unavailable",
							writable: false,
							mode: "host"
						});
						return;
					}
					this.publish(response.value);
				} catch {
					this.publish({
						status: "unavailable",
						writable: false,
						mode: "host"
					});
				}
			}
			write(ops) {
				const task = this.tail.then(async () => {
					const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, "mutate", {
						namespace: this.namespace,
						ops,
						...this.snapshot.revision === void 0 ? {} : { expectedRevision: this.snapshot.revision }
					});
					if (!response.ok) {
						await this.load();
						throw new Error(response.error.message);
					}
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
			"locale",
			"workspaces"
		];
		const INTERACTION_UNITS = {
			toolviews: {
				slot: "tool.call.toolview",
				enabled: (value) => enabledOf(value, "toolviews"),
				register(ctx, namespace, translate) {
					const disposers = [];
					for (const toolName of MNEMON_TOOLVIEW_NAMES) disposers.push(ctx.slots.register({
						name: "tool.call.toolview",
						key: toolName,
						locale: namespace,
						inject: (sessionId) => ({
							...typeof sessionId === "string" && sessionId !== "" ? { sessionId } : {},
							t: translate
						})
					}, MnemonToolView));
					return () => {
						for (const dispose of disposers.reverse()) dispose();
					};
				}
			},
			turnBar: {
				slot: "conversation.chat.turnTail",
				enabled: (value) => enabledOf(value, "turnBar"),
				register(ctx, namespace, translate) {
					return ctx.slots.register({
						name: "conversation.chat.turnTail",
						locale: namespace,
						select: selectMnemonTurnTail,
						inject: (sessionId) => ({
							...typeof sessionId === "string" && sessionId !== "" ? { sessionId } : {},
							connection: ctx.connection,
							t: translate
						})
					}, MnemonTurnTail);
				}
			},
			saveAction: {
				slot: "conversation.chat.assistant-actions",
				enabled: (value) => enabledOf(value, "saveAction"),
				register(ctx, namespace, translate) {
					return ctx.slots.register({
						name: "conversation.chat.assistant-actions",
						id: "mnemon-save",
						order: 90,
						locale: namespace,
						inject: (sessionId) => ({
							...typeof sessionId === "string" && sessionId !== "" ? { sessionId } : {},
							connection: ctx.connection,
							t: translate
						})
					}, MnemonSaveAction);
				}
			}
		};
		/** Interaction surfaces are opt-in: an explicit `true` in settings enables one. */
		function enabledOf(value, key) {
			return value?.[key] === true;
		}
		/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
		function apply(rawContext) {
			const ctx = rawContext;
			const settings = new MnemonSettingsScope(ctx.connection, MNEMON_SETTINGS_NAMESPACE);
			const interactionSettings = new MnemonSettingsScope(ctx.connection, MNEMON_UI_SETTINGS_NAMESPACE);
			const namespace = "mnemon";
			ctx.effect(() => ctx.locale.register(namespace, {
				zh,
				en
			}), "dsh-mnemon: locale dictionaries");
			const translate = ctx.locale.bind(namespace);
			let disposeMemoryTab;
			const reconcileMemoryTab = () => {
				const enabled = settings.getSnapshot().value?.tabEnabled !== false;
				if (enabled && disposeMemoryTab === void 0) disposeMemoryTab = ctx.slots.inject("conversation.view", () => ctx.slots.register({
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
				else if (!enabled && disposeMemoryTab !== void 0) {
					disposeMemoryTab();
					disposeMemoryTab = void 0;
				}
			};
			ctx.effect(() => {
				const unsubscribe = settings.subscribe(reconcileMemoryTab);
				reconcileMemoryTab();
				return () => {
					unsubscribe();
					disposeMemoryTab?.();
					disposeMemoryTab = void 0;
				};
			}, "dsh-mnemon: memory tab");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "mnemon",
				order: 20,
				label: () => translate("tab.label"),
				locale: namespace,
				inject: () => ({
					scope: settings,
					interactionScope: interactionSettings,
					connection: ctx.connection,
					pickDirectory: () => ctx.workspaces.pickDirectory(),
					t: translate
				})
			}, MnemonSettingsCard));
			const active = /* @__PURE__ */ new Map();
			const reconcile = () => {
				const value = interactionSettings.getSnapshot().value;
				for (const key of Object.keys(INTERACTION_UNITS)) {
					const unit = INTERACTION_UNITS[key];
					const enabled = unit.enabled(value);
					if (enabled && !active.has(key)) active.set(key, ctx.slots.inject(unit.slot, () => unit.register(ctx, namespace, translate)));
					else if (!enabled && active.has(key)) {
						active.get(key)();
						active.delete(key);
					}
				}
			};
			ctx.effect(() => {
				const unsubscribe = interactionSettings.subscribe(reconcile);
				reconcile();
				return () => {
					unsubscribe();
					for (const dispose of [...active.values()].reverse()) dispose();
					active.clear();
				};
			}, "dsh-mnemon: interaction surfaces");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
