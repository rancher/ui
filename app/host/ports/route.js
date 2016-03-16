import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var host = this.modelFor('host').get('host');
    var store = this.get('store');

    return Ember.RSVP.all([
      store.findAll('service'),
      store.findAll('container'),
      store.findAll('virtualmachine'),
    ]).then(() => {
      return host;
    });
  }
});
