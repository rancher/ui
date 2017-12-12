import { schedule, cancel, later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import Ember from 'ember';
import Socket from 'ui/utils/socket';
import C from 'ui/utils/constants';
import Queue from 'ui/utils/queue';

export default Mixin.create({
  intl            : service(),
  growl           : service(),
  k8s             : service(),
  scope        : service(),

  subscribeSocket : null,
  reconnect: true,
  connected: false,
  queue: null,
  queueTimer: null,
  warningShown: false,
  wasConnected: false,
  disconnectedTimer: null,

  init() {
    this._super(...arguments);

    let queue = new Queue();
    this.set('queue', queue);
    this.set('queueTimer', setInterval(this.processQueue.bind(this), 1000));

    var socket = Socket.create();

    socket.on('message', (event) => {
      schedule('actions', this, function() {
        // Fail-safe: make sure the message is for this project
        var currentProject = this.get(`cookies.${C.COOKIE.PROJECT}`);
        var metadata       = socket.getMetadata();
        var socketProject  = metadata.projectId;
        if ( currentProject !== socketProject ) {
          console.error(`Subscribe ignoring message, current=${currentProject} socket=${socketProject} ` + this.forStr());
          this.connectSubscribe();
          return;
        }

        var d = JSON.parse(event.data);

        switch ( d.name) {
        case 'resource.change':
          queue.enqueue(d);
          //console.log('Change event', queue.getLength(), 'in queue');
          break;
        case 'logout':
          this.send('logout', false);
          break;
        case 'ping':
          this.subscribePing(d);
          break;
        }
      });
    });

    socket.on('connected', (tries, after) => {
      this.subscribeConnected(tries, after);
    });

    socket.on('frameTimeout', () => {
      this.showDisconnectedWarning();
    });

    socket.on('disconnected', () => {
      this.subscribeDisconnected(this.get('tries'));
    });

    this.set('subscribeSocket', socket);
  },

  willDestroy() {
    this._super(...arguments);
    clearInterval(this.get('queueTimer'));
  },

  processQueue() {
    let queue = this.get('queue');

    if ( !queue.getLength() ) {
      return;
    }

    let store = this.get('store');
    let count = 0;
    let event = queue.dequeue();

    Ember.beginPropertyChanges();
    while ( event ) {
      let resource;
      if ( event.data ) {
        resource = store._typeify(event.data);
      }

      if ( resource ) {
        let type = get(resource,'type');
        let key = type+'Changed';

        // Fire [thing]Changed() method if present
        if ( this[key] ) {
          this[key](event);
        }

        // Remove from store if the resource is removed
        if ( C.REMOVEDISH_STATES.includes(resource.state) ) {
          store._remove(type, resource);
        }
      }

      count++;
      event = queue.dequeue();
    }
    Ember.endPropertyChanges();
    console.log('Processed',count,'change events');
  },

  connectSubscribe() {
    var socket    = this.get('subscribeSocket');
    var projectId = this.get(`cookies.${C.COOKIE.PROJECT}`);
    var url       = ("ws://"+window.location.host + this.get('app.subscribeEndpoint')).replace(this.get('app.projectToken'), projectId);

    this.set('reconnect', true);

    socket.setProperties({
      url: url,
      autoReconnect: true,
    });
    socket.reconnect({projectId: projectId});
  },

  disconnectSubscribe(cb) {
    this.set('reconnect', false);
    var socket = this.get('subscribeSocket');
    if ( socket  && socket._state !== 'disconnected')
    {
      console.log('Subscribe disconnect ' + this.forStr());
      socket.disconnect(cb);
    }
    else if ( cb )
    {
      cb();
    }
  },


  forStr() {
    let out       = '';
    let socket    = this.get('subscribeSocket');
    var projectId = this.get(`cookies.${C.COOKIE.PROJECT}`);
    if ( socket )
    {
      out = '(projectId=' + projectId + ', sockId=' + socket.getId() + ')';
    }

    return out;
  },

  // WebSocket connected
  subscribeConnected: function(tries,msec) {
    this.set('connected', true);
    this.set('wasConnected', true);

    if( this.get('warningShown') ) {
      this.get('growl').close();
      this.set('warningShown', false);
    }

    cancel(this.get('disconnectedTimer'));

    let msg = 'Subscribe connected ' + this.forStr();
    if (tries > 0)
    {
      msg += ' (after '+ tries + ' ' + (tries === 1 ? 'try' : 'tries');
      if (msec)
      {
        msg += ', ' + (msec/1000) + ' sec';
      }

      msg += ')';
    }

    console.log(msg);

    if ( this.get('store').all('namespace').get('length') === 0 ) {
      console.log('Reloading Namespaces in case some appeared...');
      this.get('store').find('namespace', null, { forceReload: true });
    }
  },

  // WebSocket disconnected (unexpectedly)
  subscribeDisconnected: function() {
    this.set('connected', false);
    this.get('queue').clear();

    console.log('Subscribe disconnected ' + this.forStr());
    if ( this.get('reconnect') ) {
      this.connectSubscribe();
      this.showDisconnectedWarning();
    }
  },

  showDisconnectedWarning: function() {
    if( !this.get('warningShown') && this.get('wasConnected') ) {
//      const intl = this.get('intl');
//@TODO-2.0      this.get('growl').error(intl.t('growl.webSocket.connecting.title'), intl.t('growl.webSocket.connecting.disconnectedWarning'));
      this.set('warningShown', true);
      this.set('disconnectedTimer', later(this, function() {
        if ( window.navigator.onLine ) {
          window.location.reload();
        } else {
          window.ononline = function() {
            window.location.reload();
          }
        }
      }, C.WEBSOCKET.SUBSCRIBE_DISCONNECTED_TIMEOUT));
    }
  },

  subscribePing: function() {
    console.log('Subscribe ping ' + this.forStr());
  },
});
