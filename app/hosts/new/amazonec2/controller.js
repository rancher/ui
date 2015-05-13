import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';

export default Ember.ObjectController.extend(NewHost, {
  clients: null,
  allSubnets: null,
  selectedSubnet: null,
  allSecurityGroups: null,
  selectedSecurityGroup: null,
  defaultSecurityGroup: 'docker-machine',
  whichSecurityGroup: 'default',
  isCustomSecurityGroup: Ember.computed.equal('whichSecurityGroup','custom'),

  step: 1,
  isStep1: Ember.computed.equal('step',1),
  isStep2: Ember.computed.equal('step',2),
  isStep3: Ember.computed.equal('step',3),
  isStep4: Ember.computed.equal('step',4),
  isStep5: Ember.computed.equal('step',5),
  isGteStep3: Ember.computed.gte('step',3),
  isGteStep4: Ember.computed.gte('step',4),
  isGteStep5: Ember.computed.gte('step',5),

  actions: {
    awsLogin: function() {
      var self = this;
      this.set('step', 2);

      var ec2 = new AWS.EC2({
        accessKeyId: this.get('amazonec2Config.accessKey'),
        secretAccessKey: this.get('amazonec2Config.secretKey'),
        region: this.get('amazonec2Config.region'),
      });

      var subnets = [];

      ec2.describeRegions({}, (err, data) => {
        if ( err )
        {
          this.set('errors', [err]);
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
          return;
        }

        self.set('allSubnets', subnets);
        var preferred = self.get('amazonec2Config.region');
        var match = self.get('subnetChoices').filterProperty('group',preferred);
        if ( match.length )
        {
          self.set('selectedSubnet', match.filterProperty('type','vpc')[0]);
        }
        else
        {
          self.set('selectedZone', self.get('subnetChoices')[0]);
        }

        self.set('step', 3);
      }
    },

    selectSubnet: function() {
      var selected = this.get('selectedSubnet');
      var subnet;
      var isSubnet = false;
      if ( selected.indexOf('vpc-') === 0 )
      {
        subnet = this.get('allSubnets').filterProperty('vpcId',selected)[0];
      }
      else
      {
        isSubnet = true;
        subnet = this.get('allSubnets').filterProperty('subnetId',selected)[0];
      }

      var zoneStr = subnet.get('zone');
      var region = zoneStr.substr(0, zoneStr.length - 1);
      var zone = zoneStr.substr(zoneStr.length - 1);

      this.get('amazonec2Config').setProperties({
        region: region,
        zone: zone,
        subnetId: (isSubnet ? subnet.get('subnetId') : null),
        vpcId: subnet.get('vpcId'),
      });

      var ec2 = this.get('clients').get(region);
      ec2.describeSecurityGroups({}, (err, data) => {
        var groups = [];

        data.SecurityGroups.forEach((group) => {
          var tags = {};

          (group.Tags||[]).forEach((tag) => {
            tags[tag.Key] = tag.Value;
          });

          groups.push({
            id: group.GroupId,
            name: group.GroupName,
            description: group.Description,
            isRancher: (typeof tags['rancher-ui'] !== 'undefined')
          });
        });

        this.set('step', 4);
        this.set('allSecurityGroups', groups);
      });
    },

    selectSecurityGroup: function() {
      if ( this.get('isCustomSecurityGroup') )
      {
        this.set('amazonec2Config.securityGroup', this.get('selectSecurityGroup'));
        this.set('step', 5);
      }
      else
      {
        /*
        var existing = this.get('allSecurityGroups').filter((sg) => {
          return sg.name;
        });
        */
      }
    },
  },

  subnetChoices: function() {
    var out = [];
    var seenVpcs = [];

    this.get('allSubnets').forEach((subnet) => {
      var region = subnet.get('region');
      var vpcId = subnet.get('vpcId');
      var subnetId = subnet.get('subnetId');

      if ( seenVpcs.indexOf(vpcId) === -1 )
      {
        seenVpcs.pushObject(vpcId);
        out.pushObject({
          group: region,
          sortKey: region + ' ' + vpcId,
          label: vpcId,
          value: vpcId,
          type: 'vpc',
        });
      }

      out.pushObject({
          group: region,
          sortKey: region + ' ' + vpcId + ' ' + subnetId,
          label: '&nbsp;&nbsp;&nbsp;&nbsp;'+subnetId,
          value: subnetId,
          type: 'subnet'
      });
    });

    return out.sortBy('sortKey');
  }.property('allSubnets.@each.{subnetId,vpcId,zone}'),

  initFields: function() {
    this._super();
    this.set('clients', Ember.Object.create());
    this.set('allSubnets', []);
    this.set('vpcOrSubnetId', this.get('amazonec2Config.subnetId') || this.get('amazonec2Config.vpcId'));
  },

  validate: function() {
    return this._super();
  },

  vpcOrSubnetId: null,
  vpcOrSubnetIdChanged: function() {
    var val = (this.get('vpcOrSubnetId')||'').trim();
    var vpcId = null;
    var subnetId = null;

    if ( val.indexOf('vpc-') === 0 )
    {
      vpcId = val;
    }
    else if ( val.indexOf('subnet-') === 0 )
    {
      subnetId = val;
    }

    this.set('amazonec2Config.vpcId', vpcId);
    this.set('amazonec2Config.subnetId', subnetId);
  }.observes('vpcOrSubnetId'),

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
