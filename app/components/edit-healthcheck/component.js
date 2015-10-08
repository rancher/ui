import Ember from 'ember';

const NONE = 'none';
const TCP = 'tcp';
const HTTP = 'http';

const DEFAULTS = {
  type: 'instanceHealthCheck',
  interval: 2000,
  responseTimeout: 2000,
  healthyThreshold: 2,
  unhealthyThreshold: 3,
  requestLine: null,
};

const METHOD_CHOICES = ['OPTIONS','GET','HEAD','POST','PUT','DELETE','TRACE','CONNECT'];
const HTTP_1_0 = 'HTTP/1.0';
const HTTP_1_1 = 'HTTP/1.1';

export default Ember.Component.extend({
  healthCheck: null,
  errors: null,

  uriMethodChoices: METHOD_CHOICES,
  uriVersionChoices: [HTTP_1_0,HTTP_1_1],

  uriMethod: null,
  uriPath: null,
  uriVersion: null,
  checkType: null,
  uriHost: null,
  showUriHost: Ember.computed.equal('uriVersion', HTTP_1_1),

  actions: {
    chooseUriMethod(method) {
      this.set('uriMethod', method);
    },

    chooseUriVersion(version) {
      this.set('uriVersion', version);
    },
  },

  didInitAttrs() {
    var check = this.get('healthCheck');
    if ( check )
    {
      var requestLine = this.get('healthCheck.requestLine');
      if ( requestLine )
      {
        var match;
        var host = '';
        var lines = requestLine.split(/[\r\n]+/);
        if ( lines.length > 1 )
        {
          match = lines[1].match(/^Host:\\ (.*)$/);
          if ( match )
          {
            host = match[1];
          }
        }

        match = lines[0].match(/^([^\s]+)\s+(.*)\s+(HTTP\/[0-9\.]+)/);
        this.setProperties({
          checkType: HTTP,
          uriMethod: match[1],
          uriPath: match[2],
          uriVersion: match[3],
          uriHost: host,
        });
      }
      else
      {
        this.setProperties({
          checkType: TCP,
          uriMethod: 'GET',
          uriPath: '',
          uriVersion: HTTP_1_0,
          uriHost: '',
        });
      }
    }
    else
    {
      this.setProperties({
        checkType: NONE,
        uriMethod: 'GET',
        uriPath: '',
        uriVersion: HTTP_1_0,
        uriHost: '',
      });
    }

    this.validate();
  },

  uriDidChange: function() {
    var checkType = this.get('checkType');
    var method = (this.get('uriMethod')||'').trim();
    var path = (this.get('uriPath')||'').trim();
    var version = (this.get('uriVersion')||'').trim();
    var host = (this.get('uriHost')||'').trim();

    if ( checkType === NONE )
    {
      this.setProperties({
        'healthCheck': null,
        'uriPath': '',
      });
    }
    else
    {
      var check = this.get('healthCheck');
      if ( !check )
      {
        check = this.get('store').createRecord(DEFAULTS);
        this.set('healthCheck', check);
      }

      if ( checkType === HTTP )
      {
        var requestLine='';
        if ( path )
        {
          requestLine = method + ' ' + path + ' ' + version;
          if ( host )
          {
            requestLine += '\r\nHost:\\ ' + host;
          }
        }
        this.set('healthCheck.requestLine', requestLine);
      }
      else if ( checkType === TCP )
      {
        this.set('uriPath', null);
      }
    }
  }.observes('checkType','uriMethod','uriPath','uriVersion','uriHost'),

  validate: function() {
    var errors = [];

    if ( this.get('checkType') !== NONE )
    {
      if ( !this.get('healthCheck.port') )
      {
        errors.push('Health Check port is required');
      }

      if ( this.get('checkType') === HTTP && !this.get('healthCheck.requestLine') )
      {
        errors.push('Health Check request path is required');
      }
    }

    this.set('errors', errors);
  }.observes('checkType','healthCheck.port','healthCheck.requestLine'),
});
