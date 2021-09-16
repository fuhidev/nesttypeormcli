import { OptionType } from './enums/option-type';
import { OptionItem } from './models/option-item';

export const optionsCommands = new Map<OptionType, OptionItem>([
    [OptionType.Module, { commands: ['--module', '-m'], configPath: 'defaults.{resource}.module', description: 'Allows specification of the declaring module.' }],
    [OptionType.ShowOptions, { commands: ['-o'], description: 'Allow to override options' }],
]);
