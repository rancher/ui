import { hash } from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  scope: service(),

  model() {
    const store = get(this, 'globalStore');

    const project = store.createRecord({
      type: 'project',
      name: '',
      clusterId: get(this,'scope.currentCluster.id'),
    });

    return hash({
      project,
      projects: store.findAll('project'),
      roles: store.findAll('roleTemplate'),
      policies: store.find('podSecurityPolicyTemplate'),
    });
  },
});
