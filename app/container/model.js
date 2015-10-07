import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var Container = Resource.extend({
  // Common to all instances
  requestedHostId: null,
  primaryIpAddress: null,
  primaryAssociatedIpAddress: null,

  // Container-specific
  type: 'container',
  imageUuid: null,
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

  _actions: {
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

    var isSystem = this.get('systemContainer') !== null;
    var isService = Object.keys(this.get('labels')||{}).indexOf(C.LABEL.SERVICE_NAME) >= 0;

    var choices = [
      { label: 'Restart',       icon: 'icon icon-refresh',      action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'icon icon-play',         action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'icon icon-pause',        action: 'stop',         enabled: !!a.stop },
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { label: 'Restore',       icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'Execute Shell', icon: '',                       action: 'shell',        enabled: !!a.execute },
      { label: 'View Logs',     icon: '',                       action: 'logs',         enabled: !!a.logs },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'Clone',         icon: 'icon icon-copy',         action: 'clone',        enabled: !isSystem && !isService },
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actionLinks.{restart,start,stop,restore,purge,execute,logs,update}','canDelete','systemContainer','labels'),


  // Hacks
  hasManagedNetwork: function() {
    return this.get('primaryIpAddress') && this.get('primaryIpAddress').indexOf('10.') === 0;
  }.property('primaryIpAddress'),

  combinedState: function() {
    var resource = this.get('state');
    var health = this.get('healthState');

    if ( ['running','active','updating-active'].indexOf(resource) >= 0 )
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
    else
    {
      return resource;
    }
  }.property('state', 'healthState'),

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayIp: function() {
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress') || new Ember.Handlebars.SafeString('<span class="text-muted">None</span>');
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state'),

  isManaged: Ember.computed.notEmpty('systemContainer'),
  primaryHost: Ember.computed.alias('hosts.firstObject'),
});

Container.reopenClass({
  alwaysInclude: ['hosts'],

  mangleIn: function(data) {
    if ( data.labels )
    {
      // Labels shouldn't be a model even if it has a key called 'type'
      data.labels = JSON.parse(JSON.stringify(data.labels));
    }

    return data;
  },
});

export default Container;
