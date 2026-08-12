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
		const css = ":root{--mn-bg:var(--dsw-alias-background-primary,#f6f7fb);--mn-panel:var(--dsw-alias-background-secondary,#fff);--mn-text:var(--dsw-alias-content-primary,#151823);--mn-muted:var(--dsw-alias-content-secondary,#687083);--mn-line:var(--dsw-alias-border-secondary,#232d461f);--mn-primary:var(--dsw-alias-state-business-primary,#4b67f2);--mn-primary-soft:color-mix(in srgb, var(--mn-primary) 12%, transparent);--mn-danger:#d14b59}.lvR3Qq_shell{box-sizing:border-box;min-height:100%;color:var(--mn-text);background:radial-gradient(circle at 88% 2%, color-mix(in srgb, var(--mn-primary) 11%, transparent), transparent 34rem), var(--mn-bg);font:14px/1.55 ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.lvR3Qq_header{justify-content:space-between;align-items:flex-start;gap:24px;padding:32px clamp(20px,4vw,56px) 24px;display:flex}.lvR3Qq_header h1{letter-spacing:-.035em;margin:2px 0 4px;font-size:clamp(25px,3vw,36px);line-height:1.15}.lvR3Qq_header p,.lvR3Qq_formIntro p,.lvR3Qq_configCard p{color:var(--mn-muted);margin:0}.lvR3Qq_eyebrow,.lvR3Qq_cardKicker,.lvR3Qq_formIntro>span{color:var(--mn-primary);letter-spacing:.18em;font-size:10px;font-weight:800}.lvR3Qq_statusCluster{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-panel) 86%, transparent);min-height:36px;color:var(--mn-muted);backdrop-filter:blur(12px);border-radius:999px;align-items:center;gap:8px;padding:0 6px 0 12px;font-size:12px;display:flex}.lvR3Qq_statusDot{border-radius:50%;width:8px;height:8px}.lvR3Qq_online{background:#2eb67d;box-shadow:0 0 0 4px #2eb67d24}.lvR3Qq_offline{background:var(--mn-danger);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-danger) 12%, transparent)}.lvR3Qq_iconButton,.lvR3Qq_sectionHeading button{width:28px;height:28px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:50%;place-items:center;display:grid}.lvR3Qq_iconButton:hover,.lvR3Qq_sectionHeading button:hover{background:var(--mn-primary-soft);color:var(--mn-primary)}.lvR3Qq_alert,.lvR3Qq_inlineError{border:1px solid color-mix(in srgb, var(--mn-danger) 28%, transparent);background:color-mix(in srgb, var(--mn-danger) 7%, var(--mn-panel));color:var(--mn-danger);border-radius:12px;margin:0 clamp(20px,4vw,56px) 20px;padding:12px 14px}.lvR3Qq_alert{flex-direction:column;gap:2px;display:flex}.lvR3Qq_metrics{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:0 clamp(20px,4vw,56px) 22px;display:grid}.lvR3Qq_metric,.lvR3Qq_insightCard,.lvR3Qq_relatedPane,.lvR3Qq_rememberForm,.lvR3Qq_configCard{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-panel) 94%, transparent);box-shadow:0 12px 35px #161c300a}.lvR3Qq_metric{border-radius:14px;flex-direction:column;justify-content:center;min-height:72px;padding:10px 16px;display:flex}.lvR3Qq_metric span{color:var(--mn-muted);font-size:11px}.lvR3Qq_metric strong{font-variant-numeric:tabular-nums;margin-top:3px;font-size:22px}.lvR3Qq_nav{border-bottom:1px solid var(--mn-line);gap:4px;padding:0 clamp(20px,4vw,56px);display:flex}.lvR3Qq_nav button{color:var(--mn-muted);font:inherit;cursor:pointer;background:0 0;border:0;padding:12px 18px;font-weight:600;position:relative}.lvR3Qq_nav button[aria-current=page]{color:var(--mn-primary)}.lvR3Qq_nav button[aria-current=page]:after{background:var(--mn-primary);content:\"\";border-radius:2px 2px 0 0;height:2px;position:absolute;bottom:-1px;left:9px;right:9px}.lvR3Qq_page{padding:24px clamp(20px,4vw,56px) 56px}.lvR3Qq_searchBar{border:1px solid var(--mn-line);background:var(--mn-panel);border-radius:15px;grid-template-columns:auto minmax(180px,1fr) auto auto auto;align-items:center;gap:8px;max-width:1100px;margin:0 auto;padding:7px;display:grid;box-shadow:0 14px 38px #161c300f}.lvR3Qq_searchIcon{color:var(--mn-muted);padding-left:10px;font-size:20px}.lvR3Qq_searchBar input,.lvR3Qq_searchBar select,.lvR3Qq_rememberForm input,.lvR3Qq_rememberForm select,.lvR3Qq_rememberForm textarea{box-sizing:border-box;border:1px solid var(--mn-line);color:var(--mn-text);background:var(--mn-panel);font:inherit;border-radius:9px;outline:none}.lvR3Qq_searchBar input{background:0 0;border:0;min-width:0;padding:9px 6px}.lvR3Qq_searchBar select{max-width:160px;padding:9px 28px 9px 10px}.lvR3Qq_searchBar input:focus,.lvR3Qq_searchBar select:focus,.lvR3Qq_rememberForm input:focus,.lvR3Qq_rememberForm select:focus,.lvR3Qq_rememberForm textarea:focus{border-color:var(--mn-primary);box-shadow:0 0 0 3px var(--mn-primary-soft)}.lvR3Qq_primaryButton,.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{font:inherit;cursor:pointer;border-radius:9px;font-weight:650}.lvR3Qq_primaryButton{border:1px solid var(--mn-primary);color:#fff;background:var(--mn-primary);padding:10px 17px}.lvR3Qq_primaryButton:disabled{opacity:.5;cursor:default}.lvR3Qq_primaryButton:not(:disabled):hover{filter:brightness(1.07)}.lvR3Qq_inlineError{max-width:1070px;margin:16px auto}.lvR3Qq_emptyState{text-align:center;place-content:center;max-width:570px;min-height:310px;margin:30px auto 0;display:grid}.lvR3Qq_emptyState h2{margin:8px 0 4px;font-size:18px}.lvR3Qq_emptyState p{color:var(--mn-muted);margin:0}.lvR3Qq_orbit{color:var(--mn-primary);font-size:46px;font-weight:300}.lvR3Qq_resultLayout{grid-template-columns:minmax(0,1fr);gap:18px;max-width:1100px;margin:24px auto 0;display:grid}.lvR3Qq_resultLayout:has(.lvR3Qq_relatedPane){grid-template-columns:minmax(0,1fr) minmax(300px,.72fr)}.lvR3Qq_results{align-content:start;gap:10px;display:grid}.lvR3Qq_sectionHeading{justify-content:space-between;align-items:center;min-height:31px;display:flex}.lvR3Qq_sectionHeading h2{margin:0;font-size:15px}.lvR3Qq_sectionHeading span{color:var(--mn-muted);font-size:12px}.lvR3Qq_insightCard{border-radius:13px;padding:16px}.lvR3Qq_cardTop{justify-content:space-between;align-items:flex-start;gap:10px;display:flex}.lvR3Qq_badges{flex-wrap:wrap;gap:5px;display:flex}.lvR3Qq_badge{color:var(--mn-primary);background:var(--mn-primary-soft);border-radius:999px;padding:2px 7px;font-size:10px;font-weight:650}.lvR3Qq_id{color:var(--mn-muted);font-size:10px}.lvR3Qq_content{white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0 10px}.lvR3Qq_tags{color:var(--mn-muted);flex-wrap:wrap;gap:9px;font-size:11px;display:flex}.lvR3Qq_cardActions{justify-content:flex-end;gap:6px;margin-top:13px;display:flex}.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{border:1px solid var(--mn-line);color:var(--mn-muted);background:0 0;padding:5px 9px;font-size:11px}.lvR3Qq_ghostButton:hover{border-color:var(--mn-primary);color:var(--mn-primary)}.lvR3Qq_dangerButton:hover{border-color:var(--mn-danger);color:var(--mn-danger)}.lvR3Qq_relatedPane{border-radius:15px;align-self:start;max-height:calc(100vh - 160px);padding:14px;position:sticky;top:18px;overflow:auto}.lvR3Qq_relatedSource{color:var(--mn-muted);background:var(--mn-primary-soft);border-radius:9px;margin:8px 0 14px;padding:10px;font-size:12px}.lvR3Qq_relatedPane .lvR3Qq_insightCard{box-shadow:none;margin-top:8px}.lvR3Qq_loading,.lvR3Qq_muted{color:var(--mn-muted);text-align:center;padding:24px 10px}.lvR3Qq_rememberForm{border-radius:18px;gap:20px;max-width:760px;margin:0 auto;padding:clamp(22px,4vw,40px);display:grid}.lvR3Qq_formIntro h2{margin:3px 0 5px;font-size:22px}.lvR3Qq_rememberForm label{color:var(--mn-muted);gap:7px;font-size:12px;font-weight:650;display:grid}.lvR3Qq_rememberForm input,.lvR3Qq_rememberForm select,.lvR3Qq_rememberForm textarea{width:100%;color:var(--mn-text);resize:vertical;padding:10px 12px;font-weight:400}.lvR3Qq_formGrid{grid-template-columns:1fr 1fr;gap:15px;display:grid}.lvR3Qq_fieldWide{grid-column:1/-1}.lvR3Qq_formActions{color:var(--mn-muted);align-items:center;gap:14px;font-size:12px;display:flex}.lvR3Qq_configGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;max-width:1050px;margin:0 auto;display:grid}.lvR3Qq_configCard{border-radius:15px;padding:22px;overflow:hidden}.lvR3Qq_configCard:last-child{grid-column:1/-1}.lvR3Qq_configCard h2{margin:3px 0 16px;font-size:18px}.lvR3Qq_configCard dl{margin:0}.lvR3Qq_configCard dl>div{border-bottom:1px solid var(--mn-line);grid-template-columns:92px minmax(0,1fr);gap:10px;padding:9px 0;display:grid}.lvR3Qq_configCard dl>div:last-child{border-bottom:0}.lvR3Qq_configCard dt{color:var(--mn-muted)}.lvR3Qq_configCard dd{overflow-wrap:anywhere;min-width:0;margin:0}.lvR3Qq_configCard code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.92em}.lvR3Qq_configCard pre{color:#dce5ff;background:#171b28;border-radius:10px;max-height:310px;margin:0 0 12px;padding:14px;font:12px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace;overflow:auto}.lvR3Qq_configCard ul{color:var(--mn-muted);margin:0;padding-left:20px}.lvR3Qq_configCard li+li{margin-top:7px}@media (width<=850px){.lvR3Qq_metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.lvR3Qq_searchBar{grid-template-columns:auto minmax(0,1fr) auto}.lvR3Qq_searchBar select{grid-row:2;max-width:none}.lvR3Qq_searchBar select:first-of-type{grid-column:2}.lvR3Qq_searchBar select:last-of-type{grid-column:3}.lvR3Qq_resultLayout:has(.lvR3Qq_relatedPane){grid-template-columns:1fr}.lvR3Qq_relatedPane{max-height:none;position:static}.lvR3Qq_configGrid{grid-template-columns:1fr}.lvR3Qq_configCard:last-child{grid-column:auto}}@media (width<=560px){.lvR3Qq_header{flex-direction:column;padding-top:22px}.lvR3Qq_metrics{grid-template-columns:1fr 1fr}.lvR3Qq_metric{min-height:60px}.lvR3Qq_metric strong{font-size:18px}.lvR3Qq_searchBar{flex-wrap:wrap;display:flex}.lvR3Qq_searchBar input{flex:calc(100% - 40px)}.lvR3Qq_searchBar select{flex:45%}.lvR3Qq_searchBar .lvR3Qq_primaryButton{flex:100%}.lvR3Qq_formGrid{grid-template-columns:1fr}.lvR3Qq_fieldWide{grid-column:auto}.lvR3Qq_formActions{flex-direction:column;align-items:stretch}}body[data-ds-dark-theme] .lvR3Qq_shell{--mn-bg:var(--dsw-alias-background-primary,#11131a);--mn-panel:var(--dsw-alias-background-secondary,#191c25);--mn-text:var(--dsw-alias-content-primary,#eef1f8);--mn-muted:var(--dsw-alias-content-secondary,#9ba4b8);--mn-line:var(--dsw-alias-border-secondary,#dce4ff1f)}";
		const tagId = "dsh-mnemon/MnemonView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MnemonView_module_css_default = {
			"offline": "lvR3Qq_offline",
			"searchIcon": "lvR3Qq_searchIcon",
			"badges": "lvR3Qq_badges",
			"online": "lvR3Qq_online",
			"insightCard": "lvR3Qq_insightCard",
			"rememberForm": "lvR3Qq_rememberForm",
			"header": "lvR3Qq_header",
			"emptyState": "lvR3Qq_emptyState",
			"cardTop": "lvR3Qq_cardTop",
			"resultLayout": "lvR3Qq_resultLayout",
			"badge": "lvR3Qq_badge",
			"sectionHeading": "lvR3Qq_sectionHeading",
			"muted": "lvR3Qq_muted",
			"configCard": "lvR3Qq_configCard",
			"content": "lvR3Qq_content",
			"configGrid": "lvR3Qq_configGrid",
			"nav": "lvR3Qq_nav",
			"formActions": "lvR3Qq_formActions",
			"metrics": "lvR3Qq_metrics",
			"relatedSource": "lvR3Qq_relatedSource",
			"statusCluster": "lvR3Qq_statusCluster",
			"relatedPane": "lvR3Qq_relatedPane",
			"page": "lvR3Qq_page",
			"searchBar": "lvR3Qq_searchBar",
			"id": "lvR3Qq_id",
			"fieldWide": "lvR3Qq_fieldWide",
			"statusDot": "lvR3Qq_statusDot",
			"formIntro": "lvR3Qq_formIntro",
			"inlineError": "lvR3Qq_inlineError",
			"tags": "lvR3Qq_tags",
			"eyebrow": "lvR3Qq_eyebrow",
			"orbit": "lvR3Qq_orbit",
			"cardActions": "lvR3Qq_cardActions",
			"results": "lvR3Qq_results",
			"dangerButton": "lvR3Qq_dangerButton",
			"alert": "lvR3Qq_alert",
			"loading": "lvR3Qq_loading",
			"formGrid": "lvR3Qq_formGrid",
			"iconButton": "lvR3Qq_iconButton",
			"ghostButton": "lvR3Qq_ghostButton",
			"metric": "lvR3Qq_metric",
			"primaryButton": "lvR3Qq_primaryButton",
			"shell": "lvR3Qq_shell",
			"cardKicker": "lvR3Qq_cardKicker"
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
											children: "PROFILE"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "DSH 配置示例" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: `- id: mnemon\n  config:\n    cliPath: /opt/homebrew/bin/mnemon\n    dataDir: ~/.mnemon\n    store: default\n    routingGuidance: true\n    tabEnabled: true\n    writeEnabled: true\n    timeoutMs: 10000\n    defaultRecallLimit: 10` }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
											"未填写 ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "dataDir" }),
											" / ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "store" }),
											" 时，保留 Mnemon 自身的环境变量与 active store 解析规则。"
										] })
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
		//#region src/client/index.ts
		const inject = ["slots", "connection"];
		/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
		function apply(rawContext) {
			const ctx = rawContext;
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "mnemon",
				order: 30,
				label: "记忆",
				inject: () => ({ connection: ctx.connection })
			}, MnemonView));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map