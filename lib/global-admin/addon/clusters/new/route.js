import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash/* , all */ } from 'rsvp';

export default Route.extend({
  access: service(),
  catalog: service(),
  settings: service(),
  globalStore: service(),

  model() {
    let globalStore = this.get('globalStore');

    let cluster = globalStore.createRecord({
      type: 'cluster'
    });

    return hash({
      cluster,
      nodeTemplates: globalStore.findAll('nodeTemplate'),
      nodeDrivers: globalStore.findAll('nodeDriver'),
      psps: globalStore.findAll('podSecurityPolicyTemplate'),
      roleTemplates: globalStore.findAll('roleTemplate'),
      users: globalStore.findAll('user'),
      clusterRoleTemplateBinding: globalStore.findAll('clusterRoleTemplateBinding'),
      me: get(this, 'access.me'),
    });
  },
});
