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
  cookies:        service(),

  current:        null,
  all:            null,

  currentCluster: alias('current.cluster'),

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

    return this.get('userStore').find('project', null, opt).then(() => {
      return this.get('userStore').all('project');
    });
  },

  refreshAll: function() {
    this.getAll().then((all) => {
      this.set('all', all);
      this.selectDefault();
    });
  },

  selectDefault: function(desired) {
    var self = this;
    var cookies = this.get('cookies');

    // The one specifically asked for
    return this._activeProjectFromId(desired).then(select)
    .catch(() => {
      // Try the project ID in the session
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
                return fail();
              }
            }).catch(() => {
              return fail();
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

  setCurrent: function(project) {
    this.set('current', project);
    if ( project ) {
      this.set('store.baseUrl', `${this.get('app.apiEndpoint')}/projects/${project.get('id')}`);
    } else {
      this.set('store.baseUrl', this.get('app.apiEndpoint'));
    }
    return resolve(project);
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
