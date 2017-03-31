import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import fetch from 'ember-api-store/utils/fetch';

const VOLUME_TYPES = [{
  name: 'SAS',
}, {
  name: 'SATA',
}, {
  name: 'SSD',
}, ];

const URLS = {
  ecs:  'https://ecs.eu-de.otc.t-systems.com',
};

const SERVICE = 'ecs';

export default Ember.Component.extend(Driver, {
  driverName:       'otcConfig',
  catalogUrls:      null,
  step:             1,
  intl:             Ember.inject.service(),
  volumeTypes:      VOLUME_TYPES,
  itemsLoading:     false,
  flavors:          null,
  images:           null,
  osAvailabilityZone:   null,
  subnet:           null,

  init: function() {
    this._super(...arguments);
    if (!this.get('clonedModel')) {
      this.initModel();
    }
  },


  initModel: function() {
    var config = this.get('store').createRecord({
      type:             'otcConfig',
      serviceEndpoint:  URLS.ecs,
      region:           'eu-de',
      sshUser:          'linux',
    });

    var type = 'host';

    if (!this.get('useHost')) {
      type = 'machine';
    }

    this.set('model', this.get('store').createRecord({
      type:              type,
      'otcConfig':  config,
    }));
  },

  actions: {
    authorizeCreds: function() {
      this.set('step', 2);
      this.getZones().then(() => {
        this.getNetworks().then(() => {
        });
      });
    },
    goToStep3: function() {
      this.set('step', 3);
      this.getSubnets().then(() => {
        this.getSecurityGroups();
      });
    },
    goToStep4: function() {
      this.set('step', 4);
      this.getFlavors().then(() => {
        this.getImage();
      });
    },

  },


  getURL: function(type, version, endpoint, qp) {
    var proxyEndpoint =  this.get('app.proxyEndpoint');
    var catalog =        URLS;
    var url =            `${catalog[type]}/${version}/${this.get('model.otcConfig.tenantId')}`;
    var proxyUrl =       `${proxyEndpoint}/${url}`;
    var parsedURL =      parseURL(url);
    var host =         parsedURL.host;
    var path =           parsedURL.pathname;

    if (endpoint) {
      proxyUrl += '/' + endpoint;
      path = path + '/' + endpoint;

    }

    function parseURL(urlIn) {
      var parser = document.createElement('a');
      parser.href = urlIn;
      // parser.hostname; // => "example.com"
      // parser.port;     // => "3000"
      // parser.pathname; // => "/pathname/"
      // parser.search;   // => "?search=test"
      // parser.hash;     // => "#hash"
      // parser.host;     // => "example.com:3000"
      return parser;

    }
    return {
      endpoint: proxyUrl,
      url: path,
      host: host,
      qp: qp
    };
  },

  describeRequest: function(url, method, t, body) {
    return {
      url: `${url.endpoint.substr(-1) === '/' ? url.endpoint.replace(/\/$/, '') : url.endpoint}?${url.qp}`,
      urlToEncode: url.url.substr(-1) === '/' ? url.url : `${url.url}/`,
      method: method,
      headers: {
        'x-sdk-date':    t, // long date
        'host':          url.host,
        'content-type':  '',
      },
      queryString: url.qp,
      body: body,
      params: {}
    };
  },

  signAuth: function(credentials, req, time) {
    var self = this;
    var request = req;
    var addAuthorization = (credentials) => {
      let r =                     request;

      r.params.Timestamp =              time.format('YYYYMMDDTHHmmss') + 'Z';
      r.params.ShortTimestamp =         time.format('YYYYMMDD');
      r.params.SignatureMethod =        'SDK-HMAC-SHA256';
      r.params.accessKeyId =            credentials.accessKeyId;
      r.params.Signature =              signature(credentials);
      r['Content-Length'] =             r.body.length;
      r.headers['content-type'] +=      ' rancher:';
      r.headers['x-api-auth-header'] =  buildAuth(r.params);

      return r;
    };

    return addAuthorization(credentials);

    function signature(credentials) {
      var canonicalRequest =    buildCanonicalRequest(request);
      var hashedSigingString =  AWS.util.crypto.sha256(canonicalRequest, 'hex');
      var credScope =           credentialScope(request.params.ShortTimestamp, self.get('model.otcConfig.region'), SERVICE);
      var sts =                 stringToSign(hashedSigingString, credScope, request.params.Timestamp);
      var key =                 generateSigningKey(credentials.secretAccessKey, self.get('model.otcConfig.region'), SERVICE, request.params.ShortTimestamp);

      return AWS.util.crypto.hmac(key, sts, 'hex');
    }

    function generateSigningKey(sk, rn, sn, t) {
      var kDate =     AWS.util.crypto.hmac(`SDK${sk}`, t, 'buffer');
      var kRegion =   AWS.util.crypto.hmac(kDate, rn, 'buffer');
      var kService =  AWS.util.crypto.hmac(kRegion, sn, 'buffer');
      var kSigning =  AWS.util.crypto.hmac(kService, 'sdk_request', 'buffer');
      return kSigning;
    }

    function credentialScope (time, rname, sname) {
      return `${time}/${rname}/${sname}/sdk_request`;
    }

    function buildCanonicalHeaders(requestHeaders) {
      var headers =  [];
      var parts =    [];

      Object.keys(requestHeaders).forEach((key) => {
        headers.push([key, requestHeaders[key]]);
      });

      headers.sort(function (a, b) {
        return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
      });

      headers.forEach((item) => {
        var key = item[0].toLowerCase();
        parts.push(`${key}:${item[1].toString().replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')}`);
      });

      return `${parts.join('\n')}\n`;
    }

    function buildCanonicalQS(qs) {
      var qsParts = qs.split('&');

      qsParts.sort(function (a, b) {
        return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
      });

      qsParts.forEach((qString) => {
        qString.replace(/\+/g, '%20');
      });

      return qsParts.join('&');
    }

    function buildCanonicalRequest(request) {
      var parts = [];

      parts.push(request.method);
      parts.push(encodeURI(request.urlToEncode));
      parts.push(buildCanonicalQS(request.queryString));
      parts.push(buildCanonicalHeaders(request.headers));
      parts.push('content-type;host;x-sdk-date');
      parts.push(AWS.util.crypto.sha256(request.body, 'hex'));

      return parts.join('\n');
    }

    function stringToSign(canonicalRequest, credentialScope, t) {
      var parts = [];

      parts.push('SDK-HMAC-SHA256');
      parts.push(t);
      parts.push(credentialScope);
      parts.push(canonicalRequest);

      return parts.join('\n');
    }

    function buildAuth(params) {
      var out = [];

      out.push(`${params.SignatureMethod} Credential=${params.accessKeyId}/${params.ShortTimestamp}/${self.get('model.otcConfig.region')}/${SERVICE}/sdk_request`);
      out.push('SignedHeaders=content-type;host;x-sdk-date');
      out.push(`Signature=${params.Signature}`);

      return out.join(', ');
    }

  },

  apiRequest: function(params) {
    var time = moment.utc();
    var signature = this.signAuth({
      accessKeyId: this.get('model.otcConfig.accessKeyId'),
      secretAccessKey: this.get('model.otcConfig.accessKeySecret')
    }, this.describeRequest(this.getURL(SERVICE, params.version, params.endpoint, params.queryParams), params.method, `${time.format('YYYYMMDDTHHmmss')}Z`, ''), time);

    this.set('itemsLoading', true);

    delete signature.headers.host;
    return fetch(signature.url, {
      method: params.method,
      headers: signature.headers,
    }).then((xhr) => {
      if (xhr.status >= 200 && xhr.status < 300) {

        this.set('itemsLoading', false);

        return xhr.body;
      } else {

        this.set('itemsLoading', false);

        return Ember.RSVP.reject();
      }
    }).catch((err) => {
      this.set('itemsLoading', false);

      return Ember.RSVP.reject(err);
    });
  },

  getSecurityGroups: function() {
    return this.apiRequest({
      method: 'GET',
      endpoint: 'security-groups',
      version: 'v1',
      queryParams: `vpc_id=${this.get('model.otcConfig.vpcId')}`
    }).then((resp) => {
      return this.set('securityGroups', resp.security_groups.sortBy('name'));
    });
  },

  getSubnets: function() {
    return this.apiRequest({
      method: 'GET',
      endpoint: 'subnets',
      version: 'v1',
      queryParams: `vpc_id=${this.get('model.otcConfig.vpcId')}`
    }).then((resp) => {
      return this.set('subnets', resp.subnets.filterBy('availability_zone', this.get('model.otcConfig.availableZone')));
    });
  },


  getNetworks: function() {
    return this.apiRequest({
      method: 'GET',
      endpoint: 'vpcs',
      version: 'v1',
      queryParams: ''
    }).then((resp) => {
      return this.set('networks', resp.vpcs);
    });
  },

  getZones: function() {
    return this.apiRequest({
      method: 'GET',
      endpoint: 'os-availability-zone',
      version: 'v2',
      queryParams: ''
    }).then((resp) => {
      return this.set('osAvailabilityZone', resp.availabilityZoneInfo.filterBy('zoneState.available', true).sortBy('zoneName'));
    });

  },

  getFlavors: function() {
    return this.apiRequest({
      method: 'GET',
      endpoint: 'cloudservers/flavors',
      version: 'v1',
      queryParams: ''
    }).then((resp) => {
      return this.set('flavors', resp.flavors.sortBy('name'));
    });
  },

  getImage: function() {
    return this.apiRequest({
      method: 'GET',
      endpoint: 'images',
      version: 'v2',
      queryParams: ''
    }).then((resp) => {
      return this.set('images', resp.images.sortBy('name'));
    });
  },
});
