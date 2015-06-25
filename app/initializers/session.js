import Serializable from 'ember-api-store/mixins/serializable';

// Don't serialize the injected session
Serializable.reopen({
  reservedKeys: ['session'],
});

export function initialize(registry, application) {
  application.inject('controller',  'session', 'service:session');
  application.inject('route',       'session', 'service:session');
  application.inject('model',       'session', 'service:session');
  application.inject('component',   'session', 'service:session');
}

export default {
  name: 'session',
  initialize: initialize
};
