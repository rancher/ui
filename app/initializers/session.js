import SessionStorage from 'ui/utils/session-storage';

export function initialize(container, application) {
  container.register('session:main', SessionStorage);
  application.inject('controller',  'session', 'session:main');
  application.inject('route',       'session', 'session:main');
  application.inject('model',       'session', 'session:main');
  application.inject('component',   'session', 'session:main');
}

export default {
  name: 'session',
  before: 'store',
  initialize: initialize
};
