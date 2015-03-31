import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  error: null,
  credentials: null,
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
    this.initHosts();
    this.initTargets();
  },

  hostsArray: null,
  initHosts: function() {
    this.set('hostsArray', []);
  },
  hostDisabled: Ember.computed.equal('hostChoices.length',0),
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

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
          name: container.get('name') || ('(Container ' + container.get('id') + ')')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('hostChoices.@each.instancesUpdated').volatile(),

  initTargets: function() {
    this.set('targetsArray', []);
  },

  sourceProtocolOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.sourceProtocol.options');
  }.property(),

  targetProtocolOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.targetProtocol.options');
  }.property(),

  algorithmOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.algorithm.options');
  }.property(),

  doneSaving: function() {
    this.transitionToRoute('loadbalancers');
  },
});
