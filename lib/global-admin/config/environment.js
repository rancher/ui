/* eslint-env node */
'use strict';

var mode = process.env.UI_MODE || 'oss'; // 'caas' or 'oss'

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'global-admin',
    environment: environment,
    APP: {
    },
  };

  return ENV;
};
