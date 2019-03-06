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
  }
];

const ROOT_DISK = [
  {
    label: 'clusterNew.tencenttke.disk.basic',
    value: 'LOCAL_BASIC'
  },
  {
    label: 'clusterNew.tencenttke.disk.ssd',
    value: 'LOCAL_SSD'
  },
  {
    label: 'clusterNew.tencenttke.disk.cloudBasic',
    value: 'CLOUD_BASIC'
  },
  {
    label: 'clusterNew.tencenttke.disk.cloudSsd',
    value: 'CLOUD_SSD'
  }
];

const STORAGE_DISK = [
  {
    label: 'clusterNew.tencenttke.disk.basic',
    value: 'LOCAL_BASIC'
  },
  {
    label: 'clusterNew.tencenttke.disk.ssd',
    value: 'LOCAL_SSD'
  },
  {
    label: 'clusterNew.tencenttke.disk.cloudBasic',
    value: 'CLOUD_BASIC'
  },
  {
    label: 'clusterNew.tencenttke.disk.cloudPremium',
    value: 'CLOUD_PREMIUM'
  },
  {
    label: 'clusterNew.tencenttke.disk.cloudSsd',
    value: 'CLOUD_SSD'
  }
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
  rootDiskChoices:    ROOT_DISK,
  storageDiskChoices: STORAGE_DISK,
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
        clusterVersion: '1.10.5',
        region:         'ap-guangzhou',
        secretId:       null,
        secretKey:      null,
        zoneId:         null,
        vpcId:          null,
        subnetId:       null,
        instanceType:   'S2.MEDIUM4',
        osName:         'ubuntu16.04.1 LTSx86_64',
        sgId:           null,
        rootType:       'CLOUD_BASIC',
        storageType:    'CLOUD_BASIC',
        rootSize:       25,
        storageSize:    20,
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

  subnetChoices: computed('selectedZone', 'allSubnets', function() {
    if ( !get(this, 'selectedZone') || !get(this, 'allSubnets') ) {
      return;
    }
    const subnets = get(this, 'allSubnets').filter((subnet) => get(subnet, 'vpcId') === get(this, 'config.vpcId') && get(subnet, 'zone') === get(this, 'selectedZone.label'));

    const subnetId = get(this, 'config.subnetId');

    if ( !subnetId && get(subnets, 'length') ) {
      set(this, 'config.subnetId', get(subnets, 'firstObject.value'));
    } else {
      const found = subnets.findBy('value', subnetId);

      if ( !found ) {
        set(this, 'config.subnetId', null);
      }
    }

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

  queryFromTencent(product, action, endpoint = ENDPOINT, extraParams) {
    const data = {
      Action:          action,
      Nonce:           Math.round(Math.random() * 65535),
      Region:          get(this, 'config.region'),
      SecretId:        get(this, 'config.secretId'),
      SignatureMethod: 'HmacSHA1',
      Timestamp:       Math.round(Date.now() / 1000),
      Version:         '2017-03-12',
    }

    let url = `${ product }.${ endpoint }?`;
    const params = [];

    Object.keys(data).forEach((key) => {
      params.push(`${ key }=${ data[key] }`);
    });

    if ( extraParams ) {
      Object.keys(extraParams).forEach((key) => {
        params.push(`${ key }=${ extraParams[key] }`);
      });
    }

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
});
