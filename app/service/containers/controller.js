import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent: Ember.computed.alias('model.instances'),
  sortBy: 'name',
  sorts: {
    state:    ['combinedState','name','id'],
    name:     ['name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','id'],
    command:  ['command','name','id'],
  },
});
