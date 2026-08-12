import type { CommandDefinition, CommandService } from './contracts.ts';
import type { MnemonService } from './service.ts';
import type { MnemonSubagentCoordinator } from './subagent.ts';
export declare function createMnemonCommand(service: MnemonService, coordinator: MnemonSubagentCoordinator): CommandDefinition;
export declare function registerCommands(commands: CommandService, service: MnemonService, coordinator: MnemonSubagentCoordinator): void;
//# sourceMappingURL=commands.d.ts.map