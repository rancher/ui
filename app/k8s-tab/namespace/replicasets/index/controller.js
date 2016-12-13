import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import FilterNamespace from 'ui/mixins/filter-k8s-namespace';

export default Ember.Controller.extend(Sortable, FilterNamespace, {
  filterableContent: Ember.computed.alias('model.allReplicaSets'),
  sortableContent: Ember.computed.alias('filtered'),

  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    serviceType:  ['serviceType','name','id'],
    selector:     ['selector','name','id'],
  },
});
