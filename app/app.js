import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  engines: {
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
          index: 'index',
          authenticated: 'authenticated'
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
          'external-utils',
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
          index:                   'index',
          failWhale:               'failWhale',
          authenticated:           'authenticated',
          'authenticated.cluster': 'authenticated.cluster',
          'authenticated.cluster.projects': 'authenticated.cluster.projects',
          'authenticated.project': 'authenticated.project',
          'authenticated.prefs':   'authenticated.prefs',
          'authenticated.cluster.nodes': 'authenticated.cluster.nodes',
          'authenticated.cluster.nodes.node': 'authenticated.cluster.nodes.node',
          'authenticated.cluster.security.members.index': 'authenticated.cluster.security.members.index',
          'logout':                'logout'
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
          'store',
          'tooltip',
        ],
        externalRoutes: {
        }
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
          'store',
          'tooltip',
        ],
        externalRoutes: {
          notifier: 'authenticated.cluster.notifier',
          'authenticated.project.alert.edit':           'authenticated.project.alert.edit',
          'authenticated.cluster.alert.edit':           'authenticated.cluster.alert.edit',
          'authenticated.project.alert.index':           'authenticated.project.alert.index',
          'authenticated.cluster.alert.index':           'authenticated.cluster.alert.index',
          'authenticated.project.alert.new':           'authenticated.project.alert.new',
          'authenticated.cluster.alert.new':           'authenticated.cluster.alert.new',
        }
      }
    },
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
