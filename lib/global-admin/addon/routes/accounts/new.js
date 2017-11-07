import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  userStore: service('user-store'),
  model: function() {
    var account = this.get('userStore').createRecord({type: 'account', kind: 'user'});
    var credential = this.get('userStore').createRecord({type: 'password'});

    return this.get('userStore').findAll('credential').then((credentials) => {
      return this.get('userStore').findAll('account').then((accounts) => {
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
