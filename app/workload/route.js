import EmberObject, { set } from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    const promises = {};

    if (!window.Prettycron) {
      set(promises, 'Prettycron', import('prettycron'));
    }

    if (!window.ShellQuote) {
      set(promises, 'ShellQuote', import('shell-quote'));
    }

    return hash(promises).then((resolved) => {
      if (resolved.Prettycron) {
        window.Prettycron = resolved.Prettycron;
      }

      if (resolved.ShellQuote) {
        window.ShellQuote = resolved.ShellQuote;
      }

      return resolved;
    });
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
