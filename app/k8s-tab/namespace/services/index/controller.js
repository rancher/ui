import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  filtered: function() {
    return (this.get('model.services')||[]).filter((row) => {
      return row.get('kind').toLowerCase() === 'kubernetesservice' &&
             (['removing','removed','purging','purged'].indexOf(row.get('state')) === -1);
    });
  }.property('model.services.@each.{kind,state}'),

  sortableContent: Ember.computed.alias('filtered'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    serviceType:  ['serviceType','name','id'],
    selector:     ['selector','name','id'],
  },
});
