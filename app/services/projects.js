import Ember from 'ember';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  access: Ember.inject.service(),
  'tab-session': Ember.inject.service('tab-session'),
  prefs: Ember.inject.service(),

  current: null,
  all: null,
  active: function() {
    return ActiveArrayProxy.create({
      sourceContent: this.get('all')||[]
    });
  }.property('all.[]'),

  getAll: function() {
    var opt = {
      url: 'projects',  // This is called in authenticated/route before schemas are loaded
      forceReload: true
    };

    if ( !this.get('access.enabled') )
    {
      opt.filter = {all: 'true'};
    }

    return this.get('store').find('project', null, opt);
  },

  refreshAll: function() {
    this.getAll().then((all) => {
      this.set('all', all);
      this.selectDefault();
    });
  },

  selectDefault: function() {
    var self = this;
    var tabSession = this.get('tab-session');

    // Try the project ID in the session
    return this._activeProjectFromId(tabSession.get(C.TABSESSION.PROJECT)).then(select)
    .catch(() => {
      // Then the default project ID from the prefs
      return this._activeProjectFromId(this.get('prefs').get(C.PREFS.PROJECT_DEFAULT)).then(select)
      .catch(() => {
        // Setting this now and then just below breaks API uniqueness checking
        // this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, "");

        // Then the first active project
        var project = this.get('active.firstObject');
        if ( project )
        {
          return select(project, true);
        }
        else if ( this.get('access.admin') )
        {
          return this.getAll().then((all) => {
            var firstActive = all.filterBy('state','active')[0];
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

    function select(project, overwriteDefault) {
      if ( project )
      {
        tabSession.set(C.TABSESSION.PROJECT, project.get('id'));

        // If there is no default project, set it
        var def = self.get('prefs').get(C.PREFS.PROJECT_DEFAULT);
        if ( !def || overwriteDefault === true )
        {
          self.get('prefs').set(C.PREFS.PROJECT_DEFAULT, project.get('id'));
        }

        self.set('current', project);
        return project;
      }
      else
      {
        tabSession.set(C.TABSESSION.PROJECT, undefined);
        self.set('current', null);
        return null;
      }
    }

    function fail() {
      // Then cry
      select(null);
      return Ember.RSVP.reject();
    }
  },

  _activeProjectFromId: function(projectId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if ( !projectId )
      {
        reject();
      }

      this.get('store').find('project', projectId).then((project) => {
        if ( project.get('state') === 'active' )
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
