import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditLoadBalancerConfig, {
  queryParams: ['environmentId','tab'],
  environmentId: null,
  tab: 'listeners',
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.balancer'),

  actions: {
    addTargetService: function() {
      this.get('targetsArray').pushObject({isService: true, value: null});
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },
  },

  initFields: function() {
    this._super();
    this.set('targetsArray', [{isService: true, value: null}]);
    this.set('listenersArray', [
      this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        sourcePort: '',
        sourceProtocol: 'http',
        targetPort: '',
        targetProtocol: 'http',
        algorithm: 'roundrobin',
      })
    ]);
    this.initUri();
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
  targetServiceIds: function() {
    return this.get('targetsArray').filterProperty('isService',true).filterProperty('value').map((choice) => {
      return Ember.get(choice,'value');
    }).uniq();
  }.property('targetsArray.@each.{isService,value}'),

  targetChoices: function() {
    var list = [];
    var env = this.get('environment');
    var envName = env.get('name') || ('(Environment '+env.get('id')+')');

    env.get('services').map((service) => {
      list.pushObject({
        group: 'Environment: ' + envName,
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

    if ( !this.get('targetServiceIds.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    if (!this.get('listenersArray.length') )
    {
      errors.push('One or more listening ports are required');
    }

    errors.pushObjects(this.get('config').validationErrors());
    this.get('listenersArray').forEach((listener) => {
      errors.pushObjects(listener.validationErrors());
    });

    if ( (this.get('listenersArray')||[]).filterProperty('sourcePort',8080).get('length') > 0 )
    {
      errors.push('Port 8080 cannot currently be used as a source port');
    }

    errors.pushObjects(this.get('balancer').validationErrors());

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

  has8080: function() {
    // The port might be an int or a string due to validation..
    return ( (this.get('listenersArray')||[]).filterProperty('sourcePort','8080').get('length') > 0 ) ||
           ( (this.get('listenersArray')||[]).filterProperty('sourcePort',8080).get('length') > 0 );
  }.property('listenersArray.@each.sourcePort'),

  listenersChanged: function() {
    var list = [];
    this.get('listenersArray').forEach(function(listener) {
      var src = listener.get('sourcePort');
      var proto = listener.get('sourceProtocol');
      var tgt = listener.get('targetPort');

      if ( src && proto )
      {
        list.pushObject(src + ':' + (tgt ? tgt : src) + (proto === 'http' ? '': '/' + proto ) );
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
        serviceIds: this.get('targetServiceIds'),
      });
    });
  },

  doneSaving: function() {
    this.transitionToRoute('environment', this.get('environment.id'));
  },
});
