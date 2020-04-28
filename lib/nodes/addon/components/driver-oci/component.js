import { alias } from '@ember/object/computed';
import { set, get, computed } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend(NodeDriver, {
  intl:     service(),
  settings: service(),
  oci:      service(),

  layout,

  driverName:             'oci',
  region:                 '',
  nodeAvailabilityDomain: '',
  nodeImage:              '',
  step:                    1,

  config: alias('model.ociConfig'),

  init() {
    this._super(...arguments);
  },

  actions: {
    finishAndSelectCloudCredential(credential) {
      set(this, 'model.cloudCredentialId', get(credential, 'id'))
    },
  },

  regionChoices: computed('model.cloudCredentialId', async function() {
    let token = get(this, 'primaryResource.cloudCredentialId');

    if ( token !== null && token !== '') {
      const auth = {
        type:  'cloud',
        token
      };

      const options = await this.oci.request(auth, 'regions');

      return this.mapToContent(options);
    }

    return {
      value: '',
      label: '',
    };
  }),
  adChoices: computed('config.region', 'model.cloudCredentialId', async function() {
    let token = get(this, 'primaryResource.cloudCredentialId');
    let region = get(this, 'config.region');

    if (token !== null && token !== '' && region !== null && region !== '') {
      const auth = {
        type:  'cloud',
        token
      };

      const options = await this.oci.request(auth, 'availabilityDomains', { params: { region } });

      return this.mapToContent(options);
    }

    return {
      value: '',
      label: '',
    };
  }),
  nodeShapeChoices: computed('config.nodeCompartmentId', 'config.region', 'model.cloudCredentialId', async function() {
    let token = get(this, 'primaryResource.cloudCredentialId');
    let compartment = get(this, 'config.nodeCompartmentId');

    if (token !== null && token !== '' && compartment !== null && compartment !== ''
    && compartment.startsWith('ocid1.compartment')) {
      const auth = {
        type:  'cloud',
        token
      };
      const options = await this.oci.request(auth, 'nodeShapes', {
        params: {
          compartment,
          region:      get(this, 'config.region')
        }
      });

      return this.mapToContent(options);
    }

    return {
      value: '',
      label: '',
    };
  }),
  imageChoices: computed('config.nodeCompartmentId', 'config.region', 'model.cloudCredentialId', async function() {
    let token = get(this, 'primaryResource.cloudCredentialId');
    let compartment = get(this, 'config.nodeCompartmentId');

    if (token !== null && token !== '' && compartment !== null && compartment !== ''
    && compartment.startsWith('ocid1.compartment')) {
      const auth = {
        type:  'cloud',
        token
      };
      const options = await this.oci.request(auth, 'nodeImages', {
        params: {
          compartment,
          region:      get(this, 'config.region')
        }
      });

      return this.mapToContent(options);
    }

    return {
      value: '',
      label: '',
    };
  }),
  selectedAd: computed('config.nodeAvailabilityDomain', function() {
    const ad = get(this, 'config.nodeAvailabilityDomain');

    return ad;
  }),
  selectedNodeShape: computed('config.nodeShape', function() {
    const nodeShape = get(this, 'config.nodeShape');

    return nodeShape;
  }),
  selectedImage: computed('config.nodeImage', function() {
    const nodeImage = get(this, 'config.nodeImage');

    return nodeImage;
  }),
  selectedRegion: computed('config.region', function() {
    const region = get(this, 'config.region');

    return region;
  }),
  bootstrap() {
    const config = get(this, 'globalStore').createRecord({
      type:      'ociConfig',
      region:    '',
    });

    set(this, 'model.ociConfig', config);
  },
  mapToContent(folderOptions) {
    if (folderOptions && typeof folderOptions.map === 'function') {
      return folderOptions.map((option) => ({
        label: option,
        value: option
      }));
    }
  },
  validate() {
    function getRegionIdent(ocid) {
      var start = ocid.split('.', 3).join('.').length
      var end = ocid.split('.', 4).join('.').length

      return ocid.substring(start + 1, end);
    }

    // Get generic API validation errors
    this._super();
    var errors = get(this, 'errors') || [];

    if (!get(this, 'model.name')) {
      errors.push('Name is required');
    }

    if (!get(this, 'config.region')) {
      errors.push('Specifying a oci Region is required');
    }
    if (!get(this, 'config.nodeImage')) {
      errors.push('Specifying a oci node image is required');
    }
    if (!get(this, 'config.nodeShape')) {
      errors.push('Specifying a oci node shape is required');
    }
    if (!get(this, 'config.nodeCompartmentId') || !get(this, 'config.nodeCompartmentId').startsWith('ocid1.compartment')) {
      errors.push('Specifying a valid oci node compartment is required');
    }
    if (!get(this, 'config.nodeAvailabilityDomain')) {
      errors.push('Specifying a oci node availability domain is required');
    }
    if (!get(this, 'config.vcnCompartmentId')) {
      set(this, 'config.vcnCompartmentId', get(this, 'config.nodeCompartmentId'));
    } else {
      if (!get(this, 'config.vcnCompartmentId').startsWith('ocid1.compartment')) {
        errors.push('Specifying a valid oci VCN compartment is required');
      }
    }
    if (!get(this, 'config.vcnId') || !get(this, 'config.vcnId').startsWith('ocid1.vcn')) {
      errors.push('Specifying a valid oci VCN OCID is required');
    }
    if (!get(this, 'config.subnetId') || !get(this, 'config.subnetId').startsWith('ocid1.subnet')) {
      errors.push('Specifying a valid oci subnet OCID is required');
    }
    // phoenix and ashburn have different region identifiers
    if (get(this, 'config.region').includes('phoenix')) {
      if (!get(this, 'config.subnetId').includes('phx') || !get(this, 'config.vcnId').includes('phx')) {
        errors.push('The VCN and subnet must reside in the same region as the compute instance');
      }
    } else if (get(this, 'config.region').includes('ashburn')) {
      if (!get(this, 'config.subnetId').includes('iad') || !get(this, 'config.vcnId').includes('iad')) {
        errors.push('The VCN and subnet must reside in the same region as the compute instance');
      }
    } else {
      if (!get(this, 'config.region').includes(getRegionIdent(get(this, 'config.subnetId'))) ||
      !get(this, 'config.region').includes(getRegionIdent(get(this, 'config.vcnId')))) {
        errors.push('The VCN and subnet must reside in the same region as the compute instance');
      }
    }

    // Set the array of errors for display,
    // and return true if saving should continue.
    if (get(errors, 'length')) {
      set(this, 'errors', errors);

      return false;
    } else {
      set(this, 'errors', null);

      return true;
    }
  },
});
