export function initialize(application) {
  application.inject('service:app', 'app', 'application:main'); // inject the config into the app service to make this solution turnkey
  application.inject('controller', 'app', 'service:app');
  application.inject('route',     'app', 'service:app');
  application.inject('view',      'app', 'service:app');
  application.inject('component', 'app', 'service:app');
  application.inject('model',     'app', 'service:app');
  application.inject('component', 'shortcuts', 'shortcuts:main');
}

export default {
  name:       'app',
  initialize
};
