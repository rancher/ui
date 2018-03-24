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
      'app',
      'access',
      'user-language',
      'intl',
      'settings',
      'session',
      'modal',
      'globalStore',
      'router',
    ],
    externalRoutes: [
      'index',
      'authenticated',
      'update-password',
      'update-critical-settings',
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
