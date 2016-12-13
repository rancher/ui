import Ember from 'ember';
import Util from 'ui/utils/util';
import Resource from 'ember-api-store/models/resource';
import { formatMib, formatSi } from 'ui/utils/util';
import C from 'ui/utils/constants';
import { denormalizeIdArray } from 'ember-api-store/utils/denormalize';

var Host = Resource.extend({
  type: 'host',
  modalService: Ember.inject.service('modal'),

  instances: denormalizeIdArray('instanceIds'),
  arrangedInstances: function() {
    return this.get('instances').sortBy('isSystem','displayName');
  }.property('instances.@each.{isSystem,displayName}'),

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
      this.get('application').transitionToRoute('hosts.new', {queryParams: {hostId: this.get('id'), driver: this.get('driver')}});
    },

    edit: function() {
      this.get('modalService').toggleModal('edit-host', this);
    },

    machineConfig: function() {
      var url = this.linkFor('config');
      if ( url )
      {
        url = this.get('endpointSvc').addAuthParams(url);
        Util.download(url);
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

    if ( this.get('links.config') )
    {
      out.push({ label: 'action.machineConfig', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
    }

    out.push({ label: 'action.clone', icon: 'icon icon-copy', action: 'clone', enabled: !!this.get('driver') });
    out.push({ label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !!a.update });

    return out;
  }.property('actionLinks.{activate,deactivate,remove,purge,update}','links.config','driver'),

  displayIp: Ember.computed.alias('agentIpAddress'),

  displayName: function() {
    return this.get('name') || this.get('hostname') || '('+this.get('id')+')';
  }.property('name','hostname','id'),

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

  memoryLimitBlurb: Ember.computed('memory', function() {
    if ( this.get('memory') )
    {
      return formatSi(this.get('memory'), 1024, 'iB', 'B');
    }
  }),

  localStorageBlurb: Ember.computed('localStorageMb', function() {
    if (this.get('localStorageMb')) {
      return formatSi(this.get('localStorageMb'), 1024, 'iB', 'B', 2 /*start at 1024^2==MB */);
    }
  }),

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
        endpoint.service = store.getById('service', endpoint.serviceId);
      }

      endpoint.instance = store.getById('instance', endpoint.instanceId);
      return endpoint;
    });
  }.property('publicEndpoints.@each.{ipAddress,port,serviceId,instanceId}'),
});

Host.reopenClass({
  defaultSortBy: 'name,hostname',
  stateMap: {
    'active':           {icon: 'icon icon-host',    color: 'text-success'},
    'provisioning':     {icon: 'icon icon-host',    color: 'text-info'},
    'reconnecting':     {icon: 'icon icon-help',    color: 'text-danger'},
  }
});

export default Host;
