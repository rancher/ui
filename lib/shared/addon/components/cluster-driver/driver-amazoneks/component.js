import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
// import { get, set } from '@ember/object';
import layout from './template';
import {
  INSTANCE_TYPES, nameFromResource, tagsFromResource
} from 'shared/components/node-driver/driver-amazonec2/component';
import EmberObject, {
  get, set, setProperties
} from '@ember/object';

const REGIONS = ['us-east-1', 'us-west-2'];

export default Component.extend(ClusterDriver, {
  layout,
  configField: 'amazonElasticContainerServiceConfig',

  instanceTypes: INSTANCE_TYPES,
  regionChoices: REGIONS,
  step:          1,

  init() {
    this._super(...arguments);

    setProperties(this, {
      clients:    EmberObject.create(),
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
    awsLogin(cb) {
      let self = this;

      setProperties(this, {
        'errors':           null,
        'config.accessKey': (get(this, 'config.accessKey') || '').trim(),
        'config.secretKey': (get(this, 'config.secretKey') || '').trim(),
      });

      let subnets = [];
      let rName = get(this, 'config.region');
      let ec2 = new AWS.EC2({
        accessKeyId:     get(this, 'config.accessKey'),
        secretAccessKey: get(this, 'config.secretKey'),
        region:          rName,
      });

      let vpcNames = {};
      let vpcTags = {};

      ec2.describeVpcs({}, (err, vpcs) => {
        if ( err ) {
          let errors = self.get('errors') || [];

          errors.pushObject(err);
          set(this, 'errors', errors);
          cb();

          return;
        }

        vpcs.Vpcs.forEach((vpc) => {
          vpcNames[vpc.VpcId] = nameFromResource(vpc, 'VpcId');
          vpcTags[vpc.VpcId] = tagsFromResource(vpc);
        });

        ec2.describeSubnets({}, (err, data) => {
          if ( err ) {
            let errors = self.get('errors') || [];

            errors.pushObject(err);
            set(this, 'errors', errors);
            cb();

            return;
          }

          get(this, 'clients').set(rName, ec2);

          data.Subnets.forEach((subnet) => {
            if ( (subnet.State || '').toLowerCase() !== 'available' ) {
              return;
            }

            subnets.pushObject(EmberObject.create({
              subnetName: nameFromResource(subnet, 'SubnetId'),
              subnetId:   subnet.SubnetId,
              subnetTags: tagsFromResource(subnet),
              vpcName:    vpcNames[subnet.VpcId] || subnet.VpcId,
              vpcId:      subnet.VpcId,
              vpcTags:    vpcTags[subnet.VpcId] || [],
              zone:       subnet.AvailabilityZone,
              region:     rName
            }));
          });

          setProperties(this, {
            'allSubnets': subnets,
            'step':       2,
          });
          cb();
        });
      });
    },
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

});
