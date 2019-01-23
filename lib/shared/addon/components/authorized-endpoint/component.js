import Component from '@ember/component';
import layout from './template';
import { set, observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  globalStore: service(),

  layout,

  cluster:                        null,
  enableLocalClusterAuthEndpoint: false,


  init() {
    this._super(...arguments);

    this.initClusterAuthEndpoint();
  },

  enableClusterAuthEndpointChanged: observer('enableLocalClusterAuthEndpoint', function() {
    const { cluster, enableLocalClusterAuthEndpoint } = this;

    if (enableLocalClusterAuthEndpoint) {
      if (cluster.localClusterAuthEndpoint) {
        set(cluster, 'localClusterAuthEndpoint.enabled', true);
      } else {
        this.createLocalClusterAuthEndpoint();
      }
    } else {
      set(cluster, 'localClusterAuthEndpoint.enabled', false);
    }
  }),

  initClusterAuthEndpoint() {
    const { cluster } = this;

    if (cluster.localClusterAuthEndpoint && cluster.localClusterAuthEndpoint.enabled) {
      set(this, 'enableLocalClusterAuthEndpoint', true);
    } else {
      set(this, 'enableLocalClusterAuthEndpoint', false);
    }
  },

  createLocalClusterAuthEndpoint() {
    const { globalStore } = this;

    const lcae = globalStore.createRecord({
      type:    'localClusterAuthEndpoint',
      enabled: true
    });

    set(this, 'cluster.localClusterAuthEndpoint', lcae);
  },

});
