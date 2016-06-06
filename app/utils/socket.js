import Ember from "ember";
import { isSafari } from 'ui/utils/platform';
import Util from 'ui/utils/util';

var INSECURE = 'ws://';
var SECURE   = 'wss://';
var sockId = 1;
var safariWarningShown = false;

const DISCONNECTED = 'disconnected';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSING = 'closing';
const RECONNECTING = 'reconnecting';

export default Ember.Object.extend(Ember.Evented, {
  url: null,
  autoReconnect: true,
  frameTimeout: 11000,
  metadata: null,

  _socket: null,
  _state: DISCONNECTED,
  _framesReceived: 0,
  _frameTimer: null,
  _reconnectTimer: null,
  _tries: 0,
  _disconnectCbs: null,
  _disconnectedAt: null,
  _closingId: null,

  connect(metadata) {
    if ( this.get('_socket') ) {
      console.error('Socket refusing to connect while another socket exists');
      return;
    }

    this.set('_disconnectCbs', this.get('_disconnectCbs')||[]);
    this.set('metadata', metadata||this.get('metadata')||{});

    var url = this.get('url');

    // If the site is SSL, the WebSocket should be too...
    if ( window.location.protocol === 'https:' && url.indexOf(INSECURE) === 0 )
    {
      url = SECURE + url.substr(INSECURE.length);
      this.set('url', url);
    }

    var id = sockId++;
    console.log(`Socket connecting (id=${id}, url=${url.replace(/\?.*/,'')+'...'})`);

    var socket = new WebSocket(Util.addQueryParam(url,'sockId',id));
    socket.__sockId  = id;
    socket.metadata  = this.get('metadata');
    socket.onmessage = Ember.run.bind(this, this._message);
    socket.onopen    = Ember.run.bind(this, this._opened);
    socket.onerror   = Ember.run.bind(this, this._error);
    socket.onclose   = Ember.run.bind(this, this._closed);

    this.setProperties({
      _socket: socket,
      _state: CONNECTING,
    });
  },

  disconnect(cb) {
    if ( cb )
    {
      this.get('_disconnectCbs').pushObject(cb);
    }

    this.set('autoReconnect', false);
    this._close();
  },

  reconnect(metadata) {
    this.set('metadata', metadata||{});
    if ( this.get('_socket') )
    {
      this._close();
    } else {
      this.connect(metadata);
    }
  },

  getMetadata() {
    let socket = this.get('_socket');
    if ( socket ) {
      return socket.metadata;
    } else {
      return {};
    }
  },

  getId() {
    let socket = this.get('_socket');
    if ( socket ) {
      return socket.__sockId;
    } else {
      return null;
    }
  },

  _close() {
    var socket = this.get('_socket');
    if ( socket )
    {
      try {
        this._log('closing');
        this.set('_closingId', socket.__sockId);
        socket.onopen = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.close();
      }
      catch (e)
      {
        this._log('Socket exception', e);
        // Meh..
      }

      this.setProperties({
        _state: CLOSING,
      });
    }
  },

  _opened() {
    this._log('opened');
    var now = (new Date()).getTime();

    var at = this.get('_disconnectedAt');
    var after = null;
    if ( at )
    {
      after = now - at;
    }

    this.setProperties({
      _state: CONNECTED,
      _framesReceived: 0,
      _disconnectedAt: null,
    });

    this.trigger('connected', this.get('_tries'), after);
    this._resetWatchdog();
    Ember.run.cancel(this.get('_reconnectTimer'));
  },

  _message(event) {
    this._resetWatchdog();
    this.set('_tries', 0);
    this.incrementProperty('_framesReceived');
    this.trigger('message',event);
  },

  _resetWatchdog() {
    if ( this.get('_frameTimer') )
    {
      Ember.run.cancel(this.get('_frameTimer'));
    }

    let timeout = this.get('frameTimeout');
    if ( timeout && this.get('_state') === CONNECTED)
    {
      this.set('_frameTimer', Ember.run.later(this, function() {
        this._log('Socket watchdog expired after', timeout, 'closing');
        this._close();
      }, timeout));
    }
  },

  _error() {
    this.set('_closingId', this.get('_socket.__sockId'));
    this._log('error');
  },

  _closed() {
    console.log(`Socket ${this.get('_closingId')} closed`);

    this.set('_closingId', null);
    this.set('_socket', null);
    Ember.run.cancel(this.get('_reconnectTimer'));
    Ember.run.cancel(this.get('_frameTimer'));

    let cbs = this.get('_disconnectCbs')||[];
    while ( cbs.get('length') ) {
      let cb = cbs.popObject();
      cb.apply(this);
    }

    let wasConnected = false;
    if ( [CONNECTED, CLOSING].indexOf(this.get('_state')) >= 0 )
    {
      this.trigger('disconnected');
      wasConnected = true;
    }

    if ( this.get('_disconnectedAt') === null )
    {
      this.set('_disconnectedAt', (new Date()).getTime());
    }

    if ( isSafari && !wasConnected && this.get('url').indexOf('wss://') === 0 )
    {
      this.set('autoReconnect', false);
      this.set('_state', DISCONNECTED);
      if ( !safariWarningShown )
      {
        safariWarningShown = true;
        window.l('service:growl').error('Error connecting to WebSocket','Safari does not support WebSockets connecting to a self-signed or unrecognized certificate.  Use http:// instead of https:// or reconfigure the server with a valid certificate from a recognized certificate authority.  Streaming stats, logs, shell/console, and auto-updating of the state of resources in the UI will not work until this is resolved.');
      }
    }
    else if ( this.get('autoReconnect') )
    {
      this.set('_state', RECONNECTING);
      this.incrementProperty('_tries');
      let delay = Math.max(1000, Math.min(1000 * this.get('_tries'), 30000));
      this.set('_reconnectTimer', Ember.run.later(this, this.connect, delay));
    }
    else
    {
      this.set('_state', DISCONNECTED);
    }
  },

  _log(/*arguments*/) {
    var args = ['Socket'];
    for ( var i = 0 ; i < arguments.length ; i++ )
    {
      args.push(arguments[i]);
    }

    args.push(`(state=${this.get('_state')}, id=${this.get('_socket.__sockId')})`);

    console.log(args.join(" "));
  },
});
