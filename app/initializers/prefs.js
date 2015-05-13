import UserPreferences from 'ui/utils/user-preferences';
import Serializable from 'ember-api-store/mixins/serializable';

// Don't serialize the injected prefs
Serializable.reopen({
  reservedKeys: ['prefs'],
});

export function initialize(container, application) {
  var prefs = UserPreferences.create({
    // Store isn't automatically injected in
    store: container.lookup('store:main'),
    app: application,
  });

  // Inject GitHub lookup as 'github' property
  container.register('prefs:main',   prefs,  {instantiate: false});
  application.inject('controller',  'prefs', 'prefs:main');
  application.inject('route',       'prefs', 'prefs:main');
  application.inject('model',       'prefs', 'prefs:main');
  application.inject('component',   'prefs', 'prefs:main');
}

export default {
  name: 'prefs',
  after: 'store',
  initialize: initialize
};
