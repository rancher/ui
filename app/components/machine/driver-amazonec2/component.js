import Ember from 'ember';
import Driver from 'ui/mixins/driver';

let RANCHER_TAG           = 'rancher-ui';
let RANCHER_GROUP         = 'rancher-machine';
let RANCHER_INGRESS_RULES = [
  // Docker machine creates these ports if we don't,
  // but explodes with race coditions if try to deploy 2 hosts simultaneously and they both want to create it.
  // So we'll just have the UI create them up front.
  // SSH, for docker-machine to install Docker
  {
    FromPort: 22,
    ToPort: 22,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'tcp'
  },
  {
    FromPort: 2376,
    ToPort: 2376,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'tcp'
  },

  // Rancher IPSec
  {
    FromPort: 500,
    ToPort: 500,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'udp'
  },
  {
    FromPort: 4500,
    ToPort: 4500,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'udp'
  },

  // Rancher VXLAN
  {
    FromPort: 4789,
    ToPort: 4789,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'udp'
  },

  // MTU Path discovery
  // shouldiblockicmp.com
  {
    FromPort: -1,
    ToPort: -1,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'icmp'
  }
];

let INSTANCE_TYPES = [
  {group: 'T2 - Burstable', name: 't2.nano'},
  {group: 'T2 - Burstable', name: 't2.micro'},
  {group: 'T2 - Burstable', name: 't2.small'},
  {group: 'T2 - Burstable', name: 't2.medium'},
  {group: 'T2 - Burstable', name: 't2.large'},
  {group: 'T2 - Burstable', name: 't2.xlarge'},
  {group: 'T2 - Burstable', name: 't2.2xlarge'},

  {group: 'M4 - General Purpose', name: 'm4.large'},
  {group: 'M4 - General Purpose', name: 'm4.xlarge'},
  {group: 'M4 - General Purpose', name: 'm4.2xlarge'},
  {group: 'M4 - General Purpose', name: 'm4.4xlarge'},
  {group: 'M4 - General Purpose', name: 'm4.10xlarge'},
  {group: 'M4 - General Purpose', name: 'm4.16xlarge'},

  {group: 'M3 - General Purpose', name: 'm3.medium'},
  {group: 'M3 - General Purpose', name: 'm3.large'},
  {group: 'M3 - General Purpose', name: 'm3.xlarge'},
  {group: 'M3 - General Purpose', name: 'm3.2xlarge'},

  {group: 'C4 - High CPU', name: 'c4.large'},
  {group: 'C4 - High CPU', name: 'c4.xlarge'},
  {group: 'C4 - High CPU', name: 'c4.2xlarge'},
  {group: 'C4 - High CPU', name: 'c4.4xlarge'},
  {group: 'C4 - High CPU', name: 'c4.8xlarge'},

  {group: 'R4 - High Memory', name: 'r4.large'},
  {group: 'R4 - High Memory', name: 'r4.xlarge'},
  {group: 'R4 - High Memory', name: 'r4.2xlarge'},
  {group: 'R4 - High Memory', name: 'r4.4xlarge'},
  {group: 'R4 - High Memory', name: 'r4.8xlarge'},
  {group: 'R4 - High Memory', name: 'r4.16xlarge'},

  {group: 'R3 - High Memory', name: 'r3.large'},
  {group: 'R3 - High Memory', name: 'r3.xlarge'},
  {group: 'R3 - High Memory', name: 'r3.2xlarge'},
  {group: 'R3 - High Memory', name: 'r3.4xlarge'},
  {group: 'R3 - High Memory', name: 'r3.8xlarge'},

  {group: 'C3 - High CPU', name: 'c3.large'},
  {group: 'C3 - High CPU', name: 'c3.xlarge'},
  {group: 'C3 - High CPU', name: 'c3.2xlarge'},
  {group: 'C3 - High CPU', name: 'c3.4xlarge'},
  {group: 'C3 - High CPU', name: 'c3.8xlarge'},

  {group: 'D2 - High Density Storage', name: 'd2.xlarge'},
  {group: 'D2 - High Density Storage', name: 'd2.2xlarge'},
  {group: 'D2 - High Density Storage', name: 'd2.4xlarge'},
  {group: 'D2 - High Density Storage', name: 'd2.8xlarge'},

  {group: 'I3 - High I/O Storage', name: 'i3.large'},
  {group: 'I3 - High I/O Storage', name: 'i3.xlarge'},
  {group: 'I3 - High I/O Storage', name: 'i3.2xlarge'},
  {group: 'I3 - High I/O Storage', name: 'i3.4xlarge'},
  {group: 'I3 - High I/O Storage', name: 'i3.8xlarge'},
  {group: 'I3 - High I/O Storage', name: 'i3.16xlarge'},

  {group: 'F1 - FPGA', name: 'f1.2xlarge'},
  {group: 'F1 - FPGA', name: 'f1.16xlarge'},

  {group: 'G3 - GPU', name: 'g3.4xlarge'},
  {group: 'G3 - GPU', name: 'g3.8xlarge'},
  {group: 'G3 - GPU', name: 'g3.16xlarge'},

  {group: 'P2 - GPU', name: 'p2.xlarge'},
  {group: 'P2 - GPU', name: 'p2.8xlarge'},
  {group: 'P2 - GPU', name: 'p2.16xlarge'},

  {group: 'X1 - Really High Memory', name: 'x1.16xlarge'},
  {group: 'X1 - Really High Memory', name: 'x1.32xlarge'},
];

// These need to match the supported list in docker-machine:
// https://github.com/docker/machine/blob/master/drivers/amazonec2/region.go
let REGIONS = [
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-south-1",
  "ca-central-1",
  "cn-north-1",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "sa-east-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "us-gov-west-1",
];

function nameFromResource(r, idField) {
  let id = r[idField];
  let out = id;

  if ( r && r.Tags && r.Tags.length )
  {
    let match = r.Tags.filterBy('Key','Name')[0];
    if ( match )
    {
      out = match.Value + ' (' + id + ')';
    }
  }

  return out;
}

export default Ember.Component.extend(Driver, {
  prefs                    : Ember.inject.service(),
  driverName               : 'amazonec2',
  model                    : null,
  amazonec2Config          : Ember.computed.alias('model.publicValues.amazonec2Config'),

  clients                  : null,
  allSubnets               : null,
  allSecurityGroups        : null,
  selectedSecurityGroup    : null,
  defaultSecurityGroup     : null,
  defaultSecurityGroupName : RANCHER_GROUP,
  whichSecurityGroup       : 'default',
  isCustomSecurityGroup    : Ember.computed.equal('whichSecurityGroup','custom'),
  instanceTypes            : INSTANCE_TYPES,
  regionChoices            : REGIONS,

  step                     : 1,
  isStep1                  : Ember.computed.equal('step',1),
  isStep2                  : Ember.computed.equal('step',2),
  isStep3                  : Ember.computed.equal('step',3),
  isStep4                  : Ember.computed.equal('step',4),
  isStep5                  : Ember.computed.equal('step',5),
  isStep6                  : Ember.computed.equal('step',6),
  isStep7                  : Ember.computed.equal('step',7),
  isGteStep3               : Ember.computed.gte('step',3),
  isGteStep4               : Ember.computed.gte('step',4),
  isGteStep5               : Ember.computed.gte('step',5),
  isGteStep6               : Ember.computed.gte('step',6),
  isGteStep7               : Ember.computed.gte('step',7),

  bootstrap: function() {
    let pref   = this.get('prefs.amazonec2')||{};
    let config = this.get('store').createRecord({
      type          : 'amazonec2Config',
      region        : 'us-west-2',
      instanceType  : 't2.micro',
      securityGroup : ['rancher-machine',],
      zone          : 'a',
      rootSize      : '16',
      accessKey     : pref.accessKey||'',
    });

    this.set('model', this.get('store').createRecord({
      type:         'hostTemplate',
      driver:       'amazonec2',
      publicValues: {
        amazonec2Config: config
      },
      secretValues: {
        amazonec2Config: {
          secretKey: pref.secretKey||'',
        }
      }
    }));
  },

  validate() {
    let errors = [];

    if ( !this.get('model.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },

  init: function() {
    this._super(...arguments);

    this.set('editing', false);
    this.set('clients', Ember.Object.create());
    this.set('allSubnets', []);

    let cur = this.get('amazonec2Config.securityGroup');

    if ( cur === RANCHER_GROUP ) {
      this.setProperties({
        whichSecurityGroup    : 'default',
        selectedSecurityGroup : null,
      });
    } else {
      this.setProperties({
        whichSecurityGroup    : 'custom',
        selectedSecurityGroup : cur,
      });
    }
  },

  willDestroyElement: function() {
    this.setProperties({
      step               : 1,
      machineId          : null,
      clients            : null,
      allSubnets         : null,
      allSecurityGroups  : null,
      whichSecurityGroup : 'default',
    });
  },

  stepDidChange: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      document.body.scrollTop = document.body.scrollHeight;
    });
  }.observes('context.step'),

  actions: {
    awsLogin: function() {
      let self = this;
      this.set('errors',null);
      this.set('step',2);

      this.set('amazonec2Config.accessKey', (this.get('amazonec2Config.accessKey')||'').trim());
      this.set('model.secretValues.amazonec2Config.secretKey', (this.get('model.secretValues.amazonec2Config.secretKey')||'').trim());

      let subnets = [];
      let rName = this.get('amazonec2Config.region');
      let ec2 = new AWS.EC2({
        accessKeyId     : this.get('amazonec2Config.accessKey'),
        secretAccessKey : this.get('model.secretValues.amazonec2Config.secretKey'),
        region          : rName,
      });

      let vpcNames = {};

      ec2.describeVpcs({}, (err, vpcs) => {
        if ( err ) {
          let errors = self.get('errors')||[];
          errors.pushObject(err);
          this.set('errors', errors);
          this.set('step', 1);
          return;
        }

        vpcs.Vpcs.forEach((vpc) => {
          vpcNames[vpc.VpcId] = nameFromResource(vpc, 'VpcId');
        });

        ec2.describeSubnets({}, (err, data) => {
          if ( err ) {
            let errors = self.get('errors')||[];
            errors.pushObject(err);
            this.set('errors', errors);
            this.set('step', 1);
            return;
          }

          this.get('clients').set(rName, ec2);

          data.Subnets.forEach((subnet) => {
            if ( (subnet.State||'').toLowerCase() !== 'available' )
            {
              return;
            }

            subnets.pushObject(Ember.Object.create({
              subnetName: nameFromResource(subnet, 'SubnetId'),
              subnetId:   subnet.SubnetId,
              vpcName:    vpcNames[subnet.VpcId] || subnet.VpcId,
              vpcId:      subnet.VpcId,
              zone:       subnet.AvailabilityZone,
              region:     rName
            }));
          });

          this.set('allSubnets', subnets);
          this.set('step', 3);
        });
      });
    },

    selectSubnet: function() {
      this.set('errors',null);

      if ( !this.get('selectedZone') ) {
        this.set('errors', ['Select an Availability Zone']);
        return;
      }

      if ( !this.get('selectedSubnet') ) {
        this.set('errors', ['Select a VPC or Subnet']);
        return;
      }

      this.set('step', 4);

      let ec2    = this.get('clients').get(this.get('amazonec2Config.region'));
      let filter = {Name: 'vpc-id', Values: [ this.get('amazonec2Config.vpcId')]};

      ec2.describeSecurityGroups({Filters: [filter]}, (err, data) => {
        if ( err ) {
          this.set('errors',[err]);
          this.set('step', 3);
          return;
        }

        let groups = [];
        let defaultGroup = null;

        data.SecurityGroups.forEach((group) => {
          let tags = {};

          // Skip launch-wizard groups
          if ( (group.GroupName||'').match(/^launch-wizard-.*$/) ) {
            return;
          }

          (group.Tags||[]).forEach((tag) => {
            tags[tag.Key] = tag.Value;
          });

          let obj = {
            id          : group.GroupId,
            name        : group.GroupName,
            description : group.Description,
            isDefault   : group.GroupName === this.get('defaultSecurityGroupName'),
            isRancher   : (typeof tags[RANCHER_TAG] !== 'undefined')
          };

          groups.push(obj);

          if ( obj.isDefault && !defaultGroup) {
            defaultGroup = obj;
          }
        });

        this.set('step', 5);
        this.set('allSecurityGroups', groups);
        this.set('defaultSecurityGroup', defaultGroup);
      });
    },

    multiSecurityGroupSelect: function() {
      let options = Array.prototype.slice.call(Ember.$('.existing-security-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      this.set('selectedSecurityGroup', selectedOptions);
    },

    selectSecurityGroup: function() {
      this.set('errors',null);

      let self = this;
      let ec2  = this.get('clients').get(this.get('amazonec2Config.region'));

      if ( this.get('isCustomSecurityGroup') ) {
        this.set('amazonec2Config.securityGroup', this.get('selectedSecurityGroup'));
        done();
      } else {
        this.set('step', 6);
        this.set('amazonec2Config.securityGroup', this.get('defaultSecurityGroupName'));
        let group = this.get('defaultSecurityGroup');
        if ( group ) {
          if ( group.isRancher ) {
            this.set('amazonec2Config.securityGroup', group.name);
            done();
          } else {
            addRules(group.id, done);
          }
        } else {
          ec2.createSecurityGroup({
            GroupName   : this.get('defaultSecurityGroupName'),
            Description : `${this.get('settings.appName')} default security group`,
            VpcId       : this.get('amazonec2Config.vpcId'),
          }, function(err, data) {
            if ( err ) {
              return done(err);
            } else {
              return addRules(data.GroupId, done);
            }
          });
        }
      }

      function addRules(groupId, cb) {
        async.each(RANCHER_INGRESS_RULES, function(item, cb) {
          let params = JSON.parse(JSON.stringify(item)); // Don't change the original
          params.GroupId = groupId;
          ec2.authorizeSecurityGroupIngress(params, cb);
        }, function(err) {
          if ( err ) {
            return cb(err);
          }

          ec2.createTags({
            Resources : [groupId],
            Tags      : [ {Key     : RANCHER_TAG, Value : self.get('app.version') }]
          }, cb);
        });
      }

      function done(err) {
        if ( err ) {
          this.set('errors', [err]);
          self.set('step', 5);
        } else {
          self.set('step', 7);
        }
      }
    },
  },

  selectedZone: Ember.computed('amazonec2Config.{region,zone}', {
    get: function() {
      let config = this.get('amazonec2Config');
      if ( config.get('region') && config.get('zone') ) {
        return config.get('region') + config.get('zone');
      } else {
        return null;
      }
    },

    set: function(key, val) {
      let config = this.get('amazonec2Config');
      config.setProperties({
        region : val.substr(0, val.length - 1),
        zone   : val.substr(val.length - 1),
      });

      let selectedSubnet = this.get('selectedSubnet');

      if ( this.get('subnetChoices').filterBy('value', selectedSubnet).length === 0 ) {
        config.setProperties({
          region   : val.substr(0, val.length - 1),
          zone     : val.substr(val.length - 1),
          vpcId    : null,
          subnetId : null,
        });
      }

      if ( config.get('region') && config.get('zone') ) {
        return config.get('region') + config.get('zone');
      } else {
        return null;
      }
    }
  }),

  zoneChoices: function() {
    return (this.get('allSubnets')||[]).map((subnet) => {return subnet.get('zone');}).sort().uniq();
  }.property('allSubnets.@each.{zone}'),

  subnetChoices: function() {
    let out      = [];
    let seenVpcs = [];

    (this.get('allSubnets')||[]).filterBy('zone', this.get('selectedZone')).forEach((subnet) => {
      let vpcName    = subnet.get('vpcName');
      let vpcId      = subnet.get('vpcId');
      let subnetId   = subnet.get('subnetId');
      let subnetName = subnet.get('subnetName');

      if ( seenVpcs.indexOf(vpcId) === -1 ) {
        seenVpcs.pushObject(vpcId);
        out.pushObject({
          sortKey : vpcId,
          label   : vpcName,
          value   : vpcId,
          isVpc   : true
        });
      }

      out.pushObject({
        sortKey : `${vpcId} ${subnetName}`,
        label   : subnetName,
        value   : subnetId,
        isVpc   : false,
      });
    });

    return out.sortBy('sortKey');
  }.property('selectedZone','allSubnets.@each.{subnetId,vpcId,zone}'),

  selectedSubnet: Ember.computed('amazonec2Config.{subnetId,vpcId}', {
    set: function(key, val) {
      let config = this.get('amazonec2Config');
      if ( arguments.length > 1 ) {
        if ( val && val.length ) {
          if ( val.indexOf('vpc-') === 0 ) {
            config.setProperties({
              vpcId    : val,
              subnetId : null,
            });
          } else {
            let subnet = this.subnetById(val);
            config.setProperties({
              vpcId    : subnet.vpcId,
              subnetId : subnet.subnetId,
            });
          }
        } else {
          config.setProperties({
            vpcId    : null,
            subnetId : null,
          });
        }
      }

      return config.get('subnetId') || config.get('vpcId');
    },

    get: function() {
      let config = this.get('amazonec2Config');
      return config.get('subnetId') || config.get('vpcId');
    },
  }),

  subnetById: function(id) {
    return (this.get('allSubnets')||[]).filterBy('subnetId',id)[0];
  },
});
