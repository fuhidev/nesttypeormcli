import { OptionType } from './enums/option-type';
import { OptionItem } from './models/option-item';

export const optionsCommands = new Map<OptionType, OptionItem>([
    [OptionType.Module, { commands: ['--module', '-m'], configPath: 'defaults.{resource}.module', description: 'Allows specification of the declaring module.' }],
    [OptionType.CommonModule, { commands: ['--common-module'], configPath: 'defaults.{resource}.commonModule', type: 'True | False', description: 'Flag to control whether the CommonModule is imported.' }],
    [OptionType.ShowOptions, { commands: ['-o'], description: 'Allow to override options' }],
]);
