import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  project: Ember.computed.alias('projects.current'),

  currentPath: null,
  authController: null,

  tagName: 'header',
  classNames: ['clearfix','no-select'],
  classNameBindings: ['hasAside'],

  accessEnabled: Ember.computed.alias('access.enabled'),
  isAdmin: Ember.computed.alias('access.admin'),
  isLocalAuth: function() {
    return this.get('access.provider') === 'localauthconfig';
  }.property('access.provider'),

  projectChoices: function() {
    return this.get('projects.active').sortBy('name','id');
  }.property('projects.active.@each.{id,displayName,state}'),

  projectIsMissing: function() {
    return this.get('projectChoices').filterBy('id', this.get('project.id')).get('length') === 0;
  }.property('project.id','projectChoices.@each.id'),

  isInfrastructureTab: function() {
    return this.get('currentPath').indexOf('authenticated.infrastructure-tab') === 0;
  }.property('currentPath'),

  isApplicationsTab: function() {
    return this.get('currentPath').indexOf('authenticated.applications-tab') === 0;
  }.property('currentPath'),

  isAdminTab: function() {
    return this.get('currentPath').indexOf('authenticated.admin-tab') === 0;
  }.property('currentPath'),

  showHostSetup: function() {
    return this.get('isAdmin') && this.get('store').hasRecordFor('schema','setting');
  }.property(),

  actions: {
    showAbout() {
      this.sendAction('showAbout');
    },

    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    goToPrevious() {
      this.sendAction('goToPrevious');
    },

    composeDownload(os) {
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

    changePassword() {
      this.get('store').find('account', this.get('session.'+C.SESSION.ACCOUNT_ID)).then((account) => {
        //@TODO bad...
        window.lc('application').setProperties({
          editAccount: true,
          originalModel: account
        });
      });
    },
  },
});
