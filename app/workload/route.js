import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    if (window.ShellQuote) {
      return;
    } else {
      return import('shell-quote').then( (module) => {
        window.ShellQuote = module.default;

        return module.default;
      })
    }
  },

  model(params) {
    return hash({ workload: this.get('store').find('workload', params.workload_id), }).then((hash) => EmberObject.create(hash));
  },

  setupController(controller, model) {
    this._super(...arguments);

    let lc = model.get('workload.containers.firstObject');

    controller.setProperties({ launchConfig: lc, });
  }
});
