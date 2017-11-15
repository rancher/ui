import {
  reject,
  resolve,
  Promise as EmberPromise
} from 'rsvp';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { computed } from '@ember/object';

let ACTIVEISH = ['active','upgrading'];

export default Service.extend({
  access:         service(),
  prefs:          service(),
  k8sSvc:         service('k8s'),
  userStore:      service('user-store'),
  store:          service(),
  clusterStore:   service('cluster-store'),
  cookies:        service(),
  current:        null,
  currentCluster: null,
  currentPageScope: 'none',
  all:            null,
  allClusters:    null,

  // currentCluster: alias('current.cluster'),

  setPageScope: function(scope) {
    return this.set('currentPageScope', scope);
  },

  active: computed('all.@each.state', function() {
    return this.get('all').filter((project) => {
      return ACTIVEISH.includes(project.get('state'));
    });
  }),

  getAll: function() {
    var opt = {
      url: 'projects',  // This is called in authenticated/route before schemas are loaded
      forceReload: true,
    };

    if ( !this.get('access.enabled') )
    {
      opt.filter = {all: 'true'};
    }

    return this.get('store').find('project', null, opt).then(() => {
      return this.get('store').all('project');
    });
  },
  getAllClusters: function() {
    var opt = {
      url: 'clusters',  // This is called in authenticated/route before schemas are loaded
      forceReload: true,
    };

    if ( !this.get('access.enabled') )
    {
      opt.filter = {all: 'true'};
    }

    return this.get('clusterStore').find('cluster', null, opt).then(() => {
      return this.get('clusterStore').all('cluster');
    });
  },

  refreshAllClusters: function() {
    return this.getAllClusters().then((all) => {
      this.set('allClusters', all);
      this.selectDefaultCluster();
    });
  },

  refreshAll: function() {
    this.getAll().then((all) => {
      this.set('all', all);
      this.selectDefaultProject();
    });
  },

  selectDefaultCluster: function(desired) {
    var self = this;
    var cookies = this.get('cookies');
    this.controller
    return this._activeClusterFromId(cookies.get(C.COOKIE.CLUSTER)).then(selectCluster)
      .catch(() => {

        return this._activeClusterFromId(this.get('prefs').get(C.PREFS.CLUSTER_DEFAULT)).then(selectCluster)
          .catch(() => {

            // Then the first active project you're a member of
            var cluster = this.get('activeCluster.firstObject');

            if ( cluster )
            {
              return selectCluster(cluster, true);
            }
            else if ( this.get('access.admin') )
            {
              // Then if you're an admin the first active of any kind
              return this.getAllClusters().then((all) => {
                var firstActive = all.find((cluster) => {
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
              }).catch(() => {
                // go to cluster managment page
                return clusterFail();
              });
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
        this.get('cookies').remove(C.COOKIE.CLUSTER);
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
    var cookies = this.get('cookies');

    // The one specifically asked for
    return this._activeProjectFromId(desired).then(select)
    .catch(() => {

      // Try the project ID in the cookie
      return this._activeProjectFromId(cookies.get(C.COOKIE.PROJECT)).then(select)
      .catch(() => {

        // Then the default project ID from the prefs
        return this._activeProjectFromId(this.get('prefs').get(C.PREFS.PROJECT_DEFAULT)).then(select)
        .catch(() => {


          // Then the first active project you're a member of
          var project = this.get('active.firstObject');

          if ( project )
          {
            return select(project, true);
          }
          else if ( this.get('access.admin') )
          {
            // Then if you're an admin the first active of any kind
            return this.getAll().then((all) => {
              var firstActive = all.find((project) => {
                return ACTIVEISH.includes(project.get('state'));
              });

              if ( firstActive )
              {
                return select(firstActive, true);
              }
              else
              {
                return this.selectDefaultCluster(null);
              }
            }).catch(() => {
              return this.selectDefaultCluster(null);
            });
          }
          else
          {
            return fail();
          }
        });
      });
    });


    function select(project, overwriteDefault) {
      if (project.get('clusterId')) {
        self.set('currentCluster', self.get('clusterStore').getById('cluster', project.get('clusterId'))||{});
      }
      if ( project )
      {
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
        this.get('cookies').remove(C.COOKIE.PROJECT);
        return self.setCurrent(null);
      }
    }


    function fail() {
      // Then cry
      select(null);
      return reject();
    }
  },

  setCurrentCluster: function(cluster) {
    this.setProperties({
      currentCluster: cluster,
      currentPageScope: 'cluster'
    });
    // @@TODO@@ - 11-10-17 - need a new store for clusters when we actually have a /clusters endpoint
    // if ( cluster ) {
    //   this.set('clusterStore.baseUrl', `${this.get('app.apiEndpoint')}/clusters/${cluster.get('id')}`);
    // } else {
    //   this.set('clusterStore.baseUrl', this.get('app.apiEndpoint'));
    // }
    return resolve(cluster);
  },

  setCurrent: function(project) {
    this.setProperties({
      current: project,
      currentPageScope: 'project'
    });
    if ( project ) {
      this.set('store.baseUrl', `${this.get('app.apiEndpoint')}/projects/${project.get('id')}`);
    } else {
      this.set('store.baseUrl', this.get('app.apiEndpoint'));
    }
    return resolve(project);
  },

  _activeClusterFromId: function(clusterId) {
    return new EmberPromise((resolve, reject) => {
      if ( !clusterId )
      {
        reject();
        return;
      }

      this.get('clusterStore').find('cluster', clusterId, {url: `clusters/${encodeURIComponent(clusterId)}`}).then((cluster) => {
        if ( ACTIVEISH.includes(cluster.get('state')) )
        {
          resolve(cluster);
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

  _activeProjectFromId: function(projectId) {
    return new EmberPromise((resolve, reject) => {
      if ( !projectId )
      {
        reject();
        return;
      }

      this.get('userStore').find('project', projectId, {url: 'projects/'+encodeURIComponent(projectId)}).then((project) => {
        if ( ACTIVEISH.includes(project.get('state')) )
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
