import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    type: {
      refreshModel: true
    },
  },
  model: function(params) {
    let out = Ember.Object.create({
      volume: this.get('store').getById(params.type, params.volume_id)
    });

    if (out.volume.stackId) {
      out.stack = this.controllerFor('volume').set('stack', this.get('store').getById('stack', out.volume.stackId));
    }

    if (out.volume.hostId) {
      out.host = this.controllerFor('volume').set('host', this.get('store').getById('host', out.volume.hostId));
    }
    return out;
  },
});
