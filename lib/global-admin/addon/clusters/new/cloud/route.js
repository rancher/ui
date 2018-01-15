import Ember from 'ember';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { sort } from '@ember/object/computed';

export default Ember.Route.extend({
  clusterStore: service(),
  globalStore: service(),

  model: function(/* params, transition */) {
    let models = this.modelFor('clusters.new');
    let cluster = get(models, 'cluster');
    return hash({
      clusters: get(this, 'globalStore').findAll('cluster'),
      cluster: cluster,
    });
  },

  sortBy:        ['name'],
  sortedDrivers: sort('model.availableDrivers','sortBy'),
});
