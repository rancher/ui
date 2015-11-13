import Ember from 'ember';
import Util from 'ui/utils/util';
import Resource from 'ember-api-store/models/resource';
import { formatMib } from 'ui/utils/util';

var Host = Resource.extend({
  type: 'host',

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    purge: function() {
      return this.doAction('purge');
    },

    newContainer: function() {
      this.get('application').transitionToRoute('containers.new', {queryParams: {hostId: this.get('model.id')}});
    },

    clone: function() {
      var machine = this.get('machine');
      this.get('application').transitionToRoute('hosts.new.'+machine.get('driver'), {queryParams: {machineId: machine.get('id')}});
    },

    edit: function() {
      this.get('application').setProperties({
        editHost: true,
        originalModel: this,
      });
    },

    machineConfig: function() {
      var machine = this.get('machine');
      if ( machine )
      {
        var url = machine.linkFor('config');
        if ( url )
        {
          url = this.get('endpoint').addAuthParams(url);
          Util.download(url);
        }
      }
    }
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label: 'Activate',      icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Deactivate',    icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge,       color: 'text-danger'},
      { divider: true },
      { label: 'View in API',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true},
    ];

    if ( this.get('machine') )
    {
      if ( this.get('machine.links.config') )
      {
        out.push({ label: 'Machine Config', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
      }

      out.push({ label: 'Clone', icon: 'icon icon-copy', action: 'clone', enabled: true });
    }

    out.push({ label: 'Edit', icon: 'icon icon-edit', action: 'edit', enabled: !!a.update });

    return out;
  }.property('actionLinks.{activate,deactivate,remove,purge,update}','machine','machine.links.config'),


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
    if ( this.get('info.osInfo.operatingSystem') )
    {
      return this.get('info.osInfo.operatingSystem').replace(/\s+\(.*?\)/,'');
    }
  }.property('info.osInfo.operatingSystem'),

  osDetail: Ember.computed.alias('info.osInfo.operatingSystem'),

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

  cpuTooltip: Ember.computed.alias('info.cpuInfo.modelName'),

  memoryBlurb: function() {
    if ( this.get('info.memoryInfo') )
    {
      return formatMib(this.get('info.memoryInfo.memTotal'));
    }
  }.property('info.memoryInfo.memTotal'),

  diskBlurb: function() {
    var totalMb = 0;

    // New hotness
    if ( this.get('info.diskInfo.fileSystems') )
    {
      var fses = this.get('info.diskInfo.fileSystems')||[];
      Object.keys(fses).forEach((fs) => {
        totalMb += fses[fs].capacity;
      });

      return formatMib(totalMb);
    }
    else if ( this.get('info.diskInfo.mountPoints') )
    {
      // Old & busted
      var mounts = this.get('info.diskInfo.mountPoints')||[];
      Object.keys(mounts).forEach((mountPoint) => {
        totalMb += mounts[mountPoint].total;
      });

      return formatMib(totalMb);
    }
  }.property('info.diskInfo.mountPoints.@each.total','info.diskInfo.fileSystems.@each.capacity'),

  diskDetail: function() {
    // New hotness
    if ( this.get('info.diskInfo.fileSystems') )
    {
      var out = [];
      var fses = this.get('info.diskInfo.fileSystems')||[];
      Object.keys(fses).forEach((fs) => {
        out.pushObject(Ember.Object.create({label: fs, value: formatMib(fses[fs].capacity)}));
      });

      return out;
    }
  }.property('info.diskInfo.fileSystems.@each.capacity'),
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
    'active':           {icon: 'icon icon-host',    color: 'text-success'},
    'reconnecting':     {icon: 'icon icon-help',    color: 'text-danger'},
  }
});

export default Host;
