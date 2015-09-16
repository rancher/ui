import Ember from 'ember';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  access: Ember.inject.service(),
  session: Ember.inject.service(),
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
    var session = this.get('session');

    // Try the project ID in the session
    return this._activeProjectFromId(session.get(C.SESSION.PROJECT)).then(select)
    .catch(() => {
      // Then the default project ID from the session
      return this._activeProjectFromId(this.get('prefs').get(C.PREFS.PROJECT_DEFAULT)).then(select)
      .catch(() => {
        // Setting this now and then just below breaks API uniqueness checking
        // this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, "");

        // Then the first active project
        var project = this.get('active.firstObject');
        if ( project )
        {
          select(project, true);
        }
        else if ( this.get('access.admin') )
        {
          return this.findUserProjects().then((all) => {
            var firstActive = all.filterBy('state','active')[0];
            if ( firstActive )
            {
              select(firstActive, true);
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
        session.set(C.SESSION.PROJECT, project.get('id'));

        // If there is no default project, set it
        var def = self.get('prefs').get(C.PREFS.PROJECT_DEFAULT);
        if ( !def || overwriteDefault === true )
        {
          self.get('prefs').set(C.PREFS.PROJECT_DEFAULT, project.get('id'));
        }

        self.set('current', project);
      }
      else
      {
        session.set(C.SESSION.PROJECT, undefined);
        self.set('current', null);
      }
    }

    function fail() {
      // Then cry
      select(null);
      return Ember.RSVP.reject();
    }
  },

  _activeProjectFromId: function(projectId) {
    // Try the currently selected one in the session
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
