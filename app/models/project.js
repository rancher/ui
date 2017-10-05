import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

var Project = Resource.extend(PolledResource, {
  access: Ember.inject.service(),
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  type: 'project',
  name: null,
  description: null,

  cluster: denormalizeId('clusterId'),

  canAddHost: Ember.computed.notEmpty('cluster.registrationToken.hostCommand'),
  canImport: Ember.computed.notEmpty('cluster.registrationToken.clusterCommand'),
  isKubernetes: Ember.computed.equal('cluster.orchestration','kubernetes'),

  actions: {
    edit: function() {
      this.get('router').transitionTo('authenticated.clusters.project', this.get('id'));
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
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
    },

  },

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    var choices = [
      { label: 'action.setDefault',       icon: 'icon icon-star-fill',    action: 'setAsDefault', enabled: this.get('canSetDefault')},
      { divider: true },
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate, bulkable: true},
      { label: 'action.deactivate',       icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate, altAction: 'deactivate', bulkable: true},
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate}','links.{update,remove}','state','canSetDefault'),

  icon: function() {
    if ( this.get('active') )
    {
      return 'icon icon-folder-open';
    }
    else
    {
      return 'icon icon-folder text-muted';
    }
  }.property('active'),

  isDefault: function() {
    return this.get('prefs.' + C.PREFS.PROJECT_DEFAULT) === this.get('id');
  }.property('prefs.' + C.PREFS.PROJECT_DEFAULT, 'id'),

  active: function() {
     return ( this.get('id') === this.get(`tab-session.${C.TABSESSION.PROJECT}`) );
  }.property(`tab-session.${C.TABSESSION.PROJECT}`, 'id'),

  canSetDefault: function() {
    return this.get('state') === 'active' && !this.get('isDefault');
  }.property('state','isDefault'),

  displayOrchestration: function() {
    return Util.ucFirst(this.get('orchestration'));
  }.property('orchestration'),

  isWindows: Ember.computed.equal('orchestration','windows'),

  // @TODO real data
  numStacks: function() {
    return 3+Math.round(Math.random()*3);
  }.property().volatile(),

  numServices: function() {
    return 10+Math.round(Math.random()*9);
  }.property().volatile(),

  numContainers: function() {
    return 50+Math.round(Math.random()*49);
  }.property().volatile(),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Project;
