import { alias } from '@ember/object/computed';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
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
const CREATION_TYPE_DEPLOY_FROM_TEMPLATE_CONTENT_LIBRARY = 'library';
const CREATION_TYPE_DEPLOY_FROM_TEMPLATE_DATA_CENTER = 'template';
const CREATION_TYPE_CLONE_AN_EXISTING_VIRTUAL_MACHINE = 'vm';
const CREATION_TYPE_RANCHER_OS_ISO = 'legacy';
const CREATION_TYPES = [
  CREATION_TYPE_DEPLOY_FROM_TEMPLATE_CONTENT_LIBRARY,
  CREATION_TYPE_DEPLOY_FROM_TEMPLATE_DATA_CENTER,
  CREATION_TYPE_CLONE_AN_EXISTING_VIRTUAL_MACHINE,
  CREATION_TYPE_RANCHER_OS_ISO
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
  customAttribute:      [],
  vappMode:             VAPP_MODE_DISABLED,
  cache:                {},

  config:  alias(`model.${ CONFIG }`),

  init() {
    this._super(...arguments);
    this.initKeyValueParams('config.cfgparam', 'initParamArray');
    this.initKeyValueParams('config.vappProperty', 'initVappArray');
    this.initVappMode();
    this.initCreationTypes();
    this.initCustomAttributes();
    this.initTag();
    this.initNetwork();
    this.initUseDataStoreCluster();
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
    networkContentFilter(content, values) {
      return content.filter((c) => values.indexOf(c.value) === -1);
    },
    tagContentFilter(content, values) {
      const selectedOptions = values.map((v) => content.find((o) => o.id === v));
      const selectedSingleCategories = selectedOptions
        .filter((o) => o)
        .map((o) => o.category)
        .filter((c) => c.multipleCardinality === 'SINGLE');

      return content.filter((c) => {
        return selectedSingleCategories.indexOf(c.category) === -1
          && values.indexOf(c.id) === -1;
      });
    },
    customAttributeKeyContentFilter(keyContent, keyValuePairs) {
      return keyContent.filter((keyContent) => {
        return keyValuePairs.findIndex((kvp) => kvp.key === keyContent.value) === -1;
      });
    },
    toggleUseDataStoreCluster(value) {
      set(this, 'config.useDataStoreCluster', value);
      const clearKey = value ? 'config.datastore' : 'config.datastoreCluster';

      set(this, clearKey, '');
    },
    updateCloudConfig(value) {
      set(this, 'config.cloudConfig', value);
    }
  },

  creationTypeObserver: observer('config.creationType', function() {
    const isContentLibraryField = get(this, 'config.creationType') === CREATION_TYPE_DEPLOY_FROM_TEMPLATE_CONTENT_LIBRARY;

    if (!isContentLibraryField && get(this, 'config.contentLibrary')) {
      set(this, 'config.contentLibrary', undefined);
    }

    const isCloneFromMethod = get(this, 'config.creationType') === CREATION_TYPE_CLONE_AN_EXISTING_VIRTUAL_MACHINE
      || get(this, 'config.creationType') === CREATION_TYPE_DEPLOY_FROM_TEMPLATE_DATA_CENTER;

    if (!isCloneFromMethod && get(this, 'config.cloneFrom')) {
      set(this, 'config.cloneFrom', undefined);
    }
  }),

  cloudCredentialIdObserver: observer('model.cloudCredentialId', function() {
    set(this, 'config.datacenter', null);
  }),

  datacenterContent: computed('model.cloudCredentialId', async function() {
    const options = await this.requestOptions('data-centers', get(this, 'model.cloudCredentialId'));

    return this.mapPathOptionsToContent(options);
  }),

  tagContent: computed('model.cloudCredentialId', async function() {
    const categoriesPromise = this.requestOptions('tag-categories', get(this, 'model.cloudCredentialId'));
    const optionsPromise = this.requestOptions('tags', get(this, 'model.cloudCredentialId'));
    const [categories, options] = await Promise.all([categoriesPromise, optionsPromise]);

    return this.mapTagsToContent(options).map((option) => ({
      ...option,
      category: categories.find((c) => c.name === option.category)
    }));
  }),
  customAttributeKeyContent: computed('model.cloudCredentialId', async function() {
    const options = await this.requestOptions('custom-attributes', get(this, 'model.cloudCredentialId'));

    return this.mapCustomAttributesToContent(options);
  }),

  hostContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'hosts',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapHostOptionsToContent(options);
  }),

  resourcePoolContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'resource-pools',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPoolOptionsToContent(options);
  }),

  dataStoreContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'data-stores',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPathOptionsToContent(options);
  }),

  dataStoreClusterContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'data-store-clusters',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPathOptionsToContent(options);
  }),

  folderContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'folders',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapFolderOptionsToContent(options);
  }),

  networkContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'networks',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPathOptionsToContent(options);
  }),

  contentLibraryContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'content-libraries',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPathOptionsToContent(options);
  }),

  libraryTemplateContent: computed('config.contentLibrary', async function() {
    const contentLibrary = get(this, 'config.contentLibrary');

    if (!contentLibrary) {
      return [];
    }

    const options = await this.requestOptions(
      'library-templates',
      get(this, 'model.cloudCredentialId'),
      undefined,
      contentLibrary
    );

    return this.mapPathOptionsToContent(options);
  }),

  virtualMachineContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'virtual-machines',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPathOptionsToContent(options);
  }),

  templateContent: computed('config.datacenter', async function() {
    const options = await this.requestOptions(
      'templates',
      get(this, 'model.cloudCredentialId'),
      get(this, 'config.datacenter')
    );

    return this.mapPathOptionsToContent(options);
  }),

  showRancherOsIso: computed('config.creationType', function() {
    return get(this, 'config.creationType') === CREATION_TYPE_RANCHER_OS_ISO;
  }),

  showContentLibrary: computed('config.creationType', function() {
    return get(this, 'config.creationType') === CREATION_TYPE_DEPLOY_FROM_TEMPLATE_CONTENT_LIBRARY;
  }),

  showVirtualMachine: computed('config.creationType', function() {
    return get(this, 'config.creationType') === CREATION_TYPE_CLONE_AN_EXISTING_VIRTUAL_MACHINE;
  }),

  showTemplate: computed('config.creationType', function() {
    return get(this, 'config.creationType') === CREATION_TYPE_DEPLOY_FROM_TEMPLATE_DATA_CENTER;
  }),

  bootstrap() {
    let iso = get(this, `settings.${ C.SETTING.ENGINE_ISO_URL }`) || 'https://releases.rancher.com/os/latest/rancheros-vmware.iso';

    let config = get(this, 'globalStore').createRecord({
      type:                   CONFIG,
      useDataStoreCluster:    false,
      cpuCount:               '2',
      memorySize:             '2048',
      diskSize:               '20000',
      vcenterPort:            '443',
      network:                [],
      tag:                    [],
      customAttribute:        [],
      cfgparam:               ['disk.enableUUID=TRUE'],
      cloudConfig:            '#cloud-config\n\n',
      boot2dockerUrl:         iso,
      datacenter:             null,
      vappIpprotocol:         initialVAppOptions.vappIpprotocol,
      vappIpallocationpolicy: initialVAppOptions.vappIpallocationpolicy,
      vappTransport:          initialVAppOptions.vappTransport,
      vappProperty:           initialVAppOptions.vappProperty,
    });

    set(this, `model.${ CONFIG }`, config);
  },

  initCreationTypes() {
    set(this, 'creationTypeContent', [
      {
        label: this.intl.t(`nodeDriver.vmwarevsphere.creationType.${ CREATION_TYPE_DEPLOY_FROM_TEMPLATE_DATA_CENTER }`),
        value: CREATION_TYPE_DEPLOY_FROM_TEMPLATE_DATA_CENTER
      },
      {
        label: this.intl.t(`nodeDriver.vmwarevsphere.creationType.${ CREATION_TYPE_DEPLOY_FROM_TEMPLATE_CONTENT_LIBRARY }`),
        value: CREATION_TYPE_DEPLOY_FROM_TEMPLATE_CONTENT_LIBRARY
      },
      {
        label: this.intl.t(`nodeDriver.vmwarevsphere.creationType.${ CREATION_TYPE_CLONE_AN_EXISTING_VIRTUAL_MACHINE }`),
        value: CREATION_TYPE_CLONE_AN_EXISTING_VIRTUAL_MACHINE
      },
      {
        label: this.intl.t(`nodeDriver.vmwarevsphere.creationType.${ CREATION_TYPE_RANCHER_OS_ISO }`),
        value: CREATION_TYPE_RANCHER_OS_ISO
      },
    ]);
    const creationType = get(this, 'config.creationType');
    const creationTypeNotFound = CREATION_TYPES.indexOf(creationType) === -1;
    const isNew = !get(this, 'editing');

    if (!creationType || creationTypeNotFound || isNew) {
      set(this, 'config.creationType', get(this, 'creationTypeOptions.firstObject.value'));
    }
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

  initCustomAttributes() {
    const existingCustomAttributes = get(this, 'config.customAttribute') || [];

    set(this, 'customAttribute', existingCustomAttributes.map((v) => {
      const [key, value] = v.split('=');

      return {
        key,
        value,
      };
    }));
  },

  initTag() {
    if (!get(this, 'config.tag')) {
      set(this, 'config.tag', []);
    }
  },

  initNetwork() {
    if (!get(this, 'config.network')) {
      set(this, 'config.network', []);
    }
  },

  initUseDataStoreCluster() {
    const useDataStoreCluster = !!get(this, 'config.datastoreCluster');

    set(this, 'config.useDataStoreCluster', useDataStoreCluster);

    // Only one should be set at a time
    const clearKey = useDataStoreCluster ? 'config.datastore' : 'config.datastoreCluster';

    set(this, clearKey, '');
  },

  updateVappOptions(opts) {
    set(this, 'config.vappIpprotocol', opts.vappIpprotocol);
    set(this, 'config.vappIpallocationpolicy', opts.vappIpallocationpolicy);
    set(this, 'config.vappTransport', opts.vappTransport);
    set(this, 'config.vappProperty', opts.vappProperty);
    this.initKeyValueParams('config.vappProperty', 'initVappArray');
  },

  willSave() {
    const configCustomAttribute = get(this, 'customAttribute').map((kvp) => `${ kvp.key }=${ kvp.value }`);

    set(this, 'config.customAttribute', configCustomAttribute);

    const datastoreClearObject = get(this, 'config.useDataStoreCluster')
      ? { 'config.datastore': '' }
      : { 'config.datastoreCluster': '' };
    const cloudClearObject = get(this, 'showRancherOsIso')
      ? {
        'config.cloudConfig': '',
        'config.cloneFrom':   ''
      }
      : {
        'config.cloudinit':      '',
        'config.boot2dockerUrl': ''
      };

    const contentLibraryClearObject = get(this, 'showContentLibrary')
      ? {}
      : { 'config.contentLibrary': '' };

    setProperties(this,  {
      ...datastoreClearObject,
      ...cloudClearObject,
      ...contentLibraryClearObject
    });

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
  async requestOptions(resource, cloudCredentialId, dataCenter, library) {
    if (!cloudCredentialId || dataCenter === null) {
      return [];
    }

    const queryParams = Object.entries({
      cloudCredentialId,
      dataCenter,
      library
    })
      .filter((entry) => entry[1])
      .map((entry) => `${ entry[0] }=${ entry[1] }`)
      .join('&');

    const url = `/meta/vsphere/${ resource }?${ queryParams }`;

    return (await get(this, 'globalStore').rawRequest({
      url,
      method: 'GET'
    })).body.data;
  },

  mapHostOptionsToContent(hostOptions) {
    return this.mapPathOptionsToContent(hostOptions)
      .map((c) => c.value === '' ? {
        label: this.intl.t('nodeDriver.vmwarevsphere.hostOptions.any.label'),
        value: c.value
      } : c);
  },

  mapFolderOptionsToContent(folderOptions) {
    return folderOptions.map((option) => ({
      label: option,
      value: option
    }));
  },

  mapPathOptionsToContent(pathOptions) {
    return pathOptions.map((pathOption) => ({
      label: pathOption.split('/').get('lastObject'),
      value: pathOption
    }));
  },

  mapPoolOptionsToContent(pathOptions) {
    return pathOptions.map((pathOption) => {
      let splitOptions = pathOption.split('/')
      let label = splitOptions.get('lastObject')

      if (label === 'Resources' && splitOptions.length >= 2) {
        label = splitOptions.slice(-2).join('/')
      }

      return {
        label,
        value: pathOption
      }
    });
  },

  mapCustomAttributesToContent(customAttributes) {
    return customAttributes.map((customAttribute) => ({
      label: customAttribute.name,
      value: customAttribute.key.toString()
    }));
  },

  mapTagsToContent(tags) {
    return tags.map((tag) => ({
      ...tag,
      label: `${ tag.category } / ${ tag.name }`,
      value: tag.id
    }));
  }
});

