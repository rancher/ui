import Serializable from 'ember-api-store/mixins/serializable';

// Don't serialize the injected session
Serializable.reopen({ reservedKeys: ['session'], });

export function initialize(application) {
  application.inject('controller',  'session', 'service:session');
  application.inject('route',       'session', 'service:session');
  application.inject('model',       'session', 'service:session');
  application.inject('component',   'session', 'service:session');
  application.inject('controller',  'tab-session', 'service:tab-session');
  application.inject('route',       'tab-session', 'service:tab-session');
  application.inject('model',       'tab-session', 'service:tab-session');
  application.inject('component',   'tab-session', 'service:tab-session');
}

export default {
  name: 'session',
  initialize
};
