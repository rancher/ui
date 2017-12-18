import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),
  model() {
    const store = this.get('globalStore');
    var account = store.createRecord({type: 'user'});

    return store.findAll('user').then((users) => {
      return EmberObject.create({
        account,
        users
      })
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
    }
  }
});
