import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent: Ember.computed.alias('model.allNamespaces'),

  sortBy: 'name',
  sorts: {
    name:         ['name','id'],
  },
});
