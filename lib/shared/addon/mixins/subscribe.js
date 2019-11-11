import { schedule, cancel, later, next } from '@ember/runloop';
import Mixin from '@ember/object/mixin';
import { get, set, setProperties } from '@ember/object';
import Ember from 'ember';
import Socket from 'ui/utils/socket';
import C from 'ui/utils/constants';
import Queue from 'ui/utils/queue';
import { Promise as EmberPromise } from 'rsvp';

export default Mixin.create({
  label:        '',
  endpoint:     null,
  intl:         null,
  growl:        null,
  scope:        null,
  store:        null,
  watchState:   false,
  watchStateOf: null,
  globalStore:  null,
  clusterStore: null,

  updateProjectStore: true,
  updateGlobalStore:  true,
  updateClusterStore: true,
  validate:           null,

  subscribeSocket:    null,
  reconnect:          true,
  connected:          false,
  queue:              null,
  queueTimer:         null,
  warningShown:       false,
  wasConnected:       false,
  disconnectedTimer:  null,

  init() {
    this._super(...arguments);

    let queue = new Queue();

    set(this, 'queue', queue);
    var socket = Socket.create();

    socket.on('message', (event) => {
      schedule('actions', this, function() {
        // Fail-safe: make sure the message is for the current project/cluster
        if ( this.validate && !this.validate() ) {
          this.connect();

          return;
        }

        if ( !event || !event.data ) {
          return;
        }

        try {
          var d = JSON.parse(event.data);
        } catch (e) {
          console.error(`Error parsing ${ this.label } change event:`, e);

          return;
        }

        switch ( d.name ) {
        case 'resource.change':
        case 'resource.remove':
          queue.enqueue(d);
          // console.log(`${this.label} Change event`, queue.getLength(), 'in queue');
          break;
        case 'logout':
          this.send('logout', null);
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
      this.subscribeDisconnected(get(this, 'tries'));
    });

    set(this, 'subscribeSocket', socket);
  },

  processQueue() {
    let queue = get(this, 'queue');

    if ( !queue.getLength() ) {
      return;
    }

    const projectStore = get(this, 'store');
    const clusterStore = get(this, 'clusterStore');
    const globalStore = get(this, 'globalStore');

    // let count = 0;
    let event = queue.dequeue();
    let projectId, type, forceRemove;

    Ember.beginPropertyChanges();
    while ( event ) {
      if ( !event.data ) {
        event = queue.dequeue();
        continue;
      }

      projectId = get(event.data, 'projectId');
      type = get(event.data, 'type');
      forceRemove = (event.name === 'resource.remove');

      // console.log(this.label, (forceRemove ? 'Remove' : 'Change'), type +':'+ event.data.id,  projectId);

      if ( get(this, 'updateProjectStore') && projectId && checkStoreHasType(projectStore, type) ) {
        // console.log('  Update project store', type, event.data.id, projectId);
        updateStore(projectStore, event.data, forceRemove);
      }

      if ( get(this, 'updateClusterStore') && checkStoreHasType(clusterStore, type) ) {
        // console.log('  Update cluster store', type, event.data.id);
        updateStore(clusterStore, event.data, forceRemove);
      }

      if ( get(this, 'updateGlobalStore') && checkStoreHasType(globalStore, type)) {
        // console.log('  Update global store', type, event.data.id);
        updateStore(globalStore, event.data, forceRemove);
      }

      // count++;

      event = queue.dequeue();
    }
    Ember.endPropertyChanges();
    // console.log(`Processed ${count} ${this.label} change events`);

    function checkStoreHasType(store, type) {
      return next(() => store.hasType(type));
    }

    function updateStore(store, data, forceRemove = false) {
      // Update the state to removed before we remove it from store
      if ( forceRemove ) {
        data.state = 'removed';
      }
      // Typeify adds or updates the store entry
      const resource = store._typeify(data);

      if ( resource ) {
        // Remove from store if the resource is removed
        if ( forceRemove ||  C.REMOVEDISH_STATES.includes(resource.state) ) {
          const type = get(resource, 'type');

          store._remove(type, resource);
        }
      }
    }
  },

  connect(force = true, clusterId, projectId) {
    if ( get(this, 'watchState') ) {
      const state = get(this, 'watchStateOf.relevantState');

      if ( state !== 'active' ) {
        console.log(`${ this.label } Subscribe not connecting because state isn't active (${ state })`);

        return;
      }
    }

    if ( get(this, 'connected') && !force ) {
      return;
    }

    const socket    = get(this, 'subscribeSocket');

    projectId = projectId || get(this, 'scope.pendingProject.id');
    clusterId = clusterId || get(this, 'scope.pendingCluster.id');

    const url = `ws://${ window.location.host
    }${ get(this, 'endpoint')
      .replace(get(this, 'app.projectToken'), projectId)
      .replace(get(this, 'app.clusterToken'), clusterId) }`;

    set(this, 'reconnect', true);

    socket.setProperties({
      url,
      autoReconnect: true,
    });
    socket.reconnect({
      projectId,
      clusterId
    });
  },

  disconnect(cb) {
    return new EmberPromise((resolve/* , reject*/) => {
      setProperties(this, {
        reconnect: false,
        tries:     0,
      });

      var socket = get(this, 'subscribeSocket');

      if ( !socket || socket._state === 'disconnected') {
        if ( cb ) {
          cb();
        }

        resolve()

        return;
      }

      console.log(`${ this.label } Subscribe disconnect ${  this.forStr() }`);
      socket.set('tries', 0);
      socket.disconnect(() => {
        if ( cb ) {
          cb();
        }

        resolve();
      });
    });
  },

  forStr() {
    let out       = '';
    let socket    = get(this, 'subscribeSocket');

    if ( socket ) {
      out = `(sockId=${  socket.getId()  })`;
    }

    return out;
  },

  // WebSocket connected
  subscribeConnected(tries, msec) {
    set(this, 'queueTimer', setInterval(this.processQueue.bind(this), 1000));
    set(this, 'connected', true);
    set(this, 'wasConnected', true);

    if ( get(this, 'warningShown') ) {
      get(this, 'growl').close();
      set(this, 'warningShown', false);
    }

    cancel(get(this, 'disconnectedTimer'));

    let msg = `${ this.label } Subscribe connected ${  this.forStr() }`;

    if (tries > 0) {
      msg += ` (after ${ tries  } ${  tries === 1 ? 'try' : 'tries' }`;
      if (msec) {
        msg += `, ${  msec / 1000  } sec`;
      }

      msg += ')';
    }

    console.log(msg);
  },

  // WebSocket disconnected (unexpectedly)
  subscribeDisconnected() {
    set(this, 'connected', false);
    get(this, 'queue').clear();
    clearInterval(get(this, 'queueTimer'));

    console.log(`${ this.label } Subscribe disconnected ${  this.forStr() }`);
    if ( get(this, 'reconnect') ) {
      this.showDisconnectedWarning();
    }
  },

  subscribePing() {
    // This is annoying now with 3 connections alternating messages
    // console.log('Subscribe ping ' + this.forStr());
  },

  showDisconnectedWarning() {
    // if ( !get(this, 'warningShown') && get(this, 'wasConnected') ) {
    if ( get(this, 'wasConnected') ) {
      //      const intl = get(this,'intl');
      // @TODO-2.0      get(this,'growl').error(intl.t('growl.webSocket.connecting.title'), intl.t('growl.webSocket.connecting.disconnectedWarning'));
      // set(this, 'warningShown', true);
      set(this, 'disconnectedTimer', later(this, () => {
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
});
