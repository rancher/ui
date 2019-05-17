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

  classNames:              ['row'],

  networkContent:          NETWORKCHOICES,
  mode:                    'new',
  isCustom:                false,
  windowsSupport:          false,
  config:                  null,
  enableNetworkPolicy:     null,
  clusterTemplateRevision: null,
  applyClusterTemplate:    null,
  isEdit:                  equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    this.setFlannelLables();
  },

  windowsSupportAvailableDidChange: observer('windowsSupportAvailable', function() {
    if ( !get(this, 'windowsSupportAvailable') ) {
      set(this, 'windowsSupport', false);
    }
  }),

  windowsSupportChange: observer('windowsSupport', function() {
    if ( this.mode === 'edit' ) {
      return;
    }

    const windowsSupport = get(this, 'windowsSupport')
    const config = get(this, 'config')

    if (windowsSupport) {
      set(config, 'network.options.flannel_backend_type', VXLAN)
    } else {
      set(config, 'network.options.flannel_backend_type', DEFAULT_BACKEND_TYPE)
    }
  }),

  flannelBackendDidChange: observer('windowsSupport', 'config.network.plugin', 'config.network.options.flannel_backend_type', function() {
    const config         = get(this, 'config');

    if (config) {
      const plugin         = get(config, 'network.plugin');
      const flannelBackend = get(config, 'network.options.flannel_backend_type');
      const windowsSupport = get(this, 'windowsSupport');

      if ( flannelBackend === VXLAN && plugin === FLANNEL && windowsSupport ) {
        setProperties(config, {
          'network.options.flannel_backend_port': BACKEND_PORT,
          'network.options.flannel_backend_vni':  BACKEND_VNI
        })
      } else {
        const options = get(config, 'network.options');

        delete options['flannel_backend_port'];
        delete options['flannel_backend_vni'];
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

    return plugin === FLANNEL && gte(coerceVersion(kubernetesVersion), 'v1.14.1');
  }),

  projectNetworkIsolationAvailable: computed('config.network.plugin', function() {
    const plugin = get(this, 'config.network.plugin');

    return plugin === CANAL;
  }),

  windowsSupportOverrideAvailable: computed('clusterTemplateCreate', 'clusterTemplateRevision', 'applyClusterTemplate', function() {
    let { clusterTemplateRevision, applyClusterTemplate } = this;

    if (applyClusterTemplate && clusterTemplateRevision && clusterTemplateRevision.questions) {
      let found = clusterTemplateRevision.questions.filter((ctr) => {
        return ctr.variable === 'rancherKubernetesEngineConfig.network.options.flannel_backend_port' || ctr.variable === 'rancherKubernetesEngineConfig.network.options.flannel_backend_vni';
      });

      return found.length === 2;
    }

    return false;
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
