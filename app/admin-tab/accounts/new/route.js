import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var account = this.get('userStore').createRecord({type: 'account', kind: 'user'});
    var credential = this.get('userStore').createRecord({type: 'password'});

    return this.get('userStore').findAll('account').then((accounts) => {
      return Ember.Object.create({
        account:    account,
        accounts:   accounts,
        credential: credential
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
