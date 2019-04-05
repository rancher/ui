import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import layout from './template';
import { INSTANCE_TYPES, nameFromResource, tagsFromResource } from 'shared/utils/amazon';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import { Promise, resolve } from 'rsvp';
import { equal } from '@ember/object/computed';

const REGIONS = ['us-east-1', 'us-west-2', 'us-east-2', 'eu-west-1', 'eu-central-1', 'eu-north-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2'];
const RANCHER_GROUP         = 'rancher-nodes';
const VERSIONS = ['1.11', '1.10', '1.12'];

export default Component.extend(ClusterDriver, {
  layout,

  configField:              'amazonElasticContainerServiceConfig',
  instanceTypes:            INSTANCE_TYPES,
  regionChoices:            REGIONS,
  step:                     1,
  serviceRoles:             null,
  securityGroups:           null,
  whichSecurityGroup:       'default',
  defaultSecurityGroupName: RANCHER_GROUP,
  errors:                   null,
  serviceRoleMode:          'default',
  vpcSubnetMode:            'default',
  allSecurityGroups:        null,
  selectedServiceRole:      null,
  selectedGroupedDetails:   null,
  kubernetesVersionContent: VERSIONS,

  isCustomSecurityGroup:    equal('whichSecurityGroup', 'custom'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      clients:    {},
      allSubnets: []
    })

    let config = get(this, 'cluster.amazonElasticContainerServiceConfig');

    if ( !config ) {
      config = get(this, 'globalStore').createRecord({
        type:              'amazonElasticContainerServiceConfig',
        accessKey:         null,
        secretKey:         null,
        region:            'us-west-2',
        instanceType:      'm4.large',
        minimumNodes:      1,
        maximumNodes:      3,
        kubernetesVersion: '1.11'
      });

      set(this, 'cluster.amazonElasticContainerServiceConfig', config);
    } else {
      if (get(this, 'mode') === 'edit' && get(this, 'cluster.hasSessionToken')) {
        set(this, 'cluster.amazonElasticContainerServiceConfig.accessKey', null);
      }
      set(this, 'initialVersion', get(this, 'config.kubernetesVersion'));
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
    multiSecurityGroupSelect() {
      let options = Array.prototype.slice.call(this.$('.existing-security-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'config.securityGroups', selectedOptions);
    },

    multiSubnetGroupSelect() {
      let options = Array.prototype.slice.call(this.$('.existing-subnet-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'config.subnets', selectedOptions);
    },

    awsLogin(cb) {
      this.listRoles(this.authCreds()).then( (roles) => {
        let eksRoles = [];

        eksRoles = roles.filter( (role) => {
          //
          let policy = JSON.parse(decodeURIComponent(get(role, 'AssumeRolePolicyDocument')));
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

          if (isEksRole) {
            return role;
          }
        });

        set(this, 'serviceRoles', eksRoles);
        set(this, 'step', 2);
        cb();
      }).catch((err) => {
        get(this, 'errors').pushObject(err);
        cb(false, err);
      });
    },

    loadVPS(cb) {
      if (get(this, 'selectedServiceRole')) {
        set(this, 'config.serviceRole', get(this, 'selectedServiceRole'));
      }

      this.loadVpcs(this.authCreds()).then(() => {
        set(this, 'step', 3);

        cb();
      }).catch((err) => {
        get(this, 'errors').pushObject(err);
        cb(false, err);
      });
    },

    setVPCS(cb) {
      if (get(this, 'vpcSubnetMode') === 'custom') {
        this.loadSubnets(this.authCreds()).then(() => {
          set(this, 'step', 4);

          cb();
        }).catch((err) => {
          get(this, 'errors').pushObject(err);
          cb(false, err);
        });
      } else {
        set(this, 'step', 6);
      }
    },

    setSubnets(cb) {
      this.loadSecurityGroups(this.authCreds()).then(() => {
        set(this, 'step', 5);

        cb();
      }).catch((err) => {
        get(this, 'errors').pushObject(err);
        cb(false, err);
      });
    },
  },

  publicIpChanged: observer('config.associateWorkerNodePublicIp', function() {
    if (!get(this, 'config.associateWorkerNodePublicIp')) {
      set(this, 'vpcSubnetMode', 'custom');
    }
  }),

  vpcSubnetModeDidChange: observer('vpcSubnetMode', function() {
    const mode = get(this, 'vpcSubnetMode');

    if ( mode === 'custom' ) {
      const vpc = get(this, 'filteredVpcs.firstObject.id');

      if ( vpc ) {
        set(this, 'config.virtualNetwork', vpc);
      }
    }
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

  vpcsChanged: observer('config.virtualNetwork', 'vpcSubnetMode', function() {
    const vnet = get(this, 'config.virtualNetwork');
    const mode = get(this, 'vpcSubnetMode');

    if (vnet && mode === 'custom') {
      this.loadSubnets(this.authCreds()).catch((err) => {
        get(this, 'errors').pushObject(err);
      });
    } else if (mode === 'default') {
      setProperties(get(this, 'config'), {
        virtualNetwork: null,
        subnets:        [],
      });

      set(this, 'step', 3);
    }
  }),

  filteredSubnets: computed('allSubnets', function() {
    return get(this, 'allSubnets').filterBy('VpcId', get(this, 'config.virtualNetwork')).map( (subnet) => {
      return {
        subnetName:  nameFromResource(subnet, 'SubnetId'),
        subnetId:    subnet.SubnetId,
      }
    }).sortBy('subnetName');
  }),


  filteredVpcs: computed('allVpcs', function() {
    return get(this, 'allVpcs').filterBy('State', 'available').map((vpc) => {
      return {
        id:    get(vpc, 'VpcId'),
        label: `${ get(vpc, 'VpcId') } (${ get(vpc, 'CidrBlock') })`
      };
    }).sortBy('label');
  }),

  filteredSecurityGroups: computed('allSecurityGroups', function() {
    return get(this, 'allSecurityGroups').filterBy('VpcId', get(this, 'config.virtualNetwork')).sortBy('GroupName');
  }),

  readableServiceRole: computed('config.serviceRole', function() {
    const roles        = get(this, 'serviceRoles');
    const selectedRole = get(this, 'config.serviceRole');
    const match        = roles.findBy('RoleName', selectedRole);

    return get(match, 'RoleName');
  }),

  canSaveVPC: computed('vpcSubnetMode', 'selectedGroupedDetails', 'config.virtualNetwork', 'config.subnets.[]', function() {
    const mode   = get(this, 'vpcSubnetMode');
    const config = get(this, 'config');
    let disabled = true;

    if (mode === 'default' ||  get(config, 'virtualNetwork') ) {
      disabled = false;
    }

    return disabled;
  }),

  canSaveSG: computed('config.securityGroups.[]', function() {
    const sg = get(this, 'config.securityGroups');

    let disabled = true;

    if (sg && sg.length > 0) {
      disabled = false;
    }

    return disabled;
  }),

  validate() {
    const model = get(this, 'cluster');
    const errors = model.validationErrors();

    const minimumNodes = get(this, 'config.minimumNodes')
    const maximumNodes = get(this, 'config.maximumNodes')

    if (maximumNodes < minimumNodes) {
      errors.pushObject(`Maximum ASG Size should greater Minimum ASG Size`)
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  authCreds() {
    const config = get(this, 'config');

    let {
      accessKey, secretKey, region, sessionToken
    } = config;

    accessKey    = (accessKey || '').trim();
    secretKey    = ( secretKey || '' ).trim();

    setProperties(this, {
      'errors':           [],
      'config.accessKey': accessKey,
      'config.secretKey': secretKey,
    });

    const auth    = {
      region,
      accessKeyId:     accessKey,
      secretAccessKey: secretKey,
    };

    if (sessionToken) {
      let token = sessionToken.trim();

      set(auth, 'sessionToken', token);
      set(this, 'config.sessionToken', token);
    }

    return auth;
  },

  loadVpcs(auth) {
    return this.listVPCs(auth).then( (resp) => {
      let { vpcs } = resp;

      let def = vpcs.findBy('IsDefault');

      if (def && def.VpcId) {
        set(this, 'config.virtualNetwork', get(def, 'VpcId'));
      }

      return resolve(set(this, 'allVpcs', vpcs));
    });
  },

  loadSubnets(auth) {
    return this.listSubnets(auth).then( (resp) => {
      return resolve(set(this, 'allSubnets', resp));
    });
  },

  loadSecurityGroups(auth) {
    return this.listSecurityGroups(auth).then( (resp) => {
      return resolve(set(this, 'allSecurityGroups', resp));
    });
  },

  listRoles(auth) {
    return new Promise((resolve, reject) => {
      const IAM = new AWS.IAM(auth);

      IAM.listRoles({}, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        }

        resolve(data.Roles);
      });
    })
  },

  listVPCs(auth) {
    return new Promise((resolve, reject) => {
      const ec2      = new AWS.EC2(auth);
      const vpcNames = {};
      const vpcTags  = {};

      ec2.describeVpcs({}, (err, vpcs) => {
        if ( err ) {
          return reject(err);
        }

        vpcs.Vpcs.forEach((vpc) => {
          vpcNames[vpc.VpcId] = nameFromResource(vpc, 'VpcId');
          vpcTags[vpc.VpcId] = tagsFromResource(vpc);
        });

        return resolve({
          vpcNames,
          vpcTags,
          vpcs: vpcs.Vpcs
        });
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
});
