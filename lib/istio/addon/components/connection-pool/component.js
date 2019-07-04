import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  trafficPolicy: null,

  model: alias('trafficPolicy.connectionPool'),

  init() {
    this._super(...arguments);

    this.initConnectionPool();
  },

  initConnectionPool() {
    if ( !get(this, 'trafficPolicy.connectionPool') && get(this, 'editing') ) {
      set(this, 'trafficPolicy.connectionPool', {
        http: {
          http1MaxPendingRequests:  1024,
          http2MaxRequests:         1024,
          maxRequestsPerConnection: 1024,
          maxRetries:               1024,
        },
        tcp:  { maxConnections: 1024 }
      });
    }
  },

});
