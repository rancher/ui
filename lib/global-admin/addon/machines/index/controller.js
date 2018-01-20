import { headersGlobal } from 'shared/components/node-row/component';
import Controller from '@ember/controller'
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

export default Controller.extend({
  headers: headersGlobal,
  sortBy: 'name',
  scope: service(),

  noAddableClusters: computed('model.clusters.@each.canAddNode', function() {
    return !get(this, 'model.clusters').findBy('canAddNode', true);
  }),
});
