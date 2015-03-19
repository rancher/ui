import Ember from 'ember';
import config from 'torii/configuration';
import bootstrap from 'torii/bootstrap/torii';
import C from 'ui/utils/constants';

export function initialize(container, application) {
  application.deferReadiness();
  var store = container.lookup('store:main');
  var headers = {};
  headers[C.AUTH_HEADER] = undefined; // Explicitly not send auth
  headers[C.PROJECT_HEADER] = undefined; // Explicitly not send project

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
    configureTorii(token.clientId);

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

  function configureTorii(clientId) {
    config.providers['github-oauth2'] = {
      apiKey: clientId,
      scope: 'read:org'
    };

    bootstrap(container);
    application.inject('controller',  'torii',  'torii:main');
  }
}

export default {
  name: 'authentication',
  after: 'store',
  initialize: initialize
};
