import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var ContainerController = Cattle.TransitioningResourceController.extend({
  needs: ['hosts'],
  icon: 'fa-tint',

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

    delete: function() {
      return this.delete();
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    redirectTo: function(name) {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this.transitionToRoute(name, this.get('id'));
    },

    shell: function() {
      this.send('redirectTo','container.shell');
    },

    edit: function() {
      this.send('redirectTo','container.edit');
    },

    promptDelete: function() {
      this.send('redirectTo','container.delete');
    },

    detail: function() {
      Ember.run.next(this, function() {
        this.send('redirectTo','container');
      });
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Edit',          icon: 'fa-edit',          action: 'edit',         enabled: !!a.update },
      { label: 'View in API',   icon: 'fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { label: 'Execute Shell', icon: 'fa-terminal',      action: 'shell',        enabled: !!a.execute },
      { label: 'Restart',       icon: 'fa-refresh',       action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'fa-arrow-up',      action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'fa-arrow-down',    action: 'stop',         enabled: !!a.stop },
      { label: 'Restore',       icon: 'fa-ambulance',     action: 'restore',      enabled: !!a.restore },
      { label: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { label: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge },
    ];

    return choices;
  }.property('actions.{update,execute,restart,start,stop,restore,purge}','canDelete'),

  primaryActions: function() {
    var a = this.get('availableActions');
    var choices = [];

    if ( this.get('canDelete') )
    {
      var primary = ifEnabled('restart') || ifEnabled('start') || ifEnabled('stop');
      if ( primary )
      {
        choices.push(primary);
      }

      choices.push(byName('promptDelete'));
    }
    else
    {
      choices.push(byName('restore'));
      choices.push(byName('purge'));
    }

    choices.push({ label: 'Details',         icon: 'fa-info-circle',          action: 'detail',        enabled: true });
    return choices;

    function byName(name) {
      return a.filterProperty('action',name)[0];
    }

    function ifEnabled(name) {
      var action = byName(name);
      if ( action && !!action.enabled )
      {
        return action;
      }
    }
  }.property('availableActions.[]','availableActions.@each.enabled'),

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayIp: function() {
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress');
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state')
});

ContainerController.reopenClass({
  stateMap: {
   'running': {icon: 'fa-circle-o', color: 'text-success'},
   'stopped': {icon: 'fa-circle',   color: 'text-danger'},
   'removed': {icon: 'fa-trash',    color: 'text-danger'},
   'purged':  {icon: 'fa-fire',     color: 'text-danger'}
  },
});

export default ContainerController;
