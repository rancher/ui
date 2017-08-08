import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    type: {
      refreshModel: true
    },
  },
  model: function(params) {
    return this.get('store').getById(params.type, params.volume_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    // Implement your custom setup after
    if (model.stackId) {
      this.controllerFor('volume').set('stack', this.get('store').getById('stack', model.stackId));
    }

    if (model.hostId) {
      this.controllerFor('volume').set('host', this.get('store').getById('host', model.hostId));
    }
  }});
