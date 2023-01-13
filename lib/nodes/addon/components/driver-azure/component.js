import { alias } from '@ember/object/computed';
import {
  setProperties, get, set, computed, observer
} from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { storageTypes, environments } from 'ui/utils/azure-choices';
import { inject as service } from '@ember/service';
import { randomStr } from 'shared/utils/util';
import { addQueryParams } from 'shared/utils/util';
import { hash } from 'rsvp';

const DRIVER = 'azure';
const CONFIG = 'azureConfig';

const IPCHOICES = [
  {
    'name':  'Static',
    'value': 'staticPublicIp=true,noPublicIp=false'
  },
  {
    'name':  'Dynamic',
    'value': 'staticPublicIp=false,noPublicIp=false'
  },
  {
    'name':  'None',
    'value': 'staticPublicIp=true,noPublicIp=true'
  },
];

const MANAGED = 'managed';
const UNMANAGED = 'unmanaged';

const DISK_CHOICES = [
  {
    label: 'nodeDriver.azure.managedDisks.unmanaged',
    value: UNMANAGED
  },
  {
    label: 'nodeDriver.azure.managedDisks.managed',
    value: MANAGED
  }
];

export default Component.extend(NodeDriver, {
  intl: service(),

  layout,
  environments,
  driverName:                             DRIVER,
  publicIpChoices:                        IPCHOICES,
  diskChoices:                            DISK_CHOICES,
  managedDisks:                           UNMANAGED,
  model:                                  null,
  openPorts:                              null,
  publicIpChoice:                         null,
  tags:                                   null,
  step:                                   1,
  useAvailabilitySet:                     true,
  azureCredentialSecret:                  null,
  regions:                                [],
  regionsLoading:                         true,
  vmSizes:                                [],
  vmSizesLoading:                         true,
  cloudCredentialId:                      '',
  config:                                 alias(`model.${ CONFIG }`),
  storageTypeChoices:                     storageTypes.sortBy('name'),
  showVmAvailabilityZoneWarning:          computed.gt('vmAvailabilityZoneWarning.length', 0),
  showVmSizeAvailabilityWarning:          computed.gt('vmSizeAvailabilityWarning.length', 0),
  showVmSizeAcceleratedNetworkingWarning: computed.gt('vmSizeAcceleratedNetworkingWarning.length', 0),

  init() {
    this._super(...arguments);

    const tagsString = get(this, 'config.tags');

    if ( tagsString ) {
      const array = tagsString.split(',');
      const tags = {};

      for (let i = 0; i < array.length - 1; i = i + 2) {
        tags[array[i]] = array[i + 1];
      }

      set(this, 'tags', tags);
    }

    const availabilityZone = get(this, 'config.availabilityZone');

    if ( availabilityZone ) {
      set(this, 'useAvailabilitySet', false);
    }

    scheduleOnce('afterRender', this, this.setupComponent);
  },
  actions: {
    finishAndSelectCloudCredential(cred) {
      if (cred) {
        set(this, 'primaryResource.cloudCredentialId', get(cred, 'id'));
      }
    },

    initAzureData(cb) {
      const cloudCredentialId = get(this, 'primaryResource.cloudCredentialId')

      set(this, 'cloudCredentialId', cloudCredentialId)

      this.fetchVmSizes()
      this.fetchRegions()
      setProperties(this, { 'step': 2, });

      if (cb && typeof cb === 'function') {
        cb();
      }
    },
  },
  diskTypeChanged: observer('managedDisks', function() {
    set(this, 'config.managedDisks', get(this, 'managedDisks') === MANAGED);
  }),

  locationObserver: observer('config.location', function(){
    // When the location changes, the VM sizes should
    // be refetched because not all sizes are available
    // in all regions.
    this.fetchVmSizes()
  }),

  tagsObserver: observer('tags', function() {
    const array = [];
    const tags = get(this, 'tags') || {};

    Object.keys(tags).forEach((key) => {
      array.push(key);
      array.push(tags[key]);
    });

    set(this, 'config.tags', array.join(','));
  }),

  ipChoiceObserver: observer('publicIpChoice', function() {
    let publicIpChoice = get(this, 'publicIpChoice');

    if (get(this, 'publicIpChoices').findBy('value', publicIpChoice).name === 'None') {
      set(this, 'config.usePrivateIp', true);
    }
  }),

  publicIpObserver: observer('publicIpChoice', function() {
    let elChoice = get(this, 'publicIpChoice');
    let choice = get(this, 'publicIpChoices').findBy('value', elChoice);

    choice = choice.value.split(',');

    choice.forEach((val) => {
      let tmp = val.split('=');

      set(this, `config.${ tmp[0] }`, tmp[1] === 'true' ? true : false);
    });
  }),

  openPort: observer('openPorts', function() {
    let str = (get(this, 'openPorts') || '').trim();
    let ary = [];

    if (str.length) {
      ary = str.split(/\s*,\s*/);
    }

    set(this, 'config.openPort', ary);
  }),

  useAvailabilitySetObserver: observer('useAvailabilitySet', function() {
    // If the user switches between availability sets and availability zones,
    // the other value should be cleared out.
    if (get(this, 'useAvailabilitySet')) {
      set(this, 'config.availabilityZone', '');
    } else {
      set(this, 'config.availabilitySet', '');
    }
  }),

  vmsWithAcceleratedNetworking: computed('vmSizes', function() {
    return get(this, 'vmSizes').filter((vmData) => {
      return vmData.AcceleratedNetworkingSupported;
    });
  }),

  vmsWithoutAcceleratedNetworking: computed('vmSizes', function() {
    return get(this, 'vmSizes').filter((vmData) => {
      return !vmData.AcceleratedNetworkingSupported;
    });
  }),

  selectedVmSizeExistsInSelectedRegion: computed('config.{location,size}', 'vmSizes', function() {
    // If the user selects a region and then a VM size
    // that does not exist in the region, the list of VM
    // sizes will update, causing the selected VM size
    // to disappear. A disappearing VM size seems like a
    // bad UX, so this value allows the value to be
    // added to the VM size dropdown, while an error message
    // indicates that the size is invalid.
    if (get(this, 'vmSizes').find((size) => {
      return size.Name === get(this, 'config.size');
    })) {
      return true;
    }

    return false;
  }),

  vmsWithAvailabilityZones: computed('vmSizes', function() {
    return get(this, 'vmSizes').filter((vmData) => {
      return vmData.AvailabilityZones.length > 0;
    });
  }),


  availabilityZoneChoices: computed('config.{location,size}', 'regions', 'vmSizes', function() {
    const vmData = get(this, 'vmSizes').find((vm) => {
      return vm.Name === get(this, 'config.size')
    })

    if (vmData) {
      return vmData.AvailabilityZones.map((zone) => {
        return {
          name:  zone,
          value: zone,
        };
      });
    }

    return [];
  }),
  sizeChoices: computed('config.size', 'selectedVmSizeExistsInSelectedRegion', 'vmSizes', 'vmsWithAcceleratedNetworking', 'vmsWithoutAcceleratedNetworking', function() {
    // example vmSize option from backend:
    // {
    //   AcceleratedNetworkingSupported: false,
    //   AvailabilityZones: [],
    //   Name: "Basic_A0"
    // }
    const intl = window.l('service:intl');

    const noAnLabel = intl.t('nodeDriver.azure.size.doesNotSupportAcceleratedNetworking');
    const withAnLabel = intl.t('nodeDriver.azure.size.supportsAcceleratedNetworking');
    const vmsWithAn = get(this, 'vmsWithAcceleratedNetworking');
    const vmsWithoutAn = get(this, 'vmsWithoutAcceleratedNetworking');
    let out = [{
      kind:     'group',
      name:     withAnLabel,
      value:    withAnLabel,
      disabled: true
    }]
      .concat(vmsWithAn)
      .concat(
        {
          kind:     'group',
          name:     noAnLabel,
          value:    noAnLabel,
          disabled: true
        }
      )
      .concat(vmsWithoutAn)

    out = out.map((vmData) => {
      const { Name } = vmData;

      if (vmData.kind === 'group') {
        return vmData;
      }

      return {
        label:    Name,
        value:    Name,
        disabled: vmData.disabled || false,
      };
    });

    if (!get(this, 'selectedVmSizeExistsInSelectedRegion')) {
      return out.concat({
        label:    get(this, 'config.size'),
        value:    get(this, 'config.size'),
        disabled: true
      });
    }

    return out
  }),
  privateSet: computed('publicIpChoice', 'publicIpChoices', function() {
    let publicIpChoice = get(this, 'publicIpChoice');

    if (publicIpChoice && get(this, 'publicIpChoices').findBy('value', publicIpChoice).name === 'None') {
      return true;
    }

    return false;
  }),

  setUsePrivateIp: computed('publicIpChoice', 'publicIpChoices', function() {
    let publicIpChoice = get(this, 'publicIpChoice');

    if (publicIpChoice && get(this, 'publicIpChoices').findBy('value', publicIpChoice).name === 'None') {
      return set(this, 'config.usePrivateIp', true);
    }

    return false;
  }),

  selectedVmSizeHasZones: computed('config.{location,size}', 'value.size', 'vmSizes', 'vmsWithAvailabilityZones', function() {
    const dataForSelectedSize = this.vmsWithAvailabilityZones.filter((vmData) => {
      const { Name } = vmData;

      return Name === get(this, 'config.size');
    });

    if (dataForSelectedSize.length > 0) {
      return dataForSelectedSize[0].AvailabilityZones.length > 0;
    }

    return false;
  }),

  selectedVmSizeSupportsAN: computed('config.{location,size}', 'vmSizes', 'vmsWithAcceleratedNetworking', function() {
    const selectedSizeIsValid = !!this.vmsWithAcceleratedNetworking.find((vmData) => {
      return get(this, 'config.size') === vmData.Name;
    });

    return selectedSizeIsValid;
  }),

  vmSizeAcceleratedNetworkingWarning: computed('config.{acceleratedNetworking,location,size}', 'selectedVmSizeSupportsAN', 'vmSizes.length', function() {
    if (get(this, 'vmSizes.length') === 0) {
      // Don't show the warning until the VM sizes are loaded
      return '';
    }

    const intl = window.l('service:intl')

    if (!this.selectedVmSizeSupportsAN && get(this, 'config.acceleratedNetworking')) {
      return intl.t('nodeDriver.azure.size.selectedSizeAcceleratedNetworkingWarning');
    }

    return '';
  }),

  vmSizeAvailabilityWarning: computed('config.{location,size}', 'regions.length', 'selectedVmSizeExistsInSelectedRegion', 'vmSizes.length', function() {
    if (get(this, 'regions.length') === 0) {
      // Don't show the warning until the regions are loaded
      return '';
    }
    if (get(this, 'vmSizes.length') === 0) {
      // Don't show the warning until the VM sizes are loaded
      return '';
    }
    const intl = window.l('service:intl')

    if (!get(this, 'selectedVmSizeExistsInSelectedRegion')) {
      return intl.t('nodeDriver.azure.size.availabilityWarning');
    }

    return ''
  }),

  vmAvailabilityZoneWarning: computed('config.{location,size}', 'selectedVmSizeHasZones', 'useAvailabilitySet', 'value.size', 'vmSizes.length', 'vmsWithAvailabilityZones.length', function() {
    if (this.useAvailabilitySet) {
      return '';
    }
    if (get(this, 'vmSizes.length') === 0) {
      // Don't show the warning until the VM sizes are loaded
      return '';
    }

    const intl = window.l('service:intl')

    if (this.vmsWithAvailabilityZones.length === 0) {
      /**
       * Show UI warning: Availability zones are not supported in the selected
       * region. Please select a different region or use an
       * availability set instead.
       */
      return intl.t('nodeDriver.azure.size.regionDoesNotSupportAzs');
    }

    if (this.vmsWithAvailabilityZones.length > 0 && !this.selectedVmSizeHasZones) {
      /**
       * Show UI warning: The selected region does not support availability
       * zones for the selected VM size. Please select a
       * different region or VM size.
       */
      return intl.t('nodeDriver.azure.size.regionSupportsAzsButNotThisSize');
    }

    return '';
  }),

  fetchRegions(){
    const store = get(this, 'globalStore')

    const regions = addQueryParams('/meta/aksLocations', { cloudCredentialId: this.cloudCredentialId })

    const aksRequest = {
      regions: store.rawRequest({
        url:    regions,
        method: 'GET',
      })
    }

    hash(aksRequest).then((resp) => {
      const { regions } = resp;

      setProperties(this, {
        regions:        regions?.body || [],
        regionsLoading: false
      });
    }).catch((xhr) => {
      const err = xhr.body?.message || xhr.body?.code || xhr.body?.error;

      setProperties(this, { errors: [err], });
    })
  },

  fetchVmSizes(){
    const store = get(this, 'globalStore')

    const vmSizes = addQueryParams('/meta/aksVMSizesV2', {
      cloudCredentialId: this.cloudCredentialId,
      region:            get(this, 'config.location'),
    });

    const aksRequest = {
      vmSizes: store.rawRequest({
        url:    vmSizes,
        method: 'GET',
      }),
    }

    hash(aksRequest).then((resp) => {
      const { vmSizes } = resp;

      setProperties(this, {
        vmSizes:        vmSizes?.body || [],
        vmSizesLoading: false
      });
    }).catch((xhr) => {
      const err = xhr.body.message || xhr.body.code || xhr.body.error;

      setProperties(this, { errors: [err], });
    });
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      subscriptionId: '',
      tags:           '',
      openPort:       ['6443/tcp', '2379/tcp', '2380/tcp', '8472/udp', '4789/udp', '9796/tcp', '10256/tcp', '10250/tcp', '10251/tcp', '10252/tcp'],
    });

    set(this, `model.${ CONFIG }`, config);
  },

  initOpenPorts(ports) {
    return ports ? ports.join(',') : '';
  },

  initPublicIpChoices(staticPublicIp, noPublicIp) {
    if (staticPublicIp && noPublicIp) {
      return get(this, 'publicIpChoices').findBy('name', 'None').value;
    } else if (staticPublicIp && !noPublicIp) {
      return get(this, 'publicIpChoices').findBy('name', 'Static').value;
    } else {
      return get(this, 'publicIpChoices').findBy('name', 'Dynamic').value;
    }
  },

  validate() {
    this._super();
    let errors = get(this, 'errors') || [];

    if ( !get(this, 'model.name') ) {
      errors.push(this.intl.t('nodeDriver.nameError'));
    }

    if (!this.validateCloudCredentials()) {
      errors.push(this.intl.t('nodeDriver.cloudCredentialError'))
    }


    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },




  setupComponent() {
    setProperties(this, {
      publicIpChoice: this.initPublicIpChoices(get(this, 'config.staticPublicIp'), get(this, 'config.noPublicIp')),
      openPorts:      this.initOpenPorts(get(this, 'config.openPort')),
      managedDisks:   get(this, 'config.managedDisks') ? MANAGED : UNMANAGED
    });

    if (!this.editing) {
      set(this, 'config.nsg', `rancher-managed-${ randomStr(8, 8) }`);
    }
  },

});
