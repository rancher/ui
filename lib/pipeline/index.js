/* eslint-disable */
const webpack  = require('webpack');

'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'pipeline',

  lazyLoading: { enabled: true },

  isDevelopingAddon() {
    return true;
  },

  options: {
    babel:      { plugins: [require('ember-auto-import/babel-plugin')] }
  }
});
