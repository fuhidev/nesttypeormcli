import { ResourceType } from './enums/resource-type';
import { ICommand } from './models/command';
import { CommandType } from './enums/command-type';

export const commandsMap = new Map<CommandType, ICommand>([
  [CommandType.Module, { fileName: 'my-module', resource: ResourceType.Module }],
  [CommandType.Entity, { fileName: 'my-entity', resource: ResourceType.Entity }],
  [CommandType.Controller, { fileName: 'my-controller', resource: ResourceType.Controller }],
  [CommandType.Full, { fileName: 'my-module', resource: ResourceType.Full }],
  [CommandType.Service, { fileName: 'my-service', resource: ResourceType.Service }],
]);
