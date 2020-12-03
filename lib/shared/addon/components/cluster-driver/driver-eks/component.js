import { isArray } from '@ember/array';
import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { equal, not, union } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { classify } from '@ember/string';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';
import { Promise, reject, resolve } from 'rsvp';
import { coerce, minor, lt } from 'semver';
import ClusterDriver from 'shared/mixins/cluster-driver';
import { EKS_REGIONS, EKS_VERSIONS, INSTANCE_TYPES, nameFromResource } from 'shared/utils/amazon';
import { randomStr } from 'shared/utils/util';
import layout from './template';
import { DEFAULT_NODE_GROUP_CONFIG, DEFAULT_EKS_CONFIG } from 'ui/models/cluster';

export default Component.extend(ClusterDriver, {
  intl:                 service(),
  versionChoiceService: service('version-choices'),
  layout,

  // config computed prop is setup in the clusterDriver mixin on init
  configField:                        'eksConfig',
  step:                               1,
  serviceRoles:                       null,
  securityGroups:                     null,
  whichSecurityGroup:                 'default',
  errors:                             null,
  otherErrors:                        null,
  clusterErrors:                      null,
  serviceRoleMode:                    'default',
  vpcSubnetMode:                      'default',
  allSecurityGroups:                  null,
  allKeyPairs:                        null,
  selectedServiceRole:                null,
  selectedGroupedDetails:             null,
  kmsKeys:                            null,

  cloudWatchAuditEnabled:             false,
  cloudWatchApiEnabled:               false,
  cloudWatchSchedulerEnabled:         false,
  cloudWatchControllerManagerEnabled: false,
  cloudWatchAuthenticatorEnabled:     false,
  loadFailedKmsKeys:                  false,
  isPostSave:                         false,

  instanceTypes:                      INSTANCE_TYPES,
  regionChoices:                      EKS_REGIONS,
  kubernetesVersionContent:           EKS_VERSIONS,

  isNew:                              not('editing'),
  isCustomSecurityGroup:              equal('whichSecurityGroup', 'custom'),
  editing:                            equal('mode', 'edit'),
  allErrors:                          union('errors', 'otherErrors', 'clusterErrors'),

  init() {
    this._super(...arguments);
    const { model: { cloudCredentials } } = this;

    setProperties(this, {
      allSubnets:    [],
      clients:       {},
      clusterErrors: [],
      errors:        [],
      kmsKeys:       [],
      otherErrors:   [],
    });

    let config = get(this, 'cluster.eksConfig');

    if ( !config ) {
      const ngConfig = DEFAULT_NODE_GROUP_CONFIG;
      const kubernetesVersion = this.kubernetesVersionContent.firstObject;

      set(ngConfig, 'version', kubernetesVersion);
      set(DEFAULT_EKS_CONFIG, 'kubernetesVersion', kubernetesVersion);
      set(DEFAULT_EKS_CONFIG, 'nodeGroups', [this.globalStore.createRecord(ngConfig)]);

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
      this.syncUpstreamConfig();

      const initalTags = { ...( config.tags || {} ) };

      set(this, 'initalTags', initalTags);

      if (this.mode === 'edit') {
        ( config.loggingTypes || [] ).forEach((option) => {
          set(this, `cloudWatch${ classify(option) }Enabled`, true);
        });
      }
    }
  },

  willDestroyElement() {
    setProperties(this, {
      step:       1,
      clients:    null,
      allSubnets: null,
    });
  },

  actions: {
    addNodeGroup() {
      let { config } = this;
      let { nodeGroups = [], kubernetesVersion } = config;

      if (!isArray(nodeGroups)) {
        nodeGroups = [];
      }

      const nodeGroup = this.globalStore.createRecord(DEFAULT_NODE_GROUP_CONFIG);

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
      let allKeyPairs;


      try {
        const authCreds = this.authCreds();

        // load* lists and manipulates, list* only lists
        await this.loadRoles(authCreds);
        await this.loadKMSKeys(authCreds)
        allKeyPairs = await this.listKeyPairs(authCreds);

        if (mode === 'edit') {
          step = 4;
        }

        setProperties(this, {
          allKeyPairs,
          step,
        });

        if (cb) {
          cb();
        }

        return true;
      } catch (err) {
        errors.pushObject(err.message);

        set(this, 'errors', errors);

        return cb(false, err);
      }
    },

    async loadSubnets(cb) {
      const { selectedServiceRole } = this;

      if (!isEmpty(selectedServiceRole)) {
        set(this, 'config.serviceRole', selectedServiceRole);
      }

      try {
        const subnets = await this.listSubnets(this.authCreds());

        set(this, 'allSubnets', subnets);
        set(this, 'step', 3);

        cb();
      } catch (err) {
        get(this, 'errors').pushObject(err);

        cb(false, err);
      }
    },

    setSubnets(cb) {
      if (get(this, 'vpcSubnetMode') === 'custom') {
        this.loadSecurityGroups(this.authCreds()).then(() => {
          set(this, 'step', 4);

          cb();
        }).catch((err) => {
          get(this, 'errors').pushObject(err);
          cb(false, err);
        });
      } else {
        set(this, 'step', 4);
      }
    },
  },

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

      console.log('loggingTypes: ', loggingTypes)
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
    return get(this, 'allKeyPairs').sortBy('KeyName');
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

  async loadRoles(auth) {
    let eksRoles = [];

    try {
      const awsRoles = await this.listRoles(auth);

      eksRoles = awsRoles.filter( (role) => {
        let policy    = JSON.parse(decodeURIComponent(get(role, 'AssumeRolePolicyDocument')));
        let statement = get(policy, 'Statement');
        let isEksRole = false;

        statement.forEach( (doc) => {
          let principal = get(doc, 'Principal');

          if (principal) {
            let service = get(principal, 'Service');

            if ( service && ( service.includes('eks.amazonaws') || service.includes('EKS') ) && !eksRoles.findBy('RoleId', get(role, 'RoleId'))) {
              // console.log(service.includes('eks'), service.includes('EKS'), eksRoles.findBy('RoleId', get(role, 'RoleId')), role)
              isEksRole = true;
            } else if (get(principal, 'EKS')) {
              // console.log(get(principal, 'EKS'), role);
              isEksRole = true;
            } else {
              isEksRole = false;
            }
          }
        });

        return isEksRole;
      });

      return resolve(set(this, 'serviceRoles', eksRoles));
    } catch (err) {
      return reject(err);
    }
  },

  loadSecurityGroups(auth) {
    return this.listSecurityGroups(auth).then( (resp) => {
      return resolve(set(this, 'allSecurityGroups', resp));
    });
  },

  listKeyPairs(auth) {
    return new Promise((resolve, reject) => {
      const ec2 = new AWS.EC2(auth);

      ec2.describeKeyPairs({}, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        }

        resolve(data.KeyPairs);
      });
    })
  },

  async loadKMSKeys(auth) {
    try {
      const kmsKeys = await this.listKMSKeys(auth)

      return resolve(set(this, 'kmsKeys', kmsKeys));
    } catch (err) {
      console.warn('Unable to load KMS Keys.', err); // eslint-disable-line
      // creators MAY not have access to KMS keys via IAM so dont kill everything because they dont
      // its not required
      set(this, 'loadFailedKmsKeys', true);

      return resolve();
    }
  },

  listKMSKeys(auth) {
    return new Promise((resolve, reject) => {
      // auth.endpoint = `kms.${ auth.region }.amazonaws.com`;

      const KMS = new AWS.KMS(auth);

      KMS.listKeys({}, (err, data) => {
        if (err) {
          console.error(err, err.stack);

          return reject(err);
        }

        return resolve(data.Keys);
      });
    });
  },

  listRoles(auth) {
    // TODO There is no IAM endpoint in cn-northwest-1 region. We need to use cn-north-1 for now. So users chould be able to create EKS cluster in cn-northwest-1.
    return new Promise((resolve, reject) => {
      const { region } = auth || {};

      if ( region === 'cn-northwest-1' ) {
        auth.region =  'cn-north-1';
        auth.endpoint = `iam.cn-north-1.amazonaws.com.cn`
      }

      const IAM = new AWS.IAM(auth);

      IAM.listRoles({}, (err, data) => {
        if (err) {
          // console.error(err, err.stack);
          return reject(err);
        }

        return resolve(data.Roles);
      });
    });
  },

  listSubnets(auth) {
    const ec2   = new AWS.EC2(auth);
    const rName = get(this, 'config.region');
    let subnets = [];


    return new Promise((resolve, reject) => {
      ec2.describeSubnets({}, (err, data) => {
        if ( err ) {
          reject(err)
        }

        set(this, `clients.${ rName }`, ec2)

        subnets = data.Subnets;

        resolve(subnets);
      });
    });
  },

  listSecurityGroups(auth) {
    const ec2     = new AWS.EC2(auth);

    return new Promise((resolve, reject) => {
      ec2.describeSecurityGroups({}, (err, data) => {
        if ( err ) {
          reject(err)
        }

        resolve(data.SecurityGroups);
      });
    });
  },

  willSave() {
    const {
      config:
      {
        displayName,
        subnets,
      }
    } = this;

    if (isEmpty(subnets)) {
      set(this, 'config.subnets', []);
    }

    if (isEmpty(displayName) || displayName === '(null)') {
      set(this.config, 'displayName', this.primaryResource.name);
    }

    return this._super(...arguments);
  },

  doSave(opt) {
    return get(this, 'primaryResource').save(opt).then((newData) => {
      return this.mergeResult(newData);
    });
  },

});
