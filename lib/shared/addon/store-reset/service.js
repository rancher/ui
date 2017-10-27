import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),
  webhookStore: Ember.inject.service('webhook-store'),
  catalog: Ember.inject.service(),

  reset: function() {
    // Forget all the things
    console.log('Store Reset');
    this.get('userStore').reset();
    this.get('store').reset();
    this.get('catalog').reset();
    this.get('webhookStore').reset();
  },
});
