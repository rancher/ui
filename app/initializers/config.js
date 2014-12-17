export function initialize(container, application) {
  application.inject('controller', 'app', 'application:main');
  application.inject('route', 'app', 'application:main');
  application.inject('view', 'app', 'application:main');
  application.inject('component', 'app', 'application:main');
}

export default {
  name: 'config',
  initialize: initialize
};
