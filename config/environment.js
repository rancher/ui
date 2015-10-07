/* jshint node: true */
var pkg = require('../package.json');

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ui',
    environment: environment,
    exportApplicationGlobal: true,
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

    contentSecurityPolicy: {
      // Allow the occasional <elem style="blah">...
      'style-src':  "'self' releases.rancher.com 'unsafe-inline'",
      'font-src':   "'self' releases.rancher.com",
      'script-src': "'self' releases.rancher.com",
      'object-src': "'self' releases.rancher.com",
      'img-src':    "'self' releases.rancher.com avatars.githubusercontent.com gravatar.com data:",
      'frame-src':  "'self' releases.rancher.com",

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
      wsEndpoint: '/v1/subscribe?eventNames=resource.change' +
                    '&include=hosts' +
                    '&include=instances' +
                    '&include=instance' +
                    '&include=loadBalancerConfig' +
                    '&include=loadBalancerTargets' +
                    '&include=loadBalancerListeners' +
                    '&include=instanceLinks' +
                    '&include=ipAddresses',
      baseAssets: '',
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
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

  if (process.env.FINGERPRINT) {
    ENV.APP.fingerprint = process.env.FINGERPRINT;
  }

  if (process.env.BASE_ASSETS) {
    ENV.APP.baseAssets = process.env.BASE_ASSETS;
  }

  // Override the endpoint with environment var
  var endpoint = process.env.RANCHER_ENDPOINT;
  if ( endpoint )
  {
    // variable can be an ip "1.2.3.4" -> http://1.2.3.4:8080
    // or a URL+port
    if ( endpoint.indexOf('http') !== 0 )
    {
      if ( endpoint.indexOf(':') === -1 )
      {
        endpoint = 'http://' + endpoint + ':8080';
      }
      else
      {
        endpoint = 'http://' + endpoint;
      }
    }

    ENV.APP.endpoint = endpoint;
  }
  else if (environment === 'production')
  {
    ENV.APP.endpoint = '';
  }

  ENV.APP.baseURL = ENV.baseURL;

  return ENV;
};
