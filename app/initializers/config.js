export function initialize(container, application) {
  // Inject the contents of ENV.APP in config/environment.js  into all the things as an 'app' property
  application.inject('controller', 'app', 'application:main');
  application.inject('route', 'app', 'application:main');
  application.inject('view', 'app', 'application:main');
  application.inject('component', 'app', 'application:main');
}

export default {
  name: 'config',
  initialize: initialize
};
