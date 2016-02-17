module.exports = function(app, options) {
  var path = require('path');
  var ForeverAgent = require('forever-agent');
  var HttpProxy = require('http-proxy');
  var httpServer = options.httpServer;

  var config = require('../../config/environment')().APP;

  var proxy = HttpProxy.createProxyServer({
    ws: true,
    xfwd: false,
    target: config.apiServer,
  });

  proxy.on('error', onProxyError);

  // WebSocket for Rancher
  httpServer.on('upgrade', function proxyWsRequest(req, socket, head) {
    console.log('WS Proxy', req.method, 'to', req.url);
    if ( socket.ssl ) {
      req.headers['X-Forwarded-Proto'] = 'https';
    }
    proxy.ws(req, socket, head);
  });

  // Rancher API
  console.log('Proxying Rancher to', config.apiServer);
  var apiPath =  config.apiEndpoint;
  app.use(apiPath, function(req, res, next) {
    // include root path in proxied request
    req.url = path.join(apiPath, req.url);
    req.headers['X-Forwarded-Proto'] = req.protocol;

    console.log('API Proxy', req.method, 'to', req.url);
    proxy.web(req, res);
  });

  // Catalog API
  var catalogPath = config.catalogEndpoint;
  // Default catalog to the regular API
  var catalogServer = config.catalogServer || config.apiServer;
  console.log('Proxying Catalog to', catalogServer);
  app.use(catalogPath, function(req, res, next) {
    req.headers['X-Forwarded-Proto'] = req.protocol;
    var catalogProxy = HttpProxy.createProxyServer({
      xfwd: false,
      target: catalogServer
    });

    catalogProxy.on('error', onProxyError);

    // include root path in proxied request
    req.url = path.join(catalogPath, req.url);

    console.log('Catalog Proxy', req.method, 'to', req.url);
    catalogProxy.web(req, res);
  });

  // Kubernetes API
  var kubernetesPath = config.kubernetesEndpoint;
  // Default catalog to the regular API
  var kubernetesServer = config.kubernetesServer || config.apiServer;
  console.log('Proxying Kubernetes to', kubernetesServer);
  app.use(kubernetesPath, function(req, res, next) {
    req.headers['X-Forwarded-Proto'] = req.protocol;
    var kubernetesProxy = HttpProxy.createProxyServer({
      xfwd: false,
      target: kubernetesServer
    });

    kubernetesProxy.on('error', onProxyError);

    // Don't include root path in proxied request
    // req.url = path.join(kubernetesPath, req.url);

    console.log('Kubernetes Proxy', req.method, 'to', req.url);
    kubernetesProxy.web(req, res);
  });

  // Kubectl API
  var kubectlPath = config.kubectlEndpoint;
  // Default catalog to the regular API
  var kubectlServer = config.kubectlServer || config.kubernetesServer || config.apiServer;
  console.log('Proxying Kubectl to', kubectlServer);
  app.use(kubectlPath, function(req, res, next) {
    req.headers['X-Forwarded-Proto'] = req.protocol;
    var kubectlProxy = HttpProxy.createProxyServer({
      xfwd: false,
      target: kubectlServer
    });

    kubectlProxy.on('error', onProxyError);

    // include root path in proxied request
     req.url = path.join(kubectlPath, req.url);

    console.log('Kubectl Proxy', req.method, 'to', req.url);
    kubectlProxy.web(req, res);
  });
};

function onProxyError(err, req, res) {
  console.log('Proxy Error: on', req.method,'to', req.url,':', err);
  var error = {
    type: 'error',
    status: 500,
    code: 'ProxyError',
    message: 'Error connecting to proxy',
    detail: err.toString()
  }

  if ( req.upgrade )
  {
    res.end();
  }
  else
  {
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(error));
  }
}
