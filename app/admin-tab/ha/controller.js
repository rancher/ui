import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  settings: Ember.inject.service(),

  sortBy: 'address',
  sorts: {
    state:     ['stateSort','address','uuid'],
    address:   ['address','uuid'],
    port:      ['port','address','uuid'],
    heartbeat: ['heartbeat','address','uuid'],
    clustered: ['clustered','address','uuid'],
  },
});
