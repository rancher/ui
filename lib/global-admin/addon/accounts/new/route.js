import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  model() {
    const store = get(this, 'globalStore');
    var account = store.createRecord({ type: 'user', });

    return hash({
      users:       store.findAll('user'),
      globalRoles: store.findAll('globalrole'),
    }).then((hash) => {
      return EmberObject.create({
        account,
        users:       hash.users,
        globalRoles: hash.globalRoles
      });
    });
  },

  resetController(controller, isExisting /* , transition*/ ) {
    if (isExisting) {
      controller.set('errors', null);
    }
  }
});
