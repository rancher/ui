import Component from '@ember/component';
import layout from './template';
import { computed, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  globalStore:                    service(),

  layout,

  cluster:                        null,
  clusterTemplateRevision:        null,
  enableLocalClusterAuthEndpoint: false,
  clusterTemplateCreate:          false,
  applyClusterTemplate:           null,


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

  enableLocalClusterAuthEndpointAvailable: computed('enableLocalClusterAuthEndpoint', 'clusterTemplateRevision.questions.[]', function() {
    let { clusterTemplateRevision } = this;
    let { questions = [] } = clusterTemplateRevision ? clusterTemplateRevision : {};

    let match = questions.find((question) => {
      if (( question.variable || '' ).includes('localClusterAuthEndpoint')) {
        return question;
      }

      return false;
    });

    return match && match.length > 0;
  }),

  initClusterAuthEndpoint() {
    const { cluster } = this;

    if (cluster.localClusterAuthEndpoint &&
        (typeof cluster.localClusterAuthEndpoint.enabled === 'string' && cluster.localClusterAuthEndpoint.enabled === 'true') ||
        (typeof cluster.localClusterAuthEndpoint.enabled === 'boolean' && cluster.localClusterAuthEndpoint.enabled)) {
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
