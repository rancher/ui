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
      'router',
      'resource-actions',
      'scope',
      'session',
      'store',
      'tooltip',
    ],
    externalRoutes: [
      'index',
      'failWhale',
      'authenticated',
      'authenticated.cluster',
      'authenticated.cluster.index',
      'authenticated.cluster.projects',
      'notifier',
      'authenticated.project',
      'authenticated.prefs',
      'volumes.index',
      'authenticated.project.dns.index',
      'authenticated.project.hpa.index',
      'ingresses.index',
      'containers.index',
      'authenticated.project.pipeline.pipeline',
      'authenticated.project.pipeline.pipelines',
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
