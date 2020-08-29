import { all } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { get, set, computed, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import SubscribeGlobal from 'shared/utils/subscribe-global';
import SubscribeCluster from 'shared/utils/subscribe-cluster';
import SubscribeProject from 'shared/utils/subscribe-project';
import { Promise as EmberPromise } from 'rsvp';

export default Service.extend({
  access:           service(),
  intl:             service(),
  growl:            service(),
  prefs:            service(),
  settings:         service(),
  store:            service(),
  globalStore:      service(),
  clusterStore:     service(),
  cookies:          service(),
  app:              service(),
  currentProject:   null,
  currentCluster:   null,
  currentPageScope: 'none',

  docsBase: alias('settings.docsBase'),

  allProjects: null,
  allClusters: null,

  init() {
    const globalStore = get(this, 'globalStore');

    this._super(...arguments);
    setProperties(this, {
      allClusters: globalStore.all('cluster'),
      allProjects: globalStore.all('project'),
    });

    this.initSubscribe();
  },

  // Subscribe
  subscribeGlobal:  null,
  subscribeCluster: null,
  subscribeProject: null,

  initSubscribe() {
    const deps = {
      app:          get(this, 'app'),
      store:        get(this, 'store'),
      clusterStore: get(this, 'clusterStore'),
      globalStore:  get(this, 'globalStore'),
      intl:         get(this, 'intl'),
      growl:        get(this, 'growl'),
      scope:        this,
    };

    const g = SubscribeGlobal.create(deps);
    const c = SubscribeCluster.create(deps);
    const p = SubscribeProject.create(deps);

    g.set('label', 'Global');
    g.set('label', 'Cluster');
    p.set('label', 'Project');

    setProperties(this, {
      subscribeGlobal:  g,
      subscribeCluster: c,
      subscribeProject: p
    });
  },
  // End: Subscribe

  startSwitchToNothing() {
    this._setPageScope('global');

    return get(this, 'subscribeGlobal').disconnect().then(() => {
      return this._startSwitchTo(null, null).then(() => {
        get(this, 'globalStore').reset();
      });
    });
  },

  finishSwitchToNothing() {
    this._finishSwitchTo(null, null);
  },

  startSwitchToGlobal(connect = true) {
    this._setPageScope('global');
    if ( connect ) {
      get(this, 'subscribeGlobal').connect(false);
    }

    return this._startSwitchTo(null, null, connect);
  },

  finishSwitchToGlobal() {
    return this._finishSwitchTo(null, null);
  },

  startSwitchToCluster(cluster, connect = true) {
    this._setPageScope('cluster');

    return this._startSwitchTo(cluster, null, connect);
  },

  finishSwitchToCluster(cluster) {
    return this._finishSwitchTo(cluster, null);
  },

  startSwitchToProject(project, connect = true) {
    this._setPageScope('project');

    return this._startSwitchTo(get(project, 'cluster'), project, connect);
  },

  finishSwitchToProject(project) {
    return this._finishSwitchTo(get(project, 'cluster'), project);
  },

  _setPageScope(scope) {
    set(this, 'currentPageScope', scope);
  },

  _startSwitchTo(cluster, project, connect = true) {
    const clusterOld = get(this, 'currentCluster');
    const clusterSubscribe = get(this, 'subscribeCluster');
    const clusterStore = get(this, 'clusterStore');
    const clusterId = (cluster && get(cluster, 'id')) || null;
    let clusterReset = false;

    const projectOld = get(this, 'currentProject');
    const projectSubscribe = get(this, 'subscribeProject');
    const projectStore = get(this, 'store');
    const projectId = (project && get(project, 'id')) || null;
    let projectReset = false;

    const cleanupPromises = [];

    set(this, 'pendingCluster', cluster);
    set(this, 'pendingProject', project);

    if ( cluster !== clusterOld ) {
      if ( cluster ) {
        set(clusterStore, 'baseUrl', `${ get(this, 'app.apiEndpoint') }/clusters/${ clusterId }`);
      }

      cleanupPromises.push(clusterSubscribe.disconnect());
      clusterReset = true;
    }

    if (!get(clusterSubscribe, 'wasConnected')) {
      clusterReset = true;
    }

    if ( project !== projectOld ) {
      if ( project ) {
        set(projectStore, 'baseUrl', `${ get(this, 'app.apiEndpoint') }/projects/${ projectId }`);
      }

      cleanupPromises.push(projectSubscribe.disconnect());
      projectReset = true;
    }

    return all(cleanupPromises).then(() => {
      if ( clusterReset ) {
        clusterStore.reset();
        if ( cluster && connect ) {
          clusterSubscribe.connect(true, clusterId, projectId);
        }
      }

      if ( projectReset ) {
        projectStore.reset();
        if ( project && connect ) {
          projectSubscribe.connect(true, clusterId, projectId);
        }
      }
    });
  },

  _finishSwitchTo(cluster, project) {
    return new EmberPromise((resolve) => {
      setProperties(this, {
        currentCluster: cluster,
        currentProject: project,
      });

      resolve();

      return;
    });
  },

  getAllProjects(moreOpt = {}) {
    let opt = { url: 'projects' };  // This is called in authenticated/route before schemas are loaded

    Object.assign(opt, moreOpt);

    return get(this, 'globalStore').findAll('project', opt);
  },

  getAllClusters(moreOpt = {}) {
    let opt = { url: 'clusters' };  // This is called in authenticated/route before schemas are loaded

    Object.assign(opt, moreOpt);

    return get(this, 'globalStore').findAll('cluster', opt);
  },

  dashboardBase: computed('currentCluster.id', function() {
    let link;

    if ( get(this, 'app.environment') === 'development' ) {
      link = 'https://localhost:8005/';
    } else {
      link = '/dashboard/';
    }

    return link;
  }),

  dashboardLink: computed('dashboardBase', 'currentCluster.id', function() {
    const cluster = get(this, 'currentCluster');

    if ( !cluster || !cluster.isReady ) {
      // Only in ready/active clusters
      return;
    }

    let link = get(this, 'dashboardBase');

    if ( link ) {
      return `${ link }c/${ escape(cluster.id) }`;
    }
  }),
});
