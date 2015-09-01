import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    chooseUriMethod: function(method) {
      this.set('uriMethod', method);
    },

    chooseUriVersion: function(version) {
      this.set('uriVersion', version);
    },
  },

  uriMethodChoices: ['OPTIONS','GET','HEAD','POST','PUT','DELETE','TRACE','CONNECT'],
  uriVersionChoices: ['HTTP/1.0','HTTP/1.1'],

  uriMethod: null,
  uriPath: null,
  uriVersion: null,
  checkType: null,
  uriHost: null,
  showUriHost: Ember.computed.equal('uriVersion','HTTP/1.1'),

  initFields: function() {
    this._super();
    this.initHealthCheck();
  },

  initHealthCheck: function() {
    var check = this.get('healthCheck');
    if ( check )
    {
      var existing = this.get('healthCheck.requestLine');
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
          checkType: 'http',
        });

        this.uriDidChange();
      }
      else
      {
        this.setProperties({
          uriMethod: 'GET',
          uriPath: '',
          uriVersion: 'HTTP/1.0',
          uriHost: '',
          checkType: (this.get('healthCheck.port') ? 'tcp' : 'none')
        });
      }
    }
    else
    {
      this.set('checkType', 'none');
    }
  },

  checkTypeDidChange: function() {
    switch ( this.get('checkType') )
    {
    case 'none':
      if ( this.get('healthCheck') )
      {
        this.set('healthCheck.port', '');
      }

      this.set('uriPath','');
      break;
    case 'tcp':
      this.set('uriPath', '');
      break;
    }
  }.observes('checkType'),

  uriDidChange: function() {
    var out = '';
    var method = (this.get('uriMethod')||'').trim();
    var path = (this.get('uriPath')||'').trim();
    var version = (this.get('uriVersion')||'').trim();
    var host = (this.get('uriHost')||'').trim();

    if ( path && this.get('checkType') === 'http' )
    {
      out = method + ' ' + path + ' ' + version;
      if ( host )
      {
        out += '\r\nHost:\\ ' + host;
      }

      this.set('checkType','http');
    }

    if ( this.get('healthCheck') )
    {
      this.set('healthCheck.requestLine', out);
    }
  }.observes('checkType','uriMethod','uriPath','uriVersion','uriHost'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( this.get('checkType') !== 'none' )
    {
      if ( !this.get('healthCheck.port') )
      {
        errors.push('Health Check port is required');
      }

      if ( this.get('checkType') === 'http' && !this.get('uriPath') )
      {
        errors.push('Health Check request path is required');
      }
    }

    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }
    else
    {
      this.set('errors', null);
      return true;
    }
  },
});
