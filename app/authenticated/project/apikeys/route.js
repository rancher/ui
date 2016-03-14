import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      account: store.find('apikey', null, {forceReload: true}),
      environment: store.find('apikey', null, {forceReload: true, authAsUser: true}),
    }).then(() => {
      return store.allUnremoved('apikey');
    });
  },
});
