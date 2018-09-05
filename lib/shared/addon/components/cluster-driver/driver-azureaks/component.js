import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import { computed, get, set, setProperties } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { next } from '@ember/runloop';

import {
  sizes,
  aksRegions,
} from 'ui/utils/azure-choices';

export default Component.extend(ClusterDriver, {
  globalStore:  service(),
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
        kubernetesVersion: '1.8.11',
        count:             3,
        agentVmSize:       'Standard_A2',
        location:          'eastus',
      });

      set(this, 'cluster.azureKubernetesServiceConfig', config);
    }
  },

  actions: {
    authenticate(cb) {
      const store = get(this, 'globalStore')
      const aksRequest = {
        versions: store.rawRequest({
          url:    '/meta/aksVersions',
          method: 'POST',
          data:   {
            clientId:       get(this, 'config.clientId'),
            clientSecret:   get(this, 'config.clientSecret'),
            subscriptionId: get(this, 'config.subscriptionId'),
            tenantId:       get(this, 'config.tenantId'),
            region:         get(this, 'config.location')
          },
        }),
        virtualNetworks: store.rawRequest({
          url:    '/meta/aksVirtualNetworks',
          method: 'POST',
          data:   {
            clientId:       get(this, 'config.clientId'),
            clientSecret:   get(this, 'config.clientSecret'),
            subscriptionId: get(this, 'config.subscriptionId'),
            tenantId:       get(this, 'config.tenantId'),
            region:         get(this, 'config.location')
          },
        })
      }

      return hash(aksRequest).then((resp) => {
        const { versions, virtualNetworks } = resp;

        setProperties(this, {
          step:     2,
          versions: (get(versions, 'body') || []).map( (r) => {
            return { 'value': r };
          }),
          vNets: (get(virtualNetworks, 'body') || []),
        });

        cb(true);
      }).catch((xhr) => {
        debugger;
        const err = xhr.body.message || xhr.body.code || xhr.body.error;

        setProperties(this, { errors: [err], });

        cb(false, [err]);
      });
    }
  },

  vnetSubnets: computed('config.virtualNetwork', function() {
    const vnet   = get(this, 'vNets').findBy('name', get(this, 'config.virtualNetwork'));
    const subnets = get(vnet, 'subnets') || [];
    const config  = get(this, 'config');

    next(() => {
      config.setProperties({
        virtualNetworkResourceGroup: get(vnet, 'resourceGroup'),
        subnet:                      subnets[0] || null,
      });
    })

    return subnets.map( ( s ) => {
      return {
        name:  `${ get(s, 'name') } (${ get(s, 'addressRange') })`,
        value: get(s, 'name')
      }
    });
  }),

  isEditable: computed('mode', function() {
    return ( get(this, 'mode') === 'edit' || get(this, 'mode') === 'new' ) ? true : false;
  }),

  saveDisabled: computed('config.subscriptionId', 'config.tenantId', 'config.clientId', 'config.clientSecret', 'config.location', function() {
    return get(this, 'config.tenantId') && get(this, 'config.clientId') && get(this, 'config.clientSecret') && get(this, 'config.subscriptionId') && get(this, 'config.location') ? false : true;
  }),

});
