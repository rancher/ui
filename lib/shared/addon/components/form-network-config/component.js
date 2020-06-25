import Component from '@ember/component';
import layout from './template';
import { equal/* , alias, or */ } from '@ember/object/computed';
import {
  computed,
  get,
  set,
  setProperties,
  observer
} from '@ember/object';
import { randomStr } from 'shared/utils/util';
import { inject as service } from '@ember/service';
import { gte }  from 'semver';
import { coerceVersion } from 'shared/utils/parse-version';
import C from 'shared/utils/constants';

const NETWORKCHOICES = [
  {
    label: 'clusterNew.rke.network.flannel',
    value: 'flannel'
  },
  {
    label: 'clusterNew.rke.network.calico',
    value: 'calico'
  },
  {
    label: 'clusterNew.rke.network.canal',
    value: 'canal'
  },
  {
    label: 'clusterNew.rke.network.weave',
    value: 'weave'
  },
];

const {
  FLANNEL,
  CANAL,
  WEAVE,
  VXLAN,
  DEFAULT_BACKEND_TYPE,
  BACKEND_PORT,
  BACKEND_VNI,
} = C.NETWORK_CONFIG_DEFAULTS;

export default Component.extend({
  globalStore:             service(),
  layout,

  networkContent:          NETWORKCHOICES,
  mode:                    'new',
  isCustom:                false,
  config:                  null,
  enableNetworkPolicy:     null,
  clusterTemplateRevision: null,
  applyClusterTemplate:    null,

  windowsSupportOverrideAvailable: false,

  isEdit:                  equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    this.setFlannelLables();
  },

  windowsSupportAvailableDidChange: observer('windowsSupportAvailable', function() {
    if ( !get(this, 'windowsSupportAvailable') ) {
      set(this, 'cluster.windowsPreferedCluster', false);
    }
  }),

  windowsSupportChange: observer('cluster.windowsPreferedCluster', function() {
    if ( this.mode === 'edit' ) {
      return;
    }

    const windowsSupport = get(this, 'cluster.windowsPreferedCluster')
    const config = get(this, 'config')

    if ( !config ) {
      return;
    }

    if (windowsSupport) {
      set(config, 'network.options.flannel_backend_type', VXLAN)
    } else {
      set(config, 'network.options.flannel_backend_type', DEFAULT_BACKEND_TYPE)
    }
  }),

  flannelBackendDidChange: observer('cluster.windowsPreferedCluster', 'config.network.plugin', 'config.network.options.flannel_backend_type', function() {
    const config         = get(this, 'config');

    if (config) {
      const plugin         = get(config, 'network.plugin');
      const flannelBackend = get(config, 'network.options.flannel_backend_type') ? get(config, 'network.options.flannel_backend_type') : '';
      const windowsSupport = get(this, 'cluster.windowsPreferedCluster');

      if ( flannelBackend === VXLAN && plugin === FLANNEL && windowsSupport ) {
        setProperties(config, {
          'network.options.flannel_backend_port': BACKEND_PORT,
          'network.options.flannel_backend_vni':  BACKEND_VNI
        })
      } else {
        const options = get(config, 'network.options');

        if (options) {
          delete options['flannel_backend_port'];
          delete options['flannel_backend_vni'];
        }
      }
    }
  }),

  networkPluginDidChange: observer('config.network.plugin', function() {
    let plugin = get(this, 'config.network.plugin');

    if (plugin) {
      if (plugin !== CANAL) {
        set(this, 'enableNetworkPolicy', false);
      }

      if (plugin === WEAVE) {
        set(this, 'config.network.weaveNetworkProvider', this.globalStore.createRecord({
          type:     'weaveNetworkProvider',
          password: randomStr(16, 16, 'password')
        }));
      } else if (plugin !== WEAVE && get(this, 'config.network.weaveNetworkProvider.password')) {
        set(this, 'config.network.weaveNetworkProvider', null);
      }
    }
  }),

  windowsSupportAvailable: computed('config.network.plugin', 'config.kubernetesVersion', function() {
    const plugin = get(this, 'config.network.plugin');

    const kubernetesVersion = get(this, 'config.kubernetesVersion');

    return plugin === FLANNEL && gte(coerceVersion(kubernetesVersion), 'v1.15.3');
  }),

  projectNetworkIsolationAvailable: computed('config.network.plugin', function() {
    const plugin = get(this, 'config.network.plugin');

    return plugin === CANAL;
  }),

  setFlannelLables() {
    let flannel = this.networkContent.findBy('value', 'flannel');

    if (get(this, 'isCustom')) {
      set(flannel, 'label', 'clusterNew.rke.network.flannelCustom');
    } else {
      set(flannel, 'label', 'clusterNew.rke.network.flannel');
    }
  },
});
