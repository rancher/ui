import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  arranged:         sort('model','sorting'),
  backTo:           'hosts',
  currentClusterId: null,
  queryParams:      ['backTo'],
  sorting:          ['driver','name'],

  actions: {
    launch(model) {
      this.transitionToRoute('authenticated.clusters.cluster.host-templates.launch', this.get('currentClusterId'), model.id);
    },
  },

});
