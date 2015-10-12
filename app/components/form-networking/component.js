import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  //Inputs
  instance: null,

  tagName: '',

  didInitAttrs() {
    this.initNetwork();
    this.initLinks();
    this.initDns();
    this.initDnsSearch();
  },

  actions: {
    addLink: function() {
      this.get('linksArray').pushObject({name: '', targetInstanceId: null});
    },
    removeLink: function(obj) {
      this.get('linksArray').removeObject(obj);
    },

    addDns: function() {
      this.get('dnsArray').pushObject({value: ''});
    },
    removeDns: function(obj) {
      this.get('dnsArray').removeObject(obj);
    },

    addDnsSearch: function() {
      this.get('dnsSearchArray').pushObject({value: ''});
    },
    removeDnsSearch: function(obj) {
      this.get('dnsSearchArray').removeObject(obj);
    },
  },

  // ----------------------------------
  // Network
  // ----------------------------------
  networkChoices: null,
  isManagedNetwork: Ember.computed.equal('instance.networkMode','managed'),
  isContainerNetwork: Ember.computed.equal('instance.networkMode','container'),
  initNetwork: function() {
    var isService = this.get('isService')||false;
    var choices = this.get('store').getById('schema','container').get('resourceFields.networkMode').options.sort();
    var out = [];
    choices.forEach((option) => {
      if ( isService && option === 'container' )
      {
        return;
      }

      out.push({label: Util.ucFirst(option), value: option});
    });

    this.set('networkChoices', out);
  },

  networkModeChanged: function() {
    if ( this.get('instance.networkMode') !== 'container' )
    {
      this.set('instance.networkContainerId', null);
    }
  }.observes('instance.networkMode'),


  // ----------------------------------
  // Links
  // ----------------------------------
  containerChoices: function() {
    var list = [];
    var id = this.get('id');

    var expectContainerIds = (this.get('linksArray')||[]).map(function(obj) {
      return Ember.get(obj,'targetInstanceId');
    });

    this.get('allHosts').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't link to yourself, or to other types of instances, or to system containers
        return instance.get('id') !== id &&
               instance.get('kind') === 'container' &&
               !instance.get('systemContainer');
      });

      var hostLabel = 'Host: ' + (host.get('name') || '('+host.get('id')+')');
      if ( host.get('state') !== 'active' )
      {
        hostLabel += ' (' + host.get('state') + ')';
      }

      list.pushObjects(containers.map(function(container) {
        expectContainerIds.removeObject(container.get('id'));

        var containerLabel = (container.get('name') || '('+container.get('id')+')');
        if ( container.get('state') !== 'running' )
        {
          containerLabel += ' (' + container.get('state') + ')';
        }

        return {
          group: hostLabel,
          hostId: host.get('id'),
          id: container.get('id'),
          name: containerLabel,
        };
      }));
    });

    if ( expectContainerIds.get('length') )
    {
      // There are some links to containers which are not in the list somehow..
      expectContainerIds.forEach((id) => {
        var container = this.get('store').getById('container',id);
        return {
          group: 'Host: ???',
          hostId: null,
          id: id,
          name: (container && container.get('name') ? container.get('name') : '('+id+')')
        };
      });
    }

    return list.sortBy('group','name','id');
  }.property('allHosts.@each.instancesUpdated').volatile(),

  containersOnRequestedHost: function() {
    var requestedHostId = this.get('instance.requestedHostId');
    var all = this.get('containerChoices');

    if ( requestedHostId )
    {
      return all.filterBy('hostId', requestedHostId);
    }
    else
    {
      return all;
    }
  }.property('containerChoices.@each.hostId','instance.requestedHostId'),

  containersOnRequestedHostIfUnmanaged: function() {
    var requestedHostId = this.get('instance.requestedHostId');
    var all = this.get('containerChoices');
    var isManagedNetwork = this.get('isManagedNetwork');

    if ( requestedHostId && !isManagedNetwork )
    {
      return all.filterBy('hostId', requestedHostId);
    }
    else
    {
      return all;
    }
  }.property('containerChoices.@each.hostId','instance.requestedHostId','isManagedNetwork'),

  linksArray: null,
  initLinks: function() {
    var out = [];
    var links = this.get('instanceLinks')||[];

    if ( Ember.isArray(links) )
    {
      links.forEach(function(value) {
        // Objects, from edit
        if ( typeof value === 'object' )
        {
          out.push({
            existing: (value.id ? true : false),
            obj: value,
            name: value.name,
            targetInstanceId: value.targetInstanceId,
          });
        }
        else
        {
          // Strings, from create maybe
          var match = value.match(/^([^:]+):(.*)$/);
          if ( match )
          {
            out.push({name: match[1], targetInstanceId: match[2], existing: false});
          }
        }
      });
    }

    this.set('linksArray', out);
  },

  linksDidChange: function() {
    var errors = [];
    var linksAsMap = {};

    this.get('linksArray').forEach((row) => {
      if ( row.targetInstanceId )
      {
        var name = row.name;
        // Lookup the container name if an "as name" wasn't given
        if ( !name )
        {
          var container = this.get('store').getById('container', row.targetInstanceId);
          if ( container )
          {
            name = container.name;
          }
        }

        if ( name )
        {
          linksAsMap[ name ] = row.targetInstanceId;
        }
        else
        {
          errors.push('Link to container ' + row.targetInstanceId + '  must have an "as name".');
        }
      }
    });

    this.set('instance.instanceLinks', linksAsMap);
    this.set('errors', errors);
  }.observes('linksArray.@each.{targetInstanceId,name}'),

  // ----------------------------------
  // DNS
  // ----------------------------------
  dnsArray: null,
  initDns: function() {
    var ary = this.get('instance.dns');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dns',ary);
    }

    this.set('dnsArray', ary.map(function(entry) {
      return {value: entry};
    }));
  },

  dnsDidChange: function() {
    var out = this.get('instance.dns');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsArray.@each.value'),

  // ----------------------------------
  // DNS Search
  // ----------------------------------
  dnsSearchArray: null,
  initDnsSearch: function() {
    var ary = this.get('instance.dnsSearch');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dnsSearch',ary);
    }

    this.set('dnsSearchArray', ary.map(function(entry) {
      return {value: entry};
    }));
  },
  dnsSearchDidChange: function() {
    var out = this.get('instance.dnsSearch');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsSearchArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsSearchArray.@each.value'),
});
