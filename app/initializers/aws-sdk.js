import { get } from '@ember/object';

export function initialize(application) {
  // Monkey patch AWS SDK to go through our proxy
  var orig = AWS.XHRClient.prototype.handleRequest;

  AWS.XHRClient.prototype.handleRequest = function handleRequest(httpRequest, httpOptions, callback, errCallback) {
    httpRequest.headers['X-Api-Headers-Restrict'] = 'Content-Length';

    if (get(httpOptions, 'cloudCredentialId')) {
      httpRequest.headers['X-Api-CattleAuth-Header'] = `awsv4 credID=${ get(httpOptions, 'cloudCredentialId') }`;
    } else {
      httpRequest.endpoint.protocol = 'http:';
      httpRequest.endpoint.port = 80;
      httpRequest.headers['X-Api-Auth-Header'] = httpRequest.headers['Authorization'];
    }

    delete httpRequest.headers['Authorization'];
    httpRequest.headers['Content-Type'] = `rancher:${  httpRequest.headers['Content-Type'] }`;

    var endpoint = `${ application.proxyEndpoint }/`;

    if ( httpRequest.path.indexOf(endpoint) !== 0 ) {
      httpRequest.path = endpoint + httpRequest.endpoint.hostname + httpRequest.path;
    }

    httpRequest.endpoint.protocol = window.location.protocol;
    httpRequest.endpoint.hostname = window.location.hostname;
    httpRequest.endpoint.host = window.location.host;
    httpRequest.endpoint.port = window.location.port;

    return orig.call(this, httpRequest, httpOptions, callback, errCallback);
  };
}

export default {
  name:       'aws-sdk',
  initialize
};
