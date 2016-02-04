import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    serviceType:  ['serviceType','name','id'],
    selector:     ['selector','name','id'],
  },
});
