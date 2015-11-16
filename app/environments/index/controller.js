import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  environments: Ember.inject.controller(),
  projects: Ember.inject.service(),
  sortableContent: Ember.computed.alias('model.current'),

  which: 'user',
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

  supportsKubernetes: function() {
    return this.get('projects.current.kubernetes') === true;
  }.property('projects.current.kubernetes'),

  sortBy: 'state',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

});
