/* jshint node: true */
var pkg = require('../package.json');

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ui',
    podModulePrefix: 'ui/pods',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    minifyCSS: {
        enabled: false
    },
    minifyJS: {
        enabled: false
    },

    torii: {
      // This is configured at runtime, but torii complains
      // on startup if there's no entry in the environment
    },

    contentSecurityPolicy: {
      // Allow the occasional <elem style="blah">...
      'style-src':  "'self' cdn.rancher.io storage.googleapis.com fonts.googleapis.com 'unsafe-inline'",
      'font-src':   "'self' cdn.rancher.io storage.googleapis.com fonts.googleapis.com fonts.gstatic.com",
      'script-src': "'self' cdn.rancher.io storage.googleapis.com ",
      'object-src': "'self' cdn.rancher.io storage.googleapis.com ",
      'img-src':    "'self' cdn.rancher.io storage.googleapis.com avatars.githubusercontent.com",

      // Allow connect to anywhere, for console and event stream socket
      'connect-src': '*'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      version: pkg.version,
      appName: 'Rancher',
      endpoint: 'http://localhost:8080',
      apiEndpoint: '/v1',
      wsEndpoint: '/v1/subscribe?include=hosts&include=instances&include=instanceLinks&include=ipAddresses&eventNames=resource.change',
      baseAssets: '',
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
//    ENV.contentSecurityPolicy['script-src'] = ENV.contentSecurityPolicy['script-src'] + " 'unsafe-eval'";
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (process.env.BASE_URL) {
    ENV.baseURL = process.env.BASE_URL;
  }

  if (process.env.BASE_ASSETS) {
    ENV.APP.baseAssets = process.env.BASE_ASSETS;
  }

  // Override the endpoint with 
  if (process.env.RANCHER_ENDPOINT)
  {
    ENV.APP.endpoint = process.env.RANCHER_ENDPOINT;
  }
  else if (environment === 'production')
  {
    ENV.APP.endpoint = '';
  }

  ENV.APP.baseURL = ENV.baseURL;

  return ENV;
};
