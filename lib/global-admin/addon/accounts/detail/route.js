import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get/* , set */ } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model(params) {
    return hash({
      clusterRoleTemplateBindings: get(this, 'globalStore').findAll('clusterroletemplatebinding'),
      globalRoleBindings:          get(this, 'globalStore').find('globalrolebinding', null, {filter: {creatorId: params.user_id}}),
      globalRoles:                 get(this, 'globalStore').findAll('globalrole'),
      projectRoleTemplateBindings: get(this, 'globalStore').findAll('projectroletemplatebinding'),
      user:                        get(this, 'globalStore').find('user', params.user_id),
      roleTemplates:               get(this, 'globalStore').find('roletemplate'),
    });
  },
});
