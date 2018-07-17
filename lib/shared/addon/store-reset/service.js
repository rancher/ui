import Service, { inject as service } from '@ember/service';

export default Service.extend({
  globalStore:  service(),
  clusterStore: service(),
  store:        service(),
  app:          service(),

  reset() {
    // Forget all the things
    console.log('Store Reset');
    this.get('globalStore').reset();
    this.get('clusterStore').reset();
    this.get('store').reset();
  },
});
