import * as fs from 'fs';
import { window, workspace } from 'vscode';
import { config as defaultConfig } from './config/cli-config';
import deepMerge from './deep-merge';
import { IConfig } from './models/config';
import { promisify } from './promisify';
import * as dJSON from 'dirty-json';
const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {

  private async readConfigFile(): Promise<Object> {
    return defaultConfig;
  }

  private parseConfig(config): IConfig {
    if (config.hasOwnProperty('projects')) {
      const oldConfig: IConfig = dJSON.parse(JSON.stringify(defaultConfig));
      return oldConfig;
    }

    return deepMerge({}, defaultConfig, config);
  }


  public async getConfig() {
    const configFile = await this.readConfigFile();
    return this.parseConfig(configFile);
  }

}
