import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'address',
  sorts: {
    state:        ['state','displayAddress','id'],
    address:      ['displayAddress','id'],
    email:        ['credential.email','displayAddress','id'],
    username:     ['credential.publicValue','displayAddress','id'],
    created:      ['created','id']
  },

  needs: ['application'],

  actions: {
    new: function() {
      // ...
      this.get('controllers.application').setProperties({
        editProject: true,
        originalModel: model
      });
    },
  },
});
