import { alias } from '@ember/object/computed';
import { get, set, computed, observer } from '@ember/object';
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
const CREATION_TYPE_MANUAL = 'manual';
const CREATION_TYPE_OPTIONS = [
  {
    label: 'Manual',
    value: CREATION_TYPE_MANUAL
  },
  {
    label: 'Clone',
    value: 'clone'
  }
];
const CLONE_FROM_OPTIONS = [
  {
    label: 'Template',
    value: 'template'
  },
  {
    label: 'Content library',
    value: 'content-library'
  },
  {
    label: 'Virtual machine',
    value: 'virtual-machine'
  }
];

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
  driverName:           DRIVER,
  model:                {},
  showEngineUrl:        true,
  initParamArray:       null,
  initVappArray:        null,
  initNetworkArray:     [''],
  vappMode:             VAPP_MODE_DISABLED,
  creationTypeOptions:  CREATION_TYPE_OPTIONS,
  cloneFromOptions:     CLONE_FROM_OPTIONS,
  cloneFrom:            CLONE_FROM_OPTIONS[0].value,
  cache:                {},

  datacenterOptions: [],
  libraryTemplateOptions: [],
  virtualMachineOptions: [],
  templateOptions: [],
  contentLibraryOptions: [],
  datacenterOptions:  [],
  resourcePoolOptions: [],
  dataStoreOptions: [],
  folderOptions: [],
  hostOptions: [],
  networkOptions: [],

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
    },
    updateNetwork(network) {
      set(this, 'config.network', network);
    }
  },

  showManualCreation: computed('config.creationType', function() {
    return this.config.creationType === CREATION_TYPE_MANUAL;
  }),

  datacenterOptionsAsync: observer('model.cloudCredentialId', function() {
    console.log('datacenters');
    this.initializeAndGetOptions('data-centers', 'datacenter').then((value) => {
      set(this, 'datacenterOptions', value);
    });
  }),

  hostOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('hosts', 'hostsystem').then((value) => {
      set(this, 'hostOptions', value);
    });
  }),

  resourcePoolOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('resource-pools', 'pool').then((value) => {
      set(this, 'resourcePoolOptions', value);
    });
  }),

  dataStoreOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('data-stores', 'datastore').then((value) => {
      set(this, 'dataStoreOptions', value);
    });
  }),

  folderOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('folders', 'folder').then((value) => {
      set(this, 'folderOptions', value);
    });
  }),

  networkOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('networks', 'floof').then((value) => {
      set(this, 'networkOptions', value);
    });
  }),

  contentLibraryOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('content-libraries', 'contentLibrary').then((value) => {
      set(this, 'contentLibraryOptions', value);
    });
  }),

  libraryTemplateOptionsAsync: observer('config.contentLibrary', function() {
    return this.initializeAndGetOptions('library-templates', 'libraryTemplate').then((value) => {
      set(this, 'libraryTemplateOptions', value);
    });
  }),

  virtualMachineOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('virtual-machines', 'virtualMachine').then((value) => {
      set(this, 'virtualMachineOptions', value);
    });
  }),

  templateOptionsAsync: observer('config.datacenter', function() {
    return this.initializeAndGetOptions('templates', 'template').then((value) => {
      set(this, 'templateOptions', value);
    });
  }),

  cloneFromTargetLabel: computed('cloneFrom', function() {
    const option = CLONE_FROM_OPTIONS.find((option) => option.value === get(this, 'cloneFrom'));
    return option
      ? option.targetLabel
      : '';
  }),

  showContentLibrary: computed('cloneFrom', function() {
    return get(this, 'cloneFrom') === 'content-library';
  }),

  showLibraryTemplate: computed('cloneFrom', function() {
    return get(this, 'cloneFrom') === 'content-library';
  }),

  showVirtualMachine: computed('cloneFrom', function() {
    return get(this, 'cloneFrom') === 'virtual-machine';
  }),

  showTemplate: computed('cloneFrom', function() {
    return get(this, 'cloneFrom') === 'template';
  }),



  bootstrap() {
    let iso = get(this, `settings.${ C.SETTING.ENGINE_ISO_URL }`) || 'https://releases.rancher.com/os/latest/rancheros-vmware.iso';

    let config = get(this, 'globalStore').createRecord({
      type:                   CONFIG,
      cpuCount:               2,
      memorySize:             2048,
      diskSize:               20000,
      vcenterPort:            443,
      network:                null,
      cfgparam:               ['disk.enableUUID=TRUE'],
      boot2dockerUrl:         iso,
      datacenter:             null,
      vappIpprotocol:         initialVAppOptions.vappIpprotocol,
      vappIpallocationpolicy: initialVAppOptions.vappIpallocationpolicy,
      vappTransport:          initialVAppOptions.vappTransport,
      vappProperty:           initialVAppOptions.vappProperty,
      creationType:           CREATION_TYPE_OPTIONS[0].value
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

  async initializeAndGetOptions(field, configKey) {
    const promise = new Promise(async (res, rej) => {
      const cloudCredentialId = get(this, 'model.cloudCredentialId');
      const datacenter = get(this, 'config.datacenter');
      const contentLibrary = get(this, 'config.contentLibrary');

      if (!cloudCredentialId) {
        return res([]);
      }

      const url = datacenter
        ? `/meta/vsphere/${field}?cloudCredentialId=${ cloudCredentialId }&dataCenter=${ datacenter }&library=${ contentLibrary }`
        : `/meta/vsphere/${field}?cloudCredentialId=${ cloudCredentialId }`;
      const cachedOptions = get(this, 'cache')[url];

      if (cachedOptions) {
        set(this, `config.${configKey}`, cachedOptions.get('firstObject.value'));
        return res(cachedOptions);
      }

      const response = await get(this, 'globalStore').rawRequest({
        url,
        method: 'GET'
      });

      const values = response.body['data'];
      const options = values.map((value) => ({ label: value.split('/').get('lastObject'), value: value }));
      set(this, `config.${configKey}`, values.get('firstObject'));
      set(this, `cache.${url}`, options);

      return res(options);
    });

    return promise.then((value) => {
      promise.value = value;
      return value;
    });
  }
});
