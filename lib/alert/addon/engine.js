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
      'clusterStore',
      'globalStore',
      'resource-actions',
      'intl',
      'modal',
      'router',
      'scope',
      'session',
      'store',
      'tooltip',
    ],
    externalRoutes: [
      'authenticated.project.alert.edit',
      'authenticated.cluster.alert.edit',
      'authenticated.project.alert.index',
      'authenticated.cluster.alert.index',
      'authenticated.project.alert.new',
      'authenticated.cluster.alert.new',
      'notifier',
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
