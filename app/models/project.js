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
      { label: 'action.switchEnvironment',icon: 'icon icon-folder-open',  action: 'switchTo',     enabled: this.get('canSwitchTo')},
      { label: 'action.setDefault',       icon: 'icon icon-home',         action: 'setAsDefault', enabled: this.get('canSetDefault')},
      { divider: true },
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
      { label: 'action.activate',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      { label: 'action.deactivate',       icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate,        altAction: 'deactivate'},
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { label: 'action.restore',          icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'action.purge',            icon: '',                       action: 'purge',        enabled: !!a.purge },
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
  updateOrchestrationState() {
    let hash;
    if ( this.get('id') !== this.get(`tab-session.${C.SESSION.PROJECT}`) )
    {
      return null;
    }

    if ( this.get('orchestrationState') )
    {
      hash = Ember.copy(this.get('orchestrationState'));
    }
    else
    {
      hash = {
        hasKubernetes: false,
        hasSwarm: false,
        hasMesos: false,
        kubernetesReady: false,
        swarmReady: false,
        mesosReady: false,
      };
    }

    let promises = [];

    if ( this.get('kubernetes') )
    {
      hash.hasKubernetes = true;
      promises.push(this.get('k8sSvc').isReady().then((ready) => {
        hash.kubernetesReady = ready;
      }));
    }

    if ( this.get('swarm') )
    {
      hash.hasSwarm = true;
      promises.push(this.get('swarmSvc').isReady().then((ready) => {
        hash.swarmReady = ready;
      }));
    }

    if ( this.get('mesos') )
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

  orchestrationStateShouldChange: function() {
    Ember.run.once(this, 'updateOrchestrationState', true);
  }.observes('kubernetes','swarm','mesos'),

  isReady: function() {
    var state = this.get('orchestrationState');

    if ( !state )
    {
      return false;
    }

    return (
      (!state.hasKubernetes || state.kubernetesReady) &&
      (!state.hasSwarm || state.swarmReady) &&
      (!state.hasMesos || state.mesosReady)
    );
  }.property('orchestrationState'), // The state object is always completely replaced, so this is ok

  checkForWaiting(hosts) {
    return this.updateOrchestrationState().then(() => {
      if ( (hosts && hosts.get('length') === 0) || !this.get('isReady') )
      {
        this.get('router').transitionTo('authenticated.project.waiting', this.get('id'));
      }
    });
  }
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Project;
