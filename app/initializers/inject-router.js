export function initialize(container, application) {
  // Injects all Ember components with a router object:
  application.inject('component', 'router', 'router:main');
}

export default {
  name: 'inject-router',
  initialize: initialize
};
