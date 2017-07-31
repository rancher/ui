import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';
import { parseVolumeSpec, stringifyVolumeSpec } from 'ui/utils/parse-volume';

export const NEW_VOLUME = 'newVolume';
export const VOLUME = 'volume';
export const BIND_MOUNT = 'bindMount';
export const FROM_CONTAINER = 'volumesFrom';
export const FROM_LAUNCH_CONFIG = 'volumesFromLaunchConfig';
export const CUSTOM = 'custom';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  projects: Ember.inject.service(),

  // Inputs
  launchConfig: null,
  service: null,
  isService: null,
  errors: null,

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
    (this.get('launchConfig.dataVolumes')||[]).forEach((str) => {
      let spec = parseVolumeSpec(str);

      if ( spec.get('isBindMount') ) {
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

    if ( this.get('isService') ) {
      // Volumes from Launch Config
      (this.get('launchConfig.volumesFromLaunchConfig')||[]).forEach((name) => {
        ary.push({
          mode: FROM_LAUNCH_CONFIG,
          launchConfig: name
        });
      });
    } else {
      // Volumes from another Container
      (this.get('launchConfig.volumesFrom')||[]).forEach((id) => {
        let inst = store.getById('instance', id);
        if ( inst ) {
          ary.push({
            mode: FROM_CONTAINER,
            instance: inst,
          });
        }
      });
    }


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
// From Container:   {mode: 'volumesFrom', instance: [obj]}
// From LaunchConfig:{mode: 'volumesFromLaunchConfig', launchConfig: 'sk'}
// Custom:           {mode: 'custom', str: 'blah:/blah:rw,z,nocopy'}
//
// Kind   Source    Mount Point  Access
//
  actions: {
    remove(obj) {
      this.get('volumesArray').removeObject(obj);
    },

    addNewVolume() {
      this.get('volumesArray').pushObject({
        mode: NEW_VOLUME,
        volume: null,
        mountPoint: '',
        opts: 'rw',
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

    addVolumesFromContainer() {
      this.get('volumesArray').pushObject({
        mode: FROM_CONTAINER,
        instance: null,
      });
    },

    addVolumesFromLaunchConfig() {
      this.get('volumesArray').pushObject({
        mode: FROM_LAUNCH_CONFIG,
        launchConfig: null,
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
    Ember.run.once(this,'updateInstance');
  }.observes('volumesArray.@each.{volume,hostPath,mountPoint,launchConfig,str,opts}'),

  updateInstance() {
    let volumes = [];
    let dataVolumesFrom = [];
    let dataVolumesFromLaunchConfigs = [];

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
          volumes.push(stringifyVolumeSpec(spec));
        }
        break;
      case BIND_MOUNT:
        if ( row.mountPoint ) {
          spec = {
            source: row.hostPath,
            dest: row.mountPoint,
            opts: row.opts
          };
          volumes.push(stringifyVolumeSpec(spec));
        }
        break;
      case FROM_CONTAINER:
        if ( row.instance ) {
          dataVolumesFrom.push(row.instance.id);
        }
        break;
      case FROM_LAUNCH_CONFIG:
        if ( row.launchConfig ) {
          dataVolumesFromLaunchConfigs.push(row.launchConfig);
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

    this.get('launchConfig').setProperties({
      volumes,
      dataVolumesFrom,
      dataVolumesFromLaunchConfigs
    });
  },

  validate: function() {
    var errors = [];

    this.get('volumesArray').forEach((row) => {
      switch ( row.mode ) {
        case NEW_VOLUME:
          break;
        case VOLUME:
          break;
        case BIND_MOUNT:
          break;
        case FROM_CONTAINER:
          break;
        case FROM_LAUNCH_CONFIG:
          break;
        case CUSTOM:
          break;
      }
    });

    this.set('errors', errors.uniq());
  }.observes('volumesArray.@each.value', 'instance.volumeDriver'),

  hasCustom: function() {
    return !!this.get('volumesArray').findBy('mode', CUSTOM);
  }.property('volumesArray.@each.mode'),

  hasSidekicks: function() {
    return this.get('isSidekick') || !!this.get('service.secondaryLaunchConfigs.length');
  }.property('isSidekick','service.secondaryLaunchConfigs.length'),

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
    let count = (this.get('instance.dataVolumes.length') || 0) +
                (this.get('instance.dataVolumesFrom.length') || 0) +
                (this.get('instance.dataVolumesFromLaunchConfigs.length') || 0);

    if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('instance.{dataVolumes,dataVolumesFrom,dataVolumesFromLaunchConfigs}.length','errors.length'),
});
