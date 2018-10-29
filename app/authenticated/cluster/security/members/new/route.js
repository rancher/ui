import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),
  roleTemplateService: service('roleTemplate'),

  // need to get all roles, we should have two roles and custom like the global perms
  // cluster owner, cluster-member, custom
  model() {
    const gs  = get(this, 'globalStore');
    const cid = this.paramsFor('authenticated.cluster');

    return hash({
      cluster:      gs.find('cluster', cid.cluster_id, { forceReload: true }),
      roles:        get(this, 'roleTemplateService').get('allFilteredRoleTemplates'),
      roleBindings: gs.findAll('clusterRoleTemplateBinding'),
    });
  },
});
