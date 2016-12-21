/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var util     = require('util');
var env      = EmberApp.env();

module.exports = function(defaults) {
  // Pull in a few useful environment settings for index.html to use
  var appConfig = require('./config/environment')(env).APP;
  var inline    = {};

  ['version', 'appName', 'baseAssets'].forEach(function(key) {
    var val = appConfig[key];

    if (val) {
      inline[key] = {
        content: val
      };
    }
  });

  var app = new EmberApp(defaults, {
    babel: {
      includePolyfill: true,
    },
    storeConfigInMeta: false,
    inlineContent: inline,

    outputPaths: {
      app: {
        css: {
          'app-light': '/assets/ui-light.css',
          'app-dark': '/assets/ui-dark.css'
        }
      }
    },
    nodeAssets: {
      'xterm': {
        import: ['src/xterm.css']
      },
      'lacsso': {
        import: ['lacsso.css']
      }
    },

    SRI: {
      enabled: false,
    },

    fingerprint: {
      exclude: [
        // These can be bind-mounted in
        'assets/images/logos',

        // These get version added to the query string so JS doesn't have to know the fingerprint
        'assets/intl',
        'ui-light.css', 'ui-light.rtl.css',
        'ui-dark.css',  'ui-dark.rtl.css',
        'ui.css',       'ui.rtl.css',
        'vendor.css',   'vendor.rtl.css',
      ],
      extensions: (appConfig.fingerprint === 'no' ? [] : ['js', 'css', 'png', 'jpg', 'gif', 'svg', 'map', 'woff', 'woff2', 'ttf']),
    },

    sourcemaps: {
      enabled: true,
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
  app.import('bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js');
  app.import('bower_components/jgrowl/jquery.jgrowl.js');
  app.import('bower_components/jgrowl/jquery.jgrowl.css');
  app.import('bower_components/jquery.cookie/jquery.cookie.js');
  app.import('bower_components/d3/d3.js');
  app.import('bower_components/c3/c3.js');
  app.import('bower_components/c3/c3.css');
  //app.import('vendor/term.js/src/term.js');
  //app.import('bower_components/xterm.js/src/xterm.css');
  app.import('bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect.js');
  app.import('bower_components/bootstrap-multiselect/dist/css/bootstrap-multiselect.css');
  app.import('bower_components/prism/prism.js');
  app.import('bower_components/prism/components/prism-yaml.js');
  app.import('bower_components/prism/components/prism-bash.js');
  app.import('bower_components/lodash/lodash.js');
  app.import('bower_components/graphlib/dist/graphlib.core.js');
  app.import('bower_components/dagre/dist/dagre.core.js');
  //app.import('bower_components/dagre-d3/dist/dagre-d3.core.js');
  app.import('bower_components/async/dist/async.js');
  app.import('bower_components/position-calculator/dist/position-calculator.js');
  app.import('vendor/aws-sdk-ec2.js');
  app.import('bower_components/identicon.js/pnglib.js');
  app.import('bower_components/identicon.js/identicon.js');
  app.import('bower_components/md5-jkmyers/md5.js');
  app.import('vendor/dagre-d3/dagre-d3.core.js');
  app.import('vendor/novnc.js');
  app.import('bower_components/commonmark/dist/commonmark.js');
  app.import('bower_components/momentjs/moment.js');
  app.import('bower_components/ember-shortcuts/ember-shortcuts.js');


  app.import('vendor/icons/style.css');
  app.import('vendor/icons/fonts/rancher-icons.svg', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/icons/fonts/rancher-icons.ttf', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/icons/fonts/rancher-icons.woff', {
    destDir: 'assets/fonts'
  });


  // Google Font Downloader thing: https://google-webfonts-helper.herokuapp.com/
  app.import('vendor/lato/lato-v11-latin-300.woff', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/lato/lato-v11-latin-300.woff2', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/lato/lato-v11-latin-700.woff', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/lato/lato-v11-latin-700.woff2', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/lato/lato-v11-latin-regular.woff', {
    destDir: 'assets/fonts'
  });
  app.import('vendor/lato/lato-v11-latin-regular.woff2', {
    destDir: 'assets/fonts'
  });

  return app.toTree();
};
