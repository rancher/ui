import EmberObject from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  queryParams: {
    type: {
      refreshModel: true
    },
  },
  model: function(params) {

    let out = EmberObject.create({
      volume: this.get('store').getById(params.type, params.volume_id)
    });

    if (out.volume.stackId) {
      out.stack = this.get('store').getById('stack', out.volume.stackId);
    }

    if (out.volume.hostId) {
      out.host = this.get('store').getById('host', out.volume.hostId);
    }

    return out;
  },
});
