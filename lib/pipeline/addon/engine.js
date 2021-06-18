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
      'intl',
      'modal',
      'resource-actions',
      'scope',
      'session',
      'store',
      'tooltip',
      'router',
    ],
    externalRoutes: [
      'authenticated',
      'authenticated.cluster',
      'authenticated.cluster.index',
      'authenticated.cluster.projects',
      'authenticated.prefs',
      'authenticated.project',
      'authenticated.project.dns.index',
      'authenticated.project.hpa.index',
      'authenticated.project.pipeline.pipeline',
      'authenticated.project.pipeline.pipelines',
      'containers.index',
      'failWhale',
      'index',
      'ingresses.index',
      'notifier',
      'volumes.index',
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
