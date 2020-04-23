import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ManageLabels from 'shared/mixins/manage-labels';
import { addAction } from 'ui/utils/add-view-action';
import { get, set, computed, setProperties } from '@ember/object';
import { ucFirst } from 'shared/utils/util';
import { formatSi } from 'shared/utils/parse-unit';
import C from 'ui/utils/constants';
import { isArray } from '@ember/array';
import $ from 'jquery';

export class DynamicDependentKeysProperty {
  constructor(property) {
    const {
      driver, keyOrKeysToWatch, getDisplayProperty
    } = property;

    setProperties(this, {
      driver,
      keyOrKeysToWatch,
    });

    if (getDisplayProperty) {
      set(this, 'getDisplayProperty', getDisplayProperty);
    } else {
      if (keyOrKeysToWatch) {
        let keyToGet = keyOrKeysToWatch;

        set(this, 'getDisplayProperty', function() {
          return get(this, keyToGet);
        });
      }
    }
  }
}

// Map of location objects -> { driver, keyOrKeysToWatch, getLocation }
// driver: driver name (e.g. digitial ocean, azure)
// keyOrKeysToWatch: string | map of strings corresponding to key or keys on config storing the location
// getLocation: if multiple location keys you may provide an override getting function to fetch and massage display location to your liking
// Custom UIs should call registerDisplayLocation{new Location} to register new entries.
const DISPLAY_LOCATIONS = [];
const DISPLAY_SIZES     = [];

function _initBuiltInSizes() {
  const CONFIG_SIZE_KEYS = [
    {
      driver:           'aliyunecs',
      keyOrKeysToWatch: 'config.instanceType',
    },
    {
      driver:           'amazonec2',
      keyOrKeysToWatch: 'config.instanceType',
    },
    {
      driver:           'azure',
      keyOrKeysToWatch: 'config.size',
    },
    {
      driver:           'digitalocean',
      keyOrKeysToWatch: 'config.size',
    },
    {
      driver:           'exoscale',
      keyOrKeysToWatch: 'config.instanceProfile',
    },
    {
      driver:           'linode',
      keyOrKeysToWatch: 'config.instanceType',
    },
    {
      driver:           'oci',
      keyOrKeysToWatch: 'config.nodeShape',
    },
    {
      driver:           'packet',
      keyOrKeysToWatch: 'config.plan',
    },
    {
      driver:           'rackspace',
      keyOrKeysToWatch: 'config.flavorId',
    },
    {
      driver:           'vmwarevsphere',
      keyOrKeysToWatch: ['config.memorySize', 'config.cpuCount'],
      getDisplayProperty() {
        const size = formatSi(get(this, 'config.memorySize') * 1048576, 1024, 'iB');

        return `${ size }, ${ get(this, 'config.cpuCount')  } Core`;
      }
    },
  ];

  CONFIG_SIZE_KEYS.forEach((size) => {
    registerDisplaySize(new DynamicDependentKeysProperty(size));
  });
}

function _initBuiltInLocations() {
  const CONFIG_LOCATION_KEYS = [
    {
      driver:            'aliyunecs',
      keyOrKeysToWatch: ['config.region', 'config.zone'],
      getDisplayProperty() {
        return `${ get(this, 'config.region') }${ get(this, 'config.zone') }`
      }
    },
    {
      driver:            'amazonec2',
      keyOrKeysToWatch: ['config.region', 'config.zone'],
      getDisplayProperty() {
        return `${ get(this, 'config.region') }${ get(this, 'config.zone') }`
      }
    },
    {
      driver:           'azure',
      keyOrKeysToWatch: 'config.location',
    },
    {
      driver:           'digitalocean',
      keyOrKeysToWatch: 'config.region',
    },
    {
      driver:           'exoscale',
      keyOrKeysToWatch: 'config.availabilityZone',
    },
    {
      driver:           'linode',
      keyOrKeysToWatch: 'config.region',
    },
    {
      driver:           'packet',
      keyOrKeysToWatch: 'config.facilityCode',
    },
    {
      driver:           'rackspace',
      keyOrKeysToWatch: 'config.region',
    },
    {
      driver:           'vmwarevsphere',
      keyOrKeysToWatch: null,
    },
  ];

  CONFIG_LOCATION_KEYS.forEach((location) => {
    registerDisplayLocation(new DynamicDependentKeysProperty(location));
  });
}

_initBuiltInLocations();
_initBuiltInSizes();

export function getDisplayLocation(driver) {
  return DISPLAY_LOCATIONS.findBy('driver', driver);
}

export function getDisplaySize(driver) {
  return DISPLAY_SIZES.findBy('driver', driver );
}

export function registerDisplayLocation(location) {
  DISPLAY_LOCATIONS.push(location)
}

export function registerDisplaySize(size) {
  DISPLAY_SIZES.push(size);
}

export default Mixin.create(NewOrEdit, ManageLabels, {
  intl:          service(),
  scope:         service(),
  settings:      service(),
  router:        service(),
  globalStore:   service(),

  driverName:             null,
  errors:                 null,
  showEngineUrl:          true, // On some drivers this isn't configurable
  model:                  null,
  labelResource:          alias('model'),


  actions: {
    errorHandler(err, shouldClearPreviousErrors = false) {
      let { errors } = this;

      if (shouldClearPreviousErrors) {
        errors = set(this, 'errors', []);
      }

      if (errors) {
        if (isArray(err)) {
          errors.pushObjects(err);
        } else {
          errors.pushObject(err);
        }
      } else {
        errors = [err];
      }

      set(this, 'errors', errors);
    },

    finishAndSelectCloudCredential() {},

    addLabel: addAction('addLabel', '.key'),

    setLabels(labels) {
      let out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'labelResource.labels', out);
    },

    cancel() {
      if (this.close) {
        this.close();
      }
    }
  },

  init() {
    this._super(...arguments);

    if ( !get(this, 'editing') && typeof get(this, 'bootstrap') === 'function') {
      this.initEngineUrl();
      this.bootstrap();
    }

    set(this, 'model.namespaceId', 'fixme'); // @TODO-2.0
  },

  bootstrap() {
    // Populate the appropriate *Config field with defaults for your driver
  },

  cloudCredentials: computed('model.cloudCredentialId', 'driverName', function() {
    const { driverName } = this;

    return this.globalStore.all('cloudcredential').filter((cc) => {
      switch (driverName) {
      case 'digitalocean':
        if (get(cc, 'isDo')) {
          return cc;
        }
        break;
      case 'amazonec2':
        if (get(cc, 'isAmazon')) {
          return cc;
        }
        break;
      case 'azure':
        if (get(cc, 'isAzure')) {
          return cc;
        }
        break;
      case 'linode':
        if (get(cc, 'isLinode')) {
          return cc;
        }
        break;
      case 'oci':
        if (get(cc, 'isOCI')) {
          return cc;
        }
        break;
      case 'vmwarevsphere':
        if (get(cc, 'isVMware')) {
          return cc;
        }
        break;
      default:
        return;
      }
    }).sortBy('name');
  }),

  driverOptionsTitle: computed('driverName', 'intl.locale', function() {
    const intl = get(this, 'intl');
    const driver = get(this, 'driverName');
    const key = `nodeDriver.displayName.${ driver }`;
    let name = ucFirst(driver);

    if ( intl.exists(key) ) {
      name = intl.t(key);
    }

    return intl.t('nodeDriver.driverOptions', { driver: name });
  }),

  templateOptionsTitle: computed('settings.appName', 'intl.locale', function() {
    const intl = get(this, 'intl');
    const appName  = get(this, 'settings.appName');

    return intl.t('nodeDriver.templateOptions', { appName });
  }),

  initEngineUrl() {
    let engineInstallURL = null;
    let engineRegistryMirror = [];

    if ( get(this, 'showEngineUrl') ) {
      engineInstallURL = get(this, `settings.${ C.SETTING.ENGINE_URL }`) || '';
    }

    setProperties(this, {
      'model.engineInstallURL':     engineInstallURL,
      'model.engineRegistryMirror': engineRegistryMirror,
    });
  },

  didInsertElement() {
    this._super();

    next(() => {
      try {
        const input = $('INPUT')[0];

        if ( input ) {
          input.focus();
        }
      } catch (e) {}
    });
  },

  willSave() {
    get(this, 'model').clearConfigsExcept(`${ get(this, 'driverName') }Config`);

    return this._super(...arguments);
  },

  validateCloudCredentials() {
    const driversToValidate   = ['amazonec2', 'azure', 'digitalocean', 'linode', 'vmwarevsphere'];
    let { driverName }        = this;
    let { cloudCredentialId } = this.model;
    let valid                 = false;

    if (driversToValidate.includes(driverName) && cloudCredentialId) {
      valid = true;
    } else {
      valid = false;
    }

    return valid;
  },

  doneSaving() {
    // This triggers nodetemplates to recompute the display size/location
    get(this, 'model').notifyPropertyChange('displaySize');
    get(this, 'model').notifyPropertyChange('displayLocation');

    if (this.saved) {
      this.saved();
    }

    if (this.close) {
      this.close()
    }
  },
});
