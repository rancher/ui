import Ember from 'ember';
import C from 'ui/utils/constants';
import Service from 'ui/models/service';
import Subscribe from 'ui/mixins/subscribe';

const CHECK_AUTH_TIMER = 600000;

export default Ember.Route.extend(Subscribe, {
  prefs     : Ember.inject.service(),
  projects  : Ember.inject.service(),
  k8s       : Ember.inject.service(),
  access    : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),

  beforeModel(transition) {
    this._super.apply(this,arguments);

    if ( this.get('access.enabled') && !this.get('access.isLoggedIn') ) {
      transition.send('logout', transition, false);
      return Ember.RSVP.reject('Not logged in');
    } else {
      if (this.get('access.enabled')) {
        this.testAuthToken();
      }
    }
  },

  testAuthToken: function() {
    Ember.run.later(() => {
      this.get('access').testAuth().then((/* res */) => {
        this.testAuthToken();
      }, (/* err */) => {
        this.send('logout',null,true);
      });
    }, CHECK_AUTH_TIMER);
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
      var projectId = null;
      if ( transition.params && transition.params['authenticated.project'] && transition.params['authenticated.project'].project_id )
      {
        projectId = transition.params['authenticated.project'].project_id;
      }

      // Make sure a valid project is selected
      return this.get('projects').selectDefault(projectId).then((project) => {
        hash.project = project;
        return this.loadKubernetes(project, hash).then((out) => {
          return this.loadSwarm(project, out).then((out2) => {
            return Ember.Object.create(out2);
          });
        });
      });
    }).catch((err) => {
      return this.loadingError(err, transition, Ember.Object.create({
        projects: [],
        project: null,
      }));
    });
  },

  activate() {
    this._super();
    this.connectSubscribe();
  },

  deactivate() {
    this._super();
    this.disconnectSubscribe();

    // Forget all the things
    this.reset();
  },

  loadingError(err, transition, ret) {
    var isAuthEnabled = this.get('access.enabled');

    if ( err && err.status && [401,403].indexOf(err.status) >= 0 && isAuthEnabled )
    {
      this.send('logout',transition, (transition.targetName !== 'authenticated.index'));
      return;
    }

    this.replaceWith('settings.projects');
    return ret;
  },

  loadPreferences() {
    return this.get('store').find('userpreference', null, {url: 'userpreferences', authAsUser: true, forceReload: true}).then((res) => {
      // Save the account ID from the response headers into session
      if ( res && res.xhr )
      {
        this.set(`session.${C.SESSION.ACCOUNT_ID}`, res.xhr.getResponseHeader(C.HEADER.ACCOUNT_ID));
      }

      this.get('userTheme').setupTheme();

      return res;
    });
  },

  loadSwarm(project, hash) {
    hash = hash || {};

    if ( !project.get('swarm') )
    {
      hash.swarmReady = false;
      return Ember.RSVP.resolve(hash);
    }

    var id = C.EXTERNALID.KIND_SYSTEM + C.EXTERNALID.KIND_SEPARATOR + C.EXTERNALID.KIND_SWARM;
    return this.get('store').find('environment', null, {filter: {externalId: id}, include: ['services'], forceReload: true}).then((envs) => {
      var ready = false;
      envs.forEach((env) => {
        var services = env.get('services');
        var num = services.get('length');
        var active = services.filterBy('state','active').get('length');
        if ( env.get('state') === 'active' && num && num === active )
        {
          ready = true;
        }
      });

      hash.swarmReady = ready;
      return Ember.RSVP.resolve(hash);
    });
  },

  loadKubernetes(project, hash) {
    hash = hash || {};

    if ( !project.get('kubernetes') )
    {
      hash.kubernetesReady = false;
      return Ember.RSVP.resolve(hash);
    }

    var svc = this.get('k8s');
    return svc.isReady().then((ready) => {
      if ( ready )
      {
        return this.get('k8s').allNamespaces().then((all) => {
          return this.get('k8s').selectNamespace().then((ns) => {
            hash.kubernetesReady = true;
            hash.namespaces = all;
            hash.namespace = ns;
            return hash;
          });
        });
      }
      else
      {
        hash.kubernetesReady = false;
        return Ember.RSVP.resolve(hash);
      }
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
    return this.get('store').find('setting', null, {url: 'setting', authAsUser: true, forceReload: true, filter: {all: 'false'}});
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

    switchProject(projectId, transition=true) {
      this.reset();
      if ( transition ) {
        this.intermediateTransitionTo('authenticated');
      }
      this.set(`tab-session.${C.TABSESSION.PROJECT}`, projectId);
      this.refresh();
    },

    refreshKubernetes() {
      var model = this.get('controller.model');
      this.loadKubernetes(model.get('project')).then((hash) => {
        model.setProperties(hash);
      });
    },

    switchNamespace(namespaceId) {
      var route = this.get('app.currentRouteName');
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
