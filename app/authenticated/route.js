import Ember from 'ember';
import Socket from 'ui/utils/socket';
import Util from 'ui/utils/util';
import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import C from 'ui/utils/constants';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),

  socket: null,
  pingTimer: null,

  model: function(params, transition) {
    var store = this.get('store');
    var session = this.get('session');
    var isAuthEnabled = this.get('app.authenticationEnabled');

    // Load schemas
    var headers = {};
    headers[C.HEADER.PROJECT] = undefined;
    return store.find('schema', null, {url: 'schemas', headers: headers}).then((schemas) => {
      if ( schemas && schemas.xhr )
      {
        // Save the account ID into session
        session.set(C.SESSION.ACCOUNT_ID, schemas.xhr.getResponseHeader(C.HEADER.ACCOUNT_ID));
      }

      // Save whether the user is admin
      var type = session.get(C.SESSION.USER_TYPE);
      var isAdmin = (type === C.USER.TYPE_ADMIN) || !isAuthEnabled;
      this.set('app.isAuthenticationAdmin', isAdmin);

      // Return the list of projects as the model
      return this.get('projects').getAll();
    }).catch((err) => {
      if ( [401,403].indexOf(err.status) >= 0 && isAuthEnabled )
      {
        this.send('logout',transition,true);
        return;
      }

      this.send('error',err);
    });
  },

  afterModel: function(model) {
    var projects = this.get('projects');
    return this.loadPreferences().then(() => {
      projects.set('all', model);
      return projects.selectDefault().catch(() => {
        this.replaceWith('settings.projects');
      });
    });
  },

  loadPreferences: function() {
    var store = this.get('store');
    if ( store.hasRecordFor('schema','userpreference') )
    {
      this.set('app.hasUserPreferences', true);
      return this.get('store').find('userpreference', null, {forceReload: true}).then((prefs) => {
        if ( this.get('prefs.'+C.PREFS.I_HATE_SPINNERS) )
        {
          $('BODY').addClass('no-spin');
        }

        return prefs;
      });
    }
    else
    {
      this.set('app.hasUserPreferences', false);
      return Ember.RSVP.resolve();
    }
  },

  activate: function() {
    this._super();
    var store = this.get('store');
    var boundTypeify = store._typeify.bind(store);

    var url = "ws://"+window.location.host + this.get('app.wsEndpoint');
    var session = this.get('session');

    var projectId = session.get(C.SESSION.PROJECT);
    if ( projectId )
    {
      url = Util.addQueryParam(url, 'projectId', projectId);
    }

    var socket = Socket.create({
      url: url
    });

    socket.on('message', (event) => {
      var d = JSON.parse(event.data, boundTypeify);
      //this._trySend('subscribeMessage',d);

      var action;
      if ( d.name === 'resource.change' )
      {
        action = d.resourceType+'Changed';
      }
      else if ( d.name === 'ping' )
      {
        action = 'subscribePing';
      }

      if ( action )
      {
        this._trySend(action,d);
      }
    });

    socket.on('connected', (tries, after) => {
      this._trySend('subscribeConnected', tries, after);
    });

    socket.on('disconnected', () => {
      this._trySend('subscribeDisconnected', this.get('tries'));
    });

    this.set('socket', socket);
    socket.connect();
  },

  deactivate: function() {
    this._super();
    var socket = this.get('socket');
    if ( socket )
    {
      socket.disconnect();
    }

    // Forget all the things
    this.get('store').reset();
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

    showAbout: function() {
      this.controllerFor('application').set('showAbout', true);
    },

    switchProject: function(projectId) {
      this.intermediateTransitionTo('authenticated');
      this.get('session').set(C.SESSION.PROJECT, projectId);
      this.get('store').reset();
      if ( !projectId )
      {
        this.get('projects').selectDefault().catch(() => {
          this.replaceWith('settings.projects');
        });
      }
      this.refresh();
    },

    // Raw message from the WebSocket
    //subscribeMessage: function(/*data*/) {
      //console.log('subscribeMessage',data);
    //},

    // WebSocket connected
    subscribeConnected: function(tries,msec) {
      var msg = 'Subscribe connected';
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
    subscribeDisconnected: function() {
      console.log('Subscribe disconnected');
    },

    subscribePing: function() {
      console.log('Subscribe ping');
      if ( this.get('pingTimer') )
      {
        Ember.run.cancel(this.get('pingTimer'));
      }

      this.set('pingTimer', Ember.run.later(this, function() {
        console.log('Subscribe missed 2 pings...');
        this.get('socket').connect();
      }, 11000));
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

    loadBalancerConfigChanged: function(change) {
      this._includeChanged('loadBalancer', 'loadBalancerListeners', 'loadBalancerListeners', change.data.resource);
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

    mountChanged: function(change) {
      var mount = change.data.resource;
      var volume = this.get('store').getById('volume', mount.get('volumeId'));
      if ( volume )
      {
        var mounts = volume.get('mounts');
        if ( !Ember.isArray(mounts) )
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
