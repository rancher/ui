import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'address',
  sorts: {
    state:        ['state','displayAddress','id'],
    address:      ['displayAddress','id'],
    email:        ['credential.email','displayAddress','id'],
    username:     ['credential.publicValue','displayAddress','id'],
    created:      ['created','id']
  },
});
