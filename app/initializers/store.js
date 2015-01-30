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
      out[C.NO_CHALLENGE_HEADER] = C.NO_CHALLENGE_VALUE;

      var authValue = session.get(C.AUTH_SESSION_KEY);
      if ( authValue )
      {
        out[C.AUTH_HEADER] = C.AUTH_TYPE + ' ' + authValue;
      }

      var projectId = session.get(C.PROJECT_SESSION_KEY);
      if ( projectId )
      {
        out[C.PROJECT_HEADER] = projectId;
      }

      return out;
    }.property().volatile(),

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
