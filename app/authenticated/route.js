import $ from 'jquery';
import C from 'ui/utils/constants';
import EmberObject from '@ember/object';
import Errors from 'ui/utils/errors';
import Route from '@ember/routing/route';
import Subscribe from 'ui/mixins/subscribe';
import { inject as service } from '@ember/service';
import { later, scheduleOnce, cancel } from '@ember/runloop';
import { reject, resolve, all as PromiseAll } from 'rsvp';

const CHECK_AUTH_TIMER = 60*10*1000;

export default Route.extend(Subscribe, {
  access:       service(),
  authzStore:   service('authz-store'),
  clusterStore: service('cluster-store'),
  cookies:      service(),
  language:     service('user-language'),
  modalService: service('modal'),
  prefs:        service(),
  scope:        service(),
  settings:     service(),
  storeReset:   service(),
  testTimer:    null,
  userTheme:    service('user-theme'),

  beforeModel(transition) {
    this._super.apply(this,arguments);

    if ( this.get('access.enabled') ) {
      if ( this.get('access.isLoggedIn') ) {
        this.testAuthToken();
      } else {
        transition.send('logout', transition, false);
        return reject('Not logged in');
      }
    }
  },

  testAuthToken: function() {
    let timer = later(() => {
      this.get('access').testAuth().then((/* res */) => {
        this.testAuthToken();
      }, (/* err */) => {
        this.send('logout',null,true);
      });
    }, CHECK_AUTH_TIMER);

    this.set('testTimer', timer);
  },

  model(params, transition) {
    // Save whether the user is admin
    let type = this.get(`session.${C.SESSION.USER_TYPE}`);
    let isAdmin = (type === C.USER.TYPE_ADMIN) || !this.get('access.enabled');
    this.set('access.admin', isAdmin);

    this.get('session').set(C.SESSION.BACK_TO, undefined);

    return PromiseAll([
      this.loadSchemas('clusterStore'),
//      this.loadSchemas('authnStore'),
      this.loadSchemas('authzStore'),
      this.loadClusters(),
      this.loadProjects()
      //this.loadPreferences(),
      //this.loadPublicSettings()
    ]).then(() => {
      return this.selectProject(transition);
    }).then(() => {
      return this.loadSchemas('store');
    }).then(() => {
      return PromiseAll([
        this.preload('workload'),
        this.preload('namespace'),
        this.preload('node'),
        this.preload('pod'),
      ]);
    }).catch((err) => {
      return this.loadingError(err, transition);
    });
  },

  activate() {
    let app = this.controllerFor('application');

    this._super();
    if ( !this.controllerFor('application').get('isPopup') && this.get('scope.current') )
    {
      // @TODO-2.0 this.connectSubscribe();
    }

    if ( false && this.get('settings.isRancher') && !app.get('isPopup') ) // @TODO-2.0
    {
      let form = this.get(`settings.${C.SETTING.FEEDBACK_FORM}`);

     //Show the telemetry opt-in
      let opt = this.get(`settings.${C.SETTING.TELEMETRY}`);
      if ( this.get('access.admin') && (!opt || opt === 'prompt') )
      {
        scheduleOnce('afterRender', this, function() {
          // TODO - !!FORDEV!! removed for dev sake
          // this.get('modalService').toggleModal('modal-telemetry');
        });
      }
      else if ( form && !this.get(`prefs.${C.PREFS.FEEDBACK}`) )
      {
        scheduleOnce('afterRender', this, function() {
          this.get('modalService').toggleModal('modal-feedback');
        });
      }
    }
  },

  deactivate() {
    this._super();
    this.disconnectSubscribe();
    cancel(this.get('testTimer'));

    // Forget all the things
    this.get('storeReset').reset();
  },

  loadingError(err, transition) {
    let isAuthEnabled = this.get('access.enabled');
    let isAuthFail = err && err.status && [401,403].indexOf(err.status) >= 0;

    var msg = Errors.stringify(err);
    console.log('Loading Error:', msg, err);
    if ( err && (isAuthEnabled || isAuthFail) ) {
      this.set('access.enabled', true);
      this.send('logout', transition, isAuthFail, (isAuthFail ? undefined : msg));
    } else {
      this.replaceWith('authenticated.clusters');
    }

  },

  preload(type, store='store', opt=null) {
    return this.get(store).find(type,null,opt);
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
        $('BODY').addClass('i-hate-spinners');
      }

      return res;
    });
  },

  loadSchemas(storeName) {
    var store = this.get(storeName);
    store.resetType('schema');
    return store.rawRequest({url:'schema', dataType: 'json'}).then((xhr) => {
      store._bulkAdd('schema', xhr.body.data);
    });
  },

  loadClusters() {
    let svc = this.get('scope');
    return svc.getAllClusters().then((all) => {
      svc.set('allClusters', all);
      return all;
    });
  },

  loadProjects() {
    let svc = this.get('scope');
    return svc.getAll().then((all) => {
      svc.set('all', all);
      return all;
    });
  },

  loadPublicSettings() {
    return this.get('userStore').find('setting', null, {url: 'settings', forceReload: true, filter: {all: 'false'}});
  },

  loadSecrets() {
    if ( this.get('store').getById('schema','secret') ) {
      return this.get('store').find('secret');
    } else {
      return resolve();
    }
  },

  selectProject(transition) {
    let projectId = null;
    if ( transition.params && transition.params['authenticated.project'] && transition.params['authenticated.project'].project_id )
    {
      projectId = transition.params['authenticated.project'].project_id;
    }

    // Make sure a valid project is selected
    return this.get('scope').selectDefaultProject(projectId);
  },

  _gotoRoute(name, withProjectId=true) {
    // Don't go to routes if in a form page, because you can easily not be on an input
    // and leave the page accidentally.
    if ( $('FORM').length > 0 ) {
      return;
    }

    if ( withProjectId ) {
      this.transitionTo(name, this.get('scope.current.id'));
    } else {
      this.transitionTo(name);
    }
  },

  actions: {

    changeTheme: function() {
      var userTheme = this.get('userTheme');
      var currentTheme  = userTheme.getTheme();

      switch (currentTheme) {
      case 'ui-light':
        userTheme.setTheme('ui-dark');
        break;
      case 'ui-dark':
        userTheme.setTheme('ui-auto');
        break;
      case 'ui-auto':
        userTheme.setTheme('ui-light');
        break;
      default:
        break;
      }
    },

    error(err,transition) {
      // Unauthorized error, send back to login screen
      if ( err && err.status === 401 )
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

    switchCluster(clusterId, transitionTo='authenticated.clusters', transitionArgs) {
      console.log('Switch to Cluster:' + clusterId);
      this.disconnectSubscribe(() => {
        console.log('Switch is disconnected');
        this.send('finishSwitchProject', `cluster:${clusterId}`, transitionTo, transitionArgs);
      });
    },

    switchProject(projectId, transitionTo='authenticated', transitionArgs) {
      console.log('Switch to Project:' + projectId);
      this.disconnectSubscribe(() => {
        console.log('Switch is disconnected');
        this.send('finishSwitchProject', `project:${projectId}`, transitionTo, transitionArgs);
      });
    },

    finishSwitchProject(id, transitionTo, transitionArgs) {
      console.log('Switch finishing');

      const cookies = this.get('cookies');
      var [whichCookie, idOut] = id.split(':');

      this.get('storeReset').reset();

      if ( transitionTo ) {
        let args = (transitionArgs||[]).slice();
        args.unshift(transitionTo);
        this.transitionTo.apply(this,args);
      }

      cookies.set(C.COOKIE[whichCookie.toUpperCase()], idOut);

      this.refresh();

      console.log('Switch finished');
    },

    gotoA() { this._gotoRoute('apps-tab.index'); },
    gotoB() { this._gotoRoute('balancers.index'); },
    gotoC() { this._gotoRoute('containers.index'); },
    gotoD() { this._gotoRoute('dns.index'); },
    gotoE() { this._gotoRoute('authenticated.clusters.index', false); },
    gotoH() { this._gotoRoute('hosts.index'); },
    gotoK() { this._gotoRoute('authenticated.project.apikeys'); },
    gotoV() { this._gotoRoute('volumes.index'); },

    help()  {
      this.get('modalService').toggleModal('modal-shortcuts');
    },

    gotoP() {
      if ( this.get('access.admin') ) {
        this._gotoRoute('global-admin.processes', false);
      }
    },

    nextTab() {
      if ( $('.tab-nav').length ) {
        let cur = $('.tab-nav .active');
        let next = cur.closest('li').next().find('a');
        if ( next && next.length ) {
          next.click();
        } else {
          next = $('.tab-nav li:first-child a');
          if ( next && next.length ) {
            next.click();
          }
        }
      }
    },

    neu() {
      let elem = $('.right-buttons a:last')[0];
      if ( elem ) {
        event.stopPropagation();
        event.preventDefault();
        elem.click();
      }
    },

    search(event)  {
      let elem = $("INPUT[type='search']")[0];
      if ( elem ) {
        event.stopPropagation();
        event.preventDefault();
        elem.focus();
      }
    },

    delete() {
      $('.bulk-actions .icon-trash').closest('a').click();
    },
  },

  shortcuts: {
    'a': 'gotoA',
    'b': 'gotoB',
    'c': 'gotoC',
    'd': 'gotoD',
    'e': 'gotoE',
    'h': 'gotoH',
    'shift+k': 'gotoK',
    'n': 'neu',
    'p': 'gotoP',
    't': 'nextTab',
    'v': 'gotoV',
    '/': 'search',
    'shift+/': 'help',
    'shift+t': 'changeTheme',
    'backspace': 'delete',
    'delete': 'delete',
  },

});
