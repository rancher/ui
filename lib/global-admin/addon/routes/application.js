import C from 'shared/utils/constants';
import Ember from 'ember';
import Errors from 'shared/utils/errors';
import PromiseToCb from 'ui/mixins/promise-to-cb';
import Subscribe from 'ui/mixins/subscribe';
import { xhrConcur } from 'shared/utils/platform';

export default Ember.Route.extend(Subscribe, PromiseToCb, {
  prefs:    Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  access:   Ember.inject.service(),
  session:  Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),
  language: Ember.inject.service('user-language'),
  userTheme : Ember.inject.service('user-theme'),
  actions: {
    loading(transition) {
      this.incrementProperty('loadingId');
      let id = this.get('loadingId');
      Ember.run.cancel(this.get('hideTimer'));

      if ( !this.get('loadingShown') ) {
        this.set('loadingShown', true);
        //console.log('Loading Show', id);

        $('#loading-underlay').stop().show().fadeIn({duration: 100, queue: false, easing: 'linear', complete: function() {
          $('#loading-overlay').stop().show().fadeIn({duration: 200, queue: false, easing: 'linear'});
        }});
      }

      transition.finally(() => {
        var self = this;
        function hide() {
          //console.log('Loading hide', id);
          self.set('loadingShown', false);
          $('#loading-overlay').stop().fadeOut({duration: 200, queue: false, easing: 'linear', complete: function() {
            $('#loading-underlay').stop().fadeOut({duration: 100, queue: false, easing: 'linear'});
          }});
        }

        if ( this.get('loadingId') === id ) {
          if ( transition.isAborted ) {
            //console.log('Loading aborted', id, this.get('loadingId'));
            this.set('hideTimer', Ember.run.next(hide));
          } else {
            //console.log('Loading finished', id, this.get('loadingId'));
            //needed to set this to run after render as there was wierdness wiht new register page
            Ember.run.scheduleOnce('afterRender', () => {
              hide();
            });
          }
        }
      });

      return true;
    },

    error(err, transition) {
      /*if we dont abort the transition we'll call the model calls again and fail transition correctly*/
      transition.abort();

      if ( err && err.status && [401,403].indexOf(err.status) >= 0 )
      {
        this.send('logout',transition,true);
        return;
      }

      this.controllerFor('application').set('error',err);
      this.transitionTo('failWhale');

      console.log('Application Error', (err ? err.stack : undefined));
    },

  },
  model(params, transition) {
    // Save whether the user is admin
    let type = this.get(`session.${C.SESSION.USER_TYPE}`);
    let isAdmin = (type === C.USER.TYPE_ADMIN) || !this.get('access.enabled');
    this.set('access.admin', isAdmin);

    this.get('session').set(C.SESSION.BACK_TO, undefined);

    let promise = new Ember.RSVP.Promise((resolve, reject) => {
      let tasks = {
        userSchemas:                                    this.toCb('loadUserSchemas'),
        clusters:                                       this.toCb('loadClusters'),
        projects:                                       this.toCb('loadProjects'),
        preferences:                                    this.toCb('loadPreferences'),
        settings:                                       this.toCb('loadPublicSettings'),
        project:            ['clusters','projects', 'preferences',
                             this.toCb('selectProject',transition)],
        projectSchemas:     ['project',                 this.toCb('loadProjectSchemas')],
        identities:         ['userSchemas', this.cbFind('identity', 'userStore')],
      };

      async.auto(tasks, xhrConcur, function(err, res) {
        if ( err ) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    }, 'Load all the things');

    return promise.then((hash) => {
      return Ember.Object.create(hash);
    }).catch((err) => {
      return this.loadingError(err, transition, Ember.Object.create({
        projects: [],
        project: null,
      }));
    });
  },
  loadUserSchemas() {
    // @TODO Inline me into releases
    let userStore = this.get('userStore');
    return userStore.rawRequest({url:'schema', dataType: 'json'}).then((xhr) => {
      userStore._bulkAdd('schema', xhr.body.data);
    });
  },
  loadClusters() {
    return this.get('userStore').find('cluster', null, {url: 'clusters'});
  },

  loadProjects() {
    let svc = this.get('projects');
    return svc.getAll().then((all) => {
      svc.set('all', all);
      return all;
    });
  },
  loadPreferences() {
    return this.get('userStore').find('userpreference', null, {url: 'userpreferences', forceReload: true}).then((res) => {
      // Save the account ID from the response headers into session
      if ( res )
      {
        this.set(`session.${C.SESSION.ACCOUNT_ID}`, res.xhr.headers.get(C.HEADER.ACCOUNT_ID));
      }

      this.get('language').initLanguage(true);
      this.get('userTheme').setupTheme();

      if (this.get(`prefs.${C.PREFS.I_HATE_SPINNERS}`)) {
        Ember.$('BODY').addClass('i-hate-spinners');
      }

      return res;
    });
  },
  loadPublicSettings() {
    return this.get('userStore').find('setting', null, {url: 'settings', forceReload: true, filter: {all: 'false'}});
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
  loadProjectSchemas() {
    var store = this.get('store');
    store.resetType('schema');
    return store.rawRequest({url:'schema', dataType: 'json'}).then((xhr) => {
      store._bulkAdd('schema', xhr.body.data);
    });
  },

  loadingError(err, transition, ret) {
    let isAuthEnabled = this.get('access.enabled');
    let isAuthFail = [401,403].indexOf(err.status) >= 0;

    var msg = Errors.stringify(err);
    console.log('Loading Error:', msg, err);
    if ( err && (isAuthEnabled || isAuthFail) ) {
      this.set('access.enabled', true);
      // this.send('logout', transition, isAuthFail, (isAuthFail ? undefined : msg));
      return;
    }

    // this.replaceWith('authenticated.clusters');
    return ret;
  },

  cbFind(type, store='store', opt=null) {
    return (results, cb) => {
      if ( typeof results === 'function' ) {
        cb = results;
        results = null;
      }

      return this.get(store).find(type,null,opt).then(function(res) {
        cb(null, res);
      }).catch(function(err) {
        cb(err, null);
      });
    };
  }
});
