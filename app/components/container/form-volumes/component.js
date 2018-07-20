import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

export const NEW_VOLUME = 'newVolume';
export const EXISTING_VOLUME = 'existingVolume';
export const NEW_PVC = 'newPvc';
export const EXISTING_PVC = 'existingPvc';
export const BIND_MOUNT = 'bindMount';
export const TMPFS = 'tmpfs';
export const SECRET = 'secret';
export const CONFIG_MAP = 'configmap';
export const CUSTOM_LOG_PATH = 'customLogPath';

export const LOG_AGGREGATOR = 'cattle.io/log-aggregator'

export default Component.extend({
  intl:         service(),
  scope:        service(),
  modalService: service('modal'),
  layout,
  classNames:   ['accordion-wrapper'],

  // Inputs
  workload:     null,
  launchConfig: null,
  namespace:    null,
  errors:       null,
  editing:      true,

  volumesArray: null,

  nextNum: 1,
  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),

  init() {
    this._super(...arguments);
    this.sendAction('registerHook', this.saveVolumes.bind(this), {
      name: 'saveVolumes',
      key:  '_volumeHooks'
    });
  },

  didReceiveAttrs() {
    if (!get(this, 'expandFn')) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }

    const out = [];
    let entry;

    (get(this, 'workload.volumes') || []).forEach((volume) => {
      if (volume.persistentVolumeClaim) {
        entry = {
          mode: EXISTING_PVC,
          volume,
        };
      } else if (volume.hostPath) {
        entry = {
          mode: BIND_MOUNT,
          volume,
        };
      } else if ( volume.flexVolume && volume.flexVolume.driver === LOG_AGGREGATOR ) {
        entry = {
          mode: CUSTOM_LOG_PATH,
          volume,
        };
      } else if (volume.secret) {
        entry = {
          mode: SECRET,
          volume,
        };
      } else if (volume.configMap) {
        entry = {
          mode: CONFIG_MAP,
          volume,
        };
      } else {
        entry = {
          mode: EXISTING_VOLUME,
          volume,
        };
      }

      entry.mounts = [];
      out.push(entry);
    });

    (get(this, 'launchConfig.volumeMounts') || []).forEach((mount) => {
      entry = out.findBy('volume.name', mount.name);

      if (entry) {
        entry.mounts.push(mount);
      }
    });

    // filter out custom log path volume when logging is disabled
    if (!get(this, 'loggingEnabled')) {
      set(this, 'volumesArray', out.filter((row) => row.mode !== CUSTOM_LOG_PATH));
    } else {
      set(this, 'volumesArray', out);
    }
  },

  // Create (ephermal) Volume -> volume entry on pod
  // Create PVC for existing (persistent) volume // cru-pvc
  // Create PVC for a new volume via storageclass // cru-pvc
  // Use an existing PVC (from the project volumes page)
  // Bind-mount (ephemeral volume -> hostPath)
  // Tmpfs (ephemeral volume -> emptyDir -> backing=memory)

  actions: {
    remove(obj) {
      get(this, 'volumesArray').removeObject(obj);
    },

    addVolume() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   NEW_VOLUME,
        volume: store.createRecord({
          type: 'volume',
          name: this.nextName(),
        }),
        mounts: [
          get(this, 'store').createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addNewPvc() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   NEW_PVC,
        pvc:    store.createRecord({ type: 'persistentVolumeClaim', }),
        name:   null,
        volume: store.createRecord({
          type:                  'volume',
          persistentVolumeClaim: store.createRecord({
            type:                    'persistentVolumeClaimVolumeSource',
            persistentVolumeClaimId: null,
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addPvc() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   EXISTING_PVC,
        volume: store.createRecord({
          type:                  'volume',
          name:                  this.nextName(),
          persistentVolumeClaim: store.createRecord({
            type:                    'persistentVolumeClaimVolumeSource',
            persistentVolumeClaimId: null,
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', }),
        ],
      });
    },

    addBindMount() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   BIND_MOUNT,
        volume: store.createRecord({
          type:     'volume',
          name:     this.nextName(),
          hostPath: store.createRecord({
            type: 'hostPathVolumeSource',
            kind: '',
            path: '',
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addTmpfs() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   TMPFS,
        volume: store.createRecord({
          type:     'volume',
          name:     this.nextName(),
          emptyDir: store.createRecord({
            type:   'emptyDirVolumeSource',
            medium: 'Memory',
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addConfigMap() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   CONFIG_MAP,
        volume: store.createRecord({
          type:      'volume',
          name:      this.nextName(),
          configMap: store.createRecord({
            type:        'configMapVolumeSource',
            defaultMode: 256,
            name:        null,
            optional:    false,
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addSecret() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   SECRET,
        volume: store.createRecord({
          type:   'volume',
          name:   this.nextName(),
          secret: store.createRecord({
            type:        'secretVolumeSource',
            defaultMode: 256,
            secretId:    null,
            optional:    false,
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addCustomLogPath() {
      const store = get(this, 'store');

      const name = this.nextName();

      get(this, 'volumesArray').pushObject({
        mode:   CUSTOM_LOG_PATH,
        volume: store.createRecord({
          type:       'volume',
          name,
          flexVolume: store.createRecord({
            type:    'flexVolume',
            driver:  LOG_AGGREGATOR,
            fsType:  'ext4',
            options: {
              format:      'json',
              clusterName: get(this, 'cluster.name'),
              projectName: get(this, 'project.name'),
              clusterId:   get(this, 'cluster.id'),
              projectId:   get(this, 'project.id').split(':')[1],
              volumeName:  name,
            },
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', }),
        ],
      });
    },
  },

  nextName() {
    const volumes = get(this, 'workload.volumes') || [];
    let num = get(this, 'nextNum');
    let name;

    let ok = false;

    while (!ok) {
      name = `vol${  num }`;
      ok = !volumes.findBy('name', name);
      num++;
    }

    set(this, 'nextNum', num);

    return name;
  },

  saveVolumes() {
    const ary = get(this, 'volumesArray') || [];
    const promises = [];
    let pvc;

    ary.filterBy('pvc').forEach((row) => {
      pvc = get(row, 'pvc');
      set(pvc, 'namespaceId', get(this, 'namespace.id'));
      promises.push(get(row, 'pvc').save());
    });

    ary.filterBy('mode', CUSTOM_LOG_PATH).filterBy('volume.flexVolume.driver', LOG_AGGREGATOR)
      .forEach((row) => {
        const options = get(row, 'volume.flexVolume.options');
        const lc = get(this, 'launchConfig');
        const workload = get(this, 'workload');

        set(options, 'containerName', get(lc, 'name'));
        set(options, 'namespace', get(workload, 'namespace.id'));
        set(options, 'workloadName', get(workload, 'name'));
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

        if (row.pvc) {
          const id = get(row, 'pvc.id');

          set(row, 'volume.persistentVolumeClaim.persistentVolumeClaimId', id);
        }
      });

      get(this, 'workload').set('volumes', volumes);
      get(this, 'launchConfig').set('volumeMounts', mounts);
    });
  },
});
