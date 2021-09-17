export type FileVersion = number;

export interface AngularCliConfiguration {
  $schema?: string;
  version: FileVersion;
  cli?: CliOptions;
  newProjectRoot?: string;
  defaultProject?: string;
  projects?: {};
}
export interface CliOptions {
  defaultCollection?: string;
  packageManager?: ('npm' | 'cnpm' | 'yarn');
  warnings?: {
    versionMismatch?: boolean;
    typescriptMismatch?: boolean;
    [k: string]: any;
  };
}
