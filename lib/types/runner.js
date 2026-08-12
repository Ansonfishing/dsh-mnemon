import { accessSync, constants, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';
import { runProcess } from "./process.js";
const COMMON_CLI_PATHS = [
    '~/.local/bin/mnemon',
    '/opt/homebrew/bin/mnemon',
    '/usr/local/bin/mnemon',
    '/usr/bin/mnemon',
];
function expandHome(path) {
    if (path === '~')
        return homedir();
    return path.startsWith('~/') ? join(homedir(), path.slice(2)) : path;
}
function executable(path) {
    try {
        accessSync(path, constants.X_OK);
        return true;
    }
    catch {
        return false;
    }
}
/** Locate the local Mnemon binary without invoking a shell. */
export function findMnemonCommand(config) {
    if (config.cliPath !== undefined)
        return expandHome(config.cliPath);
    const envPath = process.env.MNEMON_CLI_PATH?.trim();
    if (envPath !== undefined && envPath !== '') {
        const path = expandHome(envPath);
        if (executable(path))
            return path;
    }
    for (const directory of (process.env.PATH ?? '').split(delimiter)) {
        if (directory === '')
            continue;
        for (const name of process.platform === 'win32' ? ['mnemon.exe', 'mnemon.cmd', 'mnemon'] : ['mnemon']) {
            const path = join(directory, name);
            if (executable(path))
                return path;
        }
    }
    for (const candidate of COMMON_CLI_PATHS) {
        const path = expandHome(candidate);
        if (executable(path))
            return path;
    }
    return undefined;
}
export class MnemonCliError extends Error {
    exitCode;
    stderr;
    constructor(message, exitCode = null, stderr = '') {
        super(message);
        this.name = 'MnemonCliError';
        this.exitCode = exitCode;
        this.stderr = stderr;
    }
}
export function createRunner(config, processRunner = runProcess) {
    const found = findMnemonCommand(config);
    const command = found ?? config.cliPath ?? 'mnemon';
    // Mnemon 0.1.2 runs store migrations while opening the database. Serializing
    // CLI processes prevents parallel status/viz calls during WebUI mount from
    // racing that migration and surfacing a transient SQLITE_BUSY error.
    let processQueue = Promise.resolve();
    const globalArgs = (store) => {
        const args = [];
        if (config.dataDir !== undefined)
            args.push('--data-dir', expandHome(config.dataDir));
        if (store !== undefined)
            args.push('--store', store);
        else if (config.store !== undefined)
            args.push('--store', config.store);
        return args;
    };
    const launch = async (args, options = {}) => {
        if (options.signal?.aborted === true)
            throw new MnemonCliError(`mnemon command aborted: ${String(options.signal.reason ?? 'cancelled')}`);
        const argv = options.globalFlags === false ? [...args] : [...globalArgs(options.store), ...args];
        const processOptions = {
            timeoutMs: config.timeoutMs,
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        };
        let result;
        try {
            result = await processRunner(command, argv, processOptions);
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new MnemonCliError(`${detail}. Install Mnemon and ensure "mnemon" is on PATH, or set dsh-mnemon.cliPath.`);
        }
        if (result.exitCode !== 0) {
            const detail = result.stderr.trim() || result.stdout.trim() || 'no output';
            throw new MnemonCliError(`mnemon ${args.join(' ')} exited ${String(result.exitCode)}: ${detail}`, result.exitCode, result.stderr);
        }
        return result.stdout;
    };
    const execute = (args, options = {}) => {
        const result = processQueue.then(() => launch(args, options));
        processQueue = result.then(() => undefined, () => undefined);
        return result;
    };
    return {
        command,
        commandFound: found !== undefined && executable(found),
        config,
        async runJson(args, options) {
            const stdout = await execute(args, options);
            try {
                return JSON.parse(stdout);
            }
            catch {
                throw new MnemonCliError(`mnemon ${args.join(' ')} returned invalid JSON`);
            }
        },
        runText: execute,
        effectiveDataDir() {
            return expandHome(config.dataDir ?? (process.env.MNEMON_DATA_DIR?.trim() || '~/.mnemon'));
        },
        effectiveStore() {
            if (config.store !== undefined)
                return config.store;
            const fromEnvironment = process.env.MNEMON_STORE?.trim();
            if (fromEnvironment !== undefined && fromEnvironment !== '')
                return fromEnvironment;
            const active = join(this.effectiveDataDir(), 'active');
            if (existsSync(active)) {
                try {
                    const value = readFileSync(active, 'utf8').trim();
                    if (value !== '')
                        return value;
                }
                catch {
                    // Fall through to Mnemon's own default.
                }
            }
            return 'default';
        },
    };
}
//# sourceMappingURL=runner.js.map