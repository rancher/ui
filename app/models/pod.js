import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { computed } from '@ember/object';
import { strPad } from 'ui/utils/util';
import { formatSi } from 'shared/utils/parse-unit';
import DisplayImage from 'shared/mixins/display-image';

var Pod = Resource.extend(DisplayImage, {
  namespace: reference('namespaceId'),
  node: reference('nodeId'),

  availableActions: function() {
    var a = this.get('actionLinks');
    if ( !a )
    {
      return [];
    }

    let labelKeys = Object.keys(this.get('labels')||{});
    let isSystem = this.get('isSystem');
    let isService = labelKeys.indexOf(C.LABEL.SERVICE_NAME) >= 0;
    let isNative = false
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
  }.property('actionLinks.{restart,start,stop,restore,execute,logs,upgrade,converttoservice}','canDelete','isSystem','service.links.update'),

  memoryReservationBlurb: computed('memoryReservation', function() {
    if ( this.get('memoryReservation') ) {
      return formatSi(this.get('memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  combinedState: function() {
    var node = this.get('node.state');
    var resource = this.get('state');
    var service = this.get('service.state');
    var health = this.get('healthState');
    var hasCheck = !!this.get('healthCheck');

    if ( !hasCheck && C.DISCONNECTED_STATES.includes(node) ) {
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
  }.property('node.state','service.state','desired','state','healthState','healthCheck','shouldRestart'),

  isOn: function() {
    return ['running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayState: computed('_displayState','exitCode', function() {
    let out = this.get('_displayState');
    let code = this.get('exitCode');
    if ( this.get('state') === 'stopped' && this.get('exitCode') > 0) {
      out += ' (' + code + ')';
    }

    return out;
  }),

  displayEnvironmentVars: computed('environment', function() {
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
      return match.slice(1).map((octet) => { return strPad(octet,3,'0',false); }).join(".");
    }
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state'),

  isGlobalScale: function() {
    return (this.get('labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('labels'),
});

export function stoppedIcon(inst)
{
  if ( inst.get('restartPolicy.name') === 'no' && inst.get('exitCode') === 0 ) {
    return 'icon icon-dot-circlefill';
  }

  return 'icon icon-circle';
}

export function stoppedColor(inst)
{
  if ( inst.get('restartPolicy.name') === 'no' && inst.get('exitCode') === 0 ) {
    return 'text-success';
  }

  return 'text-error';
}

Pod.reopenClass({
  stateMap: {
    'stopped': {icon: stoppedIcon, color: stoppedColor},
  },
});

export default Pod;
