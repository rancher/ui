import EmberObject from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const store = this.get('globalStore');
    var account = store.createRecord({type: 'account', kind: 'user'});
    var credential = store.createRecord({type: 'password'});

    return store.findAll('credential').then((credentials) => {
      return store.findAll('account').then((accounts) => {
        return EmberObject.create({
          account:    account,
          accounts:   accounts,
          credential: credential,
          credentials: credentials
        });
      });
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
    }
  }
});
