import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';


export default Ember.Route.extend({
  store: service('cluster-store'),
  model: function(/* params, transition */) {
    // TODO - !!FORDEV!! get clusters
    let store = get(this, 'store');
    let def = {
      type: 'rancherKubernetesEngineConfig',
      hosts: [],
      network: 'flannel',
      auth: 'x509'
    };
    let config = store.createRecord(def);
    let cluster = this.modelFor('authenticated.clusters.new.index');
    set(cluster, 'rancherKubernetesEngineConfig', config);
    return cluster;
  }
});
