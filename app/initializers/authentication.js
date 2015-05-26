import Ember from 'ember';
import C from 'ui/utils/constants';

export function initialize(container, application) {
  application.deferReadiness();
  var store = container.lookup('store:main');
  var headers = {};
  headers[C.HEADER.AUTH] = undefined; // Explicitly not send auth
  headers[C.HEADER.PROJECT] = undefined; // Explicitly not send project

  // Find out if auth is enabled
  store.rawRequest({
    url: 'token',
    headers: headers
  })
  .then(function(obj) {
    // If we get a good response back, the API supports authentication
    var body = JSON.parse(obj.xhr.responseText);
    var token = body.data[0];

    application.set('authenticationEnabled', token.security);
    application.set('githubClientId', token.clientId);
    application.set('githubHostname', token.hostname );

    return Ember.RSVP.resolve(undefined,'API supports authentication');
  })
  .catch(function(obj) {
    // Otherwise this API is too old to do auth.
    application.set('authenticationEnabled', false);
    application.set('initError', obj);
    return Ember.RSVP.resolve(undefined,'Error determining API authentication');
  })
  .finally(function() {
    application.advanceReadiness();
  });
}

export default {
  name: 'authentication',
  after: 'store',
  initialize: initialize
};
