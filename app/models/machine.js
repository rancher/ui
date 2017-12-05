import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Util from 'ui/utils/util';
import Resource from 'ember-api-store/models/resource';
import { formatMib, formatSi } from 'shared/utils/util';
import C from 'ui/utils/constants';
import { denormalizeIdArray } from 'ember-api-store/utils/denormalize';
import { satisfies, compare } from 'shared/utils/parse-version';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from "@ember/service";


var Machine = Resource.extend(StateCounts,{
  type: 'machine',
  modalService: service('modal'),
  settings: service(),
  prefs: service(),
  router: service(),
  clusterStore: service(),

  init() {
    this._super(...arguments);
    this.defineStateCounts('arrangedInstances', 'instanceStates', 'instanceCountSort');
  },

  instances: denormalizeIdArray('instanceIds'),
  arrangedInstances: function() {
    let out = this.get('instances').sortBy('system','displayName');
    return out;
  }.property('instances.@each.{isSystem,displayName}'),

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    promptEvacuate: function() {
      this.get('modalService').toggleModal('modal-host-evacuate', {
        model: [this]
      });
    },

    evacuate: function() {
      return this.doAction('evacuate');
    },

    newContainer: function() {
      this.get('router').transitionTo('containers.run', {queryParams: {hostId: this.get('model.id')}});
    },

    clone: function() {
      this.get('router').transitionTo('hosts.new', {queryParams: {hostId: this.get('id'), driver: this.get('driver')}});
    },

    edit: function() {
      this.get('modalService').toggleModal('modal-edit-host', this);
    },

    machineConfig: function() {
      var url = this.linkFor('config');
      if ( url )
      {
        Util.download(url);
      }
    }
  },

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    let out = [
      { label: 'action.machineConfig', icon: 'icon icon-download', action: 'machineConfig', enabled: !!l.config},
      { divider: true },
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',   icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate, bulkable: true},
      { label: 'action.deactivate', icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate, bulkable: true},
      { label: 'action.evacuate',   icon: 'icon icon-snapshot',     action: 'promptEvacuate',enabled: !!a.evacuate, altAction: 'evacuate', bulkable: true},
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true},
    ];

    return out;
  }.property('actionLinks.{activate,deactivate,evacuate}','links.{update,remove,config}','driver'),

  displayIp: alias('agentIpAddress'),

  displayName: function() {
    let name = this.get('name');
    if ( name ) {
      return name;
    }

    name = this.get('hostname');
    if ( name ) {
      return name.replace(/\..*$/,'');
    }

    return '('+this.get('id')+')';
  }.property('name','hostname','id'),

  osBlurb: function() {
    var out = this.get('info.osInfo.operatingSystem')||'';

    out = out.replace(/\s+\(.*?\)/,''); // Remove details in parens
    out = out.replace(/;.*$/,''); // Or after semicolons
    out = out.replace('Red Hat Enterprise Linux Server','RHEL'); // That's kinda long

    var hasKvm = (this.get('labels')||{})[C.LABEL.KVM] === 'true';
    if ( hasKvm && out )
    {
      out += ' (with KVM)';
    }

    return out;
  }.property('info.osInfo.operatingSystem','labels'),

  osDetail: alias('info.osInfo.operatingSystem'),

  dockerEngineVersion: function() {
    if ( this.get('info.osInfo') )
    {
      return (this.get('info.osInfo.dockerVersion')||'').replace(/^Docker version\s*/i,'').replace(/,.*/,'');
    }
  }.property('info.osInfo.dockerVersion'),

  supportState: function() {
    let my = this.get('dockerEngineVersion')||'';
    my = my.replace(/-(cs|ce|ee)[0-9.-]*$/,'');

    let supported = this.get(`settings.${C.SETTING.SUPPORTED_DOCKER}`);
    let newest = this.get(`settings.${C.SETTING.NEWEST_DOCKER}`);

    if ( !my || !supported || !newest) {
      return 'unknown';
    } else if ( satisfies(my, supported) ) {
      return 'supported';
    } else if ( compare(my, newest) > 0 ) {
      return 'untested';
    } else {
      return 'unsupported';
    }
  }.property('dockerEngineVersion',`settings.${C.SETTING.SUPPORTED_DOCKER}`,`settings.${C.SETTING.NEWEST_DOCKER}`),

  dockerDetail: alias('info.osInfo.operatingSystem'),

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

  cpuTooltip: alias('info.cpuInfo.modelName'),

  memoryBlurb: function() {
    if ( this.get('info.memoryInfo') )
    {
      return formatMib(this.get('info.memoryInfo.memTotal'));
    }
  }.property('info.memoryInfo.memTotal'),

  memoryLimitBlurb: computed('memory', function() {
    if ( this.get('memory') )
    {
      return formatSi(this.get('memory'), 1024, 'iB', 'B');
    }
  }),

  localStorageBlurb: computed('localStorageMb', function() {
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
        out.pushObject(EmberObject.create({label: fs, value: formatMib(fses[fs].capacity)}));
      });

      return out;
    }
  }.property('info.diskInfo.fileSystems.@each.capacity'),

  // If you use this you must ensure that services and containers are already in the store
  //  or they will not be pulled in correctly.
  displayEndpoints: function() {
    var store = this.get('clusterStore');
    return (this.get('publicEndpoints')||[]).map((endpoint) => {
      if ( !endpoint.service ) {
        endpoint.service = store.getById('service', endpoint.serviceId);
      }

      endpoint.instance = store.getById('instance', endpoint.instanceId);
      return endpoint;
    });
  }.property('publicEndpoints.@each.{ipAddress,port,serviceId,instanceId}'),

  requireAnyLabelStrings: function() {
    return  ((this.get('labels')||{})[C.LABEL.REQUIRE_ANY]||'')
              .split(/\s*,\s*/)
              .filter((x) => x.length > 0 && x !== C.LABEL.SYSTEM_TYPE);
  }.property(`labels.${C.LABEL.REQUIRE_ANY}`),
});

Machine.reopenClass({
  defaultSortBy: 'name,hostname',
});

export default Machine;
