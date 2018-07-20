export function initialize(application) {
  application.inject('controller',  'session', 'service:growl');
  application.inject('route',       'session', 'service:growl');
  application.inject('model',       'session', 'service:growl');
  application.inject('component',   'session', 'service:growl');
}

export default {
  name:       'growl',
  initialize
};
