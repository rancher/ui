import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    var promises = [
      store.find('machine'),
      store.find('host'),
    ];

    return Ember.RSVP.all(promises).then((results) => {
      return {
        machines: results[0],
        hosts: results[1],
      };
    });
  },
});
