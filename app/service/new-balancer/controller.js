import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';

export default Ember.ObjectController.extend(Cattle.LegacyNewOrEditMixin, EditLoadBalancerConfig, {
  queryParams: ['environmentId','serviceId','tab'],
  environmentId: null,
  serviceId: null,
  tab: 'stickiness',
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.balancer'),

  actions: {
    addTargetService: function() {
      this.get('targetsArray').pushObject({isService: true, value: null, protocol: 'http'});
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },
  },

  initFields: function() {
    this._super();
    this.initListeners();
    this.initTargets();
    this.initStickiness();
  },

  useExisting: 'no',
  isUseExisting: Ember.computed.equal('useExisting','yes'),
  hasNoExisting: Ember.computed.equal('activeConfigs.length',0),
  existingConfigId: null,

  initHosts: function() {
  },
  hostDisabled: Ember.computed.equal('hostChoices.length',0),
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  targetsArray: null,
  initTargets: function() {
    var existing = null;
    if ( this.get('balancer.id') )
    {
      existing = this.get('balancer.consumedServices');
    }

    var out = [];
    if ( existing )
    {
      existing.forEach((service) => {
        out.push({ isService: true, value: Ember.get(service,'id') });
      });
    }
    else
    {
      out.push({isService: true, value: null});
    }

    this.set('targetsArray', out);
  },

  targetResources: function() {
    var out = [];
    this.get('targetsArray').filterProperty('isService',true).filterProperty('value').filterProperty('port').map((choice) => {
      var serviceId = Ember.get(choice,'value');
      var port = Ember.get(choice,'port');
      var hostname = Ember.get(choice,'hostname');
      var path = Ember.get(choice,'path');

      var entry = out.filterProperty('serviceId', serviceId)[0];
      if ( !entry )
      {
        entry = Ember.Object.create({
          serviceId: serviceId,
          ports: [],
        });
        out.pushObject(entry);
      }

      var str = port + ":" + (hostname ? hostname : '') + (path ? path : '');
      entry.get('ports').pushObject(str);
    });

    return out;
  }.property('targetsArray.@each.{isService,value,hostname,path,port}'),

  targetChoices: function() {
    var list = [];
    var env = this.get('environment');
    var envName = env.get('name') || ('(Stack '+env.get('id')+')');

    env.get('services').map((service) => {
      list.pushObject({
        group: 'Stack: ' + envName,
        id: service.get('id'),
        name: service.get('name') || ('(' + service.get('id') + ')')
      });
    });

    return list.sortBy('group','name','id');
  }.property('environment.services.@each.{name,id},environment.{name,id}').volatile(),

  activeConfigs: function() {
    return this.get('allConfigs').filter((config) => {
      return config.get('state') === 'active';
    });
  }.property('allConfigs.@each.state'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('targetResources.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    var bad = this.get('targetsArray').filter(function(obj) {
      return !Ember.get(obj,'value') || !Ember.get(obj, 'port');
    });
    if ( bad.get('length') )
    {
      errors.push('Service and port are requried on each target');
    }

    if (!this.get('listenersArray.length') )
    {
      errors.push('One or more listening ports are required');
    }

    errors.pushObjects(this.get('config').validationErrors());
    this.get('listenersArray').forEach((listener) => {
      errors.pushObjects(listener.validationErrors());
    });

    errors.pushObjects(this.get('balancer').validationErrors());

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

  listenersChanged: function() {
    var list = [];
    this.get('listenersArray').forEach(function(listener) {
      var src = listener.get('sourcePort');
      var proto = listener.get('sourceProtocol');
      var tgt = listener.get('targetPort');

      if ( src && proto )
      {
        list.pushObject(src + (tgt ? ':' +tgt : '') + (proto === 'http' ? '': '/' + proto ) );
      }
    });

    this.set('model.launchConfig.ports', list.sort().uniq());
  }.observes('listenersArray.@each.{sourcePort,sourceProtocol,targetPort,targetProtocol}'),

  nameChanged: function() {
    this.set('config.name', this.get('balancer.name') + ' config');
  }.observes('balancer.name'),

  descriptionChanged: function() {
    this.set('config.description', this.get('balancer.description'));
  }.observes('balancer.description'),

  didSave: function() {
    var balancer = this.get('model.balancer');
    // Set balancer targets
    return balancer.waitForNotTransitioning().then(() => {
      return balancer.doAction('setservicelinks', {
        serviceLinks: this.get('targetResources'),
      });
    });
  },

  doneSaving: function() {
    this.transitionToRoute('environment', this.get('environment.id'));
  },
});
