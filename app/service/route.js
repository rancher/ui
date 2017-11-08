import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params) {
    return hash({
      service: this.get('store').find('service', params.service_id),
    }).then((hash) => {
      return EmberObject.create(hash);
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
