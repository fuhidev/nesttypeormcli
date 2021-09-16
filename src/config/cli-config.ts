import { IConfig } from './../models/config';

export const config: IConfig = {
  apps: [{
    root: 'src',
  }],
  defaults: {
    controller: {
    },
    entity: {
    },
    module: {
    },
    service: {
      flat: true,
      spec: true,
    },
  },
};
