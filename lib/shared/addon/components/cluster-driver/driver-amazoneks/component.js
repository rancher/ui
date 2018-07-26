import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import layout from './template';
import { INSTANCE_TYPES, nameFromResource, tagsFromResource } from 'shared/components/node-driver/driver-amazonec2/component';
import { get, set, setProperties, computed } from '@ember/object';
import { Promise, resolve } from 'rsvp';
import { alias, equal } from '@ember/object/computed';

const REGIONS = ['us-east-1', 'us-west-2'];
const RANCHER_GROUP         = 'rancher-nodes';

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


  selectedGroupedDetails: null,

  isCustomSecurityGroup:    equal('whichSecurityGroup', 'custom'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      clients:    {},
      allSubnets: []
    })

    let config = get(this, 'cluster.amazonElasticContainerServiceConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:         'amazonElasticContainerServiceConfig',
        accessKey:    null,
        secretKey:    null,
        region:       'us-west-2',
        instanceType: 'm4.large',
        minimumNodes: 1,
        maximumNodes: 3,
      });

      set(this, 'cluster.amazonElasticContainerServiceConfig', config);
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
      let options = Array.prototype.slice.call($('.existing-security-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      debugger;
      set(this, 'config.securityGroups', selectedOptions);
    },

    awsLogin(cb) {
      setProperties(this, {
        'errors':           [],
        'config.accessKey': (get(this, 'config.accessKey') || '').trim(),
        'config.secretKey': (get(this, 'config.secretKey') || '').trim(),
      });

      const auth    = {
        accessKeyId:     get(this, 'config.accessKey'),
        secretAccessKey: get(this, 'config.secretKey'),
        region:          get(this, 'config.region'),
      };

      this.listRoles(auth).then( (roles) => {
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

        eksRoles.insertAt(0, {
          RoleName: '--- select a role ---',
          RoleId:   null
        });

        set(this, 'serviceRoles', eksRoles);
        set(this, 'step', 2);
        cb();
      }).catch((err) => {
        get(this, 'errors').pushObject(err);
        cb(false);
      });
    },

    loadVPS(cb) {
      if (get(this, 'selectedServiceRole')) {
        set(this, 'config.serviceRole', get(this, 'selectedServiceRole'));
      }

      const auth    = {
        accessKeyId:     get(this, 'config.accessKey'),
        secretAccessKey: get(this, 'config.secretKey'),
        region:          get(this, 'config.region'),
      };

      this.loadNodeDetails(auth).then( () => {
        set(this, 'step', 3);

        cb();
      }).catch((err) => {
        get(this, 'errors').pushObject(err);
        cb(false);
      });
    },

    setVPCSubnet() {
      if (get(this, 'selectedGroupedDetails')) {
        let subnet = get(this, 'subnets').findBy('subnetId', get(this, 'selectedGroupedDetails'));
        let config = get(this, 'config');

        setProperties(config, {
          subnets:        [get(subnet, 'subnetId')],
          virtualNetwork: get(subnet, 'vpcId')
        });

        set(this, 'allSecurityGroups', this.filterSecurityGroups());

        set(this, 'step', 4);
      } else {
        set(this, 'step', 5);
      }
    },
  },

  readableServiceRole: computed('config.serviceRole', function() {
    const roles        = get(this, 'serviceRoles');
    const selectedRole = get(this, 'config.serviceRole');
    const match        = roles.findBy('RoleId', selectedRole);

    return get(match, 'RoleName');
  }),

  canSaveVPC: computed('vpcSubnetMode', 'selectedGroupedDetails', 'config.virtualNetwork', 'config.subnets.[]', function() {
    const mode    = get(this, 'vpcSubnetMode');
    const config  = get(this, 'config');
    const details = get(this, 'selectedGroupedDetails');

    let disabled = true;

    if (( mode === 'default' || details ) || ( get(config, 'virtualNetwork') && get(config, 'subnets.length') )) {
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

  filterSecurityGroups() {
    return get(this, 'securityGroups').filterBy('VpcId', get(this, 'config.virtualNetwork'));
  },

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
    const ec2      = new AWS.EC2(auth);
    const vpcNames = {};
    const vpcTags  = {};

    return new Promise((resolve, reject) => {
      ec2.describeVpcs({}, (err, vpcs) => {
        if ( err ) {
          reject(err)
        }

        vpcs.Vpcs.forEach((vpc) => {
          vpcNames[vpc.VpcId] = nameFromResource(vpc, 'VpcId');
          vpcTags[vpc.VpcId] = tagsFromResource(vpc);
        });

        resolve({
          vpcNames,
          vpcTags
        });
      });
    });
  },

  listSubnets(auth, vpcNames, vpcTags) {
    const ec2      = new AWS.EC2(auth);
    const rName   = get(this, 'config.region');
    const subnets = [];


    return new Promise((resolve, reject) => {
      ec2.describeSubnets({}, (err, data) => {
        if ( err ) {
          reject(err)
        }

        set(this, `clients.${ rName }`, ec2)

        data.Subnets.forEach((subnet) => {
          if ( (subnet.State || '').toLowerCase() !== 'available' ) {
            return;
          }

          subnets.pushObject({
            group: `${ vpcNames[subnet.VpcId] }`,
            // groupedname: `${ vpcNames[subnet.VpcId] || subnet.VpcId } - ${ nameFromResource(subnet, 'SubnetId') }`,
            subnetName:  nameFromResource(subnet, 'SubnetId'),
            subnetId:    subnet.SubnetId,
            subnetTags:  tagsFromResource(subnet),
            vpcName:     vpcNames[subnet.VpcId] || subnet.VpcId,
            vpcId:       subnet.VpcId,
            vpcTags:     vpcTags[subnet.VpcId] || [],
            zone:        subnet.AvailabilityZone,
            region:      rName
          });
        });

        subnets.insertAt(0, {
          subnetName: '--- select a vpc/subnet ---',
          subnetId:   null
        });


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

  loadNodeDetails(auth) {
    return this.listVPCs(auth).then( ( vpcDetails ) => {
      const { vpcNames, vpcTags } = vpcDetails;

      return this.listSubnets(auth, vpcNames, vpcTags).then((subnets) => {
        set(this, 'subnets', subnets);

        return this.listSecurityGroups(auth).then((groups) => {
          set(this, 'securityGroups', groups);

          resolve();
        });
      });
    });
  }
});
