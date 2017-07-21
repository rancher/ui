import Ember from 'ember';
import { headersWithHost as containerHeaders } from 'ui/components/container-table/component';

export default Ember.Controller.extend({
  prefs:             Ember.inject.service(),
  containerHeaders:  containerHeaders,
  showAddtlInfo:     false,
  selectedService:   null,
  sortBy:            'name',
  expandedInstances: null,

  init() {
    this._super(...arguments);
    this.set('expandedInstances',[]);
  },


  actions: {
    showAddtlInfo: function(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo', true);
    },

    dismiss: function() {
      this.set('showAddtlInfo', false);
      this.set('selectedService', null);
    },
    toggleExpand(instId) {
      let list = this.get('expandedInstances');
      if ( list.includes(instId) ) {
        list.removeObject(instId);
      } else {
        list.addObject(instId);
      }
    },
  },

  dnsHeaders: [
    {
      name: 'expand',
      sort: false,
      searchField: null,
      width: 30
    },
    {
      name: 'state',
      sort: ['stack.isDefault:desc','stack.displayName','stateSort','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120
    },
    {
      name: 'name',
      sort: ['stack.isDefault:desc','stack.displayName','displayName','id'],
      searchField: 'displayName',
      translationKey: 'generic.name',
    },
    {
      name: 'displayType',
      sort: ['displayType','displayName','id'],
      searchField: 'displayType',
      translationKey: 'generic.type',
    },
    {
      name: 'target',
      sort: false,
      searchField: 'displayTargets',
      translationKey: 'dnsPage.table.target',
    },
  ],

  sgHeaders: [
    {
      name: 'expand',
      sort: false,
      searchField: null,
      width: 30
    },
    {
      name: 'state',
      sort: ['stateSort','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120
    },
    {
      name: 'name',
      sort: ['displayName','id'],
      searchField: 'displayName',
      translationKey: 'generic.name',
    },
    {
      name: 'endpoints',
      sort: null,
      searchField: 'endpointPorts',
      translationKey: 'stacksPage.table.endpoints',
    },
    {
      name: 'image',
      sort: ['displayImage','displayName'],
      searchField: 'displayImage',
      translationKey: 'generic.image',
    },
    {
      name: 'instanceState',
      sort: ['instanceCountSort:desc','displayName'],
      searchField: null,
      width: 140,
      icon: 'icon icon-lg icon-container',
      dtTranslationKey: 'stacksPage.table.instanceState',
      translationKey: 'stacksPage.table.instanceStateWithIcon',
    },
  ],

  getType(ownType, real=true) {
    return this.get('model.services').filter((service) => {
      if (real ? (service.get('isReal') && service.get('kind') === ownType) : (service.get('kind') === ownType)) {
        return true;
      }
      return false;
    });
  },

  scalingGroups: Ember.computed('model.services.[]', function() {
    return this.getType('scalingGroup');
  }),

  loadBalancers: Ember.computed('model.services.[]', function() {
    return this.getType('loadBalancerService');
  }),

  dnsServices: Ember.computed('model.services.[]', function() {
    return this.getType('dnsService', false).concat(this.getType('externalService', false));
  }),

  instances: Ember.computed('model.instances.[]','prefs.showSystemResources', function() {
    let out = this.get('model.instances').filterBy('stackId', this.get('model.stack.id'));
    out = out.filterBy('serviceId', null);
    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('isSystem', false);
    }

    return out;
  }),

  instanceCount: function() {
    var count = 0;
    (this.get('model.stack.services')||[]).forEach((service) => {
      count += service.get('instances.length')||0;
    });

    return count;
  }.property('model.stack.services.@each.healthState'),
});
