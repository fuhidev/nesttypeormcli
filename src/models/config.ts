export interface IProject {
  version: string;
  name: string;
}

export interface IEnvironments {
  source: string;
  dev: string;
  prod: string;
}

export interface IApp {
  root: string;
  outDir?: string;
  assets?: string[];
  index?: string;
  tsconfig?: string;
  scripts?: any[];
  environments?: IEnvironments;
}


export interface IProperties {
  flat?: boolean;
  [k: string]: any;
}

export interface IDefaults {
  entity?: IProperties;
  controller?: IProperties;
  module?: IProperties;
  service?: IProperties;
}

export interface IConfig {
  project?: IProject;
  apps: IApp[];
  defaults: IDefaults;
}
