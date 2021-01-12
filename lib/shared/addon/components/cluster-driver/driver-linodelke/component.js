import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Component.extend(ClusterDriver, {
  intl:        service(),
  linode:      service(),
  layout,
  configField: 'lkeEngineConfig',
  step:        1,
  lanChanged:  null,
  refresh:     false,

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.lkeEngineConfig');
    let configField = get(this, 'configField');

    setProperties(this, {
      'newTag':               '',
      'selectedNodePoolType': '',
      'selectedNodePoolObj':  {},
      'selectedNodePoolList': this.prefillSelectedNodePoolList(),
    });

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:              configField,
        name:              '',
        label:             '',
        description:       '',
        accessToken:       '',
        region:            'us-central',
        kubernetesVersion: '1.18',
        tags:              [],
        nodePools:         []
      });

      set(this, 'cluster.lkeEngineConfig', config);
    }
  },

  actions: {
    verifyAccessToken(cb) {
      const auth = { token: get(this, 'cluster.lkeEngineConfig.accessToken'), };
      let errors = [];
      const intl = get(this, 'intl');

      if (!auth.token) {
        errors.push(intl.t('clusterNew.linodelke.accessToken.required'));
        set(this, 'errors', errors);
        cb(false);
      } else {
        hash({
          regions:     this.linode.request(auth, 'regions'),
          nodeTypes:   this.linode.request(auth, 'linode/types'),
          k8sVersions: this.linode.request(auth, 'lke/versions'),
        }).then((responses) => {
          setProperties(this, {
            errors:      [],
            step:        2,
            regions:     responses.regions.data.filter((region) => (region.status === 'ok' && region.capabilities.includes('Kubernetes'))),
            nodeTypes:   responses.nodeTypes.data.filter((type) => (type.class !== 'nanode' && type.class !== 'gpu')),
            k8sVersions: responses.k8sVersions.data,
          });
          cb(true);
        }).catch((err) => {
          if (err && err.body && err.body.errors && err.body.errors[0]) {
            errors.push(`Error received from Linode: ${ err.body.errors[0].reason }`);
          } else {
            errors.push(`Error received from Linode`);
          }

          this.setProperties({ errors, });
          cb(false);
        });
      }
    },
    verifyClusterConfig(cb) {
      // verify if tags are not null
      // if null replace with empty array
      const tags = get(this, 'cluster.lkeEngineConfig.tags');

      if (!tags) {
        set(this, 'cluster.lkeEngineConfig.tags', []);
      }
      set(this, 'step', 3);
      cb(true);
    },
    createCluster(cb) {
      if (this.verifyNodePoolConfig()) {
        this.send('driverSave', cb);
      } else {
        cb(false);
      }
    },

    updateCluster(cb) {
      if (this.verifyNodePoolConfig()) {
        this.send('driverSave', cb);
      } else {
        cb(false);
      }
    },

    cancelFunc(cb){
      // probably should not remove this as its what every other driver uses to get back
      get(this, 'router').transitionTo('global-admin.clusters.index');
      cb(true);
    },

    // for tags
    addNewTag() {
      const tags = get(this, 'cluster.lkeEngineConfig.tags') || [];
      const newTag = get(this, 'newTag');

      if (newTag) {
        tags.pushObject(newTag);
        set(this, 'cluster.lkeEngineConfig.tags', tags);
        set(this, 'newTag', '');
      }
    },
    deleteTag(idx) {
      const tags = get(this, 'cluster.lkeEngineConfig.tags') || [];

      set(this, 'cluster.lkeEngineConfig.tags', tags.filter((tag, index) => index !== idx));
    },

    // for node pools
    addSelectedNodePool() {
      const selectedNodePoolObj = get(this, 'selectedNodePoolObj');
      const selectedNodePoolList = get(this, 'selectedNodePoolList');

      if (selectedNodePoolObj.id) {
        // add to list
        selectedNodePoolList.pushObject(selectedNodePoolObj);

        // clear selected
        set(this, 'selectedNodePoolType', '');
        set(this, 'selectedNodePoolObj', {});
      }
    },
    deleteNodePool(id) {
      const selectedNodePoolList = get(this, 'selectedNodePoolList');

      set(this, 'selectedNodePoolList', selectedNodePoolList.filter((n) => n.id !== id))
    }
  },


  // For languages
  clusterNameChanged: observer('cluster.name', function() {
    const clusterName = get(this, 'cluster.name');

    setProperties(this, {
      'cluster.lkeEngineConfig.name':  clusterName,
      'cluster.lkeEngineConfig.label': clusterName
    });
  }),
  clusterDescriptionChanged: observer('cluster.description', function() {
    const clusterDescription = get(this, 'cluster.description');

    set(this, 'cluster.lkeEngineConfig.description', clusterDescription);
  }),

  setSelectedNodePoolObj: observer('selectedNodePoolType', async function() {
    const nodePoolTypes = await get(this, 'nodeTypes');
    const selectedNodePoolType = get(this, 'selectedNodePoolType');

    if (selectedNodePoolType) {
      const ans = nodePoolTypes.find((np) => np.id === selectedNodePoolType);

      set(this, 'selectedNodePoolObj', {
        ...ans,
        count:    1,
        memoryGb: ans.memory / 1024,
        diskGb:   ans.disk / 1024
      });
    } else {
      set(this, 'selectedNodePoolObj', {});
    }
  }),
  setNodePools: observer('selectedNodePoolList.@each.count', function() {
    const selectedNodePoolList = get(this, 'selectedNodePoolList');
    const nodePools = selectedNodePoolList.map((np) => {
      return `${ np.id }=${ np.count }`
    })

    set(this, 'cluster.lkeEngineConfig.nodePools', nodePools);
  }),

  // to prefil selected node pool list for edit mode
  prefillSelectedNodePoolListObserver: observer('nodeTypes.[]', function() {
    this.prefillSelectedNodePoolList();
  }),

  // Any computed properties or custom logic can go here

  // for region choises
  regionChoises: computed('regions', async function() {
    const ans = await get(this, 'regions');

    return ans.map((e) => {
      return {
        label: e.id,
        value: e.id
      }
    });
  }),

  // for kubernetes version
  k8sVersionChoises: computed('k8sVersions.[]', function() {
    const k8sVersions = get(this, 'k8sVersions');

    return k8sVersions.map((v) => {
      return {
        label: v.id,
        value: v.id
      }
    })
  }),

  // for node pool choises
  nodePoolChoises: computed('nodeTypes.[]', 'selectedNodePoolList.[]', async function() {
    const intl = get(this, 'intl');
    const ans = await get(this, 'nodeTypes');
    const filteredAns = ans.filter((np) => {
      // filter out the already selected node pools
      const selectedNodePoolList = get(this, 'selectedNodePoolList');
      const fnd = selectedNodePoolList.find((snp) => snp.id === np.id);

      if (fnd) {
        return false;
      } else {
        return true;
      }
    }).map((np) => {
      return {
        label: np.label,
        value: np.id
      }
    });

    return [{
      label: intl.t('clusterNew.linodelke.nodePools.placeholder'),
      value: ''
    }, ...filteredAns];
  }),
  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();
    var errors = get(this, 'errors') || [];

    if ( !get(this, 'cluster.name') ) {
      errors.push('Name is required');
    }

    // Add more specific errors

    // Check something and add an error entry if it fails:
    // if ( parseInt(get(this, 'config.memorySize'), defaultRadix) < defaultBase ) {
    //   errors.push('Memory Size must be at least 1024 MB');
    // }

    // Set the array of errors for display,
    // and return true if saving should continue.
    if ( get(errors, 'length') ) {
      set(this, 'errors', errors);

      return false;
    } else {
      set(this, 'errors', null);

      return true;
    }
  },

  verifyNodePoolConfig() {
    const intl = get(this, 'intl');
    const selectedNodePoolList = get(this, 'selectedNodePoolList');
    const errors = [];

    if (selectedNodePoolList.length === 0) {
      errors.push(intl.t('clusterNew.linodelke.nodePools.required'));
      set(this, 'errors', errors);

      return false;
    } else {
      const fnd = selectedNodePoolList.find((np) => np.count <= 0);

      if (fnd) {
        errors.push(intl.t('clusterNew.linodelke.nodePools.countError'));
        set(this, 'errors', errors);

        return false;
      }

      return true;
    }
  },

  async prefillSelectedNodePoolList() {
    const nodePools = get(this, 'cluster.lkeEngineConfig.nodePools');
    const nodePoolTypes = await get(this, 'nodeTypes');

    if (nodePools && nodePools.length) {
      set(this, 'selectedNodePoolList', nodePools.map((np) => {
        const [npId, cnt] = np.split('=');
        const fnd = nodePoolTypes.find((npt) => npt.id === npId);

        if (fnd) {
          return {
            ...fnd,
            count: cnt
          };
        } else {
          return {
            id:    npId,
            count: cnt,
            label: npId
          };
        }
      }));
    } else {
      set(this, 'selectedNodePoolList', []);
    }
  },
});
