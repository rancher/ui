import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object'
import { reference } from 'ember-api-store/utils/denormalize';
import { parseSi, formatSi } from 'shared/utils/parse-unit';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

var PersistentVolumeClaim = Resource.extend({
  clusterStore: service(),
  type:         'persistentVolumeClaim',
  canEdit:      false,

  storageClass:     reference('storageClassId', 'storageClass', 'clusterStore'),
  persistentVolume: reference('volumeId', 'persistentVolume', 'clusterStore'),
  namespace:        reference('namespaceId', 'namespace', 'clusterStore'),

  availableActions: computed('canExpand', function() {
    let out = [
      {
        label:    'action.resize',
        icon:     'icon icon-hdd',
        action:   'resize',
        enabled:  this.canExpand,
        bulkable: false
      },
    ];

    return out;
  }),

  canExpand: computed('storageClass.allowVolumeExpansion', function() {
    const { storageClass } = this;

    if (!isEmpty(storageClass) && get(storageClass, 'allowVolumeExpansion')) {
      return true;
    }

    return false;
  }),

  workloads: computed('id', 'namespace.workloads.@each.volumes', function() {
    return (get(this, 'namespace.workloads') || []).filter((workload) => (get(workload, 'volumes') || []).find((volume) => get(volume, 'persistentVolumeClaim.persistentVolumeClaimId') === this.id));
  }),

  sizeBytes: computed('status.capacity.storage', function() {
    const str = get(this, 'status.capacity.storage');

    if ( str ) {
      return parseSi(str, 1024);
    }

    return;
  }),

  displaySize: computed('sizeBytes', function() {
    const bytes = this.sizeBytes;

    if ( bytes ) {
      return formatSi(bytes, 1024, 'iB', 'B');
    }

    return;
  }),

  actions: {
    resize() {
      this.modalService.toggleModal('modal-resize-pvc', { model: this, });
    }
  },

});

export default PersistentVolumeClaim;
