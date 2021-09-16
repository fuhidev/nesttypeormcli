import * as path from 'path';
import { TemplateType } from './enums/template-type';
import { ResourceType } from './enums/resource-type';
import { IResource } from './models/resource';
import { OptionType } from './enums/option-type';

export const resources = new Map<ResourceType, IResource>([
  [
    ResourceType.Module,
    {
      locDirName: (loc, config) =>
        !config.defaults.module.flat ? loc.fileName : loc.dirName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      files: [
        { name: (config) => `controller.ts`, type: TemplateType.Controller },
        { name: (config) => `module.ts`, type: TemplateType.Module },
        { name: (config) => `service.ts`, type: TemplateType.Service },
        { name: (config) => `entity.ts`, type: TemplateType.Entity },
        // { name: config => `component.spec.ts`, type: TemplateType.ConponentSpec, condition: (config, params) => config.defaults.module.spec }
      ],
      createFolder: (config) => !config.defaults.module.flat,
      options: [OptionType.CommonModule, OptionType.Module],
    },
  ],
]);
