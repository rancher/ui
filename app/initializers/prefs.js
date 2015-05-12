import LocalStorage from 'ui/utils/local-storage';
import Serializable from 'ember-api-store/mixins/serializable';

// Don't serialize the injected prefs
Serializable.reopen({
  reservedKeys: ['prefs'],
});

export function initialize(container, application) {
  // Inject HTML5 session storage into all the things as 'session' property
  container.register('prefs:main', LocalStorage);
  application.inject('controller',  'prefs', 'prefs:main');
  application.inject('route',       'prefs', 'prefs:main');
  application.inject('model',       'prefs', 'prefs:main');
  application.inject('component',   'prefs', 'prefs:main');
}

export default {
  name: 'prefs',
  before: 'store',
  initialize: initialize
};
