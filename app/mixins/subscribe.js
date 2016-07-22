import Ember from 'ember';
import Socket from 'ui/utils/socket';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  k8s             : Ember.inject.service(),
  projects        : Ember.inject.service(),
  'tab-session'   : Ember.inject.service(),

  subscribeSocket : null,
  reconnect: true,
  connected: false,
  k8sUidBlacklist : null,

  init() {
    this._super();
    this.set('k8sUidBlacklist', []);

    var store = this.get('store');
    var boundTypeify = store._typeify.bind(store);

    var socket = Socket.create();

    socket.on('message', (event) => {
      // Fail-safe: make sure the message is for this project
      var currentProject = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
      var metadata = socket.getMetadata();
      var socketProject = metadata.projectId;
      if ( currentProject !== socketProject ) {
        console.error(`Subscribe ignoring message, current=${currentProject} socket=${socketProject} ` + this.forStr());
        this.connectSubscribe();
        return;
      }

      var d = JSON.parse(event.data, boundTypeify);
      //this._trySend('subscribeMessage',d);

      if ( d.name === 'resource.change' )
      {
        this._trySend(d.resourceType+'Changed', d);
      }
      else if ( d.name === 'service.kubernetes.change' )
      {
        var changeType = (Ember.get(d, 'data.type')||'').toLowerCase();
        var obj = Ember.get(d, 'data.object');
        if ( changeType && obj )
        {
          this._trySend('k8sResourceChanged', changeType, obj);
        }
      }
      else if ( d.name === 'ping' )
      {
        this._trySend('subscribePing', d);
      }
    });

    socket.on('connected', (tries, after) => {
      this._trySend('subscribeConnected', tries, after);
    });

    socket.on('disconnected', () => {
      this._trySend('subscribeDisconnected', this.get('tries'));
    });

    this.set('subscribeSocket', socket);
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
    if ( socket )
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

  actions: {
    // Raw message from the WebSocket
    //subscribeMessage: function(/*data*/) {
      //console.log('subscribeMessage',data);
    //},

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

      console.log('Subscribe disconnected ' + this.forStr());
      if ( this.get('reconnect') ) {
        this.connectSubscribe();
      }
    },

    subscribePing: function() {
      console.log('Subscribe ping ' + this.forStr());
    },

    hostChanged: function(change) {
      // If the host has a physicalHostId, ensure it is in the machine's hosts array.
      var host = change.data.resource;
      var machine = this.get('store').getById('machine', host.get('physicalHostId'));
      if ( machine )
      {
        machine.get('hosts').addObject(host);
      }
    },

    containerChanged: function(change) {
      this._includeChanged('host', 'instances', 'hosts', change.data.resource);
    },

    virtualMachineChanged: function(change) {
      this._includeChanged('host', 'instances', 'hosts', change.data.resource);
    },

    instanceChanged: function(change) {
      this._includeChanged('host', 'instances', 'hosts', change.data.resource);
    },

    ipAddressChanged: function(change) {
      this._includeChanged('host', 'ipAddresses', 'hosts', change.data.resource);
//      this._includeChanged('container', 'container', 'ipAddresses', 'containers', change.data.resource);
    },

    loadBalancerTargetChanged: function(change) {
      this._includeChanged('loadBalancer', 'loadBalancerTargets', 'loadBalancerId', change.data.resource);
    },

    loadBalancerChanged: function(change) {
      var balancer = change.data.resource;
      var config = balancer.get('loadBalancerConfig');
      var balancers = config.get('loadBalancers');
      if ( !balancers )
      {
        balancers = [];
        config.set('loadBalancers',balancers);
      }

      if ( config.get('state') === 'removed' )
      {
        balancers.removeObject(balancer);
      }
      else
      {
        balancers.addObject(balancer);
      }
    },

    registryCredentialChanged: function(change) {
      this._includeChanged('registry', 'credentials', 'registryId', change.data.resource);
    },

    loadBalancerServiceChanged: function(change) {
      this._includeChanged('environment', 'services', 'environmentId', change.data.resource);
    },

    dnsServiceChanged: function(change) {
      this._includeChanged('environment', 'services', 'environmentId', change.data.resource);
    },

    externalServiceChanged: function(change) {
      this._includeChanged('environment', 'services', 'environmentId', change.data.resource);
    },

    serviceChanged: function(change) {
      this._includeChanged('environment', 'services', 'environmentId', change.data.resource);
    },

    kubernetesServiceChanged: function(change) {
      this._includeChanged('environment', 'services', 'environmentId', change.data.resource);
    },

    k8sResourceChanged: function(changeType, obj) {
      //console.log('k8s change', changeType, (obj && obj.metadata && obj.metadata.uid ? obj.metadata.uid : 'none'));
      if ( obj && obj.metadata && obj.metadata.uid && this.get('k8sUidBlacklist').indexOf(obj.metadata.uid) >= 0 )
      {
        //console.log('^-- Ignoring', changeType, 'for removed resource');
        return;
      }

      var resource = this.get('k8s')._typeify(obj);

      if ( changeType === 'deleted' )
      {
        this.get('k8sUidBlacklist').addObject(obj.metadata.uid);
        this.get('store')._remove(resource.get('type'), resource);
      }
    }
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

  // Update the `?include=`-ed arrays of a host,
  // e.g. when an instance changes:
  //   Update the destProperty='instances' array on all models of type resourceName='hosts'.
  //   to match the list in the the 'changed' resource's expectedProperty='hosts'
  // _includeChanged(       'host',       'hosts',        'instances', 'hosts',          instance)
  _includeChanged: function(resourceName, destProperty, expectedProperty, changed) {
    if (!changed)
    {
      return;
    }

    var changedId = changed.get('id');
    var store = this.get('store');

    //console.log('Include changed',resourceName,destProperty,expectedProperty,changedId);

    // All the resources
    var all = store.all(resourceName);

    // IDs the resource should be on
    var expectedIds = [];
    var expected = changed.get(expectedProperty)||[];
    if ( !Ember.isArray(expected) )
    {
      expected = [expected];
    }

    if ( changed.get('state') !== 'purged' )
    {
      expectedIds = expected.map(function(item) {
        if ( typeof item === 'object' )
        {
          return item.get('id');
        }
        else
        {
          return item;
        }
      });
    }

    // IDs it is currently on
    var curIds = [];
    all.forEach(function(item) {
      var existing = (item.get(destProperty)||[]).filterBy('id', changedId);
      if ( existing.length )
      {
        curIds.push(item.get('id'));
      }
    });

    // Remove from resources the changed shouldn't be on
    var remove = Util.arrayDiff(curIds, expectedIds);
    remove.forEach((id) => {
      //console.log('Remove',id);
      store.find(resourceName, id).then((item) => {
        var list = item.get(destProperty);
        if ( list )
        {
          //console.log('Removing',changedId,'from',item.get('id'));
          list.removeObjects(list.filterBy('id', changedId));
        }
      }).catch(() => {});
    });

    // Add or update resources the changed should be on
    expectedIds.forEach((id) => {
      //console.log('Expect',id);
      store.find(resourceName, id).then((item) => {
        var list = item.get(destProperty);
        if ( !list )
        {
          list = [];
          //console.log('Adding empty to',item.get('id'), destProperty);
          item.set(destProperty, list);
        }

        var existing = list.filterBy('id', changedId);
        if ( existing.length === 0)
        {
          //console.log('Adding',changedId,'to',item.get('id'), destProperty);
          list.pushObject(changed);
        }
      }).catch(() => {});
    });
  },
});
