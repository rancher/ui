import Ember from 'ember';
import C from 'ui/utils/constants';
import Subscribe from 'ui/mixins/subscribe';

const CHECK_AUTH_TIMER = 600000;

export default Ember.Route.extend(Subscribe, {
  prefs     : Ember.inject.service(),
  projects  : Ember.inject.service(),
  k8s       : Ember.inject.service(),
  access    : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),
  language  : Ember.inject.service('user-language'),
  storeReset: Ember.inject.service(),

  beforeModel(transition) {
    this._super.apply(this,arguments);

    if ( this.get('access.enabled') ) {
      if ( this.get('access.isLoggedIn') ) {
        this.testAuthToken();
      } else {
        transition.send('logout', transition, false);
        return Ember.RSVP.reject('Not logged in');
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
    let type = this.get(`session.${C.SESSION.USER_TYPE}`);
    let isAdmin = (type === C.USER.TYPE_ADMIN) || !this.get('access.enabled');
    this.set('access.admin', isAdmin);

    return Ember.RSVP.hash({
      schemas: this.loadUserSchemas(),
      projects: this.loadProjects(),
      preferences: this.loadPreferences(),
      settings: this.loadPublicSettings(),
      language: this.get('language').initLanguage(),
    }).then((hash) => {
      let projectId = null;
      if ( transition.params && transition.params['authenticated.project'] && transition.params['authenticated.project'].project_id )
      {
        projectId = transition.params['authenticated.project'].project_id;
      }

      // Make sure a valid project is selected
      return this.get('projects').selectDefault(projectId).then((project) => {
        // Load stuff that is needed to draw the header
        hash.project = project;

        return Ember.RSVP.hash({
          language: this.get('language').setLanguage(),
          orchestrationState: this.get('projects').updateOrchestrationState(),
          hosts: this.get('store').findAllUnremoved('host'),
          machines: this.get('store').findAllUnremoved('machine'),
          stacks: this.get('store').findAllUnremoved('environment'),
          mounts: this.get('store').findAllUnremoved('mount'), // the container model needs access
        }).then((moreHash) => {
          Ember.merge(hash, moreHash);

          if ( hash.orchestrationState.kubernetesReady ) {
            return this.loadKubernetes().then((k8sHash) => {
              Ember.merge(hash, k8sHash);
              return Ember.Object.create(hash);
            });
          } else {
            return Ember.Object.create(hash);
          }
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
    this.get('storeReset').reset();
  },

  loadingError(err, transition, ret) {
    let isAuthEnabled = this.get('access.enabled');

    if ( err && isAuthEnabled ) {
      this.send('logout',transition, (transition.targetName !== 'authenticated.index'));
      return;
    }

    this.replaceWith('settings.projects');
    return ret;
  },

  loadPreferences() {
    return this.get('userStore').find('userpreference', null, {url: 'userpreferences', forceReload: true}).then((res) => {
      // Save the account ID from the response headers into session
      if ( res && res.xhr )
      {
        this.set(`session.${C.SESSION.ACCOUNT_ID}`, res.xhr.getResponseHeader(C.HEADER.ACCOUNT_ID));
      }

      this.get('userTheme').setupTheme();

      return res;
    });
  },

  loadKubernetes() {
    let k8s = this.get('k8s');

    return k8s.allNamespaces().then((all) => {
      k8s.set('namespaces', all);
      return k8s.selectNamespace().then((ns) => {
        return {
          namespaces: all,
          namespace: ns,
        };
      });
    }).catch(() => {
      return {
        namespaces: null,
        namespace: null,
      };
    });
  },


  loadUserSchemas() {
    // @TODO Inline me into releases
    let userStore = this.get('userStore');
    return userStore.rawRequest({url:'schema', dataType: 'json'}).then((res) => {
      userStore._bulkAdd('schema', res.xhr.responseJSON.data);
    });
  },

  loadProjects() {
    let svc = this.get('projects');
    return svc.getAll().then((all) => {
      svc.set('all', all);
      return all;
    });
  },

  loadPublicSettings() {
    return this.get('userStore').find('setting', null, {url: 'setting', forceReload: true, filter: {all: 'false'}});
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
      console.log('Switch to ' + projectId);
      this.disconnectSubscribe(() => {
        console.log('Switch is disconnected');
        this.send('finishSwitchProject', projectId, transition);
      });
    },

    finishSwitchProject(projectId, transition) {
      console.log('Switch finishing');
      this.get('storeReset').reset();
      if ( transition ) {
        this.intermediateTransitionTo('authenticated');
      }
      this.set(`tab-session.${C.TABSESSION.PROJECT}`, projectId);
      this.set(`tab-session.${C.TABSESSION.NAMESPACE}`, undefined);
      this.refresh();
      console.log('Switch finished');
    },

    refreshKubernetes() {
      let model = this.get('controller.model');
      let project = model.get('project');
      if ( project && project.get('kubernetes') ) {
        this.loadKubernetes(project).then((hash) => {
          model.setProperties(hash);
        });
      }
    },

    switchNamespace(namespaceId) {
      let route = this.get('app.currentRouteName');

      if ( route !== 'k8s-tab.namespaces' && !route.match(/^k8s-tab\.namespace\.[^.]+.index$/) )
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
