import $ from 'jquery';
import { scheduleOnce } from '@ember/runloop';
import EmberObject, {
  observer, computed, get, set, setProperties
} from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';

let RANCHER_GROUP         = 'rancher-nodes';

export const INSTANCE_TYPES = [
  {
    group: 'T2 - Burstable',
    name:  't2.nano'
  },
  {
    group: 'T2 - Burstable',
    name:  't2.micro'
  },
  {
    group: 'T2 - Burstable',
    name:  't2.small'
  },
  {
    group: 'T2 - Burstable',
    name:  't2.medium'
  },
  {
    group: 'T2 - Burstable',
    name:  't2.large'
  },
  {
    group: 'T2 - Burstable',
    name:  't2.xlarge'
  },
  {
    group: 'T2 - Burstable',
    name:  't2.2xlarge'
  },

  {
    group: 'M5 - General Purpose',
    name:  'm5.large'
  },
  {
    group: 'M5 - General Purpose',
    name:  'm5.xlarge'
  },
  {
    group: 'M5 - General Purpose',
    name:  'm5.2xlarge'
  },
  {
    group: 'M5 - General Purpose',
    name:  'm5.4xlarge'
  },
  {
    group: 'M5 - General Purpose',
    name:  'm5.12xlarge'
  },
  {
    group: 'M5 - General Purpose',
    name:  'm5.24xlarge'
  },

  {
    group: 'M4 - General Purpose',
    name:  'm4.large'
  },
  {
    group: 'M4 - General Purpose',
    name:  'm4.xlarge'
  },
  {
    group: 'M4 - General Purpose',
    name:  'm4.2xlarge'
  },
  {
    group: 'M4 - General Purpose',
    name:  'm4.4xlarge'
  },
  {
    group: 'M4 - General Purpose',
    name:  'm4.10xlarge'
  },
  {
    group: 'M4 - General Purpose',
    name:  'm4.16xlarge'
  },

  {
    group: 'M3 - General Purpose',
    name:  'm3.medium'
  },
  {
    group: 'M3 - General Purpose',
    name:  'm3.large'
  },
  {
    group: 'M3 - General Purpose',
    name:  'm3.xlarge'
  },
  {
    group: 'M3 - General Purpose',
    name:  'm3.2xlarge'
  },

  {
    group: 'C5 - High CPU',
    name:  'c5.large'
  },
  {
    group: 'C5 - High CPU',
    name:  'c5.xlarge'
  },
  {
    group: 'C5 - High CPU',
    name:  'c5.2xlarge'
  },
  {
    group: 'C5 - High CPU',
    name:  'c5.4xlarge'
  },
  {
    group: 'C5 - High CPU',
    name:  'c5.9xlarge'
  },
  {
    group: 'C5 - High CPU',
    name:  'c5.18xlarge'
  },

  {
    group: 'C4 - High CPU',
    name:  'c4.large'
  },
  {
    group: 'C4 - High CPU',
    name:  'c4.xlarge'
  },
  {
    group: 'C4 - High CPU',
    name:  'c4.2xlarge'
  },
  {
    group: 'C4 - High CPU',
    name:  'c4.4xlarge'
  },
  {
    group: 'C4 - High CPU',
    name:  'c4.8xlarge'
  },

  {
    group: 'C3 - High CPU',
    name:  'c3.large'
  },
  {
    group: 'C3 - High CPU',
    name:  'c3.xlarge'
  },
  {
    group: 'C3 - High CPU',
    name:  'c3.2xlarge'
  },
  {
    group: 'C3 - High CPU',
    name:  'c3.4xlarge'
  },
  {
    group: 'C3 - High CPU',
    name:  'c3.8xlarge'
  },

  {
    group: 'R4 - High Memory',
    name:  'r4.large'
  },
  {
    group: 'R4 - High Memory',
    name:  'r4.xlarge'
  },
  {
    group: 'R4 - High Memory',
    name:  'r4.2xlarge'
  },
  {
    group: 'R4 - High Memory',
    name:  'r4.4xlarge'
  },
  {
    group: 'R4 - High Memory',
    name:  'r4.8xlarge'
  },
  {
    group: 'R4 - High Memory',
    name:  'r4.16xlarge'
  },

  {
    group: 'R3 - High Memory',
    name:  'r3.large'
  },
  {
    group: 'R3 - High Memory',
    name:  'r3.xlarge'
  },
  {
    group: 'R3 - High Memory',
    name:  'r3.2xlarge'
  },
  {
    group: 'R3 - High Memory',
    name:  'r3.4xlarge'
  },
  {
    group: 'R3 - High Memory',
    name:  'r3.8xlarge'
  },

  {
    group: 'D2 - High Density Storage',
    name:  'd2.xlarge'
  },
  {
    group: 'D2 - High Density Storage',
    name:  'd2.2xlarge'
  },
  {
    group: 'D2 - High Density Storage',
    name:  'd2.4xlarge'
  },
  {
    group: 'D2 - High Density Storage',
    name:  'd2.8xlarge'
  },

  {
    group: 'I3 - High I/O Storage',
    name:  'i3.large'
  },
  {
    group: 'I3 - High I/O Storage',
    name:  'i3.xlarge'
  },
  {
    group: 'I3 - High I/O Storage',
    name:  'i3.2xlarge'
  },
  {
    group: 'I3 - High I/O Storage',
    name:  'i3.4xlarge'
  },
  {
    group: 'I3 - High I/O Storage',
    name:  'i3.8xlarge'
  },
  {
    group: 'I3 - High I/O Storage',
    name:  'i3.16xlarge'
  },

  {
    group: 'F1 - FPGA',
    name:  'f1.2xlarge'
  },
  {
    group: 'F1 - FPGA',
    name:  'f1.16xlarge'
  },

  {
    group: 'G3 - GPU',
    name:  'g3.4xlarge'
  },
  {
    group: 'G3 - GPU',
    name:  'g3.8xlarge'
  },
  {
    group: 'G3 - GPU',
    name:  'g3.16xlarge'
  },

  {
    group: 'P2 - GPU',
    name:  'p2.xlarge'
  },
  {
    group: 'P2 - GPU',
    name:  'p2.8xlarge'
  },
  {
    group: 'P2 - GPU',
    name:  'p2.16xlarge'
  },

  {
    group: 'X1 - Really High Memory',
    name:  'x1.16xlarge'
  },
  {
    group: 'X1 - Really High Memory',
    name:  'x1.32xlarge'
  },
];

// These need to match the supported list in docker-machine:
// https://github.com/docker/machine/blob/master/drivers/amazonec2/region.go
export const REGIONS = [
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'ca-central-1',
  'cn-north-1',
  'cn-northwest-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'us-gov-west-1',
];

export function nameFromResource(r, idField) {
  let id = r[idField];
  let out = id;

  if ( r && r.Tags && r.Tags.length ) {
    let match = r.Tags.filterBy('Key', 'Name')[0];

    if ( match ) {
      out = `${ match.Value  } (${  id  })`;
    }
  }

  return out;
}

export function tagsFromResource(r) {
  let out = [];

  if ( r && r.Tags && r.Tags.length ) {
    r.Tags.forEach((tag) => {
      if ( tag.Key !== 'Name' ) {
        out.push(`${ tag.Key }=${ tag.Value }`)
      }
    })
  }

  return out;
}

export default Component.extend(NodeDriver, {
  prefs: service(),

  layout,
  model: null,

  driverName:               'amazonec2',
  clients:                  null,
  allSubnets:               null,
  allSecurityGroups:        null,
  selectedSecurityGroup:    null,
  defaultSecurityGroup:     null,
  defaultSecurityGroupName: RANCHER_GROUP,
  whichSecurityGroup:       'default',
  instanceTypes:            INSTANCE_TYPES,
  regionChoices:            REGIONS,
  step:                     1,
  tags:                     null,

  config: alias('model.amazonec2Config'),

  isCustomSecurityGroup:    equal('whichSecurityGroup', 'custom'),
  stepDidChange:         function() {
    scheduleOnce('afterRender', this, () => {
      document.body.scrollTop = document.body.scrollHeight;
    });
  }.observes('context.step'),

  selectedZone: computed('config.{region,zone}', {
    get() {
      let config = get(this, 'config');

      if ( get(config, 'region') && get(config, 'zone') ) {
        return get(config, 'region') + get(config, 'zone');
      } else {
        return null;
      }
    },

    set(key, val) {
      let config = get(this, 'config');

      setProperties(config, {
        region: val.substr(0, val.length - 1),
        zone:   val.substr(val.length - 1),
      });

      let selectedSubnet = get(this, 'selectedSubnet');

      if ( get(this, 'subnetChoices').filterBy('value', selectedSubnet).length === 0 ) {
        setProperties(config, {
          region:   val.substr(0, val.length - 1),
          zone:     val.substr(val.length - 1),
          vpcId:    null,
          subnetId: null,
        });
      }

      if ( get(config, 'region') && get(config, 'zone') ) {
        return get(config, 'region') + get(config, 'zone');
      } else {
        return null;
      }
    }
  }),

  zoneChoices: function() {
    const choices = (get(this, 'allSubnets') || []).map((subnet) => {
      return get(subnet, 'zone');
    }).sort().uniq();

    if ( choices.length ) {
      set(this, 'selectedZone', choices[0]);
    }

    return choices;
  }.property('allSubnets.@each.{zone}'),

  subnetChoices: function() {
    let out      = [];
    let seenVpcs = [];

    (get(this, 'allSubnets') || []).filterBy('zone', get(this, 'selectedZone')).forEach((subnet) => {
      let vpcName    = get(subnet, 'vpcName');
      let vpcId      = get(subnet, 'vpcId');
      let vpcTags    = get(subnet, 'vpcTags');
      let subnetId   = get(subnet, 'subnetId');
      let subnetName = get(subnet, 'subnetName');
      let subnetTags = get(subnet, 'subnetTags');

      if ( seenVpcs.indexOf(vpcId) === -1 ) {
        seenVpcs.pushObject(vpcId);
        out.pushObject({
          sortKey: vpcId,
          label:   vpcName,
          value:   vpcId,
          isVpc:   true,
          tags:    vpcTags
        });
      }

      out.pushObject({
        sortKey: `${ vpcId } ${ subnetName }`,
        label:   subnetName,
        value:   subnetId,
        isVpc:   false,
        tags:    subnetTags
      });
    });

    return out.sortBy('sortKey');
  }.property('selectedZone', 'allSubnets.@each.{subnetId,vpcId,zone}'),

  selectedSubnet: computed('config.{subnetId,vpcId}', {
    set(key, val) {
      let config = get(this, 'config');

      if ( arguments.length > 1 ) {
        if ( val && val.length ) {
          if ( val.indexOf('vpc-') === 0 ) {
            setProperties(config, {
              vpcId:    val,
              subnetId: null,
            });
          } else {
            let subnet = this.subnetById(val);

            setProperties(config, {
              vpcId:    subnet.vpcId,
              subnetId: subnet.subnetId,
            });
          }
        } else {
          setProperties(config, {
            vpcId:    null,
            subnetId: null,
          });
        }
      }

      return get(config, 'subnetId') || get(config, 'vpcId');
    },

    get() {
      let config = get(this, 'config');

      return get(config, 'subnetId') || get(config, 'vpcId');
    },
  }),

  tagsDidChange: observer('tags', function() {
    const array = [];
    const tags = get(this, 'tags') || {};

    Object.keys(tags).forEach((key) => {
      array.push(key);
      array.push(tags[key]);
    });

    set(this, 'config.tags', array.join(','));
  }),
  init() {
    this._super(...arguments);

    setProperties(this, {
      editing:    false,
      clients:    EmberObject.create(),
      allSubnets: []
    })

    let cur = get(this, 'config.securityGroup');

    if ( cur === '' ) { // TODO 2.0 should this be null 403 Vince/Wes/Daishan
      setProperties(this, {
        whichSecurityGroup:    'default',
        selectedSecurityGroup: null,
      });
    } else {
      setProperties(this, {
        whichSecurityGroup:    'custom',
        selectedSecurityGroup: cur,
      });
    }

    const tagsString = get(this, 'config.tags');

    if ( tagsString ) {
      const array = tagsString.split(',');
      const tags = {};

      for (let i = 0; i < array.length - 1; i = i + 2) {
        tags[array[i]] = array[i + 1];
      }

      set(this, 'tags', tags);
    }
  },

  willDestroyElement() {
    setProperties(this, {
      step:               1,
      machineId:          null,
      clients:            null,
      allSubnets:         null,
      allSecurityGroups:  null,
      whichSecurityGroup: 'default',
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
          let errors = get(self, 'errors') || [];

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
            let errors = get(self, 'errors') || [];

            errors.pushObject(err);
            set(this, 'errors', errors);
            cb();

            return;
          }

          set(this, `clients.${ rName }`, ec2);

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

    selectSubnet(cb) {
      set(this, 'errors', null);

      if ( !get(this, 'selectedZone') ) {
        set(this, 'errors', ['Select an Availability Zone']);

        return;
      }

      if ( !get(this, 'selectedSubnet') ) {
        set(this, 'errors', ['Select a VPC or Subnet']);

        return;
      }

      let ec2    = get(this, `clients.${ get(this, 'config.region') }`);
      let filter = {
        Name:   'vpc-id',
        Values: [get(this, 'config.vpcId')]
      };

      ec2.describeSecurityGroups({ Filters: [filter] }, (err, data) => {
        if ( err ) {
          set(this, 'errors', [err]);
          cb();

          return;
        }

        let groups = [];

        data.SecurityGroups.forEach((group) => {
          let tags = {};

          // Skip launch-wizard groups
          if ( (group.GroupName || '').match(/^launch-wizard-.*$/) ) {
            return;
          }

          (group.Tags || []).forEach((tag) => {
            tags[tag.Key] = tag.Value;
          });

          let obj = {
            id:          group.GroupId,
            name:        group.GroupName,
            description: group.Description,
          };

          groups.push(obj);
        });

        setProperties(this, {
          allSecurityGroups: groups,
          step:              3,
        });
      });
    },

    multiSecurityGroupSelect() {
      let options = Array.prototype.slice.call($('.existing-security-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'selectedSecurityGroup', selectedOptions);
    },

    selectSecurityGroup(cb) {
      set(this, 'errors', null);

      if ( get(this, 'isCustomSecurityGroup') ) {
        set(this, 'config.securityGroup', get(this, 'selectedSecurityGroup'));
      } else {
        set(this, 'config.securityGroup', '');
      }

      setProperties(this, { step: 4, });

      cb();
    },
  },

  bootstrap() {
    let pref   = get(this, 'prefs.amazonec2') || {};
    let config = get(this, 'globalStore').createRecord({
      type:          'amazonec2Config',
      region:        'us-west-2',
      instanceType:  't2.micro',
      securityGroup: '',
      zone:          'a',
      rootSize:      '16',
      accessKey:     pref.accessKey || '',
      secretKey:     pref.secretKey || '',
    });

    set(this, 'model.amazonec2Config', config);
  },

  validate() {
    let errors = [];

    if ( !get(this, 'model.name') ) {
      errors.push('Name is required');
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  subnetById(id) {
    return (get(this, 'allSubnets') || []).filterBy('subnetId', id)[0];
  },

});
