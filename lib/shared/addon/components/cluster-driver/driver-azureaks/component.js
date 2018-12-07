import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import {
  computed, get, set, setProperties, observer
} from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { on } from '@ember/object/evented';
import ipaddr from 'ipaddr.js';

import {
  sizes,
  aksRegions,
} from 'ui/utils/azure-choices';

export default Component.extend(ClusterDriver, {
  globalStore:  service(),
  intl:         service(),
  layout,
  configField:  'azureKubernetesServiceConfig',

  zones:        aksRegions,
  versions:     null,
  machineSizes: sizes,
  step:         1,
  netMode:      'default',

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.azureKubernetesServiceConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        agentPoolName:     'rancher',
        type:              'azureKubernetesServiceConfig',
        osDiskSizeGb:      100,
        adminUsername:     'azureuser',
        kubernetesVersion: '1.11.5',
        count:             3,
        agentVmSize:       'Standard_D2_v2',
        location:          'eastus',
      });

      set(this, 'cluster.azureKubernetesServiceConfig', config);
    }
  },

  actions: {
    authenticate(cb) {
      const store = get(this, 'globalStore')
      const data = {
        clientId:       get(this, 'config.clientId'),
        clientSecret:   get(this, 'config.clientSecret'),
        subscriptionId: get(this, 'config.subscriptionId'),
        tenantId:       get(this, 'config.tenantId'),
        region:         get(this, 'config.location')
      };
      const aksRequest = {
        versions: store.rawRequest({
          url:    '/meta/aksVersions',
          method: 'POST',
          data
        }),
        virtualNetworks: store.rawRequest({
          url:    '/meta/aksVirtualNetworks',
          method: 'POST',
          data
        })
      }

      return hash(aksRequest).then((resp) => {
        const { versions, virtualNetworks } = resp;

        setProperties(this, {
          step:     2,
          versions: (get(versions, 'body') || []).map( (r) => {
            return { 'value': r };
          }),
          virtualNetworks: (get(virtualNetworks, 'body') || []),
        });

        cb(true);
      }).catch((xhr) => {
        const err = xhr.body.message || xhr.body.code || xhr.body.error;

        setProperties(this, { errors: [err], });

        cb(false, [err]);
      });
    }
  },

  resetAdvancedOptions: on('init', observer('netMode', function() {
    if (get(this, 'netMode') === 'default') {
      const config = get(this, 'config');

      setProperties(config, {
        subnet:                      null,
        virtualNetwork:              null,
        virtualNetworkResourceGroup: null,
        serviceCidr:                 null,
        dnsServiceIp:                null,
        dockerBridgeCidr:            null
      });
    }
  })),

  networkChoice: computed({
    set( key, value = '' ) {
      const [subnet, virtualNetwork, virtualNetworkResourceGroup] = value.split(':');
      const config = get(this, 'config');

      if (subnet && virtualNetwork && virtualNetworkResourceGroup) {
        setProperties(config, {
          subnet,
          virtualNetwork,
          virtualNetworkResourceGroup
        });
      }

      return value;
    }
  }),

  filteredVirtualNetworks: computed('config.virtualNetwork', 'virtualNetworks', function() {
    const vnets = get(this, 'virtualNetworks');
    const subNets = [];

    vnets.forEach( (vnet) => {
      get(vnet, 'subnets').forEach( (subnet) => {
        subNets.pushObject({
          name:  `${ get(subnet, 'name') } (${ get(subnet, 'addressRange') })`,
          group: get(vnet, 'name'),
          value: `${ get(subnet, 'name') }:${ get(vnet, 'name') }:${ get(vnet, 'resourceGroup') }`
        })
      });
    });

    return subNets;
  }),

  isEditable: computed('mode', function() {
    return ( get(this, 'mode') === 'edit' || get(this, 'mode') === 'new' ) ? true : false;
  }),

  saveDisabled: computed('config.subscriptionId', 'config.tenantId', 'config.clientId', 'config.clientSecret', 'config.location', function() {
    return get(this, 'config.tenantId') && get(this, 'config.clientId') && get(this, 'config.clientSecret') && get(this, 'config.subscriptionId') && get(this, 'config.location') ? false : true;
  }),

  validate() {
    let model = get(this, 'cluster');
    let errors = model.validationErrors() || [];

    const vnetSet = !!get(this, 'config.virtualNetwork');

    if (vnetSet) {
      errors = errors.concat(this.validateVnetInputs());
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  validateVnetInputs() {
    const intl   = get(this, 'intl');
    const errors = [];
    const config = get(this, 'config');
    const vnet   = get(this, 'virtualNetworks').findBy('name', get(config, 'virtualNetwork'));

    if (vnet) {
      let subnet = get(vnet, `subnets`).findBy('name', get(config, 'subnet'));
      let vnetRange  = ipaddr.parseCIDR(get(subnet, 'addressRange'));

      let {
        serviceCidr, dnsServiceIp, dockerBridgeCidr
      } = config;

      let parsedServiceCidr      = null;
      let parsedDnsServiceIp     = null;
      let parsedDockerBridgeCidr = null;

      if (!serviceCidr && !dnsServiceIp && !dockerBridgeCidr) {
        errors.pushObject('You must include all required fields when using a Virtual Network');
      }

      try {
        parsedServiceCidr = ipaddr.parseCIDR(serviceCidr);

        // check if serviceCidr falls within the VNet/Subnet range
        if (parsedServiceCidr && vnetRange[0].match(parsedServiceCidr)) {
          errors.pushObject(intl.t('clusterNew.azureaks.errors.included.parsedServiceCidr'));
        }
      } catch ( err ) {
        errors.pushObject(intl.t('clusterNew.azureaks.errors.included.serviceCidr'));
      }

      try {
        parsedDnsServiceIp = ipaddr.parse(dnsServiceIp);

        // check if dnsService exists in range
        if (parsedDnsServiceIp && vnetRange[0].match(parsedDnsServiceIp, vnetRange[1])) {
          errors.pushObject(intl.t('clusterNew.azureaks.errors.included.parsedDnsServiceIp'));
        }
      } catch ( err ) {
        errors.pushObject(intl.t('clusterNew.azureaks.errors.included.dnsServiceIp'));
      }

      try {
        parsedDockerBridgeCidr = ipaddr.parseCIDR(dockerBridgeCidr);

        // check that dockerBridge doesn't overlap
        if (parsedDockerBridgeCidr && ( vnetRange[0].match(parsedDockerBridgeCidr) || parsedServiceCidr[0].match(parsedDockerBridgeCidr) )) {
          errors.pushObject(intl.t('clusterNew.azureaks.errors.included.parsedDockerBridgeCidr'));
        }
      } catch ( err ) {
        errors.pushObject(intl.t('clusterNew.azureaks.errors.included.dockerBridgeCidr'));
      }
    }

    return errors;
  }
});
