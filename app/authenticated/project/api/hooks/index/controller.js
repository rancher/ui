import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  settings: Ember.inject.service(),

  sortableContent: function() {
    let receivers = this.get('model.receivers');
    return receivers.filter(ele => ele.driver !== 'forwardPost');
  }.property('model.receivers.@each.driver'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    kind:         ['displayKind','id'],
  },

});
