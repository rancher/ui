import $ from 'jquery';
import C from 'ui/utils/constants';
import Route from '@ember/routing/route';
import Preload from 'ui/mixins/preload';
import { inject as service } from '@ember/service';
import { scheduleOnce, later, cancel } from '@ember/runloop';
import { resolve, all as PromiseAll } from 'rsvp';
import { get, set } from '@ember/object';

const CHECK_AUTH_TIMER = 60*10*1000;

export default Route.extend(Preload, {
  access:       service(),
  globalStore:  service(),
  clusterStore: service(),
  cookies:      service(),
  language:     service('user-language'),
  modalService: service('modal'),
  prefs:        service(),
  scope:        service(),
  settings:     service(),
  storeReset:   service(),
  intl:         service(),
  growl:        service(),
  userTheme:    service('user-theme'),

  testTimer:    null,

  beforeModel() {
    this._super(...arguments);

    set(this, 'testTimer', later(() => {
      this.testAuthToken();
    }, CHECK_AUTH_TIMER));

    return this.testAuthToken();
  },

  testAuthToken() {
    return get(this,'access').testAuth().catch(() => {
      this.transitionTo('login');
      this.send('logout',null);
    });
  },

  model(params, transition) {
    get(this,'session').set(C.SESSION.BACK_TO, undefined);


    return get(this, 'scope').startSwitchToGlobal(true).then(() => {
      return PromiseAll([
        this.loadSchemas('globalStore'),
        this.preload('roleTemplate', 'globalStore', {url: 'roleTemplates'}),
        this.preload('clusterRoleTemplateBindings', 'globalStore', {url: 'clusterRoleTemplateBindings'}),
        this.preload('projectRoleTemplateBinding', 'globalStore', {url: 'projectRoleTemplateBinding'}),
        this.preload('globalRole', 'globalStore', {url: 'globalRole'}),
        this.preload('globalRoleBinding', 'globalStore', {url: 'globalRoleBinding'}),
        this.preload('user', 'globalStore', {url: 'user'}),
        this.loadClusters(),
        this.loadProjects(),
        this.loadPreferences(),
        this.loadPublicSettings(),
      ]);
    }).catch((err) => {
      return this.loadingError(err, transition);
    });
  },

  setupController(/*controller, model*/) {
    this._super(...arguments);
    get(this, 'scope').finishSwitchToGlobal();
  },

  activate() {
    this._super(...arguments);

    if ( this.controllerFor('application').get('isPopup') ) {
      return;
    }

    let FALSE = false;
    if ( FALSE && get(this,'settings.isRancher') ) // @TODO-2.0
    {
      let form = get(this,`settings.${C.SETTING.FEEDBACK_FORM}`);

     //Show the telemetry opt-in
      let opt = get(this,`settings.${C.SETTING.TELEMETRY}`);
      if ( get(this,'access.admin') && (!opt || opt === 'prompt') )
      {
        scheduleOnce('afterRender', this, function() {
          get(this,'modalService').toggleModal('modal-telemetry');
        });
      }
      else if ( form && !get(this,`prefs.${C.PREFS.FEEDBACK}`) )
      {
        scheduleOnce('afterRender', this, function() {
          get(this,'modalService').toggleModal('modal-feedback');
        });
      }
    }
  },

  deactivate() {
    this._super();
    const scope = get(this,'scope');
    scope.startSwitchToNothing().then(() => {
      scope.finishSwitchToNothing();
    });
    cancel(get(this,'testTimer'));
  },

  loadPreferences() {
    return get(this,'globalStore').find('preference', null, {url: 'preference'}).then((res) => {
      get(this,'language').initLanguage(true);
      get(this,'userTheme').setupTheme();

      if (get(this,`prefs.${C.PREFS.I_HATE_SPINNERS}`)) {
        $('BODY').addClass('i-hate-spinners');
      }

      return res;
    });
  },

  loadClusters() {
    return get(this,'scope').getAllClusters();
  },

  loadProjects() {
    return get(this,'scope').getAllProjects();
  },

  loadPublicSettings() {
    return get(this,'globalStore').find('setting', null, { url: 'settings' });
  },

  loadSecrets() {
    if ( get(this,'store').getById('schema','secret') ) {
      return get(this,'store').find('secret');
    } else {
      return resolve();
    }
  },

  _gotoRoute(name, withProjectId=true) {
    // Don't go to routes if in a form page, because you can easily not be on an input
    // and leave the page accidentally.
    if ( $('FORM').length > 0 ) {
      return;
    }

    if ( withProjectId ) {
      this.transitionTo(name, get(this,'scope.currentProject.id'));
    } else {
      this.transitionTo(name);
    }
  },

  actions: {
    changeTheme() {
      var userTheme = get(this,'userTheme');
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
        this.send('logout',transition);
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

    switchCluster(clusterId, transitionTo='global-admin.clusters', transitionArgs) {
      console.log('Switch to Cluster:' + clusterId);
      PromiseAll([
        get(this, 'scope.subscribeCluster').disconnect(),
        get(this, 'scope.subscribeProject').disconnect(),
      ]).then(() => {
        console.log('Switch is disconnected');
        this.send('finishSwitch', `cluster:${clusterId}`, transitionTo, transitionArgs);
      });
    },

    switchProject(projectId, transitionTo='authenticated', transitionArgs) {
      console.log('Switch to Project:' + projectId);
      PromiseAll([
        get(this, 'scope.subscribeProject').disconnect(),
      ]).then(() => {
        console.log('Switch is disconnected');
        this.send('finishSwitch', `project:${projectId}`, transitionTo, transitionArgs);
      });
    },

    finishSwitch(id, transitionTo, transitionArgs) {
      console.log('Switch finishing');

      const cookies = get(this,'cookies');
      var [whichCookie, idOut] = id.split(':');

      get(this,'storeReset').reset();

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
    gotoB() { this._gotoRoute('ingresses.index'); },
    gotoD() { this._gotoRoute('authenticated.project.dns.index'); },
    gotoE() { this._gotoRoute('global-admin.clusters.index', false); },
    gotoH() { this._gotoRoute('hosts.index'); },
    gotoK() { this._gotoRoute('authenticated.project.apikeys'); },
    gotoV() { this._gotoRoute('volumes.index'); },
    gotoW() { this._gotoRoute('workloads.index'); },

    help()  {
      get(this,'modalService').toggleModal('modal-shortcuts');
    },

    gotoP() {
      if ( get(this,'access.admin') ) {
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
    'd': 'gotoD',
    'e': 'gotoE',
    'h': 'gotoH',
    'shift+k': 'gotoK',
    'n': 'neu',
    'p': 'gotoP',
    't': 'nextTab',
    'v': 'gotoV',
    'w': 'gotoW',
    '/': 'search',
    'shift+/': 'help',
    'shift+t': 'changeTheme',
    'backspace': 'delete',
    'delete': 'delete',
  },

});
