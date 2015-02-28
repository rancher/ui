import {normalizeType} from 'ember-api-store/utils/normalize';
import UnpurgedArrayProxy from 'ui/utils/unpurged-array-proxy';
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
      out[C.NO_CHALLENGE_HEADER] = C.NO_CHALLENGE_VALUE;

      // Never send token or project ID if auth isn't on
      if ( application.get('authenticationEnabled') )
      {
        // Send the token as the Authorization header
        var authValue = session.get(C.AUTH_SESSION_KEY);
        if ( authValue )
        {
          out[C.AUTH_HEADER] = C.AUTH_TYPE + ' ' + authValue;
        }

        // Send the current project id as a header if in a project
        var projectId = session.get(C.PROJECT_SESSION_KEY);
        if ( projectId )
        {
          out[C.PROJECT_HEADER] = projectId;
        }
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
    }
  });
}

export default {
  name: 'store',
  after: 'ember-api-store',
  initialize: initialize
};
