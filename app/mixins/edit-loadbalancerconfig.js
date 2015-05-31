import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    addListener: function() {
      this.get('listenersArray').pushObject(this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        sourcePort: '',
        sourceProtocol: 'tcp',
        targetPort: '',
        targetProtocol: 'tcp',
        algorithm: 'roundrobin',
      }));
    },

    removeListener: function(obj) {
      this.get('listenersArray').removeObject(obj);
    },

    chooseProtocol: function(listener, key, val) {
      listener.set(key,val);
    },

    chooseUriMethod: function(method) {
      this.set('uriMethod', method);
    },

    chooseUriVersion: function(version) {
      this.set('uriVersion', version);
    },
  },

  listenersArray: null,
  initListeners: function() {
    var store = this.get('store');
    var existing = this.get('balancer.loadBalancerListeners');
    var out = [];
    if ( existing )
    {
      existing.forEach((listener) => {
        var neu = listener.cloneForNew();
        neu.setProperties({
          serviceId: null,
          name: null,
        });
        out.push(neu);
      });
    }
    else
    {
      out.push(store.createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        sourcePort: '',
        sourceProtocol: 'http',
        targetPort: '',
        targetProtocol: 'http',
        algorithm: 'roundrobin',
      }));
    }

    this.set('listenersArray', out);
  },

  sourceProtocolOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.sourceProtocol.options');
  }.property(),

  targetProtocolOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.targetProtocol.options');
  }.property(),

  algorithmOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.algorithm.options');
  }.property(),

  uriMethodChoices: ['OPTIONS','GET','HEAD','POST','PUT','DELETE','TRACE','CONNECT'],
  uriVersionChoices: ['HTTP/1.0','HTTP/1.1'],

  uriMethod: null,
  uriPath: null,
  uriVersion: null,
  uriHost: null,
  showUriHost: Ember.computed.equal('uriVersion','HTTP/1.1'),

  uriDidChange: function() {
    var out = '';
    var method = (this.get('uriMethod')||'').trim();
    var path = (this.get('uriPath')||'').trim();
    var version = (this.get('uriVersion')||'').trim();
    var host = (this.get('uriHost')||'').trim();
    if ( path )
    {
      out = method + ' ' + path + ' ' + version;
      if ( host )
      {
        out += '\r\nHost:\\ ' + host;
      }
    }

    if ( this.get('config.healthCheck') )
    {
      this.set('config.healthCheck.requestLine', out);
    }
  }.observes('uriMethod','uriPath','uriVersion','uriHost'),

  initUri: function() {
    var existing = this.get('config.healthCheck.requestLine');
    if ( existing )
    {
      var match;
      var host = '';
      var lines = existing.split(/[\r\n]+/);
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
        uriMethod: match[1],
        uriPath: match[2],
        uriVersion: match[3],
        uriHost: host,
      });
    }
    else
    {
      this.setProperties({
        uriMethod: 'GET',
        uriPath: '',
        uriVersion: 'HTTP/1.0',
        uriHost: ''
      });
    }
    this.uriDidChange();
  },

  stickiness: 'none',
  isStickyNone: Ember.computed.equal('stickiness','none'),
  isStickyLbCookie: Ember.computed.equal('stickiness','lbCookie'),
  isStickyAppCookie: Ember.computed.equal('stickiness','appCookie'),

  lbCookieModeChoices: [
    {value: 'rewrite', label: 'Rewrite'},
    {value: 'insert', label: 'Insert'},
    {value: 'prefix', label: 'Prefix'},
  ],

  appCookieModeChoices: [
    {value: 'path_parameters', label: 'Path Parameter'},
    {value: 'query_string', label: 'Query String'},
  ],

  initStickiness: function() {
    if ( this.get('config.appCookieStickinessPolicy') )
    {
      this.set('stickiness', 'appCookie');
    }
    else if ( this.get('config.lbCookieStickinessPolicy') )
    {
      this.set('stickiness', 'lbCookie');
    }
    else
    {
      this.set('stickiness','none');
    }
  },

  stickinessDidChange: function() {
    var stickiness = this.get('stickiness');
    if ( stickiness === 'none' )
    {
      this.set('config.lbCookieStickinessPolicy', null);
      this.set('config.appCookieStickinessPolicy', null);
    }
    else if ( stickiness === 'lbCookie' )
    {
      this.set('config.lbCookieStickinessPolicy', this.get('lbCookie'));
      this.set('config.appCookieStickinessPolicy', null);
    }
    else if ( stickiness === 'appCookie' )
    {
      this.set('config.lbCookieStickinessPolicy', null);
      this.set('config.appCookieStickinessPolicy', this.get('appCookie'));
    }
  }.observes('stickiness'),
});
