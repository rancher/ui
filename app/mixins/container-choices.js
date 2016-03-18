import Ember from 'ember';

export default Ember.Mixin.create({
  // linksArray, allHosts, instance should be set

  isManagedNetwork: Ember.computed.equal('instance.networkMode','managed'),

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

      var hostLabel = 'Host: ' + host.get('displayName');
      if ( host.get('state') !== 'active' )
      {
        hostLabel += ' (' + host.get('state') + ')';
      }

      list.pushObjects(containers.map(function(container) {
        expectContainerIds.removeObject(container.get('id'));

        var containerLabel = container.get('displayName');
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
});
