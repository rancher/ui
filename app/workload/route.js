import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params) {
    return hash({
      workload: this.get('store').find('workload', params.workload_id),
    }).then((hash) => {
      return EmberObject.create(hash);
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    let lc = model.get('workload.containers.firstObject');

    controller.setProperties({
      launchConfig:  lc,
    });
  }
});
