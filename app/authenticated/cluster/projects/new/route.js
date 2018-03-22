import { hash } from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  scope: service(),
  access: service(),

  model() {
    const store = get(this, 'globalStore');
    const cluster = this.modelFor('authenticated.cluster');

    const project = store.createRecord({
      type: 'project',
      name: '',
      clusterId: get(cluster, 'id'),
    });

    return hash({
      project,
      projects: store.findAll('project'),
      roles: store.findAll('roleTemplate'),
      psps: store.findAll('podSecurityPolicyTemplate'),
      users: store.find('user', null, {forceReload: true}),
      me: get(this, 'access.principal'),
    });
  },
});
