import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  environments: Ember.inject.controller(),
  projects: Ember.inject.service(),
  sortableContent: Ember.computed.alias('model.current'),
  prefs: Ember.inject.service(),

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
      this.set('selectedService', null);
    },
    sortResults: function(name) {
      this.get('prefs').set(C.PREFS.SORT_STACKS_BY, name);
      this.send('setSort', name);
    }
  },

  showTabs: function() {
    return this.get('which') !== 'kubernetes' && (this.get('which') !== 'user' || this.get('model.hasKubernetes') || this.get('model.hasSystem'));
  }.property('which','model.{hasKubernetes,hasSystem}'),

  setup: function() {
    var sort = this.get(`prefs.${C.PREFS.SORT_STACKS_BY}`);
    if (sort && sort !== this.get('sortBy')) {
      this.set('sortBy', sort);
    }
  }.on('init'),

  sortBy: 'state',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

});
