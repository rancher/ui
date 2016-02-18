import Ember from 'ember';
import {normalizeType} from 'ember-api-store/utils/normalize';
import UnpurgedArrayProxy from 'ui/utils/unpurged-array-proxy';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('store:main');
  var tabSession = instance.lookup('service:tab-session');
  store.set('removeAfterDelete', false);

  store.reopen({
    baseUrl: application.apiEndpoint,

    headers: function() {
      var out = {};

      // Please don't send us www-authenticate headers
      out[C.HEADER.NO_CHALLENGE] = C.HEADER.NO_CHALLENGE_VALUE;

      // Send the current project id as a header if in a project
      var projectId = tabSession.get(C.TABSESSION.PROJECT);
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

    reallyFind: store.find,
    find: function(type, id, opt) {
      opt = opt || {};
      if ( opt.authAsUser )
      {
        var headers = opt.headers;
        if ( !headers )
        {
          headers = {};
          opt.headers = headers;
        }

        headers[C.HEADER.PROJECT] = undefined;
      }

      return this.reallyFind(type, id, opt);
    },

    // find(type) && return allActive(type)
    findAllActive: function(type) {
      type = normalizeType(type);

      if ( this.haveAll(type) )
      {
        return Ember.RSVP.resolve(this.allActive(type),'All active '+ type + ' already cached');
      }
      else
      {
        return this.find(type).then(() => {
          return this.allActive(type);
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

      if ( this.haveAll(type) )
      {
        return Ember.RSVP.resolve(this.allUnremoved(type),'All unremoved '+ type + ' already cached');
      }
      else
      {
        return this.find(type).then(() => {
          return this.allUnremoved(type);
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
