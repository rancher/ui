/* eslint-env node */
var pkg  = require('../package.json');
var fs   = require('fs');
var YAML = require('yamljs');

// host can be an ip "1.2.3.4" -> https://1.2.3.4:30443
// or a URL+port
function normalizeHost(host,defaultPort) {
  if ( host.indexOf('http') === 0 ) {
    return host;
  }

  if ( host.indexOf(':') === -1 ) {
    host = 'https://' + host + (defaultPort ? ':'+defaultPort : '');
  } else {
    host = 'https://' + host;
  }

  return host;
}

function readLocales(environment) {
  /* Parse the translations from the translations folder*/
  /* ember intl getLocalesByTranslations does not work if intl is not managing them (bundled) */
  /* This needs a little work to read the yaml files for the langugae name prop*/
  var files = fs.readdirSync('./translations');
  var translationsOut = {};
  files.forEach(function(filename) {
    if ( !filename.match(/\.ya?ml$/) && !filename.match(/\.json$/) ) {
      // Ignore non-YAML files
      return;
    }

    if ( environment === 'production' && filename === 'none.yaml' ) {
      // Don't show the "None" language in prod
      return;
    }
    var ymlFile = YAML.load('./translations/' + filename);
    var label  = ymlFile.languageName;
    var locale = filename.split('.')[0];
    translationsOut[locale] = label;
  });
  return translationsOut;
}

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ui',
    environment: environment,
    exportApplicationGlobal: true,
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
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
      'style-src':  "'self' releases.rancher.com localhost:8000 'unsafe-inline'",
      'font-src':   "'self' releases.rancher.com",
      'script-src': "'self' releases.rancher.com localhost:8000",
      'object-src': "'self' releases.rancher.com",
      'img-src':    "'self' releases.rancher.com avatars.githubusercontent.com gravatar.com localhost:8000 data:",
      'frame-src':  "'self' releases.rancher.com",

      // Allow connect to anywhere, for console and event stream socket
      'connect-src': '*',
      'unsafe-eval': "'self' releases.rancher.com"
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      version: pkg.version,
      appName: 'Rancher',
      environment: environment,
      baseAssets: '/',

      clusterToken: '%CLUSTERID%',
      projectToken: '%PROJECTID%',

      apiServer: 'https://localhost:30443',
      apiEndpoint: '/v3',
      publicApiEndpoint: '/v3-public',
      clusterEndpoint: '/v3/clusters/%CLUSTERID%',
      projectEndpoint: '/v3/projects/%PROJECTID%',
      proxyEndpoint: '/meta/proxy',
      globalSubscribeEndpoint: '/v3/subscribe',
      clusterSubscribeEndpoint: '/v3/clusters/%CLUSTERID%/subscribe',
      projectSubscribeEndpoint: '/v3/projects/%PROJECTID%/subscribe',
      magicEndpoint: '/r',

      telemetryEndpoint: '/v1-telemetry',
      kubernetesBase: '/k8s',
      kubectlEndpoint: '/r/projects/%PROJECTID%/kubectld:8091/v1-kubectl',
      kubernetesDashboard: '/k8s/clusters/%CLUSTERID%/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy/',
      needIntlPolyfill: false,

      locales: readLocales(environment),
      stripe: {
        publishableKey: 'pk_test_g925RcuVORh2KgHWfFbE80by'
      },
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

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
    ENV.APP.apiServer = normalizeHost(server,443);
  }
  else if (environment === 'production')
  {
    ENV.APP.apiServer = '';
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

// host can be an ip "1.2.3.4" -> https://1.2.3.4:30443
// or a URL+port
function normalizeHost(host, defaultPort) {
  if ( host.indexOf('http') === 0 ) {
    return host;
  }

  if ( host.indexOf(':') >= 0 || defaultPort === 443 ) {
    host = `https://${  host }`;
  } else {
    host = `https://${  host  }${ defaultPort ? `:${ defaultPort }` : '' }`;
  }

  return host;
}
