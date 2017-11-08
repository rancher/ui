import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import {
  headersWithHost as containerHeaders
} from 'shared/components/container-table/component';
import {
  searchFields as containerSearchFields
} from 'shared/components/container-dots/component';

export default Controller.extend({
  prefs:             service(),
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
      sort: ['stack.isDefault:desc','stack.displayName','sortState','displayName'],
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
      sort: ['sortState','displayName'],
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
      name: 'image',
      sort: ['image','displayName'],
      searchField: 'image',
      translationKey: 'generic.image',
    },
    {
      name: 'scale',
      sort: ['scale:desc','isGlobalScale:desc','displayName'],
      searchField: null,
      translationKey: 'stacksPage.table.scale',
      classNames: 'text-center',
      width: 100
    },
  ],
  storageSortBy: 'state',
  storageHeaders:  [
    {
      name: 'expand',
      sort: false,
      searchField: null,
      width: 30
    },
    {
      name: 'state',
      sort: ['sortState','displayName'],
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
      name: 'mounts',
      sort: ['mounts.length','displayName','id'],
      translationKey: 'volumesPage.mounts.label',
      searchField: null,
      width: 100,
    },
    {
      name: 'scope',
      sort: ['scope'],
      translationKey: 'volumesPage.scope.label',
      width: 120
    },
    {
      name: 'driver',
      sort: ['driver','displayName','id'],
      searchField: 'displayType',
      translationKey: 'volumesPage.driver.label',
      width: 150
    },
  ],

  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,
  rows: computed('instances.[]', 'services.[]', function() {
    let out = [];
    let containers = this.get('instances');
    let services = this.get('services');
    return out.concat(containers, services);
  }),

  containerStats: computed('instances.[]', 'services.[]', function() {
    let containerLength = this.get('instances.length') || 0;
    let scalingGroupsLength = this.get('services.length') || 0;
    return containerLength += scalingGroupsLength;
  }),

  services: computed('model.services.[]', function() {
    return this.get('model.services').filter((obj) => {
      return obj.get('isReal') && !obj.get('isBalancer');
    });
  }),

  loadBalancers: computed('model.services.@each.isBalancer', function() {
    return this.get('model.services').filterBy('isBalancer',true);
  }),

  dnsServices: computed('model.services.[]', function() {
    return this.get('model.services').filterBy('isReal',false);
  }),

  instances: computed('model.instances.[]','prefs.showSystemResources', function() {
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
