import { isArray } from '@ember/array';
import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { alias, equal, not, union } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { classify } from '@ember/string';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';
import { Promise, allSettled } from 'rsvp';
import { coerce, minor, lt } from 'semver';
import ClusterDriver from 'shared/mixins/cluster-driver';
import { EKS_REGIONS, EKS_VERSIONS, nameFromResource } from 'shared/utils/amazon';
import { randomStr } from 'shared/utils/util';
import layout from './template';
import { DEFAULT_NODE_GROUP_CONFIG, DEFAULT_EKS_CONFIG, DEFAULT_USER_DATA } from 'ui/models/cluster';


export default Component.extend(ClusterDriver, {
  intl:                 service(),
  versionChoiceService: service('version-choices'),
  layout,

  // config computed prop is setup in the clusterDriver mixin on init
  configField:            'eksConfig',
  step:                   1,
  serviceRoles:           null,
  securityGroups:         null,
  whichSecurityGroup:     'default',
  errors:                 null,
  otherErrors:            null,
  clusterErrors:          null,
  serviceRoleMode:        'default',
  vpcSubnetMode:          'default',
  allImages:              null,
  allSecurityGroups:      null,
  allKeyPairs:            null,
  allLaunchTemplates:     null,
  selectedServiceRole:    null,
  selectedGroupedDetails: null,
  kmsKeys:                null,
  instanceTypes:          null,

  cloudWatchAuditEnabled:             false,
  cloudWatchApiEnabled:               false,
  cloudWatchSchedulerEnabled:         false,
  cloudWatchControllerManagerEnabled: false,
  cloudWatchAuthenticatorEnabled:     false,
  loadFailedKmsKeys:                  false,
  isPostSave:                         false,

  regionChoices:            EKS_REGIONS,
  kubernetesVersionContent: EKS_VERSIONS,

  isNew:                 not('editing'),
  isCustomSecurityGroup: equal('whichSecurityGroup', 'custom'),
  editing:               equal('mode', 'edit'),
  clusterState:          alias('model.originalCluster.state'),
  allErrors:             union('errors', 'otherErrors', 'clusterErrors'),

  init() {
    this._super(...arguments);
    const {
      clusterIsPending,
      editing,
      model: { cloudCredentials }
    } = this;

    setProperties(this, {
      allSubnets:    [],
      clients:       {},
      clusterErrors: [],
      errors:        [],
      kmsKeys:       [],
      otherErrors:   [],
      instanceTypes: [],
    });

    let config = get(this, 'cluster.eksConfig');

    if ( !config ) {
      const kubernetesVersion = this.kubernetesVersionContent.firstObject;
      const ngConfig = {
        ...DEFAULT_NODE_GROUP_CONFIG,
      };

      set(ngConfig, 'launchTemplate', this.globalStore.createRecord({
        name:    '',
        id:      null,
        version: null,
        type:    'launchTemplate'
      }));

      set(ngConfig, 'version', kubernetesVersion);
      setProperties(DEFAULT_EKS_CONFIG, {
        kubernetesVersion,
        nodeGroups: [this.globalStore.createRecord(ngConfig)],
      })

      config = this.globalStore.createRecord(DEFAULT_EKS_CONFIG);

      if (!isEmpty(cloudCredentials)) {
        const singleMatch = cloudCredentials.find((cc) => {
          if (!isEmpty(get(cc, 'amazonec2credentialConfig'))) {
            return true;
          }
        });

        if (singleMatch) {
          set(config, 'amazonCredentialSecret', singleMatch.id);
        }
      }

      set(this, 'cluster.eksConfig', config);
    } else {
      if ( editing && clusterIsPending ) {
        set(this, 'step', 5);
      } else {
        this.syncUpstreamConfig();

        const initalTags = { ...( config.tags || {} ) };

        set(this, 'initalTags', initalTags);

        if (this.mode === 'edit') {
          ( config.loggingTypes || [] ).forEach((option) => {
            set(this, `cloudWatch${ classify(option) }Enabled`, true);
          });
        }
      }
    }
  },

  willDestroyElement() {
    setProperties(this, {
      step:          1,
      clients:       null,
      allSubnets:    null,
      instanceTypes: [],
    });
  },

  actions: {
    getAuthCreds() {
      return this.authCreds()
    },
    addNodeGroup() {
      let { config } = this;
      let { nodeGroups = [], kubernetesVersion } = config;
      const ngConfig = {
        ...DEFAULT_NODE_GROUP_CONFIG,
      };

      set(ngConfig, 'launchTemplate', this.globalStore.createRecord({
        name:    '',
        id:      null,
        version: null,
        type:    'launchTemplate',
      }));

      if (!isArray(nodeGroups)) {
        nodeGroups = [];
      }

      const nodeGroup = this.globalStore.createRecord(ngConfig);

      set(nodeGroup, 'version', kubernetesVersion);

      nodeGroups.pushObject(nodeGroup);

      set(this, 'config.nodeGroups', nodeGroups);
    },

    removeNodeGroup(nodeGroup) {
      let { config: { nodeGroups = [] } } = this;

      if (!isEmpty(nodeGroups)) {
        nodeGroups.removeObject(nodeGroup);
      }

      set(this, 'config.nodeGroups', nodeGroups);
    },

    setTags(section) {
      set(this, 'config.tags', section);
    },

    finishAndSelectCloudCredential(cred) {
      if (cred) {
        set(this, 'config.amazonCredentialSecret', get(cred, 'id'));


        this.send('startAwsConfiguration');
      }
    },

    multiSecurityGroupSelect() {
      let options = Array.prototype.slice.call($('.existing-security-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'config.securityGroups', selectedOptions);
    },

    multiSubnetGroupSelect() {
      let options = Array.prototype.slice.call($('.existing-subnet-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'config.subnets', selectedOptions);
    },

    async startAwsConfiguration(cb) {
      const errors   = [];
      const { mode } = this;
      let step       = 2;


      try {
        await allSettled([
          this.loadRoles(),
          this.loadKMSKeys(),
          this.loadInstanceTypes(),
          this.loadLaunchTemplates(),
          this.loadKeyPairs(),
        ]);

        if (mode === 'edit') {
          step = 4;
        }

        set(this, 'step', step);

        if (cb) {
          cb();
        }

        return true;
      } catch (err) {
        errors.pushObject(err.message);

        set(this, 'errors', errors);

        return cb ? cb(false, err) : err;
      }
    },

    async loadSubnets(cb = function() {}) {
      const { selectedServiceRole } = this;

      if (!isEmpty(selectedServiceRole)) {
        set(this, 'config.serviceRole', selectedServiceRole);
      }

      try {
        const subnets = await this.describeResource(['EC2', 'describeSubnets', 'Subnets']);

        setProperties(this, {
          allSubnets: subnets,
          step:       3,
        })

        cb();
      } catch (err) {
        get(this, 'errors').pushObject(err);

        cb(false, err);
      }
    },

    async setSubnets(cb) {
      try {
        if (get(this, 'vpcSubnetMode') === 'custom') {
          await this.loadSecurityGroups();
        }

        set(this, 'step', 4);

        cb();
      } catch (err) {
        get(this, 'errors').pushObject(err);

        cb(false, err);
      }
    },
  },

  clusterChanged: observer('originalCluster.state', function() {
    if ( get(this, 'step') >= 2 ) {
      const state = get(this, 'originalCluster.state')

      if ( !['active', 'pending', 'initializing', 'waiting'].includes(state) ) {
        if (this.close) {
          this.close();
        }
      }
    }
  }),

  resetKms: observer('config.secretsEncryption', function() {
    if (!get(this, 'config.secretsEncryption')) {
      set(this, 'config.kmsKey', null);
    }
  }),

  cloudWatchLoggingChanged: observer(
    'cloudWatchApiEnabled',
    'cloudWatchAuditEnabled',
    'cloudWatchAuthenticatorEnabled',
    'cloudWatchControllerManagerEnabled',
    'cloudWatchSchedulerEnabled',
    function() {
      let { config: { loggingTypes = [] } } = this;
      const logOpts = ['audit', 'api', 'scheduler', 'controllerManager', 'authenticator'];

      if (!isArray(loggingTypes)) {
        loggingTypes = [];
      }

      logOpts.forEach((option) => {
        const value = get(this, `cloudWatch${ classify(option) }Enabled`);

        if (value) {
          loggingTypes.addObject(option);
        } else {
          loggingTypes.removeObject(option);
        }
      });

      set(this, 'config.loggingTypes', loggingTypes);
    }),

  serviceRoleModeDidChange: observer('serviceRoleMode', function() {
    const mode = get(this, 'serviceRoleMode');

    if ( mode === 'custom' ) {
      const role = get(this, 'serviceRoles.firstObject.RoleName');

      if ( role ) {
        set(this, 'selectedServiceRole', role);
      }
    } else {
      set(this, 'selectedServiceRole', null);
    }
  }),

  postSaveChanged: observer('isPostSave', function() {
    const {
      isNew,
      isPostSave,
      config: { privateAccess, publicAccess }
    } = this;

    if (!publicAccess && privateAccess && isPostSave) {
      if (isNew) {
        set(this, 'step', 5);
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }),

  importedClusterIsPending: computed('clusterIsPending', 'model.originalCluster', function() {
    const { clusterIsPending } = this;
    const originalCluster = get(this, 'model.originalCluster');
    const ourClusterSpec = get(( originalCluster ?? {} ), 'eksConfig');
    const upstreamSpec = get(( originalCluster ?? {} ), 'eksStatus.upstreamSpec');

    return clusterIsPending && get(ourClusterSpec, 'imported') && !isEmpty(upstreamSpec);
  }),

  clusterIsPending: computed('clusterState', function() {
    const { clusterState } = this;

    return ['pending', 'provisioning', 'waiting'].includes(clusterState);
  }),

  cloudCredentials: computed('model.cloudCredentials', function() {
    const { model: { cloudCredentials } } = this;

    return cloudCredentials.filter((cc) => !isEmpty(get(cc, 'amazonec2credentialConfig')));
  }),

  selectedCloudCredential: computed('config.amazonCredentialSecret', function() {
    const {
      model: { cloudCredentials = [] },
      config: { amazonCredentialSecret }
    } = this;

    if (isEmpty(cloudCredentials) && isEmpty(amazonCredentialSecret)) {
      return null;
    } else {
      return cloudCredentials.findBy('id', amazonCredentialSecret.includes('cattle-global-data:') ? amazonCredentialSecret : `cattle-global-data:${ amazonCredentialSecret }`);
    }
  }),

  selectedSubnets: computed('config.subnets.[]', 'primaryResource.eksStatus.subnets.[]', function() {
    const {
      config: { subnets },
      primaryResource: { eksStatus: { subnets: generatedSubnets } = { } },
    } = this;

    if (isEmpty(subnets)) {
      if (!isEmpty(generatedSubnets)) {
        return generatedSubnets;
      }

      return [];
    }

    return subnets;
  }),

  disableVersionSelect: computed('', 'config.kubernetesVersion', 'nodeGroupsVersionCollection', function() {
    const kubernetesVersion = get(this, 'config.kubernetesVersion');

    return get(this, 'nodeGroupsVersionCollection').any((version) => lt(coerce(version), coerce(kubernetesVersion)));
  }),

  nodeGroupsVersionCollection: computed('config.nodeGroups.@.eachversion', function() {
    return (get(this, 'config.nodeGroups') || []).map((ng) => ng.version).uniq();
  }),

  versionChoices: computed('editing', 'kubernetesVersionContent', 'nodeGroupsVersionCollection.[]', function() {
    const {
      config,
      intl,
      kubernetesVersionContent,
      mode,
    } = this;
    let { kubernetesVersion: initialVersion } = config;

    if (isEmpty(initialVersion)) {
      initialVersion = kubernetesVersionContent[0];
    }

    const  versionChoices = this.versionChoiceService.parseCloudProviderVersionChoices(kubernetesVersionContent.slice(), initialVersion, mode);

    // only EKS and edit - user can only upgrade a single minor version at a time
    if (this.editing) {
      if (!versionChoices.findBy('value', initialVersion)) {
        versionChoices.unshift({
          label: initialVersion,
          value: initialVersion,
        });
      }

      const initalMinorVersion = parseInt(minor(coerce(initialVersion)), 10);

      versionChoices.forEach((vc) => {
        const vcMinorV = parseInt(minor(coerce(vc.value)), 10);
        const diff     = vcMinorV - initalMinorVersion;

        if (diff > 1) {
          setProperties(vc, {
            disabled: true,
            label:    `${ vc.label } ${ intl.t('formVersions.eks.label') }`,
          });
        }
      })
    }

    return versionChoices;
  }),

  filteredKeyPairs: computed('allKeyPairs', function() {
    return ( get(this, 'allKeyPairs') ?? [] ).sortBy('KeyName');
  }),

  groupedSubnets: computed('filteredSubnets.[]', function() {
    const { filteredSubnets } = this;
    const out = [];

    filteredSubnets.forEach((subnet) => {
      var vpc = get(subnet, 'group');

      if ( vpc ) {
        var group = out.filterBy('group', vpc)[0];

        if ( !group ) {
          group = {
            group:   vpc,
            subnets: []
          };
          out.push(group);
        }

        group.subnets.push(subnet);
      }
    });

    return out.sortBy('group');
  }),

  filteredSubnets: computed('allSubnets', function() {
    return get(this, 'allSubnets').map( (subnet) => {
      return {
        subnetName: nameFromResource(subnet, 'SubnetId'),
        subnetId:   subnet.SubnetId,
        group:      subnet.VpcId
      }
    }).sortBy('subnetName');
  }),

  filteredSecurityGroups: computed('allSecurityGroups', 'config.subnets.[]', function() {
    const {
      config: { subnets: configSubnets = [] },
      filteredSubnets
    } = this;
    const selectedSubnets = filteredSubnets.filter((fs) => configSubnets.includes(fs.subnetId));

    return get(this, 'allSecurityGroups').filter((sg) => {
      return  selectedSubnets.findBy('group', sg.VpcId)
    }).sortBy('GroupName');
  }),

  readableServiceRole: computed('config.serviceRole', 'serviceRoles', function() {
    const roles        = get(this, 'serviceRoles');
    const selectedRole = get(this, 'config.serviceRole');
    const match        = roles.findBy('RoleName', selectedRole);

    return match && match.RoleName ? get(match, 'RoleName') : this.intl.t('nodeDriver.amazoneks.role.noneSelected');
  }),

  syncUpstreamConfig() {
    const originalCluster = get(this, 'model.originalCluster').clone();
    const ourClusterSpec = get(originalCluster, 'eksConfig');
    const upstreamSpec = get(originalCluster, 'eksStatus.upstreamSpec');

    if (!isEmpty(upstreamSpec)) {
      Object.keys(ourClusterSpec).forEach((k) => {
        if (isEmpty(get(ourClusterSpec, k)) && !isEmpty(get(upstreamSpec, k))) {
          set(this, `config.${ k }`, get(upstreamSpec, k));
        }
      });
    }
  },

  authCreds() {
    let {
      config: {
        region,
        amazonCredentialSecret
      }
    } = this;

    const auth = {
      accessKeyId:         randomStr(),
      secretAccessKey:     randomStr(),
      region,
      httpOptions:         { cloudCredentialId: amazonCredentialSecret.includes('cattle-global-data') ? amazonCredentialSecret : `cattle-global-data:${ amazonCredentialSecret }` },
    };


    return auth;
  },

  async loadRoles() {
    let eksRoles = [];

    try {
      const auth = { ...this.authCreds() };
      const { region } = auth;

      if ( region === 'cn-northwest-1' ) {
        auth.region =  'cn-north-1';
        auth.endpoint = `iam.cn-north-1.amazonaws.com.cn`
      }

      const awsRoles = await this.describeResource(['IAM', 'listRoles', 'Roles'], {}, auth);

      eksRoles = awsRoles.filter( (role) => {
        let policy    = JSON.parse(decodeURIComponent(get(role, 'AssumeRolePolicyDocument')));
        let statement = get(policy, 'Statement');
        let isEksRole = false;

        statement.forEach( (doc) => {
          let principal = get(doc, 'Principal');

          if (principal) {
            let service = get(principal, 'Service');

            if ( service && ( service.includes('eks.amazonaws') || service.includes('EKS') ) && !eksRoles.findBy('RoleId', get(role, 'RoleId'))) {
              isEksRole = true;
            } else if (get(principal, 'EKS')) {
              isEksRole = true;
            } else {
              isEksRole = false;
            }
          }
        });

        return isEksRole;
      });

      set(this, 'serviceRoles', eksRoles);
    } catch (err) {
      get(this, 'errors').pushObject(err);
    }
  },

  async loadSecurityGroups() {
    try {
      const securityGroups = await this.describeResource(['EC2', 'describeSecurityGroups', 'SecurityGroups']);

      set(this, 'allSecurityGroups', securityGroups);
    } catch (err) {
      get(this, 'errors').pushObject(err);
    }
  },

  async loadLaunchTemplates() {
    try {
      const launchTemplates = await this.describeResource(['EC2', 'describeLaunchTemplates', 'LaunchTemplates']);

      set(this, 'allLaunchTemplates', launchTemplates);
    } catch (err) {
      get(this, 'errors').pushObject(err);
    }
  },

  async loadInstanceTypes() {
    try {
      const instanceTypes = await this.describeResource(['EC2', 'describeInstanceTypes', 'InstanceTypes']);

      set(this, 'instanceTypes', instanceTypes);
    } catch (err) {
      get(this, 'errors').pushObject(err);
    }
  },

  async loadImages() {
    // this is can be VERY expensive if `ExecutableUsers` is excluded
    // I am not sure if that param is even correct nor do I think we should use this
    // I am leaving in for dev purpose remove before pr
    try {
      const images = await this.describeResource(['EC2', 'describeImages', 'Images'], {
        ExecutableUsers: ['self'],
        Filters:         [{
          Name:   'state',
          Values: ['available']
        }]
      });

      set(this, 'allImages', images);
    } catch (err) {
      get(this, 'errors').pushObject(err);
    }
  },

  async loadKeyPairs() {
    try {
      const allKeyPairs = await this.describeResource(['EC2', 'describeKeyPairs', 'KeyPairs']);

      set(this, 'allKeyPairs', allKeyPairs);
    } catch (err) {
      get(this, 'errors').pushObject(err);
    }
  },

  async loadKMSKeys() {
    try {
      const kmsKeys = await this.describeResource(['KMS', 'listKeys', 'Keys']);

      set(this, 'kmsKeys', kmsKeys)
    } catch (err) {
      // creators MAY not have access to KMS keys via IAM so dont kill everything because they dont
      // its not required
      set(this, 'loadFailedKmsKeys', true);
    }
  },

  willSave() {
    const { config } = this;
    const {
      displayName, subnets, nodeGroups
    } = config;

    if (isEmpty(subnets)) {
      set(this, 'config.subnets', []);
    }

    if (isEmpty(displayName) || displayName === '(null)') {
      set(this.config, 'displayName', this.primaryResource.name);
    }

    nodeGroups.forEach(( ng ) => {
      const { launchTemplate } = ng;

      if (!isEmpty(launchTemplate)) {
        const {
          id, version, name
        } = launchTemplate;

        if (isEmpty(id) && isEmpty(version) && isEmpty(name)) {
          set(ng, 'launchTemplate', null);
        }

        // we dont want to send the example user data
        if (ng.userData === DEFAULT_USER_DATA) {
          set(ng, 'userData', null);
        }
      }
    });

    return this._super(...arguments);
  },

  doSave(opt) {
    return get(this, 'primaryResource').save(opt).then((newData) => {
      return this.mergeResult(newData);
    });
  },

  describeResource(apiDescription, params = {}, authCreds = this.authCreds()) {
    const [awsClassName, awsSDKMethod, responseKey] = apiDescription;
    const klass = new AWS[awsClassName](authCreds);

    return new Promise((resolve, reject) => {
      klass[awsSDKMethod](params, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data[responseKey]);
      })
    })
  }
});
