import type { CommandDefinition, CommandService } from './contracts.ts';
import type { MnemonService } from './service.ts';
export declare function createMnemonCommand(service: MnemonService): CommandDefinition;
export declare function registerCommands(commands: CommandService, service: MnemonService): void;
//# sourceMappingURL=commands.d.ts.map