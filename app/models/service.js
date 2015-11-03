import Resource from 'ember-api-store/models/resource';
import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import C from 'ui/utils/constants';
import { displayImage } from 'ui/helpers/display-image';

var _allMaps;
var _allRegularServices;
var _allLbServices;
var _allExternalServices;
var _allDnsServices;
var _allKubernetesServices;
var _allKubernetesReplicationControllers;

var Service = Resource.extend(ReadLabels, {
  type: 'service',

  actions: {
    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    cancelUpgrade() {
      return this.doAction('cancelupgrade');
    },

    cancelRollback() {
      return this.doAction('cancelrollback');
    },

    finishUpgrade() {
      return this.doAction('finishupgrade');
    },

    rollback() {
      return this.doAction('rollback');
    },

    edit() {
      var type = this.get('type').toLowerCase();
      if ( type === 'loadbalancerservice' )
      {
        this.importLink('loadBalancerListeners').then(() => {
          this.get('application').setProperties({
            editLoadBalancerService: true,
            originalModel: this,
          });
        });
      }
      else if ( type === 'dnsservice' )
      {
        this.get('application').setProperties({
          editAliasService: true,
          originalModel: this,
        });
      }
      else if ( type === 'externalservice' )
      {
        this.get('application').setProperties({
          editExternalService: true,
          originalModel: this,
        });
      }
      else
      {
        this.get('application').setProperties({
          editService: true,
          originalModel: this,
        });
      }
    },

    scaleUp() {
      this.incrementProperty('scale');
      this.saveScale();
    },

    scaleDown() {
      if ( this.get('scale') >= 1 )
      {
        this.decrementProperty('scale');
        this.saveScale();
      }
    },

    upgrade() {
      this.get('application').transitionToRoute('service.new', {queryParams: {
        serviceId: this.get('id'),
        upgrade: true,
        environmentId: this.get('environmentId'),
      }});
    },

    clone() {
      var route;
      switch ( this.get('type').toLowerCase() )
      {
        case 'service':             route = 'service.new';          break;
        case 'dnsservice':          route = 'service.new-alias';    break;
        case 'loadbalancerservice': route = 'service.new-balancer'; break;
        case 'externalservice':     route = 'service.new-external'; break;
        default: return void this.send('error','Unknown service type: ' + this.get('type'));
      }

      this.get('application').transitionToRoute(route, {queryParams: {
        serviceId: this.get('id'),
        environmentId: this.get('environmentId'),
      }});
    },
  },

  scaleTimer: null,
  saveScale() {
    if ( this.get('scaleTimer') )
    {
      Ember.run.cancel(this.get('scaleTimer'));
    }

    var timer = Ember.run.later(this, function() {
      this.save();
    }, 500);

    this.set('scaleTimer', timer);
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var canUpgrade = !!a.upgrade && this.get('type') === 'service';
    var isK8s = this.get('isK8s');

    var choices = [
      { label: 'Start',           icon: 'icon icon-play',         action: 'activate',       enabled: !!a.activate && !isK8s,    color: 'text-success'},
      { label: 'Stop',            icon: 'icon icon-pause',        action: 'deactivate',     enabled: !!a.deactivate && !isK8s,  color: 'text-danger'},
      { label: 'Delete',          icon: 'icon icon-trash',        action: 'promptDelete',   enabled: !!a.remove && !isK8s, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',           icon: '',                       action: 'purge',          enabled: !!a.purge && !isK8s },
      { divider: true },
      { label: 'Upgrade',         icon: 'fa fa-arrow-circle-o-up',action: 'upgrade',        enabled: canUpgrade },
      { label: 'Finish Upgrade',  icon: 'fa fa-thumbs-o-up',      action: 'finishUpgrade',  enabled: !!a.finishupgrade },
      { label: 'Cancel Upgrade',  icon: 'fa fa-life-ring',        action: 'cancelUpgrade',  enabled: !!a.cancelupgrade },
      { label: 'Rollback',        icon: 'fa fa-history',          action: 'rollback',       enabled: !!a.rollback },
      { label: 'Cancel Rollback', icon: 'fa fa-life-ring',        action: 'cancelRollback', enabled: !!a.cancelrollback },
      { divider: true },
      { label: 'View in API',     icon: 'icon icon-externallink', action: 'goToApi',        enabled: true },
      { label: 'Clone',           icon: 'icon icon-copy',         action: 'clone',          enabled: !isK8s },
      { label: 'Edit',            icon: 'icon icon-edit',         action: 'edit',           enabled: !!a.update && !isK8s },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,update,remove,purge,finishupgrade,cancelupgrade,rollback,cancelrollback}','type','isK8s'),


  _allMaps: null,
  _allRegularServices: null,
  _allLbServices: null,
  _allExternalServices: null,
  _allDnsServices: null,
  _allKubernetesServices: null,
  _allKubernetesReplicationControllers: null,

  consumedServicesUpdated: 0,
  consumedByServicesUpdated: 0,
  serviceLinks: null, // Used for clone
  reservedKeys: [
    '_allMaps',
    '_allRegularServices',
    '_allLbServices',
    '_allExternalServices',
    '_allDnsServices',
    '_allKubernetesServices',
    '_allKubernetesReplicationControllers',
    'consumedServices',
    'consumedServicesUpdated',
    'serviceLinks',
    '_environment',
    '_environmentState'
  ],

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

    if ( !_allRegularServices )
    {
      _allRegularServices = this.get('store').allUnremoved('service');
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

    if ( !_allKubernetesServices )
    {
      _allKubernetesServices = this.get('store').allUnremoved('kubernetesservice');
    }

    if ( !_allKubernetesReplicationControllers )
    {
      _allKubernetesReplicationControllers = this.get('store').allUnremoved('kubernetesreplicationcontroller');
    }

    // And we need this here so that consumedServices can watch for changes
    this.setProperties({
      '_allMaps': _allMaps,
      '_allRegularServices': _allRegularServices,
      '_allLbServices': _allLbServices,
      '_allExternalServices': _allExternalServices,
      '_allDnsServices': _allDnsServices,
      '_allKubernetesServices': _allKubernetesServices,
      '_allKubernetesReplicationControllers': _allKubernetesReplicationControllers,
    });
  },

  _environment: null,
  _environmentState: 0,
  displayEnvironment: function() {
    var env = this.get('_environment');
    if ( env )
    {
      return env.get('displayName');
    }
    else if ( this && this.get('_environmentState') === 2 )
    {
      return '???';
    }
    else if ( this && this.get('_environmentState') === 0 )
    {
      var existing = this.get('store').getById('environment', this.get('environmentId'));
      if ( existing )
      {
        this.set('_environment', existing);
        return existing.get('displayName');
      }

      this.set('_environmentState', 1);
      this.get('store').find('environment', this.get('environmentId')).then((env) => {
        this.set('_environment', env);
      }).catch(() => {
        this.set('_publicIpState', 2);
      });

      return '...';
    }

    return null;
  }.property('_environment.displayName','_environmentState','environmentId'),

  onDisplayEnvironmentChanged: function() {
    this.incrementProperty('consumedServicesUpdated');
  }.observes('displayEnvironment'),

  consumedServicesWithNames: function() {
    return Service.consumedServicesFor(this.get('id'));
  }.property('id','_allMaps.@each.{name,serviceId,consumedServiceId}','state'),

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

  isGlobalScale: function() {
    return !!this.getLabel(C.LABEL.SCHED_GLOBAL);
  }.property(),

  canScale: function() {
    if ( ['service','loadbalancerservice'].indexOf(this.get('type').toLowerCase()) >= 0 )
    {
      return !this.get('isGlobalScale');
    }
    else
    {
      return false;
    }
  }.property('type'),

  hasContainers: function() {
    return [
      'service',
      'loadbalancerservice',
      'kubernetesservice',
      'kubernetesreplicationcontroller'
    ].indexOf(this.get('type').toLowerCase()) >= 0;
  }.property('type'),

  hasImage: function() {
    return this.get('type') === 'service';
  }.property('type'),
  hasLabels: Ember.computed.alias('hasImage'),

  isK8s: function() {
    return ['kubernetesservice','kubernetesreplicationcontroller'].indexOf(this.get('type').toLowerCase()) >= 0;
  }.property('type'),

  displayType: function() {
    var out;
    switch ( this.get('type').toLowerCase() )
    {
      case 'loadbalancerservice': out = 'Balancer'; break;
      case 'dnsservice':          out = 'Alias'; break;
      case 'externalservice':     out = 'External'; break;
      case 'kubernetesservice':   out = 'K8s Service'; break;
      case 'kubernetesreplicationcontroller': out = 'K8s Replication'; break;
      default:                    out = 'Service'; break;
    }

    return out;
  }.property('type'),

  hasSidekicks: function() {
    return this.get('secondaryLaunchConfigs.length') > 0;
  }.property('secondaryLaunchConfigs.length'),

  displayDetail: function() {
    return ('<b>Image: </b> ' + displayImage(this.get('launchConfig.imageUuid'))).htmlSafe();
  }.property('launchConfig.imageUuid'),

  activeIcon: function() {
    return activeIcon(this);
  }.property('type'),
});

export function activeIcon(service)
{
  var out = 'icon icon-layergroup';
  switch ( service.get('type').toLowerCase() )
  {
    case 'loadbalancerservice': out = 'icon icon-fork';    break;
    case 'dnsservice':          out = 'icon icon-compass'; break;
    case 'externalservice':     out = 'icon icon-cloud';   break;
    case 'kubernetesservice':
    case 'kubernetesreplicationcontroller':
      out = 'icon icon-kubernetes'; break;
  }

  return out;
}

export function byId(serviceId) {
  var allTypes = [
    _allRegularServices,
    _allLbServices,
    _allExternalServices,
    _allDnsServices,
    _allKubernetesServices,
    _allKubernetesReplicationControllers
  ];

  var i = 0;
  var service = null;
  while ( i < allTypes.length && !service )
  {
    service = allTypes[i].filterBy('id', serviceId)[0];
    i++;
  }

  return service;
}

Service.reopenClass({
  consumedServicesFor: function(serviceId) {
    return _allMaps.filterBy('serviceId', serviceId).map((map) => {
      return Ember.Object.create({
        name: map.get('name'),
        service: byId(map.get('consumedServiceId')),
        ports: map.get('ports')||[],
      });
    }).filter((obj) => {
      return obj.get('service.id');
    });
  },

  mangleIn: function(data, store) {
    if ( data.secondaryLaunchConfigs )
    {
      // Secondary lanch configs are service-like
      data.secondaryLaunchConfigs = data.secondaryLaunchConfigs.map((slc) => {
        slc.type = 'service';
        return store.createRecord(slc);
      });
    }

    return data;
  },

  stateMap: {
    'active':             {icon: activeIcon,                  color: 'text-success'},
    'canceled-rollback':  {icon: 'fa fa-life-ring',           color: 'text-info'},
    'canceled-upgrade':   {icon: 'fa fa-life-ring',           color: 'text-info'},
    'canceling-rollback': {icon: 'fa fa-life-ring',           color: 'text-info'},
    'canceling-upgrade':  {icon: 'fa fa-life-ring',           color: 'text-info'},
    'finishing-upgrade':  {icon: 'fa fa-arrow-circle-o-up',   color: 'text-info'},
    'rolling-back':       {icon: 'fa fa-history',             color: 'text-info'},
    'upgraded':           {icon: 'fa fa-arrow-circle-o-up',   color: 'text-info'},
    'upgrading':          {icon: 'fa fa-arrow-circle-o-up',   color: 'text-info'},
  }
});

export default Service;
