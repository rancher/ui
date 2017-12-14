import { schedule, cancel, later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import Ember from 'ember';
import Socket from 'ui/utils/socket';
import C from 'ui/utils/constants';
import Queue from 'ui/utils/queue';

export default Mixin.create({
  intl:              service(),
  growl:             service(),
  k8s:               service(),
  scope:             service(),
  store:             service(),
  globalStore:       service(),
  clusterStore:      service(),

  subscribeSocket :  null,
  reconnect:         true,
  connected:         false,
  queue:             null,
  queueTimer:        null,
  warningShown:      false,
  wasConnected:      false,
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

    const projectStore = this.get('store');
    const clusterStore = this.get('clusterStore');
    const globalStore = this.get('globalStore');

    let count = 0;
    let event = queue.dequeue();
    let projectId, clusterId, type;

    Ember.beginPropertyChanges();
    while ( event ) {
      if ( !event.data ) {
        continue;
      }

      projectId = get(event.data, 'projectId');
      clusterId = get(event.data, 'clusterId');
      type = get(event.data, 'type');

//      console.log('Change', type +':'+ event.data.id, clusterId, projectId);

      if ( projectId && projectStore.hasType(type) ) {
//        console.log('  Update project store', type, event.data.id, projectId);
        updateStore(projectStore, event.data);
      }

      if ( clusterId && clusterStore.hasType(type) ) {
//        console.log('  Update cluster store', type, event.data.id, clusterId);
        updateStore(clusterStore, event.data);
      }

      if ( globalStore.hasType(type) ) {
//        console.log('  Update global store', type, event.data.id);
        updateStore(globalStore, event.data);
      }

      count++;
      event = queue.dequeue();
    }
    Ember.endPropertyChanges();
    console.log('Processed',count,'change events');

    function updateStore(store, data) {
      const resource = store._typeify(data);
      if ( resource ) {
        // Not used by anything anymore
        //let type = get(resource,'type');
        //let key = type+'Changed';
        //
        //// Fire [thing]Changed() method if present
        //if ( this[key] ) {
        //  this[key](event);
        //}

        // Remove from store if the resource is removed
        if ( C.REMOVEDISH_STATES.includes(resource.state) ) {
          const type = get(resource,'type');
          store._remove(type, resource);
        }
      }
    }
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
