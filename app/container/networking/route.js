import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('host').then((hosts) => {
      return {
        hosts: hosts,
        container: this.modelFor('container'),
      };
    });
  }
});
