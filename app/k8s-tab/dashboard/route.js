import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model() {
    return Ember.Object.create({
      dashboardUrl: this.get('k8s.kubernetesDashboard'),
    });
  },
});
