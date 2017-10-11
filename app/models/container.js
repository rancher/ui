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
  type: 'container',
  image: null,
  registryCredentialId: null,
  command: null,
  commandArgs: null,
  environment: null,
  ports: null,
  instanceLinks: null,
  dataVolumes: null,
  dataVolumesFrom: null,
  devices: null,
  restartPolicy: null,

  mounts: denormalizeIdArray('mountIds'),
  primaryHost: denormalizeId('hostId'),
  service: denormalizeId('serviceId'),

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

    editService: function() {
      this.get('service').send('upgrade');
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

    let labelKeys = Object.keys(this.get('labels')||{});
    let isSystem = this.get('isSystem');
    let isService = labelKeys.indexOf(C.LABEL.SERVICE_NAME) >= 0;
    let isNative = !!this.get('nativeContainer');
    let canConvert = !!a.converttoservice && !isSystem && !isService && !isNative;
    let canEditService = !!this.get('service.links.update');

    var choices = [
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',             enabled: !!a.upgrade && !isService && !isNative },
      { label: 'action.editService',      icon: 'icon icon-edit',         action: 'editService',      enabled: canEditService && !isNative },
      { label: 'action.convertToService', icon: 'icon icon-service',      action: 'convertToService', enabled: canConvert},
      { label: 'action.clone',            icon: 'icon icon-copy',         action: 'clone',            enabled: !isSystem && !isService && !isNative},
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
  }.property('actionLinks.{restart,start,stop,restore,execute,logs,upgrade,converttoservice}','canDelete','isSystem','nativeContainer','service.links.update'),


  memoryReservationBlurb: Ember.computed('memoryReservation', function() {
    if ( this.get('memoryReservation') ) {
      return formatSi(this.get('memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  combinedState: function() {
    var host = this.get('primaryHost.state');
    var resource = this.get('state');
    var service = this.get('service.state');
    var health = this.get('healthState');
    var hasCheck = !!this.get('healthCheck');

    if ( !hasCheck && C.DISCONNECTED_STATES.includes(host) ) {
      return 'unknown';
    } else if ( resource === 'stopped' && this.get('desired') === false ) {
      return 'pending-delete';
    } else if ( service !== 'inactive' && resource === 'stopped' && this.get('shouldRestart') === true ) {
      return 'pending-restart';
    } else if ( C.ACTIVEISH_STATES.includes(resource) && health ) {
      return health;
    } else {
      return resource;
    }
  }.property('primaryHost.state','service.state','desired','state','healthState','healthCheck','shouldRestart'),

  isOn: function() {
    return ['running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayState: Ember.computed('_displayState','exitCode', function() {
    let out = this.get('_displayState');
    let code = this.get('exitCode');
    if ( this.get('state') === 'stopped' && this.get('exitCode') > 0) {
      out += ' (' + code + ')';
    }

    return out;
  }),

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

  isSidekick: function() {
    let val = (this.get('labels')||{})[C.LABEL.LAUNCH_CONFIG];
    return val && val !== C.LABEL.LAUNCH_CONFIG_PRIMARY;
  }.property('labels'),

  sortByDeploymentUnitName: function() {
    // stack - service - padded number - config
    if ( this.get('isSidekick') ) {
      let name = (this.get('labels')||{})[C.LABEL.SERVICE_NAME];
      if ( name ) {
        let parts = name.split(/\//);
        let num = this.get('sortName').replace(/.*-/,'');
        parts.insertAt(2, Util.strPad(num, 6, '0')); 
        return parts.join('-');
      }
    }

    return this.get('sortName');

  }.property('sortName','isSidekick','labels'),
});

export default Container;
