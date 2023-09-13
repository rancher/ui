import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { equal } from '@ember/object/computed'
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { OCI_REGIONS } from 'shared/utils/oci';
import { task } from 'ember-concurrency';

export default Component.extend(ClusterDriver, {
  intl:                service(),
  oci:                 service(),
  canChangeNetworking: true,
  layout,
  configField:         'ociocneEngineConfig',
  step:                1,
  vcnCreationMode:     'Quick',
  isNew:               equal('mode', 'new'),
  editing:             equal('mode', 'edit'),

  init() {
    this._super(...arguments);
    set(this, 'nodePools', A())
    set(this, 'yamls', A())
    let config = get(this, 'cluster.ociocneEngineConfig');

    if (!config) {
      config = this.get('globalStore').createRecord({
        type:                 'ociocneEngineConfig',
        clusterName:          '',
        region:               'us-ashburn-1',
        nodeShape:            'VM.Standard.E4.Flex',
        controlPlaneShape:    'VM.Standard.E4.Flex',
        imageDisplayName:     '',
        numWorkerNodes:       1,
        numControlPlaneNodes: 1,
        vcnId:                '',
        workerNodeSubnet:     '',
        controlPlaneSubnet:   '',
        loadBalancerSubnet:   '',
        installCalico:        true,
        compartmentId:        '',
      });

      set(this, 'cluster.ociocneEngineConfig', config);
    }
  },

  actions: {
    async saveStep1(cb) {
      const errors = [];
      const token = get(this, 'primaryResource.cloudCredentialId');
      const compartment = get(this, 'config.compartmentId');
      const intl = get(this, 'intl');

      this.loadValues()
      if (!token) {
        errors.push(intl.t('clusterNew.ociocne.cloudCredentialId.invalid'))
      }

      if (!compartment || (!compartment.startsWith('ocid1.compartment') && !compartment.startsWith('ocid1.tenancy'))) {
        errors.push(intl.t('clusterNew.ociocne.compartmentId.invalid'))
      }

      set(this, 'errors', errors)
      if (errors.length > 0) {
        cb();

        return;
      }

      const auth = {
        type: 'cloud',
        token
      };

      try {
        // Fetch images for compartment
        let images = await this.oci.request(auth, 'nodeImages', {
          params: {
            compartment,
            region: get(this, 'config.region')
          }
        })

        images = images.filter((image) => image.startsWith('Oracle-Linux-8') && !image.includes('aarch64'));
        set(this, 'cluster.ociocneEngineConfig.imageDisplayName', images[0])
        set(this, 'cluster.ociocneEngineConfig.cloudCredentialId', token)
        setProperties(this, {
          // Only bring in Oracle Linux 8 Platform Images
          nodeImages: images,
          errors: [],
        });

        let verrazzanoVersions = await this.oci.get(auth, 'verrazzanoVersions', {params: {region: get(this, 'config.region')}}, '/meta/ocne')

        set(this, 'verrazzanoVersions', verrazzanoVersions)
        set(this, 'step', 2);
        cb(true);
      } catch (ex) {
        errors.push(`Failed to authenticate to OCI: ${JSON.stringify(ex)}`)
      }
      set(this, 'errors', errors)
      if (errors.length > 0) {
        cb();
      }
    },
    finishAndSelectCloudCredential(credential) {
      if (get(this, 'mode') === 'new') {
        set(this, 'primaryResource.cloudCredentialId', get(credential, 'id'))
      }
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

      this.saveValues()
      if (!this.validate()) {
        cb(false);

        return;
      }

      this.send('driverSave', cb);
    },
    cancel() {
      get(this, 'router').transitionTo('global-admin.clusters.index');
    },
    onCompartmentSelect(node) {
      set(this, 'config.compartmentId', node.id);
    },
    errorHandler(e) {
      if (e !== null) {
        console.log(e);
      }
    },
  },
  credentialObserver: observer('primaryResource.cloudCredentialId', function() {
    // when the credential changes, refresh the list of compartments
    this.get('fetchCompartmentsTask').perform();
  }),
  authRegionChoices: computed(() => {
    return OCI_REGIONS.map((region) => {
      return {
        value: region,
        label: region
      }
    });
  }),
  compartmentName: computed('flatCompartments', 'config.compartmentId', function() {
    const compartment = this.flatCompartments?.find((c) => c.id === this.config.compartmentId);

    return compartment?.name;
  }),
  cloudCredentials: computed('globalStore', 'model.cloudCredentials.[]', 'originalSecret', function() {
    const { model: { cloudCredentials } } = this;

    const out = cloudCredentials.filter((cc) => Object.prototype.hasOwnProperty.call(cc, 'ocicredentialConfig'));

    if ( this.originalSecret && !out.find((x) => x.id === this.originalSecret ) ) {
      const obj = this.globalStore.createRecord({
        name:                   `${ this.originalSecret.replace(/^cattle-global-data:/, '') } (current)`,
        id:                     this.originalSecret,
        type:                   'cloudCredential',
        ocicredentialConfig: {},
      });

      out.push(obj);
    }

    return out;
  }),
  // a flat list of compartments to populate hidden select options (so chosen compartment shows in dropdown)
  flatCompartments: computed('compartments', function() {
    let compartments = [];

    function addCompartment(c) {
      if (c) {
        compartments.push({
          id:   c.id,
          name: c.name
        });
        c.compartments?.forEach((child) => addCompartment(child));
      }
    }
    addCompartment(this.get('compartments'));

    return compartments;
  }),
  // a tree structure for heirarchical view of compartments for compartmentId
  compartmentTree: computed('fetchedCompartmentsValue', 'compartments', function()  {
    let tree = [];

    let rootCompartment = get(this, 'compartments');

    if (rootCompartment) {
      this.addCompartmentToTree(rootCompartment, tree);
    }

    return tree;
  }),
  canAuthenticate: computed('config.compartmentId', 'config.region', function() {
    return !(get(this, 'config.compartmentId') && get(this, 'config.region'));
  }),
  // asynchronously fetch list of compartments from oci. Called anytime cloudCredentialId changes (via credentialObserver)
  fetchCompartmentsTask: task(function *() {
    const token = get(this, 'primaryResource.cloudCredentialId');

    if (token && token !== '') {
      const auth = {
        type: 'cloud',
        token
      };

      let compartments = yield this.oci.request(auth, 'compartments', {});

      set(this, 'compartments', compartments);

      return compartments;
    }
  }),
  iterateOverCompartments(compartments, children) {
    compartments.forEach( ((compartment) => {
      this.addCompartmentToTree(compartment, children);
    }));
  },
  addCompartmentToTree(compartment, children) {
    let node = {
      id:         compartment.id,
      name:       compartment.name,
      isExpanded: false,
      isSelected: false,
      isVisible:  true,
      children:   [],
    };

    children.push(node);

    if (compartment.compartments) {
      this.iterateOverCompartments(compartment.compartments, node.children);
    }
  },
  willSave() {
    return this._super(...arguments);
  },
  loadValues() {
    this.loadYAMLS()
  },
  loadYAMLS() {
    const serialized = get(this, 'config.applyYamls')
    let deserialized = A()

    if (serialized) {
      for (let i = 0; i < serialized.length; i++) {
        deserialized.pushObject({
          name: this.newRandomizedName(),
          body: serialized[i],
        })
      }
    }

    set(this, 'yamls', deserialized)
  }
})
