import { get } from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model(/* params, transition*/) {
    const store = this.store;
    const clusterStore = this.clusterStore;

    return hash({
      persistentVolumes: clusterStore.findAll('persistentVolume'),
      storageClasses:    clusterStore.findAll('storageClass'),
      pvc:               store.createRecord({ type: 'persistentVolumeClaim', }),
    });
  },
});
