import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  settings: Ember.inject.service(),

  sortableContent: Ember.computed.alias('model.receivers'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    kind:         ['displayKind','id'],
  },

});
