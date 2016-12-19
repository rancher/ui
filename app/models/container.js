import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { denormalizeId, denormalizeIdArray } from 'ember-api-store/utils/denormalize';
import Instance from 'ui/models/instance';
import { formatSi } from 'ui/utils/util';

var Container = Instance.extend({
  // Common to all instances
  requestedHostId            : null,
  primaryIpAddress           : null,
  primaryAssociatedIpAddress : null,
  projects                   : Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  // Container-specific
  type                       : 'container',
  imageUuid                  : null,
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
  primaryStack               : Ember.computed.alias('primaryService.stack'),

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
        window.open(`//${window.location.host}/env/${proj}/infra/console?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=717,height=590,left=200,top=200");
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
      this.get('modalService').toggleModal('edit-container', this);
    },

    clone: function() {
      this.get('router').transitionTo('containers.new', {queryParams: {containerId: this.get('id')}});
    },

    cloneToService: function() {
      this.get('router').transitionTo('service.new', {queryParams: {containerId: this.get('id')}});
    },

  },

  availableActions: function() {
    var a = this.get('actionLinks');
    if ( !a )
    {
      return [];
    }

    var labelKeys = Object.keys(this.get('labels')||{});
    var isSystem = !!this.get('system') || labelKeys.indexOf(C.LABEL.SYSTEM_TYPE) >= 0;
    var isService = labelKeys.indexOf(C.LABEL.SERVICE_NAME) >= 0;
    var isVm = this.get('isVm');
    var isK8s = labelKeys.indexOf(C.LABEL.K8S_POD_NAME) >= 0;

    var choices = [
      { label: 'action.restart',    icon: 'icon icon-refresh',      action: 'restart',      enabled: !!a.restart, bulkable: true, bulkActionName: 'Restart'},
      { label: 'action.start',      icon: 'icon icon-play',         action: 'start',        enabled: !!a.start, bulkable: true, bulkActionName:  'Start'},
      { label: 'action.stop',       icon: 'icon icon-stop',         action: 'promptStop',   enabled: !!a.stop, altAction: 'stop', bulkable: true, bulkActionName: 'Stop' },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete', bulkable: true, bulkActionName: 'Delete' },
      { label: 'action.purge',      icon: '',                       action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'action.execute',    icon: '',                       action: 'shell',        enabled: !!a.execute && !isVm, altAction:'popoutShell'},
      { label: 'action.console',    icon: '',                       action: 'console',      enabled: !!a.console &&  isVm, altAction:'popoutShellVm' },
      { label: 'action.logs',       icon: '',                       action: 'logs',         enabled: !!a.logs, altAction: 'popoutLogs' },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'action.clone',      icon: 'icon icon-copy',         action: 'clone',        enabled: !isSystem && !isService && !isK8s},
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update && !isK8s },
    ];

    return choices;
  }.property('actionLinks.{restart,start,stop,restore,purge,execute,logs,update}','systemContainer','canDelete','labels','isVm'),


  memoryReservationBlurb: Ember.computed('memoryReservation', function() {
    if ( this.get('memoryReservation') ) {
      return formatSi(this.get('memoryReservation'), 1024, 'iB', 'B');
    }
  }),
  // Hacks
  hasManagedNetwork: function() {
    return this.get('primaryIpAddress') && this.get('primaryIpAddress').indexOf('10.') === 0;
  }.property('primaryIpAddress'),

  combinedState: function() {
    var resource = this.get('state');
    var health = this.get('healthState');

    if ( C.ACTIVEISH_STATES.indexOf(resource) >= 0 )
    {
      if ( health === null || health === 'healthy' )
      {
        return resource;
      }
      else
      {
        return health;
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
  }.property('state', 'healthState'),

  isVm: function() {
    return this.get('type').toLowerCase() === 'virtualmachine';
  }.property('type'),

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

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

  isManaged: Ember.computed.notEmpty('systemContainer'),

  displayImage: function() {
    return (this.get('imageUuid')||'').replace(/^docker:/,'');
  }.property('imageUuid'),

  displayExternalId: function() {
    var id = this.get('externalId');
    if ( id )
    {
      return (Ember.Handlebars.Utils.escapeExpression(id.substr(0,12))+"&hellip;").htmlSafe();
    }
  }.property('externalId'),

  isGlobalScale: function() {
    return (this.get('labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('labels'),
});

export default Container;
