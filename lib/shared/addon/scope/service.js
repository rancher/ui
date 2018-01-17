import {
  reject,
  resolve,
  Promise as EmberPromise
} from 'rsvp';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { alias } from '@ember/object/computed';
import { computed, get, set, setProperties } from '@ember/object';

let ACTIVEISH = ['active','upgrading'];

export default Service.extend({
  access:           service(),
  prefs:            service(),
  store:            service(),
  globalStore:      service(),
  clusterStore:     service(),
  cookies:          service(),
  app:              service(),
  current:          null,
  currentCluster:   null,
  currentPageScope: 'none',
  all:              null,
  allClusters:      null,

  currentProject: alias('current'),

  init() {
    this._super(...arguments);
    setProperties(this, {
      all: [],
      allCluster: [],
    })
  },

  setPageScope: function(scope) {
    return set(this, 'currentPageScope', scope);
  },

  active: computed('all.@each.state', function() {
    return get(this, 'all').filter((project) => {
      return ACTIVEISH.includes(project.get('state'));
    });
  }),

  getAll: function(moreOpt={}) {
    var opt = {
      url: 'projects',  // This is called in authenticated/route before schemas are loaded
      forceReload: true,
    };

    if ( !get(this, 'access.enabled') || moreOpt.all )
    {
      opt.filter = {all: 'true'};
      delete moreOpt.all;
    }

    Object.assign(opt, moreOpt);

    const store = get(this, 'globalStore');
    return store.find('project', null, opt).then(() => {
      return store.all('project');
    });
  },

  getAllClusters: function(moreOpt={}) {
    var opt = {
      url: 'clusters',  // This is called in authenticated/route before schemas are loaded
      forceReload: true,
    };

    if ( !get(this, 'access.enabled') || moreOpt.all )
    {
      opt.filter = {all: 'true'};
      delete moreOpt.all;
    }

    Object.assign(opt, moreOpt);

    return get(this, 'globalStore').find('cluster', null, opt).then(() => {
      return get(this, 'globalStore').all('cluster');
    });
  },

  refreshAllClusters: function() {
    return this.getAllClusters().then((all) => {
      set(this, 'allClusters', all);
      this.selectDefaultCluster();
    });
  },

  refreshAll: function() {
    this.getAll().then((all) => {
      set(this, 'all', all);
      this.selectDefaultProject();
    });
  },

  selectDefaultCluster: function() {
    var self = this;
    var cookies = get(this, 'cookies');

    return this._clusterFromId(cookies.get(C.COOKIE.CLUSTER)).then(selectCluster)
      .catch(() => {

        return this._clusterFromId(get(this, 'prefs').get(C.PREFS.CLUSTER_DEFAULT)).then(selectCluster)
          .catch(() => {

            // Then the first active project you're a member of
            var cluster = get(this, 'activeCluster.firstObject');

            if ( cluster )
            {
              return selectCluster(cluster, true);
            }
            else if ( get(this, 'access.admin') )
            {
              // Then if you're an admin the first active of any kind
              var firstActive = get(this, 'allClusters').find((cluster) => {
                return ACTIVEISH.includes(cluster.get('state'));
              });

              if ( firstActive )
              {
                return selectCluster(firstActive, true);
              }
              else
              {
                // go to cluster managment page
                return clusterFail();
              }
            }
            else
            {
              return clusterFail();
            }
          });
      });

    function selectCluster(cluster, overwriteDefault) {
      if ( cluster )
      {
        cookies.set(C.COOKIE.PROJECT, cluster.get('id'));

        // If there is no default cluster, set it
        var def = self.get('prefs').get(C.PREFS.CLUSTER_DEFAULT);

        if ( !def || overwriteDefault === true )
        {
          self.get('prefs').set(C.PREFS.CLUSTER_DEFAULT, cluster.get('id'));
        }

        return self.setCurrentCluster(cluster);
      }
      else
      {
        cookies.remove(C.COOKIE.CLUSTER);
        return self.setCurrentCluster(null);
      }
    }

    function clusterFail() {
      selectCluster(null);
      return reject();
    }
  },

  selectDefaultProject: function(desired) {
    var self = this;
    var cookies = get(this, 'cookies');

    // The one specifically asked for
    return this._activeProjectFromId(desired).then(select)
    .catch(() => {

      // Try the project ID in the cookie
      return this._activeProjectFromId(cookies.get(C.COOKIE.PROJECT)).then(select)
      .catch(() => {

        // Then the default project ID from the prefs
        return this._activeProjectFromId(get(this, 'prefs').get(C.PREFS.PROJECT_DEFAULT)).then(select)
        .catch(() => {


          // Then the first active project you're a member of
          var project = get(this, 'active.firstObject');

          if ( project )
          {
            return select(project, true);
          }
          else if ( get(this, 'access.admin') )
          {
            // Then if you're an admin the first active of any kind
            var firstActive = get(this, 'all').find((project) => {
              return ACTIVEISH.includes(project.get('state'));
            });

            if ( firstActive )
            {
              return select(firstActive, true);
            }
            else
            {
              return this.selectDefaultCluster();
            }
          }
          else
          {
            return this.selectDefaultCluster();
          }
        });
      });
    });


    function select(project, overwriteDefault) {
      if ( project )
      {
        if (project.get('clusterId')) {
          self.set('currentCluster', self.get('globalStore').getById('cluster', project.get('clusterId'))||{});
        }

        cookies.set(C.COOKIE.PROJECT, project.get('id'));

        // If there is no default project, set it
        var def = self.get('prefs').get(C.PREFS.PROJECT_DEFAULT);
        if ( !def || overwriteDefault === true )
        {
          self.get('prefs').set(C.PREFS.PROJECT_DEFAULT, project.get('id'));
        }

        return self.setCurrent(project);
      }
      else
      {
        self.get('cookies').remove(C.COOKIE.PROJECT);
        return self.setCurrent(null);
      }
    }
  },

  setCurrentCluster: function(cluster) {
    setProperties(this, {
      currentCluster: cluster,
      currentPageScope: 'global'
    });

    if ( cluster ) {
      set(this, 'clusterStore.baseUrl', `${get(this, 'app.apiEndpoint')}/clusters/${cluster.get('id')}`);
    } else {
      set(this, 'clusterStore.baseUrl', get(this, 'app.apiEndpoint'));
    }

    return resolve(cluster);
  },

  setCurrent: function(project) {
    setProperties(this, {
      current: project,
      currentPageScope: 'project'
    });
    if ( project ) {
      set(this, 'store.baseUrl', `${get(this, 'app.apiEndpoint')}/projects/${project.get('id')}`);
    } else {
      set(this, 'store.baseUrl', get(this, 'app.apiEndpoint'));
    }
    return resolve(project);
  },

  _clusterFromId: function(clusterId) {
    return new EmberPromise((resolve, reject) => {
      if ( !clusterId )
      {
        reject();
        return;
      }

      get(this, 'globalStore').find('cluster', clusterId, {url: `clusters/${encodeURIComponent(clusterId)}`}).then((cluster) => {
        resolve(cluster);
      }).catch(() => {
        reject();
      });
    });
  },

  _activeProjectFromId: function(projectId) {
    return new EmberPromise((resolve, reject) => {
      if ( !projectId )
      {
        reject();
        return;
      }

      get(this, 'globalStore').find('project', projectId, {url: 'projects/'+encodeURIComponent(projectId)}).then((project) => {
        if ( ACTIVEISH.includes(project.get('relevantState')) )
        {
          resolve(project);
        }
        else
        {
          reject();
        }
      }).catch(() => {
        reject();
      });
    });
  },
});
