import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  environments: Ember.inject.controller(),
  sortableContent: Ember.computed.alias('model.current'),

  which: 'all',
  queryParams: ['which'],
  showAddtlInfo: false,
  selectedService: null,

  actions: {
    showAddtlInfo: function(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo', true);
    },
    dismiss: function() {
      this.set('showAddtlInfo', false);
    }
  },

  showTabs: function() {
    return this.get('which') !== 'all' || this.get('hasKubernetes') || this.get('hasSystem');
  }.property('which','model.{hasKubernetes,hasSystem}'),

  sortBy: 'state',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

});
