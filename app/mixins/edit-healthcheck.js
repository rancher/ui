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

  isInstanceCheck: Ember.computed.equal('healthCheck.type','instanceHealthCheck'),

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

    if ( this.get('healthCheck') )
    {
      this.set('healthCheck.requestLine', out);
    }
  }.observes('uriMethod','uriPath','uriVersion','uriHost'),

  initHealthCheck: function() {
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
});
