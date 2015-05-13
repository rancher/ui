import SessionStorage from 'ui/utils/session-storage';
import Serializable from 'ember-api-store/mixins/serializable';

// Don't serialize the injected session
Serializable.reopen({
  reservedKeys: ['session'],
});

export function initialize(container, application) {
  // Inject HTML5 session storage into all the things as 'session' property
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
