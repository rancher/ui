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
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
