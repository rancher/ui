import Ember from 'ember';
import C from 'ui/utils/constants';
import Service from 'ui/models/service';

export default Ember.Route.extend({
  prefs     : Ember.inject.service(),
  projects  : Ember.inject.service(),
  k8s       : Ember.inject.service(),
  access    : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),

  beforeModel(transition) {
    this._super.apply(this,arguments);
    if ( this.get('access.enabled') && !this.get('access.isLoggedIn') )
    {
      transition.send('logout', transition, false);
      return Ember.RSVP.reject('Not logged in');
    }
  },

  model(params, transition) {
    // Save whether the user is admin
    var type = this.get(`session.${C.SESSION.USER_TYPE}`);
    var isAdmin = (type === C.USER.TYPE_ADMIN) || !this.get('access.enabled');
    this.set('access.admin', isAdmin);

    return Ember.RSVP.hash({
      projects: this.loadProjects(),
      preferences: this.loadPreferences(),
      settings: this.loadPublicSettings(),
    }).then((hash) => {
      if ( transition.params && transition.params['authenticated.project'] && transition.params['authenticated.project'].project_id )
      {
        return hash;
      }
      else
      {
        // If not going to a project-specific page, make sure a project is selected
        return this.get('projects').selectDefault().then(() => {
          return hash;
        });
      }
    }).catch((err) => {
      return this.loadingError(err, transition, Ember.Object.create({
        projects: [],
      }));
    });
  },

  deactivate() {
    this._super();

    // Forget all the things
    this.reset();
  },

  loadingError(err, transition, ret) {
    var isAuthEnabled = this.get('access.enabled');

    if ( err && err.status && [401,403].indexOf(err.status) >= 0 && isAuthEnabled )
    {
      this.send('logout',transition,true);
      return;
    }

    this.replaceWith('settings.projects');
    return ret;
  },

  loadPreferences() {
    return this.get('store').find('userpreference', null, {url: 'userpreferences', forceReload: true}).then((res) => {
      // Save the account ID from the response headers into session
      if ( res && res.xhr )
      {
        this.set(`session.${C.SESSION.ACCOUNT_ID}`, res.xhr.getResponseHeader(C.HEADER.ACCOUNT_ID));
      }

      this.get('userTheme').setupTheme();

      return res;
    });
  },

  loadProjects() {
    var svc = this.get('projects');
    return svc.getAll().then((all) => {
      svc.set('all', all);
      return all;
    });
  },

  loadPublicSettings() {
    return this.get('store').find('setting', null, {url: 'setting', forceReload: true, filter: {all: 'false'}});
  },

  reset() {
    // Forget all the things
    this.get('store').reset();
    // Service has extra special hackery to cache relationships
    Service.reset();
  },

  actions: {
    error(err,transition) {
      // Unauthorized error, send back to login screen
      if ( err.status === 401 )
      {
        this.send('logout',transition,true);
        return false;
      }
      else
      {
        // Bubble up
        return true;
      }
    },

    showAbout() {
      this.controllerFor('application').set('showAbout', true);
    },

    switchProject(projectId) {
      this.reset();
      this.intermediateTransitionTo('authenticated');
      this.set(`tab-session.${C.TABSESSION.PROJECT}`, projectId);
      this.refresh();
    },

    switchNamespace(namespaceId) {
      var route = window.lc('application').get('currentRouteName');
      var okRoutes = [
        'k8s-tab.namespaces',
        'k8s-tab.namespace.rcs.index',
        'k8s-tab.namespace.services.index',
        'k8s-tab.namespace.pods.index',
      ];

      if ( okRoutes.indexOf(route) === -1 )
      {
        route = 'k8s-tab.namespace';
      }

      // This will return a different one if the one you ask for doesn't exist
      this.get('k8s').selectNamespace(namespaceId).then((ns) => {
        this.transitionTo(route, ns.get('id'));
      });
    },
  },
});
