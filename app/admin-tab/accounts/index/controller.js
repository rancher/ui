import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import FilterState from 'ui/mixins/filter-state';

const hideKinds = ['system','superadmin','token','project','service','agent'];

export default Ember.Controller.extend(FilterState, Sortable, {
  access: Ember.inject.service(),

  sortableContent: Ember.computed.alias('filteredByKind'),
  sortBy: 'name',
  sorts: {
    state:    ['combinedState','name','id'],
    name:     ['name','id'],
    kind:     ['kind','name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','id'],
    command:  ['command','name','id'],
  },

  filteredByKind: function() {
    return this.get('filtered').filter((row) => {
      var kind = (row.get('kind')||'').toLowerCase();
      return hideKinds.indexOf(kind) === -1;
    });
  }.property('model.@each.kind'),

  canAdd: function() {
    return this.get('access.provider').toLowerCase() === 'localauthconfig';
  }.property('access.provider'),
});
