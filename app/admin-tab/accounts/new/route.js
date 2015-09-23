import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var account = this.get('store').createRecord({type: 'account', kind: 'user'});
    var credential = this.get('store').createRecord({type: 'password'});

    return Ember.Object.create({
      account: account,
      credential: credential
    });
  },
});
