import { alias } from '@ember/object/computed';
import { get, set, computed } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

const DRIVER = 'vmwarevsphere';
const CONFIG = 'vmwarevsphereConfig';
const VAPP_MODE_DISABLED = 'disabled';
const VAPP_MODE_AUTO = 'auto';
const VAPP_MODE_MANUAL = 'manual';

const stringsToParams = (params, str) => {
  const index = str.indexOf('=');

  if ( index > -1 ) {
    params.push({
      key:   str.slice(0, index),
      value: str.slice(index + 1),
    });
  }

  return params;
};

const paramsToStrings = (strs, param) => {
  if (param.value && param.key) {
    strs.push(`${ param.key }=${ param.value }`);
  }

  return strs;
};

const initialVAppOptions = {
  vappIpprotocol:         '',
  vappIpallocationpolicy: '',
  vappTransport:          '',
  vappProperty:           []
};

const getDefaultVappOptions = (networks) => {
  return {
    vappIpprotocol:         'IPv4',
    vappIpallocationpolicy: 'fixedAllocated',
    vappTransport:          'com.vmware.guestInfo',
    vappProperty:           networksToVappProperties(networks)
  };
};

const networksToVappProperties = (networks) => {
  return networks.length === 0
    ? []
    : networks.reduce(networkToVappProperties, [
      `guestinfo.dns.servers=\${dns:${ networks[0] }}`,
      `guestinfo.dns.domains=\${searchPath:${ networks[0] }}`
    ]);
}



const networkToVappProperties = (props, network, i) => {
  const n = i.toString();

  props.push(
    `guestinfo.interface.${ n }.ip.0.address=ip:${ network }`,
    `guestinfo.interface.${ n }.ip.0.netmask=\${netmask:${ network }}`,
    `guestinfo.interface.${ n }.route.0.gateway=\${gateway:${ network }}`
  );

  return props;
};

const getInitialVappMode = (c) => {
  const vappProperty = c.vappProperty || []

  if (
    !c.vappIpprotocol &&
    !c.vappIpallocationpolicy &&
    !c.vappTransport &&
    vappProperty.length === 0
  ) {
    return VAPP_MODE_DISABLED;
  }

  const d = getDefaultVappOptions(c.network);

  if (
    c.vappIpprotocol === d.vappIpprotocol &&
    c.vappIpallocationpolicy === d.vappIpallocationpolicy &&
    c.vappTransport === d.vappTransport &&
    vappProperty.length === d.vappProperty.length &&
    vappProperty.join() === d.vappProperty.join()
  ) {
    return VAPP_MODE_AUTO;
  }

  return VAPP_MODE_MANUAL;
};

export default Component.extend(NodeDriver, {
  settings: service(),
  intl:     service(),

  layout,
  driverName:     DRIVER,
  model:          null,
  showEngineUrl:  true,
  initParamArray: null,
  initVappArray:  null,
  vappMode:       VAPP_MODE_DISABLED,

  config:  alias(`model.${ CONFIG }`),

  init() {
    this._super(...arguments);
    this.initKeyValueParams('config.cfgparam', 'initParamArray');
    this.initKeyValueParams('config.vappProperty', 'initVappArray');
    this.initVappMode();
  },

  actions: {
    paramChanged(array) {
      this.updateKeyValueParams('config.cfgparam', array);
    },
    vappPropertyChanged(array) {
      this.updateKeyValueParams('config.vappProperty', array);
    },
    finishAndSelectCloudCredential(credential) {
      set(this, 'model.cloudCredentialId', get(credential, 'id'))
    }
  },

  network: computed('config.network', {
    get() {
      return (get(this, 'config.network') || []).join(', ');
    },
    set(k, value) {
      set(this, 'config.network', value.split(',').filter((x) => {
        return x.trim().length !== 0
      }));

      return value;
    }
  }),

  bootstrap() {
    let iso = get(this, `settings.${ C.SETTING.ENGINE_ISO_URL }`) || 'https://releases.rancher.com/os/latest/rancheros-vmware.iso';

    let config = get(this, 'globalStore').createRecord({
      type:                   CONFIG,
      cpuCount:               2,
      memorySize:             2048,
      diskSize:               20000,
      vcenterPort:            443,
      network:                [],
      cfgparam:               ['disk.enableUUID=TRUE'],
      boot2dockerUrl:         iso,
      vappIpprotocol:         initialVAppOptions.vappIpprotocol,
      vappIpallocationpolicy: initialVAppOptions.vappIpallocationpolicy,
      vappTransport:          initialVAppOptions.vappTransport,
      vappProperty:           initialVAppOptions.vappProperty
    });

    set(this, `model.${ CONFIG }`, config);
  },

  initKeyValueParams(pairsKey, paramsKey) {
    set(this, paramsKey, (get(this, pairsKey) || []).reduce(stringsToParams, []));
  },

  updateKeyValueParams(pairsKey, params) {
    set(this, pairsKey, params.reduce(paramsToStrings, []));
  },

  initVappMode() {
    set(this, 'vappMode', getInitialVappMode(get(this, 'config')));
  },

  updateVappOptions(opts) {
    set(this, 'config.vappIpprotocol', opts.vappIpprotocol);
    set(this, 'config.vappIpallocationpolicy', opts.vappIpallocationpolicy);
    set(this, 'config.vappTransport', opts.vappTransport);
    set(this, 'config.vappProperty', opts.vappProperty);
    this.initKeyValueParams('config.vappProperty', 'initVappArray');
  },

  willSave() {
    const vappMode = get(this, 'vappMode')

    if (vappMode === VAPP_MODE_DISABLED) {
      this.updateVappOptions(initialVAppOptions);
    } else if (vappMode === VAPP_MODE_AUTO) {
      const network = get(this, 'config.network')
      const defaultVappOptions = getDefaultVappOptions(network)

      this.updateVappOptions(defaultVappOptions);
    }

    if ( !get(this, 'config.network') ) {
      set(this, 'config.network', []);
    }

    return this._super(...arguments);
  },

  validate() {
    this._super();
    let errors = get(this, 'errors') || [];

    if (!this.validateCloudCredentials()) {
      errors.push(this.intl.t('nodeDriver.cloudCredentialError'))
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

});
