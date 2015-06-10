import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  currentPath: null,
  project: null,
  projects: null,
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
    return this.get('projects').slice().filter(function(item) {
      return item.get('state') === 'active';
    }).sortBy('name','id');
  }.property('projects.@each.{id,displayName,state}'),

  projectIsMissing: function() {
    return this.get('projectChoices').filterProperty('id', this.get('project.id')).get('length') === 0;
  }.property('project.id','projectChoices.@each.id'),

  isInfrastructure: function() {
    return this.get('currentPath').indexOf('authenticated.infrastructure') === 0;
  }.property('currentPath'),

  isServices: function() {
    return this.get('currentPath').indexOf('authenticated.services') === 0;
  }.property('currentPath'),

  actions: {
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
