module.exports = function(app, options) {
  var path = require('path');
  var ForeverAgent = require('forever-agent');
  var HttpProxy = require('http-proxy');
  var httpServer = options.httpServer;

  var config = require('../../config/environment')().APP;

  var target = config.apiServer;

  var proxy = HttpProxy.createProxyServer({
    ws: true,
    xfwd: false,
    target: target,
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
    'Project': config.projectEndpoint.replace(config.projectToken, ''),
    'Cluster': config.clusterEndpoint.replace(config.clusterToken, ''),
    'Global':  config.apiEndpoint,
    'Public':  config.publicApiEndpoint,
    'Magic': config.magicEndpoint,
    'Telemetry': config.telemetryEndpoint,

    'K8s': '/k8s',
    'Meta': '/meta',
    'Swagger': '/swaggerapi',
    'Version': '/version',
  }

  app.use('/', function(req, res, next) {
    if ( (req.headers['user-agent']||'').toLowerCase().includes('mozilla') ) {
      next();
    } else {
      proxyLog('Root', req);
      req.headers['X-Forwarded-Proto'] = req.protocol;
      proxy.web(req, res);
    }
  }),

  console.log('Proxying APIs to', target);
  Object.keys(map).forEach(function(label) {
    let base = map[label];
    app.use(base, function(req, res, next) {
      if ( req.url === '/' ) {
        req.url = '';
      }

      // include root path in proxied request
      req.url = path.join(base, req.url);
      req.headers['X-Forwarded-Proto'] = req.protocol;

      proxyLog(label, req);
      proxy.web(req, res);
    });
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
