/* eslint-disable */
const webpack  = require('webpack');

'use strict';

module.exports = {
  name: 'ember-api-store',

  isDevelopingAddon() {
    return true;
  },
  options: {
    babel: { plugins: [require('ember-auto-import/babel-plugin')] },
  }
};
