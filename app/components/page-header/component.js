import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  pageName: null,
  project: null,
  projects: null,
  hasAside: null,
  authController: null,
  addRoute: null,
  addParams: null,

  tagName: 'header',
  classNames: ['clearfix','no-select'],
  classNameBindings: ['hasAside'],

  showHostSetup: function() {
    var userType = this.get('session').get(C.SESSION.USER_TYPE);
    var isAdmin = userType === undefined || userType === C.USER.TYPE_ADMIN;
    return isAdmin && this.get('store').hasRecordFor('schema','setting');
  }.property(),

  projectChoices: function() {
    return this.get('projects').slice().filter(function(item) {
      return item.get('state') === 'active';
    }).sortBy('name','id');
  }.property('projects.@each.{id,displayName,state}'),

  projectIsMissing: function() {
    return this.get('projectChoices').filterProperty('id', this.get('project.id')).get('length') === 0;
  }.property('project.id','projectChoices.@each.id'),

  actions: {
    add: function() {
      var params = this.get('addParams');
      if ( params )
      {
        this.get('authController').transitionToRoute(this.get('addRoute'), this.get('addParams'));
      }
      else
      {
        this.get('authController').transitionToRoute(this.get('addRoute'));
      }
    },

    switchProject: function(id) {
      this.sendAction('switchProject', id);
    },

    goToPrevious: function() {
      this.sendAction('goToPrevious');
    }
  },
});
