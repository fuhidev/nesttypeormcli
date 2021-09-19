import * as path from 'path';
import { TemplateType } from './enums/template-type';
import { ResourceType } from './enums/resource-type';
import { IResource } from './models/resource';
import { OptionType } from './enums/option-type';

export const resources = new Map<ResourceType, IResource>([
  [
    ResourceType.Full,
    {
      locDirName: (loc, config) => loc.fileName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      files: [
        { name: (config) => `controller.ts`, type: TemplateType.Controller },
        { name: (config) => `module.ts`, type: TemplateType.Module },
        { name: (config) => `service.ts`, type: TemplateType.Service },
        { name: (config) => `entity.ts`, type: TemplateType.Entity },
      ],
      createFolder: () => true
    },
  ],
  [
    ResourceType.FullGis,
    {
      locDirName: (loc, config) => loc.fileName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      files: [
        { name: (config) => `controller.ts`, type: TemplateType.Controller },
        { name: (config) => `module.ts`, type: TemplateType.Module },
        { name: (config) => `service.ts`, type: TemplateType.ServiceGis },
        { name: (config) => `entity.ts`, type: TemplateType.Entity },
      ],
      createFolder: () => true
    },
  ],
  [ResourceType.Controller, {
    files: [{ name: config => `controller.ts`, type: TemplateType.Controller }]
  }],
  [ResourceType.Entity, {
    files: [{ name: config => `entity.ts`, type: TemplateType.Entity }]
  }],
  [ResourceType.Service, {
    files: [{ name: config => `service.ts`, type: TemplateType.Service }]
  }],
  [ResourceType.ServiceGis, {
    files: [{ name: config => `service.ts`, type: TemplateType.ServiceGis }]
  }],
  [ResourceType.Module, {
    files: [{ name: config => `module.ts`, type: TemplateType.Module }],
    locDirName: (loc, config) => loc.fileName,
    locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
    createFolder: (config) => true,
  }],
]);
