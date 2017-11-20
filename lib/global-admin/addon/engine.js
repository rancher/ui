import Engine from 'ember-engines/engine';
import loadInitializers from 'ember-load-initializers';
import Resolver from './resolver';
import config from './config/environment';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver,
  dependencies: {
    services: [
      'access',
      'authn-store',
      'authz-store',
      'catalog',
      'endpoint',
      'github',
      'intl',
      'scope',
      'session',
      'settings',
      'store',
      'user-language',
      'user-store',
      'user-theme',
    ],
    externalRoutes: [
      'index',
      'failWhale',
      'authenticated',
      'authenticated.clusters',
      'authenticated.clusters.cluster',
      'authenticated.clusters.project',
      'authenticated.prefs',
      'logout'
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
