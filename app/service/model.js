import Resource from 'ember-api-store/models/resource';
import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import C from 'ui/utils/constants';

var _allMaps;
var _allServices;
var _allLbServices;
var _allExternalServices;
var _allDnsServices;

var Service = Resource.extend(ReadLabels, {
  type: 'service',

  _allMaps: null,
  consumedServicesUpdated: 0,
  serviceLinks: null, // Used for clone
  reservedKeys: ['_allMaps','consumedServicesUpdated','serviceLinks'],
  labelResource: Ember.computed.alias('launchConfig'),

  init: function() {
    this._super();

    // Hack: keep only one copy of all the services and serviceconsumemaps
    // But you have to load service and serviceconsumemap beforehand somewhere...
    // Bonus hack: all('services') doesn't include the other kinds of services, so load all those too.
    if ( !_allMaps )
    {
      _allMaps = this.get('store').allUnremoved('serviceconsumemap');
    }

    this.set('_allMaps', _allMaps);

    if ( !_allServices )
    {
      _allServices = this.get('store').allUnremoved('service');
    }

    if ( !_allLbServices )
    {
      _allLbServices = this.get('store').allUnremoved('loadbalancerservice');
    }

    if ( !_allExternalServices )
    {
      _allExternalServices = this.get('store').allUnremoved('externalservice');
    }

    if ( !_allDnsServices )
    {
      _allDnsServices = this.get('store').allUnremoved('dnsservice');
    }
  },

  consumedServicesWithNames: function() {
    var all = [_allServices, _allLbServices, _allExternalServices, _allDnsServices];

    return this.get('_allMaps').filterProperty('serviceId', this.get('id')).map((map) => {
      var i = 0;
      var service = null;
      while ( i < all.length && !service )
      {
        service = all[i].filterProperty('id', map.get('consumedServiceId'))[0];
        i++;
      }

      return Ember.Object.create({
        name: map.get('name'),
        service: service
      });
    }).filter((obj) => {
      return obj.get('service.id');
    });
  }.property('id','_allMaps.@each.{name,serviceId,consumedServiceId}'),

  consumedServices: function() {
    return this.get('consumedServicesWithNames').map((obj) => {
      return obj.get('service');
    });
  }.property('consumedServicesWithNames.@each.service'),

  onConsumedServicesChanged: function() {
    this.incrementProperty('consumedServicesUpdated');
  }.observes('consumedServicesWithNames.@each.{name,service}'),

  healthState: function() {
    var isGlobal = Object.keys(this.get('labels')||{}).indexOf(C.LABEL.SCHED_GLOBAL) >= 0;
    var instances = this.get('instances')||[];

    // Get the state of each instance
    var healthy = 0;
    instances.forEach((instance) => {
      var resource = instance.get('state');
      var health = instance.get('healthState');

      if ( ['running','active','updating-active'].indexOf(resource) >= 0 && (health === 'healthy' || health === null) )
      {
        healthy++;
      }
    });

    if ( (isGlobal && healthy >= instances.get('length')) || (!isGlobal && healthy >= this.get('scale')) )
    {
      return 'healthy';
    }
    else
    {
      return 'unhealthy';
    }
  }.property('instances.@each.{state,healthState}'),

  combinedState: function() {
    var service = this.get('state');
    var health = this.get('healthState');

    if ( ['active','updating-active'].indexOf(service) === -1 )
    {
      // If the service isn't active, return its state
      return service;
    }

    if ( health === 'healthy' )
    {
      return service;
    }
    else
    {
      return 'degraded';
    }
  }.property('state', 'healthState'),

  canScale: function() {
    if ( ['service','loadbalancerservice'].indexOf(this.get('type').toLowerCase()) >= 0 )
    {
      return !this.getLabel(C.LABEL.SCHED_GLOBAL);
    }
    else
    {
      return false;
    }
  }.property('type'),

  hasContainers: function() {
    return ['service','loadbalancerservice'].indexOf(this.get('type').toLowerCase()) >= 0;
  }.property('type'),

  hasImage: function() {
    return this.get('type') === 'service';
  }.property('type'),
  hasLabels: Ember.computed.alias('hasImage'),

  displayType: function() {
    var out;
    switch ( this.get('type').toLowerCase() )
    {
      case 'loadbalancerservice': out = 'Load Balancer'; break;
      case 'dnsservice':          out = 'DNS'; break;
      case 'externalservice':     out = 'External'; break;
      default:                    out = 'Container'; break;
    }

    return out;
  }.property('type'),

  activeIcon: function() {
    return activeIcon(this);
  }.property('type'),

});

export function activeIcon(service)
{
  var out = 'ss-layergroup';
  switch ( service.get('type').toLowerCase() )
  {
    case 'loadbalancerservice': out = 'ss-fork';    break;
    case 'dnsservice':          out = 'ss-compass'; break;
    case 'externalservice':     out = 'ss-cloud';   break;
  }

  return out;
}

Service.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'registering':      {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: activeIcon,          color: 'text-success'},
    'updating-active':  {icon: 'ss-tag',            color: 'text-success'},
    'updating-inactive':{icon: 'ss-tag',            color: 'text-danger'},
    'deactivating':     {icon: 'ss-down',           color: 'text-danger'},
    'inactive':         {icon: 'fa fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
    'degraded':         {icon: 'ss-notifications',  color: 'text-warning'},
  }
});

export default Service;
