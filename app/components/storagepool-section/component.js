import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import FilterState from 'ui/mixins/filter-state';

export default Ember.Component.extend(Sortable, FilterState, {
  model: null,
  single: false,

  init: function() {
    this._super();
    this.set('filterStates', ['purged']);
  },

  filterableContent: Ember.computed.alias('model.volumes'),
  sortableContent: Ember.computed.alias('filtered'),

  sorts: {
    state:   ['state','displayName','id'],
    name:   ['displayName','id'],
    activeMounts:   ['activeMounts.length','displayName','id'],
  },
  sortBy: 'name',

  hostsByName: function() {
    return (this.get('model.hosts')||[]).sortBy('displayName');
  }.property('model.hosts.@each.displayName'),

  classNames: ['stack-section','storage'],
});
