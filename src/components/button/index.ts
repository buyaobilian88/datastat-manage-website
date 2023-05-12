import type { App } from 'vue';
import OButton from './src/button';

OButton.install = function (app: App) {
  app.component(OButton.name, OButton);
};

export { OButton };
