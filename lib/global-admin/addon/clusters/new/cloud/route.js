import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { sort } from '@ember/object/computed';

export default Ember.Route.extend({
  clusterStore: service(),
  model: function(/* params, transition */) {
    let models = this.modelFor('clusters.new');
    let cluster = get(models, 'cluster')

    return {
      cluster: cluster,
    };
  },

  sortBy:        ['name'],
  sortedDrivers: sort('model.availableDrivers','sortBy'),
});
