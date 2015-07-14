import Resource from 'ember-api-store/models/resource';

var Host = Resource.extend({
  type: 'host',

  instancesUpdated: 0,
  onInstanceChanged: function() {
    this.incrementProperty('instancesUpdated');
  }.observes('instances.@each.{id,name,state}','instances.length'),

  state: function() {
    var host = this.get('hostState');
    var agent = this.get('agentState');
    if ( host === 'active' && agent )
    {
      return agent;
    }
    else
    {
      return host;
    }
  }.property('hostState','agentState'),

  triedToGetIp: false,
  displayIp: function() {
    var obj = (this.get('ipAddresses')||[]).get('firstObject');
    if ( obj )
    {
      return obj.get('address');
    }
    else if ( this && this.hasLink && this.hasLink('ipAddresses') && !this.get('triedToGetIp'))
    {
      this.set('triedToGetIp',true);
      this.importLink('ipAddresses');
    }

    return null;
  }.property('ipAddresses','ipAddresses.[]'),

  arrangedInstances: function() {
    return (this.get('instances')||[]).sortBy('name','id');
  }.property('instances.[]','instances.@each.{name,id}'),

  machine: function() {
    var phid = this.get('physicalHostId');
    if ( !phid )
    {
      return null;
    }

    var machine = this.get('store').getById('machine', phid);
    return machine;
  }.property('physicalHostId'),

  osBlurb: function() {
    // @TODO this always sends back Ubuntu
    if ( false && this.get('info.osInfo') )
    {
      return this.get('info.osInfo.distribution') + ' ' + this.get('info.osInfo.version');
    }
  }.property('info.osInfo.{distribution,version}'),

  dockerBlurb: function() {
    // @TODO this always sends back Ubuntu
    if ( this.get('info.osInfo') )
    {
      return this.get('info.osInfo.dockerVersion').replace(/^Docker version\s*/i,'');
    }
  }.property('info.osInfo.{dockerVersion}'),

  cpuBlurb: function() {
    if ( this.get('info.cpuInfo.count') )
    {
      var ghz = Math.round(this.get('info.cpuInfo.mhz')/10)/100;

      if ( this.get('info.cpuInfo.count') > 1 )
      {
        return this.get('info.cpuInfo.count')+'x' + ghz + ' GHz';
      }
      else
      {
        return ghz + ' GHz';
      }
    }
  }.property('info.cpuInfo.{count,mhz}'),

  memoryBlurb: function() {
    if ( this.get('info.memoryInfo') )
    {
      var gb = Math.round((this.get('info.memoryInfo.memTotal')/1024)*100)/100;

      return gb + ' GiB';
    }
  }.property('info.memoryInfo.memTotal'),

  diskBlurb: function() {
    if ( this.get('info.diskInfo.mountPoints') )
    {
      var totalMb = 0;
      var mounts = this.get('info.diskInfo.mountPoints')||[];
      Object.keys(mounts).forEach((mountPoint) => {
        totalMb += mounts[mountPoint].total;
      });

      var gb = Math.round((totalMb/1024)*10)/10;
      return gb + ' GiB';
    }
  }.property('info.diskInfo.mountPoints.@each.total'),
});

Host.reopenClass({
  alwaysInclude: ['instances','ipAddresses'],

  // Remap the host state to hostState so the regular state can be a computed combination of host+agent state.
  mangleIn: function(data) {
    data['hostState'] = data['state'];
    delete data['state'];

    if ( data.labels )
    {
      // Labels shouldn't be a model even if it has a key called 'type'
      data.labels = JSON.parse(JSON.stringify(data.labels));
    }

    return data;
  },

  stateMap: {
    'active':           {icon: 'ss-database',       color: 'text-success'},
  }
});

export default Host;
