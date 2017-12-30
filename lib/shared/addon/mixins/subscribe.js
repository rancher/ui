import { schedule, cancel, later } from '@ember/runloop';
import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import Ember from 'ember';
import Socket from 'ui/utils/socket';
import C from 'ui/utils/constants';
import Queue from 'ui/utils/queue';

export default Mixin.create({
  label: '',
  endpoint: null,
  intl: null,
  growl: null,
  scope: null,
  store: null,
  globalStore: null,
  clusterStore: null,

  updateStore:        true,
  updateGlobalStore:  true,
  updateClusterStore: true,

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
    this.set('queue', queue);
    var socket = Socket.create();

    socket.on('message', (event) => {
      schedule('actions', this, function() {
        // Fail-safe: make sure the message is for this project
        var currentProject = this.get('scope.currentProject.id');
        var metadata       = socket.getMetadata();
        var socketProject  = metadata.projectId;
        if ( currentProject !== socketProject ) {
          console.error(`${this.label} Subscribe ignoring message, current=${currentProject} socket=${socketProject} ` + this.forStr());
          this.connect();
          return;
        }

        if ( !event || !event.data ) {
          return;
        }

        try {
          var d = JSON.parse(event.data);
        } catch (e) {
          console.error(`Error parsing ${this.label} change event:`, e);
          return;
        }

        switch ( d.name ) {
        case 'resource.change':
        case 'resource.remove':
          queue.enqueue(d);
          //console.log(`${this.label} Change event`, queue.getLength(), 'in queue');
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
    let projectId, clusterId, type, forceRemove;

    Ember.beginPropertyChanges();
    while ( event ) {
      if ( !event.data ) {
        continue;
      }

      projectId = get(event.data, 'projectId');
      clusterId = get(event.data, 'clusterId');
      type = get(event.data, 'type');
      forceRemove = (event.name === 'resource.remove');

      //console.log(this.label, (forceRemove ? 'Remove' : 'Change'), type +':'+ event.data.id, clusterId, projectId);

      if ( get(this, 'updateProjectStore') && projectId && projectStore.hasType(type) ) {
        //console.log('  Update project store', type, event.data.id, projectId);
        updateStore(projectStore, event.data, forceRemove);
      }

      if ( get(this,'updateClusterStore') && clusterStore.hasType(type) ) {
        //console.log('  Update cluster store', type, event.data.id, clusterId);
        updateStore(clusterStore, event.data, forceRemove);
      }

      if ( get(this,'updateGlobalStore') && globalStore.hasType(type) ) {
        //console.log('  Update global store', type, event.data.id);
        updateStore(globalStore, event.data, forceRemove);
      }

      count++;

      event = queue.dequeue();
    }
    Ember.endPropertyChanges();
    //console.log(`Processed ${count} ${this.label} change events`);

    function updateStore(store, data, forceRemove=false) {
      // Typeify adds or updates the store entry
      const resource = store._typeify(data);
      if ( resource ) {
        // Remove from store if the resource is removed
        if ( forceRemove ||  C.REMOVEDISH_STATES.includes(resource.state) ) {
          const type = get(resource,'type');
          store._remove(type, resource);
        }
      }
    }
  },

  connect() {
    const socket    = this.get('subscribeSocket');
    const projectId = this.get('scope.currentProject.id');
    const clusterId = this.get('scope.currentCluster.id');

    const url = "ws://"+window.location.host +
      this.get('endpoint')
        .replace(this.get('app.projectToken'), projectId)
        .replace(this.get('app.clusterToken'), clusterId);

    this.set('reconnect', true);

    socket.setProperties({
      url: url,
      autoReconnect: true,
    });
    socket.reconnect({projectId: projectId});
  },

  disconnect(cb) {
    this.set('reconnect', false);
    var socket = this.get('subscribeSocket');
    if ( socket  && socket._state !== 'disconnected')
    {
      console.log(`${this.label} Subscribe disconnect ` + this.forStr());
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
  subscribeConnected(tries,msec) {
    this.set('queueTimer', setInterval(this.processQueue.bind(this), 1000));
    this.set('connected', true);
    this.set('wasConnected', true);

    if( this.get('warningShown') ) {
      this.get('growl').close();
      this.set('warningShown', false);
    }

    cancel(this.get('disconnectedTimer'));

    let msg = `${this.label} Subscribe connected ` + this.forStr();
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
  },

  // WebSocket disconnected (unexpectedly)
  subscribeDisconnected() {
    this.set('connected', false);
    this.get('queue').clear();
    clearInterval(this.get('queueTimer'));

    console.log(`${this.label } Subscribe disconnected ` + this.forStr());
    if ( this.get('reconnect') ) {
      this.connect();
      this.showDisconnectedWarning();
    }
  },

  showDisconnectedWarning() {
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
});
