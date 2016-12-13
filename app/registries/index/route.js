import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('registrycredential').then(() => {
      return this.get('store').findAll('registry');
    });
  },
});
