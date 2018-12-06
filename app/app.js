import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const App = Application.extend({
  modulePrefix:    config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  engines:         {
    login: {
      dependencies: {
        services: [
          'app',
          'access',
          'user-language',
          'intl',
          'modal',
          'settings',
          'session',
          'globalStore',
          'router',
        ],
        externalRoutes: {
          index:                      'index',
          authenticated:              'authenticated',
          'update-password':          'update-password',
          'update-critical-settings': 'update-critical-settings'
        }
      }
    },
    nodes: {
      dependencies: {
        services: [
          'app',
          'access',
          'clusterStore',
          'catalog',
          'endpoint',
          'azureAd',
          'github',
          'globalStore',
          'intl',
          'modal',
          'router',
          'resource-actions',
          'scope',
          'session',
          'settings',
          'store',
          'tooltip',
          'user-language',
          'user-theme',
        ],
        externalRoutes: {
          index:                                          'index',
          failWhale:                                      'failWhale',
          authenticated:                                  'authenticated',
          'authenticated.cluster':                        'authenticated.cluster',
          'authenticated.cluster.projects':               'authenticated.cluster.projects',
          'authenticated.project':                        'authenticated.project',
          'authenticated.prefs':                          'authenticated.prefs',
          'authenticated.cluster.nodes':                  'authenticated.cluster.nodes',
          'authenticated.cluster.security.members.index': 'authenticated.cluster.security.members.index',
          'logout':                                       'logout'
        }
      }
    },
    globalAdmin: {
      dependencies: {
        services: [
          'app',
          'access',
          'clusterStore',
          'catalog',
          'endpoint',
          'azureAd',
          'github',
          'globalStore',
          'intl',
          'modal',
          'router',
          'resource-actions',
          'scope',
          'session',
          'settings',
          'store',
          'tooltip',
          'user-language',
          'user-theme',
        ],
        externalRoutes: {
          index:                                          'index',
          failWhale:                                      'failWhale',
          authenticated:                                  'authenticated',
          'authenticated.cluster':                        'authenticated.cluster',
          'authenticated.cluster.projects':               'authenticated.cluster.projects',
          'authenticated.project':                        'authenticated.project',
          'authenticated.prefs':                          'authenticated.prefs',
          'authenticated.cluster.nodes':                  'authenticated.cluster.nodes',
          'authenticated.cluster.security.members.index': 'authenticated.cluster.security.members.index',
          'logout':                                       'logout'
        }
      }
    },
    logging: {
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
        externalRoutes: {}
      }
    },
    alert: {
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
        externalRoutes: {
          notifier:                                           'authenticated.cluster.notifier',
          'authenticated.cluster.monitoring.cluster-setting': 'authenticated.cluster.monitoring.cluster-setting',
          'authenticated.project.monitoring.project-setting': 'authenticated.project.monitoring.project-setting',
        }
      }
    },
    pipeline: {
      dependencies: {
        services: [
          'app',
          'clusterStore',
          'github',
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
        externalRoutes: {
          index:                                      'index',
          failWhale:                                  'failWhale',
          authenticated:                              'authenticated',
          'authenticated.cluster':                    'authenticated.cluster',
          'authenticated.cluster.index':              'authenticated.cluster.index',
          'authenticated.cluster.projects':           'authenticated.cluster.projects',
          'authenticated.project':                    'authenticated.project',
          'authenticated.prefs':                      'authenticated.prefs',
          'logout':                                   'logout',
          'volumes.index':                            'volumes.index',
          'authenticated.project.dns.index':          'authenticated.project.dns.index',
          'ingresses.index':                          'ingresses.index',
          'containers.index':                         'containers.index',
          'authenticated.project.pipeline.pipeline':  'authenticated.project.pipeline.pipeline',
          'authenticated.project.pipeline.pipelines': 'authenticated.project.pipeline.pipelines',
          'notifier':                                 'authenticated.cluster.notifier',
        }
      }
    },
    monitoring: {
      dependencies: {
        services: [
          'app',
          'intl',
          'grafana',
          'scope',
          'session',
          'modal',
          'globalStore',
          'router',
          'k8s',
          'clusterStore',
          'tooltip',
        ],
        externalRoutes: {}
      }
    },
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
