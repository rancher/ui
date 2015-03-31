import Ember from 'ember';
import Project from 'ui/project/model';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  pageName: null,
  project: null,
  projects: null,
  hasAside: null,
  addRoute: null,

  tagName: 'header',
  classNames: ['clearfix','no-select'],
  classNameBindings: ['hasAside'],

  defaultProject: null,
  init: function() {
    this._super();
    var project = Project.create({
      id: undefined,
      name: 'Default',
      externalId: undefined,
      externalIdType: 'default'
    });

    this.set('defaultProject', project);
  },

  showHostSetup: function() {
    var userType = this.get('session').get(C.USER_TYPE_SESSION_KEY);
    var isAdmin = userType === undefined || userType === C.USER_TYPE_ADMIN;
    return isAdmin && this.get('store').hasRecordFor('schema','setting');
  }.property(),

  projectChoices: function() {
    var out = this.get('projects').slice().filter(function(item) {
      return item.get('state') === 'active';
    }).sortBy('name','id');
    out.unshift(this.get('defaultProject'));

    return out;
  }.property('defaultProject','projects.@each.{id,displayName,state}'),

  actions: {
    switchProject: function(id) {
      this.sendAction('switchProject', id);
    },

    goToPrevious: function() {
      this.sendAction('goToPrevious');
    }
  },
});
