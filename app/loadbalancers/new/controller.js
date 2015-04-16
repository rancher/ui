import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';
import TargetChoices from 'ui/mixins/target-choices';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditLoadBalancerConfig, TargetChoices, {
  queryParams: ['tab'],
  tab: 'listeners',
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.balancer'),

  actions: {
    addHost: function() {
      this.get('hostsArray').pushObject({value: null});
    },
    removeHost: function(obj) {
      this.get('hostsArray').removeObject(obj);
    },

    addTargetContainer: function() {
      this.get('targetsArray').pushObject({isContainer: true, value: null});
    },
    addTargetIp: function() {
      this.get('targetsArray').pushObject({isIp: true, value: ''});
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },
  },

  initFields: function() {
    this._super();
    this.set('hostsArray', [{value: null}]);
    this.set('targetsArray', [{isContainer: true, value: null}]);
    this.set('listenersArray', [
      this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        sourcePort: '',
        sourceProtocol: 'tcp',
        targetPort: '',
        targetProtocol: 'tcp',
        algorithm: 'roundrobin',
      })
    ]);
    this.initUri();
  },

  useExisting: 'no',
  isUseExisting: Ember.computed.equal('useExisting','yes'),
  hasNoExisting: Ember.computed.equal('activeConfigs.length',0),
  existingConfigId: null,

  hostsArray: null,
  initHosts: function() {
  },
  hostDisabled: Ember.computed.equal('hostChoices.length',0),
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  hostIds: function() {
    return this.get('hostsArray').filterProperty('value').map((host) => {
      return Ember.get(host,'value');
    }).uniq();
  }.property('hostsArray.@each.value'),

  targetsArray: null,
  targetContainerIds: function() {
    return this.get('targetsArray').filterProperty('isContainer',true).filterProperty('value').map((choice) => {
      return Ember.get(choice,'value');
    }).uniq();
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  targetIpAddresses: function() {
    return this.get('targetsArray').filterProperty('isIp',true).filterProperty('value').map((choice) => {
      return Ember.get(choice,'value');
    }).uniq();
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  activeConfigs: function() {
    return this.get('allConfigs').filter((config) => {
      return config.get('state') === 'active';
    });
  }.property('allConfigs.@each.state'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('balancer.name') )
    {
      errors.push('Name is required');
    }

    if ( !this.get('hostIds.length') )
    {
      errors.push('Choose one or more hosts to run balancing agents on');
    }

    if ( !this.get('targetContainerIds.length') && !this.get('targetIpAddresses.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    if ( this.get('isUseExisting') )
    {
      if ( !this.get('existingConfigId') )
      {
        errors.push('Choose an existing balancer configuation to re-use');
      }
    }
    else
    {
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

  nameChanged: function() {
    this.set('config.name', this.get('balancer.name'));
  }.observes('balancer.name'),

  descriptionChanged: function() {
    this.set('config.description', this.get('balancer.description'));
  }.observes('balancer.description'),

  doSave: function() {
    var balancer = this.get('model.balancer');
    var config = this.get('model.config');
    var listeners = this.get('listenersArray');

    if ( this.get('isUseExisting') )
    {
      // Use an existing config
      balancer.set('loadBalancerConfigId', this.get('existingConfigId'));

      // Create balancer
      return balancer.save();
    }
    else
    {
      // Create a new config
      return config.save().then(() => {
        var promises = [];
        listeners.forEach((listener) => {
          promises.push(listener.save());
        });

        // Create listeners
        return Ember.RSVP.all(promises).then((listeners) => {
          var ids = listeners.map((listener) => {
            return listener.get('id');
          });

          // Apply listeners to the config
          return config.doAction('setlisteners',{loadBalancerListenerIds: ids}).then(() => {

            // Apply config to the balancer
            balancer.set('loadBalancerConfigId', config.get('id'));

            // Create balancer
            return balancer.save();
          });
        });
      });
    }
  },

  didSave: function() {
    var balancer = this.get('model.balancer');
    // Set balancer hosts
    return balancer.doAction('sethosts', {
      hostIds: this.get('hostIds'),
    }).then(() => {
      // Set balancer targets
      return balancer.doAction('settargets', {
        instanceIds: this.get('targetContainerIds'),
        ipAddresses: this.get('targetIpAddresses'),
      });
    });
  },

  doneSaving: function() {
    this.transitionToRoute('loadbalancers');
  },
});
