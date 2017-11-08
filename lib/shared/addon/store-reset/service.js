import Service, { inject as service } from '@ember/service';

export default Service.extend({
  store: service(),
  userStore: service('user-store'),
  webhookStore: service('webhook-store'),
  catalog: service(),

  reset: function() {
    // Forget all the things
    console.log('Store Reset');
    this.get('userStore').reset();
    this.get('store').reset();
    this.get('catalog').reset();
    this.get('webhookStore').reset();
  },
});
