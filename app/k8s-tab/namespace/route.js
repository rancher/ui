import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model(params) {
    return this.get('store').find('environment', params.namespace_id).then((ns) => {
      this.set('k8s.namespace', ns);
      return ns;
    }).catch((/*err*/) => {
      this.set('k8s.namespace', null);
      this.transitionTo('k8s-tab');
    });
  },
});
