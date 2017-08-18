import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var Cluster = Resource.extend(PolledResource, {
  modalService: Ember.inject.service('modal'),
  userStore: Ember.inject.service('user-store'),

  type: 'cluster',

  actions: {
    edit() {
      this.get('modalService').toggleModal('modal-edit-cluster', this);
    }
  },

  _allProjects: null,
  init() {
    this._super(...arguments);
    this.set('_allProjects', this.get('userStore').all('project'));
  },

  projects: function() {
    return this.get('_allProjects').filterBy('clusterId', this.get('id'));
  }.property('_allProjects.@each.clusterId'),

  availableActions: function() {
//    let a = this.get('actionLinks');
    let l = this.get('links');

    var choices = [
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
//      { label: 'action.activate',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
//      { label: 'action.deactivate',       icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate, altAction: 'deactivate'},
//      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate}','links.{update,remove}'),

  // @TODO real data
  numHosts: function() {
    return 1+Math.round(Math.random()*100);
  }.property(),

  numCores: function() {
    return 1+Math.round(Math.random()*100);
  }.property(),

  numGhz: function() {
    return 1+Math.round(Math.random()*100);
  }.property(),

  numMem: function() {
    return Math.round(Math.random()*1000);
  }.property(),

  numStorage: function() {
    return Math.round(Math.random()*1000);
  }.property(),
});

Cluster.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Cluster;
