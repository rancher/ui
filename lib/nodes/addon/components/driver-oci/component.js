import { alias } from '@ember/object/computed';
import { set, get, computed } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';

const regionMap = {
  'Mumbai':    'ap-mumbai-1',
  'Seoul':     'ap-seoul-1',
  'Tokyo':     'ap-tokyo-1',
  'Toronto':   'ca-toronto-1',
  'Frankfurt': 'eu-frankfurt-1',
  'Zurich':    'eu-zurich-1',
  'Sao Paolo': 'sa-saopaulo-1',
  'London':    'uk-london-1',
  'Ashburn':   'us-ashburn-1',
  'Phoenix':   'us-phoenix-1',
  'Amsterdam': 'eu-amsterdam-1',
  'Hyderabad': 'ap-hyderabad-1',
  'Jeddah':    'me-jeddah-1',
  'Osaka':     'ap-osaka-1',
  'Melbourne': 'ap-melbourne-1',
  'Sydney':    'ap-sydney-1',
  'Chuncheon': 'ap-chuncheon-1',
  'Montreal':  'ca-montreal-1',
}

const nodeShapeMap = {
  'VM.Standard1.1':          'VM.Standard1.1',
  'VM.Standard1.2':          'VM.Standard1.2',
  'VM.Standard1.4':          'VM.Standard1.4',
  'VM.Standard1.8':          'VM.Standard1.8',
  'VM.Standard1.16':         'VM.Standard1.16',
  'VM.Standard2.1':          'VM.Standard2.1',
  'VM.Standard2.2':          'VM.Standard2.2',
  'VM.Standard2.4':          'VM.Standard2.4',
  'VM.Standard2.8':          'VM.Standard2.8',
  'VM.Standard2.16':         'VM.Standard2.16',
  'VM.Standard2.24':         'VM.Standard2.24',
  'BM.Standard.E2.64':       'BM.Standard.E2.64',
  'BM.Standard2.52':         'BM.Standard2.52',
  'BM.Standard.B1.44':       'BM.Standard.B1.44',
  'BM.DenseIO2.52':          'BM.DenseIO2.52',
  'BM.HPC2.36':              'BM.HPC2.36',
  'VM.Standard.E2.1.Micro':  'VM.Standard.E2.1.Micro',
  'VM.Standard.E2.2':        'VM.Standard.E2.2',
  'VM.GPU2.1':               'VM.GPU2.1',
  'VM.GPU2.2':               'VM.GPU2.2',
  'VM.GPU3.1':               'VM.GPU3.1',
  'VM.GPU3.2':               'VM.GPU3.2',
  'VM.GPU3.4':               'VM.GPU3.4',
  'VM.GPU3.8':               'VM.GPU3.8',
}

const imageMap = { 'Oracle-Linux-7.8': 'Oracle-Linux-7.8', }

export default Component.extend(NodeDriver, {
  intl:     service(),
  settings: service(),

  layout,

  driverName:     'oci',
  region:         'us-phoenix-1',
  nodeImage:      'Oracle-Linux-7.8',
  step:            1,

  config: alias('model.ociConfig'),

  init() {
    this._super(...arguments);
  },

  actions: {
    finishAndSelectCloudCredential(credential) {
      set(this, 'model.cloudCredentialId', get(credential, 'id'))
    }
  },
  regionChoices: Object.entries(regionMap).map((e) => ({
    label: e[0],
    value: e[1]
  })),
  selectedRegion: computed('config.region', function() {
    const region = get(this, 'config.region');

    return region;
  }),
  adChoices: computed('config.region', function() {
    // TODO get these values dynamically from OCI API (/20160918/availabilityDomains)

    const region = get(this, 'config.region')
    var values

    // 3 availability domains available
    if (region === 'uk-london-1' || region === 'us-ashburn-1' || region === 'us-phoenix-1' || region === 'eu-frankfurt-1') {
      values = {
        'AD1': 'AD-1',
        'AD2': 'AD-2',
        'AD3': 'AD-3',
      };
    } else {
      // 1 availability domain available
      values = { 'AD1': 'AD-1', };
    }

    // get the keys
    let keys = Object.keys(values);
    // map the values into want you want
    let result = keys.map((key) => {
      return {
        label: values[key],
        value: values[key]
      }
    })

    return result
  }),
  selectedAd: computed('config.nodeAvailabilityDomain', function() {
    const ad = get(this, 'config.nodeAvailabilityDomain');

    return ad;
  }),
  nodeShapeChoices: Object.entries(nodeShapeMap).map((e) => ({
    label: e[1],
    value: e[0]
  })),
  selectednodeShape: computed('config.nodeShape', function() {
    const nodeShape = get(this, 'config.nodeShape');

    return nodeShape && nodeShapeMap[nodeShape];
  }),
  imageChoices: Object.entries(imageMap).map((e) => ({
    label: e[1],
    value: e[0]
  })),
  selectedImage: computed('config.nodeImage', function() {
    const nodeImage = get(this, 'config.nodeImage');

    return nodeImage && imageMap[nodeImage];
  }),
  bootstrap() {
    const config = get(this, 'globalStore').createRecord({
      type:      'ociConfig',
      region:    'us-phoenix-1',
      nodeImage: 'Oracle-Linux-7.8',
    });

    set(this, 'model.ociConfig', config);
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
