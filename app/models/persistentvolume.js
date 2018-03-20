import Volume from './volume';
import { get, computed } from '@ember/object'
import { inject as service } from '@ember/service';
import { reference } from 'ember-api-store/utils/denormalize';

var PersistentVolume = Volume.extend({
  router: service(),

  storageClass: reference('storageClassId'),

  type: 'persistentVolume',

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.cluster.storage.persistent-volumes.detail.edit', get(this, 'id'));
    },
  },

  availableActions: computed('links.{update,remove}', function() {
    var l = get(this,'links');

    return [
      { label:   'action.edit',           icon: 'icon icon-edit',           action: 'edit',             enabled: !!l.update },
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
    ];
  }),
});

export default PersistentVolume;
