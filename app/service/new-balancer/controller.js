import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';
import EditBalancerTarget from 'ui/mixins/edit-balancer-target';
import EditScheduling from 'ui/mixins/edit-scheduling';

export default Ember.ObjectController.extend(Cattle.LegacyNewOrEditMixin, EditLoadBalancerConfig, EditBalancerTarget, EditScheduling, {
  queryParams: ['environmentId','serviceId','tab'],
  environmentId: null,
  serviceId: null,
  tab: 'stickiness',
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.balancer'),
  labelResource: Ember.computed.alias('model.launchConfig'),
  isGlobal: false,

  initFields: function() {
    this._super();
    this.initScheduling();
    this.initListeners();
    this.initTargets(this.get('existingBalancer'));
    this.initStickiness();
  },

  initHosts: function() {
  },
  hostDisabled: Ember.computed.equal('hostChoices.length',0),
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  activeConfigs: function() {
    return this.get('allConfigs').filter((config) => {
      return config.get('state') === 'active';
    });
  }.property('allConfigs.@each.state'),

  validate: function() {
    var errors = [];
    if (!this.get('listenersArray.length') )
    {
      errors.push('One or more listening ports are required');
    }

    if ( !this.get('targetResources.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    var bad = this.get('targetsArray').filter(function(obj) {
      return !Ember.get(obj,'value');
    });
    if ( bad.get('length') )
    {
      errors.push('Target Service is required on each Target');
    }

    bad = this.get('targetsArray').filter(function(obj) {
      return Ember.get(obj, 'srcPort') && !Ember.get(obj, 'hostname') && !Ember.get(obj, 'dstPort') && !Ember.get(obj,'path');
    });
    if ( bad.get('length') )
    {
      errors.push('A Target can\'t have just a Source Port.  Remove it, or add a Request Host, Request Path, or Target Port.');
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    // Generic validation
    this._super();
    errors = this.get('errors')||[];


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
    var ports = [];
    var expose = [];
    this.get('listenersArray').forEach(function(listener) {
      var src = listener.get('sourcePort');
      var proto = listener.get('sourceProtocol');
      var tgt = listener.get('targetPort');

      if ( src && proto )
      {
        var str = src + (tgt ? ':' +tgt : '') + (proto === 'http' ? '': '/' + proto );
        if ( listener.get('isPublic') )
        {
          ports.pushObject(str);
        }
        else
        {
          expose.pushObject(str);
        }
      }
    });

    this.set('model.launchConfig.ports', ports.sort().uniq());
    this.set('model.launchConfig.expose', expose.sort().uniq());
  }.observes('listenersArray.@each.{sourcePort,sourceProtocol,targetPort,targetProtocol,isPublic}'),

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
    this.transitionToRoute('environment', this.get('primaryResource.environmentId'));
  },
});
