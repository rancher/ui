import { hash } from 'rsvp';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model(params) {
    const store = get(this, 'globalStore');
    return hash({
      cluster:  this.modelFor('clusters.detail').clone(),
      roles:    store.findAll('roleTemplate'),
      users:    store.findAll('user'),
      me:       store.find('user', null, {filter: {me: true}}).then(users => get(users, 'firstObject'))
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    let bindings = (get(model,'cluster.clusterRoleTemplateBindings')||[]).slice();
    bindings = bindings.filter(x =>get(x, 'name') !== 'creator');
    set(controller, 'memberArray', bindings);
  }
});
