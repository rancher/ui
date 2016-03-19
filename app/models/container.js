import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

var Container = Resource.extend({
  // Common to all instances
  requestedHostId            : null,
  primaryIpAddress           : null,
  primaryAssociatedIpAddress : null,
  projects                   : Ember.inject.service(),

  // Container-specific
  type                 : 'container',
  imageUuid            : null,
  registryCredentialId : null,
  command              : null,
  commandArgs          : null,
  environment          : null,
  ports                : null,
  instanceLinks        : null,
  dataVolumes          : null,
  dataVolumesFrom      : null,
  devices              : null,
  restartPolicy        : null,

  actions: {
    restart: function() {
      return this.doAction('restart');
    },

    start: function() {
      return this.doAction('start');
    },

    stop: function() {
      return this.doAction('stop');
    },

    shell: function() {
      this.get('application').setProperties({
        showShell: true,
        originalModel: this,
      });
    },

    popoutShell: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/console?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=717,height=497,left=200,top=200");
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
      this.get('application').setProperties({
        showContainerLogs: true,
        originalModel: this,
      });
    },

    edit: function() {
      this.get('application').setProperties({
        editContainer: true,
        originalModel: this,
      });
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
    var isSystem = this.get('systemContainer') !== null;
    var isService = labelKeys.indexOf(C.LABEL.SERVICE_NAME) >= 0;
    var isVm = this.get('isVm');
    var isK8s = labelKeys.indexOf(C.LABEL.K8S_POD_NAME) >= 0;

    var choices = [
      { label: 'Restart',       icon: 'icon icon-refresh',      action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'icon icon-play',         action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'icon icon-stop',         action: 'stop',         enabled: !!a.stop },
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { label: 'Restore',       icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'Execute Shell', icon: '',                       action: 'shell',        enabled: !!a.execute && !isVm, altAction:'popoutShell'},
      { label: 'Open Console',  icon: '',                       action: 'console',      enabled: !!a.console &&  isVm, altAction:'popoutShellVm' },
      { label: 'View Logs',     icon: '',                       action: 'logs',         enabled: !!a.logs, altAction: 'popoutLogs' },
      { label: 'View in API',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'Clone',         icon: 'icon icon-copy',         action: 'clone',        enabled: !isSystem && !isService && !isK8s},
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update && !isK8s },
    ];

    return choices;
  }.property('actionLinks.{restart,start,stop,restore,purge,execute,logs,update,remove}','systemContainer','canDelete','labels','isVm'),


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
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress') || new Ember.Handlebars.SafeString('<span class="text-muted">None</span>');
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
  primaryHost: Ember.computed.alias('hosts.firstObject'),

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
});

Container.reopenClass({
  alwaysInclude: ['hosts'],
});

export default Container;
