export function initialize(application) {
  // Injects all Ember components & models (for actions) with a router object:
  application.inject('component', 'router', 'router:main');
  application.inject('model',     'router', 'router:main');
}

export default {
  name:       'inject-router',
  initialize
};
