import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent: Ember.computed.alias('model'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    containers:   ['instances.length','name','id'],
  },
});
