import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditLoadBalancerConfig, {
  queryParams: ['tab'],
  tab: 'listeners',
  error: null,
  editing: false,

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
    this.set('hostsArray', []);
    this.set('targetsArray', []);
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
  },

  useExisting: 'no',
  isUseExisting: Ember.computed.equal('useExisting','yes'),
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
    return this.get('hostsArray').map((host) => {
      return Ember.get(host,'value');
    });
  }.property('hostsArray.@each.id'),

  targetsArray: null,
  targetChoices: function() {
    var list = [];

    this.get('hostChoices').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't balance other types of instances, or system containers
        return instance.get('type') === 'container' && instance.get('systemContainer') === null;
      });

      list.pushObjects(containers.map(function(container) {
        return {
          group: host.get('name') || ('(Host '+host.get('id')+')'),
          id: container.get('id'),
          name: container.get('name') || ('(' + container.get('id') + ')')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('hostChoices.@each.instancesUpdated').volatile(),

  targetContainerIds: function() {
    return this.get('targetsArray').filterProperty('isContainer',true).filterProperty('value').map((choice) => {
      return Ember.get(choice,'value');
    });
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  targetIpAddresses: function() {
    return this.get('targetsArray').filterProperty('isIp',true).filterProperty('value').map((choice) => {
      return Ember.get(choice,'value');
    });
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  activeConfigs: function() {
    return this.get('allConfigs').filter((config) => {
      return config.get('state') === 'active';
    });
  }.property('allConfigs.@each.state'),

  willSave: function() {
    if ( !this._super() )
    {
      // Validaton failed
      return false;
    }

    if ( !this.get('isUseExisting') )
    {
      // If creating a config, name it after the balancer
      var config = this.get('model.config');
      var balancer = this.get('model.balancer');

      config.set('name', balancer.get('name') + "'s config");
      config.set('description', balancer.get('description'));
    }

    return true;
  },

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
