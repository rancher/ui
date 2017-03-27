import Resource from 'ember-api-store/models/resource';
import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { denormalizeId, denormalizeIdArray } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';

var Service = Resource.extend(StateCounts, {
  type: 'service',
  intl: Ember.inject.service(),
  growl: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  instances: denormalizeIdArray('instanceIds'),
  instanceCount: Ember.computed.alias('instances.length'),
  stack: denormalizeId('stackId'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('instances', 'instanceStates', 'instanceCountSort');
  },

  lcType: Ember.computed('type', function() {
    return (this.get('type')||'').toLowerCase();
  }),

  actions: {
    edit() {
      this.get('modalService').toggleModal('modal-edit-dns', this);
    },

    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    restart() {
      return this.doAction('restart', {rollingRestartStrategy: {}});
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

    promptStop: function() {
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
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

    upgrade(upgradeImage='false') {
      var route = 'scaling-groups.new';
      if ( this.get('lcType') === 'loadbalancerservice' ) {
        route = 'balancers.new';
      }

      this.get('application').transitionToRoute(route, {queryParams: {
        serviceId: this.get('id'),
        upgrade: true,
        upgradeImage: upgradeImage,
        stackId: this.get('stackId'),
      }});
    },

    clone() {
      var route;
      switch ( this.get('lcType') )
      {
        case 'service':             route = 'scaling-groups.new'; break;
        case 'dnsservice':          route = 'dns.new';            break;
        case 'loadbalancerservice': route = 'balancers.new';      break;
        case 'externalservice':     route = 'dns.new';            break;
        default: return void this.send('error','Unknown service type: ' + this.get('type'));
      }

      this.get('application').transitionToRoute(route, {queryParams: {
        serviceId: this.get('id'),
        stackId: this.get('stackId'),
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
      this.save().catch((err) => {
        this.get('growl').fromError('Error updating scale',err);
      });
    }, 500);

    this.set('scaleTimer', timer);
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var canUpgrade = !!a.upgrade && this.get('canUpgrade');
    var isK8s = this.get('isK8s');
    var isSwarm = this.get('isSwarm');
    var canHaveContainers = this.get('canHaveContainers');
    var isBalancer = this.get('isBalancer');
    var isDriver = ['networkdriverservice','storagedriverservice'].includes(this.get('lcType'));

    var choices = [
      { label: 'action.finishUpgrade',  icon: 'icon icon-success',          action: 'finishUpgrade',  enabled: !!a.finishupgrade, bulkable: true },
      { label: 'action.rollback',       icon: 'icon icon-history',          action: 'rollback',       enabled: !!a.rollback },
      { label: (isBalancer ? 'action.upgradeOrEdit' : 'action.upgrade'),        icon: 'icon icon-arrow-circle-up',  action: 'upgrade',        enabled: canUpgrade },
      { label: 'action.cancelUpgrade',  icon: 'icon icon-life-ring',        action: 'cancelUpgrade',  enabled: !!a.cancelupgrade },
      { label: 'action.cancelRollback', icon: 'icon icon-life-ring',        action: 'cancelRollback', enabled: !!a.cancelrollback },
      { divider: true },
      { label: 'action.start',          icon: 'icon icon-play',             action: 'activate',       enabled: !!a.activate, bulkable: true},
      { label: 'action.restart',        icon: 'icon icon-refresh'    ,      action: 'restart',        enabled: !!a.restart && canHaveContainers, bulkable: true },
      { label: 'action.stop',           icon: 'icon icon-stop',             action: 'promptStop',     enabled: !!a.deactivate, altAction: 'deactivate', bulkable: true},
      { label: 'action.remove',         icon: 'icon icon-trash',            action: 'promptDelete',   enabled: !!a.remove, altAction: 'delete', bulkable: true},
      { label: 'action.purge',          icon: '',                           action: 'purge',          enabled: !!a.purge},
      { divider: true },
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',    action: 'goToApi',        enabled: true },
      { label: 'action.clone',          icon: 'icon icon-copy',             action: 'clone',          enabled: !isK8s && !isSwarm && !isDriver },
      { label: 'action.edit',           icon: 'icon icon-edit',             action: 'edit',           enabled: !!a.update && !isK8s && !isSwarm && !isBalancer},
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,restart,update,remove,purge,finishupgrade,cancelupgrade,rollback,cancelrollback}','lcType','isK8s','isSwarm','canHaveContainers','canUpgrade','isBalancer'),


  serviceLinks: null, // Used for clone
  reservedKeys: [
    'serviceLinks',
  ],

  displayImage: function() {
    return (this.get('launchConfig.imageUuid')||'').replace(/^docker:/,'');
  }.property('launchConfig.imageUuid'),

  displayStack: function() {
    var stack = this.get('stack');
    if ( stack ) {
      return stack.get('displayName');
    } else {
      return '...';
    }
  }.property('stack.displayName'),

  consumedServicesWithNames: function() {
    let store = this.get('store');
    let links = this.get('linkedServices')||{};
    let out = Object.keys(links).map((key) => {
      let name = key;
      let pos = name.indexOf('/');
      if ( pos >= 0 ) {
        name = name.substr(pos+1);
      }

      return Ember.Object.create({
        name: name,
        service: store.getById('service', links[key])
      });
    });

    return out.sortBy('name');
  }.property('linkedServices'),

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
      return health;
    }
  }.property('state', 'healthState'),

  isGlobalScale: function() {
    return (this.get('launchConfig.labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('launchConfig.labels'),

  canScale: function() {
    if ( this.get('isReal') )
    {
      return !this.get('isGlobalScale');
    }
    else
    {
      return false;
    }
  }.property('isReal','isGlobalScale'),

  canHaveContainers: function() {
    if ( this.get('isReal') || this.get('isSelector') ) {
      return true;
    }

    return [
      'kubernetesservice',
      'composeservice',
    ].includes(this.get('lcType'));
  }.property('isReal','isSelector','lcType'),

  isReal: function() {
    let type = this.get('lcType');
    if ( this.get('isSelector') ) {
      return false;
    }

    return [
      'service',
      'networkdriverservice',
      'storagedriverservice',
      'loadbalancerservice',
    ].includes(type);
  }.property('lcType','isSelector'),

  hasPorts: Ember.computed.alias('isReal'),
  hasImage: Ember.computed.alias('isReal'),
  hasLabels: Ember.computed.alias('isReal'),
  canUpgrade: Ember.computed.alias('isReal'),

  isSelector: function() {
    return !!this.get('selectorContainer');
  }.property('selectorContainer'),

  isBalancer: function() {
    return ['loadbalancerservice'].indexOf(this.get('lcType')) >= 0;
  }.property('lcType'),

  canBalanceTo: function() {
    if ( this.get('lcType') === 'externalservice' && this.get('hostname') !== null) {
      return false;
    }

    return true;
  }.property('lcType','hostname'),

  isK8s: function() {
    return ['kubernetesservice'].indexOf(this.get('lcType')) >= 0;
  }.property('lcType'),

  isSwarm: function() {
    return ['composeservice'].indexOf(this.get('lcType')) >= 0;
  }.property('lcType'),

  displayType: function() {
    let known = [
      'loadbalancerservice',
      'dnsservice',
      'externalservice',
      'kubernetesservice',
      'composeservice',
      'networkdriverservice',
      'selectorservice',
      'storagedriverservice',
      'service'
    ];

    let type = this.get('lcType');
    if ( this.get('isSelector') ) {
      type = 'selectorservice';
    }

    if ( !known.includes(type) ) {
      type = 'service';
    }

    return this.get('intl').t('servicePage.type.'+ type);
  }.property('lcType','isSelector','intl._locale'),

  hasSidekicks: function() {
    return this.get('secondaryLaunchConfigs.length') > 0;
  }.property('secondaryLaunchConfigs.length'),

  activeIcon: function() {
    return activeIcon(this);
  }.property('lcType'),

  endpointsMap: function() {
    var out = {};
    (this.get('publicEndpoints')||[]).forEach((endpoint) => {
      if ( !endpoint.port )
      {
        // Skip nulls
        return;
      }

      if ( out[endpoint.port] )
      {
        out[endpoint.port].push(endpoint.ipAddress);
      }
      else
      {
        out[endpoint.port] = [endpoint.ipAddress];
      }
    });

    return out;
  }.property('publicEndpoints.@each.{ipAddress,port}'),

  endpointsByPort: function() {
    var out = [];
    var map = this.get('endpointsMap');
    Object.keys(map).forEach((key) => {
      out.push({
        port: parseInt(key,10),
        ipAddresses: map[key]
      });
    });

    return out;
  }.property('endpointsMap'),

  endpointPorts: Ember.computed.mapBy('endpointsByPort','port'),

  displayPorts: function() {
    var pub = '';

    this.get('endpointsByPort').forEach((obj) => {
      var url = Util.constructUrl(false, obj.ipAddresses[0], obj.port);
      pub += '<span>' +
        '<a href="'+ url +'" target="_blank" rel="nofollow noopener">' +
          obj.port +
        '</a>,' +
      '</span> ';
    });

    // Remove last comma
    pub = pub.replace(/,([^,]*)$/,'$1');


    if ( pub )
    {
      return pub.htmlSafe();
    }
    else
    {
      return '';
    }
  }.property('endpointsByPort.@each.{port,ipAddresses}', 'intl._locale'),

  memoryReservationBlurb: Ember.computed('launchConfig.memoryReservation', function() {
    if ( this.get('launchConfig.memoryReservation') ) {
      return Util.formatSi(this.get('launchConfig.memoryReservation'), 1024, 'iB', 'B');
    }
  }),
});

export function activeIcon(service)
{
  var out = 'icon icon-services';
  switch ( service.get('lcType') )
  {
    case 'loadbalancerservice': out = 'icon icon-fork';    break;
    case 'dnsservice':          out = 'icon icon-compass'; break;
    case 'externalservice':     out = 'icon icon-cloud';   break;
    case 'kubernetesservice':   out = 'icon icon-kubernetes'; break;
    case 'composeservice':      out = 'icon icon-docker'; break;
  }

  return out;
}

Service.reopenClass({
  stateMap: {
    'active':             {icon: activeIcon,                  color: 'text-success'},
    'canceled-rollback':  {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceled-upgrade':   {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceling-rollback': {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceling-upgrade':  {icon: 'icon icon-life-ring',       color: 'text-info'},
    'finishing-upgrade':  {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'rolling-back':       {icon: 'icon icon-history',         color: 'text-info'},
    'upgraded':           {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'upgrading':          {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
  }
});

export default Service;
