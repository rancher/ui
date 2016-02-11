import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    var service = this.get('store').createRecord({
      type: 'kubernetesService',
      environmentId: this.modelFor('k8s-tab.namespace').get('id'),
      template: {
        spec: {
          ports: [],
          selector: {},
          type: 'ClusterIP',
          externalIPs: [],
          sessionAffinity: 'None',
        },
      },
    });

    return Ember.Object.create({
      service: service,
    });
  }
});
