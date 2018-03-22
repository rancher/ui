import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export const NEW_VOLUME = 'newVolume';
export const NEW_PVC = 'newPvc';
export const EXISTING_PVC = 'existingPvc';
export const BIND_MOUNT = 'bindMount';
export const TMPFS = 'tmpfs';
export const SECRET = 'secret';

export default Component.extend({
  layout,
  intl: service(),
  scope: service(),
  modalService: service('modal'),

  classNames: ['accordion-wrapper'],

  // Inputs
  workload: null,
  launchConfig: null,
  namespace: null,
  errors: null,
  editing: true,

  volumesArray: null,

  init() {
    this._super(...arguments);
    this.sendAction('registerHook', this.saveVolumes.bind(this), {name: 'saveVolumes', key: '_volumeHooks'});
  },

  didReceiveAttrs() {
    if (!get(this,'expandFn')) {
      set(this,'expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }

    //@TODO-2.0 read existing volumes/mounts from the workload/launchConfig
    set(this, 'volumesArray', []);
  },

// Create (ephermal) Volume -> volume entry on pod
// Create PVC for existing (persistent) volume // cru-pvc
// Create PVC for a new volume via storageclass // cru-pvc
// Use an existing PVC (from the project volumes page)
// Bind-mount (ephemeral volume -> hostPath)
// Tmpfs (ephemeral volume -> emptyDir -> backing=memory)

  actions: {
    remove(obj) {
      get(this,'volumesArray').removeObject(obj);
    },

    addVolume() {
      const store = get(this, 'store');

      get(this,'volumesArray').pushObject({
        mode: NEW_VOLUME,
        volume: store.createRecord({
          type: 'volume',
          name: this.nextName(),
        }),
        mounts: [
          get(this,'store').createRecord({
            type: 'volumeMount',
          })
        ],
      });
    },

    addNewPvc() {
      const store = get(this, 'store');

      get(this,'volumesArray').pushObject({
        mode: NEW_PVC,
        pvc: store.createRecord({
          type: 'persistentVolumeClaim',
        }),
        name: null,
        volume: store.createRecord({
          type: 'volume',
          persistentVolumeClaim: store.createRecord({
            type: 'persistentVolumeClaimVolumeSource',
            persistentVolumeClaimId: null,
          }),
        }),
        mounts: [
          store.createRecord({
            type: 'volumeMount',
          })
        ],
      });
    },

    addPvc() {
      const store = get(this, 'store');

      get(this,'volumesArray').pushObject({
        mode: EXISTING_PVC,
        volume: store.createRecord({
          type: 'volume',
          name: this.nextName(),
          persistentVolumeClaim: store.createRecord({
            type: 'persistentVolumeClaimVolumeSource',
            persistentVolumeClaimId: null,
          }),
        }),
        mounts: [
          store.createRecord({
            type: 'volumeMount',
          }),
        ],
      });
    },

    addBindMount() {
      const store = get(this, 'store');

      get(this,'volumesArray').pushObject({
        mode: BIND_MOUNT,
        volume: store.createRecord({
          type: 'volume',
          name: this.nextName(),
          hostPath: store.createRecord({
            type: 'hostPathVolumeSource',
            kind: '',
            path: '',
          }),
        }),
        mounts: [
          store.createRecord({
            type: 'volumeMount',
          })
        ],
      });
    },

    addTmpfs() {
      const store = get(this, 'store');

      get(this,'volumesArray').pushObject({
        mode: TMPFS,
        volume: store.createRecord({
          type: 'volume',
          name: this.nextName(),
          emptyDir: store.createRecord({
            type: 'emptyDirVolumeSource',
            medium: 'Memory',
          }),
        }),
        mounts: [
          store.createRecord({
            type: 'volumeMount',
          })
        ],
      });
    },

    addSecret() {
      const store = get(this, 'store');

      get(this,'volumesArray').pushObject({
        mode: SECRET,
        volume: store.createRecord({
          type: 'volume',
          name: this.nextName(),
          secret: store.createRecord({
            type: 'secretVolumeSource',
            defaultMode: 256,
            secretId: null,
            optional: false,
          }),
        }),
        mounts: [
          store.createRecord({
            type: 'volumeMount',
          })
        ],
      });
    },
  },

  nextNum: 1,
  nextName() {
    const volumes = get(this, 'volumesArray');
    let num = get(this,'nextNum');
    let name;

    let ok = false;
    while ( !ok ) {
      name = 'vol'+num;
      ok = !volumes.findBy('name', name);
      num++;
    }

    set(this, 'nextNum', num);
    return name;
  },

  saveVolumes() {
    const ary = get(this, 'volumesArray');
    const promises = [];
    ary.filterBy('pvc').forEach((row) => {
      promises.push(get(row, 'pvc').save());
    });

    return all(promises).then(() => {
      const volumes = [];
      const mounts = [];

      ary.forEach((row) => {
        volumes.pushObject(row.volume);

        row.mounts.forEach((mount) => {
          set(mount, 'name', get(row, 'volume.name'));
          mounts.pushObject(mount);
        });

        if ( row.pvc ) {
          const id = get(row, 'pvc.id');
          set(row, 'volume.persistentVolumeClaim.persistentVolumeClaimId', id);
        }
      });

      get(this,'workload').set('volumes',volumes);
      get(this,'launchConfig').set('volumeMounts', mounts);
    });
  },
});
