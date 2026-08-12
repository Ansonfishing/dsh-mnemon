window.__ModuleLoader__.load({
	id: "dsh-mnemon",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/service.ts
		const CATEGORIES = [
			"preference",
			"decision",
			"fact",
			"insight",
			"context",
			"general"
		];
		//#endregion
		//#region src/rpc.ts
		const MNEMON_READ_CHANNEL = "/dsh-mnemon-read";
		const MNEMON_WRITE_CHANNEL = "/dsh-mnemon-write";
		//#endregion
		//#region src/client/api.ts
		var MnemonClient = class {
			connection;
			constructor(connection) {
				this.connection = connection;
			}
			async call(channel, endpoint, payload) {
				const response = await this.connection.rpc.call(channel, endpoint, payload);
				if (!response.ok) throw new Error(response.error.message);
				return response.value;
			}
			status() {
				return this.call(MNEMON_READ_CHANNEL, "status", {});
			}
			search(request) {
				return this.call(MNEMON_READ_CHANNEL, "search", request);
			}
			related(id) {
				return this.call(MNEMON_READ_CHANNEL, "related", {
					id,
					depth: 2
				});
			}
			remember(request) {
				return this.call(MNEMON_WRITE_CHANNEL, "remember", request);
			}
			forget(id) {
				return this.call(MNEMON_WRITE_CHANNEL, "forget", { id });
			}
		};
		//#endregion
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/dsh-external/dsh-mnemon/src/client/MnemonView.module.css.mjs
		const css$1 = ":root{--mn-bg:var(--dsw-alias-background-primary,#f6f7fb);--mn-panel:var(--dsw-alias-background-secondary,#fff);--mn-text:var(--dsw-alias-content-primary,#151823);--mn-muted:var(--dsw-alias-content-secondary,#687083);--mn-line:var(--dsw-alias-border-secondary,#232d461f);--mn-primary:var(--dsw-alias-state-business-primary,#4b67f2);--mn-primary-soft:color-mix(in srgb, var(--mn-primary) 12%, transparent);--mn-danger:#d14b59}.lvR3Qq_shell{box-sizing:border-box;min-height:100%;color:var(--mn-text);background:radial-gradient(circle at 88% 2%, color-mix(in srgb, var(--mn-primary) 11%, transparent), transparent 34rem), var(--mn-bg);font:14px/1.55 ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.lvR3Qq_header{justify-content:space-between;align-items:flex-start;gap:24px;padding:32px clamp(20px,4vw,56px) 24px;display:flex}.lvR3Qq_header h1{letter-spacing:-.035em;margin:2px 0 4px;font-size:clamp(25px,3vw,36px);line-height:1.15}.lvR3Qq_header p,.lvR3Qq_formIntro p,.lvR3Qq_configCard p{color:var(--mn-muted);margin:0}.lvR3Qq_eyebrow,.lvR3Qq_cardKicker,.lvR3Qq_formIntro>span{color:var(--mn-primary);letter-spacing:.18em;font-size:10px;font-weight:800}.lvR3Qq_statusCluster{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-panel) 86%, transparent);min-height:36px;color:var(--mn-muted);backdrop-filter:blur(12px);border-radius:999px;align-items:center;gap:8px;padding:0 6px 0 12px;font-size:12px;display:flex}.lvR3Qq_statusDot{border-radius:50%;width:8px;height:8px}.lvR3Qq_online{background:#2eb67d;box-shadow:0 0 0 4px #2eb67d24}.lvR3Qq_offline{background:var(--mn-danger);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-danger) 12%, transparent)}.lvR3Qq_iconButton,.lvR3Qq_sectionHeading button{width:28px;height:28px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:50%;place-items:center;display:grid}.lvR3Qq_iconButton:hover,.lvR3Qq_sectionHeading button:hover{background:var(--mn-primary-soft);color:var(--mn-primary)}.lvR3Qq_alert,.lvR3Qq_inlineError{border:1px solid color-mix(in srgb, var(--mn-danger) 28%, transparent);background:color-mix(in srgb, var(--mn-danger) 7%, var(--mn-panel));color:var(--mn-danger);border-radius:12px;margin:0 clamp(20px,4vw,56px) 20px;padding:12px 14px}.lvR3Qq_alert{flex-direction:column;gap:2px;display:flex}.lvR3Qq_metrics{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:0 clamp(20px,4vw,56px) 22px;display:grid}.lvR3Qq_metric,.lvR3Qq_insightCard,.lvR3Qq_relatedPane,.lvR3Qq_rememberForm,.lvR3Qq_configCard{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-panel) 94%, transparent);box-shadow:0 12px 35px #161c300a}.lvR3Qq_metric{border-radius:14px;flex-direction:column;justify-content:center;min-height:72px;padding:10px 16px;display:flex}.lvR3Qq_metric span{color:var(--mn-muted);font-size:11px}.lvR3Qq_metric strong{font-variant-numeric:tabular-nums;margin-top:3px;font-size:22px}.lvR3Qq_nav{border-bottom:1px solid var(--mn-line);gap:4px;padding:0 clamp(20px,4vw,56px);display:flex}.lvR3Qq_nav button{color:var(--mn-muted);font:inherit;cursor:pointer;background:0 0;border:0;padding:12px 18px;font-weight:600;position:relative}.lvR3Qq_nav button[aria-current=page]{color:var(--mn-primary)}.lvR3Qq_nav button[aria-current=page]:after{background:var(--mn-primary);content:\"\";border-radius:2px 2px 0 0;height:2px;position:absolute;bottom:-1px;left:9px;right:9px}.lvR3Qq_page{padding:24px clamp(20px,4vw,56px) 56px}.lvR3Qq_searchBar{border:1px solid var(--mn-line);background:var(--mn-panel);border-radius:15px;grid-template-columns:auto minmax(180px,1fr) auto auto auto;align-items:center;gap:8px;max-width:1100px;margin:0 auto;padding:7px;display:grid;box-shadow:0 14px 38px #161c300f}.lvR3Qq_searchIcon{color:var(--mn-muted);padding-left:10px;font-size:20px}.lvR3Qq_searchBar input,.lvR3Qq_searchBar select,.lvR3Qq_rememberForm input,.lvR3Qq_rememberForm select,.lvR3Qq_rememberForm textarea{box-sizing:border-box;border:1px solid var(--mn-line);color:var(--mn-text);background:var(--mn-panel);font:inherit;border-radius:9px;outline:none}.lvR3Qq_searchBar input{background:0 0;border:0;min-width:0;padding:9px 6px}.lvR3Qq_searchBar select{max-width:160px;padding:9px 28px 9px 10px}.lvR3Qq_searchBar input:focus,.lvR3Qq_searchBar select:focus,.lvR3Qq_rememberForm input:focus,.lvR3Qq_rememberForm select:focus,.lvR3Qq_rememberForm textarea:focus{border-color:var(--mn-primary);box-shadow:0 0 0 3px var(--mn-primary-soft)}.lvR3Qq_primaryButton,.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{font:inherit;cursor:pointer;border-radius:9px;font-weight:650}.lvR3Qq_primaryButton{border:1px solid var(--mn-primary);color:#fff;background:var(--mn-primary);padding:10px 17px}.lvR3Qq_primaryButton:disabled{opacity:.5;cursor:default}.lvR3Qq_primaryButton:not(:disabled):hover{filter:brightness(1.07)}.lvR3Qq_inlineError{max-width:1070px;margin:16px auto}.lvR3Qq_emptyState{text-align:center;place-content:center;max-width:570px;min-height:310px;margin:30px auto 0;display:grid}.lvR3Qq_emptyState h2{margin:8px 0 4px;font-size:18px}.lvR3Qq_emptyState p{color:var(--mn-muted);margin:0}.lvR3Qq_orbit{color:var(--mn-primary);font-size:46px;font-weight:300}.lvR3Qq_resultLayout{grid-template-columns:minmax(0,1fr);gap:18px;max-width:1100px;margin:24px auto 0;display:grid}.lvR3Qq_resultLayout:has(.lvR3Qq_relatedPane){grid-template-columns:minmax(0,1fr) minmax(300px,.72fr)}.lvR3Qq_results{align-content:start;gap:10px;display:grid}.lvR3Qq_sectionHeading{justify-content:space-between;align-items:center;min-height:31px;display:flex}.lvR3Qq_sectionHeading h2{margin:0;font-size:15px}.lvR3Qq_sectionHeading span{color:var(--mn-muted);font-size:12px}.lvR3Qq_insightCard{border-radius:13px;padding:16px}.lvR3Qq_cardTop{justify-content:space-between;align-items:flex-start;gap:10px;display:flex}.lvR3Qq_badges{flex-wrap:wrap;gap:5px;display:flex}.lvR3Qq_badge{color:var(--mn-primary);background:var(--mn-primary-soft);border-radius:999px;padding:2px 7px;font-size:10px;font-weight:650}.lvR3Qq_id{color:var(--mn-muted);font-size:10px}.lvR3Qq_content{white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0 10px}.lvR3Qq_tags{color:var(--mn-muted);flex-wrap:wrap;gap:9px;font-size:11px;display:flex}.lvR3Qq_cardActions{justify-content:flex-end;gap:6px;margin-top:13px;display:flex}.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{border:1px solid var(--mn-line);color:var(--mn-muted);background:0 0;padding:5px 9px;font-size:11px}.lvR3Qq_ghostButton:hover{border-color:var(--mn-primary);color:var(--mn-primary)}.lvR3Qq_dangerButton:hover{border-color:var(--mn-danger);color:var(--mn-danger)}.lvR3Qq_relatedPane{border-radius:15px;align-self:start;max-height:calc(100vh - 160px);padding:14px;position:sticky;top:18px;overflow:auto}.lvR3Qq_relatedSource{color:var(--mn-muted);background:var(--mn-primary-soft);border-radius:9px;margin:8px 0 14px;padding:10px;font-size:12px}.lvR3Qq_relatedPane .lvR3Qq_insightCard{box-shadow:none;margin-top:8px}.lvR3Qq_loading,.lvR3Qq_muted{color:var(--mn-muted);text-align:center;padding:24px 10px}.lvR3Qq_rememberForm{border-radius:18px;gap:20px;max-width:760px;margin:0 auto;padding:clamp(22px,4vw,40px);display:grid}.lvR3Qq_formIntro h2{margin:3px 0 5px;font-size:22px}.lvR3Qq_rememberForm label{color:var(--mn-muted);gap:7px;font-size:12px;font-weight:650;display:grid}.lvR3Qq_rememberForm input,.lvR3Qq_rememberForm select,.lvR3Qq_rememberForm textarea{width:100%;color:var(--mn-text);resize:vertical;padding:10px 12px;font-weight:400}.lvR3Qq_formGrid{grid-template-columns:1fr 1fr;gap:15px;display:grid}.lvR3Qq_fieldWide{grid-column:1/-1}.lvR3Qq_formActions{color:var(--mn-muted);align-items:center;gap:14px;font-size:12px;display:flex}.lvR3Qq_configGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;max-width:1050px;margin:0 auto;display:grid}.lvR3Qq_configCard{border-radius:15px;padding:22px;overflow:hidden}.lvR3Qq_configCard:last-child{grid-column:1/-1}.lvR3Qq_configCard h2{margin:3px 0 16px;font-size:18px}.lvR3Qq_configCard dl{margin:0}.lvR3Qq_configCard dl>div{border-bottom:1px solid var(--mn-line);grid-template-columns:92px minmax(0,1fr);gap:10px;padding:9px 0;display:grid}.lvR3Qq_configCard dl>div:last-child{border-bottom:0}.lvR3Qq_configCard dt{color:var(--mn-muted)}.lvR3Qq_configCard dd{overflow-wrap:anywhere;min-width:0;margin:0}.lvR3Qq_configCard code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.92em}.lvR3Qq_configCard pre{color:#dce5ff;background:#171b28;border-radius:10px;max-height:310px;margin:0 0 12px;padding:14px;font:12px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace;overflow:auto}.lvR3Qq_configCard ul{color:var(--mn-muted);margin:0;padding-left:20px}.lvR3Qq_configCard li+li{margin-top:7px}@media (width<=850px){.lvR3Qq_metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.lvR3Qq_searchBar{grid-template-columns:auto minmax(0,1fr) auto}.lvR3Qq_searchBar select{grid-row:2;max-width:none}.lvR3Qq_searchBar select:first-of-type{grid-column:2}.lvR3Qq_searchBar select:last-of-type{grid-column:3}.lvR3Qq_resultLayout:has(.lvR3Qq_relatedPane){grid-template-columns:1fr}.lvR3Qq_relatedPane{max-height:none;position:static}.lvR3Qq_configGrid{grid-template-columns:1fr}.lvR3Qq_configCard:last-child{grid-column:auto}}@media (width<=560px){.lvR3Qq_header{flex-direction:column;padding-top:22px}.lvR3Qq_metrics{grid-template-columns:1fr 1fr}.lvR3Qq_metric{min-height:60px}.lvR3Qq_metric strong{font-size:18px}.lvR3Qq_searchBar{flex-wrap:wrap;display:flex}.lvR3Qq_searchBar input{flex:calc(100% - 40px)}.lvR3Qq_searchBar select{flex:45%}.lvR3Qq_searchBar .lvR3Qq_primaryButton{flex:100%}.lvR3Qq_formGrid{grid-template-columns:1fr}.lvR3Qq_fieldWide{grid-column:auto}.lvR3Qq_formActions{flex-direction:column;align-items:stretch}}body[data-ds-dark-theme] .lvR3Qq_shell{--mn-bg:var(--dsw-alias-background-primary,#11131a);--mn-panel:var(--dsw-alias-background-secondary,#191c25);--mn-text:var(--dsw-alias-content-primary,#eef1f8);--mn-muted:var(--dsw-alias-content-secondary,#9ba4b8);--mn-line:var(--dsw-alias-border-secondary,#dce4ff1f)}";
		const tagId$1 = "dsh-mnemon/MnemonView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var MnemonView_module_css_default = {
			"loading": "lvR3Qq_loading",
			"configGrid": "lvR3Qq_configGrid",
			"emptyState": "lvR3Qq_emptyState",
			"offline": "lvR3Qq_offline",
			"resultLayout": "lvR3Qq_resultLayout",
			"inlineError": "lvR3Qq_inlineError",
			"configCard": "lvR3Qq_configCard",
			"formActions": "lvR3Qq_formActions",
			"statusDot": "lvR3Qq_statusDot",
			"alert": "lvR3Qq_alert",
			"id": "lvR3Qq_id",
			"muted": "lvR3Qq_muted",
			"formIntro": "lvR3Qq_formIntro",
			"iconButton": "lvR3Qq_iconButton",
			"searchBar": "lvR3Qq_searchBar",
			"relatedPane": "lvR3Qq_relatedPane",
			"cardKicker": "lvR3Qq_cardKicker",
			"statusCluster": "lvR3Qq_statusCluster",
			"insightCard": "lvR3Qq_insightCard",
			"badge": "lvR3Qq_badge",
			"relatedSource": "lvR3Qq_relatedSource",
			"header": "lvR3Qq_header",
			"online": "lvR3Qq_online",
			"sectionHeading": "lvR3Qq_sectionHeading",
			"cardActions": "lvR3Qq_cardActions",
			"tags": "lvR3Qq_tags",
			"page": "lvR3Qq_page",
			"metric": "lvR3Qq_metric",
			"rememberForm": "lvR3Qq_rememberForm",
			"nav": "lvR3Qq_nav",
			"eyebrow": "lvR3Qq_eyebrow",
			"ghostButton": "lvR3Qq_ghostButton",
			"searchIcon": "lvR3Qq_searchIcon",
			"formGrid": "lvR3Qq_formGrid",
			"primaryButton": "lvR3Qq_primaryButton",
			"dangerButton": "lvR3Qq_dangerButton",
			"orbit": "lvR3Qq_orbit",
			"results": "lvR3Qq_results",
			"metrics": "lvR3Qq_metrics",
			"badges": "lvR3Qq_badges",
			"fieldWide": "lvR3Qq_fieldWide",
			"content": "lvR3Qq_content",
			"cardTop": "lvR3Qq_cardTop",
			"shell": "lvR3Qq_shell"
		};
		//#endregion
		//#region src/client/MnemonView.tsx
		const CATEGORY_LABELS = {
			decision: "决策",
			preference: "偏好",
			fact: "事实",
			insight: "洞察",
			context: "上下文",
			general: "通用"
		};
		function humanBytes(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		}
		function message(error) {
			return error instanceof Error ? error.message : String(error);
		}
		function InsightCard(props) {
			const { insight } = props;
			const meta = [
				insight.category !== void 0 ? CATEGORY_LABELS[insight.category] ?? insight.category : void 0,
				insight.importance !== void 0 ? `重要性 ${insight.importance}` : void 0,
				insight.confidence !== void 0 ? `${insight.confidence} confidence` : void 0,
				insight.score !== void 0 ? `score ${insight.score.toFixed(3)}` : void 0,
				insight.depth !== void 0 ? `${insight.depth} 跳` : void 0
			].filter((entry) => entry !== void 0);
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.cardActions,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => props.onRelated(insight),
								children: "查看关联"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => void navigator.clipboard?.writeText(insight.id),
								children: "复制 ID"
							}),
							props.writeEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.dangerButton,
								onClick: () => props.onForget(insight),
								children: "忘记"
							})
						]
					})
				]
			});
		}
		function MnemonView({ connection }) {
			const client = (0, react.useMemo)(() => new MnemonClient(connection), [connection]);
			const [page, setPage] = (0, react.useState)("explore");
			const [status, setStatus] = (0, react.useState)(null);
			const [statusLoading, setStatusLoading] = (0, react.useState)(true);
			const [statusError, setStatusError] = (0, react.useState)(null);
			const [query, setQuery] = (0, react.useState)("");
			const [mode, setMode] = (0, react.useState)("smart");
			const [category, setCategory] = (0, react.useState)("");
			const [results, setResults] = (0, react.useState)([]);
			const [searching, setSearching] = (0, react.useState)(false);
			const [searchError, setSearchError] = (0, react.useState)(null);
			const [searched, setSearched] = (0, react.useState)(false);
			const [relatedTo, setRelatedTo] = (0, react.useState)(null);
			const [related, setRelated] = (0, react.useState)([]);
			const [relatedLoading, setRelatedLoading] = (0, react.useState)(false);
			const [content, setContent] = (0, react.useState)("");
			const [rememberCategory, setRememberCategory] = (0, react.useState)("general");
			const [importance, setImportance] = (0, react.useState)(3);
			const [tags, setTags] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			const [saveResult, setSaveResult] = (0, react.useState)(null);
			const loadStatus = (0, react.useCallback)(async () => {
				setStatusLoading(true);
				setStatusError(null);
				try {
					setStatus(await client.status());
				} catch (error) {
					setStatusError(message(error));
				} finally {
					setStatusLoading(false);
				}
			}, [client]);
			(0, react.useEffect)(() => {
				loadStatus();
			}, [loadStatus]);
			const performSearch = (0, react.useCallback)(async (event) => {
				event?.preventDefault();
				if (query.trim() === "") return;
				setSearching(true);
				setSearchError(null);
				setSearched(true);
				setRelatedTo(null);
				try {
					const response = await client.search({
						query,
						mode,
						...category === "" ? {} : { category },
						limit: status?.defaultRecallLimit ?? 10
					});
					setResults(response.results);
				} catch (error) {
					setSearchError(message(error));
					setResults([]);
				} finally {
					setSearching(false);
				}
			}, [
				category,
				client,
				mode,
				query,
				status?.defaultRecallLimit
			]);
			const showRelated = (0, react.useCallback)(async (insight) => {
				setRelatedTo(insight);
				setRelated([]);
				setRelatedLoading(true);
				try {
					setRelated(await client.related(insight.id));
				} catch (error) {
					setSearchError(message(error));
				} finally {
					setRelatedLoading(false);
				}
			}, [client]);
			const forget = (0, react.useCallback)(async (insight) => {
				if (!window.confirm(`确定要软删除这条记忆吗？\n\n${insight.content}`)) return;
				try {
					await client.forget(insight.id);
					setResults((items) => items.filter((item) => item.id !== insight.id));
					if (relatedTo?.id === insight.id) setRelatedTo(null);
					loadStatus();
				} catch (error) {
					setSearchError(message(error));
				}
			}, [
				client,
				loadStatus,
				relatedTo?.id
			]);
			const saveMemory = (0, react.useCallback)(async (event) => {
				event.preventDefault();
				if (content.trim() === "") return;
				setSaving(true);
				setSaveResult(null);
				try {
					const response = await client.remember({
						content,
						category: rememberCategory,
						importance,
						tags: tags.split(",").map((value) => value.trim()).filter((value) => value !== ""),
						source: "user"
					});
					const action = typeof response.action === "string" ? response.action : "saved";
					setSaveResult(action === "skipped" ? "Mnemon 判定为重复内容，已跳过。" : `记忆已处理：${action}`);
					if (action !== "skipped") {
						setContent("");
						setTags("");
					}
					loadStatus();
				} catch (error) {
					setSaveResult(`保存失败：${message(error)}`);
				} finally {
					setSaving(false);
				}
			}, [
				client,
				content,
				importance,
				loadStatus,
				rememberCategory,
				tags
			]);
			const writeEnabled = status?.writeEnabled === true;
			const stats = status?.stats;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: MnemonView_module_css_default.shell,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: MnemonView_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.eyebrow,
								children: "EXTERNAL MEMORY"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "Mnemon 记忆" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "共享的持久记忆图谱；按需召回，审慎沉淀。" })
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.statusCluster,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.statusDot} ${status?.healthy === true ? MnemonView_module_css_default.online : MnemonView_module_css_default.offline}` }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLoading ? "检查中" : status?.healthy === true ? `已连接 · ${status.store}` : "不可用" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.iconButton,
									onClick: () => void loadStatus(),
									"aria-label": "刷新状态",
									children: "↻"
								})
							]
						})]
					}),
					(statusError !== null || status?.healthy === false) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.alert,
						role: "alert",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Mnemon 尚未就绪" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusError ?? status?.error })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.metrics,
						"aria-label": "记忆统计",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "有效记忆" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.totalInsights ?? "—" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "图谱连接" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.edgeCount ?? "—" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "实体" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.topEntities.length ?? "—" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "数据库" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats === void 0 ? "—" : humanBytes(stats.dbSizeBytes) })]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
						className: MnemonView_module_css_default.nav,
						"aria-label": "Mnemon 页面",
						children: [
							["explore", "检索"],
							["remember", "记住"],
							["config", "配置"]
						].map(([id, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-current": page === id ? "page" : void 0,
							onClick: () => setPage(id),
							children: label
						}, id))
					}),
					page === "explore" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.page,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: MnemonView_module_css_default.searchBar,
								onSubmit: (event) => void performSearch(event),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.searchIcon,
										children: "⌕"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: "搜索决策、偏好、经验、项目约定……",
										"aria-label": "记忆查询"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: category,
										onChange: (event) => setCategory(event.target.value),
										"aria-label": "记忆分类",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: "全部分类"
										}), CATEGORIES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value,
											children: CATEGORY_LABELS[value]
										}, value))]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: mode,
										onChange: (event) => setMode(event.target.value),
										"aria-label": "检索模式",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "smart",
												children: "图增强召回"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "keyword",
												children: "关键词检索"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "basic",
												children: "基础匹配"
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.primaryButton,
										disabled: searching || query.trim() === "",
										children: searching ? "检索中…" : "召回"
									})
								]
							}),
							searchError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.inlineError,
								children: searchError
							}),
							!searched && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.emptyState,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: MnemonView_module_css_default.orbit,
										children: "◎"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "从一个明确问题开始" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "例如“为什么选用 SQLite？”或“这个项目有哪些发布约定？”。聚焦的查询会比批量加载整库更可靠。" })
								]
							}),
							searched && !searching && results.length === 0 && searchError === null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.emptyState,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "没有命中" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "换一个更具体的实体、决策或时间线关键词试试。" })]
							}),
							results.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.resultLayout,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.results,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.sectionHeading,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "召回结果" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [results.length, " 条"] })]
									}), results.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
										insight,
										writeEnabled,
										onRelated: (insight) => void showRelated(insight),
										onForget: (insight) => void forget(insight)
									}, insight.id))]
								}), relatedTo !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
									className: MnemonView_module_css_default.relatedPane,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.sectionHeading,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "关联记忆" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setRelatedTo(null),
												children: "×"
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: MnemonView_module_css_default.relatedSource,
											children: relatedTo.content
										}),
										relatedLoading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: MnemonView_module_css_default.loading,
											children: "正在遍历图谱…"
										}),
										!relatedLoading && related.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: MnemonView_module_css_default.muted,
											children: "没有找到两跳内的关联节点。"
										}),
										related.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
											insight,
											writeEnabled,
											onRelated: (insight) => void showRelated(insight),
											onForget: (insight) => void forget(insight)
										}, insight.id))
									]
								})]
							})
						]
					}),
					page === "remember" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
						className: MnemonView_module_css_default.page,
						children: !writeEnabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.emptyState,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "当前为只读模式" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
								"在 DSH profile 配置中将 ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "writeEnabled" }),
								" 设为 ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "true" }),
								" 后重启。"
							] })]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: MnemonView_module_css_default.rememberForm,
							onSubmit: (event) => void saveMemory(event),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formIntro,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "WRITEBACK" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "沉淀一条值得带走的记忆" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "写清事实、原因和适用范围。Mnemon 会在写入前做重复与冲突检查。" })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: MnemonView_module_css_default.fieldWide,
									children: ["内容", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										value: content,
										onChange: (event) => setContent(event.target.value),
										maxLength: 8e3,
										rows: 8,
										placeholder: "示例：项目选择 SQLite，因为需要单文件部署和本地优先；若并发写入成为瓶颈再评估 PostgreSQL。"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formGrid,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["分类", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
											value: rememberCategory,
											onChange: (event) => setRememberCategory(event.target.value),
											children: CATEGORIES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value,
												children: CATEGORY_LABELS[value]
											}, value))
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["重要性", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
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
											children: ["标签（逗号分隔）", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												value: tags,
												onChange: (event) => setTags(event.target.value),
												placeholder: "architecture, sqlite"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.primaryButton,
										disabled: saving || content.trim() === "",
										children: saving ? "保存中…" : "写入 Mnemon"
									}), saveResult !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: saveResult })]
								})
							]
						})
					}),
					page === "config" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
						className: MnemonView_module_css_default.page,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.configGrid,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: MnemonView_module_css_default.configCard,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: MnemonView_module_css_default.cardKicker,
											children: "RUNTIME"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "连接配置" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "CLI" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.cliPath ?? "mnemon" }) })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "版本" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status?.version ?? "—" })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Store" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.store ?? "default" }) })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "数据目录" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.dataDir ?? "~/.mnemon" }) })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "超时" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [status?.timeoutMs ?? "—", " ms"] })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "默认召回" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [status?.defaultRecallLimit ?? "—", " 条"] })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "写入" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: writeEnabled ? "已启用（本机页面）" : "只读" })] })
										] })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: MnemonView_module_css_default.configCard,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: MnemonView_module_css_default.cardKicker,
											children: "SETTINGS"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "用户配置" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: `# ~/.dsh/settings.yaml\nmnemon:\n  cliPath: /opt/homebrew/bin/mnemon\n  dataDir: ~/.mnemon\n  store: default\n  routingGuidance: true\n  tabEnabled: true\n  writeEnabled: true\n  timeoutMs: 10000\n  defaultRecallLimit: 10` }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "推荐从“设置 → 插件配置 → Mnemon 外置记忆”修改。用户设置覆盖 profile base，并在重启 DSH 后生效。" })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: MnemonView_module_css_default.configCard,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: MnemonView_module_css_default.cardKicker,
											children: "PRINCIPLE"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "工作方式" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "任务开始只在记忆可能改变结果时召回。" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "当前用户指令和仓库事实高于旧记忆。" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "任务结束只沉淀稳定、可复用、未来值得检索的洞察。" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Tab 不会自动把整个记忆库注入模型上下文。" })
										] })
									]
								})
							]
						})
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-mnemon-css:/Users/grivn/github.com/dsh-external/dsh-mnemon/src/client/MnemonSettingsCard.module.css.mjs
		const css = ".j5f0Ia_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:14px;overflow:hidden}.j5f0Ia_summary{box-sizing:border-box;width:100%;min-height:68px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:12px 14px;display:flex}.j5f0Ia_summary:hover{background:var(--dsw-alias-interactive-bg-hover)}.j5f0Ia_memoryMark{border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent);background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);width:32px;height:32px;font-family:var(--ds-font-family-code);border-radius:10px;flex:none;place-items:center;font-size:13px;font-weight:650;display:grid}.j5f0Ia_summaryCopy{flex:1;gap:3px;min-width:0;display:grid}.j5f0Ia_summaryCopy strong{font-size:14px;font-weight:600;line-height:20px}.j5f0Ia_summaryCopy small{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.j5f0Ia_summaryMeta{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:11px}.j5f0Ia_chevron{color:var(--dsw-alias-label-tertiary);font-size:17px;transition:transform .18s}.j5f0Ia_summary[aria-expanded=true] .j5f0Ia_chevron{transform:rotate(180deg)}.j5f0Ia_body{border-top:1px solid var(--dsw-alias-border-l2);padding:16px}.j5f0Ia_notice{color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent);border-radius:9px;margin-bottom:16px;padding:9px 11px;font-size:12px;line-height:18px}.j5f0Ia_notice span{color:var(--dsw-alias-label-tertiary);letter-spacing:.12em;font-family:var(--ds-font-family-code);margin-right:8px;font-size:10px}.j5f0Ia_notice code{font-family:var(--ds-font-family-code)}.j5f0Ia_grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px;display:grid}.j5f0Ia_field{gap:6px;min-width:0;display:grid}.j5f0Ia_fieldTitle{min-height:18px;color:var(--dsw-alias-label-primary);align-items:center;gap:6px;font-size:12px;font-weight:500;display:flex}.j5f0Ia_fieldTitle em,.j5f0Ia_toggleRow em{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover);border-radius:999px;padding:1px 6px;font-size:10px;font-style:normal;font-weight:400}.j5f0Ia_fieldTitle button,.j5f0Ia_resetLink{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;margin-left:auto;padding:0;font-size:11px}.j5f0Ia_fieldTitle button:hover,.j5f0Ia_resetLink:hover{color:var(--dsw-alias-label-primary)}.j5f0Ia_field input{box-sizing:border-box;width:100%;height:36px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);font-family:var(--ds-font-family-code);border-radius:9px;outline:0;padding:0 10px;font-size:12px}.j5f0Ia_field input:focus{border-color:var(--dsw-alias-label-tertiary)}.j5f0Ia_field small,.j5f0Ia_toggleRow small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.j5f0Ia_switches{border-top:1px solid var(--dsw-alias-border-l2);margin-top:18px;padding-top:6px}.j5f0Ia_toggleRow{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:12px;min-height:52px;display:flex}.j5f0Ia_toggleRow>span{flex:1;gap:2px;min-width:0;display:grid}.j5f0Ia_toggleRow strong{align-items:center;gap:6px;font-size:12px;font-weight:500;display:flex}.j5f0Ia_resetLink{white-space:nowrap}.j5f0Ia_switch{flex:none;width:34px;height:20px;position:relative}.j5f0Ia_switch input{opacity:0;width:0;height:0}.j5f0Ia_switch span{background:var(--dsw-alias-border-l2);cursor:pointer;border-radius:999px;transition:background .18s;position:absolute;inset:0}.j5f0Ia_switch span:after{content:\"\";background:#fff;border-radius:50%;width:16px;height:16px;transition:transform .18s;position:absolute;top:2px;left:2px;box-shadow:0 1px 3px #0003}.j5f0Ia_switch input:checked+span{background:var(--dsw-alias-label-primary)}.j5f0Ia_switch input:checked+span:after{transform:translate(14px)}.j5f0Ia_switch input:disabled+span{cursor:not-allowed;opacity:.5}.j5f0Ia_error,.j5f0Ia_readOnly{margin:12px 0 0;font-size:12px;line-height:18px}.j5f0Ia_error{color:var(--dsw-alias-state-error-primary)}.j5f0Ia_readOnly{color:var(--dsw-alias-label-tertiary)}.j5f0Ia_actions{justify-content:flex-end;gap:8px;margin-top:16px;display:flex}.j5f0Ia_actions button{cursor:pointer;border-radius:9px;height:34px;padding:0 13px;font-size:12px}.j5f0Ia_actions button:disabled{cursor:not-allowed;opacity:.45}.j5f0Ia_discard{color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l2);background:0 0}.j5f0Ia_save{color:var(--dsw-alias-bg-base);background:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-label-primary)}@media (width<=760px){.j5f0Ia_grid{grid-template-columns:1fr}.j5f0Ia_summaryMeta{display:none}.j5f0Ia_body{padding:14px}}";
		const tagId = "dsh-mnemon/MnemonSettingsCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MnemonSettingsCard_module_css_default = {
			"body": "j5f0Ia_body",
			"resetLink": "j5f0Ia_resetLink",
			"grid": "j5f0Ia_grid",
			"field": "j5f0Ia_field",
			"switch": "j5f0Ia_switch",
			"readOnly": "j5f0Ia_readOnly",
			"save": "j5f0Ia_save",
			"fieldTitle": "j5f0Ia_fieldTitle",
			"summaryCopy": "j5f0Ia_summaryCopy",
			"summaryMeta": "j5f0Ia_summaryMeta",
			"toggleRow": "j5f0Ia_toggleRow",
			"switches": "j5f0Ia_switches",
			"summary": "j5f0Ia_summary",
			"error": "j5f0Ia_error",
			"chevron": "j5f0Ia_chevron",
			"discard": "j5f0Ia_discard",
			"memoryMark": "j5f0Ia_memoryMark",
			"notice": "j5f0Ia_notice",
			"actions": "j5f0Ia_actions",
			"card": "j5f0Ia_card"
		};
		//#endregion
		//#region src/client/MnemonSettingsCard.tsx
		const FIELD_ORDER = [
			"cliPath",
			"dataDir",
			"store",
			"timeoutMs",
			"defaultRecallLimit",
			"routingGuidance",
			"tabEnabled",
			"writeEnabled"
		];
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
		}
		function draftOf(value) {
			const resolved = value ?? {};
			return {
				cliPath: resolved.cliPath?.trim() ?? "",
				dataDir: resolved.dataDir?.trim() ?? "",
				store: resolved.store?.trim() ?? "",
				timeoutMs: String(resolved.timeoutMs ?? 1e4),
				defaultRecallLimit: String(resolved.defaultRecallLimit ?? 10),
				routingGuidance: resolved.routingGuidance ?? true,
				tabEnabled: resolved.tabEnabled ?? true,
				writeEnabled: resolved.writeEnabled ?? true
			};
		}
		function inheritedDraft(base) {
			return draftOf(record(base));
		}
		function isBooleanField(field) {
			return field === "routingGuidance" || field === "tabEnabled" || field === "writeEnabled";
		}
		function parsed(field, value) {
			if (isBooleanField(field)) return value;
			if (field === "timeoutMs" || field === "defaultRecallLimit") return Number(value);
			return String(value).trim();
		}
		function validation(draft) {
			const timeout = Number(draft.timeoutMs);
			if (!Number.isInteger(timeout) || timeout < 100 || timeout > 12e4) return "CLI 超时需为 100–120000 之间的整数。";
			const limit = Number(draft.defaultRecallLimit);
			if (!Number.isInteger(limit) || limit < 1 || limit > 50) return "默认召回条数需为 1–50 之间的整数。";
			const store = String(draft.store).trim();
			if (store !== "" && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) return "Store 仅支持字母、数字、下划线和连字符。";
			return null;
		}
		function MnemonSettingsCard({ scope }) {
			const subscribe = (0, react.useMemo)(() => scope.subscribe.bind(scope), [scope]);
			const getSnapshot = (0, react.useMemo)(() => scope.getSnapshot.bind(scope), [scope]);
			const snapshot = (0, react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
			const [open, setOpen] = (0, react.useState)(false);
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
			const error = validation(draft);
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
					for (const field of FIELD_ORDER) {
						if (!dirty.has(field)) continue;
						if (reset.has(field) || !isBooleanField(field) && String(draft[field]).trim() === "" && (field === "cliPath" || field === "dataDir" || field === "store")) await scope.unset(field);
						else await scope.set(field, parsed(field, draft[field]));
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: MnemonSettingsCard_module_css_default.card,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: MnemonSettingsCard_module_css_default.summary,
					"aria-expanded": open,
					onClick: () => setOpen((value) => !value),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonSettingsCard_module_css_default.memoryMark,
							"aria-hidden": "true",
							children: "M"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: MnemonSettingsCard_module_css_default.summaryCopy,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Mnemon 外置记忆" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "配置持久记忆 CLI、Store 与读写策略。" })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonSettingsCard_module_css_default.summaryMeta,
							children: dirty.size > 0 ? "未保存" : "重启后生效"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MnemonSettingsCard_module_css_default.chevron,
							"aria-hidden": "true",
							children: "⌄"
						})
					]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonSettingsCard_module_css_default.body,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.notice,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "RESTART" }),
								" 保存到 ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: ".dsh/settings.yaml" }),
								"，重启 DSH 后应用。"
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.grid,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
									label: "Mnemon CLI",
									hint: "留空时按环境变量、PATH 与常见安装路径自动发现。",
									overridden: fieldMeta("cliPath"),
									onReset: () => resetField("cliPath"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										"aria-label": "Mnemon CLI",
										value: String(draft.cliPath),
										onChange: (event) => edit("cliPath", event.target.value),
										placeholder: "自动发现",
										disabled: !snapshot.writable
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
									label: "数据目录",
									hint: "Mnemon 根目录；留空沿用 MNEMON_DATA_DIR 或 ~/.mnemon。",
									overridden: fieldMeta("dataDir"),
									onReset: () => resetField("dataDir"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										"aria-label": "Mnemon 数据目录",
										value: String(draft.dataDir),
										onChange: (event) => edit("dataDir", event.target.value),
										placeholder: "~/.mnemon",
										disabled: !snapshot.writable
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
									label: "命名 Store",
									hint: "多个 Agent 共享时留空；需要隔离时指定稳定名称。",
									overridden: fieldMeta("store"),
									onReset: () => resetField("store"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										"aria-label": "Mnemon Store",
										value: String(draft.store),
										onChange: (event) => edit("store", event.target.value),
										placeholder: "active / default",
										disabled: !snapshot.writable
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
									label: "CLI 超时",
									hint: `单次命令上限，默认 10000 ms。`,
									overridden: fieldMeta("timeoutMs"),
									onReset: () => resetField("timeoutMs"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										"aria-label": "Mnemon CLI 超时",
										type: "number",
										min: 100,
										max: 12e4,
										step: 100,
										value: String(draft.timeoutMs),
										onChange: (event) => edit("timeoutMs", event.target.value),
										disabled: !snapshot.writable
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingField, {
									label: "默认召回条数",
									hint: `模型工具与 WebUI 的默认上限，默认 10。`,
									overridden: fieldMeta("defaultRecallLimit"),
									onReset: () => resetField("defaultRecallLimit"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										"aria-label": "Mnemon 默认召回条数",
										type: "number",
										min: 1,
										max: 50,
										value: String(draft.defaultRecallLimit),
										onChange: (event) => edit("defaultRecallLimit", event.target.value),
										disabled: !snapshot.writable
									})
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.switches,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingToggle, {
									label: "记忆路由指引",
									hint: "指导 Agent 按需召回、审慎写回。",
									checked: Boolean(draft.routingGuidance),
									overridden: fieldMeta("routingGuidance"),
									disabled: !snapshot.writable,
									onChange: (value) => edit("routingGuidance", value),
									onReset: () => resetField("routingGuidance")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingToggle, {
									label: "会话记忆 Tab",
									hint: "在会话页展示 Mnemon 检索与管理界面。",
									checked: Boolean(draft.tabEnabled),
									overridden: fieldMeta("tabEnabled"),
									disabled: !snapshot.writable,
									onChange: (value) => edit("tabEnabled", value),
									onReset: () => resetField("tabEnabled")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingToggle, {
									label: "允许写入",
									hint: "控制 Agent 与本机 WebUI 的 remember/link/forget 能力。",
									checked: Boolean(draft.writeEnabled),
									overridden: fieldMeta("writeEnabled"),
									disabled: !snapshot.writable,
									onChange: (value) => edit("writeEnabled", value),
									onReset: () => resetField("writeEnabled")
								})
							]
						}),
						error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonSettingsCard_module_css_default.error,
							role: "alert",
							children: error
						}),
						failed !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: MnemonSettingsCard_module_css_default.error,
							role: "alert",
							children: ["保存失败：", failed]
						}),
						!snapshot.writable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: MnemonSettingsCard_module_css_default.readOnly,
							children: "当前部署的 settings 为只读。"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonSettingsCard_module_css_default.actions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSettingsCard_module_css_default.discard,
								disabled: dirty.size === 0 || saving,
								onClick: discard,
								children: "放弃修改"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonSettingsCard_module_css_default.save,
								disabled: dirty.size === 0 || saving || error !== null || !snapshot.writable,
								onClick: () => void save(),
								children: saving ? "保存中…" : "保存到 settings.yaml"
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
							props.overridden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: "已覆盖" }),
							props.overridden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (event) => {
									event.preventDefault();
									props.onReset();
								},
								children: "恢复默认"
							})
						]
					}),
					props.children,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.hint })
				]
			});
		}
		function SettingToggle(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonSettingsCard_module_css_default.toggleRow,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [props.label, props.overridden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: "已覆盖" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.hint })] }),
					props.overridden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: MnemonSettingsCard_module_css_default.resetLink,
						onClick: props.onReset,
						children: "恢复默认"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: MnemonSettingsCard_module_css_default.switch,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							"aria-label": props.label,
							checked: props.checked,
							disabled: props.disabled,
							onChange: (event) => props.onChange(event.target.checked)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {})]
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
		const inject = ["slots", "connection"];
		/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
		function apply(rawContext) {
			const ctx = rawContext;
			const settings = new MnemonSettingsScope(ctx.connection);
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "mnemon",
				order: 30,
				label: "记忆",
				inject: () => ({ connection: ctx.connection })
			}, MnemonView));
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "mnemon",
				order: 20,
				inject: () => ({ scope: settings })
			}, MnemonSettingsCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map