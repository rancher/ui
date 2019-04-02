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

// Map of driverName -> [string | function]
//  If string, the given field is retrieved
//  If function, the function is executed with the template as "this"
//  Custom UIs should call registerDisplay{Size|Location} to register new entries.
const DISPLAY_LOCATIONS = {
  aliyunecs() {
    return get(this, 'config.region') + get(this, 'config.zone');
  },
  amazonec2() {
    return get(this, 'config.region') + get(this, 'config.zone');
  },
  azure:         'config.environment',
  digitalocean:  'config.region',
  exoscale:      'config.availabilityZone',
  packet:        'config.facilityCode',
  rackspace:     'config.region',
  vmwarevsphere: null,
}

const DISPLAY_SIZES = {
  aliyunecs:    'config.instanceType',
  amazonec2:    'config.instanceType',
  azure:        'config.size',
  digitalocean: 'config.size',
  exoscale:     'config.instanceProfile',
  packet:       'config.plan',
  rackspace:    'config.flavorId',

  vmwarevsphere() {
    const size = formatSi(get(this, 'config.memorySize') * 1048576, 1024, 'iB');

    return `${ size }, ${ get(this, 'config.cpuCount')  } Core`;
  },
}


export function getDisplayLocation(driver) {
  return DISPLAY_LOCATIONS[driver];
}

export function getDisplaySize(driver) {
  return DISPLAY_SIZES[driver];
}

export function registerDisplayLocation(driver, keyOrFn) {
  DISPLAY_LOCATIONS[driver] = keyOrFn;
}

export function registerDisplaySize(driver, keyOrFn) {
  DISPLAY_SIZES[driver] = keyOrFn;
}

export default Mixin.create(NewOrEdit, ManageLabels, {
  intl:          service(),
  scope:         service(),
  settings:      service(),
  router:        service(),
  globalStore:   service(),

  driverName:             null,
  showEngineUrl:          true, // On some drivers this isn't configurable
  model:                  null,
  labelResource:          alias('model'),


  actions: {
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
      this.sendAction('close');
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
        const input = this.$('INPUT')[0];

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
    const driversToValidate   = ['amazonec2', 'azure', 'digitalocean', 'vmwarevsphere'];
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
    this.sendAction('saved');
    this.sendAction('close');
  },
});
