import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed , get } from '@ember/object';

export default Controller.extend({
  scope: service(),

  rows: computed('model.projects.@each.clusterId', function() {
    return get(this,'model.projects').filterBy('clusterId', get(this,'scope.currentCluster.id'));
  }),
});
