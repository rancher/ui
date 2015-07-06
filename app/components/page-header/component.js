import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  project: Ember.computed.alias('projects.current'),

  currentPath: null,
  authController: null,

  tagName: 'header',
  classNames: ['clearfix','no-select'],
  classNameBindings: ['hasAside'],

  showHostSetup: function() {
    var userType = this.get('session').get(C.SESSION.USER_TYPE);
    var isAdmin = userType === undefined || userType === C.USER.TYPE_ADMIN;
    return isAdmin && this.get('store').hasRecordFor('schema','setting');
  }.property(),

  projectChoices: function() {
    return this.get('projects.active').sortBy('name','id');
  }.property('projects.active.@each.{id,displayName,state}'),

  projectIsMissing: function() {
    return this.get('projectChoices').filterProperty('id', this.get('project.id')).get('length') === 0;
  }.property('project.id','projectChoices.@each.id'),

  isInfrastructure: function() {
    return this.get('currentPath').indexOf('authenticated.infrastructure') === 0;
  }.property('currentPath'),

  isStacks: function() {
    return this.get('currentPath').indexOf('authenticated.stacks') === 0;
  }.property('currentPath'),

  actions: {
    showAbout: function() {
      this.sendAction('showAbout');
    },

    switchProject: function(id) {
      this.sendAction('switchProject', id);
    },

    goToPrevious: function() {
      this.sendAction('goToPrevious');
    },

    composeDownload: function(os) {
      this.get('store').find('setting',null,{filter: {all: 'false'}}).then((settings) => {
        var map = {};
        settings.forEach((setting) => {
          var name = setting.get('name').replace(/\./g,'_').toLowerCase();
          map[name] = setting.get('value');
        });

        var url = map['rancher_compose_'+os+'_url'];
        if ( url )
        {
          Util.download(url);
        }
      });
    },
  },
});
