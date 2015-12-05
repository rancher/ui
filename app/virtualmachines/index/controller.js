import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'name',
  sorts: {
    state:    ['stateSort','name','id'],
    name:     ['name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','id'],
  },
});
