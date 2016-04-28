import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import Ember from 'ember';
import C from 'ui/utils/constants';

var Project = Resource.extend(PolledResource, {
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  k8sSvc: Ember.inject.service('k8s'),
  swarmSvc: Ember.inject.service('swarm'),
  mesosSvc: Ember.inject.service('mesos'),

  type: 'project',
  name: null,
  description: null,

  actions: {
    edit: function() {
      this.get('router').transitionTo('settings.projects.detail', this.get('id'), {queryParams: {editing: true}});
    },

    delete: function() {
      return this.delete().then(() => {
        // If you're in the project that was deleted, go back to the default project
        if ( this.get('active') )
        {
          window.location.href = window.location.href;
        }
      });
    },

    activate: function() {
      return this.doAction('activate').then(() => {
        return this.waitForState('active').then(() => {
          this.get('projects').refreshAll();
        });
      });
    },

    deactivate: function() {
      return this.doAction('deactivate').then(() => {
        if ( this.get('active') )
        {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function() {
      this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, this.get('id'));
    },

    switchTo: function() {
      // @TODO bad
      window.lc('authenticated').send('switchProject', this.get('id'));
    },

    promptStop: function() {
      this.get('application').setProperties({
        showConfirmDeactivate : true,
        originalModel         : this,
        action                : 'deactivate'
      });
    },

  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var choices = [
      {label: 'Switch to this Environment', icon: 'icon icon-folder-open',  action: 'switchTo',     enabled: this.get('canSwitchTo')},
      {label: 'Set as login default',       icon: 'icon icon-home',         action: 'setAsDefault', enabled: this.get('canSetDefault')},
      { divider: true },
      { label: 'Edit',                      icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
      { label: 'Activate',                  icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      { label: 'Deactivate',                icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate,        altAction: 'deactivate'},
      { divider: true },
      { label: 'Delete',                    icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { label: 'Restore',                   icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',                     icon: '',                       action: 'purge',        enabled: !!a.purge },
    ];


    return choices;
  }.property('actionLinks.{activate,deactivate,update,restore,purge}','state','canRemove','canSetDefault','canSwitchTo'),

  icon: function() {
    if ( this.get('isDefault') )
    {
      return 'icon icon-home';
    }
    else if ( this.get('active') )
    {
      return 'icon icon-folder-open';
    }
    else
    {
      return 'icon icon-folder';
    }
  }.property('active','isDefault'),

  isDefault: function() {
    return this.get('prefs.' + C.PREFS.PROJECT_DEFAULT) === this.get('id');
  }.property('prefs.' + C.PREFS.PROJECT_DEFAULT, 'id'),

  active: function() {
     return ( this.get('id') === this.get(`tab-session.${C.TABSESSION.PROJECT}`) );
  }.property(`tab-session.${C.TABSESSION.PROJECT}`, 'id'),

  canRemove: function() {
    return !!this.get('actionLinks.remove') && ['removing','removed','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state','actionLinks.remove'),

  canSwitchTo: function() {
    return this.get('state') === 'active' && this.get('id') !== this.get('projects.current.id');
  }.property('id','projects.current.id','state'),

  canSetDefault: function() {
    return this.get('state') === 'active' && !this.get('isDefault');
  }.property('state','isDefault'),

  displayOrchestration: function() {
    if ( this.get('kubernetes') )
    {
      return 'Kubernetes';
    }
    else if ( this.get('swarm') )
    {
      return 'Swarm';
    }
    else if ( this.get('mesos') )
    {
      return 'Mesos';
    }
    else
    {
      return 'Cattle';
    }
  }.property('kubernetes','swarm', 'mesos'),

  _stacks: null,
  _hosts: null,
  orchestrationState: null,
  updateOrchestrationState(full=false) {
    let hash;
    if ( this.get('orchestrationState') )
    {
      hash = Ember.copy(this.get('orchestrationState'));
    }
    else
    {
      full = true;
      hash = {
        hasSystem: false,
        hasHost: false,
        hasKubernetes: false,
        hasSwarm: false,
        hasMesos: false,
        kubernetesReady: false,
        swarmReady: false,
        mesosReady: false,
      };
    }


    var promises = [];

    function _hasSystem(stacks) {
      stacks.forEach((stack) => {
        var info = stack.get('externalIdInfo');
        if ( C.EXTERNALID.SYSTEM_KINDS.indexOf(info.kind) >= 0 )
        {
          hash.hasSystem = true;
        }
      });
    }

    if ( this.get('_stacks') )
    {
      _hasSystem(this.get('_stacks'));
    }
    else
    {
      promises.push(this.get('store').findAllUnremoved('environment').then((stacks) => {
        this.set('_stacks', stacks);
        _hasSystem(stacks);
      }));
    }

    if ( this.get('_hosts') )
    {
      hash.hasHost = this.get('_hosts.length') > 0;
    }
    else
    {
      promises.push(this.get('store').findAllActive('host').then((hosts) => {
        hash.hasHost = hosts.get('length') > 0;
      }));
    }

    if ( this.get('kubernetes') && full )
    {
      hash.hasKubernetes = true;
      promises.push(this.get('k8sSvc').isReady().then((ready) => {
        hash.kubernetesReady = ready;
      }));
    }

    if ( this.get('swarm') && full )
    {
      hash.hasSwarm = true;
      promises.push(this.get('swarmSvc').isReady().then((ready) => {
        hash.swarmReady = ready;
      }));
    }

    if ( this.get('mesos') && full )
    {
      hash.hasMesos = true;
      promises.push(this.get('mesosSvc').isReady().then((ready) => {
        hash.mesosReady = ready;
      }));
    }

    return Ember.RSVP.all(promises).then(() => {
      this.set('orchestrationState', hash);
      return Ember.RSVP.resolve(hash);
    });
  },

  expensiveShouldChange: function() {
    console.log('model update state true');
    Ember.run.once(this, 'updateOrchestrationState', true);
  }.observes('kubernetes','swarm','mesos'),

  cheapShouldChange: function() {
    // Don't fire if we're still setting up the initial model
    if ( this.get('orchestrationState') )
    {
      console.log('model update state false', this.get('id'), this.get('orchestrationState'));
      this.updateOrchestrationState(false);
    }
  }.observes('_stacks.@each.externalId','_hosts.[]'),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Project;
