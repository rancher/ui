import Ember from 'ember';
import config from 'torii/configuration';
import bootstrap from 'torii/bootstrap/torii';

export function initialize(container, application) {
  application.deferReadiness();
  var store = container.lookup('store:main');

  // Find out if auth is enabled
  store.rawRequest({
    url: 'token', // Base url, which will be /v1
    headers: { 'authorization': undefined }
  })
  .then(function(obj) {
    var body = JSON.parse(obj.xhr.responseText);
    var token = body.data[0];

    application.set('hasAuthentication', true);
    application.set('authenticationEnabled', token.security);
    configureTorii(token.clientId);

    return Ember.RSVP.resolve(undefined,'API supports authentication');
  })
  .catch(function(obj) {
    application.set('hasAuthentication', false);
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
