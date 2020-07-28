/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const env      = EmberApp.env();
const webpack  = require('webpack');
const nodeSass = require('node-sass');


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

  // var isDev  = env === 'development';
  var isTest = env === 'test';
  var isProd = env === 'production';

  var app = new EmberApp(defaults, {
    // build time linting
    hinting:           !isProd,
    // reduce build time by only running tests when env is set to test
    tests:             isTest,
    autoprefixer:      { sourcemap: false }, // Was never helpful
    babel:             { plugins: [require('ember-auto-import/babel-plugin')] },
    'ember-cli-babel': { includePolyfill: isProd }, // Only include babel polyfill in prod
    storeConfigInMeta: false,
    inlineContent:     inline,
    codemirror:        {
      modes:      ['yaml', 'dockerfile', 'shell', 'markdown'],
      themes:     ['monokai'],
      addonFiles: ['lint/lint.css', 'lint/lint.js', 'hint/show-hint.js', 'hint/show-hint.css', 'hint/anyword-hint.js', 'lint/yaml-lint.js']
    },
    sassOptions: {
      implementation: nodeSass,
      sourceMap:      !isTest,
    },
    outputPaths: {
      app: {
        css: {
          'app-light': '/assets/ui-light.css',
          'app-dark':  '/assets/ui-dark.css'
        }
      }
    },
    autoImport: {
      webpack: {
        externals: { jquery: 'jQuery' },
        node:      { fs: 'empty' },
        plugins:   [
          new webpack.EnvironmentPlugin({ LATER_COV: false }),
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ],
      }
    },

    assetLoader: {
      generateURI(filePath) {
        // we need to slice the trailing slash off baseAssets because filePath has a leading slash
        const url   = appConfig.baseAssets.slice(0, -1);

        // console.log('file path: ', pathOut);
        return `${ url }${ filePath }?${ appConfig.version }`;
      }
    },


    SRI: { enabled: false, },

    fingerprint: {
      exclude: [
        // These can be bind-mounted in
        'assets/images/logos',
        // These get version added to the query string so JS doesn't have to know the fingerprint
        'assets/intl',
        'assets/images/resources',
        'ui-light.css',
        'ui-light.rtl.css',
        'ui-dark.css',
        'ui-dark.rtl.css',
        'ui.css',
        'ui.rtl.css',
        'vendor.css',
        'vendor.rtl.css'
      ],
      extensions: (appConfig.fingerprint === 'no' ? [] : ['js', 'css', 'png', 'jpg', 'gif', 'svg', 'map', 'woff', 'woff2', 'ttf']),
    },
    sourcemaps: {
      enabled:    !isTest,
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
  app.import('node_modules/jgrowl/jquery.jgrowl.css');
  app.import('node_modules/jsondiffpatch/dist/formatters-styles/html.css');
  app.import('node_modules/xterm/dist/xterm.css');
  app.import('vendor/icons/style.css');

  app.import('node_modules/ember-source/dist/ember-template-compiler.js');
  app.import('vendor/aws-sdk-eks-ec2-iam-kms-2.705.0.min.js');
  app.import('vendor/ember-shortcuts.js');
  app.import('vendor/aliyun-sdk.js');
  app.import('vendor/cce-sdk.js');

  app.import('vendor/icons/fonts/rancher-icons.svg',   { destDir: 'assets/fonts/' });
  app.import('vendor/icons/fonts/rancher-icons.ttf',   { destDir: 'assets/fonts/' });
  app.import('vendor/icons/fonts/rancher-icons.woff',  { destDir: 'assets/fonts/' });
  app.import('vendor/json-sanitizer/json-sanitizer.js');
  app.import('vendor/prompt/prompt-v1-latin-300.woff', { destDir: 'assets/fonts/' });
  app.import('vendor/prompt/prompt-v1-latin-300.woff2', { destDir: 'assets/fonts/' });
  app.import('vendor/prompt/prompt-v1-latin-600.woff', { destDir: 'assets/fonts/' });
  app.import('vendor/prompt/prompt-v1-latin-600.woff2', { destDir: 'assets/fonts/' });

  return app.toTree();
};
