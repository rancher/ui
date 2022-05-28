import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { equal } from '@ember/object/computed'
import { get, set, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { OCI_REGIONS } from 'shared/utils/oci';
import { compare } from 'shared/utils/parse-version';

const vcnIdMap = { quick: 'Quick Create', }

const subnetAccessMap = {
  public:  'Public',
  private: 'Private',
}

export default Component.extend(ClusterDriver, {
  intl:              service(),
  layout,
  configField:       'okeEngineConfig',
  instanceConfig:    '',
  step:              1,
  lanChanged:        null,
  refresh:           false,
  vcnCreationMode:   'none',
  vpcs:              null,
  subnets:           null,
  eipIds:            null,
  nodeFlavors:       null,
  keypairs:          null,
  availableZones:    null,
  authRegionChoices: OCI_REGIONS,
  isNew:             equal('mode', 'new'),
  editing:           equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.okeEngineConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:                  'okeEngineConfig',
        secretKey:             '',
        clusterName:           '',
        vcnCidr:               '10.0.0.0/16',
        kubernetesVersion:     '',
        region:                'us-phoenix-1',
        nodeShape:             'VM.Standard2.1',
        nodeImage:             '',
        nodeUserDataContents:  '',
        vcn:                   '',
        securityListId:        '',
        cpSubnetAccess:        'public',
        npSubnetAccess:        'private',
        flexOcpus:             0,
        memory:                0,
        quantityPerSubnet:     1,
        quantityOfNodeSubnets: 1,
        kmsKeyId:              '',
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

    authenticateOCI(cb) {
      const store = get(this, 'globalStore')
      const data = {
        tenancyOCID:          get(this, 'cluster.okeEngineConfig.tenancyId'),
        userOCID:             get(this, 'cluster.okeEngineConfig.userOcid'),
        region:               get(this, 'cluster.okeEngineConfig.region'),
        fingerprint:          get(this, 'cluster.okeEngineConfig.fingerprint'),
        privateKey:           get(this, 'cluster.okeEngineConfig.privateKeyContents'),
        privateKeyPassphrase: get(this, 'cluster.okeEngineConfig.privateKeyPassphrase'),
        compartmentOCID:      get(this, 'cluster.okeEngineConfig.compartmentId')
      };


      const ociRequest = {
        okeVersions: store.rawRequest({
          url:    '/meta/oci/okeVersions',
          method: 'POST',
          data
        })
      }

      return hash(ociRequest).then((resp) => {
        const { okeVersions } = resp;

        setProperties(this, {
          okeVersions:  (get( okeVersions, 'body') || []).sort((a, b) => compare(a, b) < 0), // latest version first
          errors:       [],
        });

        // latest version by default
        set(this, 'config.kubernetesVersion', (get(this, 'okeVersions')[0] || null))

        set(this, 'step', 2);
        cb(true);
      }).catch((xhr) => {
        const err = xhr.body.message || xhr.body.code || xhr.body.error;

        setProperties(this, { errors: [err], });

        cb(false, [err]);
      });
    },
    loadNodeConfig(cb) {
      const store = get(this, 'globalStore')
      const data = {
        tenancyOCID:          get(this, 'cluster.okeEngineConfig.tenancyId'),
        userOCID:             get(this, 'cluster.okeEngineConfig.userOcid'),
        region:               get(this, 'cluster.okeEngineConfig.region'),
        fingerprint:          get(this, 'cluster.okeEngineConfig.fingerprint'),
        privateKey:           get(this, 'cluster.okeEngineConfig.privateKeyContents'),
        privateKeyPassphrase: get(this, 'cluster.okeEngineConfig.privateKeyPassphrase'),
        compartmentOCID:      get(this, 'cluster.okeEngineConfig.compartmentId')
      };


      const ociRequest = {
        availabilityDomains: store.rawRequest({
          url:    '/meta/oci/availabilityDomains',
          method: 'POST',
          data
        }),
        nodeShapes: store.rawRequest({
          url:    '/meta/oci/nodeShapes',
          method: 'POST',
          data
        }),
        nodeImages: store.rawRequest({
          url:    '/meta/oci/nodeOkeImages',
          method: 'POST',
          data
        })
      }

      return hash(ociRequest).then((resp) => {
        const {
          availabilityDomains, nodeShapes, nodeImages,
        } = resp;

        setProperties(this, {
          availabilityDomais:   (get(availabilityDomains, 'body') || []),
          nodeShapes:           (get( nodeShapes, 'body') || [] ).reverse(),
          nodeImages:           (get( nodeImages, 'body') || [] ),
          errors:                [],
        });

        set(this, 'step', 3);
        cb(true);
      }).catch((xhr) => {
        const err = xhr.body.message || xhr.body.code || xhr.body.error;

        setProperties(this, { errors: [err] });

        cb(false, [err]);
      });
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
      if (get(this, 'config.vcnCompartmentId') === '') {
        set(this, 'config.vcnCompartmentId', get(this, 'config.compartmentId'));
      }

      if (get(this, 'config.subnetAccess') === 'public') {
        set(this, 'config.enablePrivateNodes', false);
      } else {
        set(this, 'config.enablePrivateNodes', true);
      }
      if (get(this, 'config.cpSubnetAccess') === 'public') {
        set(this, 'config.enablePrivateControlPlane', false);
      } else {
        set(this, 'config.enablePrivateControlPlane', true);
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
  selectedSubnetAccess: computed('config.npSubnetAccess', function() {
    const subnetAccess = get(this, 'config.npSubnetAccess');

    return subnetAccess && subnetAccessMap[subnetAccess];
  }),
  selectedControlPlaneSubnetAccess: computed('config.cpSubnetAccess', function() {
    const cpSubnetAccess = get(this, 'config.cpSubnetAccess');

    return cpSubnetAccess && subnetAccessMap[cpSubnetAccess];
  }),
  canAuthenticate: computed('config.tenancyId', 'config.region', 'config.userOcid', 'config.fingerprint', 'config.privateKeyContents', function() {
    return get(this, 'config.tenancyId') && get(this, 'config.region') && get(this, 'config.userOcid') && get(this, 'config.fingerprint') && get(this, 'config.privateKeyContents') ? false : true;
  }),
  canAddK8sVersion: computed('config.kubernetesVersion', 'config.compartmentId', function() {
    return !(get(this, 'config.compartmentId') && get(this, 'config.kubernetesVersion'));
  }),

  canSaveVCN: computed('vcnCreationMode', 'config.vcnName', 'config.loadBalancerSubnetName1', 'config.loadBalancerSubnetName2', 'config.npSubnetAccess', 'config.vcnCidr', function() {
    const mode = get(this, 'vcnCreationMode');

    if (mode === 'Quick') {
      return false;
    } else if (mode === 'Existing') {
      // Driver will use the same compartment as the cluster if not set.
      return (get(this, 'config.vcnName') && get(this, 'config.loadBalancerSubnetName1')) ? false : true;
    } else if (mode === 'Custom') {
      return (get(this, 'config.npSubnetAccess') && get(this, 'config.vcnCidr')) ? false : true;
    }

    return true;
  }),
  canCreateCluster: computed('config.nodeShape', 'config.nodeImage', function() {
    return !(get(this, 'config.nodeShape') && get(this, 'config.nodeImage'));
  }),
  isFlex: computed('config.nodeShape', function() {
    return (get(this, 'config.nodeShape').includes('Flex'));
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

    const kmsKeyOcid = get(this, 'config.kmsKeyId');

    if ((kmsKeyOcid.length > 0) && !kmsKeyOcid.startsWith('ocid1.key')) {
      errors.push('Not a valid kms key OCID');
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
      if (get(this, 'config.vcnCompartmentId') === '') {
        set(this, 'config.vcnCompartmentId', get(this, 'config.compartmentId'));
      }
      if (get(this, 'config.vcnName') !== '') {
        set(this, 'config.skipVcnDelete', true);
      }
      if (get(this, 'config.cpSubnetAccess') === 'public') {
        set(this, 'config.enablePrivateControlPlane', false);
      } else {
        set(this, 'config.enablePrivateControlPlane', true);
      }
      if (get(this, 'config.npSubnetAccess') === 'public') {
        set(this, 'config.enablePrivateNodes', false);
      } else {
        set(this, 'config.enablePrivateNodes', true);
      }
    }

    return this._super(...arguments);
  },
});
