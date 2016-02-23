import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    var store = this.get('store');

    return Ember.RSVP.all([
      store.find('schema','githubconfig', {authAsUser: true}),
      store.find('schema','localauthconfig', {authAsUser: true}),
      store.find('schema','ldapconfig', {authAsUser: true}),
      store.find('schema','openldapconfig', {authAsUser: true}),
    ]);
  },
});
