import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { resolve, reject, all } from 'rsvp';
import { equal } from '@ember/object/computed'

const ENDPOINT = 'tencentcloudapi.com/';
const CCS_ENDPOINT = 'api.qcloud.com/v2/index.php';

const DATA_DISK = 'DATA_DISK'
const SYSTEM_DISK = 'SYSTEM_DISK'

const OS = [
  {
    label: 'Ubuntu Server 16.04.1 LTS 64bit',
    value: 'ubuntu16.04.1 LTSx86_64'
  },
  {
    label: 'CentOS 7.2 64bit',
    value: 'centos7.2x86_64'
  }
]

const REGIONS = [
  {
    label: 'ap-guangzhou',
    value: 'ap-guangzhou'
  }, {
    label: 'ap-shanghai',
    value: 'ap-shanghai'
  }, {
    label: 'ap-beijing',
    value: 'ap-beijing'
  }, {
    label: 'ap-hongkong',
    value: 'ap-hongkong'
  }, {
    label: 'ap-singapore',
    value: 'ap-singapore'
  }, {
    label: 'ap-chengdu',
    value: 'ap-chengdu'
  }, {
    label: 'ap-mumbai',
    value: 'ap-mumbai'
  }, {
    label: 'ap-tokyo',
    value: 'ap-tokyo'
  }, {
    label: 'ap-bangkok',
    value: 'ap-bangkok'
  }, {
    label: 'na-siliconvalley',
    value: 'na-siliconvalley'
  }, {
    label: 'na-ashburn',
    value: 'na-ashburn'
  }, {
    label: 'eu-moscow',
    value: 'eu-moscow'
  }, {
    label: 'eu-frankfurt',
    value: 'eu-frankfurt'
  }];

const VERSIONS = [
  {
    label: '1.10.5',
    value: '1.10.5'
  },
  {
    label: '1.12.4',
    value: '1.12.4'
  },
  {
    label: '1.14.3',
    value: '1.14.3'
  },
  {
    label: '1.16.3',
    value: '1.16.3'
  },
];

const BAND_WIDTH = [
  {
    label: 'clusterNew.tencenttke.bandwidthType.hour',
    value: 'PayByHour'
  },
  {
    label: 'clusterNew.tencenttke.bandwidthType.traffic',
    value: 'PayByTraffic'
  }
];

export default Component.extend(ClusterDriver, {
  intl:        service(),
  layout,
  configField: 'tencentEngineConfig',

  step:               1,
  regionChoices:      REGIONS,
  versionChoices:     VERSIONS,
  osChoices:          OS,
  bandWidthChoices:   BAND_WIDTH,
  zoneChoices:        null,
  vpcChoices:         null,
  sgChoices:          null,
  keyChoices:         null,
  allSubnets:         null,
  allInstances:       null,

  isNew:   equal('mode', 'new'),
  editing: equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.tencentEngineConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:           'tencentEngineConfig',
        clusterCidr:    '172.16.0.0/16',
        clusterVersion: get(VERSIONS, 'lastObject.value'),
        region:         'ap-guangzhou',
        secretId:       null,
        secretKey:      null,
        zoneId:         null,
        vpcId:          null,
        subnetId:       null,
        instanceType:   'S2.MEDIUM4',
        osName:         'ubuntu16.04.1 LTSx86_64',
        sgId:           null,
        rootSize:       100,
        storageSize:    100,
        cvmType:        'PayByHour',
        wanIp:          1,
        isVpcGateway:   0,
        emptyCluster:   false,
        bandwidthType:  'PayByHour',
        bandwidth:      10,
        keyId:          null,
        nodeCount:       1,
      });

      set(this, 'cluster.tencentEngineConfig', config);
    }
  },

  actions: {
    tencentLogin(cb) {
      setProperties(this, {
        'errors':           null,
        'config.secretId':  (get(this, 'config.secretId') || '').trim(),
        'config.secretKey': (get(this, 'config.secretKey') || '').trim(),
      });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const secretId = get(this, 'config.secretId');
      const secretKey = get(this, 'config.secretKey');

      if ( !secretId ) {
        errors.push(intl.t('clusterNew.tencenttke.secretId.required'));
      }

      if ( !secretKey ) {
        errors.push(intl.t('clusterNew.tencenttke.secretKey.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      return all([
        this.fetchVpcs(),
        this.fetchSubnets()
      ]).then(() => {
        set(this, 'step', 2);
        cb(true);
      }).catch(() => {
        cb(false);
      });
    },

    loadNodeConfig(cb) {
      setProperties(this, { 'errors': null });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const {
        clusterCidr, vpcId, nodeCount
      } = get(this, 'config');

      if ( !clusterCidr ) {
        errors.push(intl.t('clusterNew.tencenttke.cidr.required'));
      }

      if ( !vpcId ) {
        errors.push(intl.t('clusterNew.tencenttke.vpc.required'));
      }

      if ( !nodeCount ) {
        errors.push(intl.t('clusterNew.tencenttke.nodeCount.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      return this.checkCidr().then((res) => {
        if (get(res, 'code') === 0 ) {
          all([
            this.fetchZones(),
            this.fetchNodeTypes(),
          ]).then(() => {
            set(this, 'step', 3);
            cb(true);
          }).catch(() => {
            cb(false);
          });
        } else {
          const error = decodeURIComponent(get(res, 'message'));

          if ( error )  {
            set(this, 'errors', [error]);
          }
          cb(false);
        }
      }).catch((error) => {
        set(this, 'errors', [error]);

        cb(false);
      });
    },

    loadInstanceConfig(cb) {
      setProperties(this, { 'errors': null });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const { zoneId, subnetId } = get(this, 'config');

      if ( !zoneId ) {
        errors.push(intl.t('clusterNew.tencenttke.zone.required'));
      }

      if ( !subnetId ) {
        errors.push(intl.t('clusterNew.tencenttke.subnet.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      return all([
        this.fetchSecurityGroups(),
        this.fetchKeyPairs(),
        this.fetchDiskConfigQuota(),
      ]).then(() => {
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

      const { sgId, keyId } = get(this, 'config') ;

      if ( !sgId ) {
        errors.push(intl.t('clusterNew.tencenttke.securityGroup.required'));
      }

      if ( !keyId ) {
        errors.push(intl.t('clusterNew.tencenttke.keyPair.required'));
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
    set(this, 'config.clusterName', get(this, 'cluster.name'));
  }),

  subnetIdObserver: observer('selectedZone', 'allSubnets', 'config.vpcId', 'vpcChoices.[]', function() {
    if ( !get(this, 'selectedZone') || !get(this, 'allSubnets') ) {
      return;
    }
    const subnets = get(this, 'allSubnets').filter((subnet) => get(subnet, 'vpcId') === get(this, 'config.vpcId') && get(subnet, 'zone') === get(this, 'selectedZone.label'));
    const subnetId = get(this, 'config.subnetId');

    if ( get(this, 'isNew') && get(subnets, 'length') ) {
      set(this, 'config.subnetId', get(subnets, 'firstObject.value'));
    } else {
      const found = subnets.findBy('value', subnetId);

      if ( !found ) {
        set(this, 'config.subnetId', null);
      }
    }
  }),

  subnetChoices: computed('selectedZone', 'allSubnets', 'config.vpcId', 'vpcChoices.[]', function() {
    if ( !get(this, 'selectedZone') || !get(this, 'allSubnets') ) {
      return;
    }
    const subnets = get(this, 'allSubnets').filter((subnet) => get(subnet, 'vpcId') === get(this, 'config.vpcId') && get(subnet, 'zone') === get(this, 'selectedZone.label'));

    return subnets;
  }),

  instanceChoices: computed('selectedZone', 'allInstances', function() {
    if ( !get(this, 'selectedZone') || !get(this, 'allInstances') ) {
      return;
    }
    const instances = get(this, 'allInstances').filterBy('zone', get(this, 'selectedZone.label'));

    const instanceType = get(this, 'config.instanceType');

    const found = instances.findBy('value', instanceType);

    if ( !found ) {
      set(this, 'config.instanceType', null);
    }

    return instances;
  }),

  selectedZone: computed('config.zoneId', 'zoneChoices', function() {
    const zoneChoices = get(this, 'zoneChoices') || [];

    return zoneChoices.findBy('value', get(this, 'config.zoneId'));
  }),

  storageDiskChoices: computed('diskConfigSet.[]', function() {
    return this.getDiskChoices(DATA_DISK)
  }),

  rootDiskChoices: computed('diskConfigSet.[]', function() {
    return this.getDiskChoices(SYSTEM_DISK)
  }),

  maxDataDiskSize: computed('config.storageType', function() {
    const { storageDiskChoices = [] } = this
    const disk = storageDiskChoices.findBy('value', get(this, 'config.storageType'))

    return get(disk, 'maxDiskSize')
  }),

  minDataDiskSize: computed('config.storageType', function() {
    const { storageDiskChoices = [] } = this
    const disk = storageDiskChoices.findBy('value', get(this, 'config.storageType'))

    return get(disk, 'minDiskSize')
  }),

  maxSystemDiskSize: computed('config.rootType', function() {
    const { rootDiskChoices = [] } = this
    const disk = rootDiskChoices.findBy('value', get(this, 'config.rootType'))

    return get(disk, 'maxDiskSize')
  }),

  minSystemDiskSize: computed('config.rootType', function() {
    const { rootDiskChoices = [] } = this
    const disk = rootDiskChoices.findBy('value', get(this, 'config.rootType'))

    return get(disk, 'minDiskSize')
  }),

  checkCidr() {
    if ( get(this, 'isNew') ) {
      return this.queryFromTencent('ccs', 'CheckClusterCIDR', CCS_ENDPOINT, {
        clusterCIDR: get(this, 'config.clusterCidr'),
        vpcId:       get(this, 'config.vpcId'),
      });
    } else {
      return resolve({ code: 0 });
    }
  },

  queryFromTencent(product, action, endpoint = ENDPOINT, extraParams = {}) {
    const data = {
      Action:          action,
      Nonce:           Math.round(Math.random() * 65535),
      Region:          get(this, 'config.region'),
      SecretId:        get(this, 'config.secretId'),
      SignatureMethod: 'HmacSHA1',
      Timestamp:       Math.round(Date.now() / 1000),
      Version:         '2017-03-12',
      ...extraParams,
    }

    let url = `${ product }.${ endpoint }?`;
    const params = [];

    Object.keys(data).sort().forEach((key) => {
      params.push(`${ key }=${ data[key] }`);
    });

    url += params.join('&');

    url += `&Signature=${ encodeURIComponent(AWS.util.crypto.hmac(
      get(this, 'config.secretKey'),
      `GET${ url }`,
      'base64',
      'sha1'
    )) }`

    return get(this, 'globalStore').rawRequest({
      url:    `/meta/proxy/https:/${ url }`,
      method: 'GET'
    }).then((xhr) => {
      const error = get(xhr, 'body.Response.Error.Message');

      if ( error )  {
        set(this, 'errors', [error]);

        return reject();
      }

      return get(xhr, 'body.Response') || JSON.parse(get(xhr, 'body'));
    }).catch((xhr) => {
      const error = get(xhr, 'body.Response.Error.Message') || JSON.stringify(xhr);

      set(this, 'errors', [error]);

      return reject();
    });
  },

  fetchVpcs() {
    return this.queryFromTencent('vpc', 'DescribeVpcs').then((res) => {
      set(this, 'vpcChoices', get(res, 'VpcSet').map((vpc) => {
        return {
          label: get(vpc, 'VpcName'),
          value: get(vpc, 'VpcId')
        };
      }));

      if ( !get(this, 'config.vpcId') && get(this, 'vpcChoices.length') ) {
        set(this, 'config.vpcId', get(this, 'vpcChoices.firstObject.value'));
      }
    })
  },

  fetchSubnets() {
    return this.queryFromTencent('vpc', 'DescribeSubnets').then((res) => {
      set(this, 'allSubnets', get(res, 'SubnetSet').map((subnet) => {
        return {
          label: get(subnet, 'SubnetName'),
          value: get(subnet, 'SubnetId'),
          vpcId: get(subnet, 'VpcId'),
          zone:  get(subnet, 'Zone'),
        };
      }));
    })
  },

  fetchNodeTypes() {
    return this.queryFromTencent('cvm', 'DescribeInstanceTypeConfigs').then((res) => {
      set(this, 'allInstances', get(res, 'InstanceTypeConfigSet').map((instance) => {
        return {
          value:  get(instance, 'InstanceType'),
          label:  `${ get(instance, 'InstanceType') } (CPU ${ get(instance, 'CPU') } Memory ${ get(instance, 'Memory') } GiB)`,
          group:  get(instance, 'InstanceFamily'),
          zone:   get(instance, 'Zone'),
        };
      }));
    });
  },

  fetchSecurityGroups() {
    return this.queryFromTencent('vpc', 'DescribeSecurityGroups').then((res) => {
      set(this, 'sgChoices', get(res, 'SecurityGroupSet').map((zone) => {
        return {
          label: get(zone, 'SecurityGroupName'),
          value: get(zone, 'SecurityGroupId')
        };
      }));

      if ( !get(this, 'config.sgId') && get(this, 'sgChoices.length') ) {
        set(this, 'config.sgId', get(this, 'sgChoices.firstObject.value'));
      }
    });
  },

  fetchDiskConfigQuota() {
    return this.queryFromTencent('cbs', 'DescribeDiskConfigQuota', ENDPOINT, {
      InquiryType:          'INQUIRY_CVM_CONFIG',
      'Zones.0':            ((get(this, 'zoneChoices') || []).findBy('value', get(this, 'config.zoneId')) || {}).label,
      'InstanceFamilies.0': (get(this, 'config.instanceType') || '').split('.').get('firstObject')
    }).then((res) => {
      const diskConfigSet = get(res, 'DiskConfigSet').filter((d) => d.DiskChargeType === 'POSTPAID_BY_HOUR')
      const dataDisks = diskConfigSet.filter((d) => d.DiskUsage === DATA_DISK)
      const systemDisks = diskConfigSet.filter((d) => d.DiskUsage === SYSTEM_DISK)

      if (get(this, 'isNew')) {
        setProperties(this, {
          'config.storageType': get(dataDisks, 'firstObject.DiskType'),
          'config.rootType':    get(systemDisks, 'firstObject.DiskType'),
        })
      }

      set(this, 'diskConfigSet', diskConfigSet)
    });
  },

  fetchKeyPairs() {
    return this.queryFromTencent('cvm', 'DescribeKeyPairs').then((res) => {
      set(this, 'keyChoices', get(res, 'KeyPairSet').map((key) => {
        return {
          label: get(key, 'KeyName'),
          value: get(key, 'KeyId')
        };
      }));

      if ( !get(this, 'config.keyId') && get(this, 'keyChoices.length') ) {
        set(this, 'config.keyId', get(this, 'keyChoices.firstObject.value'));
      }
    });
  },

  fetchZones() {
    return this.queryFromTencent('cvm', 'DescribeZones').then((res) => {
      set(this, 'zoneChoices', get(res, 'ZoneSet').filterBy('ZoneState', 'AVAILABLE').map((zone) => {
        return {
          label: get(zone, 'Zone'),
          value: get(zone, 'ZoneId')
        };
      }));

      if ( !get(this, 'config.zoneId') && get(this, 'zoneChoices.length') ) {
        set(this, 'config.zoneId', get(this, 'zoneChoices.firstObject.value'));
      }
    });
  },

  getDiskChoices(usage) {
    const { diskConfigSet = [] } = this

    return diskConfigSet.filter((d) => d.DiskUsage === usage).map((d) => {
      return {
        label:       `clusterNew.tencenttke.disk.${ d.DiskType }`,
        value:       d.DiskType,
        maxDiskSize: d.MaxDiskSize,
        minDiskSize: d.MinDiskSize,
      }
    })
  },
});
