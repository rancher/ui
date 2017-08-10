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
    secure: false,
  });

  proxy.on('error', onProxyError);

  // WebSocket for Rancher
  httpServer.on('upgrade', function proxyWsRequest(req, socket, head) {
    proxyLog('WS', req);
    if ( socket.ssl ) {
      req.headers['X-Forwarded-Proto'] = 'https';
    }
    proxy.ws(req, socket, head);
  });

  let map = {
    'API': config.apiEndpoint,
//    'Beta API': config.betaApiEndpoint,
    'Legacy API': config.legacyApiEndpoint,
    'Magic': config.magicEndpoint,
    'Telemetry': config.telemetryEndpoint,
    'WebHook': config.webhookEndpoint,
  }

  // Rancher API
  console.log('Proxying API to', config.apiServer);
  Object.keys(map).forEach(function(label) {
    let base = map[label];
    app.use(base, function(req, res, next) {
      // include root path in proxied request
      req.url = path.join(base, req.url);
      req.headers['X-Forwarded-Proto'] = req.protocol;

      proxyLog(label, req);
      proxy.web(req, res);
    });
  });

  // Kubernetes needs this API
  app.use('/swaggerapi', function(req, res, next) {
    // include root path in proxied request
    req.url = path.join('/swaggerapi', req.url);
    req.headers['X-Forwarded-Proto'] = req.protocol;

    proxyLog('K8sSwag', req);
    proxy.web(req, res);
  });

  app.use('/version', function(req, res, next) {
    // include root path in proxied request
    req.url = '/version';
    req.headers['X-Forwarded-Proto'] = req.protocol;

    proxyLog('K8sVers', req);
    proxy.web(req, res);
  });

  // Catalog API
  var catalogPath = config.catalogEndpoint;
  // Default catalog to the regular API
  var catalogServer = config.catalogServer || config.apiServer;
  if ( catalogServer !== config.apiServer ) {
    console.log('Proxying Catalog to', catalogServer);
  }
  app.use(catalogPath, function(req, res, next) {
    req.headers['X-Forwarded-Proto'] = req.protocol;
    var catalogProxy = HttpProxy.createProxyServer({
      xfwd: false,
      target: catalogServer
    });

    catalogProxy.on('error', onProxyError);

    // include root path in proxied request
    req.url = path.join(catalogPath, req.url);

    proxyLog('Catalog', req);
    catalogProxy.web(req, res);
  });

  // Auth API
  var authPath = config.authEndpoint;
  var authServer = config.authServer || config.apiServer;
  if ( authServer !== config.apiServer ) {
    console.log('Proxying Auth to', authServer);
  }
  app.use(authPath, function(req, res, next) {
    req.headers['X-Forwarded-Proto'] = req.protocol;
    var catalogProxy = HttpProxy.createProxyServer({
      xfwd: false,
      target: authServer
    });

    catalogProxy.on('error', onProxyError);

    req.url = path.join(authPath, req.url);

    proxyLog('Auth', req);
    catalogProxy.web(req, res);
  });
}

function onProxyError(err, req, res) {
  console.log('Proxy Error on '+ req.method + ' to', req.url, err);
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

function proxyLog(label, req) {
  console.log('['+ label+ ']', req.method, req.url);
}
