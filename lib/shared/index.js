/* eslint-disable */
const webpack  = require('webpack');

'use strict';

module.exports = {
  name: 'shared',

  isDevelopingAddon() {
    return true;
  },
  options: {
    babel:      { plugins: [require('ember-auto-import/babel-plugin')] },
    autoImport: {
      alias: {
        'xterm-fit': 'node_modules/xterm/dist/addons/fit/fit.js'
      },
      webpack: {
        externals: { jquery: 'jQuery' },
        node: {
          fs: 'empty'
        },
        plugins: [
          new webpack.EnvironmentPlugin({
            LATER_COV: false
          }),
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ],
      }
    },
  }
};
