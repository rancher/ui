import Ember from 'ember';
import C from 'ui/utils/constants';

const DELAY = 250;

export default Ember.Component.extend({
  access           : Ember.inject.service(),
  projects         : Ember.inject.service(),
  project          : Ember.computed.alias('projects.current'),
  prefs            : Ember.inject.service(),
  k8s              : Ember.inject.service(),
  namespace        : Ember.computed.alias('k8s.namespace'),

  currentPath      : null,
  forcedMenu       : null,
  subnavPartial    : null,
  menuHoverTimer   : null,
  siblingMenuTimer : null,

  projectId        : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),

  accessEnabled    : Ember.computed.alias('access.enabled'),
  isAdmin          : Ember.computed.alias('access.admin'),

  tagName          : 'header',
  classNames       : ['clearfix','no-select'],

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
    return this.get('currentPath').indexOf('authenticated.project.infrastructure-tab') === 0;
  }.property('currentPath'),

  isKubernetesTab: function() {
    return this.get('currentPath').indexOf('authenticated.project.k8s-tab') === 0;
  }.property('currentPath'),

  isApplicationsTab: function() {
    return this.get('currentPath').indexOf('authenticated.project.applications-tab') === 0;
  }.property('currentPath'),

  isAdminTab: function() {
    return this.get('currentPath').indexOf('authenticated.admin-tab') === 0;
  }.property('currentPath'),

  showAccessWarning: function() {
    return this.get('app.showArticles') !== false &&
           !this.get('access.enabled') &&
           this.get('prefs.'+C.PREFS.ACCESS_WARNING) !== false;
  }.property('app.showArticles','access.enabled',`prefs.${C.PREFS.ACCESS_WARNING}`),

  showHostSetup: function() {
    return this.get('isAdmin') && this.get('store').hasRecordFor('schema','setting');
  }.property(),

  tabObserver: Ember.observer('currentPath', 'forcedMenu', function() {

    let hoverableTabs   = ['admin-tab', 'applications-tab', 'infrastructure-tab', 'k8s-tab'];
    let currentPathArr  = this.get('currentPath').split('.');
    let navPartial      = '';
    let isInCurrentPath = false;

    hoverableTabs.forEach((tab) => {
      if (currentPathArr.contains(tab)) {
        isInCurrentPath = true;
        navPartial = tab;
      }
    });

    if (this.get('forcedMenu')) {
      navPartial = this.get('forcedMenu');
    }

    if (isInCurrentPath) {
      this.set('subnavPartial', `tabs/${navPartial}`);
    } else {
      this.set('subnavPartial', null);
    }
  }).on('init'),


  didInsertElement() {
    // Hide the Firefox focus ring
    this.$().on('click', 'A', function(){
      $(this).blur();
    });


    Ember.$('#applications-tab, #infrastructure-tab, #admin-tab, #k8s-tab').mouseenter((e) => {
      if (this.get('menuHoverTimer')) {
        Ember.run.cancel(this.get('menuHoverTimer'));
      }

      if (this.get('siblingMenuTimer')) {
        Ember.run.cancel(this.get('siblingMenuTimer'));
      }

      this.set('siblingMenuTimer', Ember.run.later(() => {
        toggleMenu(e.currentTarget.id);
      }, DELAY));

    }).mouseleave((e) => {

      this.set('menuHoverTimer', Ember.run.later(() => {
        toggleMenu(e.currentTarget.id, true);
      }, DELAY));
    });

    Ember.$('.bottom-row').mouseenter(() => {

      if (this.get('menuHoverTimer')) {
        Ember.run.cancel(this.get('menuHoverTimer'));
      }

      if (this.get('siblingMenuTimer')) {
        Ember.run.cancel(this.get('siblingMenuTimer'));
      }
    }).mouseleave(() => {

      this.set('menuHoverTimer', Ember.run.later(() => {
        this.set('forcedMenu', null);
      }, DELAY));
    });

    var toggleMenu = (element, mouseOut=false) => {
      if (mouseOut) {
        this.set('menuHoverTimer', Ember.run.later(() => {
          this.set('forcedMenu', null);
        }, DELAY));
      } else {
        this.set('forcedMenu', element);
      }
    };
  },

  actions: {
    showAbout() {
      this.sendAction('showAbout');
    },

    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    switchNamespace(id) {
      this.sendAction('switchNamespace', id);
    },

    goToPrevious() {
      this.sendAction('goToPrevious');
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
