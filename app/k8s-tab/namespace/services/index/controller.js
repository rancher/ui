import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  filtered: function() {
    var nsId = this.get('model.namespace.id');
    return (this.get('model.allServices')||[]).filter((row) => {
      return row.get('metadata.namespace') === nsId;
    });
  }.property('model.namespace.id','model.allServices.@each.id'), // ID contains namespace and @each.metadata.namespace isn't supported by ember

  sortableContent: Ember.computed.alias('filtered'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    serviceType:  ['serviceType','name','id'],
    selector:     ['selector','name','id'],
  },
});
