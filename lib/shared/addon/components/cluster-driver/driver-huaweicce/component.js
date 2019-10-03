import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { equal } from '@ember/object/computed'

import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Component.extend(ClusterDriver, {
  intl:        service(),
  layout,
  configField: 'huaweiEngineConfig',
  zones:       [
    {
      label: 'cn-north-1',
      value: 'cn-north-1',
    }],
  clusterType: [
    {
      label: 'VirtualMachine',
      value: 'VirtualMachine',
    }, {
      label: 'BareMetal',
      value: 'BareMetal',
    }],
  masterVersions: [
    {
      label: 'v1.11.3',
      value: 'v1.11.3',
    }],
  eipChargeModeContent: [
    {
      label: 'BandWith',
      value: null,
    }, {
      label: 'Traffic',
      value: 'traffic',
    }],
  containerNetworkMode: [
    {
      label: 'overlay_l2',
      value: 'overlay_l2',
    }, {
      label: 'underlay_ipvlan',
      value: 'underlay_ipvlan',
    }, {
      label: 'vpc-router',
      value: 'vpc-router',
    }],
  volumeTypeContent: [
    {
      label: 'SATA',
      value: 'SATA',
    }, {
      label: 'SAS',
      value: 'SAS',
    }, {
      label: 'SSD',
      value: 'SSD',
    }],
  eipTypeContent: [
    {
      label: '5_bgp',
      value: '5_bgp',
    }, {
      label: '5_sbgp',
      value: '5_sbgp',
    }],
  containerNetworkModeContent: [
    {
      label: 'overlay_l2',
      value: 'overlay_l2',
    }, {
      label: 'underlay_ipvlan',
      value: 'underlay_ipvlan',
    }, {
      label: 'vpc-router',
      value: 'vpc-router',
    }],
  nodeOperationSystemContent: [
    {
      label: 'EulerOS 2.2',
      value: 'EulerOS 2.2',
    }, {
      label: 'CentOS 7.4',
      value: 'CentOS 7.4',
    }],
  containerNetworkCidrContent: [
    {
      label: '172.16.0.0/16',
      value: '172.16.0.0/16'
    }
  ],
  validityPeriodContent: [
    {
      label: '1 month',
      value: '1 month'
    },
    {
      label: '2 months',
      value: '2 month'
    },
    {
      label: '3 months',
      value: '3 month'
    },
    {
      label: '4 months',
      value: '4 month'
    },
    {
      label: '5 months',
      value: '5 month'
    },
    {
      label: '6 months',
      value: '6 month'
    },
    {
      label: '7 months',
      value: '7 month'
    },
    {
      label: '8 months',
      value: '8 month'
    },
    {
      label: '9 months',
      value: '9 month'
    },
    {
      label: '1 year',
      value: '1 year'
    },
  ],
  eipShareTypeContent: [
    {
      label: 'PER',
      value: 'PER'
    },
  ],
  vpcs:                    null,
  subnets:                 null,
  eipIds:                  null,
  nodeFlavors:             null,
  keypairs:                null,
  availableZones:          null,
  step:                    1,
  eipSelection:            'none',
  highAvailabilityEnabled: 's2',
  managementScale:         'small',
  validityPeriod:          '1 month',
  authConfigred:           false,
  publicCloud:             null,

  editing:                 equal('mode', 'edit'),
  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.huaweiEngineConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:                  'huaweiEngineConfig',
        accessKey:             null,
        secretKey:             null,
        region:                'cn-north-1',
        projectId:             null,
        dataVolumeSize:        100,
        vpcId:                 null,
        clusterType:           'VirtualMachine',
        masterVersion:         'v1.11.3',
        billingMode:           0,
        containerNetworkMode:  'overlay_l2',
        clusterFlavor:         'cce.s2.small',
        dataVolumeType:        'SATA',
        rootVolumeType:        'SATA',
        nodeCount:             1,
        rootVolumeSize:        40,
        externalServerEnabled: false,
        nodeOperationSystem:   'EulerOS 2.2',
        containerNetworkCidr:  '172.16.0.0/16',
        bmsIsAutoRenew:        'false',
        userName:              'root',
      });

      set(this, 'cluster.huaweiEngineConfig', config);
      this.validityPeriodChange()
    } else {
      const clusterFlavor = get(config, 'clusterFlavor')

      if ( clusterFlavor ) {
        const arr = clusterFlavor.split('.')

        setProperties(this, {
          'highAvailabilityEnabled': arr[1],
          'managementScale':         arr[2]
        })
      }

      setProperties(config, {
        accessKey: null,
        secretKey: null,
      })

      if ( get(config, 'nodeLabels') === null ) {
        set(config, 'nodeLabels', {})
      }

      if ( get(config, 'eipIds') === null ) {
        set(config, 'eipIds', []);
      }
    }
  },

  actions: {
    multiEipSelect() {
      let options = Array.prototype.slice.call($('.existing-eips')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'config.eipIds', selectedOptions || []);
    },

    checkAccount(cb) {
      const requiredConfig = ['projectId', 'accessKey', 'secretKey', 'region']
      const requiredCluster = ['name']

      set(this, 'errors', [])
      let errors = [];

      errors = this.validateFields(errors, requiredConfig, 'config')
      errors = this.validateFields(errors, requiredCluster, 'cluster')
      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      setProperties(this, {
        'errors':           null,
        'config.accessKey': (get(this, 'config.accessKey') || '').trim(),
        'config.secretKey': (get(this, 'config.secretKey') || '').trim(),
      });

      try {
        const location = window.location;
        const region = get(this, 'config.region')
        let endpoint = `vpc.${ region }.myhuaweicloud.com`;

        endpoint = `${ get(this, 'app.proxyEndpoint')  }/${  endpoint.replace('//', '/') }`;
        endpoint = `${ location.origin }${ endpoint }`;

        var client = new HW.ECS({
          ak:           get(this, 'config.accessKey'),
          sk:           get(this, 'config.secretKey'),
          projectId:    get(this, 'config.projectId'),
          endpoint,
          region,
          toSignedHost: `vpc.${ region }.myhuaweicloud.com`,
        })

        client.getVpcs((err, response) => {
          if ( err ) {
            let errors = this.get('errors') || [];

            errors.pushObject(err);
            set(this, 'errors', errors);
            cb();

            return;
          }

          set(this, 'vpcs', response.body.vpcs)

          if (get(this, 'mode') === 'new') {
            set(this, 'config.vpcId', response.body.vpcs[0] && response.body.vpcs[0].id || null)
          }

          client.getSubnet((err, response) => {
            if (err) {
              let errors = this.get('errors') || [];

              errors.pushObject(err);
              set(this, 'errors', errors);
              cb();

              return;
            }

            set(this, 'subnets', response.body.subnets)

            if (get(this, 'mode') === 'new') {
              set(this, 'config.subnetId', response.body.subnets[0] && response.body.subnets[0].id || null)
            }

            client.getPublicips((err, response) => {
              if (err) {
                let errors = this.get('errors') || [];

                errors.pushObject(err);
                set(this, 'errors', errors);
                cb();

                return;
              }

              set(this, 'eipIds', response.body.publicips)

              client.getNetwork((err, response) => {
                if (err) {
                  let errors = this.get('errors') || []

                  errors.pushObject(err)
                  set(this, 'errors', errors)
                  cb()

                  return
                }
                set(this, 'publicCloud', true)
                set(this, 'networks', response.body.networks)

                set(this, 'step', 2);
                cb();
              })
            })
          })
        })
      } catch (err) {
        const errors = get(this, 'errors') || [];

        errors.pushObject(err.message || err);
        set(this, 'errors', errors);
        cb();

        return;
      }
    },

    configreNode(cb) {
      const requiredConfig = ['vpcId', 'subnetId', 'containerNetworkCidr']

      set(this, 'errors', [])
      let errors = [];

      errors = this.validateFields(errors, requiredConfig, 'config')
      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      if (get(this, 'authConfigred')) {
        set(this, 'step', 3)
        cb()

        return
      }
      try {
        const location = window.location;
        const region = get(this, 'config.region')
        let endpoint = `ecs.${ region }.myhuaweicloud.com`;

        endpoint = `${ get(this, 'app.proxyEndpoint')  }/${  endpoint.replace('//', '/') }`;
        endpoint = `${ location.origin }${ endpoint }`;

        var client = new HW.ECS({
          ak:           get(this, 'config.accessKey'),
          sk:           get(this, 'config.secretKey'),
          projectId:    get(this, 'config.projectId'),
          endpoint,
          region,
          toSignedHost: `ecs.${ region }.myhuaweicloud.com`,
          service:      'ecs',
        })

        client.listCloudServerFlavors((err, response) => {
          if (err) {
            let errors = this.get('errors') || [];

            errors.pushObject(err);
            set(this, 'errors', errors);
            cb();

            return;
          }

          set(this, 'nodeFlavors', response.body.flavors)

          if (get(this, 'mode') === 'new') {
            set(this, 'config.nodeFlavor', response.body.flavors[0] && response.body.flavors[0].name || null)
          }
          client.listKeypairs((err, response) => {
            if (err) {
              let errors = this.get('errors') || [];

              errors.pushObject(err);
              set(this, 'errors', errors);
              cb();

              return;
            }

            set(this, 'keypairs', response.body.keypairs)

            const keypairs = response.body.keypairs || []

            set(this, 'config.sshKey', keypairs[0] && keypairs[0].keypair.name)

            client.getAvaliableZone((err, response) => {
              if (err) {
                let errors = this.get('errors') || [];

                errors.pushObject(err);
                set(this, 'errors', errors);
                cb();

                return;
              }

              const availableZones = (response.body.availabilityZoneInfo || []).filter((z) => z.zoneState.available)

              set(this, 'availableZones', availableZones)

              if (get(this, 'mode') === 'new') {
                setProperties(this, {
                  'config.keypairs':      response.body.availabilityZoneInfo[0] && response.body.availabilityZoneInfo[0].zoneName || null,
                  'config.availableZone': availableZones.get('firstObject.zoneName'),
                })
              }
              set(this, 'step', 3)
            })
          })
        })
      } catch (err) {
        const errors = get(this, 'errors') || [];

        errors.pushObject(err.message || err);
        set(this, 'errors', errors);
        cb();

        return;
      }
    },

    setLabels(section) {
      let obj = {}

      section.map((s) => {
        if (s.key && s.value) {
          obj[s.key] = s.value
        }
      })
      set(this, 'config.labels', obj)
    },

    setNodeLabels(section) {
      let obj = {}

      section.map((s) => {
        if (s.key && s.value) {
          obj[s.key] = s.value
        }
      })
      set(this, 'config.nodeLabels', obj)
    },
  },
  clusterTypeChange: observer('config.clusterType', function() {
    const clusterType = get(this, 'config.clusterType')
    const publicCloud = get(this, 'publicCloud')

    if (clusterType === 'VirtualMachine') {
      set(this, 'config.billingMode', 0)
      set(this, 'config.highwaySubnet', null)
      set(this, 'highAvailabilityEnabled', 's2')
    }
    if (clusterType !== 'BareMetal' || get(this, 'mode') !== 'new') {
      return
    }
    const networks = get(this, 'networks') || []
    let filter = []

    if (publicCloud) {
      filter = networks.filter((n) => n.status === 'ACTIVE' && n.tenant_id === get(this, 'config.projectId') && n[`provider:network_type`] === 'geneve')
    } else {
      filter = networks.filter((n) => n.status === 'ACTIVE')
    }
    set(this, 'config.highwaySubnet', filter[0] && filter[0].id)
    set(this, 'highAvailabilityEnabled', 't2')
  }),

  vpcIdChange: observer('config.vpcId', function() {
    const vpcId = get(this, 'config.vpcId')
    const subnets = get(this, 'subnets') || []

    const filter = subnets.filter((s) => s.vpc_id === vpcId)

    set(this, 'config.subnetId', filter[0] && filter[0].id || null)
  }),

  eipSelectionChange: observer('eipSelection', function() {
    const eipSelection = get(this, 'eipSelection')

    if (eipSelection === 'none') {
      setProperties(this, {
        'config.eipIds':           [],
        'config.eipCount':         null,
        'config.eipType':          null,
        'config.eipShareType':     null,
        'config.eipChargeMode':    null,
        'config.eipBandwidthSize': null,
      })
    }
    if (eipSelection === 'exist') {
      setProperties(this, {
        'config.eipCount':         null,
        'config.eipType':          null,
        'config.eipShareType':     null,
        'config.eipChargeMode':    null,
        'config.eipBandwidthSize': null,
      })
    }
    if (eipSelection === 'new') {
      setProperties(this, {
        'config.eipIds':           [],
        'config.eipCount':         1,
        'config.eipType':          '5_bgp',
        'config.eipBandwidthSize': 1,
        'config.eipShareType':     'PER',
      })
    }
  }),

  externalServerChange: observer('config.externalServerEnabled', function() {
    const externalServerEnabled = get(this, 'config.externalServerEnabled')

    if ( !externalServerEnabled ) {
      set(this, 'config.clusterEipId', null)
    }
  }),

  clusterFlavorObserver: observer('managementScale', 'highAvailabilityEnabled', function() {
    const { managementScale, highAvailabilityEnabled } = this;

    set(this, 'config.clusterFlavor', `cce.${ highAvailabilityEnabled }.${ managementScale }`)
  }),

  validityPeriodChange: observer('validityPeriod', function() {
    const validityPeriod = get(this, 'validityPeriod')

    if (!validityPeriod) {
      setProperties(this, {
        'config.bmsPeriodNum':  null,
        'config.bmsPeriodType': null,
      })

      return
    }
    const arr = validityPeriod.split(' ')

    setProperties(this, {
      'config.bmsPeriodNum':  parseInt(arr[0]),
      'config.bmsPeriodType': arr[1]
    })
  }),

  billingModeChange: observer('config.billingMode', function() {
    const billingMode = get(this, 'config.billingMode')

    if (billingMode === 0) {
      setProperties(this, {
        'validityPeriod':        null,
        'config.bmsIsAutoRenew': null,
      })
    }
    if (billingMode === 2) {
      setProperties(this, {
        'config.bmsIsAutoRenew': 'false',
        'validityPeriod':        '1 month',
      })
    }
  }),

  managementScaleContent: computed('config.clusterType', function() {
    const clusterType = get(this, 'config.clusterType')

    if (clusterType === 'BareMetal') {
      return [
        {
          label: '10',
          value: 'small',
        }, {
          label: '100',
          value: 'medium',
        }, {
          label: '500',
          value: 'large',
        }]
    }

    return [
      {
        label: '50',
        value: 'small',
      }, {
        label: '200',
        value: 'medium',
      }, {
        label: '1000',
        value: 'large',
      }]
  }),

  vpcContent: computed('vpcs.[]', function() {
    const vpcs = get(this, 'vpcs') || []

    return vpcs.map((v) => {
      return {
        label: v.name,
        value: v.id
      }
    })
  }),

  editedVpcName: computed('config.vpcId', function() {
    const vpcId = get(this, 'config.vpcId')
    const vpcs = get(this, 'vpcs') || []
    const filter = vpcs.filter((v) => v.id === vpcId)[0] || {}

    return filter.name
  }),

  subnetContent: computed('config.vpcId', 'subnets.[]', function() {
    const subnets = get(this, 'subnets') || []
    const vpcId = get(this, 'config.vpcId')
    const filter = subnets.filter((s) => s.vpc_id === vpcId).map((s) => ({
      label: s.name,
      value: s.id,
    }))

    return filter
  }),

  editedSubnetName: computed('config.subnetId', function() {
    const subnetId = get(this, 'config.subnetId')
    const subnets = get(this, 'subnets') || []
    const filter = subnets.filter((s) => s.id === subnetId)[0] || {}

    return filter.name
  }),

  eipIdContent: computed('eipIds.[]', function() {
    const eipIds = get(this, 'eipIds') || []

    return eipIds.filter((e) => e.status === 'DOWN').map((e) => ({
      label: e.public_ip_address,
      value: e.id
    }))
  }),

  clusterEipName: computed('config.clusterEipId', function() {
    const eipIds = get(this, 'eipIds') || []
    const clusterEipId = get(this, 'config.clusterEipId')
    const filter = eipIds.filter((e) => e.id === clusterEipId)[0] || {}

    return filter.public_ip_address
  }),

  nodeFlavorContent: computed('nodeFlavors.[]', function() {
    const nodeFlavors = get(this, 'nodeFlavors') || []

    return nodeFlavors.map((n) => {
      return {
        label: `${ n.name } ( vCPUs: ${ n.vcpus }, memory: ${ n.ram / 1024 } GB )`,
        value: n.name
      }
    })
  }),

  availableZoneContent: computed('availableZones.[]', function() {
    const zones = get(this, 'availableZones')

    return zones.map((z) => {
      if (z.zoneState.available) {
        return {
          label: z.zoneName,
          value: z.zoneName
        }
      }
    })
  }),

  sshkeyContent: computed('keypairs.[]', function() {
    const keypairs = get(this, 'keypairs')

    return keypairs.map((k) => {
      return {
        label: k.keypair.name,
        value: k.keypair.name
      }
    })
  }),

  editedSshName: computed('config.sshKey', function() {
    const sshKey = get(this, 'config.sshKey')
    const keypairs = get(this, 'keypairs')
    const filter = keypairs.filter((k) => k.keypair.name === sshKey)[0] || {}

    return filter.keypair && filter.keypair.name || ''
  }),

  nodeCountMax: computed('config.clusterFlavor', function() {
    const clusterFlavor = get(this, 'config.clusterFlavor') || ''

    if (clusterFlavor.endsWith('small')) {
      return 50
    }
    if (clusterFlavor.endsWith('medium')) {
      return 200
    }

    return 1000
  }),

  managementScaleDisplay: computed('managementScale', function() {
    const managementScale = get(this, 'managementScale')
    const managementScaleContent = get(this, 'managementScaleContent') || []
    const filter = managementScaleContent.filter((m) => m.value === managementScale)[0] || {}

    return filter.label
  }),

  networkContent: computed('networks.[]', function() {
    const networks = get(this, 'networks')
    const publicCloud = get(this, 'publicCloud')
    let arr = []

    if (publicCloud) {
      arr = networks.filter((n) => n.status === 'ACTIVE' && n.tenant_id === get(this, 'config.projectId') && n[`provider:network_type`] === 'geneve')
    } else {
      arr = networks.filter((n) => n.status === 'ACTIVE')
    }

    return arr.map((a) => ({
      label: a.name,
      value: a.id
    }))
  }),

  billingModeName: computed('config.billingMode', function() {
    const billingMode = get(this, 'config.billingMode')
    const intl = get(this, 'intl')

    return billingMode === 0 ? intl.t('clusterNew.huaweicce.billingMode.payPerUse') : intl.t('clusterNew.huaweicce.billingMode.yearly')
  }),

  billingModeContent: computed('config.clusterType', function() {
    const clusterType = get(this, 'config.clusterType')
    const intl = get(this, 'intl')

    if (clusterType === 'VirtualMachine') {
      return [
        {
          label: intl.t('clusterNew.huaweicce.billingMode.payPerUse'),
          value: 0,
        }]
    } else {
      return [
        {
          label: intl.t('clusterNew.huaweicce.billingMode.payPerUse'),
          value: 0,
        }, {
          label: intl.t('clusterNew.huaweicce.billingMode.yearly'),
          value: 2,
        }]
    }
  }),

  validityPeriodName: computed('config.bmsPeriodNum', 'config.bmsPeriodType', function() {
    const { bmsPeriodNum, bmsPeriodType } = get(this, 'config');

    return `${ bmsPeriodNum } ${ bmsPeriodType }`
  }),

  bmsIsAutoRenewName: computed('config.bmsIsAutoRenew', function() {
    return get(this, 'config.bmsIsAutoRenew') === 'true' ? 'Enabled' : 'Disabled'
  }),

  validateFields(errors = [], requiredFields = [], parent = null) {
    const intl = get(this, 'intl')

    if (parent) {
      requiredFields.map((item) => {
        if (!get(this, `${ parent }.${ item }`)) {
          errors.pushObject(`"${ intl.t(`clusterNew.huaweicce.${ item }.label`) }" ${ intl.t(`generic.isRequired`) }`);
        }
      })
    } else {
      requiredFields.map((item) => {
        if (!get(this, `${ item }`)) {
          errors.pushObject(`"${ intl.t(`clusterNew.huaweicce.${ item }.label`) }" ${ intl.t(`generic.isRequired`) }`);
        }
      })
    }

    return errors
  },

  willSave() {
    if (get(this, 'mode') === 'new') {
      const authenticatingProxyCa = get(this, 'authenticatingProxyCa') || ''

      if (get(this, 'config.authentiactionMode') === 'authenticating_proxy') {
        set(this, 'config.authenticatingProxyCa', AWS.util.base64.encode(authenticatingProxyCa))
      } else {
        set(this, 'config.authenticatingProxyCa', null)
      }
    }

    return this._super(...arguments);
  },

  validate() {
    this._super(...arguments);
    let errors = get(this, 'errors') || [];

    errors = this.validateFields(errors, ['sshKey'], 'config')

    if (get(this, 'config.authentiactionMode') === 'authenticating_proxy') {
      errors = this.validateFields(errors, ['authenticatingProxyCa'], 'config')
    }
    set(this, 'errors', errors);

    return errors.length === 0
  },

});
