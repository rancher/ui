import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditLoadBalancerConfig, {
  queryParams: ['tab'],
  tab: 'listeners',
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.config'),

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
    return this.get('targetsArray').filterProperty('isContainer',true).map((choice) => {
      return Ember.get(choice,'value');
    });
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  targetIpAddresses: function() {
    return this.get('targetsArray').filterProperty('isIp',true).map((choice) => {
      return Ember.get(choice,'value');
    });
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  validate: function() {
    var config = this.get('model.config');
    var balancer = this.get('model.balancer');

    config.set('name', balancer.get('name'));
    config.set('description', balancer.get('description'));

    return true;
  },

  didSave: function() {
    var balancer = this.get('model.balancer');
    var config = this.get('model.config');
    var listeners = this.get('listenersArray');

    balancer.set('loadBalancerConfigId', config.get('id'));
    return balancer.save().then(() => {
      var promises = [];
      listeners.forEach((listener) => {
        promises.push(listener.save());
      });

      return Ember.RSVP.all(promises).then((listeners) => {
        var ids = listeners.map((listener) => {
          return listener.get('id');
        });

        return config.doAction('setlisteners',{loadBalancerListenerIds: ids}).then(() => {
          return balancer.doAction('sethosts', {
            hostIds: this.get('hostIds'),
          }).then(() => {
            return balancer.doAction('settargets', {
              instanceIds: this.get('targetContainerIds'),
              ipAddresses: this.get('targetIpAddresses'),
            });
          });
        });
      });
    });
  },

  doneSaving: function() {
    this.transitionToRoute('loadbalancers');
  },
});
