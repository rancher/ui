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
  errors: null,
  editing: true,

  volumesArray: null,

  init() {
    console.log('init form-volumes');
    this._super(...arguments);
    this.set('allStoragePools', this.get('store').all('storagepool'));
    this.initVolumes();
  },

  initVolumes() {
    let store = this.get('store');
    let allVolumes = store.all('volume');
    let allTemplates = store.all('volumetemplate');

    let ary = [];
    (this.get('workload.volumes')||[]).forEach((spec) => {
      if ( spec.get('hostPath') ) {
        // Bind mount
        ary.push({
          mode: BIND_MOUNT,
          hostPath: spec.source,
          mountPoint: spec.dest,
          opts: spec.opts
        });
      } else {
        // Reference to volume or volumeTemplate
        let volume = allTemplates.findBy('name', spec.source) || allVolumes.findBy('name', spec.source);
        if ( volume ) {
          ary.push({
            mode: VOLUME,
            volume: volume,
            mountPoint: spec.dest,
            opts: spec.opts
          });
        } else {
          ary.push({
            mode: CUSTOM,
            str: str,
          });
        }
      }
    });

    // Tmpfs
    //let tmpfs = this.get('launchConfig.tmpfs')||{};
    //Object.keys(tmpfs).forEach((path) => {
    //  ary.push({
    //    mode: TMPFS,
    //    mountPoint: path,
    //    opts: tmpfs[path]
    //  });
    //});

    this.set('volumesArray', ary);
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },

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

  shouldUpdate: function() {
    once(this,'updateInstance');
  }.observes('volumesArray.@each.{volume,hostPath,mountPoint,str,opts}'),

  updateInstance() {
    let volumesToCreate = [];
    let volumes = [];
    let tmpfs = {};

    let spec;
    this.get('volumesArray').forEach((row) => {
      switch ( row.mode ) {
      case NEW_VOLUME:
      case VOLUME:
        if ( row.volume && row.mountPoint ) {
          spec = {
            source: row.volume.name,
            dest: row.mountPoint,
            opts: row.opts
          }
          volumes.push(spec);

          if ( !row.volume.id ) {
            volumesToCreate.push(row.volume);
          }
        }
        break;
      case BIND_MOUNT:
        if ( row.mountPoint ) {
          spec = {
            type: 'volume',
            hostPath: {
              type: 'hostPathVolumeSource',
              path: row.hostPath,
              type: ''
            },
            dest: row.mountPoint,
          };
          volumes.push(spec);
        }
        break;
      case TMPFS:
        if ( row.mountPoint ) {
          tmpfs[row.mountPoint] = row.opts;
        }
        break;
      case CUSTOM:
        spec = (row.str||'').trim();
        if ( spec ) {
          volumes.push(spec);
        }
        break;
      }
    });

    this.set('volumesToCreate', volumesToCreate);
    this.get('launchConfig').set('volumes', volumes);
  },

  validate: function() {
    var errors = [];
    let intl = this.get('intl');

    this.get('volumesArray').forEach((row) => {

      // Incomplete
      if ( row.mode === NEW_VOLUME || row.mode === VOLUME ) {
        if ( (row.volume && !row.mountPoint) || (!row.volume && row.mountPoint) ) {
          errors.push(intl.t('formVolumes.errors.incomplete'));
        }
      } else if ( row.mode === BIND_MOUNT ) {
        if ( (row.hostPath && !row.mountPoint) || (!row.hostPath && row.mountPoint) ) {
          errors.push(intl.t('formVolumes.errors.incomplete'));
        }
      }

      // Bad mount
      if ( [NEW_VOLUME, VOLUME, BIND_MOUNT, TMPFS].includes(row.mode) ) {
        if ( row.mountPoint && row.mountPoint.substr(0,1) !== '/' ) {
          errors.push(intl.t('formVolumes.errors.absoluteMountPoint'));
        }
      }
    });

    this.set('errors', errors.uniq());
  }.observes('volumesArray.@each.{volume,hostPath,mountPoint}', 'instance.volumeDriver'),

  hasCustom: function() {
    return !!this.get('volumesArray').findBy('mode', CUSTOM);
  }.property('volumesArray.@each.mode'),

  hasSidekicks: function() {
    return this.get('isSidekick') || this.get('workloads.containers.length') > 1;
  }.property('isSidekick','workload.containers.length'),

  driverChoices: function() {
    let drivers = this.get('allStoragePools')
      .map((x) => x.get('driverName'))
      .filter((x) => !!x)
      .uniq().sort();

    return {
      [this.get('intl').t('formVolumes.volumeDriver.suggestion')]: drivers,
    };
  }.property('allStoragePools.@each.driverName','intl.locale'),

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = (this.get('instance.volumes.length') || 0);

    if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('workload.volumes.length','errors.length'),
});
