import Ember from 'ember';

export default Ember.Controller.extend({
  showAddtlInfo: false,
  selectedService: null,

  actions: {
    showAddtlInfo: function(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo', true);
    },

    dismiss: function() {
      this.set('showAddtlInfo', false);
      this.set('selectedService', null);
    }
  },

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


  stackContainers: Ember.computed('model.stack.services.@each.healthState', function() {
    var neu = [];
    this.get('model.stack.services').forEach((service) => {
      neu = neu.concat(service.get('instances'));
    });
    return neu;
  }),

  instanceCount: function() {
    var count = 0;
    (this.get('model.stack.services')||[]).forEach((service) => {
      count += service.get('instances.length')||0;
    });

    return count;
  }.property('model.stack.services.@each.healthState'),
});
