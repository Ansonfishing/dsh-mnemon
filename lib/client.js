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
		const css$1 = ":root{--mn-bg:var(--dsw-alias-bg-base,#f7f8fa);--mn-layer-1:var(--dsw-alias-bg-layer-1,#fff);--mn-layer-2:var(--dsw-alias-bg-layer-2,#f1f3f7);--mn-input:var(--dsw-specific-input-major,#fff);--mn-text:var(--dsw-alias-label-primary,#17191f);--mn-muted:var(--dsw-alias-label-secondary,#667085);--mn-faint:var(--dsw-alias-label-tertiary,#98a1b2);--mn-line:var(--dsw-alias-border-l2,#1a223317);--mn-line-strong:var(--dsw-alias-border-l1,#1a223324);--mn-accent:var(--dsw-alias-brand-primary,#4d6bfe);--mn-hover:var(--dsw-alias-interactive-bg-hover,#4d6bfe14);--mn-danger:var(--dsw-alias-state-error-primary,#d84c5b);--mn-success:#2eb67d;--mn-code:var(--ds-font-family-code,\"SFMono-Regular\", Consolas, monospace)}.lvR3Qq_shell{box-sizing:border-box;height:100%;min-height:580px;color:var(--mn-text);background:var(--mn-bg);flex-direction:column;font:13px/1.55 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:flex;overflow:hidden}.lvR3Qq_shell *,.lvR3Qq_shell :before,.lvR3Qq_shell :after{box-sizing:border-box}.lvR3Qq_masthead{border-bottom:1px solid var(--mn-line);background:radial-gradient(circle at 78% -80%, color-mix(in srgb, var(--mn-accent) 12%, transparent), transparent 42%), var(--mn-bg);flex:none;justify-content:space-between;align-items:center;gap:24px;min-height:82px;padding:14px clamp(18px,2.5vw,32px);display:flex}.lvR3Qq_brand{align-items:center;gap:13px;min-width:0;display:flex}.lvR3Qq_brandMark{border:1px solid color-mix(in srgb, var(--mn-accent) 30%, var(--mn-line));width:42px;height:42px;color:var(--mn-accent);background:linear-gradient(135deg, color-mix(in srgb, var(--mn-accent) 14%, transparent), transparent 65%), var(--mn-layer-1);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--mn-layer-1) 70%, transparent);font:700 18px/1 var(--mn-code);border-radius:11px;flex:none;place-items:center;display:grid}.lvR3Qq_masthead h1{letter-spacing:-.02em;margin:1px 0 0;font-size:19px;line-height:1.15}.lvR3Qq_masthead p{color:var(--mn-muted);margin:3px 0 0;font-size:12px}.lvR3Qq_eyebrow,.lvR3Qq_cardKicker,.lvR3Qq_pageHeader>div>span,.lvR3Qq_sectionHeading>div>span,.lvR3Qq_sidebarFooter>span,.lvR3Qq_configPath>span{color:var(--mn-faint);font:650 9px/1.2 var(--mn-code);letter-spacing:.12em;text-transform:uppercase}.lvR3Qq_statusCluster{border:1px solid var(--mn-line-strong);min-height:34px;color:var(--mn-muted);background:var(--mn-layer-1);border-radius:9px;flex:none;align-items:center;gap:8px;padding:0 4px 0 11px;font-size:11px;display:flex}.lvR3Qq_statusDot{border-radius:50%;width:6px;height:6px}.lvR3Qq_online{background:var(--mn-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-success) 13%, transparent)}.lvR3Qq_offline{background:var(--mn-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--mn-danger) 12%, transparent)}.lvR3Qq_iconButton,.lvR3Qq_sectionHeading button{width:27px;height:27px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}.lvR3Qq_iconButton:hover,.lvR3Qq_sectionHeading button:hover{color:var(--mn-accent);background:var(--mn-hover)}.lvR3Qq_alert,.lvR3Qq_inlineError{border:1px solid color-mix(in srgb, var(--mn-danger) 28%, transparent);color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 7%, var(--mn-layer-1));border-radius:8px;padding:10px 13px;font-size:12px}.lvR3Qq_alert{flex-direction:column;flex:none;gap:1px;margin:10px clamp(18px,2.5vw,32px) 0;display:flex}.lvR3Qq_telemetry{border-bottom:1px solid var(--mn-line);background:var(--mn-layer-1);flex:none;grid-template-columns:minmax(155px,1.25fr) repeat(4,minmax(90px,1fr));min-height:57px;padding:0 clamp(18px,2.5vw,32px);display:grid}.lvR3Qq_telemetryLead,.lvR3Qq_telemetryMetric{align-items:center;min-width:0;display:flex}.lvR3Qq_telemetryLead{color:var(--mn-faint);font:600 9px/1 var(--mn-code);letter-spacing:.08em;text-transform:uppercase;gap:9px}.lvR3Qq_telemetryPulse{background:var(--mn-accent);width:7px;height:7px;box-shadow:0 0 0 4px color-mix(in srgb, var(--mn-accent) 10%, transparent);border-radius:2px}.lvR3Qq_telemetryMetric{border-left:1px solid var(--mn-line);justify-content:space-between;gap:10px;padding:0 15px}.lvR3Qq_telemetryMetric span{color:var(--mn-faint);text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.lvR3Qq_telemetryMetric strong{font:650 14px/1 var(--mn-code);font-variant-numeric:tabular-nums}.lvR3Qq_workspace{flex:1;min-height:0;display:flex}.lvR3Qq_sidebar{border-right:1px solid var(--mn-line);background:color-mix(in srgb, var(--mn-layer-1) 58%, var(--mn-bg));flex-direction:column;flex:0 0 198px;justify-content:space-between;width:198px;padding:14px 10px 12px;display:flex}.lvR3Qq_nav{gap:4px;display:grid}.lvR3Qq_nav button{width:100%;color:var(--mn-muted);text-align:left;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;grid-template-columns:28px minmax(0,1fr);align-items:center;gap:8px;padding:8px;display:grid}.lvR3Qq_nav button:hover{color:var(--mn-text);background:var(--mn-hover)}.lvR3Qq_nav button[aria-current=page]{border-color:var(--mn-line);color:var(--mn-text);background:var(--mn-layer-1);box-shadow:0 1px 2px #0f16280a}.lvR3Qq_nav button[aria-current=page] .lvR3Qq_navGlyph{border-color:color-mix(in srgb, var(--mn-accent) 34%, var(--mn-line));color:var(--mn-accent);background:color-mix(in srgb, var(--mn-accent) 9%, transparent)}.lvR3Qq_nav button>span:last-child{min-width:0;display:grid}.lvR3Qq_nav button strong{font-size:12px;font-weight:600}.lvR3Qq_nav button small{color:var(--mn-faint);font-size:10px}.lvR3Qq_navGlyph{border:1px solid var(--mn-line);width:27px;height:27px;color:var(--mn-faint);background:var(--mn-bg);font:600 14px/1 var(--mn-code);border-radius:7px;place-items:center;display:grid}.lvR3Qq_sidebarFooter{border-top:1px solid var(--mn-line);gap:4px;padding:12px 10px 5px;display:grid}.lvR3Qq_sidebarFooter code{color:var(--mn-text);font:11px/1.4 var(--mn-code);text-overflow:ellipsis;overflow:hidden}.lvR3Qq_sidebarFooter small{color:var(--mn-faint);font-size:10px}.lvR3Qq_canvas{flex:1;min-width:0;min-height:0;overflow:hidden}.lvR3Qq_page{height:100%;padding:22px clamp(18px,2.5vw,32px) 42px;overflow:auto}.lvR3Qq_pageHeader{justify-content:space-between;align-items:flex-start;gap:20px;max-width:1120px;margin:0 auto 18px;display:flex}.lvR3Qq_pageHeader h2{letter-spacing:-.015em;margin:4px 0 2px;font-size:18px;line-height:1.25}.lvR3Qq_pageHeader p{color:var(--mn-muted);margin:0;font-size:12px}.lvR3Qq_pageHeader>code{color:var(--mn-faint);font:9px/1 var(--mn-code);letter-spacing:.08em;margin-top:8px}.lvR3Qq_searchBar{border:1px solid var(--mn-line-strong);background:var(--mn-layer-1);border-radius:10px;max-width:1120px;margin:0 auto;display:grid;overflow:hidden;box-shadow:0 2px 8px #11182709}.lvR3Qq_queryField{border-bottom:1px solid var(--mn-line);grid-template-columns:auto minmax(0,1fr) auto;align-items:center;min-height:50px;display:grid}.lvR3Qq_searchIcon{color:var(--mn-accent);font:22px/1 var(--mn-code);padding-left:16px}.lvR3Qq_queryField input{width:100%;min-width:0;color:var(--mn-text);background:0 0;border:0;outline:none;padding:13px 12px;font:13px/1.5 inherit}.lvR3Qq_queryField input::placeholder{color:var(--mn-faint)}.lvR3Qq_queryField kbd{border:1px solid var(--mn-line-strong);color:var(--mn-faint);background:var(--mn-layer-2);font:10px/1.3 var(--mn-code);border-bottom-width:2px;border-radius:5px;margin-right:12px;padding:2px 6px}.lvR3Qq_searchControls{align-items:center;gap:16px;min-height:46px;padding:6px;display:flex}.lvR3Qq_searchControls label{color:var(--mn-faint);align-items:center;gap:7px;font-size:10px;display:flex}.lvR3Qq_searchControls label:first-child{margin-left:8px}.lvR3Qq_searchControls .lvR3Qq_primaryButton{margin-left:auto}.lvR3Qq_searchControls select,.lvR3Qq_rememberForm input,.lvR3Qq_rememberForm select,.lvR3Qq_rememberForm textarea{border:1px solid var(--mn-line-strong);color:var(--mn-text);background:var(--mn-input);font:inherit;border-radius:7px;outline:none}.lvR3Qq_searchControls select{min-width:118px;padding:6px 25px 6px 8px;font-size:11px}.lvR3Qq_searchControls select:focus,.lvR3Qq_rememberForm input:focus,.lvR3Qq_rememberForm select:focus,.lvR3Qq_rememberForm textarea:focus{border-color:var(--mn-accent);box-shadow:0 0 0 2px color-mix(in srgb, var(--mn-accent) 13%, transparent)}.lvR3Qq_primaryButton,.lvR3Qq_ghostButton,.lvR3Qq_dangerButton,.lvR3Qq_dangerSolidButton{cursor:pointer;border-radius:7px;font:600 11px/1.2 inherit}.lvR3Qq_primaryButton{border:1px solid var(--mn-accent);color:#fff;background:var(--mn-accent);padding:9px 14px}.lvR3Qq_primaryButton:disabled{opacity:.46;cursor:default}.lvR3Qq_primaryButton:not(:disabled):hover{filter:brightness(1.06)}.lvR3Qq_inlineError{max-width:1120px;margin:12px auto 0}.lvR3Qq_emptyState{max-width:660px;min-height:260px;color:var(--mn-muted);grid-template-columns:auto minmax(0,1fr);place-content:center;align-items:center;gap:18px;margin:22px auto 0;padding:36px;display:grid}.lvR3Qq_emptyState h2{color:var(--mn-text);margin:5px 0 4px;font-size:16px}.lvR3Qq_emptyState p{max-width:520px;margin:0}.lvR3Qq_orbit{border:1px solid var(--mn-line);background:radial-gradient(circle, color-mix(in srgb, var(--mn-accent) 14%, transparent), transparent 62%);border-radius:50%;place-items:center;width:76px;height:76px;display:grid}.lvR3Qq_orbit span{border:1px solid color-mix(in srgb, var(--mn-accent) 35%, var(--mn-line));width:40px;height:40px;color:var(--mn-accent);font:400 20px/1 var(--mn-code);border-radius:50%;place-items:center;display:grid}.lvR3Qq_resultLayout{grid-template-columns:minmax(0,1fr);gap:14px;max-width:1120px;margin:18px auto 0;display:grid}.lvR3Qq_resultLayout:has(.lvR3Qq_relatedPane){grid-template-columns:minmax(0,1fr) minmax(300px,.7fr)}.lvR3Qq_results{align-content:start;gap:8px;min-width:0;display:grid}.lvR3Qq_sectionHeading{justify-content:space-between;align-items:center;gap:12px;min-height:34px;display:flex}.lvR3Qq_sectionHeading>div{gap:2px;display:grid}.lvR3Qq_sectionHeading h2{margin:0;font-size:13px}.lvR3Qq_sectionHeading>strong{border:1px solid var(--mn-line);min-width:24px;height:20px;color:var(--mn-faint);background:var(--mn-layer-2);font:600 10px/1 var(--mn-code);border-radius:10px;place-items:center;display:grid}.lvR3Qq_insightCard{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:9px;padding:14px 15px 12px;position:relative;box-shadow:0 1px 2px #11182706}.lvR3Qq_insightCard:before{background:color-mix(in srgb, var(--mn-accent) 62%, transparent);content:\"\";border-radius:0 2px 2px 0;width:2px;position:absolute;top:13px;bottom:13px;left:-1px}.lvR3Qq_cardTop{justify-content:space-between;align-items:flex-start;gap:10px;display:flex}.lvR3Qq_badges{flex-wrap:wrap;gap:5px;display:flex}.lvR3Qq_badge{border:1px solid color-mix(in srgb, var(--mn-accent) 15%, var(--mn-line));color:var(--mn-muted);background:color-mix(in srgb, var(--mn-accent) 6%, transparent);border-radius:9px;padding:2px 7px;font-size:9px}.lvR3Qq_id{color:var(--mn-faint);font:9px/1.5 var(--mn-code)}.lvR3Qq_content{color:var(--mn-text);white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0 8px}.lvR3Qq_tags{color:var(--mn-faint);font:9px/1.4 var(--mn-code);flex-wrap:wrap;gap:8px;display:flex}.lvR3Qq_cardActions{justify-content:flex-end;gap:5px;margin-top:11px;display:flex}.lvR3Qq_ghostButton,.lvR3Qq_dangerButton{border:1px solid var(--mn-line);color:var(--mn-muted);background:0 0;padding:5px 8px}.lvR3Qq_ghostButton:hover{border-color:color-mix(in srgb, var(--mn-accent) 45%, var(--mn-line));color:var(--mn-accent);background:var(--mn-hover)}.lvR3Qq_dangerButton:hover{border-color:color-mix(in srgb, var(--mn-danger) 45%, var(--mn-line));color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 7%, transparent)}.lvR3Qq_dangerSolidButton{border:1px solid var(--mn-danger);color:#fff;background:var(--mn-danger);padding:5px 9px}.lvR3Qq_confirmBar{border-top:1px solid var(--mn-line);justify-content:flex-end;align-items:center;gap:6px;width:100%;padding:6px 0 0;display:flex}.lvR3Qq_confirmBar>span{color:var(--mn-danger);margin-right:auto;font-size:10px}.lvR3Qq_relatedPane{border:1px solid var(--mn-line-strong);background:var(--mn-layer-2);border-radius:10px;align-self:start;max-height:calc(100vh - 205px);padding:12px;position:sticky;top:0;overflow:auto}.lvR3Qq_relatedSource{border-left:2px solid var(--mn-accent);color:var(--mn-muted);background:var(--mn-layer-1);margin:8px 0 12px;padding:10px;font-size:11px}.lvR3Qq_relatedPane .lvR3Qq_insightCard{box-shadow:none;margin-top:7px}.lvR3Qq_loading,.lvR3Qq_muted{color:var(--mn-faint);text-align:center;padding:24px 10px;font-size:11px}.lvR3Qq_writebackLayout{grid-template-columns:250px minmax(0,1fr);gap:14px;max-width:1000px;margin:0 auto;display:grid}.lvR3Qq_writeGuide,.lvR3Qq_rememberForm,.lvR3Qq_configCard{border:1px solid var(--mn-line);background:var(--mn-layer-1);border-radius:10px}.lvR3Qq_writeGuide{align-self:start;padding:18px}.lvR3Qq_writeGuide h3{margin:5px 0 17px;font-size:15px}.lvR3Qq_writeGuide ol{counter-reset:gate;gap:0;margin:0;padding:0;list-style:none;display:grid}.lvR3Qq_writeGuide li{counter-increment:gate;gap:2px;padding:0 0 15px 30px;display:grid;position:relative}.lvR3Qq_writeGuide li:before{border:1px solid var(--mn-line-strong);width:20px;height:20px;color:var(--mn-accent);background:var(--mn-layer-2);content:counter(gate, decimal-leading-zero);font:8px/1 var(--mn-code);border-radius:6px;place-items:center;display:grid;position:absolute;top:0;left:0}.lvR3Qq_writeGuide li:not(:last-child):after{background:var(--mn-line);content:\"\";width:1px;position:absolute;top:22px;bottom:2px;left:10px}.lvR3Qq_writeGuide li strong{font-size:11px}.lvR3Qq_writeGuide li span{color:var(--mn-muted);font-size:10px}.lvR3Qq_writeGuide>p{border-top:1px solid var(--mn-line);color:var(--mn-faint);margin:3px 0 0;padding-top:12px;font-size:10px}.lvR3Qq_rememberForm{gap:17px;padding:clamp(20px,3vw,30px);display:grid}.lvR3Qq_rememberForm label{color:var(--mn-muted);gap:6px;font-size:11px;font-weight:600;display:grid}.lvR3Qq_rememberForm input,.lvR3Qq_rememberForm select,.lvR3Qq_rememberForm textarea{width:100%;color:var(--mn-text);resize:vertical;padding:9px 11px;font-weight:400}.lvR3Qq_formGrid{grid-template-columns:1fr 1fr;gap:13px;display:grid}.lvR3Qq_fieldWide{grid-column:1/-1}.lvR3Qq_formActions{color:var(--mn-muted);align-items:center;gap:12px;padding-top:3px;font-size:11px;display:flex}.lvR3Qq_configGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:1050px;margin:0 auto;display:grid}.lvR3Qq_configCard{min-width:0;padding:18px}.lvR3Qq_runtimeCard{grid-row:span 2}.lvR3Qq_commandCard{grid-column:1/-1}.lvR3Qq_configCard h3{margin:5px 0 13px;font-size:15px}.lvR3Qq_configCard p{color:var(--mn-muted);margin:0;font-size:11px}.lvR3Qq_configCard p code{color:var(--mn-text)}.lvR3Qq_cardTitleRow{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.lvR3Qq_runtimeBadge{font:650 8px/1.2 var(--mn-code);letter-spacing:.08em;border:1px solid;border-radius:8px;padding:3px 7px}.lvR3Qq_runtimeOnline{color:var(--mn-success);background:color-mix(in srgb, var(--mn-success) 7%, transparent)}.lvR3Qq_runtimeOffline{color:var(--mn-danger);background:color-mix(in srgb, var(--mn-danger) 7%, transparent)}.lvR3Qq_configCard dl{margin:0}.lvR3Qq_configCard dl>div{border-bottom:1px solid var(--mn-line);grid-template-columns:88px minmax(0,1fr);gap:10px;padding:8px 0;display:grid}.lvR3Qq_configCard dl>div:last-child{border-bottom:0}.lvR3Qq_configCard dt{color:var(--mn-faint);font-size:10px}.lvR3Qq_configCard dd{overflow-wrap:anywhere;min-width:0;margin:0;font-size:11px}.lvR3Qq_configCard code{font-family:var(--mn-code);font-size:.92em}.lvR3Qq_configCard ul{color:var(--mn-muted);gap:7px;margin:0;padding-left:17px;font-size:11px;display:grid}.lvR3Qq_configPath{border:1px solid var(--mn-line);background:var(--mn-layer-2);border-radius:7px;gap:5px;margin-top:15px;padding:10px;display:grid}.lvR3Qq_configPath code{overflow-wrap:anywhere}.lvR3Qq_commandCard>code{border:1px solid var(--mn-line);color:var(--mn-text);background:var(--mn-layer-2);border-radius:6px;margin:0 6px 9px 0;padding:5px 8px;display:inline-block}@media (width<=900px){.lvR3Qq_telemetry{grid-template-columns:repeat(4,minmax(80px,1fr))}.lvR3Qq_telemetryLead{display:none}.lvR3Qq_sidebar{flex-basis:174px;width:174px}.lvR3Qq_resultLayout:has(.lvR3Qq_relatedPane){grid-template-columns:1fr}.lvR3Qq_relatedPane{max-height:none;position:static}.lvR3Qq_writebackLayout{grid-template-columns:1fr}.lvR3Qq_writeGuide ol{grid-template-columns:repeat(3,1fr);gap:10px}.lvR3Qq_writeGuide li{padding:28px 0 0}.lvR3Qq_writeGuide li:not(:last-child):after{display:none}}@media (width<=680px){.lvR3Qq_shell{min-height:640px;overflow:auto}.lvR3Qq_masthead{flex-direction:column;align-items:flex-start;gap:10px}.lvR3Qq_masthead p{display:none}.lvR3Qq_statusCluster{justify-content:center;align-self:stretch}.lvR3Qq_telemetry{grid-template-columns:repeat(2,minmax(0,1fr))}.lvR3Qq_telemetryMetric{border-bottom:1px solid var(--mn-line);min-height:46px}.lvR3Qq_workspace{flex-direction:column;overflow:visible}.lvR3Qq_sidebar{border-right:0;border-bottom:1px solid var(--mn-line);flex:none;width:100%;padding:8px}.lvR3Qq_nav{grid-template-columns:repeat(3,1fr)}.lvR3Qq_nav button{grid-template-columns:auto minmax(0,1fr)}.lvR3Qq_nav button small,.lvR3Qq_sidebarFooter{display:none}.lvR3Qq_canvas{overflow:visible}.lvR3Qq_page{height:auto;overflow:visible}.lvR3Qq_pageHeader{flex-direction:column;gap:5px}.lvR3Qq_pageHeader>code{margin-top:0}.lvR3Qq_searchControls{flex-wrap:wrap;gap:7px}.lvR3Qq_searchControls label{flex:40%}.lvR3Qq_searchControls label:first-child{margin-left:0}.lvR3Qq_searchControls select{width:100%}.lvR3Qq_searchControls .lvR3Qq_primaryButton{flex:100%;margin-left:0}.lvR3Qq_emptyState{text-align:center;grid-template-columns:1fr;padding:28px 10px}.lvR3Qq_orbit{margin:0 auto}.lvR3Qq_configGrid{grid-template-columns:1fr}.lvR3Qq_runtimeCard,.lvR3Qq_commandCard{grid-area:auto}.lvR3Qq_formGrid{grid-template-columns:1fr}.lvR3Qq_fieldWide{grid-column:auto}.lvR3Qq_formActions{flex-direction:column;align-items:stretch}}@media (width<=430px){.lvR3Qq_brandMark{width:36px;height:36px}.lvR3Qq_nav button{text-align:center;justify-content:center;padding:7px 4px;display:flex}.lvR3Qq_navGlyph{display:none}.lvR3Qq_telemetryMetric{padding:0 9px}.lvR3Qq_telemetryMetric span{font-size:9px}.lvR3Qq_writeGuide ol{grid-template-columns:1fr}.lvR3Qq_writeGuide li{padding:0 0 12px 28px}}";
		const tagId$1 = "dsh-mnemon/MnemonView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mnemon";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var MnemonView_module_css_default = {
			"orbit": "lvR3Qq_orbit",
			"resultLayout": "lvR3Qq_resultLayout",
			"online": "lvR3Qq_online",
			"workspace": "lvR3Qq_workspace",
			"masthead": "lvR3Qq_masthead",
			"telemetryMetric": "lvR3Qq_telemetryMetric",
			"loading": "lvR3Qq_loading",
			"relatedPane": "lvR3Qq_relatedPane",
			"dangerButton": "lvR3Qq_dangerButton",
			"badge": "lvR3Qq_badge",
			"statusCluster": "lvR3Qq_statusCluster",
			"results": "lvR3Qq_results",
			"confirmBar": "lvR3Qq_confirmBar",
			"page": "lvR3Qq_page",
			"queryField": "lvR3Qq_queryField",
			"runtimeCard": "lvR3Qq_runtimeCard",
			"cardActions": "lvR3Qq_cardActions",
			"searchControls": "lvR3Qq_searchControls",
			"content": "lvR3Qq_content",
			"searchBar": "lvR3Qq_searchBar",
			"runtimeOnline": "lvR3Qq_runtimeOnline",
			"formActions": "lvR3Qq_formActions",
			"relatedSource": "lvR3Qq_relatedSource",
			"telemetryLead": "lvR3Qq_telemetryLead",
			"inlineError": "lvR3Qq_inlineError",
			"navGlyph": "lvR3Qq_navGlyph",
			"dangerSolidButton": "lvR3Qq_dangerSolidButton",
			"iconButton": "lvR3Qq_iconButton",
			"writeGuide": "lvR3Qq_writeGuide",
			"runtimeBadge": "lvR3Qq_runtimeBadge",
			"rememberForm": "lvR3Qq_rememberForm",
			"cardTitleRow": "lvR3Qq_cardTitleRow",
			"offline": "lvR3Qq_offline",
			"telemetry": "lvR3Qq_telemetry",
			"id": "lvR3Qq_id",
			"formGrid": "lvR3Qq_formGrid",
			"commandCard": "lvR3Qq_commandCard",
			"eyebrow": "lvR3Qq_eyebrow",
			"cardKicker": "lvR3Qq_cardKicker",
			"ghostButton": "lvR3Qq_ghostButton",
			"canvas": "lvR3Qq_canvas",
			"emptyState": "lvR3Qq_emptyState",
			"brandMark": "lvR3Qq_brandMark",
			"muted": "lvR3Qq_muted",
			"configCard": "lvR3Qq_configCard",
			"primaryButton": "lvR3Qq_primaryButton",
			"nav": "lvR3Qq_nav",
			"sidebarFooter": "lvR3Qq_sidebarFooter",
			"insightCard": "lvR3Qq_insightCard",
			"statusDot": "lvR3Qq_statusDot",
			"sidebar": "lvR3Qq_sidebar",
			"pageHeader": "lvR3Qq_pageHeader",
			"runtimeOffline": "lvR3Qq_runtimeOffline",
			"fieldWide": "lvR3Qq_fieldWide",
			"cardTop": "lvR3Qq_cardTop",
			"configPath": "lvR3Qq_configPath",
			"configGrid": "lvR3Qq_configGrid",
			"tags": "lvR3Qq_tags",
			"brand": "lvR3Qq_brand",
			"searchIcon": "lvR3Qq_searchIcon",
			"shell": "lvR3Qq_shell",
			"sectionHeading": "lvR3Qq_sectionHeading",
			"telemetryPulse": "lvR3Qq_telemetryPulse",
			"badges": "lvR3Qq_badges",
			"writebackLayout": "lvR3Qq_writebackLayout",
			"alert": "lvR3Qq_alert"
		};
		//#endregion
		//#region src/client/MnemonView.tsx
		const PAGE_NAV = [
			{
				id: "explore",
				label: "检索记忆",
				detail: "召回与关联",
				glyph: "⌕"
			},
			{
				id: "remember",
				label: "沉淀记忆",
				detail: "审慎写回",
				glyph: "+"
			},
			{
				id: "config",
				label: "运行状态",
				detail: "配置与原则",
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: MnemonView_module_css_default.cardActions,
						children: props.confirmForget ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.confirmBar,
							role: "group",
							"aria-label": "确认忘记记忆",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "软删除这条记忆？" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.dangerSolidButton,
									onClick: () => props.onConfirmForget(insight),
									children: "确认忘记"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MnemonView_module_css_default.ghostButton,
									onClick: props.onCancelForget,
									children: "取消"
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
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
								onClick: () => props.onRequestForget(insight),
								children: "忘记"
							})
						] })
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
			const [confirmForgetId, setConfirmForgetId] = (0, react.useState)(null);
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
				setConfirmForgetId(null);
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
				try {
					await client.forget(insight.id);
					setResults((items) => items.filter((item) => item.id !== insight.id));
					setRelated((items) => items.filter((item) => item.id !== insight.id));
					if (relatedTo?.id === insight.id) setRelatedTo(null);
					setConfirmForgetId(null);
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
						className: MnemonView_module_css_default.masthead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MnemonView_module_css_default.brand,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MnemonView_module_css_default.brandMark,
								"aria-hidden": "true",
								children: "M"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: MnemonView_module_css_default.eyebrow,
									children: "EXTERNAL MEMORY GRAPH"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "Mnemon" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "让值得保留的上下文，在下一次任务中仍然可用。" })
							] })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
						className: MnemonView_module_css_default.telemetry,
						"aria-label": "记忆统计",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: MnemonView_module_css_default.telemetryLead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: MnemonView_module_css_default.telemetryPulse,
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Memory telemetry" })]
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
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "数据库" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stats === void 0 ? "—" : humanBytes(stats.dbSizeBytes) })]
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "ACTIVE STORE" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.store ?? "—" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: writeEnabled ? "Read / Write" : "Read only" })
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MnemonView_module_css_default.canvas,
							children: [
								page === "explore" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.page,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.pageHeader,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "RECALL" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "检索记忆" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "用问题而不是关键词堆砌，找到决策背后的上下文。" })
											] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: [status?.defaultRecallLimit ?? "—", " MAX RESULTS"] })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
											className: MnemonView_module_css_default.searchBar,
											onSubmit: (event) => void performSearch(event),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: MnemonView_module_css_default.queryField,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: MnemonView_module_css_default.searchIcon,
														"aria-hidden": "true",
														children: "⌕"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														value: query,
														onChange: (event) => setQuery(event.target.value),
														placeholder: "搜索决策、偏好、经验、项目约定……",
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
										searchError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: MnemonView_module_css_default.inlineError,
											role: "alert",
											children: searchError
										}),
										!searched && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.emptyState,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: MnemonView_module_css_default.orbit,
												"aria-hidden": "true",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "◎" })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: MnemonView_module_css_default.cardKicker,
													children: "READY TO RECALL"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "从一个明确问题开始" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "例如“为什么选用 SQLite？”或“这个项目有哪些发布约定？”。聚焦的查询会比批量加载整库更可靠。" })
											] })]
										}),
										searched && !searching && results.length === 0 && searchError === null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.emptyState,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: MnemonView_module_css_default.orbit,
												"aria-hidden": "true",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "0" })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "没有命中" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "换一个更具体的实体、决策或时间线关键词试试。" })] })]
										}),
										results.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: MnemonView_module_css_default.resultLayout,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: MnemonView_module_css_default.results,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: MnemonView_module_css_default.sectionHeading,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "RESULT SET" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "召回结果" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: results.length })]
												}), results.map((insight) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightCard, {
													insight,
													writeEnabled,
													confirmForget: confirmForgetId === insight.id,
													onRelated: (item) => void showRelated(item),
													onRequestForget: (item) => setConfirmForgetId(item.id),
													onConfirmForget: (item) => void forget(item),
													onCancelForget: () => setConfirmForgetId(null)
												}, insight.id))]
											}), relatedTo !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
												className: MnemonView_module_css_default.relatedPane,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: MnemonView_module_css_default.sectionHeading,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "GRAPH INSPECTOR" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "关联记忆" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
														writeEnabled,
														confirmForget: confirmForgetId === insight.id,
														onRelated: (item) => void showRelated(item),
														onRequestForget: (item) => setConfirmForgetId(item.id),
														onConfirmForget: (item) => void forget(item),
														onCancelForget: () => setConfirmForgetId(null)
													}, insight.id))
												]
											})]
										})
									]
								}),
								page === "remember" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.page,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.pageHeader,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "WRITEBACK" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "沉淀记忆" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "只保存稳定、可复用，并且未来值得再次检索的信息。" })
										] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: writeEnabled ? "WRITE ENABLED" : "READ ONLY" })]
									}), !writeEnabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.emptyState,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: MnemonView_module_css_default.orbit,
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "⊘" })
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "当前为只读模式" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "在“设置 → 插件配置 → Mnemon 外置记忆”中启用写入，重启 DSH 后生效。" })] })]
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.writebackLayout,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
											className: MnemonView_module_css_default.writeGuide,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: MnemonView_module_css_default.cardKicker,
													children: "DURABILITY GATE"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "写入前快速判断" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ol", { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "稳定" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "不是临时进度或一次性输出" })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "可复用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "能影响未来的选择或执行" })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "有上下文" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "包含原因、范围和必要约束" })] })
												] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "当前指令与仓库事实始终高于历史记忆。" })
											]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
											className: MnemonView_module_css_default.rememberForm,
											onSubmit: (event) => void saveMemory(event),
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
													className: MnemonView_module_css_default.fieldWide,
													children: ["记忆内容", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
														value: content,
														onChange: (event) => setContent(event.target.value),
														maxLength: 8e3,
														rows: 9,
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
													}), saveResult !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														role: "status",
														children: saveResult
													})]
												})
											]
										})]
									})]
								}),
								page === "config" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: MnemonView_module_css_default.page,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.pageHeader,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "RUNTIME" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "运行状态" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "这里展示当前生效值；修改请前往 DSH 插件配置。" })
										] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.healthy === true ? "SYSTEM NOMINAL" : "CHECK REQUIRED" })]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: MnemonView_module_css_default.configGrid,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
												className: `${MnemonView_module_css_default.configCard} ${MnemonView_module_css_default.runtimeCard}`,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: MnemonView_module_css_default.cardTitleRow,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: MnemonView_module_css_default.cardKicker,
														children: "CONNECTION"
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Mnemon Runtime" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${MnemonView_module_css_default.runtimeBadge} ${status?.healthy === true ? MnemonView_module_css_default.runtimeOnline : MnemonView_module_css_default.runtimeOffline}`,
														children: status?.healthy === true ? "ONLINE" : "OFFLINE"
													})]
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "CLI" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.cliPath ?? "mnemon" }) })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "版本" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status?.version ?? "—" })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Store" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.store ?? "default" }) })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "数据目录" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status?.dataDir ?? "~/.mnemon" }) })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "超时" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [status?.timeoutMs ?? "—", " ms"] })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "默认召回" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [status?.defaultRecallLimit ?? "—", " 条"] })] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "访问模式" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: writeEnabled ? "读取与写入" : "只读" })] })
												] })]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
												className: MnemonView_module_css_default.configCard,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: MnemonView_module_css_default.cardKicker,
														children: "DSH SETTINGS"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "用户配置" }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
														"在“设置 → 插件配置 → Mnemon 外置记忆”修改。值写入 ",
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "~/.dsh/settings.yaml" }),
														" 的 ",
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "mnemon" }),
														" 命名空间，覆盖 profile base，并在重启后生效。"
													] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: MnemonView_module_css_default.configPath,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "SETTINGS PATH" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "~/.dsh/settings.yaml → mnemon" })]
													})
												]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
												className: MnemonView_module_css_default.configCard,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: MnemonView_module_css_default.cardKicker,
														children: "OPERATING PRINCIPLE"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "记忆边界" }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", { children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "只在记忆可能改变结果时召回。" }),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "当前用户指令和仓库事实高于旧记忆。" }),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "只沉淀稳定、可复用的洞察。" }),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "不会把整个记忆库自动注入上下文。" })
													] })
												]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
												className: `${MnemonView_module_css_default.configCard} ${MnemonView_module_css_default.commandCard}`,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: MnemonView_module_css_default.cardKicker,
														children: "NATIVE COMMAND"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "对话内接入" }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "/mnemon status" }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "/mnemon recall <query>" }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "/mnemon remember <content>" }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "无需模型参与即可查询状态、召回、写入、关联和软删除。" })
												]
											})
										]
									})]
								})
							]
						})]
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
			"error": "j5f0Ia_error",
			"resetLink": "j5f0Ia_resetLink",
			"readOnly": "j5f0Ia_readOnly",
			"actions": "j5f0Ia_actions",
			"summary": "j5f0Ia_summary",
			"fieldTitle": "j5f0Ia_fieldTitle",
			"summaryMeta": "j5f0Ia_summaryMeta",
			"switches": "j5f0Ia_switches",
			"field": "j5f0Ia_field",
			"body": "j5f0Ia_body",
			"chevron": "j5f0Ia_chevron",
			"discard": "j5f0Ia_discard",
			"switch": "j5f0Ia_switch",
			"notice": "j5f0Ia_notice",
			"memoryMark": "j5f0Ia_memoryMark",
			"toggleRow": "j5f0Ia_toggleRow",
			"grid": "j5f0Ia_grid",
			"save": "j5f0Ia_save",
			"card": "j5f0Ia_card",
			"summaryCopy": "j5f0Ia_summaryCopy"
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