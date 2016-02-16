import Ember from 'ember';
import Socket from 'ui/utils/socket';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';
import { hasThings } from 'ui/authenticated/project/controller';

export default Ember.Route.extend({
  prefs     : Ember.inject.service(),
  projects  : Ember.inject.service(),
  access    : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),

  socket    : null,
  pingTimer : null,

  model(params, transition) {
    if ( !params.project_id )
    {
      // If there isn't a project, pick one
      return this.get('projects').selectDefault().then((project) => {
        if ( project )
        {
          this.replaceWith('authenticated.project', project.get('id'));
        }
        else
        {
          this.replaceWith('settings.projects');
        }
      }).catch(() => {
        this.replaceWith('settings.projects');
      });
    }

    return this.loadProject(params.project_id).then((project) => {
      this.set(`tab-session.${C.TABSESSION.PROJECT}`, project.get('id'));
      this.set(`projects.current`, project);

      return this.loadSchemas().then(() => {
        return this.loadStacks().then((stacks) => {
          hasThings(stacks, project, window.lc('authenticated'));

          return Ember.Object.create({
            project: project,
            stacks: stacks,
          });
        });
      });
    }).catch((err) => {
      return this.loadingError(err, transition, null);
    });
  },

  loadingError(err, transition, ret) {
    var isAuthEnabled = this.get('access.enabled');

    if ( err && err.status && [401,403].indexOf(err.status) >= 0 && isAuthEnabled )
    {
      this.send('logout',transition,true);
      return;
    }

    this.transitionTo('authenticated');
    return ret;
  },

  loadProject(id) {
    return this.get('store').find('project', id);
  },

  loadSchemas() {
    var store = this.get('store');
    store.resetType('schema');
    return store.find('schema', null, {url: 'schemas', forceReload: true});
  },

  loadStacks() {
    return this.get('store').findAllUnremoved('environment');
  },

  activate() {
    this._super();
    var store = this.get('store');
    var boundTypeify = store._typeify.bind(store);

    var url = "ws://"+window.location.host + this.get('app.wsEndpoint');

    url = Util.addQueryParam(url, 'projectId', this.get(`tab-session.${C.TABSESSION.PROJECT}`));
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
        /*
        if ( d.resourceType == 'serviceConsumeMap' )
        {
          console.log('Map', d.data.resource.serviceId, '->', d.data.resource.consumedServiceId);
        }
        else
        {
          console.log('Res', (d.data ? d.data.resource.type : ''), (d.data ?  d.data.resource.id : ''), (d.data ? d.data.resource.state : ''));
        }
        */
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

  deactivate() {
    this._super();
    var socket = this.get('socket');
    if ( socket )
    {
      socket.disconnect();
    }
  },

  actions: {
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

    kubernetesServiceChanged: function(change) {
      this._includeChanged('environment', 'services', 'environmentId', change.data.resource);
    },

    kubernetesReplicationControllerChanged: function(change) {
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
