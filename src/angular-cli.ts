import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from './models/config';
import { IPath } from './models/path';
import { FileContents } from './file-contents';
import { IFiles } from './models/file';
import { promisify } from './promisify';
import { toCamelCase, toUpperCase } from './formatting';
import { createFiles, createFolder } from './ioutil';
import { TemplateType } from './template-name';

const fsWriteFile = promisify(fs.writeFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

export default class AngularCli {
  constructor(private readonly fc = new FileContents()) {
    fc.loadTemplates();
  }

  private async findModulePathRecursive(dir, fileList, optionalFilterFunction) {
    if (!fileList) {
      console.error('Variable \'fileList\' is undefined or NULL.');
      return;
    }
    const files: string[] = await fsReaddir(dir);
    for (const i in files) {
      if (!files.hasOwnProperty(i)) {
        continue;
      }
      const name = path.join(dir, files[i]);
      const stat: fs.Stats = await fsStat(name);

      if (stat.isDirectory()) {
        await this.findModulePathRecursive(name, fileList, optionalFilterFunction);
      } else {
        if (optionalFilterFunction && optionalFilterFunction(name) !== true) {
          continue;
        }
        fileList.push(name);
      }
    }
  }

  private addToImport(data: string, fileName: string, type: string, relativePath: string) {
    const typeUpper = toUpperCase(type);
    const fileNameUpper = toUpperCase(fileName);

    const lastImportInx = data.lastIndexOf('import ');
    const endOfLastImportInx = data.indexOf('\n', lastImportInx);
    const fileLength = data.length;
    return data.substring(0, endOfLastImportInx) + `\nimport { ${fileNameUpper}${typeUpper} } from '${relativePath}/${fileName}.${type}';` + data.substring(endOfLastImportInx, fileLength);
  }

  private addToDeclarations(data: string, fileName: string, type: string) {
    const typeUpper = toUpperCase(type);
    const fileNameUpper = toUpperCase(fileName);

    const declarationLastInx = data.indexOf(']', data.indexOf('declarations')) + 1;

    let before = data.substring(0, declarationLastInx);
    const after = data.substring(declarationLastInx, data.length);

    let lastDeclareInx = before.length - 1;

    while (before[lastDeclareInx] === ' ' ||
      before[lastDeclareInx] === ',' ||
      before[lastDeclareInx] === '\n' ||
      before[lastDeclareInx] === ']') {
      lastDeclareInx = lastDeclareInx - 1;
    }

    before = before.substring(0, lastDeclareInx + 1) + ',\n    ';

    return before + `${fileNameUpper}${typeUpper}\n]` + after;
  }

  private getRelativePath(dst: string, src: string) {
    const modulePath = path.parse(dst).dir;
    return '.' + src.replace(modulePath, '').replace(/\\/g, '/');
  }

  private async addDeclarationsToModule(loc: IPath, type: string) {

    const moduleFiles = [];
    await this.findModulePathRecursive(loc.rootPath, moduleFiles, (name: string) => name.indexOf('.module.ts') !== -1);

    // at least one module is there
    if (moduleFiles.length > 0) {
      moduleFiles.sort((a: string, b: string) => a.length - b.length);

      // find closest module      
      let [module] = moduleFiles;
      let minDistance = Infinity;

      for (const moduleFile of moduleFiles) {
        const moduleDirPath = path.parse(moduleFile).dir;
        const locPath = loc.dirPath.replace(loc.dirName, '');

        const distance = Math.abs(locPath.length - moduleDirPath.length);
        if (distance < minDistance) {
          minDistance = distance;
          module = moduleFile;
        }
      }

      const data: string = await fsReadFile(module, 'utf8');

      // relativePath
      const relativePath = this.getRelativePath(module, loc.dirPath);
      let content = this.addToImport(data, loc.fileName, type, relativePath);
      content = this.addToDeclarations(content, loc.fileName, type);

      await fsWriteFile(module, content);
    }
  }

  async generateComponent(loc: IPath, config: IConfig) {
    if (!config.defaults.component.flat) {
      loc.dirName = loc.fileName;
    }
    loc.dirPath = path.join(loc.dirPath, loc.dirName);

    this.addDeclarationsToModule(loc, 'component');

    // create an IFiles array including file names and contents
    const files: IFiles[] = [{
      name: path.join(loc.dirPath, `${loc.fileName}.component.ts`),
      content: this.fc.getTemplateContent(TemplateType.Component, config, loc.fileName),
    }];

    if (!config.defaults.component.inlineStyle) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.component.${config.defaults.styleExt}`),
        content: this.fc.getTemplateContent(TemplateType.ComponentStyle, config, loc.fileName),
      });
    }

    if (!config.defaults.component.inlineTemplate) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.component.html`),
        content: this.fc.getTemplateContent(TemplateType.ComponentHtml, config, loc.fileName),
      });
    }

    if (config.defaults.component.spec) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.component.spec.ts`),
        content: this.fc.getTemplateContent(TemplateType.ConponentSpec, config, loc.fileName),
      });
    }

    if (!config.defaults.component.flat) {
      await createFolder(loc);
    }

    await createFiles(loc, files);
  }

  async generateDirective(loc: IPath, config: IConfig) {
    if (!config.defaults.directive.flat) {
      loc.dirName = loc.fileName;
    }
    loc.dirPath = path.join(loc.dirPath, loc.dirName);
    this.addDeclarationsToModule(loc, 'directive');

    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.directive.ts`),
        content: this.fc.getTemplateContent(TemplateType.Directive, config, loc.fileName),
      },
    ];

    if (config.defaults.directive.spec) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.directive.spec.ts`),
        content: this.fc.getTemplateContent(TemplateType.DirectiveSpec, config, loc.fileName),
      });
    }
    if (!config.defaults.directive.flat) {
      await createFolder(loc);
    }

    await createFiles(loc, files);
  }

  async generatePipe(loc: IPath, config: IConfig) {
    if (!config.defaults.pipe.flat) {
      loc.dirName = loc.fileName;
    }
    loc.dirPath = path.join(loc.dirPath, loc.dirName);

    this.addDeclarationsToModule(loc, 'pipe');

    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.pipe.ts`),
        content: this.fc.getTemplateContent(TemplateType.Pipe, config, loc.fileName),
      },
    ];

    if (config.defaults.pipe.spec) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.pipe.spec.ts`),
        content: this.fc.getTemplateContent(TemplateType.PipeSpec, config, loc.fileName),
      });
    }
    if (!config.defaults.pipe.flat) {
      await createFolder(loc);
    }
    await createFiles(loc, files);
  }

  async generateService(loc: IPath, config: IConfig) {
    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.service.ts`),
        content: this.fc.getTemplateContent(TemplateType.Service, config, loc.fileName),
      },
    ];
    if (config.defaults.service.spec) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.service.spec.ts`),
        content: this.fc.getTemplateContent(TemplateType.ServiceSpec, config, loc.fileName),
      });
    }
    await createFiles(loc, files);
  }

  async generateClass(loc: IPath, config: IConfig) {
    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.ts`),
        content: this.fc.getTemplateContent(TemplateType.Class, config, loc.fileName),
      },
    ];
    if (config.defaults.class.spec) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.spec.ts`),
        content: this.fc.getTemplateContent(TemplateType.ClassSpec, config, loc.fileName),
      });
    }
    await createFiles(loc, files);
  }

  async generateInterface(loc: IPath, config: IConfig) {
    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.ts`),
        content: this.fc.getTemplateContent(TemplateType.Inteface, config, loc.fileName),
      },
    ];

    await createFiles(loc, files);
  }

  async generateRoute(loc: IPath, config: IConfig) {
    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.routing.ts`),
        content: this.fc.getTemplateContent(TemplateType.Route, config, loc.fileName),
      },
    ];

    await createFiles(loc, files);
  }

  async generateEnum(loc: IPath, config: IConfig) {
    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.enum.ts`),
        content: this.fc.getTemplateContent(TemplateType.Enum, config, loc.fileName),
      },
    ];

    await createFiles(loc, files);
  }

  async generateModule(loc: IPath, config: IConfig) {

    if (!config.defaults.module.flat) {
      loc.dirName = loc.fileName;
    }
    loc.dirPath = path.join(loc.dirPath, loc.dirName);

    // create an IFiles array including file names and contents
    const files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.${config.defaults.styleExt}`),
        content: this.fc.getTemplateContent(TemplateType.ComponentStyle, config, loc.fileName),
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.html`),
        content: this.fc.getTemplateContent(TemplateType.ComponentHtml, config, loc.fileName),
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.ts`),
        content: this.fc.getTemplateContent(TemplateType.Component, config, loc.fileName),
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.module.ts`),
        content: this.fc.getTemplateContent(TemplateType.Module, config, loc.fileName),
      },
    ];
    if (config.defaults.module.spec) {
      files.push({
        name: path.join(loc.dirPath, `${loc.fileName}.component.spec.ts`),
        content: this.fc.getTemplateContent(TemplateType.ConponentSpec, config, loc.fileName),
      });
    }

    if (!config.defaults.module.flat) {
      await createFolder(loc);
    }

    await createFiles(loc, files);
  }
}
