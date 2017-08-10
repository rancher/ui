import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { denormalizeId, denormalizeIdArray } from 'ember-api-store/utils/denormalize';
import Instance from 'ui/models/instance';
import { formatSi } from 'ui/utils/util';
import EndpointPorts from 'ui/mixins/endpoint-ports';

var Container = Instance.extend(EndpointPorts, {
  // Common to all instances
  requestedHostId            : null,
  primaryIpAddress           : null,
  primaryAssociatedIpAddress : null,
  projects                   : Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  // Container-specific
  type                       : 'container',
  image                      : null,
  registryCredentialId       : null,
  command                    : null,
  commandArgs                : null,
  environment                : null,
  ports                      : null,
  instanceLinks              : null,
  dataVolumes                : null,
  dataVolumesFrom            : null,
  devices                    : null,
  restartPolicy              : null,

  mounts                     : denormalizeIdArray('mountIds'),
  primaryHost                : denormalizeId('hostId'),
  services                   : denormalizeIdArray('serviceIds'),
  primaryService             : Ember.computed.alias('services.firstObject'),
  referencedService          : denormalizeId('serviceId'),

  service: Ember.computed('primaryService','referencedService', function() {
    return this.get('referencedService') || this.get('primaryService');
  }),

  actions: {
    restart: function() {
      return this.doAction('restart');
    },

    start: function() {
      return this.doAction('start');
    },

    promptStop: function() {
      this.get('modalService').toggleModal('modal-container-stop', {
        model: [this]
      });
    },

    stop: function() {
      this.doAction('stop');
    },

    shell: function() {
      this.get('modalService').toggleModal('modal-shell', {
        model: this,
        escToClose: false,
      });
    },

    popoutShell: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/console?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
      });
    },

    popoutLogs: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/container-log?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=700,height=715,left=200,top=200");
      });
    },

    logs: function() {
      this.get('modalService').toggleModal('modal-container-logs', this);
    },

    edit: function() {
      this.get('router').transitionTo('containers.run', {queryParams: {containerId: this.get('id'), upgrade: true}});
    },

    clone: function() {
      this.get('router').transitionTo('containers.run', {queryParams: {containerId: this.get('id')}});
    },

    convertToService: function() {
      this.get('modalService').toggleModal('modal-container-to-service', this);
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');
    if ( !a )
    {
      return [];
    }

    var labelKeys = Object.keys(this.get('labels')||{});
    var isSystem = this.get('isSystem');
    var isService = labelKeys.indexOf(C.LABEL.SERVICE_NAME) >= 0;
    var isK8s = labelKeys.indexOf(C.LABEL.K8S_POD_NAME) >= 0;
    var canConvert = !!a.converttoservice && !isSystem && !isService && !isK8s;

    var choices = [
      { label: 'action.upgradeOrEdit',    icon: 'icon icon-edit',         action: 'edit',             enabled: !!a.upgrade && !isK8s },
      { label: 'action.convertToService', icon: 'icon icon-service',      action: 'convertToService', enabled: canConvert},
      { label: 'action.clone',            icon: 'icon icon-copy',         action: 'clone',            enabled: !isSystem && !isService && !isK8s},
      { divider: true },
      { label: 'action.execute',          icon: 'icon icon-terminal',     action: 'shell',            enabled: !!a.execute, altAction:'popoutShell'},
      { label: 'action.console',          icon: 'icon icon-terminal',     action: 'console',          enabled: !!a.console, altAction:'popoutShellVm' },
      { label: 'action.logs',             icon: 'icon icon-file',         action: 'logs',             enabled: !!a.logs, altAction: 'popoutLogs' },
      { divider: true },
      { label: 'action.restart',          icon: 'icon icon-refresh',      action: 'restart',          enabled: !!a.restart, bulkable: true},
      { label: 'action.start',            icon: 'icon icon-play',         action: 'start',            enabled: !!a.start, bulkable: true},
      { label: 'action.stop',             icon: 'icon icon-stop',         action: 'promptStop',       enabled: !!a.stop, altAction: 'stop', bulkable: true},
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete',     enabled: this.get('canDelete'), altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',          enabled: true },
    ];

    return choices;
  }.property('actionLinks.{restart,start,stop,restore,execute,logs,upgrade,converttoservice}','canDelete','isSystem'),


  memoryReservationBlurb: Ember.computed('memoryReservation', function() {
    if ( this.get('memoryReservation') ) {
      return formatSi(this.get('memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  combinedState: function() {
    var host = this.get('primaryHost.state');
    var resource = this.get('state');
    var health = this.get('healthState');
    var hasCheck = !!this.get('healthCheck');

    if ( !hasCheck && C.DISCONNECTED_STATES.includes(host) ) {
      return 'unknown';
    } else if ( resource === 'stopped' && this.get('desired') === false ) {
      return 'pending-delete';
    }
    else if ( C.ACTIVEISH_STATES.includes(resource) )
    {
      if ( hasCheck && health ) {
        return health;
      } else {
        return resource;
      }
    }
    else if ((resource === 'stopped') && ((this.get('labels')||{})[C.LABEL.START_ONCE]) && (this.get('startCount') > 0))
    {
      return 'started-once';
    }
    else
    {
      return resource;
    }
  }.property('primaryHost.state', 'desired', 'state', 'healthState'),

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayEnvironmentVars: Ember.computed('environment', function() {
    var envs = [];
    var environment = this.get('environment')||{};
    Object.keys(environment).forEach((key) => {
      envs.pushObject({key: key, value: environment[key]})
    });
    return envs;
  }),

  displayIp: function() {
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress') || null;
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  sortIp: function() {
    var ip = this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress');
    if ( !ip ) {
      return '';
    }
    var match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if ( match )
    {
      return match.slice(1).map((octet) => { return Util.strPad(octet,3,'0',false); }).join(".");
    }
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state'),

  isSystem: function() {
    if ( this.get('system') ) {
      return true;
    } else {
      let labels = this.get('labels')||{};
      return !!labels[C.LABEL.SYSTEM_TYPE];
    }
  }.property('system','labels'),

  displayExternalId: function() {
    var id = this.get('externalId');
    if ( id )
    {
      return (Ember.Handlebars.Utils.escapeExpression(id.substr(0,6))+"&hellip;").htmlSafe();
    }
  }.property('externalId'),

  isGlobalScale: function() {
    return (this.get('labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('labels'),

  sortName: function() {
    return (this.get('displayName')||'').split(/-/).map((part) => {
      if ( Util.isNumeric(part) ) {
        return Util.strPad(part, 6, '0');
      } else {
        return part;
      }
    }).join('-');
  }.property('displayName'),

  isSidekick: function() {
    return (this.get('labels')||{})[C.LABEL.LAUNCH_CONFIG] + '' !== C.LABEL.LAUNCH_CONFIG_PRIMARY;
  }.property('labels'),

  sortByDeploymentUnitName: function() {
    // stack - service - padded number - config
    if ( this.get('isSidekick') ) {
      let parts = ((this.get('labels')||{})[C.LABEL.SERVICE_NAME] + '').split(/\//);
      let num = this.get('sortName').replace(/.*-/,'');
      parts.insertAt(2, Util.strPad(num, 6, '0')); 
      return parts.join('-');
    } else {
      return this.get('sortName');
    }
  }.property('sortName','isSidekick','labels'),
});

export default Container;
