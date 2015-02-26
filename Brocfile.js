/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var util = require('util');

var app = new EmberApp({
  storeConfigInMeta: false,

  // Disable fingerprinting..
  fingerprint: {
    extensions: [],
  },

  /*
  gzip: {
    enabled: true,
    keepUncompressed: true
  },
  */

  sourcemaps: {
    enabled: true,
    extensions: ['js']
  }
});

var appConfig = require('./config/environment')(app.env).APP;
app.options.inlineContent = {
  'app-name': { content: appConfig.appName },
  'version': { content: appConfig.version },
}

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
app.import('bower_components/ember-animate/ember-animate.js');
app.import('bower_components/d3/d3.js');
app.import('bower_components/c3/c3.js');
app.import('bower_components/c3/c3.css');
app.import('bower_components/zeroclipboard/dist/ZeroClipboard.js');
app.import('bower_components/zeroclipboard/dist/ZeroClipboard.swf', {destDir: 'assets'});
app.import('vendor/term.js/src/term.js');
app.import('vendor/jquery.initialize/jquery.initialize.js');
app.import('bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect.js');
app.import('bower_components/bootstrap-multiselect/dist/css/bootstrap-multiselect.css');

module.exports = app.toTree();
