import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const store = this.store;
    const clusterStore = this.clusterStore;

    return hash({
      persistentVolumes: clusterStore.findAll('persistentVolume'),
      storageClasses:    clusterStore.findAll('storageClass'),
      pvc:               store.find('persistentVolumeClaim', params.volume_id),
    });
  },
});
