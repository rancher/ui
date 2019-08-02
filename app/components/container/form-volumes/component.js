import C from 'ui/utils/constants';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import { computed, get, set, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

export const NEW_VOLUME = 'newVolume';
export const NEW_PVC = 'newPvc';
export const NEW_VCT = 'newVolumeClaimTemplate';

export const EXISTING_VOLUME = 'existingVolume';
export const EXISTING_PVC = 'existingPvc';
export const EXISTING_VCT = 'existingVct';

export const LOG_AGGREGATOR = 'cattle.io/log-aggregator'

export default Component.extend({
  intl:          service(),
  scope:         service(),
  modalService:  service('modal'),
  layout,
  classNames:    ['accordion-wrapper'],

  // Inputs
  workload:      null,
  launchConfig:  null,
  namespace:     null,
  errors:        null,
  editing:       true,
  scaleMode:     null,

  volumesArray:  null,

  nextNum:       1,
  cluster:       alias('scope.currentCluster'),
  project:       alias('scope.currentProject'),
  isWindows:     alias('scope.currentCluster.isWindows'),

  init() {
    this._super(...arguments);

    if (this.registerHook) {
      this.registerHook(this.saveVolumes.bind(this), {
        name: 'saveVolumes',
        key:  '_volumeHooks'
      });
    }

    this.initVolumes()
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
        mode:   C.VOLUME_TYPES.BIND_MOUNT,
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
        mode:   C.VOLUME_TYPES.TMPFS,
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
        mode:   C.VOLUME_TYPES.CONFIG_MAP,
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
        mode:   C.VOLUME_TYPES.SECRET,
        volume: store.createRecord({
          type:   'volume',
          name:   this.nextName(),
          secret: store.createRecord({
            type:        'secretVolumeSource',
            defaultMode: 256,
            secretName:  null,
            optional:    false,
          }),
        }),
        mounts: [
          store.createRecord({ type: 'volumeMount', })
        ],
      });
    },

    addCertificate() {
      const store = get(this, 'store');

      get(this, 'volumesArray').pushObject({
        mode:   C.VOLUME_TYPES.CERTIFICATE,
        volume: store.createRecord({
          type:   'volume',
          name:   this.nextName(),
          secret: store.createRecord({
            type:        'secretVolumeSource',
            defaultMode: 256,
            secretName:  null,
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
        mode:   C.VOLUME_TYPES.CUSTOM_LOG_PATH,
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

    addVolumeClaimTemplate() {
      const { store, volumesArray } = this;

      const vct = store.createRecord({
        type: 'persistentVolumeClaim',
        name: this.nextName(),
      });

      volumesArray.pushObject({
        mode:   NEW_VCT,
        vct,
        mounts: [
          store.createRecord({ type: 'volumeMount', }),
        ],
      });
    }
  },

  isStatefulSet: computed('launchConfig', 'scaleMode', function() {
    const { scaleMode } = this;

    return scaleMode === 'statefulSet';
  }),


  initVolumes() {
    if (!get(this, 'expandFn')) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }

    const out                = [];
    const { workload }       = this;
    let volumes              = workload.volumes || [];
    let volumeClaimTemplates = workload.statefulSetConfig && workload.statefulSetConfig.volumeClaimTemplates ? workload.statefulSetConfig.volumeClaimTemplates : [];

    if (volumeClaimTemplates.length > 0) {
      volumeClaimTemplates.forEach((vct) => {
        set(vct, 'isVolumeClaimTemplate', true);
      });
    }

    let allVolumes           = [].concat(volumes.slice(), volumeClaimTemplates.slice());

    allVolumes.forEach((volume) => {
      let mode;
      let hidden = false;

      if (volume.persistentVolumeClaim) {
        mode = EXISTING_PVC;
      } else if ( volume.hostPath ) {
        mode = C.VOLUME_TYPES.BIND_MOUNT;
      } else if ( volume.flexVolume && volume.flexVolume.driver === LOG_AGGREGATOR ) {
        mode =  C.VOLUME_TYPES.CUSTOM_LOG_PATH;
        hidden = get(volume, 'flexVolume.options.containerName') !== get(this, 'launchConfig.name');
      } else if ( volume.secret ) {
        mode = this.getSecretType(get(volume, 'secret.secretName'));
      } else if ( volume.configMap ) {
        mode = C.VOLUME_TYPES.CONFIG_MAP;
      } else if ( volume.isVolumeClaimTemplate ) {
        mode = EXISTING_VCT;
      } else {
        mode = EXISTING_VOLUME;
      }

      out.push({
        mode,
        hidden,
        volume,
        mounts: []
      });
    });

    (get(this, 'launchConfig.volumeMounts') || []).forEach((mount) => {
      const entry = out.findBy('volume.name', mount.name);

      if (entry) {
        entry.mounts.push(mount);
      }
    });

    // filter out custom log path volume when logging is disabled
    if (!get(this, 'loggingEnabled')) {
      set(this, 'volumesArray', out.filter((row) => row.mode !== C.VOLUME_TYPES.CUSTOM_LOG_PATH));
    } else {
      set(this, 'volumesArray', out);
    }
  },

  getSecretType(secretName) {
    const store = get(this, 'store');
    let found = store.all('secret').findBy('name', secretName);

    if ( found ) {
      if ( get(found, 'type') === C.VOLUME_TYPES.CERTIFICATE ) {
        return C.VOLUME_TYPES.CERTIFICATE;
      }
    } else {
      found = store.all('namespacedSecret').findBy('type', secretName);
      if ( found && get(found, 'type') === 'namespacedCertificate' ) {
        return C.VOLUME_TYPES.CERTIFICATE;
      }
    }

    return C.VOLUME_TYPES.SECRET;
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
    const { workload, launchConfig } = this;
    const ary                        = get(this, 'volumesArray') || [];
    const promises                   = [];
    const statefulSetConfig          = get(workload, 'statefulSetConfig') || {};
    const volumeClaimTemplates       = get(statefulSetConfig, 'volumeClaimTemplates') || [];

    let pvc, vct;

    ary.filterBy('pvc').forEach((row) => {
      pvc = get(row, 'pvc');
      set(pvc, 'namespaceId', get(this, 'namespace.id'));
      promises.push(get(row, 'pvc').save());
    });

    if (get(this, 'isStatefulSet')) {
      ary.filterBy('vct').forEach((row) => {
        vct = get(row, 'vct');
        volumeClaimTemplates.push(vct)
      });

      set(this, 'workload.statefulSetConfig.volumeClaimTemplates', volumeClaimTemplates);
    }

    ary.filterBy('mode', C.VOLUME_TYPES.CUSTOM_LOG_PATH).filterBy('volume.flexVolume.driver', LOG_AGGREGATOR)
      .forEach((row) => {
        const options  = get(row, 'volume.flexVolume.options');
        const lc       = get(this, 'launchConfig');
        const workload = get(this, 'workload');

        if ( !get(row, 'hidden') ) {
          setProperties(options, {
            containerName: get(lc, 'name'),
            namespace:     get(workload, 'namespace.id'),
            workloadName:  get(workload, 'name')
          })
        }
      });

    return all(promises).then(() => {
      const volumes              = [];
      const mounts               = [];

      ary.forEach((row) => {
        if (row.volume && !row.volume.isVolumeClaimTemplate) {
          volumes.pushObject(row.volume);
        }

        row.mounts.forEach((mount) => {
          if (get(row, 'vct')) {
            set(mount, 'name', get(row, 'vct.name'));
          } else {
            set(mount, 'name', get(row, 'volume.name'));
          }
          mounts.pushObject(mount);
        });

        if (row.pvc) {
          const id = get(row, 'pvc.id');

          set(row, 'volume.persistentVolumeClaim.persistentVolumeClaimId', id);
        }
      });

      set(workload, 'volumes', volumes);

      set(launchConfig, 'volumeMounts', mounts);
    });
  },

});
