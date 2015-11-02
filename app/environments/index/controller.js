import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  environments: Ember.inject.controller(),
  sortableContent: Ember.computed.alias('model.current'),

  which: 'all',
  queryParams: ['which'],

  showTabs: function() {
    return this.get('which') !== 'all' || this.get('hasKubernetes') || this.get('hasSystem');
  }.property('which','model.{hasKubernetes,hasSystem}'),

  sortBy: 'state',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

});
