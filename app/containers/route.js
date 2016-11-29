import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      instances: store.findAll('instance'),
      hosts: store.findAll('host'),
    }).then(() => {
      return store.all('container');
    });
  },
});
