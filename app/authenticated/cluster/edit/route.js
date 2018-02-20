import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash/* , all */ } from 'rsvp';

export default Route.extend({
  access: service(),
  globalStore: service(),

  model() {
    let globalStore = this.get('globalStore');

    return hash({
      cluster: this.modelFor('authenticated.cluster').clone(),
      nodeTemplates: globalStore.findAll('nodeTemplate'),
      nodeDrivers: globalStore.findAll('nodeDriver'),
      psps: globalStore.findAll('podSecurityPolicyTemplate'),
      roleTemplates: globalStore.findAll('roleTemplate'),
      users: globalStore.findAll('user'),
      clusterRoleTemplateBinding: globalStore.findAll('clusterRoleTemplateBinding'),
      me: get(this, 'access.me'),
    });
  },

  setupController(controller/*, model*/) {
    this._super(...arguments);
    set(controller, 'step', 1);
  }
});
