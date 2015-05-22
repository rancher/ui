import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';

var RANCHER_TAG = 'rancher-ui';
var RANCHER_GROUP = 'rancher-machine';
var RANCHER_INGRESS_RULES = [
  {
    FromPort: 9345,
    ToPort: 9346,
    CidrIp: '0.0.0.0/0',
    IpProtocol: 'tcp'
  },
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
  }
];

var INSTANCE_TYPES = [
  't2.micro','t2.small','t2.medium',
  'm3.medium','m3.large','m3.xlarge','m3.2xlarge',
  'c4.large','c4.xlarge','c4.2xlarge','c4.4xlarge','c4.8xlarge',
  'c3.large','c3.xlarge','c3.2xlarge','c3.4xlarge','c3.8xlarge',
  'r3.large','r3.xlarge','r3.2xlarge','r3.4xlarge','r3.8xlarge',
  'g2.2xlarge','g2.8xlarge',
  'i2.xlarge','i2.2xlarge','i2.4xlarge','i2.8xlarge',
  'd2.xlarge','d2.2xlarge','d2.4xlarge','d2.8xlarge',
];

export default Ember.ObjectController.extend(NewHost, {
  clients: null,
  allSubnets: null,
  allSecurityGroups: null,
  selectedSecurityGroup: null,
  defaultSecurityGroup: null,
  defaultSecurityGroupName: RANCHER_GROUP,
  whichSecurityGroup: 'default',
  isCustomSecurityGroup: Ember.computed.equal('whichSecurityGroup','custom'),
  instanceTypes: INSTANCE_TYPES,

  step: 1,
  isStep1: Ember.computed.equal('step',1),
  isStep2: Ember.computed.equal('step',2),
  isStep3: Ember.computed.equal('step',3),
  isStep4: Ember.computed.equal('step',4),
  isStep5: Ember.computed.equal('step',5),
  isStep6: Ember.computed.equal('step',6),
  isStep7: Ember.computed.equal('step',7),
  isGteStep3: Ember.computed.gte('step',3),
  isGteStep4: Ember.computed.gte('step',4),
  isGteStep5: Ember.computed.gte('step',5),
  isGteStep6: Ember.computed.gte('step',6),
  isGteStep7: Ember.computed.gte('step',7),

  actions: {
    awsLogin: function() {
      var self = this;
      this.set('errors',null);
      this.set('step',2);

      var ec2 = new AWS.EC2({
        accessKeyId: this.get('amazonec2Config.accessKey'),
        secretAccessKey: this.get('amazonec2Config.secretKey'),
        region: this.get('amazonec2Config.region'),
      });

      var subnets = [];

      ec2.describeRegions({}, (err, data) => {
        if ( err )
        {
          done(err);
          return;
        }

        async.eachLimit(data.Regions, 3, readRegion, done);
      });

      function readRegion(region, cb) {
        var rName = region.RegionName;

        var ec2 = new AWS.EC2({
          accessKeyId: self.get('amazonec2Config.accessKey'),
          secretAccessKey: self.get('amazonec2Config.secretKey'),
          region: rName,
        });

        ec2.describeSubnets({}, (err, data) => {
          if ( err )
          {
            return void cb(err);
          }

          self.get('clients').set(rName, ec2);

          data.Subnets.forEach((subnet) => {
            if ( (subnet.State||'').toLowerCase() !== 'available' )
            {
              return;
            }

            subnets.pushObject(Ember.Object.create({
              subnetId: subnet.SubnetId,
              vpcId: subnet.VpcId,
              zone: subnet.AvailabilityZone,
              region: rName
            }));
          });

          cb();
        });
      }

      function done(err)
      {
        if ( err )
        {
          var errors = self.get('errors')||[];
          errors.pushObject(err);
          self.set('errors', errors);
          self.set('step', 1);
          return;
        }

        self.set('allSubnets', subnets);
        self.set('step', 3);
      }
    },

    selectSubnet: function() {
      this.set('errors',null);

      if ( !this.get('selectedZone') )
      {
        this.set('errors', ['Select an Availability Zone']);
        return;
      }

      if ( !this.get('selectedSubnet') )
      {
        this.set('errors', ['Select a VPC or Subnet']);
        return;
      }

      this.set('step', 4);

      var ec2 = this.get('clients').get(this.get('amazonec2Config.region'));
      ec2.describeSecurityGroups({}, (err, data) => {
        if ( err )
        {
          this.set('errors',[err]);
          this.set('step', 3);
          return;
        }

        var groups = [];
        var defaultGroup = null;

        data.SecurityGroups.forEach((group) => {
          var tags = {};

          (group.Tags||[]).forEach((tag) => {
            tags[tag.Key] = tag.Value;
          });

          var obj = {
            id: group.GroupId,
            name: group.GroupName,
            description: group.Description,
            isDefault: group.GroupName === this.get('defaultSecurityGroupName'),
            isRancher: (typeof tags[RANCHER_TAG] !== 'undefined')
          };

          groups.push(obj);
          if ( obj.isDefault && !defaultGroup)
          {
            defaultGroup = obj;
          }
        });

        this.set('step', 5);
        this.set('allSecurityGroups', groups);
        this.set('defaultSecurityGroup', defaultGroup);
      });
    },

    selectSecurityGroup: function() {
      this.set('errors',null);

      var self = this;
      var ec2 = this.get('clients').get(this.get('amazonec2Config.region'));

      if ( this.get('isCustomSecurityGroup') )
      {
        this.set('amazonec2Config.securityGroup', this.get('selectedSecurityGroup'));
        done();
      }
      else
      {
        this.set('step', 6);
        this.set('amazonec2Config.securityGroup', this.get('defaultSecurityGroupName'));
        var group = this.get('defaultSecurityGroup');
        if ( group )
        {
          if ( group.isRancher )
          {
            this.set('amazonec2Config.securityGroup', group.name);
            done();
          }
          else
          {
            addRules(group.id, done);
          }
        }
        else
        {
          ec2.createSecurityGroup({
            GroupName: this.get('defaultSecurityGroupName'),
            Description: 'Rancher default security group',
            VpcId: this.get('amazonec2Config.vpcId'),
          }, function(err, data) {
            if ( err )
            {
              return done(err);
            }
            else
            {
              return addRules(data.GroupId, done);
            }
          });
        }
      }

      function addRules(groupId, cb) {
        async.each(RANCHER_INGRESS_RULES, function(item, cb) {
          var params = JSON.parse(JSON.stringify(item)); // Don't change the original
          params.GroupId = groupId;
          ec2.authorizeSecurityGroupIngress(params, cb);
        }, function(err) {
          if ( err )
          {
            return cb(err);
          }

          ec2.createTags({
            Resources: [groupId],
            Tags: [ {Key: RANCHER_TAG, Value: self.get('app.version') }]
          }, cb);
        });
      }

      function done(err) {
        if ( err )
        {
          this.set('errors', [err]);
          self.set('step', 5);
        }
        else
        {
          self.set('step', 7);
        }
      }
    },
  },

  selectedZone: function(key, val/*, oldVal*/) {
    var config = this.get('amazonec2Config');
    if ( arguments.length > 1 )
    {
      if ( val && val.length )
      {
        config.setProperties({
          region: val.substr(0, val.length - 1),
          zone:   val.substr(val.length - 1),
          vpcId:  null,
          subnetId:  null,
        });
      }
      else
      {
        config.setProperties({
          region: null,
          zone:   null,
        });
      }
    }

    if ( config.get('region') && config.get('zone') )
    {
      return config.get('region') + config.get('zone');
    }
    else
    {
      return null;
    }
  }.property('amazonec2Config.{region,zone}'),

  zoneChoices: function() {
    return (this.get('allSubnets')||[]).map((subnet) => {return subnet.get('zone');}).sort().uniq();
  }.property('allSubnets.@each.{zone}'),

  subnetChoices: function() {
    var out = [];
    var seenVpcs = [];

    (this.get('allSubnets')||[]).filterProperty('zone', this.get('selectedZone')).forEach((subnet) => {
      var vpcId = subnet.get('vpcId');
      var subnetId = subnet.get('subnetId');

      if ( seenVpcs.indexOf(vpcId) === -1 )
      {
        seenVpcs.pushObject(vpcId);
        out.pushObject({
          sortKey: vpcId,
          label: vpcId,
          value: vpcId,
          isVpc: true
        });
      }

      out.pushObject({
          sortKey: vpcId + ' ' + subnetId,
          label: subnetId,
          value: subnetId,
          isVpc: false,
      });
    });

    return out.sortBy('sortKey');
  }.property('selectedZone','allSubnets.@each.{subnetId,vpcId,zone}'),

  selectedSubnet: function(key, val/*, oldVal*/) {
    var config = this.get('amazonec2Config');
    if ( arguments.length > 1 )
    {
      if ( val && val.length )
      {
        if ( val.indexOf('vpc-') === 0 )
        {
          config.setProperties({
            vpcId: val,
            subnetId: null,
          });
        }
        else
        {
          var subnet = this.subnetById(val);
          config.setProperties({
            vpcId: subnet.vpcId,
            subnetId: subnet.subnetId,
          });
        }
      }
      else
      {
        config.setProperties({
          vpcId: null,
          subnetId: null,
        });
      }
    }

    return config.get('subnetId') || config.get('vpcId');
  }.property('amazonec2Config.{subnetId,vpcId}'),

  subnetById: function(id) {
    return (this.get('allSubnets')||[]).filterProperty('subnetId',id)[0];
  },

  initFields: function() {
    this._super();
    this.set('clients', Ember.Object.create());
    this.set('allSubnets', []);
  },

  validate: function() {
    return this._super();
  },

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
