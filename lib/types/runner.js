import { accessSync, constants, existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, posix, resolve, win32 } from 'node:path';
import { runProcess } from "./process.js";
const UNIX_COMMON_CLI_PATHS = [
    '~/.local/bin/mnemon',
    '/opt/homebrew/bin/mnemon',
    '/usr/local/bin/mnemon',
    '/usr/bin/mnemon',
];
function pathApi(platform) {
    return platform === 'win32' ? win32 : posix;
}
function expandHome(path, home = homedir(), platform = process.platform) {
    if (path === '~')
        return home;
    return path.startsWith('~/') || path.startsWith('~\\') ? pathApi(platform).join(home, path.slice(2)) : path;
}
function envValue(env, name, platform) {
    if (platform !== 'win32')
        return env[name];
    const key = Object.keys(env).find(candidate => candidate.toLowerCase() === name.toLowerCase());
    return key === undefined ? undefined : env[key];
}
function executable(path, platform = process.platform) {
    if (platform === 'win32' && win32.extname(path).toLowerCase() !== '.exe')
        return false;
    try {
        accessSync(path, platform === 'win32' ? constants.F_OK : constants.X_OK);
        return statSync(path).isFile();
    }
    catch {
        return false;
    }
}
function windowsCommonCliPaths(env, home) {
    const candidates = [];
    const goBin = envValue(env, 'GOBIN', 'win32')?.trim();
    if (goBin !== undefined && win32.isAbsolute(goBin))
        candidates.push(win32.join(goBin, 'mnemon.exe'));
    const goPath = envValue(env, 'GOPATH', 'win32')?.trim();
    const goPathRoot = goPath?.split(win32.delimiter).map(candidate => candidate.trim())
        .find(candidate => candidate !== '' && win32.isAbsolute(candidate));
    const goInstallRoot = goPathRoot ?? win32.join(home, 'go');
    candidates.push(win32.join(goInstallRoot, 'bin', 'mnemon.exe'));
    const localAppData = envValue(env, 'LOCALAPPDATA', 'win32')?.trim();
    if (localAppData !== undefined && win32.isAbsolute(localAppData)) {
        candidates.push(win32.join(localAppData, 'Programs', 'mnemon', 'mnemon.exe'));
    }
    const programFiles = envValue(env, 'ProgramFiles', 'win32')?.trim();
    if (programFiles !== undefined && win32.isAbsolute(programFiles)) {
        candidates.push(win32.join(programFiles, 'mnemon', 'mnemon.exe'));
    }
    return [...new Set(candidates)];
}
function commonCliPaths(platform, env, home) {
    if (platform === 'win32')
        return windowsCommonCliPaths(env, home);
    return UNIX_COMMON_CLI_PATHS.map(candidate => expandHome(candidate, home, platform));
}
/** Locate the local Mnemon binary without invoking a shell. */
export function findMnemonCommand(config, options = {}) {
    const platform = options.platform ?? process.platform;
    const env = options.env ?? process.env;
    const home = options.home ?? homedir();
    const isExecutable = options.isExecutable ?? (path => executable(path, platform));
    if (config.cliPath !== undefined)
        return expandHome(config.cliPath, home, platform);
    const envPath = envValue(env, 'MNEMON_CLI_PATH', platform)?.trim();
    if (envPath !== undefined && envPath !== '') {
        const path = expandHome(envPath, home, platform);
        if (isExecutable(path))
            return path;
    }
    const paths = pathApi(platform);
    for (const directory of (envValue(env, 'PATH', platform) ?? '').split(paths.delimiter)) {
        if (directory === '')
            continue;
        for (const name of platform === 'win32' ? ['mnemon.exe'] : ['mnemon']) {
            const path = paths.join(directory, name);
            if (isExecutable(path))
                return path;
        }
    }
    for (const path of commonCliPaths(platform, env, home)) {
        if (isExecutable(path))
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
export function createRunner(config, processRunner = runProcess, workspaceRoot) {
    const found = findMnemonCommand(config);
    const command = found ?? config.cliPath ?? 'mnemon';
    // Mnemon 0.1.2 runs store migrations while opening the database. Serializing
    // CLI processes prevents parallel status/viz calls during WebUI mount from
    // racing that migration and surfacing a transient SQLITE_BUSY error.
    let processQueue = Promise.resolve();
    const globalArgs = (store) => {
        const args = [];
        if (config.storageScope !== 'global' || config.dataDir !== undefined)
            args.push('--data-dir', effectiveDataDir());
        if (store !== undefined)
            args.push('--store', store);
        else if (config.store !== undefined)
            args.push('--store', config.store);
        return args;
    };
    const effectiveDataDir = () => {
        if (config.storageScope === 'workspace')
            return resolve(workspaceRoot ?? process.cwd(), '.mnemon');
        if (config.storageScope === 'custom')
            return expandHome(config.dataDir);
        return expandHome(process.env.MNEMON_DATA_DIR?.trim() || '~/.mnemon');
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
            const hint = process.platform === 'win32'
                ? 'Install the official Mnemon Windows release, ensure mnemon.exe is on PATH or under %LOCALAPPDATA%\\Programs\\mnemon, or set MNEMON_CLI_PATH or mnemon.cliPath to its absolute path.'
                : 'Install Mnemon and ensure "mnemon" is on PATH, or set MNEMON_CLI_PATH or mnemon.cliPath.';
            throw new MnemonCliError(`${detail}. ${hint}`);
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
        withExclusive(operation) {
            const result = processQueue.then(operation);
            processQueue = result.then(() => undefined, () => undefined);
            return result;
        },
        effectiveDataDir() {
            return effectiveDataDir();
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