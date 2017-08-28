import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return Ember.RSVP.hash({
      service: this.get('store').find('service', params.service_id),
    }).then((hash) => {
      return Ember.Object.create(hash);
    });
  },

  afterModel(model) {
    if (model.get('service.initPorts')) {
      model.get('service').initPorts();
    }
    if (model.get('service.stackId')) {
      model.set('stack', this.get('store').getById('stack', model.get('service.stackId')));
    }
  },

  setupController(controller, model) {
    this._super(...arguments);

    let lc = model.get('service.launchConfig');
    if (lc) {
      controller.setProperties({
        fixedLaunchConfig:  lc,
        activeLaunchConfig: lc,
      });
    }
  }
});
