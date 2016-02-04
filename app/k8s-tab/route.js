import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    var store = this.get('store');
    // Kubernetes schemas are dynamic and not loaded by the initial /v1/schemas
    return Ember.RSVP.all([
      this.get('store').find('schema','kubernetesservice'),
      this.get('store').find('schema','kubernetesreplicationcontroller'),
    ]);
  },
});
