/* eslint-env node */
'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'nodes',

  lazyLoading: { enabled: false },

  isDevelopingAddon() {
    return true;
  }
});
