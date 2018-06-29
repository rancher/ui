import Volume from './volume';
import { get, computed } from '@ember/object'
import { inject as service } from '@ember/service';
import { reference } from 'ember-api-store/utils/denormalize';

export default Volume.extend({
  storageClass: reference('storageClassId'),

  canRemove: computed('links.remove', 'state', function() {

    return !!get(this, 'links.remove') && get(this, 'state') !== 'bound';

  }),

  router: service(),

  type: 'persistentVolume',

  actions: {
    edit() {

      get(this, 'router').transitionTo('authenticated.cluster.storage.persistent-volumes.detail.edit', get(this, 'id'));

    },
  },
});
