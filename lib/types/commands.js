const USAGE = '用法：/mnemon [status|recall <查询>|related <ID>|remember <内容>|forget <ID>]';
function error(text) {
    return { kind: 'error', text: `${text}\n${USAGE}` };
}
function clip(value, max = 600) {
    return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
function insightLine(insight, index) {
    const meta = [
        insight.category,
        insight.score === undefined ? undefined : `score=${insight.score.toFixed(3)}`,
        insight.depth === undefined ? undefined : `depth=${insight.depth}`,
    ].filter((value) => value !== undefined).join(' · ');
    return `${index + 1}. ${clip(insight.content)}\n   ID: ${insight.id}${meta === '' ? '' : ` · ${meta}`}`;
}
function splitInput(rawInput) {
    const input = rawInput.trim();
    if (input === '')
        return { verb: 'status', argument: '' };
    const separator = input.search(/\s/u);
    return separator < 0
        ? { verb: input.toLowerCase(), argument: '' }
        : { verb: input.slice(0, separator).toLowerCase(), argument: input.slice(separator).trim() };
}
async function execute(service, invocation) {
    const { verb, argument } = splitInput(invocation.rawInput);
    switch (verb) {
        case 'status': {
            if (argument !== '')
                return error('status 不接受额外参数。');
            const status = await service.status(invocation.signal);
            if (!status.healthy)
                return { kind: 'error', text: `Mnemon 不可用：${status.error ?? '未知错误'}` };
            const stats = status.stats;
            return {
                kind: 'success',
                text: [
                    `Mnemon ${status.version ?? ''} · store=${status.store}`.trim(),
                    `CLI: ${status.cliPath}`,
                    `数据目录: ${status.dataDir}`,
                    `有效记忆: ${stats?.totalInsights ?? 0} · 连接: ${stats?.edgeCount ?? 0} · 已删除: ${stats?.deletedInsights ?? 0}`,
                    `模式: ${status.writeEnabled ? '读写' : '只读'} · 默认召回: ${status.defaultRecallLimit}`,
                ].join('\n'),
            };
        }
        case 'recall': {
            if (argument === '')
                return error('recall 需要一个明确查询。');
            const response = await service.search({
                query: argument,
                limit: Math.min(service.config.defaultRecallLimit, 10),
            }, invocation.signal);
            if (response.results.length === 0)
                return { kind: 'success', text: `没有找到与“${argument}”相关的记忆。` };
            return { kind: 'success', text: `召回 ${response.results.length} 条：\n\n${response.results.map(insightLine).join('\n\n')}` };
        }
        case 'related': {
            if (argument === '')
                return error('related 需要 recall 返回的完整 ID。');
            const results = await service.related(argument, 2, undefined, invocation.signal);
            if (results.length === 0)
                return { kind: 'success', text: `ID ${argument} 的两跳内没有关联记忆。` };
            return { kind: 'success', text: `关联记忆 ${results.length} 条：\n\n${results.map(insightLine).join('\n\n')}` };
        }
        case 'remember': {
            if (!service.config.writeEnabled)
                return { kind: 'error', text: 'Mnemon 当前为只读模式，不能写入记忆。' };
            if (argument === '')
                return error('remember 需要一条自包含的记忆内容。');
            const result = await service.remember({ content: argument, source: 'user' }, invocation.signal);
            const response = typeof result === 'object' && result !== null && !Array.isArray(result) ? result : {};
            const action = typeof response.action === 'string' ? response.action : 'saved';
            const nested = typeof response.insight === 'object' && response.insight !== null && !Array.isArray(response.insight) ? response.insight : {};
            const memoryId = typeof response.id === 'string' ? response.id : typeof nested.id === 'string' ? nested.id : undefined;
            const id = memoryId === undefined ? '' : ` · ID ${memoryId}`;
            return { kind: 'success', text: `Mnemon 已处理：${action}${id}` };
        }
        case 'forget': {
            if (!service.config.writeEnabled)
                return { kind: 'error', text: 'Mnemon 当前为只读模式，不能删除记忆。' };
            if (argument === '' || /\s/u.test(argument))
                return error('forget 需要一条记忆的精确 ID。');
            await service.forget(argument, invocation.signal);
            return { kind: 'success', text: `已软删除 Mnemon 记忆：${argument}` };
        }
        default:
            return error(`未知 Mnemon 子命令：${verb}`);
    }
}
export function createMnemonCommand(service) {
    return {
        name: 'mnemon',
        description: '查看、召回或管理 Mnemon 外置记忆',
        input: { hint: '[status|recall <查询>|related <ID>|remember <内容>|forget <ID>]' },
        handler: invocation => execute(service, invocation).catch((reason) => ({
            kind: 'error',
            text: reason instanceof Error ? reason.message : String(reason),
        })),
    };
}
export function registerCommands(commands, service) {
    commands.register(createMnemonCommand(service));
}
//# sourceMappingURL=commands.js.map