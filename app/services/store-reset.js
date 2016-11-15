import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),
  catalog: Ember.inject.service(),

  reset: function() {
    // Forget all the things
    console.log('Store Reset');
    this.get('userStore').reset();
    this.get('store').reset();
    this.get('catalog').reset();
  },
});
