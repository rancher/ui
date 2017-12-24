import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model(params) {
    return hash({
      globalRoleBindings: get(this, 'globalStore').findAll('globalrolebinding'),
      globalRoles:        get(this, 'globalStore').findAll('globalrole'),
      user:               get(this, 'globalStore').find('user', params.user_id),
    }).then((hash) => {
      hash.globalRoleBindings = hash.globalRoleBindings.filter((grb) => {
        // TODO 2.0 need api filter
        return get(grb, 'subjectName') === get(hash.user, 'principalIds')[0];
      });
      return hash;
    });
  },
});
