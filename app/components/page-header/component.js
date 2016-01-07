import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  project: Ember.computed.alias('projects.current'),
  prefs: Ember.inject.service(),

  currentPath: null,
  authController: null,

  tagName: 'header',
  classNames: ['clearfix','no-select'],

  accessEnabled: Ember.computed.alias('access.enabled'),
  isAdmin: Ember.computed.alias('access.admin'),
  isLocalAuth: function() {
    return this.get('access.enabled') && this.get('access.provider') === 'localauthconfig';
  }.property('access.{enabled,provider}'),

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

  showBottomRow: function() {
    var out = true;

    if (this.get('currentPath').indexOf('authenticated.help') === 0) {
      out = false;
    }

    return out;
  }.property('currentPath'),

  showAccessWarning: function() {
    return this.get('app.showArticles') !== false &&
           !this.get('access.enabled') &&
           this.get('prefs.'+C.PREFS.ACCESS_WARNING) !== false;
  }.property('app.showArticles','access.enabled',`prefs.${C.PREFS.ACCESS_WARNING}`),

  showHostSetup: function() {
    return this.get('isAdmin') && this.get('store').hasRecordFor('schema','setting');
  }.property(),

  actions: {
    hideAccessWarning: function() {
      this.set(`prefs.${C.PREFS.ACCESS_WARNING}`, false);
    },

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
        this.get('application').setProperties({
          editAccount: true,
          originalModel: account
        });
      });
    },
  },
});
