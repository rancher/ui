import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get/* , set */ } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model(params) {
    return hash({
      clusterRoleTemplateBindings: get(this, 'globalStore').find('clusterroletemplatebinding', null, {filter: {subjectName: params.user_id}}),
      globalRoleBindings:          get(this, 'globalStore').find('globalrolebinding', null, {filter: {subjectName: params.user_id}}),
      globalRoles:                 get(this, 'globalStore').findAll('globalrole'),
      projectRoleTemplateBindings: get(this, 'globalStore').find('projectroletemplatebinding', null, {filter: {subjectName: params.user_id}}),
      roleTemplates:               get(this, 'globalStore').find('roletemplate'),
      user:                        get(this, 'globalStore').find('user', params.user_id),
    });
  },
});
