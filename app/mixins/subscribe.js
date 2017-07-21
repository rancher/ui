import Ember from 'ember';
import Socket from 'ui/utils/socket';
import C from 'ui/utils/constants';
import Queue from 'ui/utils/queue';

const { get } = Ember;

const ORCHESTRATION_STACKS = [
  'k8s',
  'swarm',
  'mesos'
];

export default Ember.Mixin.create({
  k8s             : Ember.inject.service(),
  projects        : Ember.inject.service(),
  'tab-session'   : Ember.inject.service(),

  subscribeSocket : null,
  reconnect: true,
  connected: false,
  queue: null,
  queueTimer: null,

  init() {
    this._super(...arguments);

    let queue = new Queue();
    this.set('queue', queue);
    this.set('queueTimer', setInterval(this.processQueue.bind(this), 1000));

    var socket = Socket.create();

    socket.on('message', (event) => {
      Ember.run.schedule('actions', this, function() {
        // Fail-safe: make sure the message is for this project
        var currentProject = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
        var metadata = socket.getMetadata();
        var socketProject = metadata.projectId;
        if ( currentProject !== socketProject ) {
          console.error(`Subscribe ignoring message, current=${currentProject} socket=${socketProject} ` + this.forStr());
          this.connectSubscribe();
          return;
        }

        var d = JSON.parse(event.data);

        switch ( d.name) {
        case 'resource.change':
          queue.enqueue(d);
//          console.log('Change event', queue.getLength(), 'in queue');
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
      if ( event.data && event.data.resource ) {
        resource = store._typeify(event.data.resource);
        event.data.resource = resource;
      }

      let key = event.resourceType+'Changed';
      if ( this[key] ) {
        this[key](event);
      }

      if ( resource && C.REMOVEDISH_STATES.includes(resource.state) ) {
        let type = get(resource,'type');
        let baseType = get(resource,'baseType');

        store._remove(type, resource);

        if ( baseType && type !== baseType ) {
          store._remove(baseType, resource);
        }
      }

      count++;
      event = queue.dequeue();
    }
    Ember.endPropertyChanges();
    //console.log('Processed',count,'change events');
  },

  connectSubscribe() {
    var socket = this.get('subscribeSocket');
    var projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    var url = ("ws://"+window.location.host + this.get('app.wsEndpoint')).replace(this.get('app.projectToken'), projectId);

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
    let out = '';
    let socket = this.get('subscribeSocket');
    var projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    if ( socket )
    {
      out = '(projectId=' + projectId + ', sockId=' + socket.getId() + ')';
    }

    return out;
  },

  // WebSocket connected
  subscribeConnected: function(tries,msec) {
    this.set('connected', true);

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
  },

  // WebSocket disconnected (unexpectedly)
  subscribeDisconnected: function() {
    this.set('connected', false);
    this.get('queue').clear();

    console.log('Subscribe disconnected ' + this.forStr());
    if ( this.get('reconnect') ) {
      this.connectSubscribe();
    }
  },

  subscribePing: function() {
    console.log('Subscribe ping ' + this.forStr());
  },

  stackChanged: function(change) {
    let stack = change.data.resource;
    let info = stack.get('externalIdInfo');

    if ( info && info.name && ORCHESTRATION_STACKS.includes(info.name) ) {
      Ember.run.once(this, function() {
        this.get('projects.current').reload().then(() => {
          this.get('projects').updateOrchestrationState();
        });
      });
    }
  },
});
