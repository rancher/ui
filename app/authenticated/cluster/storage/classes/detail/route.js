import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  clusterStore: service(),

  model(params) {
    const clusterStore = get(this, 'clusterStore');
    const storageClassId = params.storage_class_id;

    return hash({
      storageclass:      clusterStore.find('storageclass', storageClassId),
      persistentVolumes: clusterStore.findAll('persistentVolume').then((data) => (data || []).filterBy('storageClassId', storageClassId))
    });
  },
});
