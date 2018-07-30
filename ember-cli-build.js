/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const env      = EmberApp.env();

module.exports = function(defaults) {
  // Pull in a few useful environment settings for index.html to use
  var appConfig = require('./config/environment')(env).APP;
  var inline    = {};

  ['version', 'appName', 'baseAssets'].forEach((key) => {
    var val = appConfig[key];

    if (val) {
      inline[key] = { content: val };
    }
  });

  var app = new EmberApp(defaults, {
    'ember-cli-babel': { includePolyfill: true, },
    storeConfigInMeta: false,
    inlineContent:     inline,
    codemirror:        {
      modes:      ['yaml', 'dockerfile', 'shell', 'markdown'],
      themes:     ['monokai'],
      addonFiles: ['lint/lint.css', 'lint/lint.js', 'hint/show-hint.js', 'hint/show-hint.css', 'hint/anyword-hint.js', 'lint/yaml-lint.js']
    },
    outputPaths: {
      app: {
        css: {
          'app-light': '/assets/ui-light.css',
          'app-dark':  '/assets/ui-dark.css'
        }
      }
    },
    nodeAssets: { 'xterm': { import: ['dist/xterm.css'] } },

    SRI: { enabled: false, },

    fingerprint: {
      exclude: [
        // These can be bind-mounted in
        'assets/images/logos',

        // These get version added to the query string so JS doesn't have to know the fingerprint
        'assets/intl',
        'assets/images/resources',
        'ui-light.css', 'ui-light.rtl.css',
        'ui-dark.css',  'ui-dark.rtl.css',
        'ui.css',       'ui.rtl.css',
        'vendor.css',   'vendor.rtl.css',
      ],
      extensions: (appConfig.fingerprint === 'no' ? [] : ['js', 'css', 'png', 'jpg', 'gif', 'svg', 'map', 'woff', 'woff2', 'ttf']),
    },

    sourcemaps: {
      enabled:    true,
      extensions: ['js']
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('node_modules/async/dist/async.js');
  app.import('node_modules/d3/d3.js');
  app.import('node_modules/identicon.js/pnglib.js');
  app.import('node_modules/identicon.js/identicon.js');
  app.import('node_modules/jgrowl/jquery.jgrowl.css');
  app.import('node_modules/jgrowl/jquery.jgrowl.js');
  app.import('node_modules/jsondiffpatch/public/build/jsondiffpatch.js');
  app.import('node_modules/jsondiffpatch/public/build/jsondiffpatch-formatters.js');
  app.import('node_modules/jszip/dist/jszip.js')
  app.import('node_modules/moment/moment.js');
  app.import('node_modules/prismjs/prism.js');
  app.import('node_modules/prismjs/components/prism-bash.js');
  app.import('node_modules/prismjs/components/prism-yaml.js');

  // app.import('vendor/aws-sdk-ec2.js');
  app.import('vendor/aws-sdk-ec2-iam-2.279.1.min.js');
  app.import('vendor/ember-shortcuts.js');
  app.import('vendor/file-saver/fileSaver.mini.js');
  app.import('vendor/icons/fonts/rancher-icons.svg',   { destDir: 'assets/fonts/' });
  app.import('vendor/icons/fonts/rancher-icons.ttf',   { destDir: 'assets/fonts/' });
  app.import('vendor/icons/fonts/rancher-icons.woff',  { destDir: 'assets/fonts/' });
  app.import('vendor/icons/style.css');
  app.import('vendor/json-sanitizer/json-sanitizer.js');
  app.import('vendor/prompt/prompt-v1-latin-300.woff', { destDir: 'assets/fonts/' });
  app.import('vendor/prompt/prompt-v1-latin-300.woff2', { destDir: 'assets/fonts/' });
  app.import('vendor/prompt/prompt-v1-latin-600.woff', { destDir: 'assets/fonts/' });
  app.import('vendor/prompt/prompt-v1-latin-600.woff2', { destDir: 'assets/fonts/' });
  app.import('vendor/aliyun-sdk.js');

  return app.toTree();
};
