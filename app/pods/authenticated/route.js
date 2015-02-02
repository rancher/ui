import Ember from 'ember';
import Socket from 'ui/utils/socket';
import Util from 'ui/utils/util';
import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  socket: null,

  model: function() {
    var self = this;
    var store = this.get('store');
    return store.find('schema', null, {url: 'schemas'}).then(function(/*schemas*/) {
      // Save whether the user is an admin or not
      self.set('app.isAuthenticationAdmin', store.hasRecordFor('schema','githubconfig'));

      return Ember.RSVP.resolve();
    }).catch((err) => {
      this.send('error',err);
    });
  },

  actions: {
    error: function(err,transition) {
      // Unauthorized error, send back to login screen
      if ( err.status === 401 )
      {
        this.send('logout',transition,true);
        return false;
      }
      else
      {
        // Bubble up
        return true;
      }
    },

    setPageName: function(str) {
      this.controller.set('pageName',str);
    },

    // Raw message from the WebSocket
    wsMessage: function(/*data*/) {
      //console.log('wsMessage',data);
    },

    // WebSocket connected
    wsConnected: function(tries,msec) {
      var msg = 'WebSocket connected';
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

    // WebSocket disconnected
    wsDisconnected: function() {
      console.log('WebSocket disconnected');
    },

    wsPing: function() {
      console.log('WebSocket ping');
    },

    /*
    agentChanged: function(change) {
      if (!change || !change.data || !change.data.resource)
      {
        return;
      }
      //console.log('Agent Changed:', change);
      var agent = change.data.resource;
      var id = agent.id;
      delete agent.hosts;

      var hosts = this.controllerFor('hosts');
      hosts.forEach(function(host) {
        if ( host.get('agent.id') === id )
        {
          host.get('agent').setProperties(agent);
        }
      });
    },
    */

    containerChanged:       function(change) {
      this._instanceChanged(change);
    },

    instanceChanged:        function(change) {
      this._instanceChanged(change);
    },

    mountChanged: function(change) {
      var mount = change.data.resource;
      var volume = this.get('store').getById('volume', mount.get('volumeId'));
      if ( volume )
      {
        var mounts = volume.get('mounts');
        if ( !Ember.isArray('mounts') )
        {
          mounts = [];
          volume.set('mounts',mounts);
        }

        var existingMount = mounts.filterBy('id', mount.get('id')).get('firstObject');
        if ( existingMount )
        {
          existingMount.setProperties(mount);
        }
        else
        {
          mounts.pushObject(mount);
        }
      }
    }
  },

  enter: function() {
    var self = this;
    var store = this.get('store');
    var boundTypeify = store._typeify.bind(store);

    var url = "ws://"+window.location.host + this.get('app.wsEndpoint');
    var session = this.get('session');
    var jwt = session.get('jwt');
    if ( jwt )
    {
      url += (url.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(jwt);
    }

    var projectId = session.get('projectId');
    if ( projectId )
    {
      url += (url.indexOf('?') >= 0 ? '&' : '?') + 'projectId=' + encodeURIComponent(projectId);
    }

    var socket = Socket.create({
      url: url
    });

    socket.on('message', function(event) {
      var d = JSON.parse(event.data, boundTypeify);
      self._trySend('wsMessage',d);

      var str = d.name;
      if ( d.resourceType )
      {
        str += ' ' + d.resourceType;

        if ( d.resourceId )
        {
          str += ' ' + d.resourceId;
        }
      }

      var action;
      if ( d.name === 'resource.change' )
      {
        action = d.resourceType+'Changed';
      }
      else if ( d.name === 'ping' )
      {
        action = 'wsPing';
      }

      if ( action )
      {
        self._trySend(action,d);
      }
    });

    socket.on('connected', function(tries, after) {
      self._trySend('wsConnected', tries, after);
    });

    socket.on('disconnected', function() {
      self._trySend('wsDisconnected', self.get('tries'));
    });

    this.set('socket', socket);
    socket.connect();
  },

  exit: function() {
    var socket = this.get('socket');
    if ( socket )
    {
      socket.disconnect();
    }

    // Forget all the things
    this.get('store').reset();
  },

  _trySend: function(/*arguments*/) {
    try
    {
      this.send.apply(this,arguments);
    }
    catch (err)
    {
      if ( err instanceof Ember.Error && err.message.indexOf('Nothing handled the action') === 0 )
      {
        // Don't care
      }
      else
      {
        throw err;
      }
    }
  },


  _findInCollection: function(collectionName,id) {
    var collection = this.controllerFor(collectionName);
    var existing = collection.filterBy('id',id).get('firstObject');
    return existing;
  },

  _instanceChanged: function(change) {
    if (!change || !change.data || !change.data.resource)
    {
      return;
    }

    //console.log('Instance Changed:',change);
    var self = this;
    var instance = change.data.resource;
    var id = instance.get('id');

    // All the hosts
    var allHosts = self.get('store').all('host');

    // Host IDs the instance should be on
    var expectedHostIds = [];
    if ( instance.get('state') !== 'purged' )
    {
      expectedHostIds = (instance.get('hosts')||[]).map(function(host) {
        return host.get('id');
      });
    }

    // Host IDs it is currently on
    var curHostIds = [];
    allHosts.forEach(function(host) {
      var existing = (host.get('instances')||[]).filterBy('id', id);
      if ( existing.length )
      {
        curHostIds.push(host.get('id'));
      }
    });

    // Remove from hosts the instance shouldn't be on
    var remove = Util.arrayDiff(curHostIds, expectedHostIds);
    remove.forEach(function(hostId) {
      var host = self._findInCollection('hosts',hostId);
      if ( host )
      {
        var instances = host.get('instances');
        if ( !instances )
        {
          return;
        }

        instances.removeObjects(instances.filterBy('id', id));
      }
    });

    // Add or update hosts the instance should be on
    expectedHostIds.forEach(function(hostId) {
      var host = self._findInCollection('hosts',hostId);
      if ( host )
      {
        var instances = host.get('instances');
        if ( !instances )
        {
          instances = [];
          host.set('instances',instances);
        }

        var existing = instances.filterBy('id', id);
        if ( existing.length === 0)
        {
          instances.pushObject(instance);
        }
      }
    });
  }
});
