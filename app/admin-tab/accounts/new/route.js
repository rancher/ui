import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var account = this.get('userStore').createRecord({type: 'account', kind: 'user'});
    var credential = this.get('userStore').createRecord({type: 'password'});

    return Ember.Object.create({
      account: account,
      credential: credential
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
    }
  }
});
