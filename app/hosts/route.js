import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      machines: store.findAll('machine'),
      hosts: store.findAll('host'),
      instances: store.findAll('instance'),
    }).then((hash) => {
      return hash.hosts;
    });
  },
});
