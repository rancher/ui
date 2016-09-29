import Ember from 'ember';
import Util from 'ui/utils/util';
import Resource from 'ember-api-store/models/resource';
import { byId as serviceById } from 'ui/models/service';
import { formatMib } from 'ui/utils/util';
import C from 'ui/utils/constants';
import { getByInstanceId, denormalizeInstanceArray } from 'ui/utils/denormalize-instance';

var Host = Resource.extend({
  type: 'host',
  modalService: Ember.inject.service('modal'),

  instances: denormalizeInstanceArray('instanceIds'),

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
      this.get('application').transitionToRoute('hosts.new', {queryParams: {machineId: machine.get('id'), driver: machine.get('driver')}});
    },

    edit: function() {
      this.get('modalService').toggleModal('edit-host', this);
    },

    machineConfig: function() {
      var machine = this.get('machine');
      if ( machine )
      {
        var url = machine.linkFor('config');
        if ( url )
        {
          url = this.get('endpointSvc').addAuthParams(url);
          Util.download(url);
        }
      }
    }
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label: 'action.activate',   icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      { label: 'action.deactivate', icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate},
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete'},
      { label: 'action.purge',      icon: '',                       action: 'purge',        enabled: !!a.purge},
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true},
    ];

    if ( this.get('machine') )
    {
      if ( this.get('machine.links.config') )
      {
        out.push({ label: 'action.machineConfig', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
      }

      out.push({ label: 'action.clone', icon: 'icon icon-copy', action: 'clone', enabled: true });
    }

    out.push({ label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !!a.update });

    return out;
  }.property('actionLinks.{activate,deactivate,remove,purge,update}','machine','machine.links.config'),


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

  displayIp: Ember.computed.alias('agentIpAddress'),

  displayName: function() {
    return this.get('name') || this.get('hostname') || '('+this.get('id')+')';
  }.property('name','hostname','id'),

  //@TODO PERF
  machine: function() {
    var phid = this.get('physicalHostId');
    if ( !phid )
    {
      return null;
    }

    var machine = this.get('store').getById('machine', phid);
    return machine;
  }.property('physicalHostId'),
  //@TODO PERF

  osBlurb: function() {
    var out = this.get('info.osInfo.operatingSystem')||'';

    out = out.replace(/\s+\(.*?\)/,''); // Remove details in parens
    out = out.replace('Red Hat Enterprise Linux Server','RHEL'); // That's kinda long

    var hasKvm = (this.get('labels')||{})[C.LABEL.KVM] === 'true';
    if ( hasKvm && out )
    {
      out += ' (with KVM)';
    }

    return out;
  }.property('info.osInfo.operatingSystem','labels'),

  osDetail: Ember.computed.alias('info.osInfo.operatingSystem'),

  dockerBlurb: function() {
    if ( this.get('info.osInfo') )
    {
      return (this.get('info.osInfo.dockerVersion')||'').replace(/^Docker version\s*/i,'').replace(/, build.*/,'');
    }
  }.property('info.osInfo.dockerVersion'),

  dockerDetail: Ember.computed.alias('info.osInfo.operatingSystem'),

  kernelBlurb: function() {
    if ( this.get('info.osInfo') )
    {
      return (this.get('info.osInfo.kernelVersion')||'');
    }
  }.property('info.osInfo.kernelVersion'),

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

  // If you use this you must ensure that services and containers are already in the store
  //  or they will not be pulled in correctly.
  displayEndpoints: function() {
    var store = this.get('store');
    return (this.get('publicEndpoints')||[]).map((endpoint) => {
      if ( !endpoint.service ) {
        endpoint.service = serviceById(endpoint.serviceId);
      }

      endpoint.instance = getByInstanceId(store, endpoint.instanceId);
      return endpoint;
    });
  }.property('publicEndpoints.@each.{ipAddress,port,serviceId,instanceId}'),
});

Host.reopenClass({
  // Remap the host state to hostState so the regular state can be a computed combination of host+agent state.
  mangleIn: function(data) {
    data['hostState'] = data['state'];
    delete data['state'];
    return data;
  },

  stateMap: {
    'active':           {icon: 'icon icon-host',    color: 'text-success'},
    'reconnecting':     {icon: 'icon icon-help',    color: 'text-danger'},
  }
});

export default Host;
