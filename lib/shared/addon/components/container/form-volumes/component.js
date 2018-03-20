import { resolve } from 'rsvp';
import { once } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';

export const NEW_VOLUME = 'newVolume';
export const VOLUME = 'volume';
export const BIND_MOUNT = 'bindMount';
export const TMPFS = 'tmpfs';
export const CUSTOM = 'custom';

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
    this.sendAction('registerHook', this.savePvcs.bind(this), {name: 'savePvcs', key: '_volumeHooks'});
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },

// Create (ephermal) Volume -> volume entry on pod
// Create PVC for existing (persistent) volume
// Create PVC for a new volume via storageclass
// Use an existing PVC (from the project volumes page)
// Bind-mount (ephemeral volume -> hostPath)
// Tempfs (ephemeral volume -> emptyDir -> backing=memory)

// Create Vol:       {mode: 'newVolume',   volume: [obj],   mountPoint: '/foo', opts: 'rw'}
// Use Vol:          {mode: 'volume',      volume: [obj],   mountPoint: '/foo', opts: 'rw'}
// Bind:             {mode: 'bindMount',   hostPath: '/foo', mountPoint: '/bar', opts: 'rw'}
// Tempfs:           {mode: 'tmpfs', mountPoint: '/foo', opts: 'rw,size=10000k'}
// Custom:           {mode: 'custom', str: 'blah:/blah:rw,z,nocopy'}
//
// Kind   Source    Mount Point  Access
//
  actions: {
    remove(obj) {
      this.get('volumesArray').removeObject(obj);
    },

    addNewVolume() {
      this.get('modalService').toggleModal('modal-new-volume', {
        callback: (volume) => {
          this.get('volumesArray').pushObject({
            mode: NEW_VOLUME,
            volume: volume,
            mountPoint: '',
            opts: 'rw',
          });
        },
      });
    },

    addVolume() {
      this.get('volumesArray').pushObject({
        mode: VOLUME,
        volume: null,
        mountPoint: '',
        opts: 'rw',
      });
    },

    addBindMount() {
      this.get('volumesArray').pushObject({
        mode: BIND_MOUNT,
        hostPath: '',
        mountPoint: '',
        opts: 'rw',
      });
    },

    addTmpfs() {
      this.get('volumesArray').pushObject({
        mode: TMPFS,
        mountPoint: '',
        opts: 'size=200m,rw,noexec,nosuid',
      });
    },

    addCustom() {
      this.get('volumesArray').pushObject({
        mode: CUSTOM,
        str: ''
      });
    },
  },

  hasSidekicks: function() {
    return this.get('isSidekick') || this.get('workloads.containers.length') > 1;
  }.property('isSidekick','workload.containers.length'),

  savePvcs() {
    return resolve();
  },
});
