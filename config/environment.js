/* jshint node: true */
var pkg  = require('../package.json');
var fs   = require('fs');
var YAML = require('yamljs');


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
      'style-src':  "'self' releases.rancher.com localhost:3000 'unsafe-inline'",
      'font-src':   "'self' releases.rancher.com",
      'script-src': "'self' releases.rancher.com localhost:3000",
      'object-src': "'self' releases.rancher.com",
      'img-src':    "'self' releases.rancher.com avatars.githubusercontent.com gravatar.com localhost:3000 data:",
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
      legacyApiEndpoint: '/v1',
      apiEndpoint: '/v2-beta',
      catalogServer: '',
      catalogEndpoint: '/v1-catalog',
      authServer: '',
      authEndpoint: '/v1-auth',
      telemetryEndpoint: '/v1-telemetry',
      webhookEndpoint: '/v1-webhooks',
      projectToken: '%PROJECTID%',
      magicEndpoint: '/r',
      kubernetesEndpoint: '/r/projects/%PROJECTID%/kubernetes',
      kubectlEndpoint: '/r/projects/%PROJECTID%/kubectld:8091/v1-kubectl',
      kubernetesDashboard: '/r/projects/%PROJECTID%/kubernetes-dashboard:9090/#',
      mesosEndpoint: '/r/projects/%PROJECTID%/mesos-master:5050',
      swarmDashboard: '/r/projects/%PROJECTID%/portainer/',
      projectEndpoint: '/v2-beta/projects/%PROJECTID%',
      proxyEndpoint: '/v2-beta/proxy',
      wsEndpoint: '/v2-beta/projects/%PROJECTID%/subscribe' +
                    '?eventNames=resource.change' +
                    '&limit=-1',
      baseAssets: '/',
      locales: readLocales(environment)
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
