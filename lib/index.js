import z from "schemastery";
import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { spawn } from "node:child_process";
//#endregion
//#region lib/types/config.js
const Config = z.object({
	cliPath: z.string(),
	dataDir: z.string(),
	store: z.string(),
	timeoutMs: z.number().step(1).min(100).max(12e4).default(1e4),
	defaultRecallLimit: z.number().step(1).min(1).max(50).default(10),
	routingGuidance: z.boolean().default(true),
	tabEnabled: z.boolean().default(true),
	writeEnabled: z.boolean().default(true)
});
function optionalText(value) {
	const trimmed = value?.trim();
	return trimmed === void 0 || trimmed === "" ? void 0 : trimmed;
}
function resolveConfig(config = {}) {
	const cliPath = optionalText(config.cliPath);
	const dataDir = optionalText(config.dataDir);
	const store = optionalText(config.store);
	if (store !== void 0 && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) throw new Error("dsh-mnemon: store must match [a-zA-Z0-9][a-zA-Z0-9_-]*");
	return {
		...cliPath === void 0 ? {} : { cliPath },
		...dataDir === void 0 ? {} : { dataDir },
		...store === void 0 ? {} : { store },
		timeoutMs: config.timeoutMs ?? 1e4,
		defaultRecallLimit: config.defaultRecallLimit ?? 10,
		routingGuidance: config.routingGuidance ?? true,
		tabEnabled: config.tabEnabled ?? true,
		writeEnabled: config.writeEnabled ?? true
	};
}
//#endregion
//#region lib/types/guidance.js
const GUIDANCE_SECTION_NAME = "mnemon:routing";
const ROUTING_GUIDANCE = `## Mnemon external memory

Mnemon is a shared, persistent memory graph. At the start of a task, make a recall judgment: use one focused mnemon_recall query only when prior decisions, preferences, rationale, conventions, pitfalls, or earlier work could materially change the result. Current user instructions and repository evidence always outrank stale memory. At the end of a task, make a writeback judgment: use mnemon_remember only for durable, self-contained knowledge worth carrying into future sessions; skip routine progress, transcripts, temporary state, and facts already obvious from the repository. Search before writing to avoid duplicates, use mnemon_related when graph context matters, and never invent memory that Mnemon did not return.`;
function registerGuidance(ctx) {
	ctx.get("systemPrompt")?.section?.({
		name: GUIDANCE_SECTION_NAME,
		order: 150,
		text: ROUTING_GUIDANCE
	});
}
//#endregion
//#region lib/types/rpc.js
const MNEMON_READ_CHANNEL = "/dsh-mnemon-read";
const MNEMON_WRITE_CHANNEL = "/dsh-mnemon-write";
function object$1(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("payload must be an object");
	return value;
}
function success$1(value) {
	return {
		ok: true,
		value
	};
}
function failure$1(error) {
	return {
		ok: false,
		error: {
			code: "mnemon-error",
			message: error instanceof Error ? error.message : String(error)
		}
	};
}
function createReadHandler(service) {
	return async (endpoint, rawPayload) => {
		try {
			const payload = object$1(rawPayload);
			switch (endpoint) {
				case "status": return success$1(await service.status());
				case "search": return success$1(await service.search({
					query: String(payload.query ?? ""),
					...payload.mode === void 0 ? {} : { mode: payload.mode },
					...payload.limit === void 0 ? {} : { limit: Number(payload.limit) },
					...payload.category === void 0 ? {} : { category: payload.category },
					...payload.source === void 0 ? {} : { source: payload.source },
					...payload.intent === void 0 ? {} : { intent: payload.intent }
				}));
				case "related": return success$1(await service.related(String(payload.id ?? ""), payload.depth === void 0 ? 2 : Number(payload.depth), payload.edge));
				default: return {
					ok: false,
					error: {
						code: "not-found",
						message: `unknown read endpoint: ${endpoint}`
					}
				};
			}
		} catch (error) {
			return failure$1(error);
		}
	};
}
function createWriteHandler(service) {
	return async (endpoint, rawPayload) => {
		try {
			const payload = object$1(rawPayload);
			switch (endpoint) {
				case "remember": return success$1(await service.remember({
					content: String(payload.content ?? ""),
					...payload.category === void 0 ? {} : { category: payload.category },
					...payload.importance === void 0 ? {} : { importance: Number(payload.importance) },
					...Array.isArray(payload.tags) ? { tags: payload.tags.map(String) } : {},
					...Array.isArray(payload.entities) ? { entities: payload.entities.map(String) } : {},
					source: "user"
				}));
				case "link": return success$1(await service.link(String(payload.sourceId ?? ""), String(payload.targetId ?? ""), payload.type, payload.weight === void 0 ? .5 : Number(payload.weight), payload.reason === void 0 ? void 0 : String(payload.reason)));
				case "forget": return success$1(await service.forget(String(payload.id ?? "")));
				default: return {
					ok: false,
					error: {
						code: "not-found",
						message: `unknown write endpoint: ${endpoint}`
					}
				};
			}
		} catch (error) {
			return failure$1(error);
		}
	};
}
/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
function registerRpc(connection, service) {
	connection.rpc.handle(MNEMON_READ_CHANNEL, createReadHandler(service), { authority: "trusted-host" });
	if (service.config.writeEnabled) connection.rpc.handle(MNEMON_WRITE_CHANNEL, createWriteHandler(service), { authority: "loopback" });
}
//#endregion
//#region lib/types/process.js
const DEFAULT_MAX_OUTPUT_BYTES = 2097152;
/** Spawn without a shell, with bounded output and cooperative cancellation. */
const runProcess = (command, args, options) => new Promise((resolve, reject) => {
	const child = spawn(command, [...args], {
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		],
		shell: false
	});
	const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
	let stdout = "";
	let stderr = "";
	let outputBytes = 0;
	let settled = false;
	let killTimer;
	const stop = () => {
		if (child.exitCode !== null || child.signalCode !== null) return;
		child.kill("SIGTERM");
		killTimer = setTimeout(() => {
			if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
		}, 1500);
	};
	const finish = (error, result) => {
		if (settled) return;
		settled = true;
		clearTimeout(timeout);
		if (killTimer !== void 0) clearTimeout(killTimer);
		options.signal?.removeEventListener("abort", abort);
		if (error === null) resolve(result);
		else reject(error);
	};
	const abort = () => {
		stop();
		finish(/* @__PURE__ */ new Error(`mnemon command aborted: ${String(options.signal?.reason ?? "cancelled")}`));
	};
	const append = (target, chunk) => {
		outputBytes += chunk.byteLength;
		if (outputBytes > maxOutputBytes) {
			stop();
			finish(/* @__PURE__ */ new Error(`mnemon output exceeded ${maxOutputBytes} bytes`));
			return;
		}
		if (target === "stdout") stdout += chunk.toString("utf8");
		else stderr += chunk.toString("utf8");
	};
	child.stdout.on("data", (chunk) => {
		append("stdout", chunk);
	});
	child.stderr.on("data", (chunk) => {
		append("stderr", chunk);
	});
	child.on("error", (error) => {
		finish(/* @__PURE__ */ new Error(`failed to launch mnemon (${JSON.stringify(command)}): ${error.message}`));
	});
	child.on("close", (exitCode) => {
		finish(null, {
			stdout,
			stderr,
			exitCode
		});
	});
	const timeout = setTimeout(() => {
		stop();
		finish(/* @__PURE__ */ new Error(`mnemon did not respond within ${options.timeoutMs}ms`));
	}, options.timeoutMs);
	if (options.signal?.aborted === true) abort();
	else options.signal?.addEventListener("abort", abort, { once: true });
});
//#endregion
//#region lib/types/runner.js
const COMMON_CLI_PATHS = [
	"~/.local/bin/mnemon",
	"/opt/homebrew/bin/mnemon",
	"/usr/local/bin/mnemon",
	"/usr/bin/mnemon"
];
function expandHome(path) {
	if (path === "~") return homedir();
	return path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
}
function executable(path) {
	try {
		accessSync(path, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
/** Locate the local Mnemon binary without invoking a shell. */
function findMnemonCommand(config) {
	if (config.cliPath !== void 0) return expandHome(config.cliPath);
	const envPath = process.env.MNEMON_CLI_PATH?.trim();
	if (envPath !== void 0 && envPath !== "") {
		const path = expandHome(envPath);
		if (executable(path)) return path;
	}
	for (const directory of (process.env.PATH ?? "").split(delimiter)) {
		if (directory === "") continue;
		for (const name of process.platform === "win32" ? [
			"mnemon.exe",
			"mnemon.cmd",
			"mnemon"
		] : ["mnemon"]) {
			const path = join(directory, name);
			if (executable(path)) return path;
		}
	}
	for (const candidate of COMMON_CLI_PATHS) {
		const path = expandHome(candidate);
		if (executable(path)) return path;
	}
}
var MnemonCliError = class extends Error {
	exitCode;
	stderr;
	constructor(message, exitCode = null, stderr = "") {
		super(message);
		this.name = "MnemonCliError";
		this.exitCode = exitCode;
		this.stderr = stderr;
	}
};
function createRunner(config, processRunner = runProcess) {
	const found = findMnemonCommand(config);
	const command = found ?? config.cliPath ?? "mnemon";
	const globalArgs = () => {
		const args = [];
		if (config.dataDir !== void 0) args.push("--data-dir", expandHome(config.dataDir));
		if (config.store !== void 0) args.push("--store", config.store);
		return args;
	};
	const execute = async (args, options = {}) => {
		const argv = options.globalFlags === false ? [...args] : [...globalArgs(), ...args];
		const processOptions = {
			timeoutMs: config.timeoutMs,
			...options.signal === void 0 ? {} : { signal: options.signal }
		};
		let result;
		try {
			result = await processRunner(command, argv, processOptions);
		} catch (error) {
			throw new MnemonCliError(`${error instanceof Error ? error.message : String(error)}. Install Mnemon and ensure "mnemon" is on PATH, or set dsh-mnemon.cliPath.`);
		}
		if (result.exitCode !== 0) {
			const detail = result.stderr.trim() || result.stdout.trim() || "no output";
			throw new MnemonCliError(`mnemon ${args.join(" ")} exited ${String(result.exitCode)}: ${detail}`, result.exitCode, result.stderr);
		}
		return result.stdout;
	};
	return {
		command,
		commandFound: found !== void 0 && executable(found),
		config,
		async runJson(args, options) {
			const stdout = await execute(args, options);
			try {
				return JSON.parse(stdout);
			} catch {
				throw new MnemonCliError(`mnemon ${args.join(" ")} returned invalid JSON`);
			}
		},
		runText: execute,
		effectiveDataDir() {
			return expandHome(config.dataDir ?? (process.env.MNEMON_DATA_DIR?.trim() || "~/.mnemon"));
		},
		effectiveStore() {
			if (config.store !== void 0) return config.store;
			const fromEnvironment = process.env.MNEMON_STORE?.trim();
			if (fromEnvironment !== void 0 && fromEnvironment !== "") return fromEnvironment;
			const active = join(this.effectiveDataDir(), "active");
			if (existsSync(active)) try {
				const value = readFileSync(active, "utf8").trim();
				if (value !== "") return value;
			} catch {}
			return "default";
		}
	};
}
//#endregion
//#region lib/types/service.js
const CATEGORIES = [
	"preference",
	"decision",
	"fact",
	"insight",
	"context",
	"general"
];
const SOURCES = [
	"user",
	"agent",
	"external"
];
const EDGE_TYPES = [
	"temporal",
	"semantic",
	"causal",
	"entity"
];
const INTENTS = [
	"WHY",
	"WHEN",
	"ENTITY",
	"GENERAL"
];
function record(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function text$1(value) {
	return typeof value === "string" ? value : void 0;
}
function number(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function stringArray(value) {
	if (!Array.isArray(value)) return void 0;
	return value.filter((entry) => typeof entry === "string");
}
function normalizeInsight(value) {
	const item = record(value);
	if (item === void 0) return void 0;
	const core = record(item.insight) ?? item;
	const id = text$1(core.id);
	const content = text$1(core.content);
	if (id === void 0 || content === void 0) return void 0;
	const insight = {
		id,
		content
	};
	const optionalText = {
		category: text$1(core.category),
		source: text$1(core.source),
		confidence: text$1(item.confidence),
		intent: text$1(item.intent),
		matchedVia: text$1(item.matched_via ?? item.via ?? item.via_edge_type),
		createdAt: text$1(core.created_at),
		edgeType: text$1(item.via_edge_type)
	};
	for (const [key, value] of Object.entries(optionalText)) if (value !== void 0) Object.assign(insight, { [key]: value });
	const optionalNumbers = {
		importance: number(core.importance),
		score: number(item.score),
		depth: number(item.depth)
	};
	for (const [key, value] of Object.entries(optionalNumbers)) if (value !== void 0) Object.assign(insight, { [key]: value });
	const tags = stringArray(core.tags);
	const entities = stringArray(core.entities);
	if (tags !== void 0) insight.tags = tags;
	if (entities !== void 0) insight.entities = entities;
	return insight;
}
function boundedInteger(value, fallback, min, max) {
	if (value === void 0) return fallback;
	if (!Number.isInteger(value) || value < min || value > max) throw new Error(`value must be an integer within ${min}..${max}`);
	return value;
}
function required(value, label, max) {
	const normalized = value.trim();
	if (normalized === "") throw new Error(`${label} is required`);
	if (normalized.length > max) throw new Error(`${label} is too long (max ${max} characters)`);
	return normalized;
}
function allowed(value, values, label) {
	if (value !== void 0 && !values.includes(value)) throw new Error(`${label} must be one of: ${values.join(", ")}`);
	return value;
}
function commaList(values, label, limit) {
	if (values === void 0) return void 0;
	const normalized = values.map((value) => value.trim()).filter((value) => value !== "");
	if (normalized.length > limit) throw new Error(`${label} accepts at most ${limit} values`);
	if (normalized.some((value) => value.includes(","))) throw new Error(`${label} values cannot contain commas`);
	return normalized.length === 0 ? void 0 : normalized.join(",");
}
var MnemonService = class {
	runner;
	config;
	constructor(runner, config) {
		this.runner = runner;
		this.config = config;
	}
	async status(signal) {
		const base = {
			cliPath: this.runner.command,
			commandFound: this.runner.commandFound,
			dataDir: this.runner.effectiveDataDir(),
			store: this.runner.effectiveStore(),
			writeEnabled: this.config.writeEnabled,
			timeoutMs: this.config.timeoutMs,
			defaultRecallLimit: this.config.defaultRecallLimit
		};
		try {
			const [rawStatus, rawVersion] = await Promise.all([this.runner.runJson(["status"], signal === void 0 ? {} : { signal }), this.runner.runText(["--version"], signal === void 0 ? { globalFlags: false } : {
				signal,
				globalFlags: false
			})]);
			const status = record(rawStatus);
			if (status === void 0) throw new Error("mnemon status returned an unexpected payload");
			const byCategoryRecord = record(status.by_category) ?? {};
			const byCategory = {};
			for (const [category, count] of Object.entries(byCategoryRecord)) if (typeof count === "number") byCategory[category] = count;
			const topEntities = Array.isArray(status.top_entities) ? status.top_entities.flatMap((entry) => {
				const entity = record(entry);
				const name = text$1(entity?.entity);
				const count = number(entity?.count);
				return name === void 0 || count === void 0 ? [] : [{
					entity: name,
					count
				}];
			}) : [];
			return {
				healthy: true,
				...base,
				version: rawVersion.trim().replace(/^mnemon version\s+/i, ""),
				stats: {
					totalInsights: number(status.total_insights) ?? 0,
					deletedInsights: number(status.deleted_insights) ?? 0,
					edgeCount: number(status.edge_count) ?? 0,
					oplogCount: number(status.oplog_count) ?? 0,
					...text$1(status.db_path) === void 0 ? {} : { dbPath: text$1(status.db_path) },
					dbSizeBytes: number(status.db_size_bytes) ?? 0,
					byCategory,
					topEntities
				}
			};
		} catch (error) {
			return {
				healthy: false,
				...base,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}
	async search(request, signal) {
		const query = required(request.query, "query", 2e3);
		const limit = boundedInteger(request.limit, this.config.defaultRecallLimit, 1, 50);
		const mode = allowed(request.mode, [
			"smart",
			"keyword",
			"basic"
		], "mode") ?? "smart";
		const category = allowed(request.category, CATEGORIES, "category");
		const source = allowed(request.source, SOURCES, "source");
		const intent = allowed(request.intent, INTENTS, "intent");
		const args = mode === "keyword" ? [
			"search",
			query,
			"--limit",
			String(limit)
		] : [
			"recall",
			query,
			"--limit",
			String(limit)
		];
		if (mode === "basic") args.push("--basic");
		if (mode !== "keyword") {
			if (category !== void 0) args.push("--cat", category);
			if (source !== void 0) args.push("--source", source);
			if (intent !== void 0) args.push("--intent", intent);
		}
		const payload = await this.runner.runJson(args, signal === void 0 ? {} : { signal });
		const wrapper = record(payload);
		const results = (Array.isArray(payload) ? payload : Array.isArray(wrapper?.results) ? wrapper.results : []).map(normalizeInsight).filter((entry) => entry !== void 0);
		const hint = text$1(wrapper?.hint);
		return {
			query,
			mode,
			results,
			...hint === void 0 ? {} : { hint }
		};
	}
	async remember(request, signal) {
		this.assertWritable();
		const content = required(request.content, "content", 8e3);
		const importance = boundedInteger(request.importance, 3, 1, 5);
		const category = allowed(request.category, CATEGORIES, "category") ?? "general";
		const source = allowed(request.source, SOURCES, "source") ?? "user";
		const args = [
			"remember",
			content,
			"--cat",
			category,
			"--imp",
			String(importance),
			"--source",
			source
		];
		const tags = commaList(request.tags, "tags", 20);
		const entities = commaList(request.entities, "entities", 50);
		if (tags !== void 0) args.push("--tags", tags);
		if (entities !== void 0) args.push("--entities", entities);
		return this.runner.runJson(args, signal === void 0 ? {} : { signal });
	}
	async related(id, depth = 2, edge, signal) {
		const args = [
			"related",
			required(id, "id", 200),
			"--depth",
			String(boundedInteger(depth, 2, 1, 5))
		];
		const selectedEdge = allowed(edge, EDGE_TYPES, "edge");
		if (selectedEdge !== void 0) args.push("--edge", selectedEdge);
		const payload = await this.runner.runJson(args, signal === void 0 ? {} : { signal });
		if (!Array.isArray(payload)) return [];
		return payload.map(normalizeInsight).filter((entry) => entry !== void 0);
	}
	async link(sourceId, targetId, type = "semantic", weight = .5, reason, signal) {
		this.assertWritable();
		if (!Number.isFinite(weight) || weight < 0 || weight > 1) throw new Error("weight must be within 0..1");
		const selectedType = allowed(type, EDGE_TYPES, "type") ?? "semantic";
		const args = [
			"link",
			required(sourceId, "sourceId", 200),
			required(targetId, "targetId", 200),
			"--type",
			selectedType,
			"--weight",
			String(weight)
		];
		if (reason !== void 0 && reason.trim() !== "") args.push("--meta", JSON.stringify({ reason: required(reason, "reason", 1e3) }));
		return this.runner.runJson(args, signal === void 0 ? {} : { signal });
	}
	async forget(id, signal) {
		this.assertWritable();
		return this.runner.runJson(["forget", required(id, "id", 200)], signal === void 0 ? {} : { signal });
	}
	assertWritable() {
		if (!this.config.writeEnabled) throw new Error("dsh-mnemon is configured read-only (writeEnabled: false)");
	}
};
//#endregion
//#region lib/types/settings.js
const MNEMON_SETTINGS_CHANNEL = "/dsh-mnemon-settings";
const MNEMON_SETTINGS_NAMESPACE = "mnemon";
function success(value) {
	return {
		ok: true,
		value
	};
}
function failure(error) {
	return {
		ok: false,
		error: {
			code: "mnemon-settings-error",
			message: error instanceof Error ? error.message : String(error)
		}
	};
}
function descriptor(settings) {
	const view = settings.describe({ redactSecrets: true }).find((candidate) => candidate.ns === MNEMON_SETTINGS_NAMESPACE);
	if (view === void 0) throw new Error("Mnemon settings namespace is unavailable");
	return {
		status: "ready",
		value: view.value,
		base: view.base,
		user: view.user,
		revision: view.revision,
		writable: settings.writable,
		mode: "host",
		applies: view.applies
	};
}
function object(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("payload must be an object");
	return value;
}
function createSettingsHandler(settings) {
	return async (endpoint, rawPayload) => {
		try {
			if (endpoint === "get") return success(descriptor(settings));
			if (endpoint !== "mutate") return {
				ok: false,
				error: {
					code: "not-found",
					message: `unknown settings endpoint: ${endpoint}`
				}
			};
			if (!settings.writable) throw new Error("DSH settings are read-only");
			const payload = object(rawPayload);
			if (!Array.isArray(payload.ops) || payload.ops.length === 0 || payload.ops.length > 16) throw new Error("ops must contain 1..16 settings edits");
			const ops = payload.ops.map((raw) => {
				const op = object(raw);
				const field = Array.isArray(op.path) && op.path.length === 1 ? String(op.path[0]) : "";
				if (![
					"cliPath",
					"dataDir",
					"store",
					"timeoutMs",
					"defaultRecallLimit",
					"routingGuidance",
					"tabEnabled",
					"writeEnabled"
				].includes(field)) throw new Error(`unsupported Mnemon settings field: ${field}`);
				if (op.op === "unset") return {
					op: "unset",
					path: [field]
				};
				if (op.op !== "set") throw new Error(`unsupported settings operation: ${String(op.op)}`);
				return {
					op: "set",
					path: [field],
					value: op.value
				};
			});
			const revision = payload.expectedRevision === void 0 ? void 0 : Number(payload.expectedRevision);
			await settings.mutate(MNEMON_SETTINGS_NAMESPACE, ops, revision);
			return success(descriptor(settings));
		} catch (error) {
			return failure(error);
		}
	};
}
function registerSettingsRpc(connection, settings) {
	connection.rpc.handle(MNEMON_SETTINGS_CHANNEL, createSettingsHandler(settings), { authority: "loopback" });
}
//#endregion
//#region lib/types/tools.js
const text = (value) => [{
	type: "text",
	text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
}];
function definition(value) {
	return value;
}
const JSON_OBJECT_OUTPUT = {
	type: "object",
	additionalProperties: true
};
/** Register a deliberately small model-facing surface over Mnemon's protocol. */
function registerTools(ctx, service) {
	ctx.tools.register(definition({
		name: "mnemon_recall",
		description: "Recall durable knowledge from the shared Mnemon graph. Use for prior decisions, preferences, rationale, project conventions, known pitfalls, and tasks that resume earlier work. Run one focused query when memory could materially change the answer; do not recall mechanically for trivial or self-contained tasks.",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Focused natural-language memory query."
				},
				mode: {
					type: "string",
					enum: [
						"smart",
						"keyword",
						"basic"
					],
					description: "smart=graph-enhanced default, keyword=token ranking, basic=SQL LIKE fallback."
				},
				limit: {
					type: "integer",
					minimum: 1,
					maximum: 50
				},
				category: {
					type: "string",
					enum: [...CATEGORIES]
				},
				source: {
					type: "string",
					enum: [...SOURCES]
				},
				intent: {
					type: "string",
					enum: [...INTENTS]
				}
			},
			required: ["query"]
		},
		output: {
			schema: JSON_OBJECT_OUTPUT,
			render: (_args, value) => text(value)
		},
		async execute(args, exec) {
			return service.search(args, exec.signal);
		},
		presentCall: (args) => ({
			card: "generic",
			title: "Recall Mnemon memory",
			kind: "search",
			rawInput: args.query
		}),
		presentResult: () => ({
			card: "generic",
			title: "Mnemon recall complete"
		})
	}));
	ctx.tools.register(definition({
		name: "mnemon_related",
		description: "Traverse the Mnemon graph from a known insight id. Use after mnemon_recall when causal, semantic, temporal, or entity neighbors help explain or verify a remembered fact.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "Insight id returned by mnemon_recall."
				},
				depth: {
					type: "integer",
					minimum: 1,
					maximum: 5
				},
				edge: {
					type: "string",
					enum: [...EDGE_TYPES]
				}
			},
			required: ["id"]
		},
		output: {
			schema: JSON_OBJECT_OUTPUT,
			render: (_args, value) => text(value)
		},
		async execute(args, exec) {
			return service.related(args.id, args.depth, args.edge, exec.signal);
		},
		presentCall: (args) => ({
			card: "generic",
			title: "Traverse Mnemon graph",
			kind: "search",
			rawInput: args.id
		}),
		presentResult: () => ({
			card: "generic",
			title: "Mnemon graph traversal complete"
		})
	}));
	ctx.tools.register(definition({
		name: "mnemon_status",
		description: "Check the local Mnemon integration, active named store, database statistics, and configuration. Use when a Mnemon operation fails or the user asks about memory health.",
		parameters: {
			type: "object",
			properties: {}
		},
		output: {
			schema: JSON_OBJECT_OUTPUT,
			render: (_args, value) => text(value)
		},
		execute: (_args, exec) => service.status(exec.signal),
		presentCall: () => ({
			card: "generic",
			title: "Check Mnemon status",
			kind: "other"
		}),
		presentResult: () => ({
			card: "generic",
			title: "Mnemon status checked"
		})
	}));
	if (!service.config.writeEnabled) return;
	ctx.tools.register(definition({
		name: "mnemon_remember",
		description: "Store one durable insight in Mnemon. Use only for stable preferences, decisions with rationale, reusable procedures, non-obvious facts, or important continuity that future sessions should find. Search first to avoid duplicates; do not dump transcripts, temporary progress, routine observations, or information already present in the repository.",
		parameters: {
			type: "object",
			properties: {
				content: {
					type: "string",
					description: "One concise, self-contained durable insight."
				},
				category: {
					type: "string",
					enum: [...CATEGORIES]
				},
				importance: {
					type: "integer",
					minimum: 1,
					maximum: 5
				},
				tags: {
					type: "array",
					items: { type: "string" },
					maxItems: 20
				},
				entities: {
					type: "array",
					items: { type: "string" },
					maxItems: 50
				},
				source: {
					type: "string",
					enum: [...SOURCES],
					description: "Defaults to agent for model-authored writeback."
				}
			},
			required: ["content"]
		},
		output: {
			schema: JSON_OBJECT_OUTPUT,
			render: (_args, value) => text(value)
		},
		async execute(args, exec) {
			return service.remember({
				...args,
				source: args.source ?? "agent"
			}, exec.signal);
		},
		presentCall: () => ({
			card: "generic",
			title: "Write Mnemon memory",
			kind: "edit"
		}),
		presentResult: () => ({
			card: "generic",
			title: "Mnemon memory processed"
		})
	}));
	ctx.tools.register(definition({
		name: "mnemon_link",
		description: "Create a typed, bidirectional relation between two known Mnemon insights. Link only when the relation improves future recall and both ids were verified through recall or graph traversal.",
		parameters: {
			type: "object",
			properties: {
				sourceId: { type: "string" },
				targetId: { type: "string" },
				type: {
					type: "string",
					enum: [...EDGE_TYPES]
				},
				weight: {
					type: "number",
					minimum: 0,
					maximum: 1
				},
				reason: { type: "string" }
			},
			required: ["sourceId", "targetId"]
		},
		output: {
			schema: JSON_OBJECT_OUTPUT,
			render: (_args, value) => text(value)
		},
		async execute(args, exec) {
			return service.link(args.sourceId, args.targetId, args.type, args.weight, args.reason, exec.signal);
		},
		presentCall: () => ({
			card: "generic",
			title: "Link Mnemon insights",
			kind: "edit"
		}),
		presentResult: () => ({
			card: "generic",
			title: "Mnemon insights linked"
		})
	}));
	ctx.tools.register(definition({
		name: "mnemon_forget",
		description: "Soft-delete one Mnemon insight by exact id. This is a destructive semantic operation; use only when the user explicitly asks to forget it or the insight is verified obsolete/incorrect.",
		parameters: {
			type: "object",
			properties: { id: { type: "string" } },
			required: ["id"]
		},
		output: {
			schema: JSON_OBJECT_OUTPUT,
			render: (_args, value) => text(value)
		},
		execute: (args, exec) => service.forget(args.id, exec.signal),
		presentCall: (args) => ({
			card: "generic",
			title: "Forget Mnemon insight",
			kind: "edit",
			rawInput: args.id
		}),
		presentResult: () => ({
			card: "generic",
			title: "Mnemon insight forgotten"
		})
	}));
}
//#endregion
//#region lib/types/index.js
const name = "dsh-mnemon";
const inject = ["tools", "settings"];
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
function apply(rawContext, config = {}) {
	const ctx = rawContext;
	const resolved = resolveConfig(ctx.settings.register("mnemon", Config, {
		base: config,
		applies: "restart",
		validate: (value) => {
			resolveConfig(value);
		}
	}).get());
	const service = new MnemonService(createRunner(resolved), resolved);
	registerTools(ctx, service);
	if (resolved.routingGuidance) registerGuidance(ctx);
	ctx.inject(["connection"], (webContext) => {
		if (resolved.tabEnabled) registerRpc(webContext.connection, service);
		registerSettingsRpc(webContext.connection, ctx.settings);
	});
}
//#endregion
export { Config, MnemonService, apply, createRunner, inject, name, resolveConfig };
