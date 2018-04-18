import Volume from './volume';
import { get } from '@ember/object'
import { inject as service } from '@ember/service';
import { reference } from 'ember-api-store/utils/denormalize';

export default Volume.extend({
  router: service(),

  storageClass: reference('storageClassId'),

  type: 'persistentVolume',

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.cluster.storage.persistent-volumes.detail.edit', get(this, 'id'));
    },
  },
});
