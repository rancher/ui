import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  filtered: function() {
    var ns = this.get('model.ns');
    return (this.get('model.services')||[]).filter((row) => {
      return (row.get('environmentId') === ns.get('id')) && row.get('kind').toLowerCase() === 'kubernetesreplicationcontroller' &&
             (['removing','removed','purging','purged'].indexOf(row.get('state')) === -1);
    });
  }.property('model.services.@each.{kind,state}'),

  sortableContent: Ember.computed.alias('filtered'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
  },
});
