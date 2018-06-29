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

    return this.testAuthToken().then(() => {

      if (get(this, 'access.mustChangePassword')) {
        this.transitionTo('update-password');
      }

      return this.loadPublicSettings().then(() => {
        if (get(this, 'settings.serverUrlIsEmpty')) {
          get(this, 'router').transitionTo('update-critical-settings');
        }
      });

    });
  },

  testAuthToken() {
    return get(this,'access').testAuth().catch(() => {
      this.transitionTo('login');
      this.send('logout',null);
    });
  },

  model(params, transition) {
    get(this,'session').set(C.SESSION.BACK_TO, undefined);

    const isPopup = this.controllerFor('application').get('isPopup');

    return get(this, 'scope').startSwitchToGlobal(!isPopup).then(() => {
      const list = [
        this.loadSchemas('globalStore'),
        this.loadClusters(),
        this.loadProjects(),
        this.loadPreferences(),
        // this.loadPublicSettings(),
      ];

      const globalStore = get(this, 'globalStore');

      if ( !isPopup ) {
        list.addObjects([
          this.preload('node', 'globalStore', {url: 'nodes'}),
          this.preload('nodePool', 'globalStore', {url: 'nodePools'}),
          this.preload('noedTemplates', 'globalStore', {url: 'nodeTemplates'}),
          this.preload('roleTemplate', 'globalStore', {url: 'roleTemplates', filter: { enabled: true, hidden: false }}),
          this.preload('clusterRoleTemplateBindings', 'globalStore', {url: 'clusterRoleTemplateBindings'}),
          this.preload('projectRoleTemplateBinding', 'globalStore', {url: 'projectRoleTemplateBinding'}),
          this.preload('globalRole', 'globalStore', {url: 'globalRole'}),
          this.preload('authConfig', 'globalStore', {url: 'authConfigs'}),
          this.preload('globalRoleBinding', 'globalStore', {url: 'globalRoleBinding'}),
          this.preload('user', 'globalStore', {url: 'user'}),

          globalStore.findAll('principal').then((principals) => {
            const me = principals.filter(p => p.me === true);
            if (me.length > 0) {
              set(this, 'access.principal', get(me, 'firstObject'));
            }
            principals.forEach((p) => {
              set(p, '_mine', true);
            });
          }),
        ]);
      }

      return PromiseAll(list)
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
      $('BODY').addClass('popup');
      return;
    }

    let FALSE = false;
    // @TODO-2.0
    if ( FALSE && get(this,'settings.isRancher') )
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

  _gotoRoute(name, scope='global') {
    // Don't go to routes if in a form page, because you can easily not be on an input
    // and leave the page accidentally.
    if ( $('FORM').length > 0 ) {
      return;
    }

    const clusterId = get(this, 'scope.currentCluster.id');
    const projectId = get(this, 'scope.currentProject.id');

    if ( scope === 'cluster' && clusterId ) {
      this.transitionTo(name, clusterId);
    } else if ( scope === 'project' && projectId ) {
      this.transitionTo(name, projectId);
    } else if ( scope === 'global' ) {
      this.transitionTo(name);
    }
  },

  _gotoMembers() {
    const clusterId = get(this, 'scope.currentCluster.id');
    const projectId = get(this, 'scope.currentProject.id');

    if ( projectId ) {
      this._gotoRoute('authenticated.project.security.members.index', 'project');
    } else if ( clusterId ) {
      this._gotoRoute('authenticated.cluster.security.members.index', 'cluster');
    }
  },


  actions: {
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

    becameReady() {
      // This absorbs became ready in case it's not handled elsewhere
    },

    showAbout() {
      this.controllerFor('application').set('showAbout', true);
    },

    switchProject(projectId, transitionTo='authenticated', transitionArgs) {
      // console.log('Switch to Project:' + projectId);
      PromiseAll([
        get(this, 'scope.subscribeProject').disconnect(),
      ]).then(() => {
        // console.log('Switch is disconnected');
        this.send('finishSwitch', `project:${projectId}`, transitionTo, transitionArgs);
      });
    },

    finishSwitch(id, transitionTo, transitionArgs) {
      // console.log('Switch finishing');

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

      // console.log('Switch finished');
    },

    help()  {
      get(this,'modalService').toggleModal('modal-shortcuts', {escToClose: true});
    },

    // Special
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

    // Global
    gotoc() { this._gotoRoute('global-admin.clusters.index','global'); },
    gotou() { this._gotoRoute('global-admin.accounts.index','global'); },
    gotoK() { this._gotoRoute('authenticated.apikeys','global'); },
    gotoP() { this._gotoRoute('authenticated.prefs','global'); },
    gotoT() { this._gotoRoute('authenticated.node-templates','global'); },

    // Cluster or Project
    gotom() { this._gotoMembers(); },

    // Cluster
    gotod() { this._gotoRoute('authenticated.cluster.index','cluster'); },
    goton() { this._gotoRoute('authenticated.cluster.nodes','cluster'); },
    gotop() { this._gotoRoute('authenticated.cluster.projects','cluster'); },
    gotoV() { this._gotoRoute('authenticated.cluster.storage.persistent-volumes','cluster'); },

    quake() {
      const clusterId = get(this, 'scope.currentCluster.id');
      if ( clusterId ) {
        this.get('modalService').toggleModal('modal-kubectl', {});
      }
    },

    // Project
    gotow() { this._gotoRoute('containers','project'); },
    gotob() { this._gotoRoute('ingresses','project'); },
    gotos() { this._gotoRoute('authenticated.project.dns','project'); },
    gotov() { this._gotoRoute('volumes','project'); },
    gotoa() { this._gotoRoute('apps-tab.index','project'); },

  },

  shortcuts: {
    // Global
    'c': 'gotoc',
    'u': 'gotou',
    'shift+k': 'gotoK',
    'shift+p': 'gotoP',
    'shift+t': 'gotoT',

    // Cluster or Proejct
    '`': 'quake',
    'shift+`': 'quake',
    'm': 'gotom',

    // Cluster
    'd': 'gotod',
    'n': 'goton',
    'p': 'gotop',
    'shift+v': 'gotoV',

    // Project
    'w': 'gotow',
    'b': 'gotob',
    's': 'gotos',
    'v': 'gotov',
    'a': 'gotoa',

    // Other
    // 'g': Defined in subroutes
    't': 'nextTab',
    '/': 'search',
    'shift+/': 'help',
    'backspace': 'delete',
    'delete': 'delete',
  },

});
