import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { Promise } from 'rsvp';
import { equal } from '@ember/object/computed'

const ENDPOINT = 'ecs.aliyuncs.com';
const PAGE_SIZE = 50;
const K8S_1_11_5 = '1.11.5';
const K8S_1_12_6_1 = '1.12.6-aliyun.1';

const VERSIONS = [
  {
    value: K8S_1_12_6_1,
    label: K8S_1_12_6_1
  },
  {
    value: K8S_1_11_5,
    label: K8S_1_11_5
  }
];
const MANAGED_VERSIONS = [
  {
    value: K8S_1_12_6_1,
    label: K8S_1_12_6_1
  }
];
const KUBERNETES = 'Kubernetes';
const MANAGED = 'ManagedKubernetes'

const DISKS = [
  {
    label: 'clusterNew.aliyunkcs.disk.ssd',
    value: 'cloud_ssd'
  },
  {
    label: 'clusterNew.aliyunkcs.disk.efficiency',
    value: 'cloud_efficiency'
  }
];

const CLUSTER_TYPES = [
  {
    label: 'clusterNew.aliyunkcs.clusters.k8s',
    value: KUBERNETES
  },
  {
    label: 'clusterNew.aliyunkcs.clusters.managed',
    value: MANAGED
  }
];

const REGIONS = [
  {
    label: 'cn-qingdao',
    value: 'cn-qingdao',
  }, {
    label:   'cn-beijing',
    value:   'cn-beijing',
    managed: true,
  }, {
    label: 'cn-zhangjiakou',
    value: 'cn-zhangjiakou'
  }, {
    label:   'cn-shanghai',
    value:   'cn-shanghai',
    managed: true,
  }, {
    label: 'cn-shenzhen',
    value: 'cn-shenzhen'
  }, {
    label:   'cn-hangzhou',
    value:   'cn-hangzhou',
    managed: true,
  }, {
    label: 'cn-hongkong',
    value: 'cn-hongkong'
  }, {
    label: 'cn-huhehaote',
    value: 'cn-huhehaote'
  }, {
    label: 'ap-northeast-1',
    value: 'ap-northeast-1'
  }, {
    label:   'ap-south-1',
    value:   'ap-south-1',
    managed: true,
  }, {
    label:   'ap-southeast-1',
    value:   'ap-southeast-1',
    managed: true,
  }, {
    label: 'ap-southeast-2',
    value: 'ap-southeast-2'
  }, {
    label:   'ap-southeast-5',
    value:   'ap-southeast-5',
    managed: true,
  }, {
    label: 'us-east-1',
    value: 'us-east-1'
  }, {
    label: 'us-west-1',
    value: 'us-west-1'
  }, {
    label: 'me-east-1',
    value: 'me-east-1'
  }, {
    label: 'eu-central-1',
    value: 'eu-central-1'
  }, {
    label:   'ap-southeast-3',
    value:   'ap-southeast-3',
    managed: true,
  }];

export default Component.extend(ClusterDriver, {
  intl:         service(),
  layout,
  configField:  'aliyunEngineConfig',
  aliyunClient: null,

  step:                  1,
  regionChoices:         REGIONS,
  versionChoices:        VERSIONS,
  managedVersionChoices: MANAGED_VERSIONS,
  diskChoices:           DISKS,
  storageDiskChoices:    null,
  zoneChoices:           null,
  vpcChoices:            null,
  sgChoices:             null,
  keyChoices:            null,
  allSubnets:            null,
  allInstances:          null,

  editing:               equal('mode', 'edit'),
  isNew:                 equal('mode', 'new'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.aliyunEngineConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:                     'aliyunEngineConfig',
        accessKeyId:              null,
        accessKeySecret:          null,
        regionId:                 'cn-beijing',
        clusterType:              KUBERNETES,
        kubernetesVersion:        K8S_1_11_5,
        zoneId:                   null,
        snatEntry:                true,
        publicSlb:                true,
        masterSystemDiskSize:     120,
        masterSystemDiskCategory: 'cloud_efficiency',
        masterInstanceType:       'ecs.n1.large',
        workerSystemDiskSize:     120,
        workerSystemDiskCategory: 'cloud_efficiency',
        workerDataDiskSize:       120,
        workerDataDiskCategory:   'cloud_efficiency',
        workerInstanceType:       'ecs.n1.large',
        numOfNodes:               3,
        workerDataDisk:           true,
        keyPair:                  null,
      });

      set(this, 'cluster.aliyunEngineConfig', config);
    }
  },

  actions: {
    aliyunLogin(cb) {
      setProperties(this, {
        'errors':                 null,
        'config.accessKeyId':     (get(this, 'config.accessKeyId') || '').trim(),
        'config.accessKeySecret':   (get(this, 'config.accessKeySecret') || '').trim(),
      });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const accessKeyId = get(this, 'config.accessKeyId');
      const accessKeySecret = get(this, 'config.accessKeySecret');

      if ( !accessKeyId ) {
        errors.push(intl.t('clusterNew.aliyunkcs.accessKeyId.required'));
      }

      if ( !accessKeySecret ) {
        errors.push(intl.t('clusterNew.aliyunkcs.accessKeySecret.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      return this.fetch('Zone', 'Zones').then((zones) => {
        set(this, 'zoneChoices', zones.sortBy('label'));
        if ( !get(this, 'config.zoneId') && get(this, 'zoneChoices.length') ) {
          set(this, 'config.zoneId', get(this, 'zoneChoices.firstObject.value'));
        }

        set(this, 'step', 2);
        cb(true);
      }).catch(() => {
        cb(false);
      });
    },

    configMaster(cb) {
      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const zoneId = get(this, 'config.zoneId');

      if ( !zoneId ) {
        errors.push(intl.t('clusterNew.aliyunkcs.zoneId.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }
      this.setInstances();

      const instances = get(this, 'selectedZone.raw.AvailableInstanceTypes.InstanceTypes');

      const found = instances.indexOf(get(this, 'config.masterInstanceType'));

      if ( !found ) {
        set(this, 'config.masterInstanceType', null);
      }

      set(this, 'step', 3);
      cb(true);
    },

    configWorker(cb) {
      this.setInstances();
      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const masterInstanceType = get(this, 'config.masterInstanceType');

      if ( !masterInstanceType && get(this, 'config.clusterType') === KUBERNETES ) {
        errors.push(intl.t('clusterNew.aliyunkcs.instanceType.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      const instances = get(this, 'selectedZone.raw.AvailableInstanceTypes.InstanceTypes');
      const found = instances.indexOf(get(this, 'config.workerInstanceType')) > -1;

      if ( !found ) {
        set(this, 'config.workerInstanceType', null);
      }

      return this.fetch('KeyPair', 'KeyPairs').then((keyChoices) => {
        set(this, 'keyChoices', keyChoices);
        if ( !get(this, 'config.keyPair') && get(this, 'keyChoices.length') ) {
          set(this, 'config.keyPair', get(this, 'keyChoices.firstObject.value'));
        }
        set(this, 'step', 4);
        cb(true);
      }).catch(() => {
        cb(false);
      });
    },

    save(cb) {
      setProperties(this, { 'errors': null });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const keyPair = get(this, 'config.keyPair');

      const workerInstanceType = get(this, 'config.workerInstanceType');

      if ( !workerInstanceType ) {
        errors.push(intl.t('clusterNew.aliyunkcs.instanceType.required'));
      }

      if ( !keyPair ) {
        errors.push(intl.t('clusterNew.aliyunkcs.keyPair.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      this.send('driverSave', cb);
    }
  },

  clusterNameDidChange: observer('cluster.name', function() {
    setProperties(this, {
      'config.name':        get(this, 'cluster.name'),
      'config.displayName': get(this, 'cluster.name')
    })
  }),

  clusterTypeDidChange: observer('config.clusterType', function() {
    if ( get(this, 'config.clusterType') === KUBERNETES  ) {
      set(this, 'config.kubernetesVersion', get(VERSIONS, 'firstObject.value'));
    } else {
      set(this, 'config.kubernetesVersion', get(MANAGED_VERSIONS, 'firstObject.value'));
    }
  }),

  minNumOfNodes: computed('config.clusterType', function() {
    return get(this, 'config.clusterType') === KUBERNETES ? 0 : 2;
  }),

  selectedZone: computed('config.zoneId', 'zoneChoices', function() {
    const zoneChoices = get(this, 'zoneChoices') || [];

    return zoneChoices.findBy('value', get(this, 'config.zoneId'));
  }),

  clusterTypeChoices: computed('config.regionId', 'zoneChoices', function() {
    const region = REGIONS.findBy('value', get(this, 'config.regionId'));

    if ( region && get(region, 'managed') ) {
      return CLUSTER_TYPES;
    } else {
      return CLUSTER_TYPES.filter((type) => get(type, 'value') !== MANAGED);
    }
  }),

  setInstances() {
    const instances = get(this, 'selectedZone.raw.AvailableInstanceTypes.InstanceTypes');

    set(this, 'instanceChoices', instances.map((i) => {
      const g = i.split('.')[1];

      return {
        group: g,
        label: i,
        value: i
      }
    }));
  },

  fetch(resource, plural, page = 1) {
    set(this, 'errors', []);
    let ecs = get(this, 'ecsClient');

    if ( !ecs ) {
      ecs = new ALY.ECS({
        accessKeyId:     get(this, 'config.accessKeyId'),
        secretAccessKey: get(this, 'config.accessKeySecret'),
        apiVersion:      '2014-05-26',
        endpoint:        `${ window.location.origin }/meta/proxy/https:/${ ENDPOINT }`,
      });
    }

    const region = get(this, 'config.regionId');
    const results = [];
    let params = {
      PageSize:   PAGE_SIZE,
      PageNumber: page,
    };
    let resultKey = 'Id'

    switch (resource) {
    case 'Zone':
      params = { RegionId: region, };
      break;
    case 'KeyPair':
      params = { RegionId: region, };
      resultKey = 'Name'
      break;
    default:
      params.RegionId = region;
    }

    return new Promise((resolve, reject) => {
      ecs[`describe${ plural }`](params, (err, res) => {
        if (err) {
          reject(err);
          let errors = get(this, 'errors') || [];

          errors.pushObject(err.message || err);
          set(this, 'errors', errors);

          return;
        }

        const current = res[`${ plural }`][resource];

        if ( !get(this, 'ecsClient') ) {
          set(this, 'ecsClient', ecs);
        }

        results.pushObjects(current.map((item) => {
          return {
            label: item[`${ resource }${ resultKey }`],
            value: item[`${ resource }${ resultKey }`],
            raw:   item,
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
