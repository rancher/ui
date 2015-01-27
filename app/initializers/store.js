import Ember from 'ember';
import {normalizeType} from 'ember-api-store/utils/normalize';

export function initialize(container, application) {
  var store = container.lookup('store:main');
  var session = container.lookup('session:main');
  store.set('removeAfterDelete', false);

  store.reopen({
    baseUrl: application.apiEndpoint,

    headers: function() {
      var out = {
        'x-api-no-challenge': 'true',  // Don't send me www-authenticate headers
      };

      var jwt = session.get('jwt');
      if ( jwt )
      {
        out['authorization'] = 'Bearer ' + jwt;
      }

      var accountId = session.get('accountId');
      if ( accountId )
      {
        out['x-api-project-id'] = accountId;
      }

      return out;
    }.property().volatile(),

    reallyAll: store.all,
    all: function(type) {
      type = normalizeType(type);
      var group = this._group(type);
      var proxy = Ember.ArrayProxy.create({
        allContent: group,
      });

      proxy.reopen({
        content: function() {
          return this.get('allContent').filter(function(obj) {
            return obj.get('state') !== 'purged';
          });
        }.property('allContent.[]','allContent.@each.state')
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
