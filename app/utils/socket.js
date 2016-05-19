import Ember from "ember";
import { isSafari } from 'ui/utils/platform';
import Util from 'ui/utils/util';

var INSECURE = 'ws://';
var SECURE   = 'wss://';
var sockId = 1;
var safariWarningShown = false;

export default Ember.Object.extend(Ember.Evented, {
  growl: Ember.inject.service(),

  url: null,
  socket: null,
  autoReconnect: true,
  connected: false,
  tries: 0,
  disconnectedAt: null,
  disconnectCb: null,
  closingId: null,

  connect: function() {
    var socket = this.get('socket');
    if ( socket )
    {
      this.disconnect();
    }

    var url = this.get('url');
    // If the site is SSL, the WebSocket should be too...
    if ( window.location.protocol === 'https:' && url.indexOf(INSECURE) === 0 )
    {
      url = SECURE + url.substr(INSECURE.length);
      this.set('url', url);
    }

    var id = sockId++;
    console.log('Socket connect',id,'to', url.replace(/\?.*/,'')+'...');

    socket = new WebSocket(Util.addQueryParam(url,'sockId',id));
    socket.__sockId = id;
    this.set('socket', socket);

    socket.onmessage = Ember.run.bind(this, this._message);
    socket.onopen = Ember.run.bind(this, this._opened);
    socket.onerror = Ember.run.bind(this, this._error);
    socket.onclose = Ember.run.bind(this, this._closed);
  },

  disconnect: function(cb) {
    if ( !this.get('connected') )
    {
      if ( cb )
      {
        cb();
      }
      return;
    }

    this.setProperties({
      'autoReconnect': false,
      'disconnectCb': cb
    });

    var socket = this.get('socket');
    if ( socket )
    {
      try {
        this._log('closing');
        if ( this.get('closingId') )
        {
          console.log('Socket double closed', this.get('closingId'), socket.__sockId);
        }
        this.set('closingId', socket.__sockId);
        socket.onopen = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.close();
        this.set('socket',null);
      }
      catch (e)
      {
        this._log('exception', e);
        // Meh..
      }
    }
  },

  _opened: function() {
    this._log('opened');
    var now = (new Date()).getTime();

    var at = this.get('disconnectedAt');
    var after = null;
    if ( at )
    {
      after = now - at;
    }

    this.setProperties({
      connected: true,
      disconnectedAt: null,
    });

    this.trigger('connected', this.get('tries'), after);

    // Don't reset tries for a little bit, in case the socket immediately closes again.
    // This prevents open/imediate close loops from hammering the server because the tries count is never incrementing.
    Ember.run.later(this, '_resetTries', 1000);
  },

  _resetTries: function() {
    if ( this.get('connected') ) {
      this.set('tries', 0);
    }
  },

  _message: function(event) {
    this.trigger('message',event);
  },

  _error: function() {
    this._log('error');
    if ( this.get('autoReconnect') )
    {
      this._reconnect();
    }
  },

  _reconnect: function() {
    this.incrementProperty('tries');
    var delay = Math.max(1000, Math.min(1000 * this.get('tries'), 30000));
    Ember.run.later(this, this.connect, delay);
  },

  _closed: function() {
    console.log('Socket', this.get('closingId'), 'closed');
    this.set('closingId', null);

    var wasConnected = this.get('connected');
    this.set('connected',false);

    if ( this.get('disconnectedAt') === null )
    {
      this.set('disconnectedAt', (new Date()).getTime());
    }

    if ( wasConnected && this.get('autoReconnect') )
    {
      this._reconnect();
    }
    else if ( isSafari && !safariWarningShown && !wasConnected && this.get('url').indexOf('wss://') === 0 )
    {
      safariWarningShown = true;
      window.l('service:growl').error('Error connecting to WebSocket','Safari does not support WebSockets connecting to a self-signed or unrecognized certificate.  Use http:// instead of https:// or reconfigure the server with a valid certificate from a recognized certificate authority.  Streaming stats, logs, shell/console, and auto-updating of the state of resources in the UI will not work until this is resolved.');
    }

    if ( typeof this.get('disconnectCb') === 'function' )
    {
      this.get('disconnectCb')();
    }

    if ( wasConnected )
    {
      this.trigger('disconnected');
    }
  },

  _log: function(/*arguments*/) {
    var args = ['Socket', this.get('socket.__sockId') ];
    for ( var i = 0 ; i < arguments.length ; i++ )
    {
      args.push(arguments[i]);
    }

    console.log.apply(console, args);
  },
});
