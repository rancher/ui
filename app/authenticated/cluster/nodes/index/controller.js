import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { headersCluster as hostHeaders } from 'shared/components/node-row/component';
import { computed , get } from '@ember/object';

export default Controller.extend({
  growl:             service(),
  prefs:             service(),
  scope:             service(),

  sortBy:            'name',
  queryParams:       ['sortBy'],
  searchText:        '',
  headers:           hostHeaders,

  extraSearchFields: [
    'displayUserLabelStrings',
    'requireAnyLabelStrings',
  ],

  actions: {
    scaleDownPool(id) {
      get(this,'model.cluster').send('scaleDownPool',id);
    },

    scaleUpPool(id) {
      get(this,'model.cluster').send('scaleUpPool',id);
    },
  },

  groupByKey: computed('model.cluster.suppportsNodePools', function() {
    if ( get(this, 'model.cluster.suppportsNodePools') ) {
      return 'nodePoolUuid';
    }

    return null;
  }),

  scaleTimer: null,
  saveScale() {
    if ( get(this, 'scaleTimer') ) {
      cancel(get(this, 'scaleTimer'));
    }

    var timer = later(this, function() {
      this.save().catch((err) => {
        get(this, 'growl').fromError('Error updating pool',err);
      });
    }, 500);

    set(this, 'scaleTimer', timer);
  },

  rows: computed('model.nodes.@each.clusterId', function() {
    return get(this,'model.nodes').filterBy('clusterId', get(this,'model.cluster.id'));
  }),
});
