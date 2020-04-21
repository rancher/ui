import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { equal } from '@ember/object/computed'
import { compare } from 'shared/utils/parse-version';
import { get, set, computed, setProperties } from '@ember/object';
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
}

const k8sVersionMap = {
  'v1.15.7': 'v1.15.7', // default
  'v1.14.8': 'v1.14.8',
}

const vcnIdMap = { quick: 'Quick Create', }

const subnetAccessMap = {
  public:  'Public',
  private: 'Private',
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

const imageMap = {
  'Oracle-Linux-7.6': 'Oracle-Linux-7.6',
  'Oracle-Linux-7.5': 'Oracle-Linux-7.5',
  'Oracle-Linux-7.4': 'Oracle-Linux-7.4',
}

export default Component.extend(ClusterDriver, {
  intl:            service(),
  layout,
  configField:     'okeEngineConfig',

  instanceConfig:  '',
  step:            1,
  lanChanged:      null,
  refresh:         false,
  vcnCreationMode: '',
  vpcs:                    null,
  subnets:                 null,
  eipIds:                  null,
  nodeFlavors:             null,
  keypairs:                null,
  availableZones:          null,

  isNew:                   equal('mode', 'new'),
  editing:                 equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.okeEngineConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:                  'okeEngineConfig',
        secretKey:             '',
        clusterName:           '',
        vcnCidr:               '10.0.0.0/16',
        kubernetesVersion:     'v1.15.7',
        region:                'us-phoenix-1',
        vcn:                   '',
        securityListId:        '',
        subnetAccess:          'public',
        cpu:                   0,
        memory:                0,
        quantityPerSubnet:     1,
        quantityOfNodeSubnets: 1,
      });

      set(this, 'cluster.okeEngineConfig', config);
    }

    // init cpu and memory
    const {
      cpu,
      memory
    } = get(this, 'config');

    if (cpu && memory) {
      set(this, 'instanceConfig', `${ get(this, 'config.cpu') }/${ get(this, 'config.memory') }`);
    }
  },

  actions: {
    // TODO implement authenticateOCI

    authenticateOCI(cb) {
      setProperties(this, {

        'errors':                                       null,
        'config.userOcid':             (get(this, 'config.userOcid') || '').trim(),
        'config.secretKey':            (get(this, 'config.secretKey') || '').trim(),
        'config.privateKeyPassphrase': (get(this, 'config.privateKeyPassphrase') || '').trim(),
        'config.region':               (get(this, 'config.region')),

      });

      set(this, 'step', 2);
      cb(true);
    },

    // TODO re-implement loadNodeConfig
    loadNodeConfig(cb) {
      set(this, 'step', 3);
      cb(true);
    },

    // TODO implement loadInstanceConfig
    loadInstanceConfig(cb) {
      set(this, 'errors', null);
      set(this, 'step', 4);
      cb(true);
    },
    upgradeCluster(cb) {
      setProperties(this, { 'errors': null });

      const errors = get(this, 'errors') || [];
      const intl = get(this, 'intl');

      const quantityPerSubnet = get(this, 'config.quantityPerSubnet');
      const kubernetesVersion = get(this, 'config.kubernetesVersion');

      if (!quantityPerSubnet) {
        errors.push(intl.t('clusterNew.oke.quantityPerSubnet.required'));
      } else {
        const maxNodeCount = get(this, 'config.maxNodeCount');

        if (!/^\d+$/.test(quantityPerSubnet) || parseInt(quantityPerSubnet, 10) < 0 || parseInt(quantityPerSubnet, 10) > maxNodeCount) {
          errors.push(intl.t('clusterNew.oke.quantityPerSubnet.error', { max: maxNodeCount }));
        }
      }
      if (!kubernetesVersion) {
        errors.push(intl.t('clusterNew.oke.version.required'));
      }

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb();

        return;
      }

      this.send('driverSave', cb);
    },
    save(cb) {
      setProperties(this, {
        'errors':        null,
        'otherErrors':   null,
        'clusterErrors': null,
      });

      const errors = get(this, 'errors') || [];

      if (errors.length > 0) {
        set(this, 'errors', errors);
        cb(false);

        return;
      }
      if (!this.validate()) {
        cb(false);

        return;
      }
      if (get(this, 'config.nodeImage') === '') {
        set(this, 'config.nodeImage', imageMap['Oracle-Linux-7.6']);
      }
      if (get(this, 'config.vcnCompartmentId') === '') {
        set(this, 'config.vcnCompartmentId', get(this, 'config.compartmentId'));
      }

      if (get(this, 'config.subnetAccess') === 'public') {
        set(this, 'config.enablePrivateNodes', false);
      } else {
        set(this, 'config.enablePrivateNodes', true);
      }

      this.send('driverSave', cb);
    },
    cancel() {
      get(this, 'router').transitionTo('global-admin.clusters.index');
    },
    cpuAndMemoryChanged(item) {
      setProperties(this, {
        'config.cpu':    item.raw.cpuCount,
        'config.memory': item.raw.memoryCapacityInGB
      });
    }
  },

  maxNodeCount: computed('clusterQuota.slave', () => {
    return 256;
  }),
  regionChoices: Object.entries(regionMap).map((e) => ({
    label: e[0],
    value: e[1]
  })),
  selectedRegion: computed('config.region', function() {
    const region = get(this, 'config.region');

    return region;
  }),
  vcnChoices: Object.entries(vcnIdMap).map((e) => ({
    label: e[1],
    value: e[0]
  })),
  selectedVCN: computed('config.vcnId', function() {
    const vcnId = get(this, 'config.vcnId');

    return vcnId && vcnIdMap[vcnId];
  }),
  subnetAccessChoices: Object.entries(subnetAccessMap).map((e) => ({
    label: e[1],
    value: e[0]
  })),
  selectedSubnetAccess: computed('config.subnetAccess', function() {
    const subnetAccess = get(this, 'config.subnetAccess');

    return subnetAccess && subnetAccessMap[subnetAccess];
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
  k8sVersionChoices: Object.entries(k8sVersionMap).map((e) => ({
    label: e[1],
    value: e[0]
  })),
  k8sUpgradeVersionChoices: computed('config.kubernetesVersion', function() {
    let supportedVersions = Object.assign({}, k8sVersionMap);
    var currentVersion = get(this, 'config.kubernetesVersion');

    Object.keys(supportedVersions)
      .filter((key) => (compare(key, currentVersion) < 0))
      .forEach((key) => delete supportedVersions[key]);

    return Object.entries(supportedVersions).map((e) => ({
      label: e[1],
      value: e[0]
    }));
  }),
  selectedk8sVersion: computed('config.kubernetesVersion', function() {
    const k8sVersion = get(this, 'config.kubernetesVersion');

    return k8sVersion && k8sVersionMap[k8sVersion];
  }),
  canAuthenticate: computed('config.tenancyId', 'config.compartmentId', 'config.userOcid', 'config.fingerprint', 'config.privateKeyContents', function() {
    return get(this, 'config.tenancyId') && get(this, 'config.compartmentId') && get(this, 'config.userOcid') && get(this, 'config.fingerprint') && get(this, 'config.privateKeyContents') ? false : true;
  }),

  canSaveVCN: computed('vcnCreationMode', 'config.vcnName', 'config.loadBalancerSubnetName1', 'config.loadBalancerSubnetName2', 'config.subnetAccess', 'config.vcnCidr', function() {
    const mode = get(this, 'vcnCreationMode');

    if (mode === 'Quick') {
      return false;
    } else if (mode === 'Existing') {
      // Driver will use the same compartment as the cluster if not set.
      return (get(this, 'config.vcnName') && get(this, 'config.loadBalancerSubnetName1')) ? false : true;
    } else if (mode === 'Custom') {
      return (get(this, 'config.subnetAccess') && get(this, 'config.vcnCidr')) ? false : true;
    }

    return true;
  }),
  canCreateCluster: computed('config.nodeShape', function() {
    return get(this, 'config.nodeShape') ? false : true;
  }),

  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();
    var errors = get(this, 'errors') || [];

    if (!get(this, 'cluster.name')) {
      errors.push('Name is required');
    }

    const tenancyId = get(this, 'config.tenancyId');

    if (!tenancyId.startsWith('ocid1.tenancy')) {
      errors.push('A valid tenancy OCID is required');
    }

    const compartmentId = get(this, 'config.compartmentId');

    if (!compartmentId.startsWith('ocid1.compartment')) {
      errors.push('A valid compartment OCID is required');
    }

    const userOcid = get(this, 'config.userOcid');

    if (!userOcid.startsWith('ocid1.user')) {
      errors.push('A valid user OCID is required');
    }

    // TODO Add more specific errors

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
  willSave() {
    if (get(this, 'mode') === 'new') {
      if (get(this, 'config.nodeImage') === '') {
        set(this, 'config.nodeImage', imageMap['Oracle-Linux-7.6']);
      }
      if (get(this, 'config.vcnCompartmentId') === '') {
        set(this, 'config.vcnCompartmentId', get(this, 'config.compartmentId'));
      }


      if (get(this, 'config.subnetAccess') === 'public') {
        set(this, 'config.enablePrivateNodes', false);
      } else {
        set(this, 'config.enablePrivateNodes', true);
      }
    }

    return this._super(...arguments);
  },
});
