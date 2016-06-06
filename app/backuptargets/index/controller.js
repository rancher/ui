import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent   : Ember.computed.alias('model.all'),
  sortBy: 'name',
  sorts: {
    state   : ['stateSort','name','id'],
    name    : ['name','id'],
    created : ['created','id'],
  },

});
