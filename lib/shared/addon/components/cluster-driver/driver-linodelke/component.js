/*!!!!!!!!!!!Do not change anything between here (the DRIVERNAME placeholder will be automatically replaced at buildtime)!!!!!!!!!!!*/
// https://github.com/rancher/ui/blob/master/lib/shared/addon/mixins/cluster-driver.js
import ClusterDriver from 'shared/mixins/cluster-driver';

// do not remove LAYOUT, it is replaced at build time with a base64 representation of the template of the hbs template
// we do this to avoid converting template to a js file that returns a string and the cors issues that would come along with that
const LAYOUT;
/*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/

const languages = {
  'en-us': {
    'clusterNew': {
      'linodelke': {
        'accessConfig': {
          'next': 'Proceed to Cluster Configuration',
          'loading': 'Verifying your access token',
          'title': 'Linode Account Access Configuration',
          'description': 'Provide us with the access token that will be used to access your Linode account'
        },
        "accessToken": {
          "label": "Access Token",
          "placeholder": "The access token to use for accessing your Linode account",
          "required": "Access Token is required",
          "invalid": "Access Token is invalid"
        },
        'clusterConfig': {
          'next': 'Proceed to Node pool selection',
          'loading': 'Saving your cluster configuration',
          'title': 'Cluster Configuration',
          'description': 'Clunfigure your cluster'
        },
        "region": {
          "label": "Region",
          "placeholder": "Select a region for your cluster",
          "required": "Region is required"
        },
        "kubernetesVersion": {
          "label": "Kubernetes Version",
          "placeholder": "Select a kubernetes version for your cluster",
          "required": "Kubernetes Version is required"
        },
        "tags": {
          "newTag": "New tag",
          "label": "Tags",
          "placeholder": "Add a new tag",
        },
        "nodePoolConfig": {
          'next': 'Create',
          'loading': 'Creating your cluster',
          'title': 'Node Pool Configuration',
          'description': 'Configure your desired node pools',
          'update': "Update"
        },
        "selectedNodePoolType": {
          "label": "Select type",
          "placeholder": "Select a node pool type"
        },
        "nodePools": {
          "label": "Selected Node Pools",
          "required": "Please add at least one node pool",
          "empty": "Sorry, node pool list is empty",
          "countError": "All node counts must be greater than 0.",
          "placeholder": "Please select a node type to add"
        }
      }
    }
  }
};

const k8sVersions = [];

// for tags
const newTag = "";

// for node pools
const selectedNodePoolType = "";
const selectedNodePoolObj = {};
const selectedNodePoolList = [];

/*!!!!!!!!!!!GLOBAL CONST START!!!!!!!!!!!*/
// EMBER API Access - if you need access to any of the Ember API's add them here in the same manner rather then import them via modules, since the dependencies exist in rancher we dont want to expor the modules in the amd def
const computed     = Ember.computed;
const observer     = Ember.observer;
const get          = Ember.get;
const set          = Ember.set;
const alias        = Ember.computed.alias;
const service      = Ember.inject.service;
const hash         = Ember.RSVP.hash;
const next         = Ember.run.next;

/*!!!!!!!!!!!GLOBAL CONST END!!!!!!!!!!!*/



/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(ClusterDriver, {
  driverName:  '%%DRIVERNAME%%',
  configField: '%%DRIVERNAME%%EngineConfig', // 'googleKubernetesEngineConfig'
  app:         service(),
  router:      service(),
  /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/
  session: service(),
  intl: service(),
  linode: service(),
  
  step: 1,
  lanChanged: null,
  refresh: false,

  init() {
    /*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
    // This does on the fly template compiling, if you mess with this :cry:
    const decodedLayout = window.atob(LAYOUT);
    const template      = Ember.HTMLBars.compile(decodedLayout, {
      moduleName: 'shared/components/cluster-driver/driver-%%DRIVERNAME%%/template'
    });
    set(this,'layout', template);

    this._super(...arguments);
    /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/

    // for languages
    const lang = get(this, 'session.language');
    get(this, 'intl.locale');
    this.loadLanguage(lang);

    let config      = get(this, 'config');
    let configField = get(this, 'configField');

    // for tags
    set(this, "newTag", "");
    
    // for node pools
    set(this, "selectedNodePoolType", "")
    set(this, "selectedNodePoolObj", {});
    set(this, "selectedNodePoolList", this.prefillSelectedNodePoolList());
    
    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:               configField,
        name: "",
        label: "",
        description: "",
        accessToken: "",
        region: "us-central",
        kubernetesVersion: "1.18",
        tags: [],
        nodePools: []
      });

      set(this, 'cluster.%%DRIVERNAME%%EngineConfig', config);
    }
  },

  config: alias('cluster.%%DRIVERNAME%%EngineConfig'),

  actions: {
    verifyAccessToken(cb) {
      const auth = {
        token: get(this, "cluster.%%DRIVERNAME%%EngineConfig.accessToken"),
      };
      let errors = [];
      const intl = get(this, "intl");

      if (!auth.token) {
        errors.push(intl.t("clusterNew.linodelke.accessToken.required"));
        set(this, "errors", errors);
        cb(false);
      } else {
        hash({
          regions: this.linode.request(auth, 'regions'),
          nodeTypes: this.linode.request(auth, 'linode/types'),
          k8sVersions: this.linode.request(auth, 'lke/versions'),
        }).then((responses) => {
          this.setProperties({
            errors: [],
            step: 2,
            regions: responses.regions.data.filter(region => (region.status === "ok" && region.capabilities.includes("Kubernetes"))),
            nodeTypes: responses.nodeTypes.data.filter(type => (type.class !== 'nanode' && type.class !== 'gpu')),
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
      const tags = get(this, "cluster.%%DRIVERNAME%%EngineConfig.tags");
      if (!tags) {
        set(this, "cluster.%%DRIVERNAME%%EngineConfig.tags", []);
      }
      set(this, "step", 3);
      cb(true);
    },
    
    createCluster(cb) {
      if (this.verifyNodePoolConfig()) {
        this.send("driverSave", cb);
      } else {
        cb(false);
      }
    },

    updateCluster(cb) {
      if (this.verifyNodePoolConfig()) {
        this.send("driverSave", cb);
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
      const tags = get(this, "cluster.%%DRIVERNAME%%EngineConfig.tags") || [];
      const newTag = get(this, "newTag");

      if (newTag) {
        tags.pushObject(newTag);
        set(this, "cluster.%%DRIVERNAME%%EngineConfig.tags", tags);
        set(this, "newTag", "");
      }
    },
    deleteTag(idx) {
      const tags = get(this, "cluster.%%DRIVERNAME%%EngineConfig.tags") || [];
      set(this, "cluster.%%DRIVERNAME%%EngineConfig.tags", tags.filter((tag, index) => index !== idx));
    },

    // for node pools
    addSelectedNodePool() {
      const selectedNodePoolObj = get(this, "selectedNodePoolObj");
      const selectedNodePoolList = get(this, "selectedNodePoolList");

      if (selectedNodePoolObj.id) {
        // add to list
        selectedNodePoolList.pushObject(selectedNodePoolObj);

        // clear selected
        set(this, "selectedNodePoolType", "");
        set(this, "selectedNodePoolObj", {});
      }
    },
    deleteNodePool(id) {
      const selectedNodePoolList = get(this, "selectedNodePoolList");

      set(this, "selectedNodePoolList", selectedNodePoolList.filter(n => n.id !== id))
    }
  },


  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();
    var errors = get(this, 'errors')||[];
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

  // Any computed properties or custom logic can go here

  // For languages
  languageChanged: observer('intl.locale', function() {
    const lang = get(this, 'intl.locale');

    if (lang) {
      this.loadLanguage(lang[0]);
    }
  }),
  loadLanguage(lang) {
    const translation = languages[lang] || languages['en-us'];
    const intl = get(this, 'intl');

    intl.addTranslations(lang, translation);
    intl.translationsFor(lang);
    set(this, 'refresh', false);
    next(() => {
      set(this, 'refresh', true);
      set(this, 'lanChanged', +new Date());
    });
  },

  clusterNameChanged: observer('cluster.name', function() {
    const clusterName = get(this, 'cluster.name');
    set(this, 'cluster.%%DRIVERNAME%%EngineConfig.name', clusterName);
    set(this, 'cluster.%%DRIVERNAME%%EngineConfig.label', clusterName);
  }),
  clusterDescriptionChanged: observer('cluster.description', function() {
    const clusterDescription = get(this, 'cluster.description');
    set(this, 'cluster.%%DRIVERNAME%%EngineConfig.description', clusterDescription);
  }),

  // For Access Token step
  accessConfigTitle: computed('intl.locale', 'langChanged', function() {
    return get(this, 'intl').t("clusterNew.linodelke.accessConfig.title");
  }),
  accessConfigDetail: computed('intl.locale', 'langChanged', function() {
    return get(this, 'intl').t("clusterNew.linodelke.accessConfig.description");
  }),

  // For Cluster Configuration Step
  clusterConfigTitle: computed('intl.locale', 'langChanged', function() {
    return get(this, 'intl').t("clusterNew.linodelke.clusterConfig.title");
  }),
  clusterConfigDetail: computed('intl.locale', 'langChanged', function() {
    return get(this, 'intl').t("clusterNew.linodelke.clusterConfig.description");
  }),

  // for region choises
  regionChoises: computed('regions', async function() {
    const ans = await get(this, "regions");
    return ans.map(e => {
      return {
        label: e.id,
        value: e.id
      }
    });
  }),

  // for kubernetes version
  k8sVersionChoises: computed("k8sVersions.[]", function() {
    const k8sVersions = get(this, "k8sVersions");
    return k8sVersions.map(v => {
      return {
        label: v.id,
        value: v.id
      }
    })
  }),

  // For Node Pool Configuration Step
  nodePoolConfigTitle: computed('intl.locale', 'langChanged', function() {
    return get(this, 'intl').t("clusterNew.linodelke.nodePoolConfig.title");
  }),
  nodePoolConfigDetail: computed('intl.locale', 'langChanged', function() {
    return get(this, 'intl').t("clusterNew.linodelke.nodePoolConfig.description");
  }),

  // for node pool choises
  nodePoolChoises: computed("nodeTypes.[]", "selectedNodePoolList.[]", async function() {
    const intl = get(this, 'intl');
    const ans = await get(this, "nodeTypes");
    const filteredAns = ans.filter(np => {
      // filter out the already selected node pools
      const selectedNodePoolList = get(this, "selectedNodePoolList");
      const fnd = selectedNodePoolList.find(snp => snp.id === np.id);
      if (fnd) return false;
      else return true;
    }).map(np => {
      return {
        label: np.label,
        value: np.id
      }
    });
    return [{label: intl.t("clusterNew.linodelke.nodePools.placeholder"), value: ""}, ...filteredAns];
  }),
  setSelectedNodePoolObj: observer("selectedNodePoolType", async function() {
    const nodePoolTypes = await get(this, "nodeTypes");
    const selectedNodePoolType = get(this, "selectedNodePoolType");

    if (selectedNodePoolType) {
      const ans = nodePoolTypes.find(np => np.id === selectedNodePoolType);
      set(this, "selectedNodePoolObj", {...ans, count: 1, memoryGb: ans.memory / 1024, diskGb: ans.disk / 1024});
    } else set(this, "selectedNodePoolObj", {});
  }),
  setNodePools: observer("selectedNodePoolList.@each.count", function() {
    const selectedNodePoolList = get(this, "selectedNodePoolList");
    const nodePools = selectedNodePoolList.map(np => {
      return `${np.id}=${np.count}`
    })
    set(this, "cluster.%%DRIVERNAME%%EngineConfig.nodePools", nodePools);
  }),

  verifyNodePoolConfig() {
    const intl = get(this, 'intl');
    const selectedNodePoolList = get(this, "selectedNodePoolList");
    const errors = [];

    if (selectedNodePoolList.length === 0) {
      errors.push(intl.t("clusterNew.linodelke.nodePools.required"));
      set(this, "errors", errors);
      return false;
    } else {
      const fnd = selectedNodePoolList.find(np => np.count <= 0);
      if (fnd) {
        errors.push(intl.t("clusterNew.linodelke.nodePools.countError"));
        set(this, "errors", errors);
        return false;
      }
      return true;
    }
  },

  // to prefil selected node pool list for edit mode
  prefillSelectedNodePoolListObserver: observer("nodeTypes.[]", function() {
    this.prefillSelectedNodePoolList();
  }),

  async prefillSelectedNodePoolList() {
    const nodePools = get(this, "cluster.%%DRIVERNAME%%EngineConfig.nodePools");
    const nodePoolTypes = await get(this, "nodeTypes");

    if (nodePools && nodePools.length) {
      set(this, "selectedNodePoolList", nodePools.map(np => {
        const [npId, cnt] = np.split("=");
        const fnd = nodePoolTypes.find(npt => npt.id === npId);
        if (fnd) {
          return {...fnd, count: cnt};
        } else return {id: npId, count: cnt, label: npId};
      }));
    } else {
      set(this, "selectedNodePoolList", []);
    }
  },
});
