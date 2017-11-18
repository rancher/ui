import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

var Pod = Resource.extend({
  workloadId: null,

  namespaceObj: denormalizeId('namespace','namespace'),

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
});

export default Pod;
