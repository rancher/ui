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
          'access',
          'user-language',
          'intl',
          'settings',
          'session'
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
          'access',
          'authn-store',
          'authz-store',
          'cluster-store',
          'catalog',
          'endpoint',
          'github',
          'intl',
          'router',
          'resource-actions',
          'scope',
          'session',
          'settings',
          'store',
          'user-language',
          'user-store',
          'user-theme',
        ],
        externalRoutes: {
          index:                   'index',
          failWhale:               'failWhale',
          authenticated:           'authenticated',
          'authenticated.cluster': 'authenticated.cluster',
          'authenticated.project': 'authenticated.project',
          'authenticated.prefs':   'authenticated.prefs',
          'logout':                'logout'
        }
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
