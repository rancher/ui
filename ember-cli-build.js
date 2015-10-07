/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var util = require('util');
var env = EmberApp.env();
console.log("Environment:",env);

module.exports = function(defaults) {
  // Pull in a few useful environment settings for index.html to use
  var appConfig = require('./config/environment')(env).APP;
  var inline = {};
  ['version','appName','baseAssets'].forEach(function(key) {
    var val = appConfig[key];
    if ( val )
    {
      inline[key] = {content: val};
    }
  });

  var app = new EmberApp(defaults, {
    storeConfigInMeta: false,
    inlineContent: inline,

    fingerprint: {
      exclude: ['fontawesome'],
      extensions: (appConfig.fingerprint === 'no' ? [] : ['js','css','png','jpg','gif','svg','map','woff','woff2','ttf']),
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
  app.import('bower_components/zeroclipboard/dist/ZeroClipboard.js');
  app.import('bower_components/zeroclipboard/dist/ZeroClipboard.swf', {destDir: 'assets'});
  app.import('vendor/term.js/src/term.js');
  app.import('vendor/jquery.initialize/jquery.initialize.js');
  app.import('bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect.js');
  app.import('bower_components/bootstrap-multiselect/dist/css/bootstrap-multiselect.css');
  app.import('bower_components/prism/prism.js');
  app.import('bower_components/prism/components/prism-yaml.js');
  app.import('bower_components/lodash/lodash.js');
  app.import('bower_components/graphlib/dist/graphlib.core.js');
  app.import('bower_components/dagre/dist/dagre.core.js');
  app.import('bower_components/dagre-d3/dist/dagre-d3.core.js');
  app.import('bower_components/async/lib/async.js');
  app.import('bower_components/position-calculator/dist/position-calculator.js');
  app.import('vendor/aws-sdk-ec2.js');
  app.import('vendor/icons/style.css');
  app.import('vendor/icons/fonts/rancher-icons.eot', {destDir: 'assets/fonts'});
  app.import('vendor/icons/fonts/rancher-icons.svg', {destDir: 'assets/fonts'});
  app.import('vendor/icons/fonts/rancher-icons.ttf', {destDir: 'assets/fonts'});
  app.import('vendor/icons/fonts/rancher-icons.woff', {destDir: 'assets/fonts'});
  app.import('bower_components/identicon.js/pnglib.js');
  app.import('bower_components/identicon.js/identicon.js');
  app.import('bower_components/md5-jkmyers/md5.js');

  return app.toTree();
};
