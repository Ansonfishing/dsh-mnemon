export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | {
    [key: string]: JsonValue;
};
export interface RpcError {
    code: string;
    message: string;
    details?: Record<string, JsonValue>;
}
export type RpcResult<T = JsonValue> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: RpcError;
};
export interface ClientConnectionHandle {
    rpc: {
        call(channel: string, endpoint: string, payload: unknown): Promise<RpcResult<unknown>>;
    };
}
export type HostRpcHandler = (endpoint: string, payload: unknown) => Promise<RpcResult<unknown>>;
export interface HostConnectionHandle {
    rpc: {
        handle(channel: string, handler: HostRpcHandler, options: {
            authority: 'trusted-host' | 'loopback';
        }): unknown;
    };
}
export interface ToolExecution {
    signal: AbortSignal;
}
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    output: {
        schema: Record<string, unknown>;
        render: (args: Record<string, unknown>, value: never) => Array<{
            type: 'text';
            text: string;
        }>;
    };
    execute: (args: never, execution: ToolExecution) => Promise<unknown>;
    presentCall?: (args: never) => Record<string, unknown>;
    presentResult?: () => Record<string, unknown>;
}
export interface HostContextShape {
    tools: {
        register(definition: ToolDefinition): unknown;
    };
    connection: HostConnectionHandle;
    get(name: string): unknown;
    inject(services: string[], callback: (ctx: HostContextShape) => void): unknown;
}
export interface SlotsService {
    inject(name: string, factory: () => unknown): unknown;
    register(options: {
        name: string;
        id: string;
        order?: number;
        label?: string;
        inject?: () => Record<string, unknown>;
    }, component: (props: never) => unknown): unknown;
}
export interface ClientContextShape {
    slots: SlotsService;
    connection: ClientConnectionHandle;
}
//# sourceMappingURL=contracts.d.ts.map