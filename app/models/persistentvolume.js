import Volume from './volume';
import { get, computed } from '@ember/object'
import { inject as service } from '@ember/service';
import { reference } from 'ember-api-store/utils/denormalize';

export default Volume.extend({
  router: service(),

  type: 'persistentVolume',

  storageClass: reference('storageClassId'),

  canRemove: computed('links.remove', 'state', function() {
    return !!get(this, 'links.remove') && this.state !== 'bound';
  }),

  displayPvc: computed('claimRef.namespace', 'claimRef.name', function() {
    if ( get(this, 'claimRef.name') ) {
      return `${ get(this, 'claimRef.namespace') }/${ get(this, 'claimRef.name') }`;
    }

    return;
  }),

  actions: {
    edit() {
      this.router.transitionTo('authenticated.cluster.storage.persistent-volumes.detail.edit', this.id);
    },
  },
});
