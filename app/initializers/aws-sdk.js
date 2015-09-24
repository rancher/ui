export function initialize(/*container, application */) {
  // Monkey patch AWS SDK to go through our proxy
  var orig = AWS.XHRClient.prototype.handleRequest;
  AWS.XHRClient.prototype.handleRequest = function handleRequest(httpRequest, httpOptions, callback, errCallback) {
    httpRequest.endpoint.protocol = 'http:';
    httpRequest.endpoint.port = 80;
    httpRequest.headers['X-API-Headers-Restrict'] = 'Content-Length';
    httpRequest.headers['X-API-AUTH-HEADER'] = httpRequest.headers['Authorization'];
    httpRequest.headers['Content-Type'] = 'rancher:' + httpRequest.headers['Content-Type'];

    if ( httpRequest.path.indexOf('/v1/proxy/') !== 0 )
    {
      httpRequest.path = '/v1/proxy/' + httpRequest.endpoint.hostname + httpRequest.path;
    }

    httpRequest.endpoint.protocol = window.location.protocol;
    httpRequest.endpoint.hostname = window.location.hostname;
    httpRequest.endpoint.host = window.location.host;
    httpRequest.endpoint.port = window.location.port;

    return orig.call(this, httpRequest, httpOptions, callback, errCallback);
  };
}

export default {
  name: 'aws-sdk',
  initialize: initialize
};
