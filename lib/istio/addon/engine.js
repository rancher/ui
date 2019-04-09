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
      'intl',
      'scope',
      'session',
      'modal',
      'globalStore',
      'router',
      'clusterStore',
      'tooltip',
    ],
    externalRoutes: [
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
