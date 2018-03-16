import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model() {
    let gs = get(this, 'globalStore');
    return hash({
      activeDirectory: gs.find('authconfig', 'activedirectory'),
      principals: gs.all('principal'),
    }).then((hash) => {
      let defaultAd = hash.activeDirectory;
      let schema = get(this, 'globalStore').getById('schema','activedirectoryconfig');

      schema.getLoadDefaults(defaultAd);

      return hash;
    });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model: model,
      confirmDisable: false,
      testing: false,
      organizations: this.get('session.orgs')||[],
      errors: null,
    });
  }
});
