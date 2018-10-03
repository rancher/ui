/* eslint-env node */
'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'alert',

  lazyLoading: { enabled: true },

  isDevelopingAddon() {
    return true;
  }
});
