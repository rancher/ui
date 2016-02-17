/* jshint node: true */
var pkg = require('../package.json');


// host can be an ip "1.2.3.4" -> http://1.2.3.4:8080
// or a URL+port
function normalizeHost(host,defaultPort) {
  if ( host.indexOf('http') !== 0 )
  {
    if ( host.indexOf(':') === -1 )
    {
      host = 'http://' + host + (defaultPort ? ':'+defaultPort : '');
    }
    else
    {
      host = 'http://' + host;
    }
  }

  return host;
}

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
      apiServer: 'http://localhost:8080',
      apiEndpoint: '/v1',
      catalogServer: '',
      catalogEndpoint: '/v1-catalog',
      kubernetesServer: '',
      kubernetesEndpoint: '/v1-kubernetes',
      kubectlServer: '',
      kubectlEndpoint: '/v1-kubectl',
      proxyEndpoint: '/v1/proxy',
      wsEndpoint: '/v1/subscribe' +
                    '?eventNames=resource.change' +
                    '&eventNames=service.kubernetes.change' +
                    '&include=hosts' +
                    '&include=services' +
                    '&include=instances' +
                    '&include=instance' +
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

  ENV.APP.baseURL = ENV.baseURL;


  if (process.env.FINGERPRINT) {
    ENV.APP.fingerprint = process.env.FINGERPRINT;
  }

  if (process.env.BASE_ASSETS) {
    ENV.APP.baseAssets = process.env.BASE_ASSETS;
  }

  // Override the Rancher server/endpoint with environment var
  var server = process.env.RANCHER;
  if ( server )
  {
    ENV.APP.apiServer = normalizeHost(server,8080);
  }
  else if (environment === 'production')
  {
    ENV.APP.apiServer = '';
  }

  // Override the Catalog server/endpoint with environment var
  server = process.env.CATALOG;
  if ( server )
  {
    ENV.APP.catalogServer = normalizeHost(server,8088);
  }
  else if (environment === 'production')
  {
    ENV.APP.catalogServer = '';
  }

  // Override the K8s server/endpoint with environment var
  server = process.env.KUBERNETES;
  if ( server )
  {
    ENV.APP.kubernetesServer = normalizeHost(server,8090);
  }
  else if (environment === 'production')
  {
    ENV.APP.kubernetesServer = '';
  }

  // Override the Kubectl server/endpoint with environment var
  server = process.env.KUBECTL;
  if ( server )
  {
    ENV.APP.kubectlServer = normalizeHost(server,8091);
  }
  else if (environment === 'production')
  {
    ENV.APP.kubectlServer = '';
  }

  var pl = process.env.PL;
  if ( pl )
  {
    ENV.APP.pl = pl;
  }
  else
  {
    ENV.APP.pl = 'rancher';
  }

  return ENV;
};
