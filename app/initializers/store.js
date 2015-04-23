import Ember from 'ember';
import {normalizeType} from 'ember-api-store/utils/normalize';
import UnpurgedArrayProxy from 'ui/utils/unpurged-array-proxy';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';

export function initialize(container, application) {
  var store = container.lookup('store:main');
  var session = container.lookup('session:main');
  store.set('removeAfterDelete', false);

  store.reopen({
    baseUrl: application.apiEndpoint,

    headers: function() {
      var out = {};

      // Please don't send us www-authenticate headers
      out[C.HEADER.NO_CHALLENGE] = C.HEADER.NO_CHALLENGE_VALUE;

      var authValue = session.get(C.SESSION.TOKEN);
      if ( authValue )
      {
        // Send the token as the Authorization header if present
        out[C.HEADER.AUTH] = C.HEADER.AUTH_TYPE + ' ' + authValue;
      }
      else
      {
        // And something else if not present, so the browser can't send cached basic creds
        out[C.HEADER.AUTH] = 'None';
      }

      // Send the current project id as a header if in a project
      var projectId = session.get(C.SESSION.PROJECT);
      if ( projectId )
      {
        out[C.HEADER.PROJECT] = projectId;
      }

      return out;
    }.property().volatile(),

    // Override store.all() so that it only returns un-purged resources.
    reallyAll: store.all,
    all: function(type) {
      type = normalizeType(type);
      var proxy = UnpurgedArrayProxy.create({
        sourceContent: this._group(type)
      });

      return proxy;
    },

    // find(type) && return allActive(type)
    findAllActive: function(type) {
      type = normalizeType(type);
      var self = this;

      if ( self.haveAll(type) )
      {
        return Ember.RSVP.resolve(self.allActive(type),'All active '+ type + ' already cached');
      }
      else
      {
        return this.find(type).then(function() {
          return self.allActive(type);
        });
      }
    },

    allActive: function(type) {
      type = normalizeType(type);
      var proxy = ActiveArrayProxy.create({
        sourceContent: this._group(type)
      });

      return proxy;
    },

    findAllUnremoved: function(type) {
      type = normalizeType(type);
      var self = this;

      if ( self.haveAll(type) )
      {
        return Ember.RSVP.resolve(self.allUnremoved(type),'All unremoved '+ type + ' already cached');
      }
      else
      {
        return this.find(type).then(function() {
          return self.allUnremoved(type);
        });
      }
    },

    allUnremoved: function(type) {
      type = normalizeType(type);
      var proxy = UnremovedArrayProxy.create({
        sourceContent: this._group(type)
      });

      return proxy;
    }
  });
}

export default {
  name: 'store',
  after: 'ember-api-store',
  initialize: initialize
};
