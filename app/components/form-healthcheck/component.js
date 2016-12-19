import Ember from 'ember';
import { parseRequestLine } from 'ui/utils/parse-healthcheck';

const NONE = 'none';
const TCP = 'tcp';
const HTTP = 'http';

const DEFAULTS = {
  type: 'instanceHealthCheck',
  interval: 2000,
  responseTimeout: 2000,
  initializingTimeout: 60000,
  reinitializingTimeout: 60000,
  healthyThreshold: 2,
  unhealthyThreshold: 3,
  requestLine: '',
  strategy: 'recreate',
};

const METHOD_CHOICES = ['OPTIONS','GET','HEAD','POST','PUT','DELETE','TRACE','CONNECT'];
const HTTP_1_0 = 'HTTP/1.0';
const HTTP_1_1 = 'HTTP/1.1';

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  // Inputs
  healthCheck: null,
  errors: null,
  isService: null,
  showStrategy: true,

  classNameBindings: ['editing:component-editing:component-static'],
  editing: true,

  uriMethodChoices: METHOD_CHOICES,
  uriVersionChoices: [HTTP_1_0,HTTP_1_1],

  uriMethod: null,
  uriPath: null,
  uriVersion: null,
  checkType: null,
  uriHost: null,
  showUriHost: Ember.computed.equal('uriVersion', HTTP_1_1),

  strategy: null,
  quorum: null,

  actions: {
    chooseUriMethod(method) {
      this.set('uriMethod', method);
    },

    chooseUriVersion(version) {
      this.set('uriVersion', version);
    },
  },

  init() {
    this._super(...arguments);
    var check = this.get('healthCheck');
    if ( check )
    {
      var parsed = parseRequestLine(this.get('healthCheck.requestLine'));
      if ( parsed )
      {
        this.setProperties({
          checkType: HTTP,
          uriMethod: parsed.method,
          uriPath: parsed.path,
          uriVersion: parsed.version,
          uriHost: parsed.headers['Host'] || '',
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

      this.setProperties({
        strategy: this.get('healthCheck.strategy') || 'recreate',
        quorum: this.get('healthCheck.recreateOnQuorumStrategyConfig.quorum') || '1',
      });
    }
    else
    {
      this.setProperties({
        checkType: NONE,
        uriMethod: 'GET',
        uriPath: '',
        uriVersion: HTTP_1_0,
        uriHost: '',
        strategy: 'recreate',
        quorum: '1',
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
          requestLine = method + ' "' + path + '" "' + version;
          if ( host && this.get('showUriHost') )
          {
            requestLine += '\\r\\nHost: ' + host;
          }

          requestLine += '"';
        }
        this.set('healthCheck.requestLine', requestLine);
      }
      else if ( checkType === TCP )
      {
        this.set('healthCheck.requestLine', '');
      }
    }
  }.observes('checkType','uriMethod','uriPath','uriVersion','uriHost'),

  strategyDidChange: function() {
    var strategy = this.get('strategy');
    var hc = this.get('healthCheck');

    if ( strategy === 'recreateOnQuorum' )
    {
      hc.setProperties({
        'strategy': strategy,
        'recreateOnQuorumStrategyConfig': {
          quorum: parseInt(this.get('quorum'),10),
        },
      });
    }
    else
    {
      hc.setProperties({
        'strategy': strategy,
        'recreateOnQuorumStrategyConfig': null,
      });
    }
  }.observes('strategy','quorum'),

  quorumDidChange: function() {
    this.set('strategy', 'recreateOnQuorum');
  }.observes('quorum'),

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
