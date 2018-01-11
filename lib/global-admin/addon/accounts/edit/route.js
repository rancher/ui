import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model(params) {
    return hash({
      globalRoleBindings: get(this, 'globalStore').find('globalrolebinding', null, {filter: { subjectName: params.user_id}}),
      globalRoles:        get(this, 'globalStore').findAll('globalrole'),
      user:               get(this, 'globalStore').find('user', params.user_id),
    });
  },
  resetController(controller/* , isExiting, transition */) {
    setProperties(controller, {
      primaryResource: null,
      password:        null,
      confirm:         null,
    });
  },
});
