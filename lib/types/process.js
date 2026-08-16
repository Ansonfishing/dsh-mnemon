import { spawn } from 'node:child_process';
const DEFAULT_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
/** Spawn without a shell, with bounded output and cooperative cancellation. */
export const runProcess = (command, args, options) => new Promise((resolve, reject) => {
    const child = spawn(command, [...args], { stdio: ['ignore', 'pipe', 'pipe'], shell: false, windowsHide: true });
    const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let settled = false;
    let killTimer;
    const stop = () => {
        if (child.exitCode !== null || child.signalCode !== null)
            return;
        child.kill('SIGTERM');
        killTimer = setTimeout(() => {
            if (child.exitCode === null && child.signalCode === null)
                child.kill('SIGKILL');
        }, 1500);
    };
    const finish = (error, result) => {
        if (settled)
            return;
        settled = true;
        clearTimeout(timeout);
        if (killTimer !== undefined)
            clearTimeout(killTimer);
        options.signal?.removeEventListener('abort', abort);
        if (error === null)
            resolve(result);
        else
            reject(error);
    };
    const abort = () => {
        stop();
        finish(new Error(`mnemon command aborted: ${String(options.signal?.reason ?? 'cancelled')}`));
    };
    const append = (target, chunk) => {
        outputBytes += chunk.byteLength;
        if (outputBytes > maxOutputBytes) {
            stop();
            finish(new Error(`mnemon output exceeded ${maxOutputBytes} bytes`));
            return;
        }
        if (target === 'stdout')
            stdout += chunk.toString('utf8');
        else
            stderr += chunk.toString('utf8');
    };
    child.stdout.on('data', (chunk) => { append('stdout', chunk); });
    child.stderr.on('data', (chunk) => { append('stderr', chunk); });
    child.on('error', (error) => {
        finish(new Error(`failed to launch mnemon (${JSON.stringify(command)}): ${error.message}`));
    });
    child.on('close', (exitCode) => { finish(null, { stdout, stderr, exitCode }); });
    const timeout = setTimeout(() => {
        stop();
        finish(new Error(`mnemon did not respond within ${options.timeoutMs}ms`));
    }, options.timeoutMs);
    if (options.signal?.aborted === true)
        abort();
    else
        options.signal?.addEventListener('abort', abort, { once: true });
});
//# sourceMappingURL=process.js.map