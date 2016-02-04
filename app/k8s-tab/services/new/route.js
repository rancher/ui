import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    var service = this.get('store').createRecord({
      type: 'kubernetesService',
      sessionAffinity: 'None',
      environmentId: params.environmentId,
    });

    return Ember.Object.create({
      service: service,
    });
  }
});
