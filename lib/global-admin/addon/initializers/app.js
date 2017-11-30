import EmberObject from '@ember/object';

const copyKeys =  ['baseAssets'];

export function initialize(application) {
  const data = EmberObject.create();
  copyKeys.forEach((key) => {
    data[key] = window.Ui[key]; // @TODO-2.0 blech
  });

  const app = EmberObject.extend(data);

  application.register('config:app', app);

  application.inject('controller','app', 'config:app');
  application.inject('route',     'app', 'config:app');
  application.inject('view',      'app', 'config:app');
  application.inject('component', 'app', 'config:app');
  application.inject('service',   'app', 'config:app');
  application.inject('model',     'app', 'config:app');
}

export default {
  name: 'app',
  initialize: initialize
};
