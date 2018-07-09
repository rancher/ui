import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import {
  computed, get, set, setProperties
} from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';

import {
  sizes,
  aksRegions,
} from 'ui/utils/azure-choices';

export default Component.extend(ClusterDriver, {
  globalStore: service(),
  layout,
  configField:  'azureKubernetesServiceConfig',

  zones:        aksRegions,
  versions:     null,
  machineSizes: sizes,
  step:         1,
  netMode:      'default',

  saveDisabled: computed('config.subscriptionId', 'config.tenantId', 'config.clientId', 'config.clientSecret', 'config.location', function() {

    return get(this, 'config.tenantId') && get(this, 'config.clientId') && get(this, 'config.clientSecret') && get(this, 'config.subscriptionId') && get(this, 'config.location') ? false : true;

  }),

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

      const gs = get(this, 'globalStore')

      return gs.rawRequest({
        url:    '/meta/aksVersions',
        method: 'POST',
        data:   {
          clientId:       get(this, 'config.clientId'),
          clientSecret:   get(this, 'config.clientSecret'),
          subscriptionId: get(this, 'config.subscriptionId'),
          tenantId:       get(this, 'config.tenantId'),
          region:         get(this, 'config.location')
        },
      }).then((resp) => {

        let nue = get(resp, 'body');

        if (nue.length > 0) {

          setProperties(this, {
            step:     2,
            versions: nue.map( (r) => {

              return { 'value': r };

            })
          });

        }

        cb(true);

      })
        .catch((xhr) => {

          setProperties(this, { errors: [xhr.body.message || xhr.body.code], });

          cb(false, [xhr.body.message || xhr.body.code]);

        });

    }
  },

});
