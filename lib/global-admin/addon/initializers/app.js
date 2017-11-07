import EmberObject from '@ember/object';
import config from '../config/environment';

export function initialize(application) {
  // Inject the contents of ENV.APP in config/environment.js  into all the things as an 'app' property
  let app = EmberObject.extend(config.APP);
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
