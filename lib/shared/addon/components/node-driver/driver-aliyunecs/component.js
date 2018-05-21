import { alias } from '@ember/object/computed';
import { set, get, observer, setProperties, computed } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import { Promise as EmberPromise } from 'rsvp';

const ENDPOINT = 'https://ecs.aliyuncs.com';
const PAGE_SIZE = 50;
const NONE_OPT_DISK = [{
  value: 'cloud'
}];

const OPT_DISK = [{
    value: 'cloud_efficiency'
  },
  {
    value: 'cloud_ssd'
  }
];

const DEFAULT_INSTANCE_TYPE = 'ecs.s2.large';

export default Component.extend(NodeDriver, {
  layout,

  intl: service(),
  settings: service(),

  driverName: 'aliyunecs',
  config: alias('model.aliyunecsConfig'),

  zones: null,
  regions: null,
  securityGroups: null,
  images: null,
  instanceTypes: null,

  ecsClient: null,
  step: 1,

  bootstrap: function () {
    const config = get(this, 'globalStore').createRecord({
      type: 'aliyunecsConfig',
      accessKeySecret: '',
      ioOptimized: 'optimized',
    });

    set(this, 'model.aliyunecsConfig', config);
    set(this, 'model.engineRegistryMirror', ['https://s06nkgus.mirror.aliyuncs.com']);
    set(this, 'model.engineInstallURL', 'http://dev-tool.oss-cn-shenzhen.aliyuncs.com/docker-install/1.13.1.sh');
  },

  actions: {
    alyLogin: function (cb) {
      setProperties(this, {
        'errors': null,
        'config.accessKeyId': (get(this, 'config.accessKeyId') || '').trim(),
        'config.accessKeySecret': (get(this, 'config.accessKeySecret') || '').trim(),
      });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const accessKey = get(this, 'config.accessKeyId');
      const accessSecret = get(this, 'config.accessKeySecret');

      if (!accessKey) {
        errors.push(intl.t('nodeDriver.aliyunecs.errors.accessKeyRequired'));
      }

      if (!accessSecret) {
        errors.push(intl.t('nodeDriver.aliyunecs.errors.accessSecretRequired'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();
        return;
      }

      let ecs;

      try {
        const location = window.location;
        let endpoint = get(this, 'config.apiEndpoint') ? get(this, 'config.apiEndpoint') : ENDPOINT;
        endpoint = get(this,'app.proxyEndpoint') + '/' + endpoint.replace('//', '/');
        endpoint = `${location.protocol}//${window.location.host}${endpoint}`;

        ecs = new ALY.ECS({
          accessKeyId: get(this, 'config.accessKeyId'),
          secretAccessKey: get(this, 'config.accessKeySecret'),
          apiVersion: '2014-05-26',
          endpoint,
        });

        ecs.describeRegions({}, (err, res) => {
          if (err) {
            let errors = get(this, 'errors') || [];
            errors.pushObject(err.message || err);
            set(this, 'errors', errors);
            cb();
            return;
          }

          set(this, 'ecsClient', ecs);
          set(this, 'regions', res.Regions.Region.map((region) => {
            return {
              value: region.RegionId,
              label: region.LocalName,
            };
          }));
          this.regionDidChange();
          set(this, 'step', 2);
          cb();
        });
      } catch (err) {
        const errors = get(this, 'errors') || [];
        errors.pushObject(err.message || err);
        set(this, 'errors', errors);
        cb();
        return;
      }
    },

    loadStorageTypes: function (cb) {
      set(this, 'errors', null);

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const zone = get(this, 'config.zone');
      const vpcId = get(this, 'config.vpcId');
      const vswitchId = get(this, 'config.vswitchId')

      if ( zone ) {
        if ( !vpcId ) {
          errors.push(intl.t('nodeDriver.aliyunecs.errors.vpcIdRequired'));
        } 
        if ( !vswitchId ) {
          errors.push(intl.t('nodeDriver.aliyunecs.errors.vswitchIdRequired'));
        }
      }

      if ( errors.length > 0 ) {
        set(this, 'errors', errors);
        cb();
        return;
      }

      if (!get(this, 'config.securityGroup')) {
        set(this, 'config.securityGroup', 'docker-machine')
      }
      set(this, 'step', 3);
      this.diskCategoryChoicesDidChange();
      cb();
    },

    loadInstanceTypes: function (cb) {
      this.fetch('Image', 'Images')
        .then((images) => {
          set(this, 'images', images.filter((image) => {
           return image.raw.OSType === 'linux' &&
             ((this, 'config.ioOptimized') === 'none' || image.raw.IsSupportIoOptimized); 
          }).map((image) => {
            return {
              label: image.raw.ImageOwnerAlias === 'system' ? image.raw.OSName : image.raw.ImageName,
              value: image.value,
              raw: image.raw,
            }
          }));
          set(this, 'config.imageId', get(this, 'images.firstObject.value'));
          this.fetch('InstanceType', 'InstanceTypes')
            .then((instanceTypes) => {
              set(this, 'instanceTypes', instanceTypes.map((instanceType) => {
                return {
                  group: instanceType.raw.InstanceTypeFamily,
                  value: instanceType.value,
                  label: `${instanceType.raw.InstanceTypeId} ( ${instanceType.raw.CpuCoreCount} ${instanceType.raw.CpuCoreCount > 1 ? 'Cores': 'Core'} ${instanceType.raw.MemorySize}GB RAM )`,
                }
              }));

              let instanceType;

              if ( (get(this, 'instanceTypes').findBy('value', DEFAULT_INSTANCE_TYPE)) ) {
                instanceType = DEFAULT_INSTANCE_TYPE;
              } else {
                instanceType = get(this, 'instanceTypes.firstObject.value');
              }

              set(this, 'config.instanceType', instanceType);
              set(this, 'step', 4);
              cb();
            })
            .catch((err) => {
              const errors = get(this, 'errors') || [];
              errors.pushObject(err.message || err);
              set(this, 'errors', errors);
              cb();
              return;
            });
        })
        .catch((err) => {
          const errors = get(this, 'errors') || [];
          errors.pushObject(err.message || err);
          set(this, 'errors', errors);
          cb();
          return;
        });
    },
  },

  filteredVSwitches: computed('vswitches.[]', 'config.zone', function() {
    const zone = get(this, 'config.zone');
    return (get(this, 'vswitches') || []).filter((swith) => {
      if ( zone && zone !== swith.raw.ZoneId) {
        return false;
      }
      return true;
    });
  }),

  zoneDidChange: observer('config.zone', function () {
    const switches = get(this, 'filteredVSwitches');
    const selectedVSwitch = get(this, 'config.vswitchId');
    if (selectedVSwitch) {
      const found = switches.findBy('VSwitchId', selectedVSwitch);
      if (!found) {
        set(this, 'config.vswitchId', null);
      }
    }
  }),

  vpcDidChange: observer('config.vpcId', function () {
    const vpcId = get(this, 'config.vpcId');
    if (vpcId) {
      this.fetch('VSwitch', 'VSwitches').then((vswitches) => {
        set(this, 'vswitches', vswitches);
        const selectedVSwitch = get(this, 'config.vswitchId');
        if (selectedVSwitch) {
          const found = vswitches.findBy('VSwitchId', selectedVSwitch);
          if (!found) {
            set(this, 'config.vswitchId', null);
          }
        }
      });

      this.fetch('SecurityGroup', 'SecurityGroups').then((securityGroups) => {
        set(this, 'securityGroups', securityGroups);
        const selectedSecurityGroup = get(this, 'config.securityGroup');
        if (selectedSecurityGroup) {
          const found = securityGroups.findBy('SecurityGroupId', selectedSecurityGroup);
          if (!found) {
            set(this, 'config.securityGroup', 'docker-machine');
          }
        }
      });
    } else {
      set(this, 'config.vswitchId', null);
      set(this, 'config.securityGroup', 'docker-machine');
    }
  }),

  regionDidChange: observer('config.region', function () {
    const region = get(this, 'config.region');
    if (region) {
      this.fetch('Vpc', 'Vpcs').then((vpcs) => {
        set(this, 'vpcs', vpcs);
        const selectedVPC = get(this, 'config.vpcId');
        if (selectedVPC) {
          const found = vpcs.findBy('VpcId', selectedVPC);
          if (!found) {
            set(this, 'config.vpcId', null);
          }
        }
      });

      this.fetch('Zone', 'Zones').then((zones) => {
        set(this, 'zones', zones);
        const selectedZone = get(this, 'config.zone');
        if (selectedZone) {
          const found = zones.findBy('ZoneId', selectedZone);
          if (!found) {
            set(this, 'config.zone', null);
          }
        }
      });
    }
  }),

  diskCategoryChoices: computed('config.ioOptimized', function () {
    return get(this, 'config.ioOptimized') === 'none' ? NONE_OPT_DISK : OPT_DISK;
  }),

  diskCategoryChoicesDidChange: observer('diskCategoryChoices.@each.value', function () {
    set(this, 'config.systemDiskCategory', get(this, 'diskCategoryChoices.firstObject.value'));
    set(this, 'config.diskCategory', get(this, 'diskCategoryChoices.firstObject.value'));
  }),

  validate: function () {
    this._super();
    const errors = get(this, 'model').validationErrors();

    const intl = get(this, 'intl');

    const name = get(this, 'model.name');

    const sshPassword = get(this, 'config.sshPassword');

    const lower = /[a-z]/.test(sshPassword) ? 1 : 0;
    const upper = /[A-Z]/.test(sshPassword) ? 1 : 0;
    const number = /[0-9]/.test(sshPassword) ? 1 : 0;
    const special = /[?+*$^().|<>';:\-=\[\]\{\},&%#@!~`\\]/.test(sshPassword) ? 1 : 0;

    if (!name) {
      errors.push('Name is required');
    }

    if (sshPassword && (sshPassword.length < 8) || sshPassword.length > 30) {
      errors.push(intl.t('nodeDriver.aliyunecs.errors.sshPasswordLengthNotValid'));
    }

    if (sshPassword && !/[?+*$^().|<>';:\-=\[\]\{\},&%#@!~`\\a-zA-Z0-9]+/.test(sshPassword)) {
      errors.push(intl.t('nodeDriver.aliyunecs.errors.sshPasswordInvalidCharacter'));
    }

    if (sshPassword && (lower + upper + number + special < 3)) {
      errors.push(get(this, 'intl').t('nodeDriver.aliyunecs.errors.sshPasswordFormatError'));
    }

    set(this, 'errors', errors);
    return errors.length === 0;
  },

  fetch: function (resource, plural, page = 1) {
    const ecs = get(this, 'ecsClient');
    const region = get(this, 'config.region');
    const results = [];
    let params = {
      PageSize: PAGE_SIZE,
      PageNumber: page,
    };

    switch (resource) {
      case 'InstanceType':
        params = {};
        break;
      case 'VSwitch':
        params.VpcId = get(this, 'config.vpcId');
        break;
      case 'SecurityGroup':
        params.VpcId = get(this, 'config.vpcId');
        params.RegionId = region;
        break;
      case 'Zone':
        params = {
          RegionId: region,
        };
        break;
      default:
        params.RegionId = region;
    }

    return new EmberPromise((resolve, reject) => {
      ecs[`describe${plural}`](params, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        const current = res[`${plural}`][resource];
        results.pushObjects(current.map((item) => {
          return {
            label: item[`${resource}Id`],
            value: item[`${resource}Id`],
            raw: item,
          };
        }));

        if (res.TotalCount > ((PAGE_SIZE * (page - 1)) + current.length)) {
          return this.fetch(resource, plural, page + 1)
            .then((array) => {
              results.pushObjects(array);
              resolve(results);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          resolve(results);
        }
      });
    });
  },
});
