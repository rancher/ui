import Ember from 'ember';
import C from 'ui/utils/constants';
import Subscribe from 'ui/mixins/subscribe';

const CHECK_AUTH_TIMER = 600000;

export default Ember.Route.extend(Subscribe, {
  prefs     : Ember.inject.service(),
  projects  : Ember.inject.service(),
  settings  : Ember.inject.service(),
  k8s       : Ember.inject.service(),
  access    : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),
  language  : Ember.inject.service('user-language'),
  storeReset: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

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

    let promise = new Ember.RSVP.Promise((resolve, reject) => {
      let tasks = {
        userSchemas:                                    this.toCb('loadUserSchemas'),
        projects:                                       this.toCb('loadProjects'),
        preferences:                                    this.toCb('loadPreferences'),
        settings:                                       this.toCb('loadPublicSettings'),
        project:            ['projects', 'preferences', this.toCb('selectProject',transition)],
        projectSchemas:     ['project',                 this.toCb('loadProjectSchemas')],
        orchestrationState: ['projectSchemas',          this.toCb('updateOrchestration')],
        instances:          ['projectSchemas',          this.cbFind('instance')],
        machines:           ['projectSchemas',          this.cbFind('machine')],
        services:           ['projectSchemas',          this.cbFind('service')],
        hosts:              ['projectSchemas',          this.cbFind('host')],
        stacks:             ['projectSchemas',          this.cbFind('stack')],
        mounts:             ['projectSchemas',          this.cbFind('mount')], // the container model needs access
        volumes:            ['projectSchemas',          this.cbFind('volume')],
        snapshots:          ['projectSchemas',          this.cbFind('snapshot')],
      };

      async.auto(tasks, function(err, res) {
        if ( err ) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    }, 'Load all the things');

    return promise.then((hash) => {
      if ( hash.orchestrationState.kubernetesReady ) {
        return this.loadKubernetes().then((k8sHash) => {
          Ember.merge(hash, k8sHash);
          return Ember.Object.create(hash);
        });
      } else {
        return Ember.Object.create(hash);
      }
    }).catch((err) => {
      return this.loadingError(err, transition, Ember.Object.create({
        projects: [],
        project: null,
      }));
    });
  },

  activate() {
    let app = this.controllerFor('application');

    this._super();
    if ( !this.controllerFor('application').get('isPopup') )
    {
      this.connectSubscribe();
    }

    if ( this.get('settings.isRancher') && !app.get('isPopup') )
    {
     //Show the telemetry opt-in
      let opt = this.get(`settings.${C.SETTING.TELEMETRY}`);
      if ( this.get('access.admin') && (!opt || opt === 'prompt') )
      {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.get('modalService').toggleModal('modal-welcome');
        });
      }
      else if ( false && this.get('settings.isOSS') && !this.get(`prefs.${C.PREFS.FEEDBACK}`) )
      {
       //Show the feedback form
        let time = this.get(`prefs.${C.PREFS.FEEDBACK_TIME}`);
        if ( !time ) {
          time = (new Date()).getTime() + C.PREFS.FEEDBACK_DELAY;
          this.set(`prefs.${C.PREFS.FEEDBACK_TIME}`, time);
        }

        let now = (new Date()).getTime();
        if ( (now - time) >= 0 )
        {
          Ember.run.scheduleOnce('afterRender', this, function() {
            this.get('modalService').toggleModal('modal-feedback');
          });
        }
      }
    }
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

  toCb(name, ...args) {
    return (cb) => {
      this[name](...args).then(function(res) {
        cb(null, res);
      }).catch(function(err) {
        cb(err, null);
      });
    };
  },

  cbFind(type) {
    return (cb) => {
      return this.get('store').find(type).then(function(res) {
        cb(null, res);
      }).catch(function(err) {
        cb(err, null);
      });
    };
  },

  loadPreferences() {
    return this.get('userStore').find('userpreference', null, {url: 'userpreferences', forceReload: true}).then((res) => {
      // Save the account ID from the response headers into session
      if ( res )
      {
        this.set(`session.${C.SESSION.ACCOUNT_ID}`, res.xhr.headers.get(C.HEADER.ACCOUNT_ID));
      }

      this.get('userTheme').setupTheme();

      if (this.get(`prefs.${C.PREFS.I_HATE_SPINNERS}`)) {
        Ember.$('BODY').addClass('i-hate-spinners');
      }

      this.get('language').setLanguage();

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

  loadProjectSchemas() {
    var store = this.get('store');
    store.resetType('schema');
    return store.rawRequest({url:'schema', dataType: 'json'}).then((xhr) => {
      store._bulkAdd('schema', xhr.body.data);
    });
  },

  loadUserSchemas() {
    // @TODO Inline me into releases
    let userStore = this.get('userStore');
    return userStore.rawRequest({url:'schema', dataType: 'json'}).then((xhr) => {
      userStore._bulkAdd('schema', xhr.body.data);
    });
  },

  loadProjects() {
    let svc = this.get('projects');
    return svc.getAll().then((all) => {
      svc.set('all', all);
      return all;
    });
  },

  updateOrchestration() {
    return this.get('projects').updateOrchestrationState();
  },

  loadPublicSettings() {
    return this.get('userStore').find('setting', null, {url: 'setting', forceReload: true, filter: {all: 'false'}});
  },

  selectProject(transition) {
    let projectId = null;
    if ( transition.params && transition.params['authenticated.project'] && transition.params['authenticated.project'].project_id )
    {
      projectId = transition.params['authenticated.project'].project_id;
    }

    // Make sure a valid project is selected
    return this.get('projects').selectDefault(projectId);
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
