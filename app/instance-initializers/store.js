import Ember from 'ember';
import {normalizeType} from 'ember-api-store/utils/normalize';
import UnpurgedArrayProxy from 'ui/utils/unpurged-array-proxy';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('store:main');
  var tabSession = instance.lookup('service:tab-session');
  store.set('removeAfterDelete', false);

  store.reopen({
    baseUrl: application.apiEndpoint,
    defaultPageSize: -1,
    skipTypeifyKeys: ['labels'],

    headers: function() {
      var out = {};

      // Please don't send us www-authenticate headers
      out[C.HEADER.NO_CHALLENGE] = C.HEADER.NO_CHALLENGE_VALUE;

      return out;
    }.property(),

    // Override store.all() so that it only returns un-purged resources.
    reallyAll: store.all,
    all: function(type) {
      type = normalizeType(type);
      var proxy = UnpurgedArrayProxy.create({
        sourceContent: this._group(type)
      });

      return proxy;
    },

    mungeRequest: function(opt) {
      var projectId = tabSession.get(C.TABSESSION.PROJECT);
      var base = this.get('baseUrl')+'/';
      var projectRoot = base + 'projects';

      if ( !opt.url.match(/^https?:/) )
      {
        // As user, strip projects/:id/ from the request if present
        if ( opt.authAsUser )
        {
          let re = new RegExp("^" + Util.escapeRegex(projectRoot) + '\/[^\/]+/');
          opt.url = opt.url.replace(re,'');
        }
        else if ( projectId && opt.url.indexOf(base) === 0 && opt.url.indexOf(projectRoot) !== 0 )
        {
          // As project, add projects/:id/ to the request if not there
          opt.url = projectRoot + '/' + projectId + '/' + opt.url.substr(base.length);
        }
      }

      opt.url = this.normalizeUrl(opt.url, true);

      return opt;
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
