import Github from 'ui/utils/github';

export function initialize(container, application) {
  var github = Github.create({
    // Session isn't automatically injected into GitHub
    session: container.lookup('session:main'),
  });

  // Inject GitHub lookup as 'github' property
  container.register('github:main', github, {instantiate: false});
  application.inject('controller',  'github', 'github:main');
  application.inject('component',   'github', 'github:main');
}

export default {
  name: 'github',
  after: 'session',
  initialize: initialize
};
