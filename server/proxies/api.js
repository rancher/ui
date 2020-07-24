/* eslint-env node */

const path = require('path');
const HttpProxy = require('http-proxy');

const config = require('../../config/environment')(process.env.EMBER_ENV).APP;

module.exports = function(app, options) {
  var httpServer = options.httpServer;


  const proxy = HttpProxy.createProxyServer({
    ws: true,
    xfwd: false,
    target: config.apiServer,
    secure: false,
    followRedirects: true,
  });

  proxy.on('error', onProxyError);

  // WebSocket for Rancher
  httpServer.on('upgrade', (req, socket, head) => {
    socket.on('error', (err)=> console.error(err));
    if ( req.url.startsWith('/_lr/') ) {
      return;
    }

    let targetHost = config.apiServer.replace(/^https?:\/\//, '');
    let host = req.headers['host'];

    req.headers['x-api-host'] = host;
    req.headers['host']       = targetHost;
    req.headers['origin']     = config.apiServer;
    req.socket.servername     = targetHost;

    proxyLog('WS', req);

    try {
      proxy.ws(req, socket, head);
    } catch (err) {
      proxyLog(err);
    }
  });

  let map = {
    'Project':      config.projectEndpoint.replace(config.projectToken, ''),
    'Cluster':      config.clusterEndpoint.replace(config.clusterToken, ''),
    'Global':       config.apiEndpoint,
    'Public':       config.publicApiEndpoint,
    'Magic':        config.magicEndpoint,
    'Telemetry':    config.telemetryEndpoint,

    'K8s':          '/k8s',
    'Meta':         '/meta',
    'Swagger':      '/swaggerapi',
    'Version':      '/version',
    'Apiui':        '/api-ui',
    'Samlauth':     '/v1-saml',
    'Drivers':      '/assets/rancher-ui-driver-*',
    'K3Versions':   '/v1-k3s-release/release',
    'Rke2Versions': '/v1-rke2-release/release',
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

  console.log('Proxying APIs to', config.apiServer);
  Object.keys(map).forEach(function(label) {
    let base = map[label];
    app.use(base, function(req, res, next) {
      if ( req.url === '/' ) {
        req.url = '';
      }

      // include root path in proxied request
      req.url                   = req.originalUrl;
      req.headers['X-Api-Host'] = req.headers['host'];
      delete req.headers['host'];

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
  console.log(`[${ label }]`, req.method, req.url);
}

function proxyError(label, req, err) {
  console.error(`[${ label }][${ req._source }]`, req.method, req.url, err);
}
