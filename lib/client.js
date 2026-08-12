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
		const css = ".lvR3Qq_shell{--mn-bg:var(--dsw-alias-bg-base);--mn-layer-1:var(--dsw-alias-bg-layer-1);--mn-layer-2:var(--dsw-alias-bg-layer-2);--mn-input:var(--dsw-specific-input-major);--mn-text:var(--dsw-alias-label-primary);--mn-muted:var(--dsw-alias-label-secondary);--mn-faint:var(--dsw-alias-label-tertiary);--mn-line:var(--dsw-alias-border-l2);--mn-line-strong:var(--dsw-alias-border-l1);--mn-accent:var(--dsw-alias-state-business-primary);--mn-hover:var(--dsw-alias-interactive-bg-hover);--mn-danger:var(--dsw-alias-state-error-primary);--mn-success:var(--dsw-alias-state-success-primary);--mn-code:var(--ds-font-family-code,\"SFMono-Regular\", Consolas, monospace);box-sizing:border-box;height:100%;min-height:600px;color:var(--mn-text);background:var(--mn-bg);flex-direction:column;font:13px/1.55 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:flex;overflow:hidden}.lvR3Qq_shell *,.lvR3Qq_shell :before,.lvR3Qq_shell :after{box-sizing:border-box}.lvR3Qq_shell button,.lvR3Qq_shell input,.lvR3Qq_shell select,.lvR3Qq_shell textarea{color:inherit;font:inherit}.lvR3Qq_masthead{border-bottom:1px solid var(--mn-line);background:radial-gradient(circle at 70% -70%, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 42%), var(--mn-bg);flex:none;justify-content:space-between;align-items:center;gap:24px;min-height:84px;padding:13px clamp(18px,2.5vw,32px);display:flex}.lvR3Qq_brand{align-items:center;gap:13px;min-width:0;display:flex}.lvR3Qq_brandLogo{width:46px;height:46px;box-shadow:0 0 0 1px var(--mn-line-strong);border-radius:10px;flex:none;overflow:hidden}.lvR3Qq_brand h1{letter-spacing:-.02em;margin:1px 0 0;font-size:19px;line-height:1.15}.lvR3Qq_brand p{color:var(--mn-muted);margin:3px 0 0;font-size:12px}.lvR3Qq_eyebrow,.lvR3Qq_cardKicker,.lvR3Qq_pageHeader>div>span,.lvR3Qq_sectionHeading>div>span,.lvR3Qq_sidebarFooter>span,.lvR3Qq_entityHeading>span,.lvR3Qq_inspectorHeading>span,.lvR3Qq_inspectorEmpty>span{color:var(--mn-faint);font:650 9px/1.2 var(--mn-code);letter-spacing:.12em;text-transform:uppercase}.lvR3Qq_statusCluster{border:1px solid var(--mn-line-strong);min-height:34px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:9px;flex:none;align-items:center;gap:8px;padding:0 4px 0 11px;font-size:11px;display:flex}.lvR3Qq_statusDot{border-radius:50%;width:6px;height:6px}.lvR3Qq_online{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 15%, transparent)}.lvR3Qq_offline{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 14%, transparent)}.lvR3Qq_iconButton{width:27px;height:27px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.lvR3Qq_iconButton:hover{color:var(--mn-accent);background:var(--mn-hover)}.lvR3Qq_alert,.lvR3Qq_inlineError{border:1px solid color-mix(in srgb, var(--mn-danger) 32%, transparent);color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 7%, var(--mn-layer-1));border-radius:9px;padding:10px 13px;font-size:12px}.lvR3Qq_alert{flex-direction:column;flex:none;margin:10px clamp(18px,2.5vw,32px) 0;display:flex}.lvR3Qq_telemetry{border-bottom:1px solid var(--mn-line);background:var(--mn-layer-1);flex:none;grid-template-columns:minmax(160px,1.25fr) repeat(4,minmax(90px,1fr));min-height:57px;padding:0 clamp(18px,2.5vw,32px);display:grid}.lvR3Qq_telemetryLead,.lvR3Qq_telemetryMetric{align-items:center;min-width:0;display:flex}.lvR3Qq_telemetryLead{color:var(--mn-faint);font:600 9px/1 var(--mn-code);letter-spacing:.08em;text-transform:uppercase;gap:9px}.lvR3Qq_telemetryPulse{background:var(--mn-accent);width:7px;height:7px;box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-accent) 11%, transparent);border-radius:2px}.lvR3Qq_telemetryMetric{border-left:1px solid var(--mn-line);justify-content:space-between;gap:10px;padding:0 15px}.lvR3Qq_telemetryMetric span{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.lvR3Qq_telemetryMetric strong{font:650 14px/1 var(--mn-code);font-variant-numeric:tabular-nums}.lvR3Qq_workspace{flex:1;min-height:0;display:flex}.lvR3Qq_sidebar{border-right:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 56%, var(--mn-bg));flex-direction:column;flex:0 0 198px;justify-content:space-between;width:198px;padding:14px 10px 12px;display:flex}.lvR3Qq_nav{gap:3px;display:grid}.lvR3Qq_nav button{width:100%;color:var(--mn-muted);text-align:left;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;grid-template-columns:28px minmax(0,1fr);align-items:center;gap:8px;padding:7px 8px;display:grid}.lvR3Qq_nav button:hover{color:var(--mn-text);background:var(--mn-hover)}.lvR3Qq_nav button[aria-current=page]{border-color:var(--mn-line);color:var(--mn-text);background:var(--mn-layer-1);box-shadow:0 1px 2px color-mix(in srgb, var(--mn-text) 5%, transparent)}.lvR3Qq_nav button[aria-current=page] .lvR3Qq_navGlyph{border-color:color-mix(in srgb, var(--mn-accent) 40%, var(--mn-line));color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent)}.lvR3Qq_nav button>span:last-child{min-width:0;display:grid}.lvR3Qq_nav button strong{font-size:12px;font-weight:600}.lvR3Qq_nav button small{color:var(--mn-faint);font-size:10px}.lvR3Qq_navGlyph{border:1px solid var(--mn-line);width:27px;height:27px;color:var(--mn-faint);background:var(--mn-bg);font:600 14px/1 var(--mn-code);border-radius:7px;place-items:center;display:grid}.lvR3Qq_sidebarFooter{border-top:1px solid var(--mn-line);gap:4px;padding:12px 10px 5px;display:grid}.lvR3Qq_sidebarFooter code{font:600 11px/1.3 var(--mn-code);text-overflow:ellipsis;overflow:hidden}.lvR3Qq_sidebarFooter small{color:var(--mn-faint);font-size:10px}.lvR3Qq_canvas{background:var(--mn-bg);flex:1;min-width:0;overflow:auto}.lvR3Qq_page{width:min(1240px,100%);min-height:100%;margin:0 auto;padding:clamp(20px,2.8vw,34px)}.lvR3Qq_pageHeader{justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:22px;display:flex}.lvR3Qq_pageHeader h2{letter-spacing:-.025em;margin:4px 0 3px;font-size:22px;line-height:1.2}.lvR3Qq_pageHeader p{max-width:690px;color:var(--mn-muted);margin:0;font-size:12px}.lvR3Qq_pageHeaderMeta{flex:none;align-items:center;gap:9px;display:flex}.lvR3Qq_pageHeaderMeta>code{border:1px solid var(--mn-line);color:var(--mn-faint);background:var(--mn-layer-1);font:600 9px/1 var(--mn-code);letter-spacing:.06em;border-radius:7px;padding:6px 8px}.lvR3Qq_primaryButton,.lvR3Qq_secondaryButton,.lvR3Qq_ghostButton,.lvR3Qq_dangerButton,.lvR3Qq_dangerSolidButton{cursor:pointer;border-radius:8px;min-height:34px;padding:0 13px;font-size:12px}.lvR3Qq_primaryButton{border:1px solid var(--mn-accent);color:#fff;background:var(--mn-accent)}.lvR3Qq_secondaryButton{border:1px solid var(--mn-line-strong);color:var(--mn-text);background:var(--mn-layer-1)}.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{background:0 0;border:1px solid #0000;min-height:29px;padding:0 8px}.lvR3Qq_ghostButton{color:var(--mn-muted)}.lvR3Qq_dangerButton{color:var(--mn-danger)}.lvR3Qq_dangerSolidButton{border:1px solid var(--mn-danger);color:#fff;background:var(--mn-danger);min-height:29px}.lvR3Qq_primaryButton:hover,.lvR3Qq_secondaryButton:hover,.lvR3Qq_ghostButton:hover,.lvR3Qq_dangerButton:hover{filter:brightness(.98);background-color:var(--mn-hover)}.lvR3Qq_primaryButton:hover{background-color:var(--mn-accent)}.lvR3Qq_shell button:disabled{cursor:not-allowed;opacity:.48}.lvR3Qq_emptyState{border:1px dashed var(--mn-line-strong);background:color-mix(in srgb, var(--mn-layer-1) 50%, transparent);border-radius:13px;justify-content:center;align-items:center;gap:22px;min-height:220px;padding:30px;display:flex}.lvR3Qq_emptyGlyph{border:1px solid color-mix(in srgb, var(--mn-accent) 35%, var(--mn-line));width:76px;height:76px;color:var(--mn-accent);background:radial-gradient(circle, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 65%);font:500 26px/1 var(--mn-code);border-radius:50%;flex:none;place-items:center;display:grid}.lvR3Qq_emptyState h3{margin:0 0 5px;font-size:16px}.lvR3Qq_emptyState p{max-width:500px;color:var(--mn-muted);margin:0}.lvR3Qq_loadingPanel{border:1px solid var(--mn-line);min-height:220px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:13px;place-items:center;display:grid}.lvR3Qq_inlineError{margin:0 0 14px}.lvR3Qq_muted,.lvR3Qq_loading{color:var(--mn-faint);padding:16px 0;font-size:12px}.lvR3Qq_bodyDirectory{border:1px solid var(--mn-line);background:var(--mn-layer-1);box-shadow:0 8px 30px color-mix(in srgb, var(--mn-text) 3%, transparent);border-radius:13px;margin-bottom:16px;padding:15px}.lvR3Qq_bodyDirectoryHeader{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:13px;display:flex}.lvR3Qq_bodyDirectoryHeader h3{margin:4px 0 2px;font-size:15px}.lvR3Qq_bodyDirectoryHeader p{color:var(--mn-muted);margin:0;font-size:10px}.lvR3Qq_bodyDirectoryHeader>strong{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 9px var(--mn-code);border-radius:999px;flex:none;padding:5px 8px}.lvR3Qq_bodyGrid{grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:8px;display:grid}.lvR3Qq_bodyCard{--mn-body-accent:var(--mn-faint);border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 44%, var(--mn-layer-1));opacity:.7;border-radius:10px;min-width:0;padding:11px;transition:opacity .18s,border-color .18s,transform .18s}.lvR3Qq_bodyCard[data-active]{border-color:color-mix(in srgb, var(--mn-body-accent) 42%, var(--mn-line));opacity:1;box-shadow:inset 0 1px 0 color-mix(in srgb, var(--mn-body-accent) 10%, transparent)}.lvR3Qq_bodyCard:hover{transform:translateY(-1px)}.lvR3Qq_bodyCardTop{grid-template-columns:7px minmax(0,1fr) auto;align-items:center;gap:8px;display:grid}.lvR3Qq_bodySignal{background:var(--mn-faint);border-radius:50%;width:7px;height:7px}.lvR3Qq_bodyCard[data-active] .lvR3Qq_bodySignal{background:var(--mn-body-accent);box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-body-accent) 14%, transparent)}.lvR3Qq_bodyCardTop>div{min-width:0;display:grid}.lvR3Qq_bodyCardTop strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.lvR3Qq_bodyCardTop code{color:var(--mn-faint);font:9px var(--mn-code);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.lvR3Qq_bodyCardTop button{border:1px solid var(--mn-line);min-height:27px;color:var(--mn-muted);background:var(--mn-layer-1);cursor:pointer;border-radius:999px;align-items:center;gap:5px;padding:0 8px;font-size:9px;display:flex}.lvR3Qq_bodyCardTop button i{background:var(--mn-faint);border-radius:50%;width:7px;height:7px}.lvR3Qq_bodyCardTop button[aria-checked=true]{border-color:color-mix(in srgb, var(--mn-body-accent) 38%, var(--mn-line));color:var(--mn-text)}.lvR3Qq_bodyCardTop button[aria-checked=true] i{background:var(--mn-body-accent)}.lvR3Qq_bodyCard>p{min-height:31px;color:var(--mn-muted);margin:10px 0;font-size:10px;line-height:1.5}.lvR3Qq_bodyCard footer{border-top:1px solid var(--mn-line);color:var(--mn-faint);flex-wrap:wrap;gap:5px 11px;padding-top:8px;font-size:9px;display:flex}.lvR3Qq_bodyCreate{border-top:1px solid var(--mn-line);margin-top:10px;padding-top:8px}.lvR3Qq_bodyCreate summary{cursor:pointer;width:max-content;color:var(--mn-accent);font-size:10px;list-style:none}.lvR3Qq_bodyCreate summary::-webkit-details-marker{display:none}.lvR3Qq_bodyCreate form{grid-template-columns:minmax(130px,.7fr) minmax(150px,.9fr) minmax(230px,1.7fr) auto;gap:7px;margin-top:9px;display:grid}.lvR3Qq_bodyCreate input{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:0;height:34px;padding:0 9px}.lvR3Qq_bodyCreate input:focus{border-color:var(--mn-accent)}.lvR3Qq_graphLayout{grid-template-columns:minmax(0,1fr) 270px;gap:14px;display:grid}.lvR3Qq_graphPanel,.lvR3Qq_graphInspector{border:1px solid var(--mn-line);background:var(--mn-layer-1);box-shadow:0 8px 30px color-mix(in srgb, var(--mn-text) 3%, transparent);border-radius:13px}.lvR3Qq_graphPanel{min-width:0;overflow:hidden}.lvR3Qq_graphToolbar,.lvR3Qq_graphFooter{min-height:43px;color:var(--mn-muted);justify-content:space-between;align-items:center;gap:14px;padding:0 13px;font-size:10px;display:flex}.lvR3Qq_graphToolbar{border-bottom:1px solid var(--mn-line)}.lvR3Qq_graphToolbar>div:first-child{align-items:center;gap:7px;display:flex}.lvR3Qq_graphToolbar small{color:var(--mn-faint)}.lvR3Qq_liveDot{background:var(--mn-success);width:6px;height:6px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 15%, transparent);border-radius:50%}.lvR3Qq_graphLegend{gap:10px;display:flex}.lvR3Qq_graphLegend span{align-items:center;gap:4px;display:flex}.lvR3Qq_graphLegend span:before{content:\"\";background:var(--edge-color);border-radius:2px;width:13px;height:2px}.lvR3Qq_graphLegend [data-edge=temporal]{--edge-color:#87909f}.lvR3Qq_graphLegend [data-edge=semantic]{--edge-color:#4d7cfe}.lvR3Qq_graphLegend [data-edge=causal]{--edge-color:#ef6b5b}.lvR3Qq_graphLegend [data-edge=entity]{--edge-color:#22a879}.lvR3Qq_graphViewport{background:radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--mn-accent) 6%, transparent), transparent 47%);min-height:480px;position:relative;overflow:hidden}.lvR3Qq_graphCanvasControls{z-index:2;border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 88%, transparent);box-shadow:0 6px 18px color-mix(in srgb, var(--mn-text) 7%, transparent);backdrop-filter:blur(10px);border-radius:9px;align-items:center;gap:5px;padding:4px;display:flex;position:absolute;top:10px;right:10px}.lvR3Qq_graphCanvasControls span{color:var(--mn-faint);font:9px var(--mn-code);align-items:center;gap:5px;padding:0 6px;display:flex}.lvR3Qq_graphCanvasControls span i{background:var(--mn-accent);width:5px;height:5px;box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-accent) 12%, transparent);border-radius:50%}.lvR3Qq_graphCanvasControls button{min-height:26px;color:var(--mn-muted);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;padding:0 8px;font-size:9px}.lvR3Qq_graphCanvasControls button:hover,.lvR3Qq_graphCanvasControls button[data-active]{border-color:var(--mn-line);color:var(--mn-text);background:var(--mn-hover)}.lvR3Qq_graphCanvasControls button[data-active]{color:var(--mn-accent)}.lvR3Qq_graphSvg{touch-action:none;user-select:none;width:100%;height:auto;min-height:480px;display:block}.lvR3Qq_graphBackdrop{fill:var(--mn-layer-1)}.lvR3Qq_graphGridLine{stroke:var(--mn-line);stroke-width:.6px;opacity:.5}.lvR3Qq_graphEdge{fill:none;stroke:#87909f;stroke-width:1px;opacity:.32;vector-effect:non-scaling-stroke}.lvR3Qq_graphEdge[data-edge=semantic]{stroke:#4d7cfe;opacity:.48}.lvR3Qq_graphEdge[data-edge=causal]{stroke:#ef6b5b;opacity:.52}.lvR3Qq_graphEdge[data-edge=entity]{stroke:#22a879;opacity:.52}.lvR3Qq_graphNode{--node:#8290a8;cursor:grab;outline:none}.lvR3Qq_graphNode[data-dragging]{cursor:grabbing}.lvR3Qq_graphNode[data-category=decision]{--node:#ef8354}.lvR3Qq_graphNode[data-category=preference]{--node:#a879e1}.lvR3Qq_graphNode[data-category=fact]{--node:#4d7cfe}.lvR3Qq_graphNode[data-category=insight]{--node:#19a77d}.lvR3Qq_graphNode[data-category=context]{--node:#d8a624}.lvR3Qq_nodeHalo{fill:color-mix(in srgb, var(--node) 18%, var(--mn-layer-1));stroke:color-mix(in srgb, var(--node) 60%, var(--mn-layer-1));stroke-width:1.5px;transition:r .16s}.lvR3Qq_nodeCore{fill:var(--node)}.lvR3Qq_nodeLabel{fill:var(--mn-muted);font:10px var(--mn-code);pointer-events:none}.lvR3Qq_nodeBodyLabel{fill:var(--mn-faint);font:650 8px var(--mn-code);letter-spacing:.04em;pointer-events:none}.lvR3Qq_graphSvg[data-density=sparse] .lvR3Qq_nodeLabel{font-size:12px}.lvR3Qq_graphNode:hover .lvR3Qq_nodeHalo,.lvR3Qq_graphNode:focus .lvR3Qq_nodeHalo,.lvR3Qq_graphNode[data-selected] .lvR3Qq_nodeHalo{fill:color-mix(in srgb, var(--node) 28%, var(--mn-layer-1));stroke:var(--node)}.lvR3Qq_graphNode[data-selected] .lvR3Qq_nodeLabel{fill:var(--mn-text);font-weight:650}.lvR3Qq_graphFooter{border-top:1px solid var(--mn-line);min-height:38px;color:var(--mn-faint)}.lvR3Qq_graphInspector{min-height:560px;padding:17px}.lvR3Qq_inspectorEmpty{text-align:center;flex-direction:column;justify-content:center;align-items:center;height:100%;display:flex}.lvR3Qq_inspectorLogo{opacity:.72;border-radius:11px;width:54px;height:54px;margin-bottom:15px}.lvR3Qq_inspectorEmpty h3{margin:7px 0 3px;font-size:14px}.lvR3Qq_inspectorEmpty p{color:var(--mn-faint);margin:0;font-size:11px}.lvR3Qq_inspectorHeading{justify-content:space-between;align-items:center;display:flex}.lvR3Qq_inspectorHeading button,.lvR3Qq_sectionHeading button{width:27px;height:27px;color:var(--mn-muted);cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.lvR3Qq_inspectorHeading button:hover,.lvR3Qq_sectionHeading button:hover{background:var(--mn-hover)}.lvR3Qq_categoryChip{color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 10%, transparent);border-radius:999px;margin-top:24px;padding:3px 8px;font-size:10px;display:inline-flex}.lvR3Qq_graphInspector h3{margin:12px 0 20px;font-size:14px;line-height:1.6}.lvR3Qq_inspectorMeta{margin:0}.lvR3Qq_inspectorMeta>div{border-top:1px solid var(--mn-line);gap:3px;padding:11px 0;display:grid}.lvR3Qq_inspectorMeta dt{color:var(--mn-faint);font:9px var(--mn-code);text-transform:uppercase}.lvR3Qq_inspectorMeta dd{overflow-wrap:anywhere;color:var(--mn-muted);margin:0;font-size:11px}.lvR3Qq_inspectorActions{gap:8px;margin-top:20px;display:grid}.lvR3Qq_searchBar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:13px;margin-bottom:18px;padding:13px}.lvR3Qq_queryField{border:1px solid var(--mn-line-strong);background:var(--mn-input);border-radius:9px;grid-template-columns:24px minmax(0,1fr) 24px;align-items:center;gap:5px;padding:0 10px;display:grid}.lvR3Qq_queryField>span{color:var(--mn-accent);font:18px var(--mn-code)}.lvR3Qq_queryField input{background:0 0;border:0;outline:0;width:100%;height:42px}.lvR3Qq_queryField kbd{color:var(--mn-faint);font:11px var(--mn-code)}.lvR3Qq_searchControls{justify-content:flex-end;align-items:flex-end;gap:10px;padding-top:10px;display:flex}.lvR3Qq_searchControls label,.lvR3Qq_formGrid label,.lvR3Qq_fieldWide{color:var(--mn-muted);gap:5px;font-size:11px;display:grid}.lvR3Qq_searchControls select,.lvR3Qq_formGrid select,.lvR3Qq_formGrid input,.lvR3Qq_listToolbar input,.lvR3Qq_listToolbar select,.lvR3Qq_entitySearch input{border:1px solid var(--mn-line);background:var(--mn-input);border-radius:8px;outline:0;min-width:140px;height:34px;padding:0 9px}.lvR3Qq_searchControls select:focus,.lvR3Qq_formGrid select:focus,.lvR3Qq_formGrid input:focus,.lvR3Qq_listToolbar input:focus,.lvR3Qq_listToolbar select:focus,.lvR3Qq_entitySearch input:focus,.lvR3Qq_supervisedForm textarea:focus{border-color:var(--mn-accent)}.lvR3Qq_singleColumn{max-width:830px}.lvR3Qq_resultLayout{grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);align-items:start;gap:14px;display:grid}.lvR3Qq_results,.lvR3Qq_relatedPane,.lvR3Qq_entityResults{min-width:0}.lvR3Qq_sectionHeading{justify-content:space-between;align-items:center;gap:16px;min-height:39px;margin-bottom:8px;display:flex}.lvR3Qq_sectionHeading h3{margin:2px 0 0;font-size:15px}.lvR3Qq_sectionHeading>strong{min-width:27px;height:27px;color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent);font:650 11px var(--mn-code);border-radius:7px;place-items:center;display:grid}.lvR3Qq_relatedPane{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;padding:13px}.lvR3Qq_relatedSource{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:8px;margin:0 0 13px;padding:10px;font-size:11px}.lvR3Qq_insightCard{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;margin-bottom:9px;padding:13px;transition:border-color .15s,transform .15s}.lvR3Qq_insightCard:hover{border-color:var(--mn-line-strong);transform:translateY(-1px)}.lvR3Qq_cardTop{justify-content:space-between;align-items:center;gap:10px;display:flex}.lvR3Qq_badges,.lvR3Qq_tags,.lvR3Qq_entities{flex-wrap:wrap;gap:5px;display:flex}.lvR3Qq_badge{color:var(--mn-muted);background:var(--mn-layer-2);border-radius:999px;padding:2px 6px;font-size:9px}.lvR3Qq_id{color:var(--mn-faint);font:9px var(--mn-code)}.lvR3Qq_content{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0;line-height:1.65}.lvR3Qq_tags{color:var(--mn-accent);font-size:10px}.lvR3Qq_entities{margin-top:7px}.lvR3Qq_entities span{border:1px solid var(--mn-line);color:var(--mn-muted);border-radius:5px;padding:2px 6px;font-size:9px}.lvR3Qq_cardActions{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:3px;min-height:30px;margin-top:10px;padding-top:8px;display:flex}.lvR3Qq_confirmBar{width:100%;color:var(--mn-danger);justify-content:flex-end;align-items:center;gap:5px;font-size:11px;display:flex}.lvR3Qq_confirmBar>span{margin-right:auto}.lvR3Qq_entityLayout{grid-template-columns:265px minmax(0,1fr);align-items:start;gap:16px;display:grid}.lvR3Qq_entityRail{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;padding:13px;position:sticky;top:0}.lvR3Qq_entitySearch{grid-template-columns:minmax(0,1fr) auto;gap:7px;display:grid}.lvR3Qq_entitySearch input{min-width:0}.lvR3Qq_entityHeading{justify-content:space-between;align-items:center;margin:18px 2px 7px;display:flex}.lvR3Qq_entityHeading small{color:var(--mn-faint);font-size:9px}.lvR3Qq_entityList{gap:3px;display:grid}.lvR3Qq_entityList button{min-height:34px;color:var(--mn-muted);cursor:pointer;text-align:left;background:0 0;border:0;border-radius:7px;justify-content:space-between;align-items:center;gap:10px;padding:0 9px;display:flex}.lvR3Qq_entityList button:hover,.lvR3Qq_entityList button[aria-pressed=true]{color:var(--mn-text);background:var(--mn-hover)}.lvR3Qq_entityList strong{color:var(--mn-faint);font:10px var(--mn-code)}.lvR3Qq_entityResults>.lvR3Qq_emptyState{min-height:360px}.lvR3Qq_writebackLayout{grid-template-columns:minmax(220px,280px) minmax(0,1fr);align-items:start;gap:15px;display:grid}.lvR3Qq_writeGuide,.lvR3Qq_supervisedComposer{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px}.lvR3Qq_writeGuide{padding:17px}.lvR3Qq_writeGuide h3{margin:5px 0 15px;font-size:15px}.lvR3Qq_writeGuide ol{counter-reset:gate;gap:13px;margin:0;padding:0;list-style:none;display:grid}.lvR3Qq_writeGuide li{counter-increment:gate;grid-template-columns:22px minmax(0,1fr);column-gap:7px;display:grid}.lvR3Qq_writeGuide li:before{content:\"0\" counter(gate);color:var(--mn-accent);font:10px var(--mn-code);grid-row:span 2}.lvR3Qq_writeGuide li strong{font-size:12px}.lvR3Qq_writeGuide li span,.lvR3Qq_writeGuide p{color:var(--mn-faint);font-size:10px}.lvR3Qq_writeGuide p{border-top:1px solid var(--mn-line);margin:17px 0 0;padding-top:13px}.lvR3Qq_supervisedComposer{overflow:hidden}.lvR3Qq_supervisedForm{padding:18px}.lvR3Qq_supervisedHeading{justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;display:flex}.lvR3Qq_supervisedHeading h3{margin:4px 0 0;font-size:17px}.lvR3Qq_sessionReady,.lvR3Qq_sessionMissing{font:650 9px var(--mn-code);border-radius:999px;padding:4px 8px}.lvR3Qq_sessionReady{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 10%, transparent)}.lvR3Qq_sessionMissing{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 10%, transparent)}.lvR3Qq_supervisedForm textarea{resize:vertical;border:1px solid var(--mn-line);width:100%;color:var(--mn-text);background:var(--mn-input);border-radius:9px;outline:0;padding:12px;line-height:1.65}.lvR3Qq_sessionHint{color:var(--mn-danger);margin:9px 0 0;font-size:11px}.lvR3Qq_formGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:13px;display:grid}.lvR3Qq_fieldWide{grid-column:1/-1}.lvR3Qq_formGrid select,.lvR3Qq_formGrid input{width:100%;min-width:0}.lvR3Qq_formActions{align-items:center;gap:12px;margin-top:15px;display:flex}.lvR3Qq_formActions span{color:var(--mn-muted);font-size:11px}.lvR3Qq_advancedWrite{border-top:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 45%, var(--mn-layer-1))}.lvR3Qq_advancedWrite summary{cursor:pointer;justify-content:space-between;align-items:center;gap:16px;min-height:58px;padding:10px 18px;list-style:none;display:flex}.lvR3Qq_advancedWrite summary::-webkit-details-marker{display:none}.lvR3Qq_advancedWrite summary>span:first-child{gap:2px;display:grid}.lvR3Qq_advancedWrite summary strong{font-size:12px}.lvR3Qq_advancedWrite summary small{color:var(--mn-faint);font-size:10px}.lvR3Qq_advancedWrite summary>span:last-child{color:var(--mn-accent);font:10px var(--mn-code)}.lvR3Qq_advancedWrite[open] summary{border-bottom:1px solid var(--mn-line)}.lvR3Qq_advancedWrite[open] summary>span:last-child{font-size:0}.lvR3Qq_advancedWrite[open] summary>span:last-child:after{content:\"收起\";font-size:10px}.lvR3Qq_manualForm{padding:3px 18px 18px}.lvR3Qq_manualActions{justify-content:space-between;align-items:center;gap:14px;margin-top:15px;display:flex}.lvR3Qq_manualActions p{max-width:520px;color:var(--mn-faint);margin:0;font-size:10px}.lvR3Qq_listToolbar{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:11px;grid-template-columns:minmax(0,1fr) 170px auto;gap:9px;padding:12px;display:grid}.lvR3Qq_listToolbar input,.lvR3Qq_listToolbar select{width:100%;min-width:0}.lvR3Qq_listNotice{color:var(--mn-faint);margin:10px 0 16px;font-size:10px}.lvR3Qq_listNotice span{color:var(--mn-success);font:650 9px var(--mn-code);letter-spacing:.08em;margin-right:7px}.lvR3Qq_memoryList{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:9px;display:grid}.lvR3Qq_memoryList .lvR3Qq_insightCard{height:100%;margin:0}.lvR3Qq_healthStrip{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px;grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:13px;display:grid;overflow:hidden}.lvR3Qq_healthStrip article{border-right:1px solid var(--mn-line);gap:10px;min-width:0;padding:14px 15px;display:flex}.lvR3Qq_healthStrip article:last-child{border-right:0}.lvR3Qq_healthStrip small{color:var(--mn-faint);font:650 9px var(--mn-code);letter-spacing:.08em;margin-bottom:4px;display:block}.lvR3Qq_healthStrip strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;display:block;overflow:hidden}.lvR3Qq_healthStrip p{color:var(--mn-muted);text-overflow:ellipsis;white-space:nowrap;margin:3px 0 0;font-size:10px;overflow:hidden}.lvR3Qq_healthIndicator{width:7px;height:7px;box-shadow:0 0 0 4px color-mix(in srgb, currentColor 9%, transparent);border-radius:50%;flex:none;margin-top:3px}.lvR3Qq_healthGood{color:var(--mn-success);background:currentColor}.lvR3Qq_healthBad{color:var(--mn-danger);background:currentColor}.lvR3Qq_healthMuted{color:var(--mn-faint);background:currentColor}.lvR3Qq_statusLayout{grid-template-columns:minmax(0,1fr) 300px;align-items:start;gap:13px;display:grid}.lvR3Qq_lifecyclePanel,.lvR3Qq_diagnosticsPanel,.lvR3Qq_runtimeDetails,.lvR3Qq_configDisclosure{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:12px}.lvR3Qq_lifecyclePanel,.lvR3Qq_diagnosticsPanel,.lvR3Qq_runtimeDetails{padding:16px}.lvR3Qq_statusSectionHeader{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.lvR3Qq_statusSectionHeader h3{margin:4px 0 0;font-size:15px}.lvR3Qq_statusSectionHeader p{max-width:590px;color:var(--mn-muted);margin:5px 0 0;font-size:10px}.lvR3Qq_phaseBadge{border:1px solid color-mix(in srgb, var(--mn-accent) 25%, var(--mn-line));color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 7%, transparent);font:650 9px var(--mn-code);border-radius:999px;padding:4px 8px}.lvR3Qq_lifecycleFlow{border:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-2) 52%, transparent);border-radius:9px;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:15px;display:grid;overflow:hidden}.lvR3Qq_lifecycleFlow article{border-right:1px solid var(--mn-line);grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:8px;padding:12px;display:grid}.lvR3Qq_lifecycleFlow article:last-child{border-right:0}.lvR3Qq_lifecycleFlow article[data-disabled]{opacity:.48}.lvR3Qq_lifecycleFlow article>span{color:var(--mn-accent);font:650 9px var(--mn-code)}.lvR3Qq_lifecycleFlow strong{font-size:11px;display:block}.lvR3Qq_lifecycleFlow p{color:var(--mn-faint);margin:4px 0 0;font-size:9px;line-height:1.45}.lvR3Qq_lifecycleFlow code{color:var(--mn-muted);font-size:10px}.lvR3Qq_lifecycleFoot{border-top:1px solid var(--mn-line);color:var(--mn-faint);flex-wrap:wrap;gap:8px 18px;margin-top:13px;padding-top:12px;font-size:9px;display:flex}.lvR3Qq_lifecycleFoot strong{color:var(--mn-text);margin-left:3px;font-weight:600}.lvR3Qq_diagnosticList{color:var(--mn-muted);gap:9px;margin:15px 0 0;padding:0;font-size:10px;list-style:none;display:grid}.lvR3Qq_diagnosticList li{align-items:center;gap:8px;display:flex}.lvR3Qq_diagnosticList li>span{background:var(--mn-danger);border-radius:50%;flex:none;width:6px;height:6px}.lvR3Qq_diagnosticList li[data-ok]>span{background:var(--mn-success)}.lvR3Qq_nativeAccess{border-top:1px solid var(--mn-line);gap:6px;margin-top:15px;padding-top:13px;display:grid}.lvR3Qq_nativeAccess code{color:var(--mn-accent);background:var(--mn-layer-2);border-radius:6px;padding:6px 8px;font-size:9px}.lvR3Qq_nativeAccess p{color:var(--mn-faint);margin:2px 0 0;font-size:9px;line-height:1.5}.lvR3Qq_runtimeDetails{margin-top:13px}.lvR3Qq_runtimeDetails dl{border-top:1px solid var(--mn-line);border-left:1px solid var(--mn-line);grid-template-columns:repeat(4,minmax(0,1fr));margin:14px 0 0;display:grid}.lvR3Qq_runtimeDetails dl>div{border-right:1px solid var(--mn-line);border-bottom:1px solid var(--mn-line);min-width:0;padding:9px 10px}.lvR3Qq_runtimeDetails dt{color:var(--mn-faint);margin-bottom:4px;font-size:9px}.lvR3Qq_runtimeDetails dd{overflow-wrap:anywhere;margin:0;font-size:10px}.lvR3Qq_runtimeBadge{font:650 9px var(--mn-code);border-radius:999px;padding:3px 7px}.lvR3Qq_runtimeOnline{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 10%, transparent)}.lvR3Qq_runtimeOffline{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 10%, transparent)}.lvR3Qq_configDisclosure{margin-top:13px;overflow:hidden}.lvR3Qq_configDisclosure summary{cursor:pointer;justify-content:space-between;align-items:center;gap:16px;min-height:65px;padding:10px 16px;list-style:none;display:flex}.lvR3Qq_configDisclosure summary::-webkit-details-marker{display:none}.lvR3Qq_configDisclosure summary>span:first-child{gap:2px;display:grid}.lvR3Qq_configDisclosure summary strong{font-size:12px}.lvR3Qq_configDisclosure summary small{color:var(--mn-faint);font-size:9px}.lvR3Qq_configDisclosure summary>span:last-child{color:var(--mn-accent);font:10px var(--mn-code)}.lvR3Qq_configDisclosure[open] summary{border-bottom:1px solid var(--mn-line)}.lvR3Qq_configDisclosure[open] summary>span:last-child{font-size:0}.lvR3Qq_configDisclosure[open] summary>span:last-child:after{content:\"收起配置\";font-size:10px}.lvR3Qq_settingsPanel{padding:14px}@media (width<=1000px){.lvR3Qq_graphLayout{grid-template-columns:1fr}.lvR3Qq_graphInspector{min-height:0}.lvR3Qq_inspectorEmpty{min-height:180px}.lvR3Qq_resultLayout,.lvR3Qq_memoryList,.lvR3Qq_statusLayout{grid-template-columns:1fr}}@media (width<=760px){.lvR3Qq_shell{min-height:500px}.lvR3Qq_masthead{min-height:76px;padding:11px 14px}.lvR3Qq_brandLogo{width:40px;height:40px}.lvR3Qq_brand p{max-width:230px;font-size:10px}.lvR3Qq_statusCluster>span:not(.lvR3Qq_statusDot){display:none}.lvR3Qq_telemetry{grid-template-columns:repeat(4,1fr);padding:0 9px}.lvR3Qq_telemetryLead{display:none}.lvR3Qq_telemetryMetric{text-align:center;justify-items:center;gap:4px;padding:9px 5px;display:grid}.lvR3Qq_workspace{flex-direction:column}.lvR3Qq_sidebar{border-right:0;border-bottom:1px solid var(--mn-line);flex:none;width:100%;padding:7px}.lvR3Qq_nav{grid-template-columns:repeat(6,minmax(48px,1fr));gap:3px;display:grid}.lvR3Qq_nav button{text-align:center;flex-direction:column;justify-content:center;gap:3px;padding:5px 2px;display:flex}.lvR3Qq_nav button small,.lvR3Qq_sidebarFooter{display:none}.lvR3Qq_navGlyph{background:0 0;border:0;width:24px;height:22px}.lvR3Qq_page{padding:18px 13px 26px}.lvR3Qq_pageHeader{gap:10px;display:grid}.lvR3Qq_pageHeaderMeta{justify-content:space-between}.lvR3Qq_entityLayout,.lvR3Qq_writebackLayout{grid-template-columns:1fr}.lvR3Qq_manualActions{flex-direction:column;align-items:stretch}.lvR3Qq_entityRail{position:static}.lvR3Qq_searchControls{grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.lvR3Qq_searchControls .lvR3Qq_primaryButton{grid-column:1/-1}.lvR3Qq_searchControls select{width:100%;min-width:0}.lvR3Qq_listToolbar{grid-template-columns:1fr}.lvR3Qq_bodyDirectoryHeader{display:grid}.lvR3Qq_bodyCreate form{grid-template-columns:1fr}.lvR3Qq_graphViewport,.lvR3Qq_graphSvg{min-height:390px}.lvR3Qq_graphCanvasControls{top:7px;right:7px}.lvR3Qq_graphCanvasControls span{display:none}.lvR3Qq_healthStrip,.lvR3Qq_lifecycleFlow,.lvR3Qq_runtimeDetails dl{grid-template-columns:1fr}.lvR3Qq_healthStrip article,.lvR3Qq_lifecycleFlow article{border-right:0;border-bottom:1px solid var(--mn-line)}.lvR3Qq_healthStrip article:last-child,.lvR3Qq_lifecycleFlow article:last-child{border-bottom:0}}";
		const tagId = "dsh-mnemon/MnemonView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MnemonView_module_css_default = {
			"lifecyclePanel": "lvR3Qq_lifecyclePanel",
			"graphBackdrop": "lvR3Qq_graphBackdrop",
			"supervisedComposer": "lvR3Qq_supervisedComposer",
			"healthIndicator": "lvR3Qq_healthIndicator",
			"graphToolbar": "lvR3Qq_graphToolbar",
			"runtimeOnline": "lvR3Qq_runtimeOnline",
			"statusDot": "lvR3Qq_statusDot",
			"statusSectionHeader": "lvR3Qq_statusSectionHeader",
			"alert": "lvR3Qq_alert",
			"nodeHalo": "lvR3Qq_nodeHalo",
			"phaseBadge": "lvR3Qq_phaseBadge",
			"listNotice": "lvR3Qq_listNotice",
			"brand": "lvR3Qq_brand",
			"relatedSource": "lvR3Qq_relatedSource",
			"bodyCardTop": "lvR3Qq_bodyCardTop",
			"lifecycleFlow": "lvR3Qq_lifecycleFlow",
			"entityLayout": "lvR3Qq_entityLayout",
			"lifecycleFoot": "lvR3Qq_lifecycleFoot",
			"pageHeader": "lvR3Qq_pageHeader",
			"settingsPanel": "lvR3Qq_settingsPanel",
			"healthStrip": "lvR3Qq_healthStrip",
			"cardTop": "lvR3Qq_cardTop",
			"fieldWide": "lvR3Qq_fieldWide",
			"graphViewport": "lvR3Qq_graphViewport",
			"cardActions": "lvR3Qq_cardActions",
			"confirmBar": "lvR3Qq_confirmBar",
			"liveDot": "lvR3Qq_liveDot",
			"inlineError": "lvR3Qq_inlineError",
			"secondaryButton": "lvR3Qq_secondaryButton",
			"graphEdge": "lvR3Qq_graphEdge",
			"healthGood": "lvR3Qq_healthGood",
			"loadingPanel": "lvR3Qq_loadingPanel",
			"searchControls": "lvR3Qq_searchControls",
			"emptyState": "lvR3Qq_emptyState",
			"healthMuted": "lvR3Qq_healthMuted",
			"pageHeaderMeta": "lvR3Qq_pageHeaderMeta",
			"page": "lvR3Qq_page",
			"graphCanvasControls": "lvR3Qq_graphCanvasControls",
			"configDisclosure": "lvR3Qq_configDisclosure",
			"manualForm": "lvR3Qq_manualForm",
			"online": "lvR3Qq_online",
			"sessionMissing": "lvR3Qq_sessionMissing",
			"nodeBodyLabel": "lvR3Qq_nodeBodyLabel",
			"bodyCard": "lvR3Qq_bodyCard",
			"bodySignal": "lvR3Qq_bodySignal",
			"formActions": "lvR3Qq_formActions",
			"insightCard": "lvR3Qq_insightCard",
			"writeGuide": "lvR3Qq_writeGuide",
			"dangerSolidButton": "lvR3Qq_dangerSolidButton",
			"nodeLabel": "lvR3Qq_nodeLabel",
			"inspectorLogo": "lvR3Qq_inspectorLogo",
			"inspectorHeading": "lvR3Qq_inspectorHeading",
			"writebackLayout": "lvR3Qq_writebackLayout",
			"statusCluster": "lvR3Qq_statusCluster",
			"runtimeOffline": "lvR3Qq_runtimeOffline",
			"relatedPane": "lvR3Qq_relatedPane",
			"entityRail": "lvR3Qq_entityRail",
			"masthead": "lvR3Qq_masthead",
			"inspectorActions": "lvR3Qq_inspectorActions",
			"diagnosticsPanel": "lvR3Qq_diagnosticsPanel",
			"singleColumn": "lvR3Qq_singleColumn",
			"sectionHeading": "lvR3Qq_sectionHeading",
			"results": "lvR3Qq_results",
			"sessionHint": "lvR3Qq_sessionHint",
			"loading": "lvR3Qq_loading",
			"manualActions": "lvR3Qq_manualActions",
			"emptyGlyph": "lvR3Qq_emptyGlyph",
			"id": "lvR3Qq_id",
			"canvas": "lvR3Qq_canvas",
			"graphLayout": "lvR3Qq_graphLayout",
			"categoryChip": "lvR3Qq_categoryChip",
			"inspectorMeta": "lvR3Qq_inspectorMeta",
			"statusLayout": "lvR3Qq_statusLayout",
			"workspace": "lvR3Qq_workspace",
			"resultLayout": "lvR3Qq_resultLayout",
			"nativeAccess": "lvR3Qq_nativeAccess",
			"cardKicker": "lvR3Qq_cardKicker",
			"memoryList": "lvR3Qq_memoryList",
			"primaryButton": "lvR3Qq_primaryButton",
			"graphLegend": "lvR3Qq_graphLegend",
			"healthBad": "lvR3Qq_healthBad",
			"iconButton": "lvR3Qq_iconButton",
			"sidebar": "lvR3Qq_sidebar",
			"graphNode": "lvR3Qq_graphNode",
			"ghostButton": "lvR3Qq_ghostButton",
			"entities": "lvR3Qq_entities",
			"telemetryMetric": "lvR3Qq_telemetryMetric",
			"sidebarFooter": "lvR3Qq_sidebarFooter",
			"offline": "lvR3Qq_offline",
			"bodyCreate": "lvR3Qq_bodyCreate",
			"content": "lvR3Qq_content",
			"dangerButton": "lvR3Qq_dangerButton",
			"queryField": "lvR3Qq_queryField",
			"telemetryLead": "lvR3Qq_telemetryLead",
			"entityResults": "lvR3Qq_entityResults",
			"formGrid": "lvR3Qq_formGrid",
			"eyebrow": "lvR3Qq_eyebrow",
			"bodyDirectoryHeader": "lvR3Qq_bodyDirectoryHeader",
			"runtimeBadge": "lvR3Qq_runtimeBadge",
			"entityHeading": "lvR3Qq_entityHeading",
			"badge": "lvR3Qq_badge",
			"diagnosticList": "lvR3Qq_diagnosticList",
			"graphPanel": "lvR3Qq_graphPanel",
			"nodeCore": "lvR3Qq_nodeCore",
			"runtimeDetails": "lvR3Qq_runtimeDetails",
			"sessionReady": "lvR3Qq_sessionReady",
			"bodyGrid": "lvR3Qq_bodyGrid",
			"nav": "lvR3Qq_nav",
			"searchBar": "lvR3Qq_searchBar",
			"tags": "lvR3Qq_tags",
			"shell": "lvR3Qq_shell",
			"entityList": "lvR3Qq_entityList",
			"graphFooter": "lvR3Qq_graphFooter",
			"advancedWrite": "lvR3Qq_advancedWrite",
			"graphGridLine": "lvR3Qq_graphGridLine",
			"bodyDirectory": "lvR3Qq_bodyDirectory",
			"inspectorEmpty": "lvR3Qq_inspectorEmpty",
			"muted": "lvR3Qq_muted",
			"graphSvg": "lvR3Qq_graphSvg",
			"telemetryPulse": "lvR3Qq_telemetryPulse",
			"listToolbar": "lvR3Qq_listToolbar",
			"supervisedHeading": "lvR3Qq_supervisedHeading",
			"entitySearch": "lvR3Qq_entitySearch",
			"telemetry": "lvR3Qq_telemetry",
			"supervisedForm": "lvR3Qq_supervisedForm",
			"navGlyph": "lvR3Qq_navGlyph",
			"brandLogo": "lvR3Qq_brandLogo",
			"badges": "lvR3Qq_badges",
			"graphInspector": "lvR3Qq_graphInspector"
		};
		//#endregion
		//#region src/client/MnemonView.tsx
		const PAGE_NAV = [
			{
				id: "overview",
				label: "总览",
				detail: "记忆体与实时图谱",
				glyph: "◇"
			},
			{
				id: "explore",
				label: "检索",
				detail: "意图增强召回",
				glyph: "⌕"
			},
			{
				id: "entities",
				label: "实体",
				detail: "关系与上下文",
				glyph: "◎"
			},
			{
				id: "remember",
				label: "沉淀",
				detail: "LLM 监督写回",
				glyph: "+"
			},
			{
				id: "list",
				label: "内容",
				detail: "浏览与维护",
				glyph: "≡"
			},
			{
				id: "status",
				label: "状态",
				detail: "运行与诊断",
				glyph: "⌘"
			}
		];
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
		function short(value, max) {
			return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
		}
		function insightKey(insight) {
			return `${insight.memoryBodyId ?? "memory"}:${insight.id}`;
		}
		function PageHeader(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.pageHeader,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: props.kicker }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: props.title }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: props.description })
				] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [forgetting, setForgetting] = (0, react.useState)(false);
			const { insight } = props;
			const meta = [
				insight.memoryBodyName,
				insight.category !== void 0 ? CATEGORY_LABELS[insight.category] ?? insight.category : void 0,
				insight.importance !== void 0 ? `重要性 ${insight.importance}` : void 0,
				insight.score !== void 0 ? `score ${insight.score.toFixed(3)}` : void 0,
				insight.depth !== void 0 ? `${insight.depth} 跳` : void 0
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
							"aria-label": "确认忘记记忆",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "软删除这条记忆？" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.dangerSolidButton,
									disabled: forgetting,
									onClick: () => void forget(),
									children: forgetting ? "处理中…" : "确认忘记"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.ghostButton,
									disabled: forgetting,
									onClick: () => setConfirming(false),
									children: "取消"
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							props.onRelated !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => props.onRelated?.(insight),
								children: "查看关联"
							}),
							props.onClone !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MnemonView_module_css_default.ghostButton,
								onClick: () => props.onClone?.(insight),
								children: "基于此新建"
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
								onClick: () => setConfirming(true),
								children: "忘记"
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
					const spring = (distance - (edge.type === "entity" ? 94 : edge.type === "semantic" ? 118 : 106) * sparseScale) * .018 * cooling;
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
			const visibleNodes = (0, react.useMemo)(() => props.graph.nodes.slice(0, 60), [props.graph.nodes]);
			const visibleIds = (0, react.useMemo)(() => new Set(visibleNodes.map(graphNodeKey)), [visibleNodes]);
			const edges = (0, react.useMemo)(() => props.graph.edges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).slice(0, 180), [props.graph.edges, visibleIds]);
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
			const layoutKey = `${visibleNodes.map((node) => `${graphNodeKey(node)}:${node.category ?? "general"}`).join("|")}::${edges.map((edge) => `${edge.sourceId}>${edge.targetId}:${edge.type ?? "temporal"}`).join("|")}`;
			const naturalLayout = (0, react.useMemo)(() => naturalGraphPositions(visibleNodes, edges), [layoutKey]);
			const [positions, setPositions] = (0, react.useState)(() => naturalLayout);
			const [layoutMode, setLayoutMode] = (0, react.useState)("natural");
			const positionsRef = (0, react.useRef)(positions);
			const animationRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const suppressClickRef = (0, react.useRef)(false);
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
				event.preventDefault();
				cancelAnimation();
				dragRef.current = {
					nodeId,
					pointerId: event.pointerId,
					moved: false
				};
				event.currentTarget.setPointerCapture?.(event.pointerId);
			};
			const moveDrag = (event) => {
				const drag = dragRef.current;
				const svg = event.currentTarget.ownerSVGElement;
				if (drag === null || svg === null || drag.pointerId !== event.pointerId) return;
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
				suppressClickRef.current = drag.moved;
				dragRef.current = null;
				event.currentTarget.releasePointerCapture?.(event.pointerId);
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
			const layoutLabel = layoutMode === "natural" ? "自然布局" : layoutMode === "uniform" ? "均匀布局" : "自定义布局";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.graphCanvasControls,
				role: "toolbar",
				"aria-label": "图谱布局",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						role: "status",
						"aria-label": `布局状态：${layoutLabel}`,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}),
							layoutLabel,
							" · 可拖拽"
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-active": layoutMode === "natural" || void 0,
						onClick: () => animateTo(naturalGraphPositions(visibleNodes, edges), "natural"),
						children: "自然铺开"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-active": layoutMode === "uniform" || void 0,
						onClick: () => animateTo(uniformGraphPositions(visibleNodes), "uniform"),
						children: "均匀重置"
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: MnemonView_module_css_default.graphSvg,
				viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`,
				role: "img",
				"data-layout": layoutMode,
				"data-density": visibleNodes.length <= 12 ? "sparse" : "dense",
				"aria-label": `Mnemon 实时记忆图谱，${props.graph.nodes.length} 个节点，${props.graph.edges.length} 条连接`,
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
						const source = positions.get(edge.sourceId);
						const target = positions.get(edge.targetId);
						const dx = target.x - source.x;
						const dy = target.y - source.y;
						const distance = Math.max(1, Math.hypot(dx, dy));
						const direction = edge.sourceId.localeCompare(edge.targetId) <= 0 ? 1 : -1;
						const controlX = (source.x + target.x) / 2 - dy / distance * offset * direction;
						const controlY = (source.y + target.y) / 2 + dx / distance * offset * direction;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`,
							className: MnemonView_module_css_default.graphEdge,
							"data-edge": edge.type ?? "temporal"
						}, `${edge.sourceId}-${edge.targetId}-${index}`);
					}),
					visibleNodes.map((node, index) => {
						const nodeKey = graphNodeKey(node);
						const position = positions.get(nodeKey);
						const selected = props.selectedId === nodeKey;
						const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
							className: MnemonView_module_css_default.graphNode,
							"data-category": node.category ?? "general",
							"data-selected": selected || void 0,
							transform: `translate(${position.x} ${position.y})`,
							role: "button",
							tabIndex: 0,
							"aria-label": `${CATEGORY_LABELS[node.category ?? "general"] ?? node.category}: ${short(node.content, 80)}`,
							"data-dragging": dragRef.current?.nodeId === nodeKey || void 0,
							onPointerDown: (event) => beginDrag(event, nodeKey),
							onPointerMove: moveDrag,
							onPointerUp: endDrag,
							onPointerCancel: cancelDrag,
							onLostPointerCapture: cancelDrag,
							onClick: () => {
								if (suppressClickRef.current) {
									suppressClickRef.current = false;
									return;
								}
								props.onSelect(node);
							},
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									r: selected ? 17 : visibleNodes.length <= 12 ? 14 : 11,
									className: MnemonView_module_css_default.nodeHalo,
									filter: selected ? "url(#mnemon-glow)" : void 0
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									r: selected ? 7 : visibleNodes.length <= 12 ? 6 : 4.5,
									className: MnemonView_module_css_default.nodeCore
								}),
								(selected || visibleNodes.length <= 12) && node.memoryBodyName !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
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
			const [graph, setGraph] = (0, react.useState)(null);
			const [catalog, setCatalog] = (0, react.useState)(null);
			const [selected, setSelected] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [changing, setChanging] = (0, react.useState)(null);
			const [creating, setCreating] = (0, react.useState)(false);
			const [bodyId, setBodyId] = (0, react.useState)("");
			const [bodyName, setBodyName] = (0, react.useState)("");
			const [bodyDescription, setBodyDescription] = (0, react.useState)("");
			const load = (0, react.useCallback)(async (quiet = false) => {
				if (!quiet) setLoading(true);
				setError(null);
				try {
					const [nextCatalog, next] = await Promise.all([props.client.bodies(), props.client.graph()]);
					setCatalog(nextCatalog);
					setGraph(next);
					setSelected((current) => current === null ? null : next.nodes.find((node) => graphNodeKey(node) === graphNodeKey(current)) ?? null);
				} catch (reason) {
					setError(message(reason));
				} finally {
					setLoading(false);
				}
			}, [props.client]);
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
						...bodyId.trim() === "" ? {} : { id: bodyId },
						name: bodyName,
						description: bodyDescription
					});
					setBodyId("");
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
			const generated = graph === null ? "等待首个快照" : `更新于 ${new Date(graph.generatedAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			})}`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						kicker: "MEMORY BODY OVERVIEW",
						title: "记忆体总览",
						description: "管理全局记忆体的读取边界，并在一张实时四图快照中观察所有已激活记忆体。",
						meta: "AUTO · 15S",
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							disabled: loading,
							onClick: () => void load(),
							children: loading ? "同步中…" : "立即同步"
						})
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.bodyDirectory,
						"aria-label": "记忆体目录",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.bodyDirectoryHeader,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.cardKicker,
										children: "GLOBAL MEMORY BODIES"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "记忆体目录" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "开关只控制读取；写入可选择任意记忆体，写入未激活记忆体后会自动激活。" })
								] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
									catalog?.activeCount ?? "—",
									" / ",
									catalog?.total ?? "—",
									" ACTIVE"
								] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MnemonView_module_css_default.bodyGrid,
								children: catalog?.items.map((body, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: MnemonView_module_css_default.bodyCard,
									"data-active": body.active || void 0,
									style: { "--mn-body-accent": `hsl(${(hash(body.id) + index * 29) % 360} 66% 58%)` },
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.bodyCardTop,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: MnemonView_module_css_default.bodySignal }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: body.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: body.id })] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													role: "switch",
													"aria-checked": body.active,
													"aria-label": `${body.name}读取开关`,
													disabled: !props.writeEnabled || changing === body.id,
													onClick: () => void toggle(body),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), changing === body.id ? "切换中" : body.active ? "已激活" : "未激活"]
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: body.description || "尚未提供路由说明。" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [body.stats?.totalInsights ?? 0, " 条记忆"] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [body.stats?.edgeCount ?? 0, " 条连接"] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: humanBytes(body.stats?.dbSizeBytes ?? 0) })
										] })
									]
								}, body.id))
							}),
							props.writeEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								className: MnemonView_module_css_default.bodyCreate,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "＋ 创建空白记忆体" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
									onSubmit: (event) => void create(event),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											"aria-label": "新记忆体 ID",
											value: bodyId,
											onChange: (event) => setBodyId(event.target.value),
											placeholder: "可选 ID，例如 project-alpha"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											"aria-label": "新记忆体名称",
											value: bodyName,
											onChange: (event) => setBodyName(event.target.value),
											placeholder: "名称",
											required: true
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											"aria-label": "新记忆体描述",
											value: bodyDescription,
											onChange: (event) => setBodyDescription(event.target.value),
											placeholder: "说明哪些内容属于它，以及何时应被召回",
											required: true
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											className: MnemonView_module_css_default.secondaryButton,
											disabled: creating,
											children: creating ? "创建中…" : "创建"
										})
									]
								})]
							})
						]
					}),
					graph !== null && graph.nodes.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.graphLayout,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.graphPanel,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.graphToolbar,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: MnemonView_module_css_default.liveDot }),
										"多记忆体实时快照 ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: generated })
									] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.graphLegend,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "temporal",
												children: "时间"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "semantic",
												children: "语义"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "causal",
												children: "因果"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-edge": "entity",
												children: "实体"
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
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										"展示 ",
										Math.min(graph.nodes.length, 60),
										" / ",
										graph.nodes.length,
										" 个节点"
									] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [graph.edges.length, " 条图谱连接"] })]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
							className: MnemonView_module_css_default.graphInspector,
							children: selected === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.inspectorEmpty,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonLogo, {
										className: MnemonView_module_css_default.inspectorLogo,
										title: "Mnemon node inspector"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "NODE INSPECTOR" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "选择一个记忆节点" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "查看完整内容、分类与精确 ID。" })
								]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.inspectorHeading,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "NODE INSPECTOR" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSelected(null),
										"aria-label": "关闭节点详情",
										children: "×"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: MnemonView_module_css_default.categoryChip,
									children: CATEGORY_LABELS[selected.category ?? "general"] ?? selected.category
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: selected.content }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
									className: MnemonView_module_css_default.inspectorMeta,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Memory body" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [
											selected.memoryBodyName ?? "—",
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.memoryBodyId ?? "" })
										] })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Memory ID" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selected.id }) })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Category" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.category ?? "general" })] })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.inspectorActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.primaryButton,
										onClick: () => props.onExplore(selected.content),
										children: "围绕它检索"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MnemonView_module_css_default.secondaryButton,
										onClick: () => void navigator.clipboard?.writeText(selected.id),
										children: "复制 ID"
									})]
								})
							] })
						})]
					}) : !loading && error === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "◇",
						title: "已激活记忆体尚无内容",
						children: "向任意记忆体沉淀稳定上下文后，这里会聚合呈现节点与关系。"
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.loadingPanel,
						children: "正在同步记忆体目录与多库图谱…"
					})
				]
			});
		}
		function ExplorePage(props) {
			const [query, setQuery] = (0, react.useState)(props.seed);
			const [mode, setMode] = (0, react.useState)("smart");
			const [category, setCategory] = (0, react.useState)("");
			const [results, setResults] = (0, react.useState)([]);
			const [searching, setSearching] = (0, react.useState)(false);
			const [searched, setSearched] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [relatedTo, setRelatedTo] = (0, react.useState)(null);
			const [related, setRelated] = (0, react.useState)([]);
			const [relatedLoading, setRelatedLoading] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (props.seed !== "") setQuery(props.seed);
			}, [props.seed]);
			const search = async (event) => {
				event.preventDefault();
				if (query.trim() === "") return;
				setSearching(true);
				setSearched(true);
				setError(null);
				setRelatedTo(null);
				try {
					const response = await props.client.search({
						query,
						mode,
						...category === "" ? {} : { category },
						limit: props.status?.defaultRecallLimit ?? 10
					});
					setResults(response.results);
				} catch (reason) {
					setError(message(reason));
					setResults([]);
				} finally {
					setSearching(false);
				}
			};
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
						kicker: "INTENT RECALL",
						title: "检索记忆",
						description: "用明确问题召回相关上下文，再沿图谱关系继续查阅。",
						meta: `${props.status?.defaultRecallLimit ?? "—"} MAX RESULTS`
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
									placeholder: "为什么选用 SQLite？这个项目有哪些发布约定？",
									"aria-label": "记忆查询"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "↵" })
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.searchControls,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["分类", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
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
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["策略", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
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
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									className: MnemonView_module_css_default.primaryButton,
									disabled: searching || query.trim() === "",
									children: searching ? "检索中…" : "开始召回"
								})
							]
						})]
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					!searched && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "⌕",
						title: "从一个明确问题开始",
						children: "聚焦实体、决策或时间线，比批量加载整库更可靠。"
					}),
					searched && !searching && results.length === 0 && error === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "0",
						title: "没有命中",
						children: "换一个更具体的实体、决策或时间线关键词试试。"
					}),
					results.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: relatedTo === null ? MnemonView_module_css_default.singleColumn : MnemonView_module_css_default.resultLayout,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.results,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.sectionHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "RESULT SET" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "召回结果" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: results.length })]
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
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "GRAPH INSPECTOR" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "关联记忆" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setRelatedTo(null),
										"aria-label": "关闭关联记忆",
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
					kicker: "ENTITY LENS",
					title: "实体查阅",
					description: "选择 Mnemon 识别出的实体，召回它跨越事实、决策与上下文的关系。",
					meta: `${view.items.length} ACTIVE ENTITIES`
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonView_module_css_default.entityLayout,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: MnemonView_module_css_default.entityRail,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: MnemonView_module_css_default.entitySearch,
								onSubmit: submit,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									"aria-label": "实体名称",
									value: entity,
									onChange: (event) => setEntity(event.target.value),
									placeholder: "输入任意实体…"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									className: MnemonView_module_css_default.primaryButton,
									disabled: loading || entity.trim() === "",
									children: "查阅"
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.entityHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "TOP ENTITIES" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "按出现频率" })]
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
								children: "写入带实体的记忆后，这里会形成入口。"
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
								children: "正在沿实体关系召回…"
							}),
							!loading && view.selected === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
								glyph: "◎",
								title: "选择或输入一个实体",
								children: "实体视图会聚合与它相关的记忆，而不是只做字面匹配。"
							}),
							!loading && view.selected !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.sectionHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "ENTITY CONTEXT" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: view.selected })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: view.insights.length })]
							}), view.insights.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
								glyph: "0",
								title: "没有关联记忆",
								children: "尝试更完整的名称或另一个实体别名。"
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
		function RememberPage(props) {
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
					setResult(`${response.action === "skipped" ? "记忆子 Agent 判断无需写入" : "记忆子 Agent 已完成处理"}${response.memoryBodyIds.length === 0 ? "" : ` · ${response.memoryBodyIds.join(", ")}`}${response.summary === "" ? "" : `：${response.summary}`}`);
					setContent("");
					props.onMutate();
				} catch (reason) {
					setResult(`调度失败：${message(reason)}`);
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
					setResult(action === "skipped" ? `记忆子 Agent 判定无需写入${summary === "" ? "" : `：${summary}`}` : `记忆子 Agent 已处理：${action}${summary === "" ? "" : ` · ${summary}`}`);
					if (action !== "skipped") {
						setContent("");
						setTags("");
						setEntities("");
						props.onMutate();
					}
				} catch (reason) {
					setResult(`保存失败：${message(reason)}`);
				} finally {
					setSaving(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					kicker: "SUBAGENT-SUPERVISED WRITEBACK",
					title: "沉淀记忆",
					description: "候选内容会进入隔离的记忆子 Agent，由它选择记忆体、查重、提炼并执行写入，不占用主对话上下文。",
					meta: props.writeEnabled ? "MEMORY SUBAGENT" : "READ ONLY"
				}), !props.writeEnabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					glyph: "⊘",
					title: "当前为只读模式",
					children: "当前部署禁止记忆写入；如需调整，请修改 DSH 的 Mnemon 配置并重启。"
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MnemonView_module_css_default.writebackLayout,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: MnemonView_module_css_default.writeGuide,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MnemonView_module_css_default.cardKicker,
								children: "SUPERVISION FLOW"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "记忆子 Agent 会完成什么" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ol", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "判断归属" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "选择既有记忆体，必要时判断是否形成新范围" })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "检索查重" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "识别重复、补充或冲突的旧记忆" })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "结构化写入" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "提炼内容、元数据与必要关系并返回回执" })] })
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "子 Agent 只拥有 Mnemon 工具，原始目录和检索过程不会挤占主对话上下文。" })
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.supervisedComposer,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: MnemonView_module_css_default.supervisedForm,
							onSubmit: (event) => void supervise(event),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.supervisedHeading,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.cardKicker,
										children: "ISOLATED MEMORY WORKER"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "交给记忆子 Agent" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: props.sessionId === void 0 ? MnemonView_module_css_default.sessionMissing : MnemonView_module_css_default.sessionReady,
										children: props.sessionId === void 0 ? "NO SESSION" : "SUBAGENT READY"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: MnemonView_module_css_default.fieldWide,
									children: ["候选内容", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										"aria-label": "待沉淀内容",
										value: content,
										onChange: (event) => setContent(event.target.value),
										maxLength: 8e3,
										rows: 8,
										placeholder: "输入希望跨任务保留的背景、偏好、决策或洞察。模型会先判断它是否真的值得沉淀。"
									})]
								}),
								props.sessionId === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: MnemonView_module_css_default.sessionHint,
									children: "当前视图没有绑定 live session，无法创建记忆子 Agent。"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.primaryButton,
										disabled: supervising || content.trim() === "" || props.sessionId === void 0,
										children: supervising ? "记忆子 Agent 处理中…" : "调度子 Agent 判断并沉淀"
									}), result !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										role: "status",
										children: result
									})]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: MnemonView_module_css_default.advancedWrite,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "人工高级选项" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "为记忆子 Agent指定目标记忆体与元数据约束" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "展开" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: MnemonView_module_css_default.manualForm,
								onSubmit: (event) => void manualSave(event),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.formGrid,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: MnemonView_module_css_default.fieldWide,
											children: ["目标记忆体", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
												"aria-label": "目标记忆体",
												value: memoryBodyId,
												onChange: (event) => setMemoryBodyId(event.target.value),
												children: props.memoryBodies.map((body) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
													value: body.id,
													children: [
														body.name,
														" · ",
														body.id,
														body.active ? " · 已激活" : ""
													]
												}, body.id))
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["分类", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
											value: category,
											onChange: (event) => setCategory(event.target.value),
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
											children: ["实体（逗号分隔）", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												value: entities,
												onChange: (event) => setEntities(event.target.value),
												placeholder: "SQLite, DSH"
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: MnemonView_module_css_default.fieldWide,
											children: ["标签（逗号分隔）", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												value: tags,
												onChange: (event) => setTags(event.target.value),
												placeholder: "architecture, local-first"
											})]
										})
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.manualActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "高级选项是约束而不是绕过监督；记忆子 Agent 仍会查重并返回结构化回执。" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: MnemonView_module_css_default.secondaryButton,
										disabled: saving || content.trim() === "" || props.sessionId === void 0 || memoryBodyId === "",
										children: saving ? "子 Agent 写入中…" : "按高级约束沉淀"
									})]
								})]
							})]
						})]
					})]
				})]
			});
		}
		function ListPage(props) {
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
						kicker: "ACTIVE MEMORY CONTENT",
						title: "记忆内容",
						description: "无副作用浏览所有已激活记忆体；每条内容都会标明所属记忆体，可继续查阅或维护。",
						meta: `${view?.total ?? "—"} MEMORIES`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: MnemonView_module_css_default.listToolbar,
						onSubmit: submit,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								"aria-label": "筛选记忆库",
								value: query,
								onChange: (event) => setQuery(event.target.value),
								placeholder: "按内容或精确 ID 筛选…"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": "记忆库分类",
								value: category,
								onChange: (event) => setCategory(event.target.value),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: "全部分类"
								}), CATEGORIES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value,
									children: CATEGORY_LABELS[value]
								}, value))]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								className: MnemonView_module_css_default.primaryButton,
								disabled: loading,
								children: loading ? "载入中…" : "应用筛选"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.listNotice,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "NON-MUTATING READ" }), " 内容列表读取已激活记忆体的图谱快照，不会增加 recall 访问计数。"]
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.inlineError,
						role: "alert",
						children: error
					}),
					!loading && view?.items.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						glyph: "≡",
						title: "没有符合条件的记忆",
						children: "清空筛选，或前往“沉淀”写入第一条稳定上下文。"
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
		function StatusPage(props) {
			const status = props.status;
			const lifecycle = status?.lifecycle;
			const current = lifecycle?.current;
			const workers = lifecycle?.subagents;
			const memoryBodies = status?.memoryBodies ?? [];
			const activeBodies = memoryBodies.filter((body) => body.active).length;
			const latest = current?.lastAt === void 0 ? "尚无运行记录" : new Date(current.lastAt).toLocaleString();
			const phase = current?.lastPhase === void 0 ? "idle" : {
				idle: "待命",
				prime: "Prime",
				recall: "Recall",
				writeback: "Writeback",
				supervised: "受监督请求",
				error: "异常"
			}[current.lastPhase];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MnemonView_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
						kicker: "RUNTIME OBSERVABILITY",
						title: "运行状态",
						description: "聚焦 Mnemon 引擎、记忆体目录和子 Agent 编排；连接配置由 DSH 部署统一管理。",
						meta: status?.healthy === true && lifecycle?.sessionAvailable === true ? "SYSTEM NOMINAL" : "CHECK REQUIRED",
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MnemonView_module_css_default.secondaryButton,
							onClick: props.onRefresh,
							children: props.loading ? "检查中…" : "重新检查"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.healthStrip,
						"aria-label": "Mnemon 运行状态",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${status?.healthy === true ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthBad}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "MEMORY ENGINE" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: status?.healthy === true ? "Mnemon 已连接" : "Mnemon 不可用" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: status?.version === void 0 ? "等待版本信息" : `CLI ${status.version}` })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${activeBodies > 0 ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthMuted}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "MEMORY BODIES" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
									activeBodies,
									" / ",
									memoryBodies.length,
									" 已激活"
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [status?.stats?.totalInsights ?? 0, " 条有效记忆"] })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.healthIndicator} ${lifecycle?.sessionAvailable === true ? MnemonView_module_css_default.healthGood : MnemonView_module_css_default.healthBad}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "SUBAGENT ROUTER" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: lifecycle?.sessionAvailable === true ? "记忆子 Agent 可用" : "当前会话未绑定" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: workers === void 0 ? "等待编排状态" : `${workers.recalls} 次召回 · ${workers.writes} 次写入` })
							] })] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.statusLayout,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.lifecyclePanel,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.statusSectionHeader,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: MnemonView_module_css_default.cardKicker,
											children: "ISOLATED MEMORY LIFECYCLE"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "子 Agent 生命周期" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "主 Agent 只接收压缩证据与回执；记忆体选择、查重和写入在隔离子上下文中完成。" })
									] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.phaseBadge,
										children: phase
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.lifecycleFlow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "01" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Prime" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "只注入计数和编排能力，不展开目录" })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: lifecycle?.counters.primes ?? 0 })
										] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
											"data-disabled": lifecycle?.recallMode === "off" || void 0,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "02" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Recall Worker" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: lifecycle?.recallMode === "guided" ? "pre-step 选择记忆体并压缩证据" : "自动召回已关闭" })] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: workers?.recalls ?? 0 })
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
											"data-disabled": lifecycle?.writebackMode === "off" || void 0,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "03" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Write Worker" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: lifecycle?.writebackMode === "guided" ? "turn-stopping 内判断并完成副作用" : "自动写回已关闭" })] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: workers?.writes ?? 0 })
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.lifecycleFoot,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["最近阶段 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: phase })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["最近活动 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: latest })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["受监督请求 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: lifecycle?.counters.supervisedRequests ?? 0 })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["子 Agent 失败 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: workers?.failures ?? 0 })] })
									]
								}),
								current?.lastError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.inlineError,
									role: "alert",
									children: ["Lifecycle：", current.lastError]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: MnemonView_module_css_default.diagnosticsPanel,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.statusSectionHeader,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.cardKicker,
										children: "QUICK DIAGNOSTICS"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "快速诊断" })] })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
									className: MnemonView_module_css_default.diagnosticList,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											"data-ok": status?.commandFound || void 0,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}),
												"Mnemon CLI ",
												status?.commandFound ? "可执行" : "未找到"
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											"data-ok": activeBodies > 0 || void 0,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}),
												activeBodies,
												" 个记忆体参与读取"
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											"data-ok": lifecycle?.sessionAvailable || void 0,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), lifecycle?.sessionAvailable ? "WebUI 可创建隔离记忆子 Agent" : "缺少 live session"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											"data-ok": (lifecycle?.counters.failures ?? 0) === 0 || void 0,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}),
												"Lifecycle 失败 ",
												lifecycle?.counters.failures ?? 0,
												" 次"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.nativeAccess,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: MnemonView_module_css_default.cardKicker,
											children: "NATIVE ACCESS"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "/mnemon status" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "/mnemon recall <query>" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
											"模型侧使用原生 ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "mnemon_*" }),
											" 工具；人工命令不会绕入模型。"
										] })
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: MnemonView_module_css_default.runtimeDetails,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.statusSectionHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MnemonView_module_css_default.cardKicker,
								children: "RUNTIME DETAILS"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "引擎与存储" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${MnemonView_module_css_default.runtimeBadge} ${status?.healthy === true ? MnemonView_module_css_default.runtimeOnline : MnemonView_module_css_default.runtimeOffline}`,
								children: status?.healthy === true ? "ONLINE" : "OFFLINE"
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "CLI" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.cliPath ?? "mnemon" }) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Mnemon 版本" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status?.version ?? "—" })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "记忆体目录" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.memoryBodyDirectory ?? "—" }) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "总数据库大小" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status?.stats === void 0 ? "—" : humanBytes(status.stats.dbSizeBytes) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "记忆体" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [status === void 0 ? "—" : memoryBodies.length, " 个"] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "已激活" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [activeBodies, " 个"] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "有效记忆" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status?.stats?.totalInsights ?? "—" })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "图谱连接" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status?.stats?.edgeCount ?? "—" })] })
						] })]
					})
				]
			});
		}
		function MnemonView({ connection, sessionId }) {
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
			const memoryBodies = status?.memoryBodies ?? [];
			const activeBodies = memoryBodies.filter((body) => body.active).length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: MnemonView_module_css_default.shell,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: MnemonView_module_css_default.masthead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.brand,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MnemonLogo, { className: MnemonView_module_css_default.brandLogo }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.eyebrow,
									children: "PERSISTENT AGENT MEMORY"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "Mnemon" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "LLM-supervised 4-graph persistent memory for AI agents." })
							] })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.statusCluster,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${MnemonView_module_css_default.statusDot} ${status?.healthy === true ? MnemonView_module_css_default.online : MnemonView_module_css_default.offline}` }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLoading ? "检查中" : status?.healthy === true ? `已连接 · ${activeBodies} 个记忆体` : "不可用" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.iconButton,
									onClick: refreshAll,
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
						className: MnemonView_module_css_default.telemetry,
						"aria-label": "记忆统计",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.telemetryLead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: MnemonView_module_css_default.telemetryPulse }), "Memory telemetry"]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.telemetryMetric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "有效记忆" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.totalInsights ?? "—" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.telemetryMetric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "图谱连接" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.edgeCount ?? "—" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.telemetryMetric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "已识别实体" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats?.topEntities.length ?? "—" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.telemetryMetric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "激活记忆体" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: status === null ? "—" : activeBodies })]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MnemonView_module_css_default.workspace,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: MnemonView_module_css_default.sidebar,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
								className: MnemonView_module_css_default.nav,
								"aria-label": "Mnemon 页面",
								children: PAGE_NAV.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-current": page === item.id ? "page" : void 0,
									onClick: () => setPage(item.id),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: MnemonView_module_css_default.navGlyph,
										"aria-hidden": "true",
										children: item.glyph
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: item.detail })] })]
								}, item.id))
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.sidebarFooter,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "ACTIVE MEMORY BODIES" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: [
										activeBodies,
										" / ",
										status === void 0 ? "—" : memoryBodies.length
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: writeEnabled ? "Subagent supervised" : "Read only" })
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.canvas,
							children: [
								page === "overview" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OverviewPage, {
									client,
									revision,
									writeEnabled,
									onMutate: mutate,
									onExplore: explore
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
		const inject = ["slots", "connection"];
		/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
		function apply(rawContext) {
			const ctx = rawContext;
			const settings = new MnemonSettingsScope(ctx.connection);
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "mnemon",
				order: 30,
				label: "记忆体",
				inject: () => ({
					connection: ctx.connection,
					settingsScope: settings
				})
			}, MnemonView));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map